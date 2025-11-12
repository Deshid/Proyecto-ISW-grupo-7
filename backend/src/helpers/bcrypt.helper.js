"use strict";
import bcrypt from "bcryptjs";

export async function encryptPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, receivedPassword) {
  try {
    if (!password || !receivedPassword) return false;

    let hash = receivedPassword;
    if (typeof receivedPassword === "object") {
      // try common fallbacks when an object is passed accidentally
      if (receivedPassword.password) hash = receivedPassword.password;
      else if (receivedPassword.password_hash) hash = receivedPassword.password_hash;
      else if (typeof receivedPassword.toString === "function") hash = receivedPassword.toString();
      else hash = String(receivedPassword);
    }

    if (typeof hash !== "string") hash = String(hash);

    return await bcrypt.compare(password, hash);
  } catch (err) {
    // Re-throw with clearer message for upstream handling
    throw new Error(`comparePassword error: ${err.message}`);
  }
}