import dotenv from "dotenv";
import express from "express";

import { MongoDbServices } from "./services/mongodb_services.js";
import authRouter from "./routes/auth_routes.js";
import { errorHandler } from "./helpers/custom_handlers.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/auth", authRouter);

app.use(errorHandler);

MongoDbServices.connect().then(() => {
  app.listen(3000);
});
