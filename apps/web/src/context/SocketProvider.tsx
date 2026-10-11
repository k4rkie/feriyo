import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

type SocketProviderPropType = {
  children: ReactNode;
};

const SocketContext = createContext<SocketContextType | null>(null);

function SocketProvider({ children }: SocketProviderPropType) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    if (auth.accessToken) {
      const socket = io(import.meta.env.VITE_BASE_BACKEND_URL, {
        auth: {
          accessToken: auth.accessToken,
        },
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        setIsConnected(true);
      });
      socket.on("disconnect", () => {
        setIsConnected(false);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setIsConnected(false);
        socketRef.current = null;
      }
    };
  }, [auth.accessToken]);

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
  };
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be inside SocketProvider");
  }
  return context;
}

export { SocketProvider, useSocket };
