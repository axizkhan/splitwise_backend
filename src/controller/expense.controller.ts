import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "../service/expense.service.js";
import { NotFound, Unauthorized } from "../error/httpClientError.js";
import { GroupService } from "../service/group.service.js";
import { BalanceService } from "../service/balance.service.js";
import { EntryService } from "../service/enetry.service.js";

export class ExpenseController {
  private expenseService: ExpenseService;
  private groupService: GroupService;
  private balanceService: BalanceService;
  private entryService: EntryService;
  constructor() {
    this.expenseService = new ExpenseService();
    this.groupService = new GroupService();
    this.balanceService = new BalanceService();
    this.entryService = new EntryService();
  }

  addNewExpenseToGroup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { title, amount } = req.body;
      const { groupId } = req.params;
      const { id } = req.user;

      const expense: { title: string; amount: number; description?: string } = {
        title,
        amount,
      };

      if (req.body.description) {
        expense.description = req.body.description;
      }

      let data = await this.expenseService.addExpense(
        expense,
        groupId as string,
        id,
      );

      req.resData = {
        statusCode: 200,
        data,
        message: "Success",
      };
      return next();
    }

    throw new Unauthorized();
  };

  getAllExpensesOfGroup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { groupId } = req.params;
      let allGroupExpenses = await this.expenseService.getAllExpense(
        groupId as string,
      );

      req.resData = {
        statusCode: 200,
        message: "Data Found Successfully",
        data: allGroupExpenses,
      };

      return next();
    }
    throw new Unauthorized();
  };
  getAllUserExpenses = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { groupId } = req.params;
      let data = await this.expenseService.getAllUserExpense(
        groupId as string,
        req.user.id,
      );

      req.resData = {
        data,
        statusCode: 200,
        message: "Data Found Successfully",
      };

      return next();
    }
    throw new Unauthorized();
  };

  editExpense = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      const { expenseId } = req.params;
      const { newExpenseAmount } = req.body;
      let expense = await this.expenseService.getExpense(expenseId as string);
      let groupId;
      if (
        expense?.groupId &&
        expense.amount !== null &&
        expense.amount !== undefined
      ) {
        groupId = expense.groupId.toString();
        let groupMember = await this.groupService.getMemberCount(groupId);
        const memberCount = groupMember[0].memberCount;
        const oldAmount = expense.amount;

        try {
          // Step 1: Reverse the old expense
          await this.entryService.updateEntry(
            expenseId as string,
            -oldAmount,
            memberCount,
          );
          await this.balanceService.updateUserBalance(
            groupId as string,
            req.user.id,
            -oldAmount,
            memberCount,
          );
          await this.groupService.userExpenseEdit(
            groupId as string,
            req.user.id,
            -oldAmount,
            memberCount,
          );

          // Step 2: Apply the new expense
          await this.entryService.updateEntry(
            expenseId as string,
            newExpenseAmount,
            memberCount,
          );
          await this.balanceService.updateUserBalance(
            groupId as string,
            req.user.id,
            newExpenseAmount,
            memberCount,
          );
          await this.groupService.userExpenseEdit(
            groupId as string,
            req.user.id,
            newExpenseAmount,
            memberCount,
          );

          // Step 3: Update the expense amount directly
          const updatedExpense = await this.expenseService.updateUserExpense(
            expenseId as string,
            newExpenseAmount,
          );

          req.resData = {
            statusCode: 200,
            message: "Expense Updated Successfully",
            data: updatedExpense,
          };

          return next();
        } catch (err) {
          throw err;
        }
      }
      throw new NotFound();
    }
    throw new Unauthorized();
  };

  deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      const { expenseId } = req.params;

      let expense = await this.expenseService.getExpense(expenseId as string);

      if (
        !expense ||
        expense.groupId === null ||
        expense.groupId === undefined
      ) {
        throw new NotFound();
      }

      if (expense.amount === null || expense.amount === undefined) {
        throw new NotFound();
      }

      let groupId = expense.groupId.toString();
      let groupMember = await this.groupService.getMemberCount(groupId);
      const memberCount = groupMember[0].memberCount;
      const expenseAmount = expense.amount;

      try {
        // Reverse the expense effect once
        await this.entryService.updateEntry(
          expenseId as string,
          -expenseAmount,
          memberCount,
        );
        await this.balanceService.updateUserBalance(
          groupId as string,
          req.user.id,
          -expenseAmount,
          memberCount,
        );
        await this.groupService.userExpenseEdit(
          groupId as string,
          req.user.id,
          -expenseAmount,
          memberCount,
        );

        // Delete the expense
        const deletedExpense = await this.expenseService.deleteExpense(
          expenseId as string,
        );

        req.resData = {
          statusCode: 200,
          message: "Expense Deleted Successfully",
          data: deletedExpense,
        };

        return next();
      } catch (err) {
        throw err;
      }
    }
    throw new Unauthorized();
  };
}
