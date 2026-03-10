import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import { BootStrap } from "./main.js";
import dotenv from "dotenv";

dotenv.config();

await new BootStrap().start();
