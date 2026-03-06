import { NextFunction, Request, Response } from "express";
import { GroupService } from "../service/group.service";

import { Unauthorized } from "../error/httpClientError";

export class UserController {
  private groupService: GroupService;
  constructor() {
    this.groupService = new GroupService();
  }

  getAllGroup = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      let result = await this.groupService.getAllGroup(req.user.id);

      let finalData = result.map((group) => {
        return {
          _id: group._id,
          name: group.name,
          members: group.members,
          createdAt: group.createdAt || new Date(),
          description: group.description || "",
        };
      });

      req.resData = {
        data: finalData,
        statusCode: 200,
        message: "Data found sucessfully",
      };

      return next();
    }
    throw new Unauthorized();
  };
}
