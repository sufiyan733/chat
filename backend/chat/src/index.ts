// import express from 'express'
// import dotenv from 'dotenv'
// import connectDB from './config/db.js';
// import chatRoutes from './routes/chat.js';
// import cors from 'cors';
// import { app, server } from './config/socket.js';

// dotenv.config();
// connectDB()


// app.use(express.json());
// app.use(cors());

// app.use(
//   cors({
//     origin: "http://localhost:3000", // your Next.js origin
//     credentials: true,
//     allowedHeaders: ["Content-Type", "Authorization"],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   })
// );

// // ensure preflight requests are handled
// // app.options("*", cors({
// //   origin: "http://localhost:3000",
// //   credentials: true,
// //   allowedHeaders: ["Content-Type", "Authorization"],
// // }));

// app.use("/api/v1", chatRoutes);

// const port= process.env.PORT;

// server.listen(port,()=>{
//     console.log(`server is running on port ${port}`);
    
// })

import express from 'express'
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import chatRoutes from './routes/chat.js';
import cors from 'cors';
import { app, server } from './config/socket.js';

dotenv.config();
connectDB()

app.use(express.json());

// Remove this duplicate line: app.use(cors());

// Use only one CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // your Next.js origin
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["*", "Authorization"]
  })
);

app.use("/api/v1", chatRoutes);

const port= process.env.PORT;

server.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})