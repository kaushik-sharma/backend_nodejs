import { RequestHandler } from "express";

import { CreateUserModel } from "../models/create_user/create_user_model.js";
import {
  requestHandler,
  successResponseHandler,
} from "../helpers/custom_handlers.js";
import { validateModel } from "../helpers/validation_helpers.js";
import { AuthDatasource } from "../datasources/auth_datasource.js";

interface CreateUserRequestBody {
  name: string;
  email: string;
  dob: Date;
  password: string;
}

export const createUser: RequestHandler = (req, res, next) => {
  requestHandler(next, async () => {
    const reqBody = req.body as CreateUserRequestBody;

    const newUser = new CreateUserModel({
      name: reqBody.name,
      email: reqBody.email,
      dob: reqBody.dob,
      password: reqBody.password,
    });

    validateModel(newUser);

    const createdUser = await AuthDatasource.createUser(newUser);

    successResponseHandler({
      res: res,
      status: 200,
      metadata: { result: true, message: "User created successfully." },
      data: { createdUser: createdUser },
    });
  });
};
