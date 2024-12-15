import { RequestHandler } from "express";

import {
  EntityStatus,
  UserModel,
  UserType,
} from "../models/auth/user_model.js";
import { successResponseHandler } from "../helpers/custom_handlers.js";
import { validateModel } from "../helpers/validation_helpers.js";
import { AuthDatasource } from "../datasources/auth_datasource.js";
import { JwtService } from "../services/jwt_service.js";
import {
  AuthUserAction,
  PhoneNumberModel,
  PhoneNumberType,
  SignInModel,
  SignInType,
} from "../models/auth/sign_in_model.js";
import { BcryptService } from "../services/bcrypt_service.js";
import { performTransaction } from "../helpers/transaction_helper.js";

export const checkPhoneNumber: RequestHandler = async (req, res, next) => {
  const phoneNumberModel = new PhoneNumberModel(req.body as PhoneNumberType);

  validateModel(phoneNumberModel);

  const user = await AuthDatasource.findUserByPhoneNumber(
    phoneNumberModel.countryCode,
    phoneNumberModel.phoneNumber
  );

  if (user === null) {
    successResponseHandler({
      res: res,
      status: 200,
      metadata: { result: true },
      data: { userAction: AuthUserAction.signUp },
    });
    return;
  }

  if (user!.status! === EntityStatus.active) {
    successResponseHandler({
      res: res,
      status: 200,
      metadata: { result: true },
      data: { userAction: AuthUserAction.signIn },
    });
    return;
  }

  if (user!.status! === EntityStatus.banned) {
    successResponseHandler({
      res: res,
      status: 200,
      metadata: { result: false },
      data: { userAction: AuthUserAction.banned },
    });
    return;
  }

  if (user!.status! === EntityStatus.underReview) {
    successResponseHandler({
      res: res,
      status: 200,
      metadata: { result: false },
      data: { userAction: AuthUserAction.underReview },
    });
    return;
  }
};

export const signUp: RequestHandler = async (req, res, next) => {
  const newUser = new UserModel(req.body as UserType);

  validateModel(newUser);

  const email = newUser.email;
  const countryCode = newUser.countryCode;
  const phoneNumber = newUser.phoneNumber;

  const canSignUpWithEmail = await AuthDatasource.canSignUpWithEmail(email);
  const canSignUpWithPhoneNumber =
    await AuthDatasource.canSignUpWithPhoneNumber(countryCode, phoneNumber);

  if (!canSignUpWithEmail) {
    successResponseHandler({
      res: res,
      status: 200,
      metadata: {
        result: false,
        message: "Account with this email already exists.",
      },
    });
    return;
  }
  if (!canSignUpWithPhoneNumber) {
    throw new Error("Account with this phone number already exists.");
  }

  const authToken = await performTransaction<string>(async (session) => {
    const userId = await AuthDatasource.createUser(newUser, session);
    const authToken = await JwtService.generateJwt(userId, session);
    return authToken;
  });

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: { authToken: authToken },
  });
};

export const signIn: RequestHandler = async (req, res, next) => {
  const signInModel = new SignInModel(req.body as SignInType);

  validateModel(signInModel);

  const user = await AuthDatasource.findUserByPhoneNumber(
    signInModel.countryCode,
    signInModel.phoneNumber
  );

  if (user === null) {
    throw new Error("Account does not exist.");
  }

  const enteredPassword = signInModel.password;
  const savedPassword = user.password;
  const isEqual = await BcryptService.compare(enteredPassword, savedPassword);
  if (!isEqual) {
    successResponseHandler({
      res: res,
      status: 200,
      metadata: { result: false, message: "Incorrect password." },
    });
    return;
  }

  if (user!.status === EntityStatus.banned) {
    throw new Error("Your account is banned. Please contact our support team.");
  }

  if (user!.status === EntityStatus.underReview) {
    throw new Error(
      "Your account is under review due to violation of our moderation guidelines. Please contact our support team."
    );
  }

  const jwt = await JwtService.generateJwt(user._id);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: { authToken: jwt },
  });
};

export const signOut: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  await AuthDatasource.signOutSession(userId, sessionId);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const signOutAllSessions: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  await AuthDatasource.signOutAllSessions(userId);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

export const deleteAccount: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  await performTransaction<void>(async (session) => {
    await AuthDatasource.signOutAllSessions(userId, session);
    await AuthDatasource.deleteAccount(userId, session);
  });

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
  });
};

// TODO: Add refresh auth token function
