// import e from "express";
// import TryCatch from "../config/trycatch.js";
// import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
// import { Chat } from "../models/chat.js";
// import { Messages } from "../models/messages.js";
// import axios from "axios";
// import { getRecieverSocketId, io } from "../config/socket.js";
// export const createNewChat = TryCatch(
//     async (req: AuthenticatedRequest, res) => {
//         const userId = req.user?._id;
//         const { otherUserId } = req.body;
//         console.log("otherUserId", otherUserId);
//         if (!otherUserId) {
//             res.status(400).json({ message: "OTHER USER ID IS REQUIRED" });
//             return;
//         }
//         const existingChat = await Chat.findOne({
//             users: { $all: [userId, otherUserId], $size: 2 },
//         })
//         if (existingChat) {
//             res.json({
//                 messgae: "chat already exists",
//                 chatId: existingChat._id,
//             })
//             return;
//         }
//         const newChat = await Chat.create({
//             users: [userId, otherUserId]
//         })
//         res.status(201).json({ message: "new chat created", chatId: newChat._id })
//     }
// );
// export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
//     const userId = req.user?._id;
//     if (!userId) {
//         res.status(400).json({ message: "USER-ID MISSING" });
//         return;
//     }
//     const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
//     const chatWithUserData = await Promise.all(
//         chats.map(async (chat) => {
//             const otherUserId = chat.users.find((id) => id !== userId);
//             const unseenCount = await Messages.countDocuments({
//                 chatId: chat._id,
//                 sender: { $ne: userId },
//                 seen: false
//             });
//             try {
//                 const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
//                 return {
//                     user: data,
//                     chat: {
//                         ...chat.toObject(),
//                         latestMessage: chat.latestMessage || null,
//                         unseenCount,
//                     }
//                 }
//             } catch (error) {
//                 console.log("error is-->", error);
//                 return {
//                     user: { _id: otherUserId, name: "Unknown User" },
//                     chat: {
//                         ...chat.toObject(),
//                         latestMessage: chat.latestMessage || null,
//                         unseenCount,
//                     }
//                 }
//             }
//         })
//     )
//     res.json({
//         chats: chatWithUserData,
//     })
// })
// export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
//     const senderId = req.user?._id
//     const { chatId, text } = req.body
//     const imageFile = req.file;
//     if (!senderId) {
//         res.status(401).json({ message: "unauthorized" })
//         return;
//     }
//     if (!chatId) {
//         res.status(401).json({ message: "CHAT ID REQUIRED" })
//         return;
//     }
//     if (!text && !imageFile) {
//         res.status(401).json({ message: "EITHER TEXT OR IMAGE IS REQUIRED" })
//         return;
//     }
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//         res.status(404).json({ message: "chat not found" })
//         return
//     }
//     const isUserInChat = chat.users.some(
//         (userId) => userId.toString() === senderId.toString()
//     )
//     if (!isUserInChat) {
//         res.status(403).json({ message: "YOU ARE NOT A PARTICIPANT" })
//         return
//     }
//     const otherUserId = chat.users.find(
//         (uid) => uid.toString() !== senderId.toString()
//     )
//     if (!otherUserId) {
//         res.status(403).json({ message: "NO OTHER USER" })
//         return
//     }
//     // SOCKET SETUP
//     const recieverSocketId = getRecieverSocketId(otherUserId.toString());
//     let isRecieverInChatRoom = false;
//     if (recieverSocketId) {
//         const recieverSocket = io.sockets.sockets.get(recieverSocketId)
//         if (recieverSocket && recieverSocket.rooms.has(chatId)) {
//             isRecieverInChatRoom = true;
//         }
//     }
//     const messageData: any = {
//         chatId: chatId,
//         sender: senderId,
//         seen: isRecieverInChatRoom,
//         seenAt: isRecieverInChatRoom ? new Date() : undefined
//     }
//     if (imageFile) {
//         messageData.image = {
//             url: imageFile.path,
//             publicId: imageFile.filename
//         }
//         messageData.messageType = "image";
//         messageData.text = text || " "
//     } else {
//         messageData.text = text;
//         messageData.messageType = "text"
//     }
//     const message = new Messages(messageData);
//     const savedMessage = await message.save();
//     const latetMessageText = imageFile ? "📸image" : text
//     await Chat.findByIdAndUpdate(chatId, {
//         latestMessage: {
//             text: latetMessageText,
//             sender: senderId
//         },
//         updatedAt: new Date()
//     }, { new: true }
//     );
//     //    emit to socket
//     io.to(chatId).emit("newMessage",savedMessage);
//     if(recieverSocketId){
//         io.to(recieverSocketId).emit("newMessage", savedMessage);
//     }
//     const senderSocketId= getRecieverSocketId(senderId.toString());
//     if(senderSocketId){
//         io.to(senderSocketId).emit("newMessage",savedMessage)
//     }
//     if(senderSocketId && isRecieverInChatRoom){
//         io.to(senderSocketId).emit("messagesSeen",{
//             chatId:chatId,
//             seenBy:otherUserId,
//             messageIds:[savedMessage._id]
//         })
//     }
//     res.status(201).json({
//         message: savedMessage,
//         sender: senderId
//     })
// })
// export const getMessagesByChat = TryCatch(async (req: AuthenticatedRequest, res) => {
//     const userId = req.user?._id
//     console.log(req.params);
//     const { chatId } = req.params
//     if (!chatId) {
//         res.status(401).json({ message: "CHAT ID REQUIRED" })
//         return;
//     }
//     if (!userId) {
//         res.status(401).json({ message: "USER ID REQUIRED" })
//         return;
//     }
//     const chat = await Chat.findById(chatId);
//     if (!chat) {
//         res.status(401).json({ message: "CHAT NOT FOUND" })
//         return;
//     }
//     const isUserInChat = chat.users.some(
//         (userId) => userId.toString() === userId.toString()
//     )
//     if (!isUserInChat) {
//         res.status(403).json({ message: "YOU ARE NOT A PARTICIPANT" })
//         return
//     }
//     const messagesToMarkSeen = await Messages.find({
//         chatId: chatId,
//         seen: false,
//         sender: { $ne: userId }
//     });
//     await Messages.updateMany({
//         chatId: chatId,
//         seen: false,
//         sender: { $ne: userId }
//     }, {
//         seen: true,
//         seenAt: new Date()
//     })
//     const messages = await Messages.find({ chatId }).sort({ createdAt: 1 })
//     const otherUserId = chat.users.find(
//         (uid) => uid.toString() !== userId.toString()
//     )
//     try {
//         const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
//         if (!otherUserId) {
//             res.status(400).json({ message: "NO OTHER USER" })
//             return
//         }
//         //    SOCKET WORK
//         if(messagesToMarkSeen.length>0){
//             const otherUserSocketId= getRecieverSocketId(otherUserId.toString())
//             if(otherUserSocketId){
//                 io.to(otherUserSocketId).emit("messagesSeen",{
//                     chatId:chatId,
//                     seenBy:userId,
//                     messageIds:messagesToMarkSeen.map((msg)=>msg._id)
//                 })
//             }
//         }
//         res.json({
//             messages,
//             user: data,
//         })
//     } catch (error) {
//         console.log(error);
//         res.json({
//             messages,
//             user: { _id: otherUserId, name: "Unknown User" }
//         })
//     }
// }
// )
////////////////////////////////////////////////////////////
//new
import TryCatch from "../config/trycatch.js";
import { Chat } from "../models/chat.js";
import { Messages } from "../models/messages.js";
import axios from "axios";
import { getRecieverSocketId, io } from "../config/socket.js";
/**
 * Create a new chat between the authenticated user and otherUserId.
 * Emits `chatCreated` to the other user when a new chat is created.
 */
