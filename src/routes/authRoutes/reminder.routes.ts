import { Router } from "express";

import { ReminderController } from "../../controller/notification.controller.js";

export class ReminderRouter {
  public reminderRouter: Router;
  private reminderController: ReminderController;
  constructor() {
    this.reminderRouter = Router();
    this.reminderController = new ReminderController();
    this.RouteInitializer();
  }

  private RouteInitializer() {
    this.reminderRouter.post(
      "/:groupId/:memberId",
      this.reminderController.notifyMember,
    );
  }
}
