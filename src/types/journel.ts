import { Types, Document } from "mongoose";

export interface IJournel {
  _id?: Types.ObjectId;

  groupId: Types.ObjectId;

  users: [Types.ObjectId, Types.ObjectId];

  entryArray: Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
