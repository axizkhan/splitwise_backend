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
          email: process.env.BREVO_EMAIL as string,
          name: "SplitlyBya",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      });
    } catch (err) {
      console.error("Email error:", err);
    }
  }
}
