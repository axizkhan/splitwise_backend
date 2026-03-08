import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "../service/expense.service.js";
import { NotFound, Unauthorized } from "../error/httpClientError.js";
import { GroupService } from "../service/group.service.js";
import { BalanceService } from "../service/balance.service.js";
import { EntryService } from "../service/enetry.service.js";
import { UserAuthServices } from "../service/userAuth.service.js";
import { MailService } from "../utils/mail/mail.service.js";
import { services } from "../store/serviceContainer.js";
import mongoose from "mongoose";

export class ExpenseController {
  private expenseService = services.expenseService;
  private groupService = services.groupService;
  private balanceService = services.balanceService;
  private entryService = services.entryService;
  private userService = services.userService;
  private mailService = services.mailService;

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

      let group = await this.groupService.getGroup(groupId as string, id);
      let sender = await this.userService.findUserEmail(id);

      req.resData = {
        statusCode: 200,
        data,
        message: "Success",
      };
      next();
      if (group) {
        for (let member of group.members) {
          if (
            member.memberId._id &&
            member.memberId._id.toString() !== id &&
            !(member.memberId instanceof mongoose.Types.ObjectId)
          ) {
            await this.mailService.sendMail(
              member.memberId.emailId,
              "New Expense Added in Your Splitly Group",
              `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>New Expense Added</h2>

  <p>Hi ${member.memberId.name.firstName || "there"},</p>

  <p><strong>${sender?.name.firstName}</strong> added a new expense in the group 
  <strong>"${group.name}"</strong>.</p>

  <p><strong>Expense Details:</strong></p>
  <ul>
    <li>Description: ${data.title}</li>
    <li>Amount: ₹${data.amount}</li>
  </ul>

  <p>Please check the group to view how the expense is split.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
</div>
`,
            );
          }
        }
      }
      return;
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

          let group = await this.groupService.getGroup(groupId, req.user.id);
          let editedBy = await this.userService.findUserEmail(req.user.id);

          req.resData = {
            statusCode: 200,
            message: "Expense Updated Successfully",
            data: updatedExpense,
          };

          next();
          if (group && editedBy) {
            for (let member of group.members) {
              if (
                member.memberId._id &&
                member.memberId._id.toString() !== req.user.id &&
                !(member.memberId instanceof mongoose.Types.ObjectId)
              ) {
                await this.mailService.sendMail(
                  member.memberId.emailId,
                  "Expense Updated in Your SplitWise Group",
                  `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Expense Updated</h2>

  <p>Hi ${member.memberId.name.firstName || "there"},</p>

  <p><strong>${editedBy.name.firstName}</strong> updated an expense in the group 
  <strong>"${group.name}"</strong>.</p>

  <p><strong>Updated Expense Details:</strong></p>
  <ul>
    <li>Description: ${updatedExpense?.title}</li>
    <li>New Amount: ₹${updatedExpense?.amount}</li>
  </ul>

  <p>Please check the group to see the updated split.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>SplitWise Team</strong></p>
</div>
`,
                );
              }
            }
          }
          return;
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

        let deletedByExpense = await this.userService.findUserEmail(
          req.user.id,
        );
        let group = await this.groupService.getGroup(groupId, req.user.id);

        req.resData = {
          statusCode: 200,
          message: "Expense Deleted Successfully",
          data: deletedExpense,
        };

        next();

        if (deletedByExpense && group) {
          for (let member of group.members) {
            if (
              member.memberId._id &&
              member.memberId._id.toString() !== req.user.id &&
              !(member.memberId instanceof mongoose.Types.ObjectId)
            ) {
              await this.mailService.sendMail(
                member.memberId.emailId,
                "Expense Deleted in Your Splitly Group",
                `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Expense Deleted</h2>

  <p>Hi ${member.memberId.name.firstName || "there"},</p>

  <p><strong>${deletedByExpense.name.firstName}</strong> deleted an expense from the group 
  <strong>"${group.name}"</strong>.</p>

  <p><strong>Deleted Expense Details:</strong></p>
  <ul>
    <li>Description: ${deletedExpense?.title}</li>
    <li>Amount: ₹${deletedExpense?.amount}</li>
  </ul>

  <p>The balances in the group may have been updated accordingly.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
</div>
`,
              );
            }
          }
        }
        return;
      } catch (err) {
        throw err;
      }
    }
    throw new Unauthorized();
  };
}
