import mongoose from "mongoose";
import { DB_URL } from "../constants/env.js";
const connectDB = async () => {
    const url = DB_URL;
    if (!url) {
        throw new Error("DB URL IS NOT DEFINED");
    }
    try {
        await mongoose.connect(url);
        console.log("db connected");
    }
    catch (e) {
        console.error("falled to connect db", e);
        process.exit(1);
    }
};
export default connectDB;
//# sourceMappingURL=db.js.map