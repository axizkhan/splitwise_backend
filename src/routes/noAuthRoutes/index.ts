import { Router } from "express";
import { UserRoute } from "./user.routes";

export class NoAuthRoutes {
  public NoAuthRouter: Router;
  private userRouter: UserRoute;
  constructor() {
    this.NoAuthRouter = Router();
    this.userRouter = new UserRoute();
    this.RouterInitializer();
  }

  private RouterInitializer() {
    this.NoAuthRouter.use("/user", this.userRouter.UserRouter);
  }
}
