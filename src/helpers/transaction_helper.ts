import mongoose, { ClientSession } from "mongoose";

export const performTransaction = async <T>(task: (session: ClientSession) => Promise<T>): Promise<T> => {
  const session = await mongoose.startSession();
  let result: T | null = null;
  let error: any | null = null;

  try {
    session.startTransaction();
    result = await task(session);
    await session.commitTransaction();    
  } catch (err) {
    error = err;
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }

  if (result === null) {
    throw error!;
  }

  return result!;
};
