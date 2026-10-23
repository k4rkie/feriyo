import "dotenv/config";
import type { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import {
  handleNewMessage,
  isChatParticipant,
} from "../services/chat.services.js";

type SocketData = {
  userId: string;
};

const joinRoomSchema = z.object({
  roomId: z.string().uuid(),
});

const newMessageSchema = z.object({
  chatId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

export let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.accessToken;
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
      ) as JwtPayload;
      const userId = payload.sub;

      if (!userId) {
        return next(new Error("Unauthorized"));
      }

      socket.data.userId = String(userId);
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket: Socket<any, any, any, SocketData>) => {
    socket.on("joinRoom", async (joinRoomData: unknown) => {
      const parsed = joinRoomSchema.safeParse(joinRoomData);
      if (!parsed.success) {
        socket.emit("errorMessage", "Invalid chat");
        return;
      }

      try {
        const isMember = await isChatParticipant(
          parsed.data.roomId,
          socket.data.userId,
        );
        if (!isMember) {
          socket.emit("errorMessage", "You cannot join this chat");
          return;
        }
        socket.join(parsed.data.roomId);
      } catch {
        socket.emit("errorMessage", "Could not join this chat");
      }
    });

    socket.on("newMessage", async (newMessageData: unknown) => {
      const parsed = newMessageSchema.safeParse(newMessageData);
      if (!parsed.success) {
        socket.emit("errorMessage", "Invalid message");
        return;
      }

      try {
        await handleNewMessage(
          {
            message: parsed.data.message,
            chatId: parsed.data.chatId,
            userId: socket.data.userId,
          },
          io,
        );
      } catch (error) {
        socket.emit(
          "errorMessage",
          error instanceof Error ? error.message : "Could not send message",
        );
      }
    });

    socket.on("disconnect", () => undefined);
  });

  return io;
};
