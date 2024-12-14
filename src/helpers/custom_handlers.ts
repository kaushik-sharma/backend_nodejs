import { Response, ErrorRequestHandler } from "express";

export interface Metadata {
  result: boolean;
  message?: string;
}

interface SuccessResponseHandlerParams {
  res: Response;
  status: number;
  metadata: Metadata;
  data?: Record<string, any>;
}

// export const requestHandler = async (
//   next: NextFunction,
//   callback: () => Promise<void>
// ): Promise<void> => {
//   try {
//     await callback();
//   } catch (error) {
//     next(error);
//   }
// };

export const successResponseHandler = ({
  res,
  status,
  metadata,
  data,
}: SuccessResponseHandlerParams): void => {
  res.status(status).json({
    metadata: metadata,
    data: data,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message });
};
