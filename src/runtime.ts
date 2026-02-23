import {
  parseBooleanInput,
  parseIssueModeInput,
  parseVerbsInput,
} from "./parsing";
import { createPullRequestTitleValidator } from "./validator";

export function runFromEnv(): void {
  const title = process.env.PR_TITLE ?? "";
  const issuePrefix = process.env.ISSUE_PREFIX ?? "";
  const issueModeInput = process.env.ISSUE_MODE ?? "optional";
  const issueUnknownInput = process.env.ISSUE_UNKNOWN ?? "false";
  const issueNearMissInput = process.env.ISSUE_NEAR_MISS ?? "false";
  const trailingPunctuationInput = process.env.TRAILING_PUNCTUATION ?? "false";
  const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
  const verbsInput = process.env.VERBS ?? "";
  const addVerbsInput = process.env.ADD_VERBS ?? "";

  const validatePullRequestTitle = createPullRequestTitleValidator({
    issuePrefix,
    issueMode: parseIssueModeInput(issueModeInput),
    issueUnknown: parseBooleanInput("issue-unknown", issueUnknownInput),
    issueNearMiss: parseBooleanInput("issue-near-miss", issueNearMissInput),
    trailingPunctuation: parseBooleanInput(
      "trailing-punctuation",
      trailingPunctuationInput,
    ),
    enforceLowercase: parseBooleanInput("enforce-lowercase", enforceLowercaseInput),
    verbs: parseVerbsInput(verbsInput),
    addVerbs: parseVerbsInput(addVerbsInput),
  });

  validatePullRequestTitle({ title });
}
