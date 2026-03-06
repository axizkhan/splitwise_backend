import mongoose from "mongoose";

const { Schema } = mongoose;

const ReminderSchema = new Schema({
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  sentTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  amount: {
    type: Number,
    required: true,
  },
  message: { type: String },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "Group",
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});
