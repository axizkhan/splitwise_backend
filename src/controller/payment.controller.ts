import { NextFunction, Request, Response } from "express";
import { GroupService } from "../service/group.service.js";

import { Unauthorized, UnprocessableEntity } from "../error/httpClientError.js";
import { JournelServices } from "../service/journel.service.js";
import { PaymentService } from "../service/payment.service.js";
import { EntryService } from "../service/enetry.service.js";
import { BalanceService } from "../service/balance.service.js";
import { UserAuthServices } from "../service/userAuth.service.js";
import { MailService } from "../utils/mail/mail.service.js";

export class PaymentController {
  private paymentService: PaymentService;
  private entryService: EntryService;
  private balanceService: BalanceService;
  private groupService: GroupService;
  private journelService: JournelServices;
  private userService: UserAuthServices;
  private mailService: MailService;
  constructor() {
    this.paymentService = new PaymentService();
    this.entryService = new EntryService();
    this.balanceService = new BalanceService();
    this.groupService = new GroupService();
    this.journelService = new JournelServices();
    this.userService = new UserAuthServices();
    this.mailService = new MailService();
  }

  newPaymment = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      let { groupId } = req.body;
      let { paidToId } = req.body;
      let { amount } = req.body;
      let newPayment = await this.paymentService.addPayment(
        req.user.id,
        paidToId,
        groupId,
        amount,
      );

      let newEntry = await this.entryService.createPaymentEntry(
        req.user.id,
        paidToId,
        groupId,
        amount,
        newPayment._id.toString(),
      );

      let journelUpdate = await this.journelService.isJournelExistThanAddEntry(
        groupId,
        req.user.id,
        paidToId,
        newEntry._id.toString(),
      );

      if (!journelUpdate) {
        throw new UnprocessableEntity("No Expense In Group");
      }

      let updatedBalance = await this.balanceService.updateBalanceAgntsPayemnt(
        groupId,
        req.user.id,
        paidToId,
        amount,
      );

      // Update Group model member fields to reflect payment
      // Reduce paidBy user's amountOwed and paidTo user's amountToBeRecieved
      await this.groupService.updateGroupMemberBalances(
        groupId,
        req.user.id,
        paidToId,
        amount,
      );

      let paidTo = await this.userService.findUserEmail(paidToId);
      let paidBy = await this.userService.findUserEmail(req.user.id);
      let group = await this.groupService.getGroup(groupId, req.user.id);

      req.resData = {
        message: "Payment Done Successfully",
        data: newPayment,
        statusCode: 200,
      };
      next();

      if (paidTo && paidBy) {
        await this.mailService.sendMail(
          paidTo.email,
          "Payment Received on SplitWise",
          `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Payment Received 💸</h2>

  <p>Hi ${paidTo.name.firstName || "there"},</p>

  <p><strong>${paidBy.name.firstName}</strong> has paid you 
  <strong>₹${amount}</strong> on SplitWise.</p>

  <p><strong>Payment Details:</strong></p>
  <ul>
    <li>Amount: ₹${amount}</li>
    <li>Group: ${group?.name}</li>
  </ul>

  <p>Your balance has been updated accordingly.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>SplitWise Team</strong></p>
</div>
`,
        );
      }
      return;
    }
    throw new Unauthorized();
  };
}
