import crypto from "crypto";

export function generateEmailToken() {
  return crypto.randomBytes(32).toString("hex");
}
