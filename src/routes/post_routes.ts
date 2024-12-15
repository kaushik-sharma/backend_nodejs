import { Router } from "express";
import {
  createPost,
  createReaction,
  createComment,
  getCommentsByPostId,
  getUserPosts,
  getUserComments,
  deletePost,
  deleteComment,
  getPostsFeed,
} from "../controllers/post_controller.js";

const router = Router();

router.post("/", createPost);
router.post("/reactions/:postId", createReaction);
router.post("/comments/:postId", createComment);
router.get("/comments/:postId", getCommentsByPostId);
router.get("/user/:page", getUserPosts);
router.get("/comments/user/:page", getUserComments);
router.delete("/:postId", deletePost);
router.delete("/comments/:commentId", deleteComment);
router.get("/:page", getPostsFeed);

export default router;
