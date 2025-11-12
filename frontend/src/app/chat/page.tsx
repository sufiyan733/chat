// "use client""use client"

// import React, { useState, useEffect, useRef } from 'react';
// import { useAppData, User, Chats, Message } from '@/context/AppContext';
// import { redirect, useRouter } from 'next/navigation';
// import Loading from '@/Components/loading';
// import { SocketData } from '@/context/socketContext';
// import Cookies from 'js-cookie';
// import axios from 'axios';
// import { chatt_service } from '../../../url';

// // Emoji data - you can replace this with a proper emoji picker library
// const EMOJIS = [
//   '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
//   '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
//   '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
//   '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
//   '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
//   '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
//   '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
//   '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
//   '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
//   '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
//   '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
//   '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
//   '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
//   '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
//   '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣',
//   '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
//   '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
//   '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
//   '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️',
//   '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
//   '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️'
// ];

// const TYPING_DEBOUNCE_MS = 1000;

// const ChatPage = () => {
//   const { isAuth, loading, logoutUser, chats, user: loggedInUser, users, fetchChats, fetchUsers } = useAppData();
//   const { onlineUsers, socket, joinChat, leaveChat } = SocketData();
//   const router = useRouter();

//   const [selectedUser, setSelectedUser] = useState<string | null>(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [messageSending, setMessageSending] = useState(false);
//   const [messageSeen, setMessageSeen] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [messageToEdit, setMessageToEdit] = useState<string | null>(null);
//   const [showScrollToBottom, setShowScrollToBottom] = useState(false);
//   const [imageUploading, setImageUploading] = useState(false);
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const sidebarRef = useRef<HTMLDivElement>(null);
//   const chatContainerRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const emojiPickerRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const prevChatsLenRef = useRef<number>(chats?.length || 0);
//   const typingTimeoutRef = useRef<number | null>(null);
//   const lastSelectedChatRef = useRef<string | null>(null);
//   const messageSoundRef = useRef<HTMLAudioElement | null>(null);

//   const [msgss, setMsgss] = useState<any>([]);

//   // Initialize message sound
//   useEffect(() => {
//     messageSoundRef.current = new Audio('/sounds/message-tone.mp3');
//     messageSoundRef.current.volume = 0.3;
//   }, []);

//   useEffect(() => {
//     if (!isAuth && !loading) redirect("/login");
//   }, [isAuth, loading]);

