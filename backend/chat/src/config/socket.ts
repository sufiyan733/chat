


// import { Socket, Server } from "socket.io";
// import http from 'http';
// import express from "express";

// const app = express();

// const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: "http://localhost:3000", // Match your Express CORS origin
//         methods: ["GET", "POST"],
//         credentials: true // Add this line
//     }
// });

// const userSocketMap: Record<string, string> = {};

// export const getRecieverSocketId = (recieverId: string): string | undefined=>{
//     return userSocketMap[recieverId];
// }

// io.on("connection", (socket: Socket) => {
//     console.log(`User connected`, socket.id);

//     const userId = socket.handshake.query.userId as string | undefined;

//     if (userId && userId !== "undefined") {
//         userSocketMap[userId] = socket.id;
//         console.log(`User ${userId} mapped to socket ${socket.id}`);
//     }

//     io.emit("getOnlineUser", Object.keys(userSocketMap))

//     socket.on("disconnect", () => {
//         console.log("User disconnected", socket.id);

//         if (userId) {
//             delete userSocketMap[userId];
//             console.log(`User ${userId} removed`);
//             io.emit("getOnlineUser", Object.keys(userSocketMap))
//         }
//     });

//     // Move this outside the disconnect handler
//     socket.on("connect_error", (error) => {
//         console.log("Socket connection error", error);
//     });
// })

// export { app, server, io }

///////////////////////////////////////////////////

// //new

import { Socket, Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// simple userId -> socketId map (single socket per user)
// if you need multi-socket support store array of socketIds per user
const userSocketMap: Record<string, string> = {};

export const getRecieverSocketId = (recieverId: string): string | undefined => {
  return userSocketMap[recieverId];
};

io.on("connection", (socket: Socket) => {
  console.log("User connected", socket.id);

  const userId = socket.handshake.query.userId as string | undefined;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // broadcast current online users (you may want to emit only to a room or the user)
  io.emit("getOnlineUser", Object.keys(userSocketMap));

  /**
   * Rooms API
   * Clients should call socket.emit('joinChat', { chatId }) when opening a chat
   * and socket.emit('leaveChat', { chatId }) when closing it (optional).
   */
  socket.on("joinChat", (payload: { chatId?: string }) => {
    try {
      const chatId = payload?.chatId;
      if (!chatId) return;
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    } catch (err) {
      console.error("joinChat error", err);
    }
  });

  socket.on("leaveChat", (payload: { chatId?: string }) => {
    try {
      const chatId = payload?.chatId;
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    } catch (err) {
      console.error("leaveChat error", err);
    }
  });

  /**
   * Typing indicators
   * Client -> server:
   *   socket.emit('typing', { to: receiverId, chatId })
   *   socket.emit('stopTyping', { to: receiverId, chatId })
   *
   * Server -> clients:
   *   io.to(chatId).emit('istyping', { from: userId, chatId })
   *   io.to(chatId).emit('stopTyping', { from: userId, chatId })
   *
   * Also sent directly to the receiver socketId for reliability.
   */
  socket.on("typing", (payload: { to?: string; chatId?: string }) => {
    try {
      const { to, chatId } = payload || {};
      const from = userId;
      if (!to || !chatId || !from) return;

      // notify everyone in the chat room (multi-device support)
      io.to(chatId).emit("istyping", { from, chatId });

      // ensure direct delivery to receiver if they have a separate socket
      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("istyping", { from, chatId });
      }
    } catch (err) {
      console.error("typing handler error", err);
    }
  });

  socket.on("stopTyping", (payload: { to?: string; chatId?: string }) => {
    try {
      const { to, chatId } = payload || {};
      const from = userId;
      if (!to || !chatId || !from) return;

      io.to(chatId).emit("stopTyping", { from, chatId });

      const receiverSocketId = userSocketMap[to];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { from, chatId });
      }
    } catch (err) {
      console.error("stopTyping handler error", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);

    // When a socket disconnects, broadcast stopTyping for all chat rooms this socket was in.
    // socket.rooms is a Set that includes socket.id and any joined rooms.
    try {
      const rooms = Array.from(socket.rooms || []);
      const from = userId;
      rooms.forEach((roomId) => {
        // skip the socket's own room id
        if (roomId === socket.id) return;
        if (from) {
          io.to(roomId).emit("stopTyping", { from, chatId: roomId });
        }
      });
    } catch (err) {
      console.error("error emitting stopTyping on disconnect", err);
    }

    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} removed`);
      io.emit("getOnlineUser", Object.keys(userSocketMap));
    }
  });

  socket.on("connect_error", (error) => {
    console.log("Socket connection error", error);
  });
});

export { app, server, io };
