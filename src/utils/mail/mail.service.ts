import { BrevoClient } from "@getbrevo/brevo";

export class MailService {
  private client: BrevoClient;

  constructor() {
    this.client = new BrevoClient({
      apiKey: process.env.BRAVO_API_KEY as string,
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          email: "splitlybya@gmail.com",
          name: "Splitly",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      });

      console.log("Email sent successfully");
    } catch (err) {
      console.error("Email error:", err);
    }
  }
}
