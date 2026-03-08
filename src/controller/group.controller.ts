import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { InternalServerError } from "../error/httpServerError.js";
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from "../error/httpClientError.js";

import { services } from "../store/serviceContainer.js";

import {
  BalanceResponse,
  GroupSummaryResponse,
} from "../types/groupDetail.types";

export class GroupController {
  private groupService = services.groupService;
  private userService = services.userService;
  private balanceService = services.balanceService;
  private mailService = services.mailService;
  private userInviteService = services.userInviteService;

  createGroup = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      const { id } = req.user;
      const { name, description } = req.body;

      const group = await this.groupService.createGroup(id, name, description);
      if (!group) {
        throw new InternalServerError();
      }
      const resObj = {
        data: group,
        statusCode: 201,
        message: "GROUP_CREATED_SUCCESSFULLY",
      };

      req.resData = resObj;
      return next();
    }
    throw new Unauthorized();
  };

  addMemberInGroup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { id } = req.user;
      const { groupId } = req.params;
      const { newMemberEmail } = req.body;

      const group = await this.groupService.isUserExistInGroup(
        id,
        groupId as string,
      );

      if (!group) {
        throw new NotFound("Either group or user dont exist");
      }
      const newMember =
        await this.userService.findUserLocalLogin(newMemberEmail);

      if (!newMember) {
        await this.userInviteService.createInvite(
          newMemberEmail,
          groupId as string,
          id,
        );

        const resObject = {
          data: "",
          statusCode: 200,
          message: "Invitation sent to user email",
        };

        req.resData = resObject;
        next();
        await this.mailService.sendMail(
          newMemberEmail,
          "You've been invited to a Splitly group",
          `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Group Invitation</h2>

  <p>You have been invited to join the group <strong>${group.name}</strong> on Splitly.</p>

  <p>Please create an account using this email to automatically join the group.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
</div>
`,
        );

        return;
      }

      const isUserAdd = await this.groupService.addUserToGroup(
        group._id.toString(),
        newMember._id.toString(),
      );
      if (isUserAdd) {
        let senderData = await this.userService.findUserEmail(id);

        if (senderData) {
          await this.mailService.sendMail(
            newMember.emailId,
            "You've been added to a SplitWise group",
            `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>You were added to a group</h2>

  <p>Hi ${newMember.name.firstName || "there"},</p>

  <p><strong>${senderData.name.firstName}</strong> has added you to the group 
  <strong>"${group.name}"</strong> on SplitWise.</p>

  <p>You can now view and split expenses with the group members.</p>

  <br/>

  <p>If you were not expecting this invitation, you can safely ignore this email.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
</div>
`,
          );
        }

        const resObject = {
          data: "",
          statusCode: 201,
          message: "User SuccesFully add to group",
        };
        req.resData = resObject;
        return next();
      }
      throw new BadRequest();
    }
    throw new Unauthorized();
  };
  getGroupDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Unauthorized();
      }

      const { groupId } = req.params;
      const userId = req.user.id;

      const group = await this.groupService.getGroup(groupId as string, userId);

      if (!group) {
        req.resData = {
          statusCode: 404,
          message: "Group not found",
          data: null,
        };
        return next();
      }

      const sanitizeData: GroupSummaryResponse = {
        userData: {} as any,
        balances: [],
        group: {} as any,
      };

      const memberIds: string[] = [];
      const memberDetailsMap: any = {};

      // Extract member data and store member details for later
      for (const member of group.members || []) {
        const memberId = (member.memberId as any)._id.toString();

        if (memberId === userId) {
          sanitizeData.userData = {
            totalSpent: group.totalAmount || 0,
            youOwe: member.amountOwed,
            youWillReceive: member.amountToBeRecieved,
          };
        } else {
          memberIds.push(memberId);
          // Store member details for members without balances
          const memberObj = member.memberId as any;
          memberDetailsMap[memberId] = {
            name: {
              firstName: memberObj.name?.firstName || "",
              lastName: memberObj.name?.lastName || "",
            },
            _id: memberObj._id,
            mobileNumber: memberObj.mobileNumber,
            upiId: memberObj.upiId,
          };
        }
      }

      // Fetch balances
      let memberBalanceData: any[] = [];

      if (memberIds.length) {
        const balances = await this.balanceService.getAllBalance(
          memberIds,
          groupId as string,
          userId,
        );

        memberBalanceData = balances || [];
      }

      // Group summary - Map to frontend expected structure
      sanitizeData.group = {
        _id: group._id?.toString() || "",
        name: group.name || "",
        description: group.description || "",
        members:
          group.members?.map((m: any) => m.memberId?._id?.toString() || "") ||
          [],
        createdBy: group.createdBy?.toString() || "",
        createdAt:
          (group.createdAt instanceof Date
            ? group.createdAt.toISOString()
            : "") || "",
      };

      // Track which members have been processed
      const processedMemberIds = new Set<string>();

      // Process balances
      for (const memberBalance of memberBalanceData) {
        const sanitizedMemberBalance: BalanceResponse = {
          _id: memberBalance._id,
          JournelId: memberBalance.journelId,
          groupId: memberBalance.groupId,
        } as BalanceResponse;

        for (const balance of memberBalance.balances) {
          const balanceUserId = balance.userId._id.toString();

          if (balanceUserId === userId) {
            sanitizedMemberBalance.userAmount = balance.receivedAmount;
            sanitizedMemberBalance.userId = userId;
          } else {
            sanitizedMemberBalance.memberAmount = balance.receivedAmount;
            processedMemberIds.add(balanceUserId);

            sanitizedMemberBalance.memberdetails = {
              name: {
                firstName: balance.userId.name?.firstName || "",
                lastName: balance.userId.name?.lastName || "",
              },
              _id: balance.userId._id,
              mobileNumber: balance.userId.mobileNumber,
              upiId: balance.userId.upiId,
            };
          }
        }

        sanitizeData.balances.push(sanitizedMemberBalance);
      }

      // Add members without balances (members who haven't been involved in expenses)
      for (const memberId of memberIds) {
        if (!processedMemberIds.has(memberId) && memberDetailsMap[memberId]) {
          const memberDetail = memberDetailsMap[memberId];
          const sanitizedMemberBalance: BalanceResponse = {
            _id: new mongoose.Types.ObjectId(),
            JournelId: new mongoose.Types.ObjectId(),
            groupId: new mongoose.Types.ObjectId(groupId as string),
            memberAmount: 0,
            userAmount: 0,
            userId: userId,
            memberdetails: memberDetail,
          } as BalanceResponse;

          sanitizeData.balances.push(sanitizedMemberBalance);
        }
      }

      req.resData = {
        statusCode: 200,
        message: "Data found",
        data: sanitizeData,
      };

      return next();
    } catch (error) {
      return next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new Unauthorized();
      }

      const { groupId } = req.params;
      const userId = req.user.id;

      const result = await this.groupService.deleteGroup(
        groupId as string,
        userId,
      );

      let deletedBy = await this.userService.findUserEmail(userId);

      if (!result) {
        throw new Unauthorized("Only the group creator can delete this group");
      }

      req.resData = {
        statusCode: 200,
        message: "Group deleted successfully",
        data: {},
      };

      next();
      for (let member of result.members) {
        if (!(member.memberId instanceof mongoose.Types.ObjectId)) {
          await this.mailService.sendMail(
            member.memberId.emailId,
            "A SplitWise group was deleted",
            `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Group Deleted</h2>

  <p>Hi ${member.memberId.name.firstName || "there"},</p>

  <p>The group <strong>"${result.name}"</strong> has been deleted by 
  <strong>${deletedBy?.name.firstName}</strong>.</p>

  <p>You will no longer be able to access this group or its expenses.</p>

  <br/>

  <p>If you believe this was done by mistake, please contact the group members.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>SplitWise Team</strong></p>
</div>
`,
          );
        }
      }

      return;
    } catch (error) {
      return next(error);
    }
  };
}
