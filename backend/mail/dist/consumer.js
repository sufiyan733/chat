// import amqp from 'amqplib'
// import nodemailer from 'nodemailer'
// import dotenv from 'dotenv'
// dotenv.config();
// export const startSendOtpConsumer = async () => {
//     try {
//         const connection = await amqp.connect({
//             protocol: "amqp",
//             hostname: process.env.Rabbitmq_Host,
//             port: 5672,
//             username: process.env.Rabbitmq_Username,
//             password: process.env.Rabbitmq_Password
//         });
//         const channel = await connection.createChannel();
//         const queueName = "send-otp";
//         await channel.assertQueue(queueName,{durable:true});
//         console.log("MAIL SERVICE STARTED✅");
//         channel.consume(queueName,async(msg)=>{
//             if(msg){
//                 try {
//                     const {to,subject,body}=JSON.parse(msg.content.toString());
//                     const transporter= nodemailer.createTransport({
//                         host:"smtp.gmail.com",
//                         port:587,
//                         auth:{
//                             user:process.env.USER,
//                             pass:process.env.PASSWORD,
//                         }
//                     })
//                     await transporter.sendMail({
//                         from:"chat app",
//                         to,
//                         subject,
//                         text:body
//                     })
//                   console.log(`opt mail sent to ${to}`);
//                   channel.ack(msg);
//                 } catch (error) {
//                     console.log(error,"error☠️");
//                 }
//             }
//         })
//     } catch (error) {
//         console.log(error, "error")
//     }
// }
import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("📧 MAIL SERVICE STARTED ✅");
        channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const { to, subject, body, token } = JSON.parse(msg.content.toString());
                // 👇 Create the dynamic verification URL
                const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(to)}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASSWORD,
                    },
                });
                // use an absolute frontend URL from env (falls back to localhost)
                const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
                await transporter.sendMail({
                    from: `"ChatApp" <no-reply@chatapp.com>`,
                    to,
                    subject: subject || "Verify your ChatApp account",
                    // Short preview shown in inbox list
                    headers: { "X-Preview-Text": "Verify your email to start chatting on ChatApp" },
                    text: `Welcome to ChatApp.

${body || "Click the link below to verify your account and start chatting."}

Verify: ${verificationUrl}

If you didn't request this, ignore this email.

© ${new Date().getFullYear()} ChatApp Inc.`,
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.1),
                0 0 0 1px rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .email-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 48px 40px 32px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .email-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
        }
        
        .brand-title {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .brand-subtitle {
            font-size: 16px;
            font-weight: 400;
            opacity: 0.8;
            letter-spacing: 0.5px;
        }
        
        .email-body {
            padding: 48px 40px;
            color: #1e293b;
        }
        
        .welcome-title {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 16px;
            letter-spacing: -0.25px;
        }
        
        .welcome-text {
            font-size: 16px;
            color: #475569;
            margin-bottom: 32px;
            line-height: 1.7;
        }
        
        .verification-card {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
            position: relative;
        }
        
        .verification-card::before {
            content: '';
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            border-radius: 16px 16px 0 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 16px 40px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            border: none;
            cursor: pointer;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
        }
        
        .direct-link {
            margin-top: 24px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            word-break: break-all;
            font-size: 14px;
            color: #475569;
        }
        
        .direct-link a {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .expiry-notice {
            text-align: center;
            color: #64748b;
            font-size: 14px;
            margin: 24px 0;
            font-style: italic;
        }
        
        .support-section {
            text-align: center;
            padding: 24px;
            border-top: 1px solid #f1f5f9;
            margin-top: 32px;
        }
        
        .support-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
        }
        
        .email-footer {
            background: #0f172a;
            color: #94a3b8;
            padding: 32px 40px;
            text-align: center;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        
        .copyright {
            font-size: 14px;
        }
        
        .footer-links {
            display: flex;
            gap: 24px;
        }
        
        .footer-links a {
            color: #94a3b8;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.3s ease;
        }
        
        .footer-links a:hover {
            color: #e2e8f0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 16px;
            }
            
            .email-header,
            .email-body {
                padding: 32px 24px;
            }
            
            .brand-title {
                font-size: 28px;
            }
            
            .welcome-title {
                font-size: 24px;
            }
            
            .footer-content {
                flex-direction: column;
                text-align: center;
            }
            
            .footer-links {
                justify-content: center;
            }
        }
        
        .preheader {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            height: 0;
            width: 0;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="preheader">Verify your email to start chatting on ChatApp.</div>
    
    <div class="email-container">
        <div class="email-header">
            <h1 class="brand-title">ChatApp</h1>
            <p class="brand-subtitle">Secure • Fast • Private</p>
        </div>
        
        <div class="email-body">
            <h2 class="welcome-title">Welcome to ChatApp</h2>
            <p class="welcome-text">
                ${body || "You're one step away from joining the most secure messaging platform. Verify your email to start connecting with friends and colleagues."}
            </p>
            
            <div class="verification-card">
                <a href="${verificationUrl}" class="cta-button" target="_blank" rel="noreferrer">
                    Verify Email Address
                </a>
                
                <div class="direct-link">
                    <strong>Or use this direct link:</strong><br>
                    <a href="${verificationUrl}" target="_blank" rel="noreferrer">${verificationUrl}</a>
                </div>
            </div>
            
            <p class="expiry-notice">
                ⚠️ This verification link will expire in 15 minutes for your security.
            </p>
            
            <div class="support-section">
                <p style="margin-bottom: 8px; color: #64748b;">
                    Need assistance? Our support team is here to help.
                </p>
                <a href="mailto:support@chatapp.com" class="support-link">support@chatapp.com</a>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-content">
                <div class="copyright">
                    © ${new Date().getFullYear()} ChatApp Inc. All rights reserved.
                </div>
                <div class="footer-links">
                    <a href="${frontend}/privacy">Privacy Policy</a>
                    <a href="${frontend}/terms">Terms of Service</a>
                    <a href="${frontend}/unsubscribe?email=${encodeURIComponent(to)}">Unsubscribe</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
          `,
                });
                console.log(`✅ OTP mail sent to ${to}`);
                channel.ack(msg);
            }
            catch (error) {
                console.error("☠️ Mail send error:", error);
            }
        });
    }
    catch (error) {
        console.error("☠️ RabbitMQ connection error:", error);
    }
};
//# sourceMappingURL=consumer.js.map