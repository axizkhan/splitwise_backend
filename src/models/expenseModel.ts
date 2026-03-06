import mongoose from "mongoose";
const { Schema } = mongoose;

const ExpenseSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Expense = mongoose.model("Expense", ExpenseSchema);
