import { Router } from "express";
import { UserRoute } from "./noAuthRoutes/user.routes.js";
import { NoAuthRoutes } from "./noAuthRoutes/index.js";
import { AuthRoutes } from "./authRoutes/index.js";
import { IsUserExist } from "../middleware/isUserExistMiddleware.js";

export class RouteHandler {
  public Router: Router;
  private noAuthRoutes: NoAuthRoutes;
  private authRoutes: AuthRoutes;
  private isUserExist: IsUserExist;
  constructor() {
    this.Router = Router();
    this.noAuthRoutes = new NoAuthRoutes();
    this.authRoutes = new AuthRoutes();
    this.isUserExist = new IsUserExist();
    this.RouterInitializer();
  }

  private RouterInitializer() {
    this.Router.use("/", this.noAuthRoutes.NoAuthRouter);
    this.Router.use(
      "/auth",
      this.isUserExist.isUserExist,
      this.authRoutes.authRouter,
    );
  }
}
