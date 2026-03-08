import { NextFunction, Request, Response } from "express";
import { services } from "../store/serviceContainer.js";
import { Unauthorized } from "../error/httpClientError.js";

export class UserController {
  private groupService = services.groupService;

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
