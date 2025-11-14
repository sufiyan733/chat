"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { chatt_service } from "../../url";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  emitTyping: (to: string, chatId: string) => void;
  emitStopTyping: (to: string, chatId: string) => void;
  typingMap: Record<string, string[]>; // chatId -> array of userIds typing
  isTyping: (chatId: string, userId: string) => boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  joinChat: () => {},
  leaveChat: () => {},
  emitTyping: () => {},
  emitStopTyping: () => {},
  typingMap: {},
  isTyping: () => false,
});

interface ProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: ProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppData();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // typing map: chatId -> array of userIds who are currently typing
  const [typingMap, setTypingMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user?._id) return;

    // Create socket with sensible defaults: allow websocket + polling and upgrades.
    const newSocket = io(chatt_service, {
      path: "/socket.io",
      transports: ["websocket", "polling"], // allow websocket but fallback to polling
      auth: { userId: user._id },           // modern socket.io auth
      query: { userId: user._id },          // keep if server reads handshake.query
      withCredentials: true,
      timeout: 20000,
      forceNew: true,
      // reconnection options (tuning)
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // expose for debugging in browser console
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.__socket = newSocket;
    } catch (e) {
      /* ignore */
    }

    // debug/logging handlers
    const onConnect = () => console.debug("[SOCKET] connected", newSocket.id);
    const onConnectError = (err: any) => console.error("[SOCKET] connect_error", err);
    const onReconnectAttempt = (attempt: number) => console.debug("[SOCKET] reconnect attempt", attempt);
    const onReconnect = (attempt: number) => console.debug("[SOCKET] reconnected after", attempt);
    const onDisconnect = (reason: string) => console.debug("[SOCKET] disconnected", reason);

    newSocket.on("connect", onConnect);
    newSocket.on("connect_error", onConnectError);
    newSocket.io.on("reconnect_attempt", onReconnectAttempt);
    newSocket.on("reconnect", onReconnect);
    newSocket.on("disconnect", onDisconnect);

    setSocket(newSocket);

    // event handlers (kept as local functions for off() cleanup)
    const handleGetOnline = (users: string[]) => {
      console.debug("[SOCKET] getOnlineUser", users);
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    const handleIsTyping = (data: { from?: string; chatId?: string }) => {
      if (!data?.from || !data?.chatId) return;
      const chatId = String(data.chatId);
      const from = String(data.from);

      setTypingMap((prev) => {
        const curr = prev[chatId] ? [...prev[chatId]] : [];
        if (!curr.includes(from)) curr.push(from);
        return { ...prev, [chatId]: curr };
      });
    };

    const handleStopTyping = (data: { from?: string; chatId?: string }) => {
      if (!data?.from || !data?.chatId) return;
      const chatId = String(data.chatId);
      const from = String(data.from);

      setTypingMap((prev) => {
        const curr = prev[chatId] ? prev[chatId].filter((u) => u !== from) : [];
        return { ...prev, [chatId]: curr };
      });
    };

    // server may emit 'messagesSeen' or 'getOnlineUser' etc. Add only what's needed here.
    newSocket.on("getOnlineUser", handleGetOnline);
    newSocket.on("istyping", handleIsTyping);
    newSocket.on("stopTyping", handleStopTyping);

    // cleanup
    return () => {
      try {
        newSocket.off("getOnlineUser", handleGetOnline);
        newSocket.off("istyping", handleIsTyping);
        newSocket.off("stopTyping", handleStopTyping);

        newSocket.off("connect", onConnect);
        newSocket.off("connect_error", onConnectError);
        newSocket.io.off("reconnect_attempt", onReconnectAttempt);
        newSocket.off("reconnect", onReconnect);
        newSocket.off("disconnect", onDisconnect);

        // remove any remaining listeners and disconnect
        newSocket.removeAllListeners();
        newSocket.disconnect();
      } catch (err) {
        console.warn("[SOCKET] cleanup error", err);
      } finally {
        setSocket(null);
        setOnlineUsers([]);
        setTypingMap({});
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete window.__socket;
        } catch (e) {}
      }
    };
    // recreate socket only when user._id changes
  }, [user?._id]);

  // helpers
  const joinChat = (chatId: string) => {
    if (!socket) {
      console.debug("[SOCKET] joinChat called but socket is null", chatId);
      return;
    }
    console.debug("[SOCKET] emit joinChat", chatId);
    socket.emit("joinChat", { chatId });
  };

  const leaveChat = (chatId: string) => {
    if (!socket) {
      console.debug("[SOCKET] leaveChat called but socket is null", chatId);
      return;
    }
    console.debug("[SOCKET] emit leaveChat", chatId);
    socket.emit("leaveChat", { chatId });
    // clear typing state for this chat for the current user on leave
    setTypingMap((prev) => ({ ...prev, [chatId]: prev[chatId] ? prev[chatId].filter((u) => u !== user?._id) : [] }));
  };

  const emitTyping = (to: string, chatId: string) => {
    if (!socket) return;
    socket.emit("typing", { to, chatId });
  };

  const emitStopTyping = (to: string, chatId: string) => {
    if (!socket) return;
    socket.emit("stopTyping", { to, chatId });
  };

  const isTyping = (chatId: string, userId: string) => {
    return !!typingMap[chatId] && typingMap[chatId].includes(userId);
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, joinChat, leaveChat, emitTyping, emitStopTyping, typingMap, isTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const SocketData = () => useContext(SocketContext);
