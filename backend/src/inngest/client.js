import { Inngest } from "inngest";
import dotenv from "dotenv";

dotenv.config();

/**
 * Centrally managed Inngest core engine connection client instance.
 * Explicitly binds production environment validation parameters out of process.env.
 */
export const inngest = new Inngest({ 
  id: "solstice-checkin-workspace",
  // Binds the active publish token key directly to the delivery channel handler
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Enforces production cryptographic verification on inbound cloud worker signals
  signingKey: process.env.INNGEST_SIGNING_KEY
});
