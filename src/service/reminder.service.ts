import { BadRequest } from "../error/httpClientError";
import { Group } from "../models/groupModel";
import { ReminderModel } from "../models/reminderModel";
import { UserModel } from "../models/userModel";
import { services } from "../store/serviceContainer.js";

export class ReminderService {
  private journalService = services.journelService;

  sendReminder = async (
    groupId: string,
    senderId: string,
    memberId: string,
  ) => {
    const sender = await UserModel.findById(senderId);
    const member = await UserModel.findById(memberId);
    const group = await Group.findById(groupId);

    if (!sender || !member || !group) {
      throw new Error("Invalid users or group");
    }

    const balance = await this.journalService.calculateBalance(
      groupId,
      senderId,
      memberId,
    );

    if (balance <= 0) {
      throw new BadRequest("User does not owe you money");
    }

    const reminder = await ReminderModel.create({
      sentBy: senderId,
      sentTo: memberId,
      groupId,
      amount: balance,
      message: `${sender.name.firstName} reminded you to settle ₹${balance}`,
    });

    return {
      reminder,
      sender,
      member,
      group,
      balance,
    };
  };
}
