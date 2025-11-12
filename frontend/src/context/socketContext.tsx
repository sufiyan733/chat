"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client"
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
  const [socket, setSocket] = useState<Socket | null>(null)
  const { user } = useAppData();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  // typing map: chatId -> array of userIds who are currently typing
  const [typingMap, setTypingMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(chatt_service, {
      query: { userId: user._id }
    });

    setSocket(newSocket);

    const handleGetOnline = (users: string[]) => setOnlineUsers(users || []);

   const handleIsTyping = (data: { from?: string; chatId?: string }) => {
  if (!data?.from || !data?.chatId) return;          // guard early
  const chatId: string = data.chatId;                // now definitely string
  const from: string = data.from;

  setTypingMap((prev: Record<string, string[]>) => {
    const arr = prev[chatId] ? [...prev[chatId]] : []; // safe index
    if (!arr.includes(from)) arr.push(from);
    return { ...prev, [chatId]: arr };               // computed key is a string
  });
};

const handleStopTyping = (data: { from?: string; chatId?: string }) => {
  if (!data?.from || !data?.chatId) return;
  const chatId: string = data.chatId;
  const from: string = data.from;

  setTypingMap((prev: Record<string, string[]>) => {
    const arr = prev[chatId] ? prev[chatId].filter(u => u !== from) : [];
    return { ...prev, [chatId]: arr };
  });
};

    newSocket.on("getOnlineUser", handleGetOnline);
    newSocket.on("istyping", handleIsTyping);
    newSocket.on("stopTyping", handleStopTyping);

    return () => {
      newSocket.off("getOnlineUser", handleGetOnline);
      newSocket.off("istyping", handleIsTyping);
      newSocket.off("stopTyping", handleStopTyping);
      newSocket.disconnect();
      setSocket(null);
      setOnlineUsers([]);
      setTypingMap({});
    }
  }, [user?._id])

  // helpers
  const joinChat = (chatId: string) => {
    if (!socket) return;
    socket.emit('joinChat', { chatId });
  };

  const leaveChat = (chatId: string) => {
    if (!socket) return;
    socket.emit('leaveChat', { chatId });
    // clear typing state for this chat for the current user on leave
    setTypingMap(prev => ({ ...prev, [chatId]: prev[chatId] ? prev[chatId].filter(u => u !== user?._id) : [] }));
  };

  const emitTyping = (to: string, chatId: string) => {
    if (!socket) return;
    socket.emit('typing', { to, chatId });
  };

  const emitStopTyping = (to: string, chatId: string) => {
    if (!socket) return;
    socket.emit('stopTyping', { to, chatId });
  };

  const isTyping = (chatId: string, userId: string) => {
    return !!typingMap[chatId] && typingMap[chatId].includes(userId);
  };

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, joinChat, leaveChat, emitTyping, emitStopTyping, typingMap, isTyping }}>
      {children}
    </SocketContext.Provider>
  )
}

export const SocketData = () => useContext(SocketContext);
