import mongoose from "mongoose";
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  paidBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  paidTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  amount: { type: Number },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "Group",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const PaymentModel = mongoose.model("Payment", PaymentSchema);
