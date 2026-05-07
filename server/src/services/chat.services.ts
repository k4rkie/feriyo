import { eq, and, or, desc } from "drizzle-orm";
import { db } from "../db/db.js";
import { chatsTable, listingsTable, messagesTable } from "../db/schema.js";
import { contactSellerInput } from "../validators/chat.validator.js";
import { NotFoundError } from "../errors/index.js";
import type { Server, Socket } from "socket.io";
import { newMessageController } from "../controllers/chat.controllers.js";

type newMessageObj = {
  message: string;
  userId: string;
  chatId: string;
};

const getChatList = async (userId: string) => {
  let chatList = await db.query.chatsTable.findMany({
    where: (chatsTable, { or, eq }) =>
      or(eq(chatsTable.buyerId, userId), eq(chatsTable.sellerId, userId)),
    with: {
      listing: {
        columns: { listingId: true, title: true, price: true, imageUrls: true },
      },
      buyer: {
        columns: { username: true, avatarUrl: true },
      },
      seller: {
        columns: { username: true, avatarUrl: true },
      },
    },
  });

  return chatList;
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
        columns: { listingId: true, title: true, price: true, imageUrls: true },
      },
      buyer: {
        columns: { userId: true, username: true, avatarUrl: true },
      },
      seller: {
        columns: { userId: true, username: true, avatarUrl: true },
      },
    },
  });

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId));

  return { chatData, messages };
};

const handleJoinRoom = async () => {};

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
