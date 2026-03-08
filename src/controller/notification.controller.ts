import { NextFunction, Request, Response } from "express";

import { services } from "../store/serviceContainer.js";
import { Unauthorized } from "../error/httpClientError.js";

export class ReminderController {
  private reminderService = services.reminderService;
  private mailService = services.mailService;
  notifyMember = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new Unauthorized();

    try {
      const { groupId, memberId } = req.params;
      const senderId = req.user.id;

      const { group, member, sender, balance } =
        await this.reminderService.sendReminder(
          groupId as string,
          senderId as string,
          memberId as string,
        );

      req.resData = {
        message: "Reminder sent successfully",
        statusCode: 200,
      };

      next();

      await this.mailService.sendMail(
        member.emailId,
        "Payment Reminder from Your SplitWise Group",
        `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Payment Reminder</h2>

  <p>Hi ${member.name.firstName || "there"},</p>

  <p><strong>${sender.name.firstName}</strong> has sent you a reminder regarding a pending payment in the group 
  <strong>"${group.name}"</strong>.</p>

  <p><strong>Reminder Details:</strong></p>
  <ul>
    <li>Amount Pending: ₹${balance}</li>
    <li>Group: ${group.name}</li>
  </ul>

  <p>Please settle the payment at your earliest convenience to keep the group balances up to date.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
</div>
`,
      );
      return;
    } catch (err) {
      throw err;
    }
  };
}
