import { UserModel } from "../models/userModel.js";

export class UserService {
  async findUserEmail(userId: string) {
    try {
      let result = await UserModel.findOne(
        { _id: userId },
        { emailId: 1, _id: 0 },
      );

      return result;
    } catch (err) {
      throw err;
    }
  }
}
