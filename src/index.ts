import { BootStrap } from "./main.js";
import dotenv from "dotenv";

dotenv.config();

await new BootStrap().start();
