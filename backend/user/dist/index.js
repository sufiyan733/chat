import dotenv from 'dotenv';
import express from "express";
import connectDB from "./config/db.js";
import { createClient } from "redis";
import { PORT, REDIS_URL } from './constants/env.js';
import userRoutes from './routes/user.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import cors from 'cors';
dotenv.config();
connectDB();
connectRabbitMQ();
export const redisClient = createClient({
    url: REDIS_URL
});
redisClient.connect()
    .then(() => console.log("connected to reds"))
    .catch(console.error);
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/v1", userRoutes);
app.listen(PORT, () => {
    console.log(`port is ${PORT}`);
});
//# sourceMappingURL=index.js.map