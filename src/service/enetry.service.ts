import mongoose from "mongoose";
import { IEntry } from "../types/entery";
import { Entry } from "../models/entryModel";
import { InternalServerError } from "../error/httpServerError";

export class EntryService {
  constructor() {}

  async createEntry(
    lenderId: string,
    borowerId: string,
    groupId: string,
    amount: number,
    expenseId: string,
    type: string = "expense",
  ) {
    const entryDocument: IEntry = {
      lenderId: new mongoose.Types.ObjectId(lenderId),
      borowerId: new mongoose.Types.ObjectId(borowerId),
      groupId: new mongoose.Types.ObjectId(groupId),
      amount,
      expenseId: new mongoose.Types.ObjectId(expenseId),
      type,
    };

    const newEntry = await Entry.create(entryDocument);
    if (newEntry) {
      return newEntry;
    }

    throw new InternalServerError();
  }

  async updateEntry(expenseId: string, difference: number, member: number) {
    try {
      let averageExpense = difference / member;
      let result = await Entry.updateMany(
        { expenseId },
        { $inc: { amount: averageExpense } },
      );
      return result;
    } catch (err) {
      throw err;
    }
  }

  async createPaymentEntry(
    lenderId: string,
    borowerId: string,
    groupId: string,
    amount: number,
    paymentId: string,
    type: string = "payment",
  ) {
    try {
      const entryDocument: IEntry = {
        lenderId: new mongoose.Types.ObjectId(lenderId),
        borowerId: new mongoose.Types.ObjectId(borowerId),
        groupId: new mongoose.Types.ObjectId(groupId),
        amount,
        paymentId: new mongoose.Types.ObjectId(paymentId),
        type,
      };

      const newEntry = await Entry.create(entryDocument);

      return newEntry;
    } catch (err) {
      throw err;
    }
  }
}