//   // Enhanced click outside handler
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && window.innerWidth < 1024) {
//         setSidebarOpen(false);
//       }
//       if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
//         setShowEmojiPicker(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [sidebarOpen, showEmojiPicker]);

//   // Keyboard shortcuts
//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.ctrlKey && e.key === 'k') {
//         e.preventDefault();
//         setSidebarOpen(true);
//         setTimeout(() => {
//           const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
//           searchInput?.focus();
//         }, 300);
//       }
//       if (e.key === 'Escape') {
//         setSidebarOpen(false);
//         setShowEmojiPicker(false);
//       }
//     };

//     document.addEventListener('keydown', handleKeyPress);
//     return () => document.removeEventListener('keydown', handleKeyPress);
//   }, []);

//   // Scroll detection for scroll-to-bottom button
//   useEffect(() => {
//     const handleScroll = () => {
//       if (chatContainerRef.current) {
//         const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
//         const scrollPosition = scrollHeight - scrollTop - clientHeight;
//         setShowScrollToBottom(scrollPosition > 200);
//       }
//     };

//     const chatContainer = chatContainerRef.current;
//     if (chatContainer) {
//       chatContainer.addEventListener('scroll', handleScroll);
//       return () => chatContainer.removeEventListener('scroll', handleScroll);
//     }
//   }, [selectedUser]);

//   // Enhanced search functionality - only for users now
//   const filteredUsers = users?.filter(user =>
//     user._id !== loggedInUser?._id &&
//     user.name.toLowerCase().includes(searchTerm.toLowerCase())
//   ) || [];

//   const reqChat = chats?.find((ch) => ch.user._id === selectedUser);
//   const chatID = reqChat?.chat._id;

//   // Message fetching
//   useEffect(() => {
//     const reqChat = chats?.find((ch) => ch.user._id === selectedUser);
//     const chatID = reqChat?.chat._id;
//     console.log(chats,'chats');
    

//     const getChat = async () => {
//       try {
//         if (!chatID) {
//           setMsgss([]);
//           return;
//         }

//         const token = Cookies.get("token");
//         if (!token) {
//           console.warn("No token found in cookies");
//           setMsgss([]);
//           return;
//         }

//         const res = await axios.get(`${chatt_service}/api/v1/message/${chatID}`, {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         });

//         setMsgss(res.data.messages || []);

//         if (socket && res.data.messages?.length > 0) {
//           socket.emit('markAsSeen', {
//             chatId: chatID,
//             messageIds: res.data.messages.map((m: any) => m._id)
//           });
//         }
//       } catch (err: any) {
//         console.error(err.response?.data || err.message);
//         setMsgss([]);
//       }
//     };

//     getChat();
//   }, [selectedUser, chats, socket]);

//   const [chatss, setchatss] = useState<any[] | null>(null)

//   useEffect(() => {
//     let mounted = true;

//     async function loadChats() {
//       try {
//         const token = Cookies.get("token");
//         const res = await axios.get(`${chatt_service}/api/v1/chat/all`, {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         });
//         // assume server returns { chats: [...] } or directly an array
//         const payload = res.data;
//         const arr = Array.isArray(payload) ? payload : payload?.chats ?? null;

//         if (!mounted) return;
//         setchatss(arr);
//       } catch (err) {
//         console.error("Failed to fetch chats:", err);
//         if (mounted) setchatss(null);
//       }
//     }

//     if (loggedInUser) loadChats();
//     return () => { mounted = false; };
//   }, [loggedInUser, selectedUser]);

//   // Socket listeners
//   useEffect(() => {
//     if (!socket) return;

//     const onNewMessage = (message: any) => {
//       if (!message) return;

//       setMsgss((prev: any) => {
//         if (prev.some((m: any) => m._id === message._id)) return prev;

//         if (message.sender !== loggedInUser?._id && messageSoundRef.current) {
//           messageSoundRef.current.play().catch(() => { });
//         }

//         return [...prev, message];
//       });

//       if (message.sender === selectedUser) setIsTyping(false);
//     };

//     const onIsTyping = (data: { from?: string; chatId?: string }) => {
//       if (!data?.from || !data?.chatId) return;
//       if (data.from === selectedUser && data.chatId === chatID) {
//         setIsTyping(true);
//       }
//     };

//     const onStopTyping = (data: { from?: string; chatId?: string }) => {
//       if (!data?.from || !data?.chatId) return;
//       if (data.from === selectedUser && data.chatId === chatID) {
//         setIsTyping(false);
//       }
//     };

//     const onMessageSeen = (data: { chatId: string; messageIds: string[] }) => {
//       if (data.chatId === chatID) {
//         setMessageSeen(true);
//         setTimeout(() => setMessageSeen(false), 2000);

//         setMsgss((prev: any) =>
//           prev.map((msg: any) =>
//             data.messageIds.includes(msg._id) ? { ...msg, seen: true } : msg
//           )
//         );
//       }
//     };

//     socket.on("newMessage", onNewMessage);
//     socket.on("istyping", onIsTyping);
//     socket.on("stopTyping", onStopTyping);
//     socket.on("messageSeen", onMessageSeen);

//     return () => {
//       socket.off("newMessage", onNewMessage);
//       socket.off("istyping", onIsTyping);
//       socket.off("stopTyping", onStopTyping);
//       socket.off("messageSeen", onMessageSeen);
//     };
//   }, [socket, selectedUser, chatID, loggedInUser]);

//   // Typing indicators
//   useEffect(() => {
//     if (!socket || !selectedUser || !chatID) return;

//     if (!newMessage.trim()) {
//       socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
//       if (typingTimeoutRef.current) {
//         window.clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = null;
//       }
//       return;
//     }

//     socket.emit("typing", { to: selectedUser, chatId: chatID });

//     if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
//     typingTimeoutRef.current = window.setTimeout(() => {
//       socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
//       typingTimeoutRef.current = null;
//     }, TYPING_DEBOUNCE_MS);
//   }, [newMessage, selectedUser, chatID, socket]);

//   // Cleanup
//   useEffect(() => {
//     return () => {
//       if (typingTimeoutRef.current) {
//         window.clearTimeout(typingTimeoutRef.current);
//         typingTimeoutRef.current = null;
//       }
//       if (socket && selectedUser && chatID) {
//         socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
//       }
//     };
//   }, []);

//   // Auto-scroll
//   useEffect(() => {
//     const scrollToBottom = () => {
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({
//           behavior: 'smooth',
//           block: 'end'
//         });
//       }, 150);
//     };
//     scrollToBottom();
//   }, [msgss.length, selectedUser, isTyping]);

//   // Scroll to bottom function
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({
//       behavior: 'smooth',
//       block: 'end'
//     });
//   };

//   // Emoji selection handler
//   const handleEmojiSelect = (emoji: string) => {
//     setNewMessage(prev => prev + emoji);
//     setShowEmojiPicker(false);
//     inputRef.current?.focus();
//   };

//   // Image handling
//   const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Check if file is an image
//       if (!file.type.startsWith('image/')) {
//         alert('Please select an image file');
//         return;
//       }

//       // Check file size (max 5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         alert('Image size should be less than 5MB');
//         return;
//       }

//       setImageFile(file);
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         setSelectedImage(e.target?.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const removeSelectedImage = () => {
//     setSelectedImage(null);
//     setImageFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   async function addUsr(id: string) {
//     try {
//       const token = Cookies.get("token");
//       if (!token) throw new Error("Missing auth token");

//       const res = await axios.post(
//         `${chatt_service}/api/v1/chat/new`,
//         { otherUserId: id },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         }
//       );

//       // return response data so caller can update UI or chat list
//       return res.data;
//     } catch (err) {
//       console.error("Failed to add user:", err);
//       return null;
//     }
//   }

//   // Enhanced message sending with image support
//   const handleSendMessage = async (e: React.FormEvent) => {
//     e.preventDefault();

//     let isUsrExt: any

//     let chatsss = chatss;
//     const isUserExt = chatsss?.find((e) => {
//       return e.user._id === selectedUser
//     })

//     if (!isUsrExt) {
//       addUsr(selectedUser);
//     }

//     if (selectedUser) {

//     }

//     // If we have an image but no text, or we have text, or we have both
//     const shouldSend = (selectedImage && imageFile) || newMessage.trim();

//     if (!shouldSend || !selectedUser || messageSending || imageUploading) return;

//     setMessageSending(true);

//     const tempId = `temp-${Date.now()}`;
//     let messageData: any = {
//       _id: tempId,
//       messageType: "text",
//       sender: loggedInUser?._id || '',
//       chatId: chatID || '',
//       seen: false,
//       createdAt: new Date().toISOString().replace("Z", "+00:00"),
//       isSending: true
//     };

//     // Handle image upload first if there's an image
//     if (selectedImage && imageFile) {
//       setImageUploading(true);
//       try {
//         const token = Cookies.get("token");
//         const formData = new FormData();
//         formData.append('image', imageFile);
//         formData.append('chatId', chatID);
//         console.log("chatid", chatID);

//         const { data } = await axios.post(
//           `${chatt_service}/api/v1/message`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "multipart/form-data",
//             },
//             withCredentials: true,
//           }
//         );
//         console.log(data.message, "data");
//         const MessageFromData = data.message
//         messageData = {
//           ...messageData,
//           MessageFromData
//         };
//       } catch (err: any) {
//         console.error('Image upload failed:', err.response?.data || err.message);
//         setMessageSending(false);
//         setImageUploading(false);
//         return;
//       }
//     } else {
//       // Text message only
//       messageData.text = newMessage.trim();
//     }

//     // Add temporary message to UI
//     setMsgss((prev: any) => [...prev, messageData]);
//     console.log(msgss, 'mgss');

//     const currentMessage = newMessage;
//     const currentImage = selectedImage;
//     setNewMessage('');
//     setSelectedImage(null);
//     setImageFile(null);
//     console.log('imgfile', imageFile);

//     try {
//       if (socket && selectedUser && chatID) {
//         socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
//         if (typingTimeoutRef.current) {
//           window.clearTimeout(typingTimeoutRef.current);
//           typingTimeoutRef.current = null;
//         }
//       }

//       const token = Cookies.get("token");

//       // For image messages, we already uploaded the image, so we just need to create the message
//       // For text messages, we send the normal message
//       let res;
//       if (messageData.messageType === "image") {
//         res = await axios.post(
//           `${chatt_service}/api/v1/message`,
//           {
//             text: messageData.text,
//             chatId: chatID,
//             image: messageData.image,
//             messageType: "image"
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             withCredentials: true,
//           }
//         );
//       } else {
//         res = await axios.post(
//           `${chatt_service}/api/v1/message`,
//           {
//             text: currentMessage,
//             chatId: chatID,
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             withCredentials: true,
//           }
//         );
//       }

//       const savedMessage = res.data?.message || res.data;

//       setMsgss((prev: any) => {
//         const filtered = prev.filter((m: any) => m._id !== tempId && m._id !== savedMessage._id);
//         return [...filtered, { ...savedMessage, animate: true }];
//       });

//       if (socket) {
//         socket.emit('markAsSeen', {
//           chatId: chatID,
//           messageIds: [savedMessage._id]
//         });
//       }
//     } catch (err: any) {
//       console.error(err.response?.data || err.message);
//       setMsgss((prev: any) => prev.filter((msg: any) => msg._id !== tempId));
//       setNewMessage(currentMessage);
//       if (currentImage) {
//         setSelectedImage(currentImage);
//       }
//     } finally {
//       setMessageSending(false);
//       setImageUploading(false);
//     }
//   };

//   // Delete message function
//   const handleDeleteMessage = async (messageId: string) => {
//     try {
//       const token = Cookies.get("token");
//       await axios.delete(`${chatt_service}/api/v1/message/${messageId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//         withCredentials: true,
//       });

//       setMsgss((prev: any) => prev.filter((msg: any) => msg._id !== messageId));
//     } catch (err: any) {
//       console.error(err.response?.data || err.message);
//     }
//   };

//   const formatTime = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     } else {
//       return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//     }
//   };

//   const isUserOnline = (userId: string): boolean => onlineUsers.includes(userId);
//   const selectedUserDetails = users?.find(user => user._id === selectedUser);

//   if (loading) return <Loading />;

//   return (
//     <div className="h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 overflow-hidden relative">
//       {/* Background Elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
//       </div>

//       {/* Mobile Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-200"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Enhanced Sidebar */}
//       <div
//         ref={sidebarRef}
//         className={`
//           fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-lg border-r border-blue-100 shadow-2xl transform transition-all duration-300 ease-out
//           flex flex-col
//           ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//           lg:relative lg:translate-x-0 lg:z-0
//         `}
//       >
//         {/* Enhanced Sidebar Header with Change Name Button */}
//         <div className="flex-shrink-0 p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
//                   {loggedInUser?.name?.[0]?.toUpperCase() || 'U'}
//                 </div>
//                 <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isUserOnline(loggedInUser?._id || '') ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
//               </div>
//               <div>
//                 <h1 className="text-sm font-semibold text-gray-900">
//                   {loggedInUser?.name || 'User'}
//                 </h1>
//                 <p className="text-xs text-gray-500">
//                   {isUserOnline(loggedInUser?._id || '') ? 'Online' : 'Offline'}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               {/* Change Name Button */}
//               <button
//                 onClick={() => router.push('/chat/name')}
//                 className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200 border border-blue-200 hover:border-blue-300"
//                 title="Change Name"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                 </svg>
//               </button>
//               <button
//                 onClick={() => setSidebarOpen(false)}
//                 className="lg:hidden p-2 rounded-lg hover:bg-blue-50 text-gray-600 transition-colors duration-200"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Enhanced Search with Better Functionality */}
//         <div className="flex-shrink-0 p-3 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search users..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-9 pr-8 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 placeholder-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             />
//             <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm('')}
//                 className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-blue-200 text-blue-500 transition-colors duration-200"
//               >
//                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             )}
//           </div>
//           {searchTerm && (
//             <div className="mt-2 text-xs text-blue-600">
//               Found {filteredUsers.length} users
//             </div>
//           )}
//         </div>

//         {/* Enhanced Users List */}
//         <div className="flex-1 overflow-y-auto">
//           <div className="p-2">
//             <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2 px-2">
//               All Users ({filteredUsers.length})
//             </h3>
//             {filteredUsers.length > 0 ? (
//               <div className="space-y-1">
//                 {filteredUsers.map((user, index) => (
//                   <div
//                     key={user._id}
//                     onClick={() => {
//                       setSelectedUser(user._id);
//                       setSidebarOpen(false);
//                     }}
//                     className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 group ${selectedUser === user._id
//                       ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
//                       : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
//                       }`}
//                   >
//                     <div className="relative">
//                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-xs shadow-sm transition-transform duration-200 group-hover:scale-110 ${selectedUser === user._id
//                         ? 'bg-white/20'
//                         : 'bg-gradient-to-r from-blue-400 to-indigo-500'
//                         }`}>
//                         {user.name?.[0]?.toUpperCase() || 'U'}
//                       </div>
//                       <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 ${selectedUser === user._id ? 'border-blue-500' : 'border-white'
//                         } ${isUserOnline(user._id) ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
//                     </div>
//                     <div className="ml-3 flex-1 min-w-0">
//                       <p className={`text-sm font-medium truncate ${selectedUser === user._id ? 'text-white' : 'text-gray-900'
//                         }`}>
//                         {user.name}
//                       </p>
//                       <p className={`text-xs truncate ${selectedUser === user._id ? 'text-blue-100' : 'text-gray-500'
//                         }`}>
//                         {isUserOnline(user._id) ? 'Online' : 'Offline'}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-gray-500">
//                 <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-2xl flex items-center justify-center">
//                   <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                   </svg>
//                 </div>
//                 <p className="text-sm text-blue-600">No users found</p>
//                 <p className="text-xs text-blue-500 mt-1">Try different search terms</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Enhanced Footer */}
//         <div className="flex-shrink-0 p-3 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
//           <button
//             onClick={logoutUser}
//             className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
//           >
//             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//             </svg>
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col min-w-0 relative">
//         {/* Enhanced Mobile Header */}
//         <div className="lg:hidden flex-shrink-0 flex items-center justify-between p-3 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 transition-colors duration-200"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//             {selectedUser && (
//               <div className="flex items-center space-x-2">
//                 <div className="relative">
//                   <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-xs shadow-sm">
//                     {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
//                   </div>
//                   <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${isUserOnline(selectedUser) ? 'bg-emerald-400' : 'bg-gray-400'
//                     }`}></div>
//                 </div>
//                 <div>
//                   <h2 className="text-sm font-medium text-gray-900">
//                     {selectedUserDetails?.name || 'Unknown User'}
//                   </h2>
//                   <p className="text-xs text-gray-600">
//                     {isTyping ? (
//                       <span className="text-blue-600 flex items-center">
//                         <span className="flex space-x-0.5 ml-1">
//                           <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
//                           <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-150"></span>
//                           <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-300"></span>
//                         </span>
//                         Typing...
//                       </span>
//                     ) : (
//                       <span className={isUserOnline(selectedUser) ? 'text-emerald-600' : 'text-gray-500'}>
//                         {isUserOnline(selectedUser) ? 'Online' : 'Offline'}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Enhanced Desktop Header */}
//         {selectedUser && (
//           <div className="hidden lg:flex flex-shrink-0 flex items-center justify-between p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow duration-300">
//                   {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
//                 </div>
//                 <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isUserOnline(selectedUser) ? 'bg-emerald-400' : 'bg-gray-400'
//                   }`}></div>
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold text-gray-900">
//                   {selectedUserDetails?.name || 'Unknown User'}
//                 </h2>
//                 <p className="text-xs text-gray-600">
//                   {isTyping ? (
//                     <span className="text-blue-600 flex items-center">
//                       <span className="flex space-x-0.5 ml-1">
//                         <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
//                         <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-150"></span>
//                         <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-300"></span>
//                       </span>
//                       Typing...
//                     </span>
//                   ) : (
//                     <span className={isUserOnline(selectedUser) ? 'text-emerald-600' : 'text-gray-500'}>
//                       {isUserOnline(selectedUser) ? 'Online' : 'Offline'}
//                       {messageSeen && isUserOnline(selectedUser) && (
//                         <span className="ml-1 text-blue-500">• Seen</span>
//                       )}
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 transition-colors duration-200">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}

//         {!selectedUser ? (
//           <div className="flex-1 flex flex-col items-center justify-center bg-transparent p-6">
//             <div className="text-center max-w-sm">
//               <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-blue-200 shadow-lg flex items-center justify-center">
//                 <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                 </svg>
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                 Welcome to Messages
//               </h3>
//               <p className="text-gray-600 text-sm mb-6 leading-relaxed">
//                 Select a user from the sidebar to start chatting.
//               </p>
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg hover:shadow-xl"
//               >
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//                 Open Users
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Enhanced Messages Area with Image Support */}
//             <div
//               ref={chatContainerRef}
//               className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-indigo-50 space-y-3 relative"
//               style={{ overflowX: 'hidden' }}
//             >
//               {/* Scroll to Bottom Button */}
//               {showScrollToBottom && (
//                 <button
//                   onClick={scrollToBottom}
//                   className="absolute right-4 bottom-4 z-10 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//                   </svg>
//                 </button>
//               )}

//               {msgss.length > 0 ? (
//                 msgss.map((message: any, index: number) => (
//                   <div
//                     key={message._id}
//                     className={`flex mb-3 group ${message.sender === loggedInUser?._id
//                       ? 'justify-end'
//                       : 'justify-start'
//                       }`}
//                   >
//                     <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl transition-all duration-200 relative break-words ${message.sender === loggedInUser?._id
//                       ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
//                       : 'bg-white text-gray-900 border border-blue-200 shadow-lg'
//                       } ${message.isSending ? 'opacity-70' : ''}`}>

//                       {/* Image Message */}
//                       {message.messageType === "image" && message.image && (
//                         <div className="mb-2">
//                           <img
//                             src={message.image.url}
//                             alt="Shared content"
//                             className="max-w-full rounded-lg max-h-64 object-cover"
//                           />
//                         </div>
//                       )}

//                       {/* Text Content */}
//                       {message.text && (
//                         <p className="text-sm leading-relaxed">{message.text}</p>
//                       )}

//                       <div className={`flex items-center justify-end mt-1 text-xs ${message.sender === loggedInUser?._id ? 'text-blue-100' : 'text-gray-500'
//                         }`}>
//                         <span>{formatTime(message.createdAt)}</span>
//                         {message.sender === loggedInUser?._id && (
//                           <span className="ml-1.5">
//                             {message.seen ? '✓✓' : '✓'}
//                           </span>
//                         )}
//                       </div>

//                       {/* Message Actions */}
//                       {message.sender === loggedInUser?._id && (
//                         <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                           <button
//                             onClick={() => handleDeleteMessage(message._id)}
//                             className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
//                             title="Delete message"
//                           >
//                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="flex items-center justify-center h-full text-gray-500">
//                   <div className="text-center">
//                     <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white border border-blue-200 shadow-lg flex items-center justify-center">
//                       <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                       </svg>
//                     </div>
//                     <p className="text-sm text-blue-600">No messages yet. Start a conversation!</p>
//                   </div>
//                 </div>
//               )}
//               {isTyping && (
//                 <div className="flex justify-start mb-3">
//                   <div className="px-3 py-2 rounded-2xl bg-white border border-blue-200 shadow-lg">
//                     <div className="flex space-x-1">
//                       <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
//                       <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce animation-delay-150"></div>
//                       <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce animation-delay-300"></div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Image Preview */}
//             {selectedImage && (
//               <div className="flex-shrink-0 p-4 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
//                 <div className="relative inline-block">
//                   <img
//                     src={selectedImage}
//                     alt="Preview"
//                     className="max-w-xs rounded-lg shadow-lg max-h-48 object-cover"
//                   />
//                   <button
//                     onClick={removeSelectedImage}
//                     className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
//                   >
//                     ✕
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Enhanced Message Input with Image Upload */}
//             <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-blue-100 bg-white/80 backdrop-blur-sm relative">
//               {/* Hidden file input */}
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 className="hidden"
//                 accept="image/*"
//                 onChange={handleImageSelect}
//               />

//               {/* Emoji Picker */}
//               {showEmojiPicker && (
//                 <div
//                   ref={emojiPickerRef}
//                   className="absolute bottom-full left-0 mb-2 w-full max-w-sm bg-white border border-blue-200 rounded-2xl shadow-2xl z-50 p-3 max-h-60 overflow-y-auto"
//                   style={{ overflowX: 'hidden' }}
//                 >
//                   <div className="grid grid-cols-8 gap-1">
//                     {EMOJIS.map((emoji, index) => (
//                       <button
//                         key={index}
//                         type="button"
//                         onClick={() => handleEmojiSelect(emoji)}
//                         className="p-2 rounded-lg hover:bg-blue-50 text-lg transition-colors duration-150 hover:scale-110"
//                       >
//                         {emoji}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex items-center space-x-2">
//                 {/* Emoji Button */}
//                 <button
//                   type="button"
//                   onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//                   className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </button>

//                 {/* Image Upload Button */}
//                 <button
//                   type="button"
//                   onClick={() => fileInputRef.current?.click()}
//                   className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200"
//                   disabled={imageUploading}
//                 >
//                   {imageUploading ? (
//                     <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
//                   ) : (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                   )}
//                 </button>

//                 {/* Message Input */}
//                 <div className="flex-1 relative">
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
//                     className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 placeholder-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     style={{ overflowX: 'hidden' }}
//                   />
//                 </div>

//                 {/* Send Button */}
//                 <button
//                   type="submit"
//                   disabled={(!newMessage.trim() && !selectedImage) || messageSending || imageUploading}
//                   className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
//                 >
//                   {messageSending || imageUploading ? (
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                   ) : (
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//             </form>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatPage;










"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useAppData, User, Chats, Message } from '@/context/AppContext';
import { redirect, useRouter } from 'next/navigation';
import Loading from '@/Components/loading';
import { SocketData } from '@/context/socketContext';
import Cookies from 'js-cookie';
import axios from 'axios';
import { chatt_service } from '../../../url';

// Emoji data - you can replace this with a proper emoji picker library
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
  '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣',
  '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
  '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️',
  '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎',
  '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️'
];

const TYPING_DEBOUNCE_MS = 1000;

const ChatPage = () => {
  const { isAuth, loading, logoutUser, chats, user: loggedInUser, users, fetchChats, fetchUsers } = useAppData();
  const { onlineUsers, socket, joinChat, leaveChat } = SocketData();
  const router = useRouter();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  const [messageSeen, setMessageSeen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevChatsLenRef = useRef<number>(chats?.length || 0);
  const typingTimeoutRef = useRef<number | null>(null);
  const lastSelectedChatRef = useRef<string | null>(null);
  const messageSoundRef = useRef<HTMLAudioElement | null>(null);

  const [msgss, setMsgss] = useState<any>([]);

  // Initialize message sound
  useEffect(() => {
    messageSoundRef.current = new Audio('/sounds/message-tone.mp3');
    messageSoundRef.current.volume = 0.3;
  }, []);

  useEffect(() => {
    if (!isAuth && !loading) redirect("/login");
  }, [isAuth, loading]);

  // Enhanced click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, showEmojiPicker]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        setTimeout(() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
        }, 300);
      }
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Scroll detection for scroll-to-bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const scrollPosition = scrollHeight - scrollTop - clientHeight;
        setShowScrollToBottom(scrollPosition > 200);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [selectedUser]);

  // Enhanced search functionality
  const filteredUsers = users?.filter(user =>
    user._id !== loggedInUser?._id &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredChats = chats?.filter(chat =>
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.chat.latestMessage?.text?.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const reqChat = chats?.find((ch) => ch.user._id === selectedUser);
  const chatID = reqChat?.chat._id;

  // Message fetching
  useEffect(() => {
    const reqChat = chats?.find((ch) => ch.user._id === selectedUser);
    const chatID = reqChat?.chat._id;
    console.log(chats,'');
    

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

 
        const res = await axios.get(`${chatt_service}/api/v1/message/${chatID}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });


        setMsgss(res.data.messages || []);

        if (socket && res.data.messages?.length > 0) {
          socket.emit('markAsSeen', {
            chatId: chatID,
            messageIds: res.data.messages.map((m: any) => m._id)
          });
        }
      } catch (err: any) {
        console.error(err.response?.data || err.message);
        setMsgss([]);
      }
    };

    getChat();
  }, [selectedUser, chats, socket]);

  const [chatss, setchatss] = useState<any[] | null>(null)

  useEffect(() => {
    let mounted = true;

    async function loadChats() {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${chatt_service}/api/v1/chat/all`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        // assume server returns { chats: [...] } or directly an array
        const payload = res.data;
        const arr = Array.isArray(payload) ? payload : payload?.chats ?? null;

        if (!mounted) return;
        setchatss(arr);
      } catch (err) {
        console.error("Failed to fetch chats:", err);
        if (mounted) setchatss(null);
      }
    }

    if (loggedInUser) loadChats();
    return () => { mounted = false; };
  }, [loggedInUser, selectedUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (message: any) => {
      if (!message) return;

      setMsgss((prev: any) => {
        if (prev.some((m: any) => m._id === message._id)) return prev;

        if (message.sender !== loggedInUser?._id && messageSoundRef.current) {
          messageSoundRef.current.play().catch(() => { });
        }

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

    const onMessageSeen = (data: { chatId: string; messageIds: string[] }) => {
      if (data.chatId === chatID) {
        setMessageSeen(true);
        setTimeout(() => setMessageSeen(false), 2000);

        setMsgss((prev: any) =>
          prev.map((msg: any) =>
            data.messageIds.includes(msg._id) ? { ...msg, seen: true } : msg
          )
        );
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("istyping", onIsTyping);
    socket.on("stopTyping", onStopTyping);
    socket.on("messageSeen", onMessageSeen);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("istyping", onIsTyping);
      socket.off("stopTyping", onStopTyping);
      socket.off("messageSeen", onMessageSeen);
    };
  }, [socket, selectedUser, chatID, loggedInUser]);

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

  // Cleanup
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
      }, 150);
    };
    scrollToBottom();
  }, [msgss.length, selectedUser, isTyping]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  // Emoji selection handler
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Image handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  async function addUsr(id: string) {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Missing auth token");

      const res = await axios.post(
        `${chatt_service}/api/v1/chat/new`,
        { otherUserId: id },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // return response data so caller can update UI or chat list
      return res.data;
    } catch (err) {
      console.error("Failed to add user:", err);
      return null;
    }
  }

  // Enhanced message sending with image support
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    let isUsrExt: any

    let chatsss = chatss;
    const isUserExt = chatsss?.find((e) => {

      return e.user._id === selectedUser
    })


    if (!isUsrExt) {
      addUsr(selectedUser);

    }

    if (selectedUser) {

    }

    // If we have an image but no text, or we have text, or we have both
    const shouldSend = (selectedImage && imageFile) || newMessage.trim();

    if (!shouldSend || !selectedUser || messageSending || imageUploading) return;

    setMessageSending(true);

    const tempId = `temp-${Date.now()}`;
    let messageData: any = {
      _id: tempId,
      messageType: "text",
      sender: loggedInUser?._id || '',
      chatId: chatID || '',
      seen: false,
      createdAt: new Date().toISOString().replace("Z", "+00:00"),
      isSending: true
    };

    // Handle image upload first if there's an image
    if (selectedImage && imageFile) {
      setImageUploading(true);
      try {
        const token = Cookies.get("token");
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('chatId', chatID);
        console.log("chatid", chatID);


        const { data } = await axios.post(
          `${chatt_service}/api/v1/message`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        console.log(data.message, "data");
        const MessageFromData = data.message
        messageData = {
          ...messageData,
          MessageFromData
        };
      } catch (err: any) {
        console.error('Image upload failed:', err.response?.data || err.message);
        setMessageSending(false);
        setImageUploading(false);
        return;
      }
    } else {
      // Text message only
      messageData.text = newMessage.trim();
    }

    // Add temporary message to UI
    setMsgss((prev: any) => [...prev, messageData]);
    console.log(msgss, 'mgss');


    const currentMessage = newMessage;
    const currentImage = selectedImage;
    setNewMessage('');
    setSelectedImage(null);
    setImageFile(null);
    console.log('imgfile', imageFile);


    try {
      if (socket && selectedUser && chatID) {
        socket.emit("stopTyping", { to: selectedUser, chatId: chatID });
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }

      const token = Cookies.get("token");

      // For image messages, we already uploaded the image, so we just need to create the message
      // For text messages, we send the normal message
      let res;
      if (messageData.messageType === "image") {
        res = await axios.post(
          `${chatt_service}/api/v1/message`,
          {
            text: messageData.text,
            chatId: chatID,
            image: messageData.image,
            messageType: "image"
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      } else {
        res = await axios.post(
          `${chatt_service}/api/v1/message`,
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
      }

      const savedMessage = res.data?.message || res.data;

      setMsgss((prev: any) => {
        const filtered = prev.filter((m: any) => m._id !== tempId && m._id !== savedMessage._id);
        return [...filtered, { ...savedMessage, animate: true }];
      });

      if (socket) {
        socket.emit('markAsSeen', {
          chatId: chatID,
          messageIds: [savedMessage._id]
        });
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setMsgss((prev: any) => prev.filter((msg: any) => msg._id !== tempId));
      setNewMessage(currentMessage);
      if (currentImage) {
        setSelectedImage(currentImage);
      }
    } finally {
      setMessageSending(false);
      setImageUploading(false);
    }
  };

  // Delete message function
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${chatt_service}/api/v1/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setMsgss((prev: any) => prev.filter((msg: any) => msg._id !== messageId));
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessagePreview = (chat: Chats) => {
    if (!chat.chat.latestMessage) return "No messages yet";

    if (chat.chat.latestMessage.messageType === "image") {
      return "📷 Image";
    }

    if (!chat.chat.latestMessage.text) return "No messages yet";

    const message = chat.chat.latestMessage.text;
    return message.length > 25 ? message.substring(0, 25) + '...' : message;
  };

  const getUnseenCount = (chat: Chats): number => chat.chat.unseenCount || 0;
  const isUserOnline = (userId: string): boolean => onlineUsers.includes(userId);
  const selectedUserDetails = users?.find(user => user._id === selectedUser);

  if (loading) return <Loading />;

  return (
    <div className="h-screen flex bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-all duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-lg border-r border-blue-100 shadow-2xl transform transition-all duration-300 ease-out
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-0
        `}
      >
        {/* Enhanced Sidebar Header with Change Name Button */}
        <div className="flex-shrink-0 p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {loggedInUser?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isUserOnline(loggedInUser?._id || '') ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  {loggedInUser?.name || 'User'}
                </h1>
                <p className="text-xs text-gray-500">
                  {isUserOnline(loggedInUser?._id || '') ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Change Name Button */}
              <button
                onClick={() => router.push('/chat/name')}
                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200 border border-blue-200 hover:border-blue-300"
                title="Change Name"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-blue-50 text-gray-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Toggle Buttons */}
        <div className="flex-shrink-0 p-3 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="flex bg-blue-50 rounded-lg p-1">
            <button
              onClick={() => setShowAllUsers(false)}
              className={`flex-1 py-2 px-3 text-center text-xs font-medium transition-all duration-200 rounded-md ${!showAllUsers
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                : 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'
                }`}
            >
              Chats
            </button>
            <button
              onClick={() => setShowAllUsers(true)}
              className={`flex-1 py-2 px-3 text-center text-xs font-medium transition-all duration-200 rounded-md ${showAllUsers
                ? 'bg-white text-blue-600 shadow-sm border border-blue-200'
                : 'text-blue-700 hover:text-blue-800 hover:bg-blue-100'
                }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Enhanced Search with Better Functionality */}
        <div className="flex-shrink-0 p-3 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search in ${showAllUsers ? 'users' : 'chats and messages'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 placeholder-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-blue-200 text-blue-500 transition-colors duration-200"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-xs text-blue-600">
              Found {showAllUsers ? filteredUsers.length : filteredChats.length} {showAllUsers ? 'users' : 'chats'}
            </div>
          )}
        </div>

        {/* Enhanced Users/Chats List */}
        <div className="flex-1 overflow-y-auto">
          {showAllUsers ? (
            <div className="p-2">
              <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2 px-2">
                All Users ({filteredUsers.length})
              </h3>
              {filteredUsers.length > 0 ? (
                <div className="space-y-1">
                  {filteredUsers.map((user, index) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user._id);
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 group ${selectedUser === user._id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                        }`}
                    >
                      <div className="relative">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-xs shadow-sm transition-transform duration-200 group-hover:scale-110 ${selectedUser === user._id
                          ? 'bg-white/20'
                          : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                          }`}>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 ${selectedUser === user._id ? 'border-blue-500' : 'border-white'
                          } ${isUserOnline(user._id) ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selectedUser === user._id ? 'text-white' : 'text-gray-900'
                          }`}>
                          {user.name}
                        </p>
                        <p className={`text-xs truncate ${selectedUser === user._id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                          {isUserOnline(user._id) ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-blue-600">No users found</p>
                  <p className="text-xs text-blue-500 mt-1">Try different search terms</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <h3 className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2 px-2">
                Recent Chats ({filteredChats.length})
              </h3>
              {filteredChats.length > 0 ? (
                <div className="space-y-1">
                  {filteredChats.map((chatItem, index) => {
                    const otherUser = chatItem.user;
                    const unseenCount = getUnseenCount(chatItem);
                    return (
                      <div
                        id={`chat-item-${otherUser._id}`}
                        key={index}
                        onClick={() => {
                          setSelectedUser(otherUser._id);
                          setSidebarOpen(false);
                        }}
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 group ${selectedUser === otherUser._id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'hover:bg-blue-50 border border-transparent hover:border-blue-200'
                          }`}
                      >
                        <div className="relative">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-xs shadow-sm transition-transform duration-200 group-hover:scale-110 ${selectedUser === otherUser._id
                            ? 'bg-white/20'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            }`}>
                            {otherUser.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 ${selectedUser === otherUser._id ? 'border-blue-500' : 'border-white'
                            } ${isUserOnline(otherUser._id) ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
                          {unseenCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg animate-pulse">
                              {unseenCount}
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className={`text-sm font-medium truncate ${selectedUser === otherUser._id ? 'text-white' : 'text-gray-900'
                              }`}>
                              {otherUser.name}
                            </p>
                            <span className={`text-xs whitespace-nowrap ml-2 ${selectedUser === otherUser._id ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                              {formatTime(chatItem.chat.updatedAt)}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${selectedUser === otherUser._id ? 'text-blue-100' : 'text-gray-600'
                            }`}>
                            {getLastMessagePreview(chatItem)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-blue-600">No chats found</p>
                  <p className="text-xs text-blue-500 mt-1">Try different search terms</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="flex-shrink-0 p-3 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
          <button
            onClick={logoutUser}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Enhanced Mobile Header */}
        <div className="lg:hidden flex-shrink-0 flex items-center justify-between p-3 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {selectedUser && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-xs shadow-sm">
                    {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${isUserOnline(selectedUser) ? 'bg-emerald-400' : 'bg-gray-400'
                    }`}></div>
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-900">
                    {selectedUserDetails?.name || 'Unknown User'}
                  </h2>
                  <p className="text-xs text-gray-600">
                    {isTyping ? (
                      <span className="text-blue-600 flex items-center">
                        <span className="flex space-x-0.5 ml-1">
                          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
                          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-150"></span>
                          <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-300"></span>
                        </span>
                        Typing...
                      </span>
                    ) : (
                      <span className={isUserOnline(selectedUser) ? 'text-emerald-600' : 'text-gray-500'}>
                        {isUserOnline(selectedUser) ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Desktop Header */}
        {selectedUser && (
          <div className="hidden lg:flex flex-shrink-0 flex items-center justify-between p-4 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:shadow-md transition-shadow duration-300">
                  {selectedUserDetails?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isUserOnline(selectedUser) ? 'bg-emerald-400' : 'bg-gray-400'
                  }`}></div>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {selectedUserDetails?.name || 'Unknown User'}
                </h2>
                <p className="text-xs text-gray-600">
                  {isTyping ? (
                    <span className="text-blue-600 flex items-center">
                      <span className="flex space-x-0.5 ml-1">
                        <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-150"></span>
                        <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce animation-delay-300"></span>
                      </span>
                      Typing...
                    </span>
                  ) : (
                    <span className={isUserOnline(selectedUser) ? 'text-emerald-600' : 'text-gray-500'}>
                      {isUserOnline(selectedUser) ? 'Online' : 'Offline'}
                      {messageSeen && isUserOnline(selectedUser) && (
                        <span className="ml-1 text-blue-500">• Seen</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-600 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {!selectedUser ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-transparent p-6">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white border border-blue-200 shadow-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Select a conversation from the sidebar to start chatting.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg hover:shadow-xl"
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
            {/* Enhanced Messages Area with Image Support */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-indigo-50 space-y-3 relative"
              style={{ overflowX: 'hidden' }}
            >
              {/* Scroll to Bottom Button */}
              {showScrollToBottom && (
                <button
                  onClick={scrollToBottom}
                  className="absolute right-4 bottom-4 z-10 p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              )}

              {msgss.length > 0 ? (
                msgss.map((message: any, index: number) => (
                  <div
                    key={message._id}
                    className={`flex mb-3 group ${message.sender === loggedInUser?._id
                      ? 'justify-end'
                      : 'justify-start'
                      }`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl transition-all duration-200 relative break-words ${message.sender === loggedInUser?._id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-900 border border-blue-200 shadow-lg'
                      } ${message.isSending ? 'opacity-70' : ''}`}>

                      {/* Image Message */}
                      {message.messageType === "image" && message.image && (
                        <div className="mb-2">
                          <img
                            src={message.image.url}
                            alt="Shared content"
                            className="max-w-full rounded-lg max-h-64 object-cover"
                          />
                        </div>
                      )}

                      {/* Text Content */}
                      {message.text && (
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      )}

                      <div className={`flex items-center justify-end mt-1 text-xs ${message.sender === loggedInUser?._id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        <span>{formatTime(message.createdAt)}</span>
                        {message.sender === loggedInUser?._id && (
                          <span className="ml-1.5">
                            {message.seen ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>

                      {/* Message Actions */}
                      {message.sender === loggedInUser?._id && (
                        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                            title="Delete message"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white border border-blue-200 shadow-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-blue-600">No messages yet. Start a conversation!</p>
                  </div>
                </div>
              )}
              {isTyping && (
                <div className="flex justify-start mb-3">
                  <div className="px-3 py-2 rounded-2xl bg-white border border-blue-200 shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce animation-delay-150"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce animation-delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div className="flex-shrink-0 p-4 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
                <div className="relative inline-block">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-xs rounded-lg shadow-lg max-h-48 object-cover"
                  />
                  <button
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Message Input with Image Upload */}
            <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-blue-100 bg-white/80 backdrop-blur-sm relative">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full left-0 mb-2 w-full max-w-sm bg-white border border-blue-200 rounded-2xl shadow-2xl z-50 p-3 max-h-60 overflow-y-auto"
                  style={{ overflowX: 'hidden' }}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJIS.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="p-2 rounded-lg hover:bg-blue-50 text-lg transition-colors duration-150 hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                {/* Emoji Button */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Image Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200"
                  disabled={imageUploading}
                >
                  {imageUploading ? (
                    <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                {/* Message Input */}
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 placeholder-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    style={{ overflowX: 'hidden' }}
                  />
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedImage) || messageSending || imageUploading}
                  className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                >
                  {messageSending || imageUploading ? (
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