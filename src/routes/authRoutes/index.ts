import { Router } from "express";
import { GroupRouter } from "./group.routes";
import { ExpenseRouter } from "./expense.routes";
import { UserRouter } from "./user.routes";
import { JournelRouter } from "./journel.routes";
import { PaymentRouter } from "./payment.routes";

export class AuthRoutes {
  public authRouter: Router;
  private groupRouter: GroupRouter;
  private expenseRouter: ExpenseRouter;
  private userRouter: UserRouter;
  private journelRouter: JournelRouter;
  private paymentRouter: PaymentRouter;
  constructor() {
    this.authRouter = Router();
    this.groupRouter = new GroupRouter();
    this.expenseRouter = new ExpenseRouter();
    this.userRouter = new UserRouter();
    this.journelRouter = new JournelRouter();
    this.paymentRouter = new PaymentRouter();
    this.authPathInitializer();
  }
  authPathInitializer() {
    this.authRouter.use("/group", this.groupRouter.groupRouter);
    this.authRouter.use("/expense", this.expenseRouter.expenseRouter);
    this.authRouter.use("/user", this.userRouter.userRouter);
    this.authRouter.use("/journel", this.journelRouter.journelRouter);
    this.authRouter.use("/payment", this.paymentRouter.paymentRouter);
  }
}
