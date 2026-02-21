import { runFromEnv } from "./runtime";

export { checkPrTitle, createPrTitleValidator } from "./validator";
export type { PrTitleInput, PrTitleValidatorOptions } from "./types";

if (require.main === module) {
  try {
    runFromEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::${message}`);
    process.exit(1);
  }
}
