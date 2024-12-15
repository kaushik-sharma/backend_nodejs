import mongoose, { Schema, InferSchemaType } from "mongoose";
import validator from "validator";

import { CollectionNames } from "../../constants/collection_names.js";
import {
  getMidnightDate,
  subtractYearsFromDate,
} from "../../utils/date_utils.js";
import {
  DEFAULT_PROFILE_IMAGE_URL,
  MIN_ACCOUNT_OPENING_AGE,
} from "../../constants/values.js";
import {
  COUNTRY_CODE_REGEX,
  PHONE_NUMBER_REGEX,
} from "../../constants/validators.js";
import { BcryptService } from "../../services/bcrypt_service.js";

export enum EntityStatus {
  active = "ACTIVE",
  deleted = "DELETED",
  banned = "BANNED",
  underReview = "UNDER_REVIEW",
}

export enum Gender {
  male = "MALE",
  female = "FEMALE",
  nonBinary = "NON_BINARY",
}

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 30,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 30,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(Gender),
    },
    countryCode: {
      type: String,
      index: 1,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => COUNTRY_CODE_REGEX.test(value),
        message: "Country code is invalid.",
      },
    },
    phoneNumber: {
      type: String,
      index: 1,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => PHONE_NUMBER_REGEX.test(value),
        message: "Phone number is invalid.",
      },
    },
    email: {
      type: String,
      index: 1,
      required: true,
      minLength: 1,
      maxLength: 255,
      trim: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Email address is invalid.",
      },
    },
    dob: {
      type: Date,
      required: true,
      min: new Date(1900),
      max: getMidnightDate(
        subtractYearsFromDate(new Date(), MIN_ACCOUNT_OPENING_AGE)
      ),
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      maxLength: 255,
    },
    profileImageUrl: String,
    status: {
      type: String,
      enum: Object.values(EntityStatus),
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.pre<UserType>("save", async function (next) {
  // Hash the password before saving
  const hashedPassword = await BcryptService.hash(this.password);
  this.password = hashedPassword;

  // Save the DoB as the midnight date
  this.dob = getMidnightDate(this.dob);

  this.profileImageUrl = DEFAULT_PROFILE_IMAGE_URL;

  this.status = EntityStatus.active;

  next();
});

export type UserType = InferSchemaType<typeof userSchema> & {
  _id: string;
};

export const UserModel = mongoose.model<UserType>(
  "UserModel",
  userSchema,
  CollectionNames.users
);
