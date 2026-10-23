import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./auth-context";
import { SocketContext, type SocketContextType } from "./socket-context";

type SocketProviderPropType = {
  children: ReactNode;
};

function SocketProvider({ children }: SocketProviderPropType) {
  const auth = useAuth();
  const [connectedSocket, setConnectedSocket] = useState<Socket | null>(null);

  const socket = useMemo(() => {
    if (!auth.accessToken) return null;

    return io(import.meta.env.VITE_BASE_BACKEND_URL, {
      autoConnect: false,
      auth: {
        accessToken: auth.accessToken,
      },
    });
  }, [auth.accessToken]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setConnectedSocket(socket);
    const handleDisconnect = () => setConnectedSocket(null);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  const value: SocketContextType = {
    socket,
    isConnected: socket !== null && connectedSocket === socket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export { SocketProvider };
