import { NextFunction, Request, Response } from "express";

import { Unauthorized } from "../error/httpClientError.js";
import { JournelServices } from "../service/journel.service.js";

export class JournelController {
  private journelService: JournelServices;
  constructor() {
    this.journelService = new JournelServices();
  }

  getJournelEntries = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { journelId } = req.params;
      const { pageNumber } = req.params;

      let journels = await this.journelService.allUserJournel(
        journelId as string,
        Number(pageNumber),
      );

      req.resData = {
        message: "Data send Successfully",
        data: journels || "",
        statusCode: 200,
      };

      return next();
    }
    throw new Unauthorized();
  };

  getGroupJournalEntries = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { groupId } = req.params;
      const { pageNumber } = req.params;

      let journels = await this.journelService.allGroupJournalEntries(
        groupId as string,
        Number(pageNumber),
      );

      req.resData = {
        message: "Data send Successfully",
        data: journels || "",
        statusCode: 200,
      };

      return next();
    }
    throw new Unauthorized();
  };

  getUserToUserJournalEntries = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (req.user) {
      const { groupId, memberId } = req.params;
      const { pageNumber } = req.params;
      const loggedInUserId = req.user.id;

      let journels = await this.journelService.userToUserJournalEntries(
        groupId as string,
        loggedInUserId as string,
        memberId as string,
        Number(pageNumber),
      );

      req.resData = {
        message: "Data send Successfully",
        data: {
          entries: journels.journelData,
          totalEntryCount: journels.totalEntryCount,
        },
        statusCode: 200,
      };

      return next();
    }
    throw new Unauthorized();
  };
}
