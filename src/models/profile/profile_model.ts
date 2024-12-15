import mongoose, { Schema, InferSchemaType } from "mongoose";

const profileSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    gender: String,
    countryCode: String,
    phoneNumber: String,
    email: String,
    dob: Date,
    profileImageUrl: String,
  },
  { _id: false, timestamps: true, versionKey: false, autoCreate: false }
);

export type ProfileType = InferSchemaType<typeof profileSchema>;

export const ProfileModel = mongoose.model<ProfileType>(
  "ProfileModel",
  profileSchema
);
