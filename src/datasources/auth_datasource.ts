import { ClientSession } from "mongoose";
import {
  EntityStatus,
  UserModel,
  UserType,
} from "../models/auth/user_model.js";
import { SessionModel } from "../models/session/session_model.js";

export class AuthDatasource {
  static readonly findUserByEmail = async (
    email: string
  ): Promise<UserType | null> => {
    const result = await UserModel.find({
      email: email,
      status: { $ne: EntityStatus.deleted },
    });

    if (result.length === 0) return null;

    // This scenario is not expected to occur, as the sign-up logic enforces
    // a restriction allowing only one active user per email address.
    // If this situation arises, it indicates a potential data inconsistency
    // and requires thorough investigation.
    if (result.length > 1) {
      throw new Error("Multiple active users with a given email found!");
    }

    return result[0] as UserType;
  };

  static readonly findUserByPhoneNumber = async (
    countryCode: string,
    phoneNumber: string
  ): Promise<UserType | null> => {
    const result = await UserModel.find({
      countryCode: countryCode,
      phoneNumber: phoneNumber,
      status: { $ne: EntityStatus.deleted },
    });

    if (result.length === 0) return null;

    // This scenario is not expected to occur, as the sign-up logic enforces
    // a restriction allowing only one active user per phone number.
    // If this situation arises, it indicates a potential data inconsistency
    // and requires thorough investigation.
    if (result.length > 1) {
      throw new Error("Multiple active users with a given phone number found!");
    }

    return result[0] as UserType;
  };

  static readonly canSignUpWithEmail = async (
    email: string
  ): Promise<boolean> => {
    const user = await this.findUserByEmail(email);
    return user === null;
  };

  static readonly canSignUpWithPhoneNumber = async (
    countryCode: string,
    phoneNumber: string
  ): Promise<boolean> => {
    const user = await this.findUserByPhoneNumber(countryCode, phoneNumber);
    return user === null;
  };

  static readonly createUser = async (
    userData: UserType,
    session: ClientSession
  ): Promise<string> => {
    const userModel = new UserModel(userData);
    const createdUser = await userModel.save({ session: session });
    return createdUser.id as string;
  };

  static readonly clearPrevUserSessions = async (
    userId: string
  ): Promise<void> => {
    await SessionModel.deleteMany({ userId: userId });
  };

  static readonly getUserIdFromEmail = async (
    email: string
  ): Promise<string | null> => {
    const user = await this.findUserByEmail(email);
    if (user === null) return null;
    return user!._id;
  };

  static readonly signOutSession = async (
    userId: string,
    sessionId: string
  ): Promise<void> => {
    await SessionModel.deleteOne({ _id: sessionId, userId: userId });
  };

  static readonly signOutAllSessions = async (
    userId: string,
    session?: ClientSession
  ): Promise<void> => {
    await SessionModel.deleteMany({ userId: userId }, { session: session });
  };

  static readonly deleteAccount = async (
    userId: string,
    session: ClientSession
  ): Promise<void> => {
    await UserModel.updateOne(
      {
        _id: userId,
      },
      {
        $set: {
          status: EntityStatus.deleted,
        },
      },
      {
        session: session,
      }
    );
  };

  static readonly isUserActive = async (id: string): Promise<boolean> => {
    const result = await UserModel.findById(id, {status: true});
    
    if (result === null) return false;

    if (result.status !== EntityStatus.active) return false;

    return true;
  };
}
