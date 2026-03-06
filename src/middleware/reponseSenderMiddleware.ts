import type { Response, Request, NextFunction } from "express";

export class ResponseSenderMiddleware {
  responseMiddleware(req: Request, res: Response, next: NextFunction) {
    const { data, message, statusCode } = req.resData;
    res.status(Number(statusCode));
    res.json({
      message,
      data,
      success: true,
    });
  }
}
