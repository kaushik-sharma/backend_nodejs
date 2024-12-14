import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";
import { MAX_COMMENT_DEPTH } from "../../constants/values.js";
import { EntityStatus } from "../auth/user_model.js";

const commentSchema = new Schema(
  {
    postId: { type: Types.ObjectId, index: 1, required: true },
    userId: { type: Types.ObjectId, index: 1, required: true },
    parentCommentId: { type: Types.ObjectId },
    level: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) => value >= 0 && value < MAX_COMMENT_DEPTH,
        message: `Level must be less than ${MAX_COMMENT_DEPTH}.`,
      },
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 255,
    },
    status: {
      type: String,
      enum: Object.values(EntityStatus),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

commentSchema.pre<CommentType>("save", function (next) {
  this.status = EntityStatus.active;
  next();
});

export type CommentType = InferSchemaType<typeof commentSchema> & {
  _id: string;
};

export const CommentModel = mongoose.model<CommentType>(
  "CommentModel",
  commentSchema,
  CollectionNames.comments
);
