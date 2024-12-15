import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";

const contentReporterSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      index: 1,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export type ContentReporterType = InferSchemaType<typeof contentReporterSchema>;

export const ContentReporterModel = mongoose.model<ContentReporterType>(
  "ContentReporterModel",
  contentReporterSchema,
  CollectionNames.contentReporters
);
