import { Inngest } from "inngest";
import dotenv from "dotenv";

dotenv.config();

/**
 * Centrally managed Inngest core engine connection client instance.
 * Explicitly binds production environment validation parameters out of process.env.
 */
export const inngest = new Inngest({
  id: "solstice-checkin-workspace",
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY // 👈 Fixed: Capital 'K' ensures proper SDK initialization mapping
});
