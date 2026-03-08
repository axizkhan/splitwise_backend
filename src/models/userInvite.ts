import mongoose, { Schema } from "mongoose";

const userInviteSchema = new Schema(
  {
    emailId: {
      type: String,
      required: true,
      index: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const UserInvite = mongoose.model("UserInvite", userInviteSchema);