export const createNewChat = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!userId) {
        res.status(401).json({ message: "UNAUTHORIZED" });
        return;
    }
    if (!otherUserId) {
        res.status(400).json({ message: "OTHER USER ID IS REQUIRED" });
        return;
    }
    // check existing chat
    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 },
    });
    if (existingChat) {
        res.json({
            message: "chat already exists",
            chatId: existingChat._id,
        });
        return;
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });
    // Notify the other user in real-time that a chat was created
    const otherSocketId = getRecieverSocketId(otherUserId.toString());
    if (otherSocketId) {
        io.to(otherSocketId).emit("chatCreated", {
            chatId: newChat._id,
            users: newChat.users,
            createdBy: userId,
        });
    }
    // Optionally notify the creator's other sockets
    const creatorSocketId = getRecieverSocketId(userId.toString());
    if (creatorSocketId) {
        io.to(creatorSocketId).emit("chatCreated", {
            chatId: newChat._id,
            users: newChat.users,
            createdBy: userId,
        });
    }
    res.status(201).json({ message: "new chat created", chatId: newChat._id });
});
/**
 * Return all chats for the authenticated user with other user data and unseen counts.
 */
export const getAllChats = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        res.status(400).json({ message: "USER-ID MISSING" });
        return;
    }
    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });
    const chatWithUserData = await Promise.all(chats.map(async (chat) => {
        const otherUserId = chat.users.find((id) => id.toString() !== userId.toString());
        const unseenCount = await Messages.countDocuments({
            chatId: chat._id,
            sender: { $ne: userId },
            seen: false,
        });
        if (!otherUserId) {
            return {
                user: { _id: null, name: "Unknown User" },
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount,
                },
            };
        }
        try {
            const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
            return {
                user: data,
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount,
                },
            };
        }
        catch (error) {
            console.error("Error fetching user service:", error);
            return {
                user: { _id: otherUserId, name: "Unknown User" },
                chat: {
                    ...chat.toObject(),
                    latestMessage: chat.latestMessage || null,
                    unseenCount,
                },
            };
        }
    }));
    res.json({
        chats: chatWithUserData,
    });
});
/**
 * Send a message in a chat. Saves message, updates chat.latestMessage,
 * emits `newMessage` to the chat room and to the other user's socket (if online).
 * Emits `messagesSeen` back to sender when appropriate.
 */
