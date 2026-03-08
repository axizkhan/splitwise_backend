import mongoose from "mongoose";

export type IAccountType = "google" | "local";

export interface IAccount {
  type: IAccountType;
  passwordHash?: string;
  providerId?: string;
}

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  emailId: string;

  name: {
    firstName: string;
    lastName: string;
  };

  mobileNumber?: number;
  upiId?: string;

  account: IAccount;
  isEmailVerified: boolean;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
