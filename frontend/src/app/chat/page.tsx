"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useAppData, User, Chats, Message } from '@/context/AppContext';
import { redirect } from 'next/navigation';
import Loading from '@/Components/loading';
import { SocketData } from '@/context/socketContext';
import Cookies from 'js-cookie';
import axios from 'axios';

const TYPING_DEBOUNCE_MS = 1000;

const ChatPage = () => {
  const { isAuth, loading, logoutUser, chats, user: loggedInUser, users, fetchChats, fetchUsers } = useAppData();
  const { onlineUsers, socket, joinChat, leaveChat } = SocketData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageSending, setMessageSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevChatsLenRef = useRef<number>(chats?.length || 0);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastSelectedChatRef = useRef<string | null>(null);

  const [msgss, setMsgss] = useState<any>([]);

  useEffect(() => {
    if (!isAuth && !loading) redirect("/login");
  }, [isAuth, loading]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const filteredUsers = users?.filter(user =>
    user._id !== loggedInUser?._id &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredChats = chats?.filter(chat =>
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const reqChat = chats?.find((ch) => ch.user._id === selectedUser);
  const chatID = reqChat?.chat._id;

  // Fetch messages for selectedUser/chat
  useEffect(() => {
    const reqChat = chats?.find((ch) => ch.user._id === selectedUser);
    const chatID = reqChat?.chat._id;

    const getChat = async () => {
      try {
        if (!chatID) {
          setMsgss([]);
          return;
        }

        const token = Cookies.get("token");
        if (!token) {
          console.warn("No token found in cookies");
          setMsgss([]);
          return;
        }

        const res = await axios.get(`http://localhost:5002/api/v1/message/${chatID}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setMsgss(res.data.messages || []);
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        setMsgss([]);
      }
    };

    getChat();
  }, [selectedUser, chats]);

  // Join/leave chat room on selection change
  useEffect(() => {
    const prevChatId = lastSelectedChatRef.current;
    if (prevChatId && socket) {
      try {
        if (typeof leaveChat === 'function') {
          leaveChat(prevChatId);
        } else {
          socket.emit('leaveChat', { chatId: prevChatId });
        }
      } catch (err) {}
    }

    if (chatID && socket) {
      try {
        if (typeof joinChat === 'function') {
          joinChat(chatID);
        } else {
          socket.emit('joinChat', { chatId: chatID });
        }
      } catch (err) {}
    }

    setIsTyping(false);
    lastSelectedChatRef.current = chatID || null;
  }, [chatID, socket, selectedUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message: any) => {
      if (!message) return;

      setMsgss((prev: any) => {
        if (prev.some((m: any) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      if (message.sender === selectedUser) setIsTyping(false);
    };

    const onIsTyping = (data: { from?: string; chatId?: string }) => {
      if (!data?.from || !data?.chatId) return;
      if (data.from === selectedUser && data.chatId === chatID) {
        setIsTyping(true);
      }
    };

    const onStopTyping = (data: { from?: string; chatId?: string }) => {
      if (!data?.from || !data?.chatId) return;
      if (data.from === selectedUser && data.chatId === chatID) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("istyping", onIsTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("istyping", onIsTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [socket, selectedUser, chatID]);

  // Typing indicators
  useEffect(() => {
    if (!socket || !selectedUser || !chatID) return;

    if (!newMessage.trim()) {
      socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      return;
    }

    socket.emit("typing", { to: selectedUser, chatId: chatID });

    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
      typingTimeoutRef.current = null;
    }, TYPING_DEBOUNCE_MS);
  }, [newMessage, selectedUser, chatID, socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      if (socket && selectedUser && chatID) {
        socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
      }
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    };
    scrollToBottom();
  }, [msgss.length, selectedUser]);

  // Animation for new chats
  useEffect(() => {
    const prevLen = prevChatsLenRef.current;
    const currLen = chats?.length || 0;

    if (currLen > prevLen) {
      setTimeout(() => {
        if (selectedUser) {
          const chatElement = document.getElementById(`chat-item-${selectedUser}`);
          if (chatElement) {
            chatElement.classList.add('animate-pulse');
            setTimeout(() => chatElement.classList.remove('animate-pulse'), 2000);
          }
        }
      }, 100);
    }

    prevChatsLenRef.current = currLen;
  }, [chats, selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || messageSending) return;

    setMessageSending(true);

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      text: newMessage.trim(),
      messageType: "text",
      sender: loggedInUser?._id || '',
      chatId: chatID || '',
      seen: false,
      createdAt: new Date().toISOString().replace("Z", "+00:00"),
      isSending: true
    };

    setMsgss((prev: any) => [...prev, tempMessage]);
    const currentMessage = newMessage;
    setNewMessage('');

    try {
      if (socket && selectedUser && chatID) {
        socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }

      const token = Cookies.get("token");
      const res = await axios.post(
        "http://localhost:5002/api/v1/message",
        {
          text: currentMessage,
          chatId: chatID,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const savedMessage = res.data?.message || res.data;

      setMsgss((prev: any) => {
        const filtered = prev.filter((m: any) => m._id !== tempId && m._id !== savedMessage._id);
        return [...filtered, savedMessage];
      });
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setMsgss((prev: any) => prev.filter((msg: any) => msg._id !== tempId));
      setNewMessage(currentMessage);
    } finally {
      setMessageSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLastMessagePreview = (chat: Chats) => {
    if (!chat.chat.latestMessage || !chat.chat.latestMessage.text) return "No messages yet";
    const message = chat.chat.latestMessage.text;
    return message.length > 25 ? message.substring(0, 25) + '...' : message;
  };

  const getUnseenCount = (chat: Chats): number => chat.chat.unseenCount || 0;
  const isUserOnline = (userId: string): boolean => onlineUsers.includes(userId);
  const selectedUserDetails = users?.find(user => user._id === selectedUser);

  if (loading) return <Loading />;

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900 overflow-hidden relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Compact Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-lg transform transition-all duration-300 ease-out
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-0
        `}
      >
        {/* Compact Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {loggedInUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isUserOnline(loggedInUser?._id || '') ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {loggedInUser?.name || 'User'}
              </h1>
              <p className="text-xs text-gray-600 truncate">
                {isUserOnline(loggedInUser?._id || '') ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Compact Toggle Buttons */}
        <div className="flex-shrink-0 flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setShowAllUsers(false)}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors relative ${!showAllUsers
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Chats
          </button>
          <button
            onClick={() => setShowAllUsers(true)}
            className={`flex-1 py-3 px-4 text-center font-medium text-sm transition-colors relative ${showAllUsers
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            Users
          </button>
        </div>

        {/* Compact Search */}
        <div className="flex-shrink-0 p-3 border-b border-gray-200 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${showAllUsers ? 'users' : 'chats'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Compact Users/Chats List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {showAllUsers ? (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                All Users ({filteredUsers.length})
              </h3>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      setSelectedUser(user._id);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors mb-1 ${selectedUser === user._id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${isUserOnline(user._id) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {isUserOnline(user._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No users found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                Recent Chats ({filteredChats.length})
              </h3>
              {filteredChats.length > 0 ? (
                filteredChats.map((chatItem, i) => {
                  const otherUser = chatItem.user;
                  const unseenCount = getUnseenCount(chatItem);
                  return (
                    <div
                      id={`chat-item-${otherUser._id}`}
                      key={i}
                      onClick={() => {
                        setSelectedUser(otherUser._id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors mb-1 ${selectedUser === otherUser._id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                        }`}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xs">
                          {otherUser.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${isUserOnline(otherUser._id) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {unseenCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                            {unseenCount}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser.name}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {new Date(chatItem.chat.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {getLastMessagePreview(chatItem)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No chats found</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-white">
          <button
            onClick={logoutUser}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Compact Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {selectedUser && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${isUserOnline(selectedUser) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {selectedUserDetails?.name || 'Unknown User'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {isTyping ? 'Typing...' : (isUserOnline(selectedUser) ? 'Online' : 'Offline')}
                  </p>
                </div>
              </div>
            )}
          </div>
          {selectedUser && (
            <button
              onClick={() => setSelectedUser(null)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Select a conversation from the sidebar to start chatting.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Open Chats
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Header */}
            <div className="hidden lg:flex flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isUserOnline(selectedUser) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {selectedUserDetails?.name || 'Unknown User'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {isTyping ? (
                      <span className="text-blue-600 flex items-center">
                        <span className="flex space-x-1 ml-1">
                          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
                          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-150"></span>
                          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-300"></span>
                        </span>
                        Typing...
                      </span>
                    ) : (
                      <span className={isUserOnline(selectedUser) ? 'text-green-600' : 'text-gray-500'}>
                        {isUserOnline(selectedUser) ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Compact Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {msgss.length > 0 ? (
                msgss.map((message: any) => (
                  <div
                    key={message._id}
                    className={`flex mb-3 ${message.sender === loggedInUser?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-xl ${message.sender === loggedInUser?._id
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                      }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className={`text-xs mt-1 ${message.sender === loggedInUser?._id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-sm text-gray-600">No messages yet. Start a conversation!</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Compact Message Input */}
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || messageSending}
                  className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {messageSending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;