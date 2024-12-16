import { RequestHandler } from "express";
import { arrayToTree } from "performant-array-to-tree";

import { JwtService } from "../services/jwt_service.js";
import { validateModel } from "../helpers/validation_helpers.js";
import { successResponseHandler } from "../helpers/custom_handlers.js";
import { PostModel, PostType } from "../models/post/post_model.js";
import { PostDatasource } from "../datasources/post_datasource.js";
import { ReactionModel, ReactionType } from "../models/post/reaction_model.js";
import { CommentModel, CommentType } from "../models/post/comment_model.js";

export const createPost: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const reqBody: Record<string, any> = {
    ...req.body,
    userId: userId,
  };

  const post = new PostModel(reqBody as PostType);

  validateModel(post);

  if (post.parentPostId !== null) {
    const postExists: boolean = await PostDatasource.postExists(
      post.parentPostId!.toString()
    );
    if (!postExists) {
      throw new Error("Post not found!");
    }
  }

  await PostDatasource.createPost(post);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const createReaction: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const reqBody: Record<string, any> = {
    ...req.body,
    postId: req.params.postId,
    userId: userId,
  };

  const reaction = new ReactionModel(reqBody as ReactionType);

  validateModel(reaction);

  const postExists: boolean = await PostDatasource.postExists(
    req.params.postId
  );
  if (!postExists) {
    throw new Error("Post not found!");
  }

  await PostDatasource.createReaction(reaction);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const createComment: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const reqBody: Record<string, any> = {
    ...req.body,
    postId: req.params.postId,
    userId: userId,
  };

  const comment = new CommentModel(reqBody as CommentType);

  validateModel(comment);

  if (comment.level === 0 && comment.parentCommentId !== null) {
    throw new Error("parentCommentId must be null if level = 0");
  }
  if (comment.level > 0 && comment.parentCommentId === null) {
    throw new Error("parentCommentId required if level > 0");
  }

  const postExists: boolean = await PostDatasource.postExists(
    comment.postId.toString()
  );
  if (!postExists) {
    throw new Error("Post not found!");
  }

  if (comment.level > 0) {
    const parentCommentExists: boolean = await PostDatasource.commentExists(
      comment.parentCommentId!.toString(),
      comment.postId.toString()
    );
    if (!parentCommentExists) {
      throw new Error("Parent comment not found!");
    }
    const isParentCommentLevelValid: boolean =
      await PostDatasource.isCommentLevelValid(
        comment.parentCommentId!.toString(),
        comment.level - 1
      );
    if (!isParentCommentLevelValid) {
      throw new Error("Parent comment level not valid!");
    }
  }

  await PostDatasource.createComment(comment);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const getCommentsByPostId: RequestHandler = async (req, res, next) => {
  await JwtService.verifyJwt(req.headers);

  const postId = req.params.postId as string | undefined | null;
  if (postId === undefined || postId === null) {
    throw new Error("Post ID is required.");
  }

  const postExists: boolean = await PostDatasource.postExists(postId);
  if (!postExists) {
    throw new Error("Post not found!");
  }

  const comments = await PostDatasource.getCommentsByPostId(postId);

  const commentsTree = arrayToTree(comments, {
    id: "_id",
    parentId: "parentCommentId",
    childrenField: "replies",
    nestedIds: false,
    dataField: null,
  });

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: commentsTree,
  });
};

export const getUserPosts: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const page = parseInt(req.params.page);

  const posts = await PostDatasource.getPostsByUserId(userId, page);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: posts,
  });
};

export const getUserComments: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const page = parseInt(req.params.page);

  const comments = await PostDatasource.getCommentsByUserId(userId, page);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: comments,
  });
};

export const deletePost: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const postId = req.params.postId as string | undefined | null;
  if (postId === undefined || postId === null) {
    throw new Error("Post ID is required.");
  }

  const postExists: boolean = await PostDatasource.postExists(postId);
  if (!postExists) {
    throw new Error("Post not found!");
  }

  const postUserId: string = await PostDatasource.getPostUserId(postId);
  if (postUserId !== userId) {
    throw new Error("Can not delete this post!");
  }

  await PostDatasource.deletePost(postId, userId);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const deleteComment: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const commentId = req.params.commentId as string | undefined | null;
  if (commentId === undefined || commentId === null) {
    throw new Error("Comment ID is required.");
  }

  const commentExists: boolean = await PostDatasource.commentExists(commentId);
  if (!commentExists) {
    throw new Error("Comment not found!");
  }

  const commentUserId: string = await PostDatasource.getCommentUserId(
    commentId
  );
  if (commentUserId !== userId) {
    throw new Error("Can not delete this comment!");
  }

  await PostDatasource.deleteComment(commentId, userId);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const getPostsFeed: RequestHandler = async (req, res, next) => {
  await JwtService.verifyJwt(req.headers);

  const page = parseInt(req.params.page);
  const posts = await PostDatasource.getPostsFeed(page);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: posts,
  });
};
