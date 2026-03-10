import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import nodemailer from "nodemailer";

export class MailService {
  private transpoter: nodemailer.Transporter;

  constructor() {
    this.transpoter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {},
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      let result = await this.transpoter.sendMail({
        from: process.env.SMTP_EMAIL,
        to,
        subject,
        html,
      });
    } catch (err) {
      console.log(err, "**********************ERROR*********************");
      throw err;
    }
  }
}
