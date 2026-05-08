import { eq, and } from "drizzle-orm";
import { db } from "../db/db.js";
import { offersTable, listingsTable, chatsTable, messagesTable } from "../db/schema.js";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../errors/index.js";
import { io } from "../chat/chat.js";

export const updateOfferStatus = async (
  offerId: string,
  newStatus: "accepted" | "rejected" | "cancelled",
  userId: string,
) => {
  const [offer] = await db
    .select()
    .from(offersTable)
    .where(eq(offersTable.offerId, offerId))
    .limit(1);

  if (!offer) {
    throw new NotFoundError("Offer not found");
  }

  if (offer.status !== "pending") {
    throw new BadRequestError(`Offer is already ${offer.status}`);
  }

  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.chatId, offer.chatId))
    .limit(1);

  if (!chat) {
    throw new NotFoundError("Chat not found");
  }

  // Authorization logic
  if (newStatus === "cancelled") {
    if (offer.proposedBy !== userId) {
      throw new UnauthorizedError("Only the proposer can cancel the offer");
    }
  } else if (newStatus === "accepted" || newStatus === "rejected") {
    const otherPartyId = offer.proposedBy === chat.buyerId ? chat.sellerId : chat.buyerId;
    if (userId !== otherPartyId) {
      throw new UnauthorizedError(`Only the other party can ${newStatus} the offer`);
    }
  }

  const [updatedOffer] = await db
    .update(offersTable)
    .set({ status: newStatus })
    .where(eq(offersTable.offerId, offerId))
    .returning();

  // Add a message to the chat history about this action
  let messageContent = "";
  if (newStatus === "accepted") {
    messageContent = `Offer of Rs. ${offer.price} was accepted!`;
  } else if (newStatus === "rejected") {
    messageContent = `Offer of Rs. ${offer.price} was rejected.`;
  } else if (newStatus === "cancelled") {
    messageContent = `Offer of Rs. ${offer.price} was cancelled.`;
  }

  const [updatedMessage] = await db
    .insert(messagesTable)
    .values({
      chatId: offer.chatId,
      senderId: userId,
      content: messageContent,
    })
    .returning();

  // If accepted, mark the listing as sold
  if (newStatus === "accepted") {
    await db
      .update(listingsTable)
      .set({ status: "sold" })
      .where(eq(listingsTable.listingId, chat.listingId));
  } else if (newStatus === "rejected" || newStatus === "cancelled") {
    // check if there are other pending offers for this listing.
    const [otherPendingOffer] = await db
      .select()
      .from(offersTable)
      .innerJoin(chatsTable, eq(offersTable.chatId, chatsTable.chatId))
      .where(
        and(
          eq(chatsTable.listingId, chat.listingId),
          eq(offersTable.status, "pending"),
        ),
      )
      .limit(1);

    if (!otherPendingOffer) {
      await db
        .update(listingsTable)
        .set({ status: "available" })
        .where(eq(listingsTable.listingId, chat.listingId));
    }
  }

  // Notify both users in the room
  if (io) {
    io.to(offer.chatId).emit("offerUpdated", {
      offer: updatedOffer,
      message: updatedMessage,
      listingStatus: newStatus === "accepted" ? "sold" : "available",
    });
  }

  return updatedOffer;
};
