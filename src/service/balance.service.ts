import mongoose from "mongoose";
import { BalanceModel } from "../models/balanceModel";
import { IJournel } from "../types/journel";
import { IBalance } from "../types/balance";

export class BalanceService {
  constructor() {}
  async isBalanceExistThanUpdate(
    journelId: string,
    lenderId: string,
    borowerId: string,

    groupId: string,
    amount: number,
  ) {
    try {
      const result = await BalanceModel.updateOne(
        {
          journelId,
          groupId,
          "balances.userId": { $all: [lenderId, borowerId] },
        },
        {
          $inc: {
            "balances.$[u1].receivedAmount": amount,
            "balances.$[u2].receivedAmount": -amount,
          },
        },
        {
          arrayFilters: [{ "u1.userId": borowerId }, { "u2.userId": lenderId }],
        },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }
  async newBalance(
    groupId: string,
    borowerId: string,
    lenderId: string,
    amount: number,
    journelId: string,
  ) {
    try {
      const balanceDocument: IBalance = {
        groupId: new mongoose.Types.ObjectId(groupId),
        journelId: new mongoose.Types.ObjectId(journelId),
        balances: [
          {
            userId: new mongoose.Types.ObjectId(borowerId),
            receivedAmount: -amount,
          },
          {
            userId: new mongoose.Types.ObjectId(lenderId),
            receivedAmount: amount,
          },
        ],
      };

      let result = await BalanceModel.create(balanceDocument);
      return result;
    } catch (err) {
      throw err;
    }
  }

  async getAllBalance(members: any, groupId: string, userId: string) {
    let balanceArray = await BalanceModel.find({
      groupId,
      balances: {
        $all: [
          { $elemMatch: { userId } },
          { $elemMatch: { userId: { $in: members } } },
        ],
      },
    }).populate({
      path: "balances.userId",
      select: "name.firstName name.lastName mobileNumber upiId _id email",
    });

    return balanceArray;
  }

  async updateUserBalance(
    groupId: string,
    userId: string,
    difference: number,
    member: number,
  ) {
    try {
      const averageExpense = difference / member;
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Single query to update both payer and members correctly
      const result = await BalanceModel.updateMany(
        { groupId },
        {
          $inc: {
            "balances.$[payer].receivedAmount": averageExpense * (member - 1),
            "balances.$[others].receivedAmount": -averageExpense,
          },
        },
        {
          arrayFilters: [
            { "payer.userId": userObjectId },
            { "others.userId": { $ne: userObjectId } },
          ],
        },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateBalanceAgntsPayemnt(
    groupId: string,
    paidById: string,
    paidToId: string,
    amount: number,
  ) {
    try {
      // Update both paidBy and paidTo balances atomically
      // paidBy gets +amount (they paid, so they owe less)
      // paidTo gets -amount (they received payment, so they receive less)
      const paidByObjectId = new mongoose.Types.ObjectId(paidById);
      const paidToObjectId = new mongoose.Types.ObjectId(paidToId);

      let result = await BalanceModel.updateMany(
        { groupId },
        {
          $inc: {
            "balances.$[payer].receivedAmount": amount,
            "balances.$[receiver].receivedAmount": -amount,
          },
        },
        {
          arrayFilters: [
            { "payer.userId": paidByObjectId },
            { "receiver.userId": paidToObjectId },
          ],
        },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }
}
