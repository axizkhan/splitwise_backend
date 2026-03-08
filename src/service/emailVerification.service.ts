import EmailVerificationModel from "../models/emailVerficationModel.js";
import { User } from "../types/user";

export class EmailVerificationService {
  constructor() {}

  async createEmailVerification(verficationEmailData: {
    token: string;
    user: User;
  }) {
    try {
      const newEmailVerfication = await EmailVerificationModel.create({
        token: verficationEmailData.token,
        user: verficationEmailData.user,
      });

      return true;
    } catch (err) {
      throw err;
    }
  }

  async findEmailForVerification(token: string) {
    try {
      const verficationEmail = await EmailVerificationModel.findOne({ token });

      return verficationEmail?.user;
    } catch (err) {
      throw err;
    }
  }
}
