/**
 * Create a new chat between the authenticated user and otherUserId.
 * Emits `chatCreated` to the other user when a new chat is created.
 */
export declare const createNewChat: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Return all chats for the authenticated user with other user data and unseen counts.
 */
export declare const getAllChats: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Send a message in a chat. Saves message, updates chat.latestMessage,
 * emits `newMessage` to the chat room and to the other user's socket (if online).
 * Emits `messagesSeen` back to sender when appropriate.
 */
export declare const sendMessage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Return messages for a chat. Marks unread messages from others as seen.
 * Emits `messagesSeen` to the other participant if messages were marked seen.
 */
export declare const getMessagesByChat: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=chat.d.ts.map