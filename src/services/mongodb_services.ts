import mongoose from "mongoose";

export class MongoDbServices {
  static connect = async () => {
    await mongoose.connect(process.env.MONGODB_BASE_URL!);
  };
}
