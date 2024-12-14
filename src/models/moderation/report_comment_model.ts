import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";
import { ContentReportReason } from "./report_post_model.js";

const reportCommentSchema = new Schema(
  {
    commentId: {
      type: Types.ObjectId,
      index: 1,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(ContentReportReason),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type ReportCommentType = InferSchemaType<typeof reportCommentSchema>;

export const ReportCommentModel = mongoose.model<ReportCommentType>(
  "ReportCommentModel",
  reportCommentSchema,
  CollectionNames.reportedComments
);
