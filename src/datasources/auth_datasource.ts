import {
  CreateUserModel,
  CreateUserType,
} from "../models/create_user/create_user_model.js";

export class AuthDatasource {
  static readonly createUser = async (
    userData: CreateUserType
  ): Promise<CreateUserType> => {
    const userModel = new CreateUserModel(userData);
    return await userModel.save();
  };
}
