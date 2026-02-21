import { runFromEnv } from "./runtime";

export { createPullRequestTitleValidator } from "./validator";
export type {
  PullRequestTitleInput,
  PullRequestTitleValidatorOptions,
} from "./types";

if (require.main === module) {
  try {
    runFromEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`::error::${message}`);
    process.exit(1);
  }
}
