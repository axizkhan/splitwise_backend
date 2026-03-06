import express, { Application } from "express";
import cors from "cors";
import { RouteHandler } from "./routes";
import { ResponseSenderMiddleware } from "./middleware/reponseSenderMiddleware";
import { ErrorHandler } from "./middleware/errorHandlingMiddleware";
import passport from "passport";
import { PassportStrategy } from "./middleware/passport/passportLocalLoginMiddleware";
import { PassportJWTMIddleware } from "./middleware/passport/passportJwtAuth";
import cookieParser from "cookie-parser";
export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewareInitializer();
    this.passportInitilizer();
    this.routesInitializer();
    this.responseSenderInitializer();
    this.errorHandlerInitializer();
  }

  middlewareInitializer() {
    // CORS Configuration
    const corsOptions = {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      optionsSuccessStatus: 200,
    };

    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use("/api/auth", passport.authenticate("jwt", { session: false }));
  }

  passportInitilizer() {
    this.app.use(passport.initialize());
    const passportStartegies = new PassportStrategy();
    const passportJwt = new PassportJWTMIddleware();
    passportStartegies.localStrtegyFactory();
    passportJwt.passportJwtFactory();
  }
  routesInitializer() {
    const Routes = new RouteHandler();
    this.app.use("/api", Routes.Router);
  }
  responseSenderInitializer() {
    const responseSender = new ResponseSenderMiddleware();
    this.app.use(responseSender.responseMiddleware);
  }
  errorHandlerInitializer() {
    const errorHandler = new ErrorHandler();
    this.app.use(errorHandler.errorHandlingMiddleware);
  }
}
