// import { RequestHandler } from "express";
// import { arrayToTree } from "performant-array-to-tree";

// import { JwtService } from "../services/jwt_service.js";
// import { validateModel } from "../helpers/validation_helpers.js";
// import { successResponseHandler } from "../helpers/custom_handlers.js";
// import {
//   PostCreationModel,
//   PostCreationType,
// } from "../models/post/post_model.js";
// import { PostDatasource } from "../datasources/post_datasource.js";
// import { ReactionModel, ReactionType } from "../models/post/reaction_model.js";
// import { CommentModel, CommentType } from "../models/post/comment_model.js";

// export const createPost: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const reqBody = {
//     ...req.body,
//     userId: userId,
//   } as PostCreationType;

//   const post = new PostCreationModel(reqBody);

//   validateModel(post);

//   await PostDatasource.createPost(post);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const createReaction: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const reqBody: Record<string, any> = {
//     postId: req.params.postId,
//     userId: userId,
//     ...req.body,
//   };

//   const reaction = new ReactionModel(reqBody as ReactionType);

//   validateModel(reaction);

//   const postExists: boolean = await PostDatasource.postExists(
//     req.params.postId
//   );
//   if (!postExists) {
//     throw new Error("Post not found!");
//   }

//   await PostDatasource.createReaction(reaction);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const createComment: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const reqBody: Record<string, any> = {
//     ...req.body,
//     userId: userId,
//   };

//   const comment = new CommentModel(reqBody as CommentType);

//   validateModel(comment);

//   if (comment.level === 0 && comment.parentCommentId !== null) {
//     throw new Error("parentCommentId must be null if level = 0");
//   }
//   if (comment.level > 0 && comment.parentCommentId === null) {
//     throw new Error("parentCommentId required if level > 0");
//   }

//   const postExists: boolean = await PostDatasource.postExists(
//     comment.postId.toString()
//   );
//   if (!postExists) {
//     throw new Error("Post not found!");
//   }

//   if (comment.level > 0) {
//     const parentCommentExists: boolean =
//       await PostDatasource.parentCommentExists(
//         comment.postId.toString(),
//         comment.parentCommentId!.toString()
//       );
//     if (!parentCommentExists) {
//       throw new Error("Parent comment not found!");
//     }
//   }

//   await PostDatasource.createComment(comment);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const getCommentsByPostId: RequestHandler = async (req, res, next) => {
//   await JwtService.verifyJwt(req.headers);

//   const postId = req.params.postId as string | undefined | null;
//   if (postId === undefined || postId === null) {
//     throw new Error("Post ID is required.");
//   }

//   const postExists: boolean = await PostDatasource.postExists(postId);
//   if (!postExists) {
//     throw new Error("Post not found!");
//   }

//   const comments = await PostDatasource.getCommentsByPostId(postId);

//   const tree = arrayToTree(comments, {
//     id: "_id",
//     parentId: "parentCommentId",
//     nestedIds: false,
//     childrenField: "replies",
//     dataField: null,
//   });

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//     data: tree,
//   });
// };

// export const getPosts: RequestHandler = async (req, res, next) => {
//   await JwtService.verifyJwt(req.headers);

//   const page = parseInt(req.params.page);
//   const posts = await PostDatasource.getPosts(page);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//     data: posts,
//   });
// };

// export const deletePost: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const postId = req.params.postId as string | undefined | null;
//   if (postId === undefined || postId === null) {
//     throw new Error("Post ID is required.");
//   }

//   await PostDatasource.deletePost(postId, userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const deleteComment: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const commentId = req.params.commentId as string | undefined | null;
//   if (commentId === undefined || commentId === null) {
//     throw new Error("Comment ID is required.");
//   }

//   await PostDatasource.deleteComment(commentId, userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const getPostsByUserId: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const page = parseInt(req.params.page);

//   const posts = await PostDatasource.getPostsByUserId(page, userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//     data: posts,
//   });
// };

// export const getCommentsByUserId: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const comments = await PostDatasource.getCommentsByUserId(userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//     data: comments,
//   });
// };
