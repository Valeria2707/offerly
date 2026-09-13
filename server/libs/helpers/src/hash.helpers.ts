import { createHash } from "node:crypto";

export function calculateSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}
