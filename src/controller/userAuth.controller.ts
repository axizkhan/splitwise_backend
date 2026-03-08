import { Request, Response, NextFunction } from "express";
import { HashingUtil } from "../utils/hashing.util.js";
import passport from "passport";

import { Unauthorized } from "../error/httpClientError.js";
import { MailService } from "../utils/mail/mail.service.js";
import { generateEmailToken } from "../utils/mail/mailTokenGeneration.js";
import { JWTService } from "../service/jwtToken.service.js";
import { services } from "../store/serviceContainer.js";
import { User } from "../types/user.js";

export class UserAuthController {
  private userAuthService = services.userService;
  private jwt: JWTService;
  private mailService: MailService;
  private emailVerificationService = services.emailVerificationService;
  private groupService = services.groupService;
  private userInviteService = services.userInviteService;
  private hashingUtliFunctions: HashingUtil;

  constructor() {
    this.hashingUtliFunctions = new HashingUtil();
    this.jwt = new JWTService();
    this.mailService = new MailService();
  }

  userLocalSignup = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.body;
    const hashPassword = await this.hashingUtliFunctions.hashPassword(
      user.password,
    );

    user.password = hashPassword;

    try {
      const token = generateEmailToken();

      let isEmailVerifyCreated =
        await this.emailVerificationService.createEmailVerification({
          token,
          user,
        });

      if (isEmailVerifyCreated) {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

        const resData = {
          data: "Check you email",
          message: "User signup successfully",
          statusCode: 201,
        };
        req.resData = resData;

        next();
        await this.mailService.sendMail(
          user.email,
          "Verify your email",
          `
          <h2>Email Verification</h2>
          <p>Click the link below to verify your email</p>
          <a href="${verifyUrl}">Verify Email</a>

           <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
  </div>
          `,
        );
      }

      return;
    } catch (error) {
      next(error);
    }
  };

  userLocalVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { token } = req.query;
      let userData =
        await this.emailVerificationService.findEmailForVerification(
          token as string,
        );

      let newUser = await this.userAuthService.userLocalSignup(
        userData as User,
      );

      const accessToken = await this.jwt.grantAccessToken(newUser._id);

      const resData = {
        data: {
          user: {
            id: newUser._id,
            email: newUser.emailId,
            firstName: newUser.name?.firstName || "",
            lastName: newUser.name?.lastName || "",
          },
          accessToken,
        },
        message: "User verified successfully",
        statusCode: 201,
      };

      const invites = await this.userInviteService.findInvitesByEmail(
        newUser.emailId,
      );

      for (const invite of invites) {
        await this.groupService.addUserToGroup(
          invite.groupId.toString(),
          newUser._id.toString(),
        );
      }

      await this.userInviteService.deleteInvitesByEmail(newUser.emailId);

      req.resData = resData;
      next();

      await this.mailService.sendMail(
        newUser.emailId,
        "Welcome to SplitWise 🎉",
        `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>Welcome to SplitWise</h2>

  <p>Hi ${newUser.name || "there"},</p>

  <p>Your account has been successfully created.</p>

  <p>You can now start tracking and splitting expenses with your friends and groups.</p>

  <p>We're happy to have you with us!</p>

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

  userLocalLogin = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      { session: false },
      async (err: Error, user: any, info: any) => {
        try {
          if (err || !user) {
            return next(
              new Unauthorized(
                "Either password or email is incorrect",
                "PASSWORD_OR_EMAIL_INCORRECT",
              ),
            );
          }

          req.login(user, { session: false }, async (loginErr) => {
            if (loginErr) {
              return next(
                new Unauthorized(
                  "Either password or email is incorrect",
                  "PASSWORD_OR_EMAIL_INCORRECT",
                ),
              );
            }

            try {
              const accessToken = await this.jwt.grantAccessToken(user._id);

              const resData = {
                data: {
                  user: {
                    id: user._id,
                    email: user.emailId,
                    firstName: user.name?.firstName || "",
                    lastName: user.name?.lastName || "",
                  },
                  accessToken,
                },
                message: "User login successfully",
                statusCode: 200,
              };

              req.resData = resData;

              next();

              await this.mailService.sendMail(
                user.emailId,
                "New Login to Your SplitWise Account",
                `
<div style="font-family: Arial, sans-serif; line-height:1.6">
  <h2>New Login Detected</h2>

  <p>Hi ${user.name || "there"},</p>

  <p>We noticed a login to your <strong>SplitWise</strong> account.</p>

  <p><strong>Login Details:</strong></p>
  <ul>
    <li>Time: ${new Date().toLocaleString()}</li>
    <li>IP Address: ${req.ip}</li>
  </ul>

  <p>If this was you, you can safely ignore this email.</p>

  <br/>

  <p>Best regards,<br/>
  <strong>Splitly Team</strong></p>
</div>
`,
              );
            } catch (tokenErr) {
              next(tokenErr);
            }
          });
        } catch (error) {
          next(error);
        }
      },
    )(req, res, next);
  };
}
