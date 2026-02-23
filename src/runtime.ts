import { parseBooleanInput, parseVerbsInput } from "./parsing";
import { createPullRequestTitleValidator } from "./validator";

export function runFromEnv(): void {
  const title = process.env.PR_TITLE ?? "";
  const issuePrefix = process.env.ISSUE_PREFIX ?? "";
  const strictIssueSuffixInput = process.env.STRICT_ISSUE_SUFFIX ?? "true";
  const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
  const verbsInput = process.env.VERBS ?? "";
  const addVerbsInput = process.env.ADD_VERBS ?? "";

  const validatePullRequestTitle = createPullRequestTitleValidator({
    issuePrefix,
    strictIssueSuffix: parseBooleanInput("strict-issue-suffix", strictIssueSuffixInput),
    enforceLowercase: parseBooleanInput("enforce-lowercase", enforceLowercaseInput),
    verbs: parseVerbsInput(verbsInput),
    addVerbs: parseVerbsInput(addVerbsInput),
  });

  validatePullRequestTitle({ title });
}
