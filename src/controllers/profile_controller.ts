import { RequestHandler } from "express";

import { successResponseHandler } from "../helpers/custom_handlers.js";
import { JwtService } from "../services/jwt_service.js";
import { ProfileDatasource } from "../datasources/profile_datasource.js";

export const getUser: RequestHandler = async (req, res, next) => {
  const [userId, sessionId] = await JwtService.verifyJwt(req.headers);

  const user = await ProfileDatasource.getUserById(userId);

  successResponseHandler({
    res: res,
    status: 200,
    metadata: { result: true },
    data: user,
  });
};
