// "use client"

// import { createContext, ReactNode, useContext, useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import axios from "axios";
// import { chatt_service, userr_service } from "../../url";




// export interface User {
//     _id: string;
//     name: string;
//     email: string;
// }

// export interface Message {
//     _id: string;
//     chatId: string;
//     sender: string;
//     text?: string;
//     image?: {
//         url: string;
//         publicId: string;
//     };
//     messageType: "text" | "image";
//     seen: boolean;
//     seenAt?: string;
//     createdAt: string;
// }

// export interface Chat {
//     _id: string;
//     users: string[];
//     latestMessage: {
//         text: string;
//         sender: string;
//     };
//     createdAt: string;
//     updatedAt: string;
//     unseenCount?: number;
// }

// export interface Chats {
//     _id: string;
//     user: User;
//     chat: Chat;
// }

// interface ToastState {
//     show: boolean;
//     message: string;
//     type: 'success' | 'error' | 'warning' | 'info';
// }

// interface AppContextType {
//     user: User | null;
//     loading: boolean;
//     isAuth: boolean;
//     setUser: React.Dispatch<React.SetStateAction<User | null>>;
//     setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
//     logoutUser: () => Promise<void>;
//     fetchUsers: () => Promise<void>;
//     fetchChats: () => Promise<void>;
//     chats: Chats[] | null;
//     users: User[] | null;
//     setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
//     toast: ToastState;
//     showToast: (message: string, type?: ToastState['type']) => void;
//     hideToast: () => void;
// }

// const AppContext = createContext<AppContextType | undefined>(undefined);

// interface AppProviderProps {
//     children: ReactNode;
// }

// export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
//     const [user, setUser] = useState<User | null>(null);
//     const [isAuth, setIsAuth] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [toast, setToast] = useState<ToastState>({ 
//         show: false, 
//         message: '', 
//         type: 'success' 
//     });

//     const showToast = (message: string, type: ToastState['type'] = 'success') => {
//         setToast({ show: true, message, type });
        
//         // Auto hide after 3 seconds
//         setTimeout(() => {
//             hideToast();
//         }, 3000);
//     };

//     const hideToast = () => {
//         setToast(prev => ({ ...prev, show: false }));
//     };

//     async function fetchUser() {
//         try {
//             const token = Cookies.get("token");

//             const { data } = await axios.get(`${userr_service}/api/v1/me`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });

//             setUser(data);
//             setIsAuth(true);
//             setLoading(false);
//         } catch (error) {
//             console.log(error);
//             setLoading(false);
//         }
//     }

//     async function logoutUser() {
//         Cookies.remove("token");
//         setUser(null);
//         setIsAuth(false);
        
//         // Show premium toast instead of alert
//         showToast("Logged out successfully", "success");
//     }

//     const [chats, setChats] = useState<Chats[] | null>(null);

//     async function fetchChats() {
//         const token = Cookies.get("token");

//         try {
//             const { data } = await axios.get(`${chatt_service}/api/v1/chat/all`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });

//             setChats(data.chats);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     const [users, setUsers] = useState<User[] | null>(null);

//     async function fetchUsers() {
//         const token = Cookies.get("token");

//         try {
//             const { data } = await axios.get(`${userr_service}/api/v1/user/all`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             });
        
            
//             setUsers(data);
//         } catch (error) {
//             console.log(error);
//         }
//     }

//     useEffect(() => {
//         fetchUser();
//         fetchChats();
//         fetchUsers();
//     }, []);

//     return (
//         <AppContext.Provider value={{ 
//             user, 
//             setUser, 
//             isAuth, 
//             setIsAuth, 
//             loading, 
//             logoutUser,
//             fetchChats,
//             fetchUsers,
//             chats,
//             users,
//             setChats,
//             toast,
//             showToast,
//             hideToast
//         }}>
//             {children}
            
//             {/* Premium Toast Component */}
//             {toast.show && (
//                 <div className="fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out backdrop-blur-lg">
//                     <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 border border-blue-400/30 rounded-2xl shadow-2xl min-w-80 overflow-hidden">
//                         {/* Animated Background */}
//                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse" />
                        
//                         {/* Progress Bar */}
//                         <div className="absolute top-0 left-0 w-full h-1 bg-blue-900/30">
//                             <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-3000 ease-linear animate-progress" />
//                         </div>

//                         {/* Content */}
//                         <div className="relative p-5">
//                             <div className="flex items-start space-x-4">
//                                 {/* Icon */}
//                                 <div className="flex-shrink-0">
//                                     <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
//                                         <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                         </svg>
//                                     </div>
//                                 </div>
                                
