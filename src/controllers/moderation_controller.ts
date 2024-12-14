// import { RequestHandler, Response } from "express";
// import { JwtService } from "../services/jwt_service.js";
// import {
//   ReportPostModel,
//   ReportPostType,
// } from "../models/moderation/report_post_model.js";
// import { validateModel } from "../helpers/validation_helpers.js";
// import { ModerationDatasource } from "../datasources/moderation_datasource.js";
// import { successResponseHandler } from "../helpers/custom_handlers.js";
// import {
//   ReportCommentModel,
//   ReportCommentType,
// } from "../models/moderation/report_comment_model.js";
// import { PostDatasource } from "../datasources/post_datasource.js";
// import {
//   ReportUserModel,
//   ReportUserRequestModel,
//   ReportUserRequestType,
//   ReportUserType,
// } from "../models/moderation/report_user_model.js";
// import { AuthDatasource } from "../datasources/auth_datasource.js";
// import {
//   COMMENT_REPORT_REVIEW_THRESHOLD,
//   MAX_CONTENT_REPORTING_LIMIT_PER_USER,
//   POST_REPORT_REVIEW_THRESHOLD,
//   USER_REPORT_REVIEW_THRESHOLD,
// } from "../constants/values.js";

// // TODO: Perform operations in a tranx

// export const reportPost: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const reportPostModel = new ReportPostModel(req.body as ReportPostType);

//   validateModel(reportPostModel);

//   if (!(await _canUserReportContent(userId))) {
//     _sendReportLimitExceededResponse(res);
//     return;
//   }

//   const postUserId = await PostDatasource.getPostUserId(
//     reportPostModel.postId!.toString()
//   );
//   if (postUserId === null) {
//     throw new Error("Post not found!");
//   }
//   if (userId === postUserId) {
//     throw new Error("Can not report your own post!");
//   }

//   await ModerationDatasource.reportPost(reportPostModel);

//   const postReportCount = await ModerationDatasource.postReportCount(
//     reportPostModel.postId!.toString()
//   );

//   if (postReportCount >= POST_REPORT_REVIEW_THRESHOLD) {
//     await ModerationDatasource.markPostForManualReview(
//       reportPostModel.postId!.toString()
//     );
//   }

//   await _recordUserReportCount(userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const reportComment: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const reportCommentModel = new ReportCommentModel(
//     req.body as ReportCommentType
//   );

//   validateModel(reportCommentModel);

//   if (!(await _canUserReportContent(userId))) {
//     _sendReportLimitExceededResponse(res);
//     return;
//   }

//   const commentUserId = await PostDatasource.getCommentUserId(
//     reportCommentModel.commentId!.toString()
//   );
//   if (commentUserId === null) {
//     throw new Error("Comment not found!");
//   }
//   if (userId === commentUserId) {
//     throw new Error("Can not report your own comment!");
//   }

//   await ModerationDatasource.reportComment(reportCommentModel);

//   const commentReportCount = await ModerationDatasource.commentReportCount(
//     reportCommentModel.commentId!.toString()
//   );

//   if (commentReportCount >= COMMENT_REPORT_REVIEW_THRESHOLD) {
//     await ModerationDatasource.markCommentForManualReview(
//       reportCommentModel.commentId!.toString()
//     );
//   }

//   await _recordUserReportCount(userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// export const reportUser: RequestHandler = async (req, res, next) => {
//   const userId = await JwtService.verifyJwt(req.headers);

//   const reportUserRequestModel = new ReportUserRequestModel(
//     req.body as ReportUserRequestType
//   );

//   validateModel(reportUserRequestModel);

//   if (!(await _canUserReportContent(userId))) {
//     _sendReportLimitExceededResponse(res);
//     return;
//   }

//   const reportedUserId = await AuthDatasource.getUserIdFromEmail(
//     reportUserRequestModel.reportedUserEmail
//   );
//   if (reportedUserId === undefined) {
//     throw new Error("User not found!");
//   }

//   const reportUserData: Record<string, any> = {
//     userId: reportedUserId,
//     reason: reportUserRequestModel.reason,
//   };

//   const reportUserModel = new ReportUserModel(reportUserData as ReportUserType);

//   validateModel(reportUserModel);

//   if (userId === reportedUserId) {
//     throw new Error("Can not report yourself!");
//   }

//   await ModerationDatasource.reportUser(reportUserModel);

//   const userReportedCount = await ModerationDatasource.userReportedCount(
//     reportUserModel.userId!.toString()
//   );

//   if (userReportedCount >= USER_REPORT_REVIEW_THRESHOLD) {
//     await ModerationDatasource.markUserForManualReview(
//       reportUserModel.userId!.toString()
//     );
//     await AuthDatasource.clearPrevUserSessions(reportedUserId);
//   }

//   await _recordUserReportCount(userId);

//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: { result: true },
//   });
// };

// const _canUserReportContent = async (userId: string): Promise<boolean> => {
//   const count = await ModerationDatasource.getUserReportQuotaUsage(userId);
//   return count < MAX_CONTENT_REPORTING_LIMIT_PER_USER;
// };

// const _sendReportLimitExceededResponse = (res: Response): void => {
//   successResponseHandler({
//     res: res,
//     status: 200,
//     metadata: {
//       result: false,
//       message: "You have exceeded your daily reporting limit.",
//     },
//   });
// };

// const _recordUserReportCount = async (userId: string): Promise<void> => {
//   await ModerationDatasource.recordUserReportCount(userId);
// };
