import jwt from "jsonwebtoken";
// const { sign } = jwt;

export class JWTService {
  private secret: string;
  private singOption = {
    expireIn: "2h",
    issuer: "splitMoney",
    algorithm: "HS256",
    audience: "",
  };
  constructor() {
    this.secret = process.env.JWT_SIGN as string;
  }

  async grantAccessToken(user: any) {
    try {
      const token = jwt.sign({ id: user.toString() }, this.secret, {
        expiresIn: "2h",
      });

      return token;
    } catch (error) {
      throw error;
    }
  }
}
