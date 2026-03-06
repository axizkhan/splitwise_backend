import mongoose from "mongoose";
import { IAccountType, IUser } from "../types/userModel.js";
const { Schema } = mongoose;

let accountSchema = new Schema<IAccountType>({
  type: { type: String, enum: ["google", "local"] },
  passwordHash: { type: String },
  providerId: { type: String },
});

const userSchema = new Schema<IUser>({
  emailId: { type: String, required: true, unique: true, sparse: true },

  name: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  mobileNumber: { type: Number },
  upiId: { type: String },
  account: accountSchema,
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
});

export const UserModel = mongoose.model<IUser>("User", userSchema);
