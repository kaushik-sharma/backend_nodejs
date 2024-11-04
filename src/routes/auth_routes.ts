import { Router } from "express";
import { createUser } from "../controllers/auth_controller.js";

const router = Router();

router.post("/", createUser);
// router.get("/", getAllTodos);
// router.patch("/:id", updateTodoById);
// router.delete("/:id", deleteTodoById);

export default router;
