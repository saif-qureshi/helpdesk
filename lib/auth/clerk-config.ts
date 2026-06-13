/**
 * Whether Clerk is configured with real keys. Lets the app run as a viewable
 * static design with no auth until real keys are added — then auth turns on
 * automatically. The placeholder in .env.example is `pk_test_...`.
 */
const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const isClerkConfigured =
  typeof key === "string" && key.startsWith("pk_") && !key.includes("...");
