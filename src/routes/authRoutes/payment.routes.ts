import { Router } from "express";

import { PaymentController } from "../../controller/payment.controller";

export class PaymentRouter {
  public paymentRouter: Router;
  private paymentController: PaymentController;
  constructor() {
    this.paymentRouter = Router();
    this.paymentController = new PaymentController();
    this.RouteInitializer();
  }

  private RouteInitializer() {
    this.paymentRouter.post("/", this.paymentController.newPaymment);
  }
}
