import { eq, and } from "drizzle-orm";
import { db } from "../db/db.js";
import { savedListingsTable, listingsTable } from "../db/schema.js";
import { NotFoundError } from "../errors/index.js";

export const toggleSaveListing = async (listingId: string, userId: string) => {
  // Check if listing exists
  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId))
    .limit(1);

  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  // Check if already saved
  const [existingSave] = await db
    .select()
    .from(savedListingsTable)
    .where(
      and(
        eq(savedListingsTable.userId, userId),
        eq(savedListingsTable.listingId, listingId)
      )
    )
    .limit(1);

  if (existingSave) {
    // Unsave (Remove)
    await db
      .delete(savedListingsTable)
      .where(eq(savedListingsTable.saveId, existingSave.saveId));
    return { saved: false };
  } else {
    // Save (Add)
    await db.insert(savedListingsTable).values({
      userId,
      listingId,
    });
    return { saved: true };
  }
};

export const getSavedListings = async (userId: string) => {
  const saved = await db.query.savedListingsTable.findMany({
    where: eq(savedListingsTable.userId, userId),
    with: {
      listing: {
        with: {
          author: {
            columns: { username: true }
          }
        }
      }
    }
  });
  
  // Extract listing and flatten author info
  return saved.map(item => ({
    ...item.listing,
    authorInfo: item.listing.author
  }));
};
