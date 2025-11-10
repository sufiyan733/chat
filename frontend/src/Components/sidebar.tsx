// "use client"

// import React, { useState, useEffect } from 'react';
// import { User, Chats } from "@/context/AppContext";

// interface ChatSidebarProps {
//     sidebarOpen: boolean;
//     setSidebarOpen: (open: boolean) => void;
//     showAllUsers: boolean;
//     setShowAllUsers: (show: boolean | ((prev: boolean) => boolean)) => void;
//     users: User[] | null;
//     chats: Chats[] | null;
//     selectedUser: string | null;
//     setSelectedUser: (userId: string | null) => void;
//     loggedInUser: User | null;
//     handleLogout: () => void;
//     fetchChats: () => Promise<void>;
//     fetchUsers: () => Promise<void>;
// }

// const Sidebar = ({
//     sidebarOpen,
//     setSidebarOpen,
//     showAllUsers,
//     setShowAllUsers,
//     users,
//     chats,
//     selectedUser,
//     setSelectedUser,
//     loggedInUser,
//     handleLogout,
//     fetchChats,
//     fetchUsers
// }: ChatSidebarProps) => {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
//     const [filteredChats, setFilteredChats] = useState<Chats[]>([]);

//     // Filter users and chats based on search term
//     useEffect(() => {
//         if (users) {
//             const filtered = users.filter(user => 
//                 user._id !== loggedInUser?._id &&
//                 user.name.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//             setFilteredUsers(filtered);
//         }
//     }, [users, searchTerm, loggedInUser]);

//     useEffect(() => {
//         if (chats) {
//             const filtered = chats.filter(chat =>
//                 chat.user.name.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//             setFilteredChats(filtered);
//         }
//     }, [chats, searchTerm]);

//     // Format timestamp for chat list
//     const formatTime = (timestamp: string) => {
//         try {
//             const date = new Date(timestamp);
//             const now = new Date();
//             const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            
//             if (diffInHours < 24) {
//                 return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//             } else if (diffInHours < 168) {
//                 return date.toLocaleDateString([], { weekday: 'short' });
//             } else {
//                 return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
//             }
//         } catch (error) {
//             return '';
//         }
//     };

//     // Get last message preview - FIXED: Handle undefined latestMessage
//     const getLastMessagePreview = (chat: Chats) => {
//         if (!chat.chat.latestMessage || !chat.chat.latestMessage.text) {
//             return "No messages yet";
//         }
        
//         const message = chat.chat.latestMessage.text;
//         return message && message.length > 30 ? message.substring(0, 30) + '...' : message;
//     };

//     // Get unseen count safely
//     const getUnseenCount = (chat: Chats): number => {
//         return chat.chat.unseenCount || 0;
//     };

//     // Refresh data
//     const handleRefresh = () => {
//         fetchChats();
//         fetchUsers();
//     };

//     return (
//         <>
//             {/* Mobile overlay */}
//             {sidebarOpen && (
//                 <div 
//                     className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//                     onClick={() => setSidebarOpen(false)}
//                 />
//             )}

//             {/* Sidebar - Completely fixed and independent */}
//             <div className={`
//                 fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out
//                 flex flex-col
//                 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//                 lg:translate-x-0 lg:static lg:h-screen
//             `}>
//                 {/* Header with User Info - Fixed height */}
//                 <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
//                     <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
//                             {loggedInUser?.name?.[0]?.toUpperCase() || 'U'}
//                         </div>
//                         <div>
//                             <h1 className="text-lg font-bold text-gray-800 dark:text-white">
//                                 {loggedInUser?.name || 'User'}
//                             </h1>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                                 {loggedInUser?.email}
//                             </p>
//                         </div>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                         <button
//                             onClick={handleRefresh}
//                             className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//                             title="Refresh"
//                         >
//                             <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                             </svg>
//                         </button>
//                         <button
//                             onClick={() => setSidebarOpen(false)}
//                             className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
//                         >
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Toggle Buttons - Fixed height */}
//                 <div className="flex-shrink-0 flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//                     <button
//                         onClick={() => setShowAllUsers(false)}
//                         className={`flex-1 py-4 px-4 text-center font-medium transition-colors relative ${
//                             !showAllUsers 
//                                 ? 'text-blue-600 dark:text-blue-400' 
//                                 : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
//                         }`}
//                     >
//                         Chats
//                         {!showAllUsers && (
//                             <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"></div>
//                         )}
//                     </button>
//                     <button
//                         onClick={() => setShowAllUsers(true)}
//                         className={`flex-1 py-4 px-4 text-center font-medium transition-colors relative ${
//                             showAllUsers 
//                                 ? 'text-blue-600 dark:text-blue-400' 
//                                 : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
//                         }`}
//                     >
//                         Users
//                         {showAllUsers && (
//                             <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-blue-500 rounded-full"></div>
//                         )}
//                     </button>
//                 </div>

