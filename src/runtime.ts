import { parseBooleanInput, parseImperativeVerbsInput } from "./parsing";
import { createPrTitleValidator } from "./validator";

export function runFromEnv(): void {
  const title = process.env.PR_TITLE ?? "";
  const issuePrefix = process.env.ISSUE_PREFIX ?? "";
  const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
  const imperativeVerbsInput = process.env.IMPERATIVE_VERBS ?? "";

  const validatePrTitle = createPrTitleValidator({
    issuePrefix,
    enforceLowercase: parseBooleanInput(
      "enforce-lowercase",
      enforceLowercaseInput,
    ),
    imperativeVerbs: parseImperativeVerbsInput(imperativeVerbsInput),
  });

  validatePrTitle({ title });
}
