import { Types } from "mongoose";
import { IUser } from "./userModel";

export interface IGroupMember {
  memberId: Types.ObjectId | IUser;
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
