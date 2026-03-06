import { NextFunction, Request, Response } from "express";
import { GroupService } from "../service/group.service";

import { Unauthorized, UnprocessableEntity } from "../error/httpClientError";
import { JournelServices } from "../service/journel.service";
import { PaymentService } from "../service/payment.service";
import { EntryService } from "../service/enetry.service";
import { BalanceService } from "../service/balance.service";

export class PaymentController {
  private paymentService: PaymentService;
  private entryService: EntryService;
  private balanceService: BalanceService;
  private groupService: GroupService;
  private journelService: JournelServices;
  constructor() {
    this.paymentService = new PaymentService();
    this.entryService = new EntryService();
    this.balanceService = new BalanceService();
    this.groupService = new GroupService();
    this.journelService = new JournelServices();
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

      req.resData = {
        message: "Payment Done Successfully",
        data: newPayment,
        statusCode: 200,
      };
      return next();
    }
    throw new Unauthorized();
  };
}
