import { Types, Document } from "mongoose";

export interface IExpense {
  groupId: Types.ObjectId;
  title: string;
  amount: number;
  paidBy: Types.ObjectId;

  description?: string;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
