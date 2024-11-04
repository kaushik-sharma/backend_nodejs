import { NextFunction, Response, ErrorRequestHandler } from "express";

interface Metadata {
  result: boolean;
  message: string;
}

interface SuccessResponseHandlerParams {
  res: Response;
  status: number;
  metadata: Metadata;
  data?: Record<string, any>;
}
type SuccessResponseHandler = (params: SuccessResponseHandlerParams) => void;

export const requestHandler = async (
  next: NextFunction,
  callback: () => Promise<void>
): Promise<void> => {
  try {
    await callback();
  } catch (error) {
    next(error);
  }
};

export const successResponseHandler: SuccessResponseHandler = ({
  res,
  status,
  metadata,
  data,
}) => {
  res.status(status).json({
    metadata: metadata,
    data: data,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message });
};
