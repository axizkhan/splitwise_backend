import mongoose from "mongoose";
import { UserInvite } from "../models/userInvite.js";

export class UserInviteService {
  async createInvite(emailId: string, groupId: string, invitedBy: string) {
    try {
      const result = await UserInvite.findOneAndUpdate(
        { emailId, groupId },
        {
          emailId,
          groupId: new mongoose.Types.ObjectId(groupId),
          invitedBy: new mongoose.Types.ObjectId(invitedBy),
        },
        { upsert: true },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  async findInvitesByEmail(emailId: string) {
    try {
      const invites = await UserInvite.find({
        emailId,
      });

      return invites;
    } catch (err) {
      throw err;
    }
  }

  async deleteInvitesByEmail(emailId: string) {
    try {
      const result = await UserInvite.deleteMany({
        emailId,
      });

      return result;
    } catch (err) {
      throw err;
    }
  }
}
