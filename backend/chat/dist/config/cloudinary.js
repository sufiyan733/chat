// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error('Missing Cloudinary env vars: CLOUD_NAME, API_KEY, API_SECRET');
}
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
});
export default cloudinary;
//# sourceMappingURL=cloudinary.js.map