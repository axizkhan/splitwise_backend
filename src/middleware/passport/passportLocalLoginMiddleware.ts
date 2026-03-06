import passport from "passport";
import * as LocalStrategy from "passport-local";
import { UserAuthServices } from "../../service/userAuth.service";
import { Conflict } from "../../error/httpClientError";
import { HashingUtil } from "../../utils/hashing.util";

export class PassportStrategy {
  private userService: UserAuthServices;
  private hashUtil: HashingUtil;
  constructor() {
    this.userService = new UserAuthServices();
    this.hashUtil = new HashingUtil();
  }
  localStrtegyFactory() {
    return passport.use(
      new LocalStrategy.Strategy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
          try {
            const user = await this.userService.findUserLocalLogin(email);
            if (!user) {
              return done(null, false, {
                message: "Password or Email is Incorrect",
              });
            }

            const isPasswordMatched =
              await this.hashUtil.hashPasswordComparison(
                password,
                user.account.passwordHash as string,
              );

            if (!isPasswordMatched) {
              return done(null, false, {
                message: "Password or Email is Incorrect",
              });
            }

            return done(null, user as unknown as Express.User, {
              message: "LoggedIn",
            });
          } catch (error) {
            throw error;
          }
        },
      ),
    );
  }
}