//                                 {/* Text Content */}
//                                 <div className="flex-1 min-w-0">
//                                     <div className="flex items-center space-x-2 mb-1">
//                                         <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                                         </svg>
//                                         <p className="text-sm font-bold text-white uppercase tracking-wide">
//                                             Session Ended
//                                         </p>
//                                     </div>
//                                     <p className="text-lg font-semibold text-white mb-1">
//                                         {toast.message}
//                                     </p>
//                                     <p className="text-sm text-blue-100/80">
//                                         You have been securely logged out of your account.
//                                     </p>
//                                 </div>

//                                 {/* Close Button */}
//                                 <button
//                                     onClick={hideToast}
//                                     className="flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm group border border-white/20"
//                                 >
//                                     <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>

//                         {/* Decorative Elements */}
//                         <div className="absolute top-2 right-2 w-8 h-8 bg-cyan-400/20 rounded-full blur-md" />
//                         <div className="absolute bottom-2 left-2 w-6 h-6 bg-blue-400/20 rounded-full blur-md" />
                        
//                         {/* Shimmer Effect */}
//                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform -translate-x-full animate-shimmer" />
//                     </div>
//                 </div>
//             )}
//         </AppContext.Provider>
//     );
// };

// export const useAppData = (): AppContextType => {
//     const context = useContext(AppContext);
//     if (!context) {
//         throw new Error("useAppData must be used within AppProvider");
//     }
//     return context;
// };





"use client"

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { chatt_service, userr_service } from "../../url";




export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface Message {
    _id: string;
    chatId: string;
    sender: string;
    text?: string;
    image?: {
        url: string;
        publicId: string;
    };
    messageType: "text" | "image";
    seen: boolean;
    seenAt?: string;
    createdAt: string;
}

export interface Chat {
    _id: string;
    users: string[];
    latestMessage: {
        text: string;
        sender: string;
    };
    createdAt: string;
    updatedAt: string;
    unseenCount?: number;
}

export interface Chats {
    _id: string;
    user: User;
    chat: Chat;
}

interface ToastState {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
    user: User | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchChats: () => Promise<void>;
    chats: Chats[] | null;
    users: User[] | null;
    setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
    toast: ToastState;
    showToast: (message: string, type?: ToastState['type']) => void;
    hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<ToastState>({ 
        show: false, 
        message: '', 
        type: 'success' 
    });

    const showToast = (message: string, type: ToastState['type'] = 'success') => {
        setToast({ show: true, message, type });
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            hideToast();
        }, 3000);
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    async function fetchUser() {
        try {
            const token = Cookies.get("token");

            const { data } = await axios.get(`${userr_service}/api/v1/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(data);
            setIsAuth(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    async function logoutUser() {
        Cookies.remove("token");
        setUser(null);
        setIsAuth(false);
        
        // Show premium toast instead of alert
        showToast("Logged out successfully", "success");
    }

    const [chats, setChats] = useState<Chats[] | null>(null);

    async function fetchChats() {
        const token = Cookies.get("token");

        try {
            const { data } = await axios.get(`${chatt_service}/api/v1/chat/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setChats(data.chats);
        } catch (error) {
            console.log(error);
        }
    }

    const [users, setUsers] = useState<User[] | null>(null);

    async function fetchUsers() {
        const token = Cookies.get("token");

        try {
            const { data } = await axios.get(`${userr_service}/api/v1/user/all`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        
            
            setUsers(data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchUser();
        fetchChats();
        fetchUsers();
    }, []);

    return (
        <AppContext.Provider value={{ 
            user, 
            setUser, 
            isAuth, 
            setIsAuth, 
            loading, 
            logoutUser,
            fetchChats,
            fetchUsers,
            chats,
            users,
            setChats,
            toast,
            showToast,
            hideToast
        }}>
            {children}
            
            {/* Premium Toast Component */}
            {toast.show && (
                <div className="fixed top-6 right-6 z-50 transform transition-all duration-500 ease-out backdrop-blur-lg">
                    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 border border-blue-400/30 rounded-2xl shadow-2xl min-w-80 overflow-hidden">
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 animate-pulse" />
                        
                        {/* Progress Bar */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-900/30">
                            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-3000 ease-linear animate-progress" />
                        </div>

                        {/* Content */}
                        <div className="relative p-5">
                            <div className="flex items-start space-x-4">
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {/* Text Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <p className="text-sm font-bold text-white uppercase tracking-wide">
                                            Session Ended
                                        </p>
                                    </div>
                                    <p className="text-lg font-semibold text-white mb-1">
                                        {toast.message}
                                    </p>
                                    <p className="text-sm text-blue-100/80">
                                        You have been securely logged out of your account.
                                    </p>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={hideToast}
                                    className="flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200 backdrop-blur-sm group border border-white/20"
                                >
                                    <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-2 right-2 w-8 h-8 bg-cyan-400/20 rounded-full blur-md" />
                        <div className="absolute bottom-2 left-2 w-6 h-6 bg-blue-400/20 rounded-full blur-md" />
                        
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform -translate-x-full animate-shimmer" />
                    </div>
                </div>
            )}
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
};