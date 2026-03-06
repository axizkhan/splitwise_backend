import { Router } from "express";
import { UserController } from "../../controller/user.controller";

export class UserRouter {
  public userRouter: Router;
  private userController: UserController;
  constructor() {
    this.userRouter = Router();
    this.userController = new UserController();
    this.RouteInitializer();
  }

  private RouteInitializer() {
    this.userRouter.get("/", this.userController.getAllGroup);
  }
}
