"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/lib/auth/auth-context";
import { getAccessToken, setAccessToken } from "@/lib/token";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  jwtToken: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, accessToken, isLoading, refreshAccessToken } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jwtToken, setJwtToken] = useState<string | null>(null);

  // -----------------------------------------------------
  // 🟡 Load token từ localStorage (ưu tiên nhất)
  // -----------------------------------------------------
  useEffect(() => {
    const savedToken = getAccessToken();
    console.log("[socket] Loaded token:", savedToken);
    if (savedToken) setJwtToken(savedToken);
  }, []);

  // -----------------------------------------------------
  // 🔁 Auto refresh token mỗi 10 phút
  // -----------------------------------------------------
  useEffect(() => {
    if (!jwtToken) return;

    const interval = setInterval(async () => {
      console.log("[socket] Auto refreshing socket token...");

      const newToken = await refreshAccessToken();
      if (!newToken) return;

      setAccessToken(newToken);
      setJwtToken(newToken);

      if (socketRef.current) {
        socketRef.current.auth = { token: newToken };
        socketRef.current.connect();
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [jwtToken]);

  // -----------------------------------------------------
  // 🔵 Tạo socket khi có token
  // -----------------------------------------------------
  useEffect(() => {
    if (!jwtToken) {
      console.log("[socket] No token → do not create socket");
      return;
    }

    console.log("[socket] Creating NEW socket with token:", jwtToken);

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: jwtToken },
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[v0] Socket connected user id: ${user?.id}, user email:${user?.email}, socketid: ${socket.id}`, user, socket);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log(`[v0] Socket disconnected user id: ${user?.id}, user email:${user?.email}, socketid: ${socket.id}`, user, socket);
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[socket] Connect error:", err.message);
    });

    return () => {
      console.log("[socket] Cleanup: disconnecting socket");
      socket.disconnect();
    };
  }, [jwtToken]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        jwtToken,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be inside <SocketProvider>");
  return ctx;
}