//                 {/* Search Bar - Fixed height */}
//                 <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//                     <div className="relative">
//                         <input
//                             type="text"
//                             placeholder={`Search ${showAllUsers ? 'users' : 'chats'}...`}
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                         />
//                         <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                         </svg>
//                         {searchTerm && (
//                             <button
//                                 onClick={() => setSearchTerm("")}
//                                 className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 hover:text-gray-600"
//                             >
//                                 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         )}
//                     </div>
//                 </div>

//                 {/* Users/Chats List - Independent scrollable area */}
//                 <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800">
//                     {showAllUsers ? (
//                         // All Users List
//                         <div className="p-3">
//                             <div className="flex items-center justify-between mb-2 px-2">
//                                 <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                                     All Users ({filteredUsers.length})
//                                 </h3>
//                             </div>
                            
//                             {filteredUsers.map((user) => (
//                                 <div
//                                     key={user._id}
//                                     onClick={() => {
//                                         setSelectedUser(user._id);
//                                         setSidebarOpen(false);
//                                     }}
//                                     className={`flex items-center p-3 rounded-xl cursor-pointer transition-all mb-2 ${
//                                         selectedUser === user._id
//                                             ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
//                                             : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
//                                     }`}
//                                 >
//                                     <div className="relative">
//                                         <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
//                                             {user.name?.[0]?.toUpperCase() || 'U'}
//                                         </div>
//                                         <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"></div>
//                                     </div>
//                                     <div className="ml-4 flex-1 min-w-0">
//                                         <p className="font-semibold text-gray-900 dark:text-white truncate">
//                                             {user.name}
//                                         </p>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
//                                             {user.email}
//                                         </p>
//                                     </div>
//                                     <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
//                                 </div>
//                             ))}
                            
//                             {filteredUsers.length === 0 && (
//                                 <div className="text-center py-8">
//                                     <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
//                                         <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                         </svg>
//                                     </div>
//                                     <p className="text-gray-500 dark:text-gray-400 font-medium">
//                                         {searchTerm ? 'No users found' : 'No users available'}
//                                     </p>
//                                     <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
//                                         {searchTerm ? 'Try adjusting your search' : 'Start chatting with people'}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     ) : (
//                         // Chats List
//                         <div className="p-3">
//                             <div className="flex items-center justify-between mb-2 px-2">
//                                 <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
//                                     Recent Chats ({filteredChats.length})
//                                 </h3>
//                             </div>
                            
//                             {filteredChats.map((chatItem) => {
//                                 const otherUser = chatItem.user;
//                                 const unseenCount = getUnseenCount(chatItem);
                                
//                                 return (
//                                     <div
//                                         key={chatItem._id}
//                                         onClick={() => {
//                                             setSelectedUser(otherUser._id);
//                                             setSidebarOpen(false);
//                                         }}
//                                         className={`flex items-center p-3 rounded-xl cursor-pointer transition-all mb-2 ${
//                                             selectedUser === otherUser._id
//                                                 ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
//                                                 : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
//                                         }`}
//                                     >
//                                         <div className="relative">
//                                             <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
//                                                 {otherUser.name?.[0]?.toUpperCase() || 'U'}
//                                             </div>
//                                             {unseenCount > 0 && (
//                                                 <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-sm">
//                                                     {unseenCount}
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="ml-4 flex-1 min-w-0">
//                                             <div className="flex justify-between items-start mb-1">
//                                                 <p className="font-semibold text-gray-900 dark:text-white truncate">
//                                                     {otherUser.name}
//                                                 </p>
//                                                 <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
//                                                     {formatTime(chatItem.chat.updatedAt)}
//                                                 </span>
//                                             </div>
//                                             <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
//                                                 {getLastMessagePreview(chatItem)}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
                            
//                             {filteredChats.length === 0 && (
//                                 <div className="text-center py-8">
//                                     <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
//                                         <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                                         </svg>
//                                     </div>
//                                     <p className="text-gray-500 dark:text-gray-400 font-medium">
//                                         {searchTerm ? 'No chats found' : 'No conversations yet'}
//                                     </p>
//                                     <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
//                                         {searchTerm ? 'Try adjusting your search' : 'Start a new conversation'}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer with Logout - Fixed height */}
//                 <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//                     <div className="flex items-center justify-between">
//                         <button
//                             onClick={handleRefresh}
//                             className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
//                         >
//                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                             </svg>
//                             Refresh
//                         </button>
//                         <button
//                             onClick={handleLogout}
//                             className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
//                         >
//                             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                             </svg>
//                             Logout
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Sidebar;