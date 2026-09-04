import { storage } from "./data.js";

const nicknamePrefix = "how-i-hear-music:account-nickname:";
const nicknameKey = (userId) => `${nicknamePrefix}${String(userId || "unknown")}:v1`;

export const accountNickname = (userId) => {
  const value = storage.get(nicknameKey(userId), "");
  return typeof value === "string" ? value.trim().slice(0, 24) : "";
};

export const saveAccountNickname = (userId, value) => {
  const nickname = String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
  if (!nickname) throw new Error("Enter a nickname.");
  if (!storage.set(nicknameKey(userId), nickname)) throw new Error("The nickname could not be saved in this browser.");
  return nickname;
};

export const accountNicknamePrefix = nicknamePrefix;
