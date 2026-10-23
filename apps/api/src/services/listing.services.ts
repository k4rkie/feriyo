import { and, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  chatsTable,
  listingsTable,
  offersTable,
  usersTable,
} from "../db/schema.js";
import type {
  createListingInput,
  editListingInput,
  makeOfferDetail,
} from "../validators/listings.validator.js";
import {
  DBConstraintError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from "../errors/index.js";
import { io } from "../chat/chat.js";
import { expireOffers } from "./offer.services.js";
import { uploadImage } from "../utils/cloudinary.js";

type queryParams = {
  category:
    | "electronics"
    | "education"
    | "fashion"
    | "furniture"
    | "vehicle"
    | "others"
    | "";
  search: string;
  page: number;
};

const getListings = async (queryParams: queryParams) => {
  const { category, search, page } = queryParams;
  const pageSize = 32;

  await expireOffers();

  const filters = [inArray(listingsTable.status, ["available", "pending"])];

  if (category) {
    filters.push(eq(listingsTable.category, category));
  }
  if (search) {
    filters.push(ilike(listingsTable.title, `%${search}%`));
  }

  const rows = await db
    .select({
      listing: listingsTable,
      authorUsername: usersTable.username,
      authorEmail: usersTable.email,
      authorAvatarUrl: usersTable.avatarUrl,
    })
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.authorId, usersTable.userId))
    .where(and(...filters))
    .orderBy(desc(listingsTable.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(listingsTable)
    .where(and(...filters));

  const listingsWithUserInfo = rows.map((row) => ({
    ...row.listing,
    authorInfo: {
      userId: row.listing.authorId,
      username: row.authorUsername,
      email: row.authorEmail,
      avatarUrl: row.authorAvatarUrl,
    },
  }));

  return {
    listingsWithUserInfo,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
};

const createListing = async (
  createListingData: createListingInput,
  userId: string,
) => {
  const {
    title,
    description,
    price,
    locationName,
    category,
    condition,
    listingImages,
  } = createListingData;

  const imageUrls = await Promise.all(
    listingImages.map((image) =>
      uploadImage(image.buffer, "feriyo/listings/images"),
    ),
  );

  const [newListing] = await db
    .insert(listingsTable)
    .values({
      title,
      description,
      price,
      locationName,
      category,
      condition,
      authorId: userId,
      imageUrls,
    })
    .returning({
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.locationName,
      status: listingsTable.status,
      category: listingsTable.category,
      condition: listingsTable.condition,
      imageUrls: listingsTable.imageUrls,
    });

  return newListing;
};

const getListingById = async (listingId: string) => {
  const [row] = await db
    .select({
      listing: listingsTable,
      authorUsername: usersTable.username,
      authorEmail: usersTable.email,
      authorAvatarUrl: usersTable.avatarUrl,
    })
    .from(listingsTable)
    .innerJoin(usersTable, eq(listingsTable.authorId, usersTable.userId))
    .where(eq(listingsTable.listingId, listingId))
    .limit(1);

  if (!row) {
    throw new NotFoundError(
      `Cannot find a listing with the provided ID: ${listingId}`,
    );
  }

  return {
    ...row.listing,
    authorInfo: {
      userId: row.listing.authorId,
      username: row.authorUsername,
      email: row.authorEmail,
      avatarUrl: row.authorAvatarUrl,
    },
  };
};

const editListing = async (
  editListingData: editListingInput,
  listingId: string,
  userId: string,
) => {
  const {
    title,
    description,
    price,
    locationName,
    category,
    condition,
    isSold,
    newListingImages,
    removedListingImages,
  } = editListingData;

  const [existingListing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId))
    .limit(1);

  if (!existingListing) {
    throw new NotFoundError(
      `Cannot find a listing with the provided ID: ${listingId}`,
    );
  }

  if (existingListing.authorId !== userId) {
    throw new UnauthorizedError(`You are not allowed to edit this listing`);
  }

  let { imageUrls } = existingListing;

  for (let image of removedListingImages) {
    imageUrls = imageUrls.filter((url) => url !== image);
  }

  const newImageUrls = await Promise.all(
    newListingImages.map((image) =>
      uploadImage(image.buffer, "feriyo/listings/images"),
    ),
  );

  imageUrls = [...imageUrls, ...newImageUrls];

  const status = isSold ? "sold" : "available";

  const [editedListing] = await db
    .update(listingsTable)
    .set({
      title,
      description,
      price,
      locationName,
      category,
      condition,
      status: status,
      authorId: userId,
      imageUrls,
      updatedAt: sql`now()`,
    })
    .where(eq(listingsTable.listingId, listingId))
    .returning({
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      locationName: listingsTable.locationName,
      status: listingsTable.status,
      category: listingsTable.category,
      condition: listingsTable.condition,
      imageUrls: listingsTable.imageUrls,
    });

  return editedListing;
};

const deleteListing = async (listingId: string, userId: string) => {
  const [existingListing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId))
    .limit(1);

  if (!existingListing) {
    throw new NotFoundError(
      `Cannot find a listing with the provided ID: ${listingId}`,
    );
  }

  if (existingListing.authorId !== userId) {
    throw new UnauthorizedError(`You are not allowed to delete this listing`);
  }

  await db.delete(listingsTable).where(eq(listingsTable.listingId, listingId));

  return true;
};

const myListings = async (userId: string) => {
  return db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.authorId, userId))
    .orderBy(desc(listingsTable.createdAt));
};

const makeOffer = async (
  offerDetails: makeOfferDetail,
  listingId: string,
  userId: string,
) => {
  const { chatId, price } = offerDetails;

  await expireOffers();

  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.chatId, chatId))
    .limit(1);

  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  if (chat.buyerId !== userId && chat.sellerId !== userId) {
    throw new UnauthorizedError("You are not a participant in this chat");
  }

  if (chat.listingId !== listingId) {
    throw new BadRequestError("Listing does not belong to this chat");
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId))
    .limit(1);

  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  if (listing.status === "sold") {
    throw new BadRequestError("This item has already been sold");
  }

  try {
    const [newoffer] = await db
      .insert(offersTable)
      .values({
        chatId,
        proposedBy: userId,
        price,
        status: "pending",
        expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      })
      .returning();

    await db
      .update(listingsTable)
      .set({
        status: "pending",
      })
      .where(eq(listingsTable.listingId, listingId));

    if (io) {
      io.to(chatId).emit("offerCreated", {
        offer: newoffer,
      });
    }

    return newoffer;
  } catch (err) {
    const dbCode = (err as { cause?: { code?: string } }).cause?.code;
    if (dbCode === "23505") {
      throw new DBConstraintError(
        "There is already a pending offer in this chat",
      );
    }
    throw err;
  }
};

export {
  getListings,
  createListing,
  getListingById,
  editListing,
  deleteListing,
  myListings,
  makeOffer,
};
