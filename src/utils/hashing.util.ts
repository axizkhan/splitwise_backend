import * as bcrypt from "bcrypt";

export class HashingUtil {
  private saltRound = Number(process.env.SALT_ROUND);
  async hashPassword(password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, this.saltRound);
      return hashedPassword;
    } catch (error) {
      throw error;
    }
  }
  async hashPasswordComparison(password: string, hashPassword: string) {
    try {
      const isMatch = await bcrypt.compare(password, hashPassword);

      return isMatch;
    } catch (error) {
      throw error;
    }
  }
}
