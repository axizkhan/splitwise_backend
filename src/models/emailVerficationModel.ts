import mongoose from "mongoose";

const emailVerificationSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  user: {
    email: { type: String },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    mobileNumber: { type: Number, default: undefined },
    upiId: { type: String, default: undefined },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 48,
  },
});

const EmailVerificationModel = mongoose.model(
  "EmailVerification",
  emailVerificationSchema,
);

export default EmailVerificationModel;
