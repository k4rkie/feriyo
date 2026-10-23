import { eq, and, or, asc, gt, inArray, max } from "drizzle-orm";
import { db } from "../db/db.js";
import { chatsTable, listingsTable, messagesTable } from "../db/schema.js";
import { contactSellerInput } from "../validators/chat.validator.js";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/index.js";
import type { Server } from "socket.io";

export type newMessageObj = {
  message: string;
  userId: string;
  chatId: string;
};

const isChatParticipant = async (chatId: string, userId: string) => {
  const [chat] = await db
    .select({ chatId: chatsTable.chatId })
    .from(chatsTable)
    .where(
      and(
        eq(chatsTable.chatId, chatId),
        or(eq(chatsTable.buyerId, userId), eq(chatsTable.sellerId, userId)),
      ),
    )
    .limit(1);
  return Boolean(chat);
};

const getChatList = async (userId: string) => {
  const chats = await db.query.chatsTable.findMany({
    where: or(eq(chatsTable.buyerId, userId), eq(chatsTable.sellerId, userId)),
    with: {
      listing: {
        columns: {
          listingId: true,
          title: true,
          price: true,
          imageUrls: true,
        },
      },
      buyer: {
        columns: { username: true, avatarUrl: true },
      },
      seller: {
        columns: { username: true, avatarUrl: true },
      },
    },
  });

  if (chats.length === 0) return [];

  const latestMessages = await db
    .select({
      chatId: messagesTable.chatId,
      lastMessageAt: max(messagesTable.createdAt),
    })
    .from(messagesTable)
    .where(
      inArray(
        messagesTable.chatId,
        chats.map((chat) => chat.chatId),
      ),
    )
    .groupBy(messagesTable.chatId);

  const lastMessageByChat = new Map(
    latestMessages.map((row) => [row.chatId, row.lastMessageAt]),
  );

  return chats
    .map((chat) => ({
      ...chat,
      lastMessageAt: lastMessageByChat.get(chat.chatId) ?? null,
    }))
    .sort((a, b) => {
      const aTime = a.lastMessageAt
        ? new Date(a.lastMessageAt).getTime()
        : new Date(a.createdAt ?? 0).getTime();
      const bTime = b.lastMessageAt
        ? new Date(b.lastMessageAt).getTime()
        : new Date(b.createdAt ?? 0).getTime();
      return bTime - aTime;
    });
};

const contactSeller = async (
  contactSellerInput: contactSellerInput,
  userId: string,
) => {
  const { listingId } = contactSellerInput;

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.listingId, listingId))
    .limit(1);

  if (!listing) {
    throw new NotFoundError("Listing not found");
  }

  if (listing.authorId === userId) {
    throw new BadRequestError("You cannot contact yourself about your listing");
  }

  const [existingChat] = await db
    .select()
    .from(chatsTable)
    .where(
      and(
        eq(chatsTable.listingId, listingId),
        eq(chatsTable.buyerId, userId),
      ),
    )
    .limit(1);

  if (existingChat) {
    return existingChat.chatId;
  }

  const [chat] = await db
    .insert(chatsTable)
    .values({
      listingId,
      sellerId: listing.authorId,
      buyerId: userId,
    })
    .returning();

  await db.insert(messagesTable).values({
    chatId: chat.chatId,
    senderId: userId,
    content: "I'm interested in buying this product!",
  });

  return chat.chatId;
};

const getChatData = async (chatId: string, userId: string) => {
  if (!(await isChatParticipant(chatId, userId))) {
    throw new UnauthorizedError("You are not a participant in this chat");
  }

  const chatData = await db.query.chatsTable.findFirst({
    where: (chats, { eq }) => eq(chats.chatId, chatId),
    with: {
      listing: {
        columns: {
          listingId: true,
          title: true,
          price: true,
          imageUrls: true,
          status: true,
        },
      },
      buyer: {
        columns: { userId: true, username: true, avatarUrl: true },
      },
      seller: {
        columns: { userId: true, username: true, avatarUrl: true },
      },
      offers: {
        where: (offers, { and, eq, gt }) =>
          and(
            eq(offers.status, "pending"),
            gt(offers.expireAt, new Date()),
          ),
        limit: 1,
      },
    },
  });

  if (!chatData) {
    throw new NotFoundError("Cannot find chat with provided id");
  }

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId))
    .orderBy(asc(messagesTable.createdAt));

  return { chatData, messages };
};

const handleNewMessage = async (newMessageData: newMessageObj, io: Server) => {
  const content = newMessageData.message.trim();

  if (!content || content.length > 2000) {
    throw new BadRequestError("Message must be between 1 and 2000 characters");
  }

  if (!(await isChatParticipant(newMessageData.chatId, newMessageData.userId))) {
    throw new UnauthorizedError("You are not a participant in this chat");
  }

  const [newMessage] = await db
    .insert(messagesTable)
    .values({
      chatId: newMessageData.chatId,
      senderId: newMessageData.userId,
      content,
    })
    .returning();

  io.to(newMessageData.chatId).emit("newMessage", newMessage);
  return newMessage;
};

export {
  contactSeller,
  getChatData,
  handleNewMessage,
  getChatList,
  isChatParticipant,
};
