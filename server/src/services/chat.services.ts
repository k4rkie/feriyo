import { eq, and, or, desc, sql, max } from "drizzle-orm";
import { db } from "../db/db.js";
import { chatsTable, listingsTable, messagesTable } from "../db/schema.js";
import { contactSellerInput } from "../validators/chat.validator.js";
import { NotFoundError } from "../errors/index.js";
import type { Server, Socket } from "socket.io";

type newMessageObj = {
  message: string;
  userId: string;
  chatId: string;
};

const getChatList = async (userId: string) => {
  // 1. Get the latest message timestamp for each chat the user is part of
  const latestMessages = db
    .select({
      chatId: messagesTable.chatId,
      lastMessageAt: max(messagesTable.createdAt).as("last_message_at"),
    })
    .from(messagesTable)
    .groupBy(messagesTable.chatId)
    .as("latest_messages");

  // 2. Fetch chats and join with the latest message timestamp
  const chatList = await db
    .select({
      chatId: chatsTable.chatId,
      listingId: chatsTable.listingId,
      buyerId: chatsTable.buyerId,
      sellerId: chatsTable.sellerId,
      createdAt: chatsTable.createdAt,
      lastMessageAt: latestMessages.lastMessageAt,
    })
    .from(chatsTable)
    .leftJoin(latestMessages, eq(chatsTable.chatId, latestMessages.chatId))
    .where(or(eq(chatsTable.buyerId, userId), eq(chatsTable.sellerId, userId)))
    .orderBy(desc(latestMessages.lastMessageAt));

  // 3. Manually attach the relations
  const chatListWithRelations = [];
  for (const chat of chatList) {
    const fullChat = await db.query.chatsTable.findFirst({
      where: eq(chatsTable.chatId, chat.chatId),
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
    if (fullChat) {
      chatListWithRelations.push(fullChat);
    }
  }

  return chatListWithRelations;
};

const contactSeller = async (
  contactSellerInput: contactSellerInput,
  userId: string,
) => {
  const { listingId, sellerId } = contactSellerInput;
  let chatId: string;
  let chat;
  [chat] = await db
    .select()
    .from(chatsTable)
    .where(
      and(
        eq(chatsTable.listingId, listingId),
        eq(chatsTable.sellerId, sellerId),
        eq(chatsTable.buyerId, userId),
      ),
    )
    .limit(1);
  if (!chat) {
    [chat] = await db
      .insert(chatsTable)
      .values({
        listingId,
        sellerId,
        buyerId: userId,
      })
      .returning();
    await db.insert(messagesTable).values({
      chatId: chat.chatId,
      senderId: userId,
      content: "I'm interested in buying this product!",
    });
  }
  chatId = chat.chatId;
  return chatId;
};

const getChatData = async (chatId: string) => {
  const [chat] = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.chatId, chatId));

  if (!chat) {
    throw new NotFoundError("Cannot find chat with provided id");
  }

  const chatData = await db.query.chatsTable.findFirst({
    where: (chatsTable, { eq }) => eq(chatsTable.chatId, chatId),
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
        columns: { userId: true, username: true, avatarUrl: true },
      },
      seller: {
        columns: { userId: true, username: true, avatarUrl: true },
      },
      offers: {
        where: (offers, { eq }) => eq(offers.status, "pending"),
        limit: 1,
      },
    },
  });

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId));

  return { chatData, messages };
};

const handleNewMessage = async (newMessageData: newMessageObj, io: Server) => {
  console.log("UserId:", newMessageData.userId);
  console.log("Message:", newMessageData.message);
  try {
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        chatId: newMessageData.chatId,
        senderId: newMessageData.userId,
        content: newMessageData.message,
      })
      .returning();
    io.to(newMessageData.chatId).emit("newMessage", newMessage);
  } catch (error) {
    console.log(error);
  }
};

export { contactSeller, getChatData, handleNewMessage, getChatList };
