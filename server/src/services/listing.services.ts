import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { listingsTable } from "../db/schema.js";
import type {
  createListingInput,
  editListingInput,
} from "../validators/listings.validator.js";
import { getUserInfo } from "./auth.services.js";
import { NotFoundError, UnauthorizedError } from "../errors/index.js";

type authorInfo = {
  userId: number;
  username: string;
  email: string;
};

type getListingsData = {
  listingId: number;
  title: string;
  description: string | null;
  price: number;
  isSold: boolean;
  authorId: number;
  imageUrls: string[];
  authorInfo: authorInfo;
};

const getListings = async () => {
  const listings = await db
    .select({
      listingId: listingsTable.listingId,
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      isSold: listingsTable.isSold,
      authorId: listingsTable.authorId,
      imageUrls: listingsTable.imageUrls,
    })
    .from(listingsTable);

  let listingsWithUserInfo: getListingsData[] = [];
  async function attachAuthorInfo() {
    for (let listing of listings) {
      const authorInfo = await getUserInfo(listing.authorId);
      listingsWithUserInfo.push({ ...listing, authorInfo });
    }
  }
  await attachAuthorInfo();
  return listingsWithUserInfo;
};

const createListing = async (
  createListingData: createListingInput,
  userId: number,
) => {
  const {
    title,
    description,
    price,
    location,
    category,
    condition,
    listingImages,
  } = createListingData;

  const imageUrls = listingImages.map((image) => {
    return `/uploads/listings/images/${image.filename}`;
  });

  const [newListing] = await db
    .insert(listingsTable)
    .values({
      title,
      description,
      price,
      location,
      isSold: false,
      category,
      condition,
      authorId: userId,
      imageUrls,
    })
    .returning({
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.location,
      isSold: listingsTable.isSold,
      category: listingsTable.category,
      condition: listingsTable.condition,
      imageUrls: listingsTable.imageUrls,
    });

  return newListing;
};

const getListingById = async (listingId: number) => {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId));

  if (!listing) {
    throw new NotFoundError(
      `Cannot find a listing with the provided ID: ${listingId}`,
    );
  }

  const authorInfo = await getUserInfo(listing.authorId);
  const listingsWithUserInfo = { ...listing, authorInfo };
  return listingsWithUserInfo;
};

const editListing = async (
  editListingData: editListingInput,
  listingId: number,
  userId: number,
) => {
  const {
    title,
    description,
    price,
    location,
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

  const newImageUrls = newListingImages.map((image) => {
    return `/uploads/listings/images/${image.filename}`;
  });

  imageUrls = [...imageUrls, ...newImageUrls];

  const [editedListing] = await db
    .update(listingsTable)
    .set({
      title,
      description,
      price,
      location,
      isSold,
      category,
      condition,
      authorId: userId,
      imageUrls,
      updatedAt: new Date(),
    })
    .where(eq(listingsTable.listingId, listingId))
    .returning({
      title: listingsTable.title,
      description: listingsTable.description,
      price: listingsTable.price,
      location: listingsTable.location,
      isSold: listingsTable.isSold,
      category: listingsTable.category,
      condition: listingsTable.condition,
      imageUrls: listingsTable.imageUrls,
    });

  return editedListing;
};

const deleteListing = async (listingId: number, userId: number) => {
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

const myListings = async (userId: number) => {
  try {
    const myListings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.authorId, userId));
    console.log("My listings:", myListings);
    if (!myListings) {
      throw new NotFoundError(`You currently no active listings`);
    }
    return myListings;
  } catch (error) {
    throw new Error("Error while fetching my listings");
  }
};

export {
  getListings,
  createListing,
  getListingById,
  editListing,
  deleteListing,
  myListings,
};
