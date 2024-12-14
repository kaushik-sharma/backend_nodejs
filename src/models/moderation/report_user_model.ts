import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import validator from "validator";

import { CollectionNames } from "../../constants/collection_names.js";

enum UserReportReason {
  spam = "SPAM",
  misleading = "MISLEADING",
  hatefulContent = "HATEFUL_CONTENT",
}

const reportUserSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      index: 1,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(UserReportReason),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type ReportUserType = InferSchemaType<typeof reportUserSchema>;

export const ReportUserModel = mongoose.model<ReportUserType>(
  "ReportUserModel",
  reportUserSchema,
  CollectionNames.reportedUsers
);

const reportUserRequestSchema = new Schema(
  {
    reportedUserEmail: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 255,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Email address is invalid.",
      },
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(UserReportReason),
    },
  },
  {
    _id: false,
    timestamps: false,
    versionKey: false,
    autoCreate: false,
  }
);

export type ReportUserRequestType = InferSchemaType<
  typeof reportUserRequestSchema
>;

export const ReportUserRequestModel = mongoose.model<ReportUserRequestType>(
  "ReportUserRequestModel",
  reportUserRequestSchema
);
