import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
// Chats are kept for CHAT_RETENTION_DAYS after their last message (lib/chat.ts).
crons.daily("delete old chats", { hourUTC: 21, minuteUTC: 30 }, internal.chat.purge, {});
export default crons;
