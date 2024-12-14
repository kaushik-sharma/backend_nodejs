import mongoose, { Schema, InferSchemaType } from "mongoose";

import {
  COUNTRY_CODE_REGEX,
  PHONE_NUMBER_REGEX,
} from "../../constants/validators.js";

export enum AuthUserAction {
  signIn = "SIGN_IN",
  signUp = "SIGN_UP",
  banned = "BANNED",
  underReview = "UNDER_REVIEW",
}

const phoneNumberSchema = new Schema(
  {
    countryCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => COUNTRY_CODE_REGEX.test(value),
        message: "Country code is invalid.",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => PHONE_NUMBER_REGEX.test(value),
        message: "Phone number is invalid.",
      },
    },
  },
  { _id: false, versionKey: false, autoCreate: false }
);

export type PhoneNumberType = InferSchemaType<typeof phoneNumberSchema>;

export const PhoneNumberModel = mongoose.model<PhoneNumberType>(
  "PhoneNumberModel",
  phoneNumberSchema
);

const signInSchema = new Schema(
  {
    countryCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => COUNTRY_CODE_REGEX.test(value),
        message: "Country code is invalid.",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => PHONE_NUMBER_REGEX.test(value),
        message: "Phone number is invalid.",
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
      maxLength: 255,
    },
  },
  { _id: false, versionKey: false, autoCreate: false }
);

export type SignInType = InferSchemaType<typeof signInSchema>;

export const SignInModel = mongoose.model<SignInType>(
  "SignInModel",
  signInSchema
);
