import { Group } from "../models/groupModel.js";
import { IGroup } from "../types/group.js";
import mongoose from "mongoose";

export class GroupService {
  async createGroup(
    creatorId: string,
    name: string,
    description: string | undefined,
  ) {
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    const groupDocument: IGroup = {
      name,
      totalAmount: 0,
      createdBy: creatorObjectId,
      members: [
        {
          memberId: creatorObjectId,
          amountOwed: 0,
          amountToBeRecieved: 0,
        },
      ],
    };

    if (description) {
      groupDocument.description = description;
    }

    const group = await Group.create(groupDocument);
    return group;
  }

  async isUserExistInGroup(userId: string, groupId: string) {
    const group = await Group.findOne({
      _id: groupId,
      "members.memberId": userId,
    });
    if (group) {
      return group;
    }
    return null;
  }

  async addUserToGroup(groupId: string, newUserId: string) {
    try {
      const newMemberOject = {
        memberId: newUserId,
        amountOwed: 0,
        amountToBeRecieved: 0,
      };
      const result = await Group.updateOne(
        { _id: groupId, "members.memberId": { $ne: newUserId } },
        { $push: { members: newMemberOject } },
      );

      return result.modifiedCount;
    } catch (err) {
      throw err;
    }
  }

  async getAllGroup(userId: string) {
    let result = await Group.find({ "members.memberId": { $eq: userId } });
    return result;
  }

  async getGroup(groupId: string, userId: string) {
    let group = await Group.findOne({
      _id: groupId,
      "members.memberId": userId,
    }).populate(
      "members.memberId",
      "email mobileNumber upiId _id name.firstName lastName",
    );
    return group;
  }

  async userExpenseEdit(
    groupId: string,
    userId: string,
    amount: number,
    member: number,
  ) {
    try {
      let averageExpense = amount / member;
      let userExpense = averageExpense * (member - 1);
      let result = await Group.updateOne(
        { _id: groupId },
        {
          $inc: {
            "members.$[currentUser].amountToBeRecieved": userExpense,
            "members.$[otherUsers].amountOwed": averageExpense,
          },
        },
        {
          arrayFilters: [
            { "currentUser.memberId": new mongoose.Types.ObjectId(userId) },
            {
              "otherUsers.memberId": {
                $ne: new mongoose.Types.ObjectId(userId),
              },
            },
          ],
        },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getMemberCount(groupId: string) {
    try {
      const result = await Group.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(groupId),
          },
        },
        {
          $project: {
            _id: 1,
            memberCount: { $size: "$members" },
          },
        },
      ]);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async updateGroupMemberBalances(
    groupId: string,
    paidById: string,
    paidToId: string,
    amount: number,
  ) {
    try {
      const paidByObjectId = new mongoose.Types.ObjectId(paidById);
      const paidToObjectId = new mongoose.Types.ObjectId(paidToId);

      // Reduce paidBy user's amountOwed and paidTo user's amountToBeRecieved
      const result = await Group.updateOne(
        { _id: groupId },
        {
          $inc: {
            "members.$[payer].amountOwed": -amount,
            "members.$[receiver].amountToBeRecieved": -amount,
          },
        },
        {
          arrayFilters: [
            { "payer.memberId": paidByObjectId },
            { "receiver.memberId": paidToObjectId },
          ],
        },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }

  async deleteGroup(groupId: string, userId: string) {
    try {
      const group = await Group.findOne({
        _id: groupId,
        createdBy: new mongoose.Types.ObjectId(userId),
      }).populate({
        path: "members.memberId",
        select: "emailId name",
      });

      if (!group) {
        return null;
      }

      await Group.deleteOne({ _id: groupId });

      return group;
    } catch (err) {
      throw err;
    }
  }
}
