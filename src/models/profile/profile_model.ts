import mongoose, { Schema, InferSchemaType } from "mongoose";

const profileSchema = new Schema(
  {
    name: String,
    gender: String,
    phoneNumber: Object,
    email: String,
    dob: Date,
  },
  { _id: false, timestamps: true, versionKey: false, autoCreate: false }
);

export type ProfileType = InferSchemaType<typeof profileSchema>;

export const ProfileModel = mongoose.model<ProfileType>(
  "ProfileModel",
  profileSchema
);
