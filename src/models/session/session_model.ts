import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

import { CollectionNames } from "../../constants/collection_names.js";

const sessionSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

export type SessionType = InferSchemaType<typeof sessionSchema>;

export const SessionModel = mongoose.model<SessionType>(
  "SessionModel",
  sessionSchema,
  CollectionNames.sessions
);
