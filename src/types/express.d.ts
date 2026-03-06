import { Request } from "express";
import { JwtUser } from "./jwtUser.js";

declare global {
  namespace Express {
    interface Request {
      resData: {
        statusCode: number | string;
        data?: any;
        message: string;
      };
      user?: JwtUser;
    }
  }
}
