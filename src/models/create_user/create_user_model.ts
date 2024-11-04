import mongoose, { Schema, InferSchemaType } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

import { CollectionNames } from "../../constants/collection_names.js";
import {
  getMidnightDate,
  subtractYearsFromDate,
} from "../../utils/date_utils.js";
import { MIN_ACCOUNT_OPENING_AGE } from "../../constants/values.js";

const createUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 1,
      maxLength: 255,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
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
      minLength: 8,
      maxLength: 255,
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre-save hook to hash the password
createUserSchema.pre<CreateUserType>("save", async function (next) {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

createUserSchema.pre<CreateUserType>("save", async function (next) {
  try {
    this.dob = getMidnightDate(this.dob);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export type CreateUserType = InferSchemaType<typeof createUserSchema>;

export const CreateUserModel = mongoose.model<CreateUserType>(
  "CreateUserModel",
  createUserSchema,
  CollectionNames.users
);
