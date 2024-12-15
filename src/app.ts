import dotenv from "dotenv";
import express from "express";

import { MongoDbServices } from "./services/mongodb_services.js";
// import { FirebaseServices } from "./services/firebase_services.js";
import authRouter from "./routes/auth_routes.js";
import profileRouter from "./routes/profile_routes.js";
import postRouter from "./routes/post_routes.js";
import moderationRouter from "./routes/moderation_routes.js";
import { errorHandler } from "./helpers/custom_handlers.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/posts", postRouter);
app.use("/moderation", moderationRouter);

app.use(errorHandler);

// FirebaseServices.init();

MongoDbServices.connect().then(() => {
  app.listen(3000);
});
