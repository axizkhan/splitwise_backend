import mongoose from "mongoose";
import { IGroup } from "../types/group";
const { Schema } = mongoose;

const GroupSchema = new Schema<IGroup>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    totalAmount: {
      type: Number,
    },
    members: [
      {
        memberId: { type: Schema.Types.ObjectId, ref: "User" },
        amountOwed: { type: Number, default: 0 },
        amountToBeRecieved: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

export const Group = mongoose.model<IGroup>("Group", GroupSchema);
