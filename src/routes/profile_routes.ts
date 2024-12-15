import { Router } from "express";

import { getUser } from "../controllers/profile_controller.js";

const router = Router();

router.get("/user", getUser);

export default router;
