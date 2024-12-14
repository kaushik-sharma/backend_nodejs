// import { UserModel } from "../models/auth/user_model.js";
// import { ContentReporterModel } from "../models/moderation/content_reporter_model.js";
// import {
//   ReportCommentModel,
//   ReportCommentType,
// } from "../models/moderation/report_comment_model.js";
// import {
//   ReportPostModel,
//   ReportPostType,
// } from "../models/moderation/report_post_model.js";
// import {
//   ReportUserModel,
//   ReportUserType,
// } from "../models/moderation/report_user_model.js";
// import { CommentModel } from "../models/post/comment_model.js";
// import { PostCreationModel } from "../models/post/post_model.js";

// export class ModerationDatasource {
//   static readonly reportPost = async (data: ReportPostType): Promise<void> => {
//     const model = new ReportPostModel(data);
//     await model.save();
//   };

//   static readonly reportComment = async (
//     data: ReportCommentType
//   ): Promise<void> => {
//     const model = new ReportCommentModel(data);
//     await model.save();
//   };

//   static readonly reportUser = async (data: ReportUserType): Promise<void> => {
//     const model = new ReportUserModel(data);
//     await model.save();
//   };

//   static readonly postReportCount = async (id: string): Promise<number> => {
//     return await ReportPostModel.countDocuments({ postId: id });
//   };

//   static readonly markPostForManualReview = async (
//     id: string
//   ): Promise<void> => {
//     await PostCreationModel.updateOne(
//       { _id: id },
//       {
//         $set: {
//           needsManualReview: true,
//           isActive: false,
//         },
//       }
//     );
//   };

//   static readonly commentReportCount = async (id: string): Promise<number> => {
//     return await ReportCommentModel.countDocuments({ commentId: id });
//   };

//   static readonly markCommentForManualReview = async (
//     id: string
//   ): Promise<void> => {
//     await CommentModel.updateOne(
//       { _id: id },
//       {
//         $set: {
//           needsManualReview: true,
//           isActive: false,
//         },
//       }
//     );
//   };

//   static readonly userReportedCount = async (id: string): Promise<number> => {
//     return await ReportUserModel.countDocuments({ userId: id });
//   };

//   static readonly markUserForManualReview = async (
//     id: string
//   ): Promise<void> => {
//     await UserModel.updateOne(
//       { _id: id },
//       {
//         $set: {
//           needsManualReview: true,
//           isActive: false,
//         },
//       }
//     );
//   };

//   static readonly getUserReportQuotaUsage = async (
//     userId: string
//   ): Promise<number> => {
//     return await ContentReporterModel.countDocuments({ userId: userId });
//   };

//   static readonly recordUserReportCount = async (
//     userId: string
//   ): Promise<void> => {
//     const model = new ContentReporterModel({ userId: userId });
//     await model.save();
//   };
// }
