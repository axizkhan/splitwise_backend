import { Router } from "express";
import { UserRoute } from "./noAuthRoutes/user.routes";
import { NoAuthRoutes } from "./noAuthRoutes";
import { AuthRoutes } from "./authRoutes";
import { IsUserExist } from "../middleware/isUserExistMiddleware";

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
