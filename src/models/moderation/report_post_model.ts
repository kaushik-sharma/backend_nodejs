import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";

export enum ContentReportReason {
  spam = "SPAM",
  misleading = "MISLEADING",
  hatefulContent = "HATEFUL_CONTENT",
}

const reportPostSchema = new Schema(
  {
    postId: {
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

export type ReportPostType = InferSchemaType<typeof reportPostSchema>;

export const ReportPostModel = mongoose.model<ReportPostType>(
  "ReportPostModel",
  reportPostSchema,
  CollectionNames.reportedPosts
);
