import type { Response, Request, NextFunction } from "express";
import { HttpClientError } from "../error/httpClientError";
import { HttpServerError } from "../error/httpServerError";
import path from "path";
import { writeFile, writeFileSync } from "fs";

export class ErrorHandler {
  private errorLogPath: string;
  constructor() {
    this.errorLogPath = path.resolve("..", "logs", "error.log");
  }

  errorHandlingMiddleware(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    if (error instanceof HttpClientError) {
      res.status(error.httpCode);
      return res.json({
        success: false,
        data: [],
        code: error.error_code,
        error: {
          message: error.error_message,
          code: error.error_code,
        },
      });
    } else {
      let errorLog = "*".repeat(80) + "\r\n";
      errorLog += JSON.stringify(new Date()) + "\r\n";
      errorLog += JSON.stringify(error.message) + "\r\n";
      errorLog += JSON.stringify(error.stack) + "\r\n";
      errorLog += JSON.stringify(error.name) + "\r\n";
      if (error instanceof HttpServerError) {
        errorLog += `Error Code : ${error.errorCode} \r\n`;
        res.status(error.statusCode);
        res.json({
          success: false,
          message: error.errorMessage,
          error: {
            message: error.errorMessage,
            code: error.errorCode,
          },
        });
      } else {
        res.status(500);
        res.json({
          success: false,
          message: "Internal Server Error",
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error",
          },
        });
      }
      errorLog += "*".repeat(80) + "\r\n";

      // writeFile(this.errorLogPath, errorLog, (err) => {
      //   if (err) {
      //     writeFileSync(
      //       this.errorLogPath,
      //       "Unexpected Error " + "@".repeat(40) + JSON.stringify(err, null, 2),
      //     );
      //   }
      // });
    }
  }
}
