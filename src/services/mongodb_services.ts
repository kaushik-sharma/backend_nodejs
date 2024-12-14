import mongoose from "mongoose";

export class MongoDbServices {
  static connect = async (): Promise<void> => {
    await mongoose.connect(process.env.MONGODB_BASE_URL!);
  };
}
