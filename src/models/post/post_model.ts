import mongoose, { InferSchemaType, Schema, Types } from "mongoose";
import { CollectionNames } from "../../constants/collection_names.js";
import { EntityStatus } from "../auth/user_model.js";

const postCreationSchema = new Schema(
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

postCreationSchema.pre<PostCreationType>("save", function (next) {
  this.status = EntityStatus.active;
  next();
});

export type PostCreationType = InferSchemaType<typeof postCreationSchema>;

export const PostCreationModel = mongoose.model<PostCreationType>(
  "PostCreationModel",
  postCreationSchema,
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
