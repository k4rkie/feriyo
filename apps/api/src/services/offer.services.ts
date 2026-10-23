import { and, eq, gt, inArray, lte, ne } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  offersTable,
  listingsTable,
  chatsTable,
  messagesTable,
} from "../db/schema.js";
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from "../errors/index.js";
import { io } from "../chat/chat.js";

const syncListingStatus = async (listingId: string) => {
  const [pendingOffer] = await db
    .select({ offerId: offersTable.offerId })
    .from(offersTable)
    .innerJoin(chatsTable, eq(offersTable.chatId, chatsTable.chatId))
    .where(
      and(
        eq(chatsTable.listingId, listingId),
        eq(offersTable.status, "pending"),
        gt(offersTable.expireAt, new Date()),
      ),
    )
    .limit(1);

  if (!pendingOffer) {
    await db
      .update(listingsTable)
      .set({ status: "available" })
      .where(
        and(
          eq(listingsTable.listingId, listingId),
          eq(listingsTable.status, "pending"),
        ),
      );
  }
};

export const expireOffers = async () => {
  const expiredOffers = await db
    .update(offersTable)
    .set({ status: "expired" })
    .where(
      and(
        eq(offersTable.status, "pending"),
        lte(offersTable.expireAt, new Date()),
      ),
    )
    .returning({
      offerId: offersTable.offerId,
      chatId: offersTable.chatId,
    });

  if (expiredOffers.length === 0) return 0;

  const chatIds = [...new Set(expiredOffers.map((offer) => offer.chatId))];
  const affectedChats = await db
    .select({ listingId: chatsTable.listingId })
    .from(chatsTable)
    .where(inArray(chatsTable.chatId, chatIds));

  const listingIds = [
    ...new Set(affectedChats.map((chat) => chat.listingId)),
  ];

  for (const listingId of listingIds) {
    await syncListingStatus(listingId);
  }

  for (const chatId of chatIds) {
    io?.to(chatId).emit("offerUpdated", {
      offer: null,
      message: null,
    });
  }

  return expiredOffers.length;
};

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

  if (offer.expireAt.getTime() <= Date.now()) {
    await db
      .update(offersTable)
      .set({ status: "expired" })
      .where(eq(offersTable.offerId, offerId));
    await syncListingStatus(chat.listingId);
    throw new BadRequestError("Offer has expired");
  }

  if (newStatus === "cancelled") {
    if (offer.proposedBy !== userId) {
      throw new UnauthorizedError("Only the proposer can cancel the offer");
    }
  } else if (newStatus === "accepted" || newStatus === "rejected") {
    const otherPartyId =
      offer.proposedBy === chat.buyerId ? chat.sellerId : chat.buyerId;
    if (userId !== otherPartyId) {
      const action = newStatus === "accepted" ? "accept" : "reject";
      throw new UnauthorizedError(
        `Only the other party can ${action} the offer`,
      );
    }
  }

  const [updatedOffer] = await db
    .update(offersTable)
    .set({ status: newStatus })
    .where(eq(offersTable.offerId, offerId))
    .returning();

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

  if (newStatus === "accepted") {
    await db
      .update(listingsTable)
      .set({ status: "sold" })
      .where(eq(listingsTable.listingId, chat.listingId));

    const otherPendingOffers = await db
      .select({
        offerId: offersTable.offerId,
        chatId: offersTable.chatId,
      })
      .from(offersTable)
      .innerJoin(chatsTable, eq(offersTable.chatId, chatsTable.chatId))
      .where(
        and(
          eq(chatsTable.listingId, chat.listingId),
          eq(offersTable.status, "pending"),
          ne(offersTable.offerId, offerId),
          gt(offersTable.expireAt, new Date()),
        ),
      );

    if (otherPendingOffers.length > 0) {
      await db
        .update(offersTable)
        .set({ status: "rejected" })
        .where(
          inArray(
            offersTable.offerId,
            otherPendingOffers.map((pending) => pending.offerId),
          ),
        );

      for (const pending of otherPendingOffers) {
        io?.to(pending.chatId).emit("offerUpdated", {
          offer: null,
          message: null,
        });
      }
    }
  } else if (newStatus === "rejected" || newStatus === "cancelled") {
    await syncListingStatus(chat.listingId);
  }

  io?.to(offer.chatId).emit("offerUpdated", {
    offer: updatedOffer,
    message: updatedMessage,
  });

  return updatedOffer;
};
