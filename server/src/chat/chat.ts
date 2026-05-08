import { Server } from "socket.io";
import { handleNewMessage } from "../services/chat.services.js";

type newMessageObj = {
  message: string;
  userId: string;
  chatId: string;
};

type joinRoomObj = {
  roomId: string;
  userId: string;
};

export let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New User connected");

    // room join
    socket.on("joinRoom", (joinRoomData: joinRoomObj) => {
      socket.join(joinRoomData.roomId);
    });

    // new message
    socket.on("newMessage", async (newMessageData: newMessageObj) => {
      await handleNewMessage(newMessageData, io);
    });
  });
  io.on("disconnection", () => {
    console.log("User disconnected");
  });
  return io;
};
