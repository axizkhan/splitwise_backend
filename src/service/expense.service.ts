import mongoose from "mongoose";
import { BadRequest } from "../error/httpClientError.js";
import { Expense } from "../models/expenseModel.js";
import { Group } from "../models/groupModel.js";
import { IExpense } from "../types/expense.js";
import { EntryService } from "./enetry.service.js";
import { JournelServices } from "./journel.service.js";
import { BalanceService } from "./balance.service.js";
import { InternalServerError } from "../error/httpServerError.js";

export class ExpenseService {
  private entryService: EntryService;
  private journelService: JournelServices;
  private balanceService: BalanceService;
  constructor() {
    this.entryService = new EntryService();
    this.journelService = new JournelServices();
    this.balanceService = new BalanceService();
  }
  async addExpense(
    expense: { title: string; amount: number; description?: string },
    groupId: string,
    userId: string,
  ) {
    const group = await Group.findOne({
      _id: groupId,
      "members.memberId": userId,
    });

    if (!group) {
      throw new BadRequest();
    }

    const expenseDocument: IExpense = {
      title: expense.title,
      amount: expense.amount,
      groupId: new mongoose.Types.ObjectId(groupId),
      paidBy: new mongoose.Types.ObjectId(userId),
    };
    if (expense.description) {
      expenseDocument.description = expense.description;
    }

    const createdExpense = await Expense.create(expenseDocument);

    let averageExpense = expense.amount / group.members.length;
    let creatorAmount = averageExpense * (group.members.length - 1);

    // Create entries and journals for all borrowers
    for (let member of group.members) {
      let borowerId = member.memberId.toString();
      if (borowerId !== userId) {
        const newEntry = await this.entryService.createEntry(
          userId,
          borowerId,
          groupId,
          averageExpense,
          createdExpense._id.toString(),
        );

        let newEntryId = newEntry._id.toString();

        let journel = await this.journelService.isJournelExistThanAddEntry(
          groupId,
          userId,
          borowerId,
          newEntryId,
        );

        if (!journel?._id) {
          journel = await this.journelService.createNewJournel(
            groupId,
            userId,
            borowerId,
            newEntryId,
          );
        }

        let balance = await this.balanceService.isBalanceExistThanUpdate(
          journel._id.toString(),
          userId,
          borowerId,
          groupId,
          averageExpense,
        );

        if (!balance.modifiedCount) {
          await this.balanceService.newBalance(
            groupId,
            borowerId,
            userId,
            averageExpense,
            journel._id.toString(),
          );
        }
      }
    }

    // Update borrower members with $inc (atomic operation)
    await Group.updateMany(
      {
        _id: groupId,
        "members.memberId": { $ne: new mongoose.Types.ObjectId(userId) },
      },
      {
        $inc: {
          "members.$[borrower].amountOwed": averageExpense,
        },
      },
      {
        arrayFilters: [
          { "borrower.memberId": { $ne: new mongoose.Types.ObjectId(userId) } },
        ],
      },
    );

    // Update creator with $inc (atomic operation)
    await Group.updateOne(
      { _id: groupId },
      {
        $inc: {
          "members.$[creator].amountToBeRecieved": creatorAmount,
        },
      },
      {
        arrayFilters: [
          { "creator.memberId": new mongoose.Types.ObjectId(userId) },
        ],
      },
    );

    if (createdExpense) {
      return createdExpense;
    }

    throw new InternalServerError();
  }
  async getAllExpense(groupId: string) {
    try {
      let result = await Expense.find({ groupId })
        .populate("paidBy", "name.firstName name.lastName email")
        .sort({ _id: -1 });
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getAllUserExpense(groupId: string, userId: string) {
    try {
      let result = await Expense.find({ groupId, paidBy: userId })
        .populate("paidBy", "name.firstName name.lastName email")
        .sort({
          _id: -1,
        });
      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateUserExpense(expenseId: string, newAmount: number) {
    try {
      let result = await Expense.findOneAndUpdate(
        { _id: expenseId },
        { amount: newAmount },
        { new: true },
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getExpense(expenseId: string) {
    try {
      let result = await Expense.findOne({ _id: expenseId });
      return result;
    } catch (err) {
      throw err;
    }
  }

  async deleteExpense(expenseId: string) {
    try {
      let result = await Expense.findByIdAndDelete(expenseId);
      return result;
    } catch (err) {
      throw err;
    }
  }
}
