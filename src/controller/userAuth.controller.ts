import { Request, Response, NextFunction } from "express";
import { HashingUtil } from "../utils/hashing.util.js";
import passport from "passport";

import { UserAuthServices } from "../service/userAuth.service.js";
import { Conflict, NotFound, Unauthorized } from "../error/httpClientError.js";
import { ObjectId } from "mongoose";
import { JWTService } from "../service/jwtToken.service.js";
import { MailService } from "../utils/mail/mail.service.js";
import { generateEmailToken } from "../utils/mail/mailTokenGeneration.js";
import EmailVerificationService from "../service/emailVerification.service.js";
import { User } from "../types/user.js";
export class UserAuthController {
  private userAuthService: UserAuthServices;
  private hashingUtliFunctions: HashingUtil;
  private jwt: JWTService;
  private mailService: MailService;
  private emailVerificationService: EmailVerificationService;

  constructor() {
    this.userAuthService = new UserAuthServices();
    this.hashingUtliFunctions = new HashingUtil();
    this.mailService = new MailService();
    this.jwt = new JWTService();
    this.emailVerificationService = new EmailVerificationService();
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

        await this.mailService.sendMail(
          user.email,
          "Verify your email",
          `
          <h2>Email Verification</h2>
          <p>Click the link below to verify your email</p>
          <a href="${verifyUrl}">Verify Email</a>
          `,
        );
      }

      const resData = {
        data: "Check you email",
        message: "User signup successfully",
        statusCode: 201,
      };
      req.resData = resData;

      next();
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
        message: "User signup successfully",
        statusCode: 201,
      };

      req.resData = resData;

      next();
    } catch (err) {}
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
