import mongoose from "mongoose";
const { Schema } = mongoose;

const BalanceSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    journelId: {
      type: Schema.Types.ObjectId,
      ref: "Journel",
    },

    balances: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        receivedAmount: {
          type: Number,
          required: true,
        },
      },
    ],

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const BalanceModel = mongoose.model("Balance", BalanceSchema);
