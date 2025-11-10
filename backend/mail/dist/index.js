import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
const express = __require("express");
import dotenv from 'dotenv';
import { startSendOtpConsumer } from "./consumer.js";
dotenv.config();
startSendOtpConsumer();
const app = express();
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`server is running ON ${port}`);
});
//# sourceMappingURL=index.js.map