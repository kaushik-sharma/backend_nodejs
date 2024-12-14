import bcrypt from "bcrypt";

export class BcryptService {
  static readonly hash = async (plainText: string): Promise<string> => {
    const saltRounds = 12;
    return await bcrypt.hash(plainText, saltRounds);
  };

  static readonly compare = async (plainText: string, encrypted: string): Promise<boolean> => {
    return await bcrypt.compare(plainText, encrypted);
  };
}
