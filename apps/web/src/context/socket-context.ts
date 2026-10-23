import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

export type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be inside SocketProvider");
  }
  return context;
}
