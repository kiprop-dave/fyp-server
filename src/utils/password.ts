// Some utility functions
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const generateHashedPassword = (password: string): string => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${hash}.${salt}`;
};

const compare = (storedKey: string, suppliedKey: string): boolean => {
  const [hash, salt] = storedKey.split(".");
  const keyHash = scryptSync(suppliedKey, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash), Buffer.from(keyHash));
};

// Export the functions
export { generateHashedPassword, compare };
