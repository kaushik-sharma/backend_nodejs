import jwt from "jsonwebtoken";
import fs from "fs";
import { SessionModel } from "../models/session/session_model.js";
import { ClientSession } from "mongoose";

export class JwtService {
  static readonly generateJwt = async (
    userId: string,
    session?: ClientSession
  ): Promise<string> => {
    const sessionModel = new SessionModel({
      userId: userId,
    });
    const sessionId = (await sessionModel.save({ session: session })).id as string;

    const payload = {
      sessionId: sessionId,
      userId: userId,
    };

    const privateKey = fs.readFileSync("private-key.pem", "utf8");

    const options: jwt.SignOptions = {
      algorithm: "RS512",
      expiresIn: "30d",
    };

    return jwt.sign(payload, privateKey, options);
  };

  static readonly verifyJwt = async (
    headers: Record<string, any>
  ): Promise<[string, string]> => {
    const token = headers["authorization"] as string;

    const publicKey = fs.readFileSync("public-key.pem", "utf8");

    const decoded = jwt.verify(token, publicKey) as jwt.JwtPayload;

    const sessionId = decoded.sessionId as string | undefined;
    const userId = decoded.userId as string | undefined;
    if (sessionId === undefined || userId === undefined) {
      throw new Error("Invalid auth token.");
    }

    const session = await SessionModel.findOne({
      _id: sessionId,
      userId: userId,
    });
    if (session === null) {
      throw new Error("Invalid auth token.");
    }

    return [userId, sessionId];
  };
}

/// ====================== Generate Keys ======================

// Private Key
// openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:4096

// Public Key
// openssl rsa -pubout -in private-key.pem -out public-key.pem