export const sendMessage = TryCatch(async (req, res) => {
    const senderId = req.user?._id;
    const { chatId, text } = req.body;
    const imageFile = req.file;
    if (!senderId) {
        res.status(401).json({ message: "unauthorized" });
        return;
    }
    if (!chatId) {
        res.status(400).json({ message: "CHAT ID REQUIRED" });
        return;
    }
    if (!text && !imageFile) {
        res.status(400).json({ message: "EITHER TEXT OR IMAGE IS REQUIRED" });
        return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({ message: "chat not found" });
        return;
    }
    const isParticipant = chat.users.some((uid) => uid.toString() === senderId.toString());
    if (!isParticipant) {
        res.status(403).json({ message: "YOU ARE NOT A PARTICIPANT" });
        return;
    }
    const otherUserId = chat.users.find((uid) => uid.toString() !== senderId.toString());
    if (!otherUserId) {
        res.status(400).json({ message: "NO OTHER USER" });
        return;
    }
    // SOCKET SETUP: check if receiver is in the chat room
    const receiverSocketId = getRecieverSocketId(otherUserId.toString());
    let isReceiverInChatRoom = false;
    if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket && receiverSocket.rooms.has(chatId)) {
            isReceiverInChatRoom = true;
        }
    }
    const messageData = {
        chatId,
        sender: senderId,
        seen: isReceiverInChatRoom,
        seenAt: isReceiverInChatRoom ? new Date() : undefined,
    };
    if (imageFile) {
        messageData.image = {
            url: imageFile.path,
            publicId: imageFile.filename,
        };
        messageData.messageType = "image";
        messageData.text = text || " ";
    }
    else {
        messageData.text = text;
        messageData.messageType = "text";
    }
    const message = new Messages(messageData);
    const savedMessage = await message.save();
    const latestMessageText = imageFile ? "📸image" : text;
    await Chat.findByIdAndUpdate(chatId, {
        latestMessage: {
            text: latestMessageText,
            sender: senderId,
        },
        updatedAt: new Date(),
    }, { new: true });
    // Emit to the chat room (all sockets joined to chatId)
    io.to(chatId).emit("newMessage", savedMessage);
    // Emit directly to receiver socket if online (to make sure they get it even if not in room)
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", savedMessage);
    }
    // Also notify sender's other sockets (if any)
    const senderSocketId = getRecieverSocketId(senderId.toString());
    if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", savedMessage);
    }
    // If receiver is in the room, mark messages seen for sender's other sockets
    if (senderSocketId && isReceiverInChatRoom) {
        io.to(senderSocketId).emit("messagesSeen", {
            chatId,
            seenBy: otherUserId,
            messageIds: [savedMessage._id],
        });
    }
    res.status(201).json({
        message: savedMessage,
        sender: senderId,
    });
});
/**
 * Return messages for a chat. Marks unread messages from others as seen.
 * Emits `messagesSeen` to the other participant if messages were marked seen.
 */
export const getMessagesByChat = TryCatch(async (req, res) => {
    const authUserId = req.user?._id;
    const { chatId } = req.params;
    if (!chatId) {
        res.status(400).json({ message: "CHAT ID REQUIRED" });
        return;
    }
    if (!authUserId) {
        res.status(401).json({ message: "USER ID REQUIRED" });
        return;
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
        res.status(404).json({ message: "CHAT NOT FOUND" });
        return;
    }
    const isUserInChat = chat.users.some((uid) => uid.toString() === authUserId.toString());
    if (!isUserInChat) {
        res.status(403).json({ message: "YOU ARE NOT A PARTICIPANT" });
        return;
    }
    // Messages that will be marked seen (messages sent by others and not yet seen)
    const messagesToMarkSeen = await Messages.find({
        chatId,
        seen: false,
        sender: { $ne: authUserId },
    });
    if (messagesToMarkSeen.length > 0) {
        await Messages.updateMany({ chatId, seen: false, sender: { $ne: authUserId } }, { seen: true, seenAt: new Date() });
    }
    const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });
    const otherUserId = chat.users.find((uid) => uid.toString() !== authUserId.toString());
    // Emit messagesSeen to the other participant if we marked any as seen
    if (messagesToMarkSeen.length > 0 && otherUserId) {
        const otherUserSocketId = getRecieverSocketId(otherUserId.toString());
        if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("messagesSeen", {
                chatId,
                seenBy: authUserId,
                messageIds: messagesToMarkSeen.map((msg) => msg._id),
            });
        }
    }
    // Attach user info for the other user
    try {
        if (!otherUserId) {
            res.status(400).json({ message: "NO OTHER USER" });
            return;
        }
        const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);
        res.json({
            messages,
            user: data,
        });
    }
    catch (error) {
        console.error("Error fetching user service:", error);
        res.json({
            messages,
            user: { _id: otherUserId, name: "Unknown User" },
        });
    }
});
//# sourceMappingURL=chat.js.map