import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      resData: {
        statusCode: number | string;
        data?: any;
        message: string;
      };
      user?: {
        id: string;
        iat: number;
        exp: number;
      };
    }
  }
}
