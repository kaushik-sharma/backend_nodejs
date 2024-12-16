import { ObjectId } from "mongodb";

import { CommentModel, CommentType } from "../models/post/comment_model.js";
import {
  PostCreationModel,
  PostCreationType,
  PostFeedModel,
  PostFeedType,
} from "../models/post/post_model.js";
import {
  EmotionType,
  ReactionModel,
  ReactionType,
} from "../models/post/reaction_model.js";
import { AuthDatasource } from "./auth_datasource.js";
import { EntityStatus } from "../models/auth/user_model.js";
import { COMMENTS_PAGE_SIZE, POSTS_PAGE_SIZE } from "../constants/values.js";

export class PostDatasource {
  static readonly createPost = async (
    postData: PostCreationType
  ): Promise<void> => {
    const post = new PostCreationModel(postData);
    await post.save();
  };

  static readonly postExists = async (id: string): Promise<boolean> => {
    const result = await PostCreationModel.findOne(
      { _id: id, status: EntityStatus.active },
      { userId: true }
    );
    if (result === null) return false;

    const isUserActive = await AuthDatasource.isUserActive(
      result!.userId.toString()
    );
    if (!isUserActive) return false;

    return true;
  };

  static readonly createReaction = async (
    reactionData: ReactionType
  ): Promise<void> => {
    const reaction = new ReactionModel(reactionData);

    /// Check if the user already has a reaction for that post
    const prevReaction = await ReactionModel.findOne(
      {
        postId: reaction.postId,
        userId: reaction.userId,
      },
      { emotionType: true }
    );

    /// If it is a new reaction, then save it
    if (prevReaction === null) {
      await reaction.save();
      return;
    }

    if (reaction.emotionType === prevReaction.emotionType) {
      /// If same reaction as before then delete it
      await ReactionModel.deleteOne({
        postId: reaction.postId,
        userId: reaction.userId,
      });
    } else {
      /// Else update it to the new reaction
      await ReactionModel.updateOne(
        {
          postId: reaction.postId,
          userId: reaction.userId,
        },
        { $set: { emotionType: reaction.emotionType } }
      );
    }
  };

  static readonly commentExists = async (
    commentId: string,
    postId?: string
  ): Promise<boolean> => {
    const query: Record<string, any> = {
      _id: commentId,
      status: EntityStatus.active,
    };
    if (postId !== undefined) {
      query.postId = postId;
    }

    const result = await CommentModel.findOne(query, { userId: true });
    if (result === null) return false;

    const isUserActive = await AuthDatasource.isUserActive(
      result!.userId.toString()
    );
    if (!isUserActive) return false;

    return true;
  };

  static readonly isCommentLevelValid = async (
    commentId: string,
    level: number
  ): Promise<boolean> => {
    const result = await CommentModel.findOne(
      {
        _id: commentId,
        level: level,
      },
      { _id: true }
    );
    return result !== null;
  };

  static readonly createComment = async (
    commentData: CommentType
  ): Promise<void> => {
    const comment = new CommentModel(commentData);
    await comment.save();
  };

