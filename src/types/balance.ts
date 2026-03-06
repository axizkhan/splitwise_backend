import { Types, Document } from "mongoose";

export interface IUserBalance {
  userId: Types.ObjectId;
  receivedAmount: number; // +ve → user receives, -ve → user owes
}

export interface IBalance {
  groupId: Types.ObjectId;
  journelId: Types.ObjectId;

  balances: IUserBalance[];

  createdAt?: Date; // added by timestamps: true
  updatedAt?: Date; // added by timestamps: true
  deletedAt?: Date | null;
}
