import { Types } from "mongoose";

export interface IGroupMember {
  memberId: Types.ObjectId;
  amountOwed: number;
  amountToBeRecieved: number;
}

export interface IGroup {
  createdBy: Types.ObjectId;
  name: string;
  description?: string;
  totalAmount: number;
  members: IGroupMember[];
  createdAt?: Date;
  updatedAt?: Date;
}
