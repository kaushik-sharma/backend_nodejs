import { Router } from "express";
import {
  signUp,
  signIn,
  checkPhoneNumber,
  signOut,
  signOutAllSessions,
  deleteAccount,
} from "../controllers/auth_controller.js";

const router = Router();

router.get("/checkPhoneNumber", checkPhoneNumber);
router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/signOut", signOut);
router.post("/signOutAllSessions", signOutAllSessions);
router.delete("/deleteAccount", deleteAccount);

export default router;
