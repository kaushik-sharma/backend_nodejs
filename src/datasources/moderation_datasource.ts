import { EntityStatus, UserModel } from "../models/auth/user_model.js";
import {
  ContentReporterModel,
  ContentReporterType,
} from "../models/moderation/content_reporter_model.js";
import {
  ReportCommentModel,
  ReportCommentType,
} from "../models/moderation/report_comment_model.js";
import {
  ReportPostModel,
  ReportPostType,
} from "../models/moderation/report_post_model.js";
import {
  ReportUserModel,
  ReportUserType,
} from "../models/moderation/report_user_model.js";
import { CommentModel } from "../models/post/comment_model.js";
import { PostCreationModel } from "../models/post/post_model.js";

export class ModerationDatasource {
  static readonly reportPost = async (data: ReportPostType): Promise<void> => {
    const model = new ReportPostModel(data);
    await model.save();
  };

  static readonly postReportCount = async (postId: string): Promise<number> => {
    return await ReportPostModel.countDocuments({ postId: postId });
  };

  static readonly markPostForManualReview = async (
    postId: string
  ): Promise<void> => {
    await PostCreationModel.updateOne(
      { _id: postId },
      {
        $set: {
          status: EntityStatus.underReview,
        },
      }
    );
  };

  static readonly reportComment = async (
    data: ReportCommentType
  ): Promise<void> => {
    const model = new ReportCommentModel(data);
    await model.save();
  };

  static readonly commentReportCount = async (
    commentId: string
  ): Promise<number> => {
    return await ReportCommentModel.countDocuments({ commentId: commentId });
  };

  static readonly markCommentForManualReview = async (
    commentId: string
  ): Promise<void> => {
    await CommentModel.updateOne(
      { _id: commentId },
      {
        $set: {
          status: EntityStatus.underReview,
        },
      }
    );
  };

  static readonly reportUser = async (data: ReportUserType): Promise<void> => {
    const model = new ReportUserModel(data);
    await model.save();
  };

  static readonly userReportedCount = async (
    userId: string
  ): Promise<number> => {
    return await ReportUserModel.countDocuments({ userId: userId });
  };

  static readonly markUserForManualReview = async (
    userId: string
  ): Promise<void> => {
    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          status: EntityStatus.underReview,
        },
      }
    );
  };

  static readonly getUserReportQuotaUsage = async (
    userId: string
  ): Promise<number> => {
    return await ContentReporterModel.countDocuments({ userId: userId });
  };

  static readonly recordUserReportCount = async (
    data: ContentReporterType
  ): Promise<void> => {
    const model = new ContentReporterModel(data);
    await model.save();
  };
}
