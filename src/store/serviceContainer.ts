import { ExpenseService } from "../service/expense.service.js";
import { GroupService } from "../service/group.service.js";
import { BalanceService } from "../service/balance.service.js";
import { EntryService } from "../service/enetry.service.js";
import { UserAuthServices } from "../service/userAuth.service.js";
import { MailService } from "../utils/mail/mail.service.js";
import { PaymentService } from "../service/payment.service.js";
import { JournelServices } from "../service/journel.service.js";
import { ReminderService } from "../service/reminder.service.js";
import { UserInviteService } from "../service/invites.service.js";
import { EmailVerificationService } from "../service/emailVerification.service.js";
import { JWTService } from "../service/jwtToken.service.js";

class ServiceContainer {
  public expenseService = new ExpenseService();
  public groupService = new GroupService();
  public balanceService = new BalanceService();
  public entryService = new EntryService();
  public userService = new UserAuthServices();
  public mailService = new MailService();
  public paymentService = new PaymentService();
  public journelService = new JournelServices();
  public reminderService = new ReminderService();
  public userInviteService = new UserInviteService();
  public emailVerificationService = new EmailVerificationService();
  public jwtService = new JWTService();
}

export const services = new ServiceContainer();
