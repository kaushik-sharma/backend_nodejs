import { Router } from "express";
import {
  signUp,
  signIn,
  checkPhoneNumber,
  signOut,
  signOutAllSessions,
  deleteAccount,
  refreshAuthToken,
} from "../controllers/auth_controller.js";

const router = Router();

router.get("/checkPhoneNumber", checkPhoneNumber);
router.post("/signUp", signUp);
router.post("/signIn", signIn);
router.post("/signOut", signOut);
router.post("/signOutAllSessions", signOutAllSessions);
router.delete("/deleteAccount", deleteAccount);
router.get("/refreshAuthToken", refreshAuthToken);

export default router;
