import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { listingsTable } from "../db/schema.js";
import type { createListingInput } from "../validators/listings.validator.js";
import { getUserInfo } from "./auth.services.js";

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

  const [new_listing] = await db
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

  return new_listing;
};

const getListingById = async (listingId: number) => {
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId));

  // let listingsWithUserInfo: getListingsData[] = [];
  //
  // async function attachAuthorInfo() {
  //   const authorInfo = await getUserInfo(listing.authorId);
  //   listingsWithUserInfo.push({ ...listing, authorInfo });
  // }
  // await attachAuthorInfo();

  const authorInfo = await getUserInfo(listing.authorId);
  const listingsWithUserInfo = { ...listing, authorInfo };
  return listingsWithUserInfo;
};

export { getListings, createListing, getListingById };
