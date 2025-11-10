import amqp from 'amqplib';
import { Rabbitmq_Host } from '../constants/env.js';
let channel;
export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password
        });
        channel = await connection.createChannel();
        console.log("connectedd to rabbitmq");
    }
    catch (error) {
        console.log(error, "error");
    }
};
export const publishToQueue = async (queueName, message) => {
    if (!channel) {
        console.log("RABBITMQ ISNT INITIALIZED YET");
        return;
    }
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
//# sourceMappingURL=rabbitmq.js.map