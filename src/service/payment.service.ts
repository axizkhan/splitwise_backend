import mongoose from "mongoose";
import { PaymentModel } from "../models/paymentModel";

export class PaymentService {
  async addPayment(
    paidById: string,
    paidToId: string,
    groupId: string,
    amount: number,
  ) {
    try {
      let result = await PaymentModel.create({
        paidBy: new mongoose.Types.ObjectId(paidById),
        paidTo: new mongoose.Types.ObjectId(paidToId),

        groupId: new mongoose.Types.ObjectId(groupId),
        amount,
      });

      return result;
    } catch (err) {
      throw err;
    }
  }
}
