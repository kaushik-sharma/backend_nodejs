import { UserModel } from "../models/auth/user_model.js";
import { ProfileModel, ProfileType } from "../models/profile/profile_model.js";

export class ProfileDatasource {
  static readonly getUserById = async (
    userId: string
  ): Promise<ProfileType> => {
    const user = await UserModel.findById(userId);
    return new ProfileModel(user);
  };
}
