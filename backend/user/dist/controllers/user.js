import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/trycatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/user.js";
export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body;
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if (rateLimit) {
        res.status(429).json({
            message: "Too many request , Please wait before trying again"
        });
        return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, { EX: 300 });
    await redisClient.set(rateLimitKey, "true", { EX: 1 });
    const message = {
        to: email,
        subject: "Your otp code",
        body: `Your OTP is ${otp}, It is valid for 5minutes`
    };
    await publishToQueue("send-otp", message);
    res.status(200).json({
        message: "OTP sent to your mail"
    });
});
export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body;
    if (!email || !enteredOtp) {
        res.status(400).json({
            message: "email and otp required"
        });
        return;
    }
    ;
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    console.log(storedOtp, enteredOtp);
    if (!storedOtp || storedOtp !== enteredOtp) {
        res.status(400).json({ message: "Invalid or expired OTP" });
        return;
    }
    ;
    await redisClient.del(otpKey);
    let user = await User.findOne({ email });
    if (!user) {
        const name = email.slice(0, 6);
        user = await User.create({ name, email });
    }
    ;
    const token = generateToken(user);
    res.json({
        message: "User Verified",
        user,
        token,
    });
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
export const updateName = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
        res.status(404).json({ message: "PLEASE LOGIN" });
        return;
    }
    user.name = req.body.name;
    await user.save();
    const token = generateToken(user);
    res.json({
        message: "USER UPDATED",
        user,
        token,
    });
});
export const getAllUsers = TryCatch(async (req, res) => {
    const users = await User.find();
    console.log(users);
    res.json(users);
});
export const getAUser = TryCatch(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
});
//# sourceMappingURL=user.js.map