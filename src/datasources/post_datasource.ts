// import { ObjectId } from "mongodb";

// import { CommentModel, CommentType } from "../models/post/comment_model.js";
// import {
//   PostCreationModel,
//   PostCreationType,
//   PostResponseType,
// } from "../models/post/post_model.js";
// import {
//   EmotionType,
//   ReactionModel,
//   ReactionType,
// } from "../models/post/reaction_model.js";
// import { POSTS_PAGE_SIZE } from "../constants/values.js";

// export class PostDatasource {
//   static readonly createPost = async (
//     postData: PostCreationType
//   ): Promise<void> => {
//     const post = new PostCreationModel(postData);
//     await post.save();
//   };

//   static readonly postExists = async (id: string): Promise<boolean> => {
//     const result = await PostCreationModel.findById(id);
//     return result !== null && result.isActive!;
//   };

//   static readonly getPostUserId = async (
//     postId: string
//   ): Promise<string | null> => {
//     const result = await PostCreationModel.findOne(
//       {
//         _id: postId,
//         isActive: true,
//       },
//       {
//         userId: true,
//       }
//     );
//     if (result === null) return null;
//     return result!.userId.toString();
//   };

//   static readonly createReaction = async (
//     reactionData: ReactionType
//   ): Promise<void> => {
//     const reaction = new ReactionModel(reactionData);

//     /// Check if the user already has a reaction for that post
//     const prevReaction = await ReactionModel.findOne({
//       postId: reaction.postId,
//       userId: reaction.userId,
//     });

//     /// If new reaction then save it
//     if (prevReaction === null) {
//       await reaction.save();
//       return;
//     }

//     if (reaction.emotionType === prevReaction.emotionType) {
//       /// If same reaction as before then delete it
//       await ReactionModel.deleteOne({
//         postId: reaction.postId,
//         userId: reaction.userId,
//       });
//     } else {
//       /// Else update it to the new reaction
//       await ReactionModel.updateOne(
//         {
//           postId: reaction.postId,
//           userId: reaction.userId,
//         },
//         { $set: { emotionType: reaction.emotionType } }
//       );
//     }
//   };

//   static readonly parentCommentExists = async (
//     postId: string,
//     parentCommentId: string
//   ): Promise<boolean> => {
//     const result = await CommentModel.findOne({
//       _id: parentCommentId,
//       postId: postId,
//     });
//     return result !== null && result.isActive!;
//   };

//   static readonly createComment = async (
//     commentData: CommentType
//   ): Promise<void> => {
//     const comment = new CommentModel(commentData);
//     await comment.save();
//   };

//   static readonly getCommentsByPostId = async (
//     postId: string
//   ): Promise<CommentType[]> => {
//     return await CommentModel.aggregate<CommentType>([
//       { $match: { postId: new ObjectId(postId) } },
//       { $sort: { createdAt: 1 } },
//       {
//         $project: {
//           parentCommentId: 1,
//           text: {
//             $cond: {
//               if: { $eq: ["$isActive", true] },
//               then: "$text",
//               else: null,
//             },
//           },
//           // _id: {
//           //   $cond: {
//           //     if: { $eq: ["$isActive", true] },
//           //     then: "$_id",
//           //     else: null,
//           //   },
//           // },
//         },
//       },
//     ]);
//   };

//   static readonly getCommentUserId = async (commentId: string): Promise<string | null> => {
//     const result = await CommentModel.findOne({_id: commentId, isActive: true}, {userId: true});
//     if (result === null) return null;
//     return result!.userId.toString();
//   };

//   static readonly #postsAggregatePipeline = async (
//     page: number,
//     userId?: string
//   ): Promise<PostResponseType[]> => {
//     const matchStage: Record<string, any> = { isActive: true };

//     if (userId !== undefined) {
//       matchStage.userId = new ObjectId(userId!);
//     }

//     return await PostCreationModel.aggregate([
//       { $match: matchStage },
//       // Join reactions to calculate like and dislike counts
//       {
//         $lookup: {
//           from: "reactions",
//           let: { postId: "$_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
//             { $group: { _id: "$emotionType", count: { $sum: 1 } } },
//           ],
//           as: "reactionCounts",
//         },
//       },
//       {
//         $addFields: {
//           likes: {
//             $ifNull: [
//               {
//                 $arrayElemAt: [
//                   {
//                     $filter: {
//                       input: "$reactionCounts",
//                       as: "r",
//                       cond: { $eq: ["$$r._id", EmotionType.like] },
//                     },
//                   },
//                   0,
//                 ],
//               },
//               { count: 0 },
//             ],
//           },
//           dislikes: {
//             $ifNull: [
//               {
//                 $arrayElemAt: [
//                   {
//                     $filter: {
//                       input: "$reactionCounts",
//                       as: "r",
//                       cond: { $eq: ["$$r._id", EmotionType.dislike] },
//                     },
//                   },
//                   0,
//                 ],
//               },
//               { count: 0 },
//             ],
//           },
//         },
//       },
//       // Join comments to count them directly
//       {
//         $lookup: {
//           from: "comments",
//           let: { postId: "$_id" },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ["$postId", "$$postId"] },
//                     // Only count active comments
//                     { $eq: ["$isActive", true] },
//                   ],
//                 },
//               },
//             },
//             { $count: "commentCount" },
//           ],
//           as: "comments",
//         },
//       },
//       {
//         $addFields: {
//           comments: {
//             $ifNull: [{ $arrayElemAt: ["$comments.commentCount", 0] }, 0],
//           },
//         },
//       },
//       // Project only the necessary fields
//       {
//         $project: {
//           _id: 1,
//           text: 1,
//           likes: "$likes.count",
//           dislikes: "$dislikes.count",
//           comments: 1,
//         },
//       },
//       // Add pagination stages
//       { $skip: page * POSTS_PAGE_SIZE },
//       { $limit: POSTS_PAGE_SIZE },
//     ]);
//   };

//   static readonly getPosts = async (
//     page: number
//   ): Promise<PostResponseType[]> => {
//     return await PostDatasource.#postsAggregatePipeline(page);
//   };

//   static readonly getPostsByUserId = async (
//     page: number,
//     userId: string
//   ): Promise<PostResponseType[]> => {
//     return await PostDatasource.#postsAggregatePipeline(page, userId);
//   };

//   static readonly deletePost = async (
//     postId: string,
//     userId: string
//   ): Promise<void> => {
//     const result = await PostCreationModel.updateOne(
//       {
//         _id: postId,
//         userId: userId,
//       },
//       { $set: { isDeleted: true, isActive: false } }
//     );

//     if (result.matchedCount === 0) {
//       throw new Error("Post not found!");
//     }
//   };

//   static readonly deleteComment = async (
//     commentId: string,
//     userId: string
//   ): Promise<void> => {
//     const result = await CommentModel.updateOne(
//       {
//         _id: commentId,
//         userId: userId,
//       },
//       {
//         $set: { isDeleted: true, isActive: false },
//       }
//     );

//     if (result.matchedCount === 0) {
//       throw new Error("Comment not found!");
//     }
//   };

//   static readonly getCommentsByUserId = async (
//     userId: string
//   ): Promise<CommentType[]> => {
//     return await CommentModel.find(
//       { userId: userId },
//       {
//         userId: false,
//         parentCommentId: false,
//         level: false,
//         isActive: false,
//         createdAt: false,
//         updatedAt: false,
//       }
//     );
//   };

//   static readonly commentExists = async (id: string): Promise<boolean> => {
//     const result = await CommentModel.findById(id);
//     return result !== null && result.isActive!;
//   };
// }
