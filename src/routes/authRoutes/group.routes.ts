import { Router } from "express";

import { GroupController } from "../../controller/group.controller";

export class GroupRouter {
  public groupRouter: Router;
  private groupController: GroupController;
  constructor() {
    this.groupRouter = Router();
    this.groupController = new GroupController();
    this.RouteInitializer();
  }

  private RouteInitializer() {
    this.groupRouter.post("/", this.groupController.createGroup);
    this.groupRouter.put("/:groupId", this.groupController.addMemberInGroup);
    this.groupRouter.get("/:groupId", this.groupController.getGroupDetails);
    this.groupRouter.delete("/:groupId", this.groupController.deleteGroup);
  }
}
