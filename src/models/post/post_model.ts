import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";
import { EntityStatus } from "../auth/user_model.js";

const postSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      index: 1,
      required: true,
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

postSchema.pre<PostType>("save", function (next) {
  this.status = EntityStatus.active;
  next();
});

export type PostType = InferSchemaType<typeof postSchema>;

export const PostModel = mongoose.model<PostType>(
  "PostModel",
  postSchema,
  CollectionNames.posts
);

const postFeedSchema = new Schema(
  {
    text: String,
    likes: Number,
    dislikes: Number,
    comments: Number,
    createdAt: Date,
    firstName: String,
    lastName: String,
    profileImageUrl: String,
  },
  {
    timestamps: false,
    versionKey: false,
    autoCreate: false,
  }
);

export type PostFeedType = InferSchemaType<typeof postFeedSchema>;

export const PostFeedModel = mongoose.model<PostFeedType>(
  "PostFeedModel",
  postFeedSchema
);
