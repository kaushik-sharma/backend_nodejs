import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";

export enum EmotionType {
  like = "LIKE",
  dislike = "DISLIKE",
}

const reactionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    postId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    emotionType: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(EmotionType),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type ReactionType = InferSchemaType<typeof reactionSchema>;

export const ReactionModel = mongoose.model<ReactionType>(
  "ReactionModel",
  reactionSchema,
  CollectionNames.reactions
);