  static readonly getCommentsByPostId = async (
    postId: string
  ): Promise<CommentType[]> => {
    return await CommentModel.aggregate<CommentType>([
      { $match: { postId: new ObjectId(postId) } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          parentCommentId: 1,
          text: {
            $cond: {
              if: { $eq: ["$status", EntityStatus.active] },
              then: "$text",
              else: null,
            },
          },
          // _id: {
          //   $cond: {
          //     if: { $eq: ["$status", EntityStatus.active] },
          //     then: "$_id",
          //     else: null,
          //   },
          // },
        },
      },
    ]);
  };

  static readonly getPostUserId = async (postId: string): Promise<string> => {
    const result = await PostCreationModel.findOne(
      {
        _id: postId,
        status: EntityStatus.active,
      },
      {
        userId: true,
      }
    );
    return result!.userId.toString();
  };

  static readonly deletePost = async (
    postId: string,
    userId: string
  ): Promise<void> => {
    await PostCreationModel.updateOne(
      {
        _id: postId,
        userId: userId,
      },
      { $set: { status: EntityStatus.deleted } }
    );
  };

  static readonly getCommentUserId = async (
    commentId: string
  ): Promise<string> => {
    const result = await CommentModel.findOne(
      { _id: commentId, status: EntityStatus.active },
      { userId: true }
    );
    return result!.userId.toString();
  };

  static readonly deleteComment = async (
    commentId: string,
    userId: string
  ): Promise<void> => {
    await CommentModel.updateOne(
      {
        _id: commentId,
        userId: userId,
      },
      {
        $set: { status: EntityStatus.deleted },
      }
    );
  };

  static readonly #postsAggregatePipeline = async (
    userId: string | null,
    page: number
  ): Promise<PostFeedType[]> => {
    const matchStage: Record<string, any> = { status: EntityStatus.active };

    if (userId !== null) {
      matchStage.userId = new ObjectId(userId!);
    }

    return await PostCreationModel.aggregate<PostFeedType>([
      { $match: matchStage },
      // Join reactions to calculate like and dislike counts
      {
        $lookup: {
          from: "reactions",
          let: { postId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
            { $group: { _id: "$emotionType", count: { $sum: 1 } } },
          ],
          as: "reactionCounts",
        },
      },
      {
        $addFields: {
          likes: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$reactionCounts",
                      as: "r",
                      cond: { $eq: ["$$r._id", EmotionType.like] },
                    },
                  },
                  0,
                ],
              },
              { count: 0 },
            ],
          },
          dislikes: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$reactionCounts",
                      as: "r",
                      cond: { $eq: ["$$r._id", EmotionType.dislike] },
                    },
                  },
                  0,
                ],
              },
              { count: 0 },
            ],
          },
        },
      },
      // Join comments to count them directly
      {
        $lookup: {
          from: "comments",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$postId", "$$postId"] }],
                },
              },
            },
            { $count: "commentCount" },
          ],
          as: "comments",
        },
      },
      {
        $addFields: {
          comments: {
            $ifNull: [{ $arrayElemAt: ["$comments.commentCount", 0] }, 0],
          },
        },
      },
      // Join users to get author details
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                firstName: 1,
                lastName: 1,
                profileImageUrl: 1,
                status: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $addFields: {
          user: {
            $ifNull: [{ $arrayElemAt: ["$user", 0] }, {}],
          },
        },
      },
      // Filter out posts where the user's status is not ACTIVE
      {
        $match: {
          "user.status": EntityStatus.active,
        },
      },
      // Project only the necessary fields
      {
        $project: {
          _id: 1,
          text: 1,
          likes: "$likes.count",
          dislikes: "$dislikes.count",
          comments: 1,
          firstName: "$user.firstName",
          lastName: "$user.lastName",
          profileImageUrl: "$user.profileImageUrl",
          createdAt: 1,
        },
      },
      // Add pagination stages
      { $skip: page * POSTS_PAGE_SIZE },
      { $limit: POSTS_PAGE_SIZE },
    ]);
  };

  static readonly getPostsByUserId = async (
    userId: string,
    page: number
  ): Promise<PostFeedType[]> => {
    return await PostDatasource.#postsAggregatePipeline(userId, page);
  };

  static readonly getCommentsByUserId = async (
    userId: string,
    page: number
  ): Promise<CommentType[]> => {
    return await CommentModel.find(
      { userId: userId, status: EntityStatus.active },
      {
        userId: false,
        parentCommentId: false,
        level: false,
        status: false,
        createdAt: false,
        updatedAt: false,
      }
    )
      .skip(page * COMMENTS_PAGE_SIZE)
      .limit(COMMENTS_PAGE_SIZE)
      .exec();
  };

  static readonly getPostsFeed = async (
    page: number
  ): Promise<PostFeedType[]> => {
    const docs = await PostDatasource.#postsAggregatePipeline(null, page);

    const posts: PostFeedType[] = [];
    for (const doc of docs) {
      posts.push(new PostFeedModel(doc));
    }

    return posts;
  };
}
