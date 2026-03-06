import { Router } from "express";

import { GroupController } from "../../controller/group.controller";
import { ExpenseController } from "../../controller/expense.controller";

export class ExpenseRouter {
  public expenseRouter: Router;
  private expenseController: ExpenseController;
  constructor() {
    this.expenseRouter = Router();
    this.expenseController = new ExpenseController();
    this.RouteInitializer();
  }

  private RouteInitializer() {
    this.expenseRouter.post(
      "/:groupId",
      this.expenseController.addNewExpenseToGroup,
    );
    this.expenseRouter.get(
      "/user/:groupId",
      this.expenseController.getAllUserExpenses,
    );
    this.expenseRouter.get(
      "/:groupId",
      this.expenseController.getAllExpensesOfGroup,
    );

    this.expenseRouter.put("/:expenseId", this.expenseController.editExpense);
    this.expenseRouter.delete(
      "/:expenseId",
      this.expenseController.deleteExpense,
    );
  }
}
