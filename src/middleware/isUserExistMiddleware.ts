import { Request, Response, NextFunction } from "express";
import { Unauthorized } from "../error/httpClientError";

export class IsUserExist {
  isUserExist(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      throw new Unauthorized(
        "Login before processed",
        "LOGIN_BEFORE_PROCESSED",
      );
    }
    next();
  }
}
