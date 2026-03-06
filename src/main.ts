import { Server } from "./server/server";
import dotenv from "dotenv";

export class BootStrap {
  private PORT: number | string;
  private SERVER: Server;

  constructor() {
    this.envLoad();
    /**uncomment in production to not allowed the setup of application if their is no @PORT in .env */
    // this.validatePort();
    this.PORT = this.loadPort();

    this.SERVER = new Server(this.PORT);
  }

  private envLoad() {
    dotenv.config();
  }

  private validatePort() {
    if (!process.env.PORT) {
      throw new Error("Port is not defined");
    }
  }

  private loadPort() {
    return process.env.PORT || 8080;
  }

  async start() {
    await this.SERVER.start();
  }
}
