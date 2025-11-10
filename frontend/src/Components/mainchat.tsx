"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useAppData, User, Message } from '@/context/AppContext';
import Image from 'next/image';

interface ChatAreaProps {
  selectedUser: string | null;
  setSelectedUser: (userId: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ChatArea = ({
  selectedUser,
  setSelectedUser,
  sidebarOpen,
  setSidebarOpen
}: ChatAreaProps) => {
  const { user: loggedInUser, users, chats, fetchChats } = useAppData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true); // This would come from your backend

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the selected user details
  const selectedUserDetails = users?.find(user => user._id === selectedUser);

  // Mock function to fetch messages - replace with your actual API
  const fetchMessages = async (userId: string) => {
    setIsLoading(true);
    try {
      // Replace with your actual API call
      const mockMessages: Message[] = [
        {
          _id: '1',
          chatId: 'chat1',
          sender: loggedInUser?._id || '',
          text: 'Hello there! 👋',
          messageType: 'text',
          seen: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          _id: '2',
          chatId: 'chat1',
          sender: userId,
          text: 'Hi! How are you doing?',
          messageType: 'text',
          seen: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
        },
        {
          _id: '3',
          chatId: 'chat1',
          sender: loggedInUser?._id || '',
          text: "I'm good! Just working on this chat app. What about you?",
          messageType: 'text',
          seen: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        },
        {
          _id: '4',
          chatId: 'chat1',
          sender: userId,
          text: "That's awesome! I'm just browsing around.",
          messageType: 'text',
          seen: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !attachedImage) || !selectedUser) return;

    const messageData = {
      text: newMessage.trim(),
      image: attachedImage,
      receiverId: selectedUser,
    };

    try {
      // Replace with your actual API call
      const newMsg: Message = {
        _id: Date.now().toString(),
        chatId: `chat-${selectedUser}`,
        sender: loggedInUser?._id || '',
        text: newMessage.trim(),
        messageType: attachedImage ? 'image' : 'text',
        seen: false,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setAttachedImage(null);
      setImagePreview(null);

      // Simulate response after 1 second
      setTimeout(() => {
        const responseMsg: Message = {
          _id: (Date.now() + 1).toString(),
          chatId: `chat-${selectedUser}`,
          sender: selectedUser,
          text: "Thanks for your message! This is an auto-reply.",
          messageType: 'text',
          seen: false,
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, responseMsg]);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Show typing indicator
    setIsTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  // Handle image attachment
  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setAttachedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove attached image
  const removeAttachedImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isMyMessage = (message: Message) => {
    return message.sender === loggedInUser?._id;
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  // Format group header date
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
            Welcome to Messages
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Select a conversation from the sidebar to start chatting. You can send messages, share images, and connect with your friends.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {selectedUserDetails?.name || 'Unknown User'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
              {isTyping && ' • Typing...'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Send a message to start the conversation with {selectedUserDetails?.name}.
            </p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex justify-center my-6">
                <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
                  {formatGroupDate(date)}
                </div>
              </div>

              {/* Messages */}
              {dateMessages.map((message) => (
                <div
                  key={message._id}
                  className={`flex mb-4 ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isMyMessage(message) ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                    {/* Avatar - Only show for received messages */}
                    {!isMyMessage(message) && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-semibold">
                        {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMyMessage(message)
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {message.messageType === 'image' && message.image ? (
                        <div className="mb-2">
                          <div className="w-48 h-48 relative rounded-lg overflow-hidden">
                            <Image
                              src={message.image.url}
                              alt="Shared image"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      ) : null}
                      
                      {message.text && (
                        <p className="text-sm">{message.text}</p>
                      )}
                      
                      <div className={`text-xs mt-1 ${isMyMessage(message) ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'} flex items-center space-x-1`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isMyMessage(message) && (
                          <span>
                            {message.seen ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 flex-1 truncate">
              {attachedImage?.name}
            </span>
            <button
              onClick={removeAttachedImage}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageAttach}
            accept="image/*"
            className="hidden"
          />

          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!newMessage.trim() && !attachedImage}
            className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;