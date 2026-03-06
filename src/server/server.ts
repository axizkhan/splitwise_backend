import { App } from "../app.js";
import http from "http";
import mongoose from "mongoose";

export class Server {
  private SERVER: http.Server;
  private PORT: number | string;
  private MONGODBURL: string;
  private mongooseOption = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  constructor(port: number | string) {
    const appInstance = new App();
    this.PORT = port;
    this.SERVER = http.createServer(appInstance.app);
    this.MONGODBURL = process.env.MONGODB_URL || "";
  }

  async start() {
    try {
      await mongoose.connect(this.MONGODBURL, this.mongooseOption);
      this.SERVER.listen(this.PORT);

      console.log("Server and db connected successfully");
    } catch (err) {
      throw err;
    }
  }
}
