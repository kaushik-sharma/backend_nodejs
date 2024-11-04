import { Document } from "mongoose";

export function validateModel<T extends Document>(model: T): void {
  const error = model.validateSync();

  if (error !== undefined && error !== null) {
    const errors = Object.values(error.errors);

    if (errors.length === 0) return;

    const firstError = errors[0];
    throw new Error(firstError.message);
  }
}
