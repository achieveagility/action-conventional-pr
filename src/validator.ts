import { escapeRegExp, getAllowedVerbs } from "./parsing";
import type {
  PullRequestTitleInput,
  PullRequestTitleValidatorOptions,
} from "./types";

export function createPullRequestTitleValidator(
  options: PullRequestTitleValidatorOptions = {},
) {
  const issuePrefix = options.issuePrefix ?? "";
  const issueMode = options.issueMode ?? "optional";
  const issueUnknown = options.issueUnknown ?? false;
  const enforceLowercase = options.enforceLowercase ?? true;
  const allowedVerbs = getAllowedVerbs({
    verbs: options.verbs,
    addVerbs: options.addVerbs,
  });
  const issueLikeSuffixPattern = "([a-z][a-z0-9_]*-[0-9]+|#[0-9]+)";
  const trailingIssueLikeSuffixRegex = new RegExp(
    `^(.*)\\s${issueLikeSuffixPattern}$`,
    "i",
  );
  if (issueMode === "required" && issuePrefix === "" && !issueUnknown) {
    throw new Error(
      "Invalid issue configuration. issue-mode 'required' needs issue-prefix or issue-unknown=true.",
    );
  }

  return ({ title }: PullRequestTitleInput): void => {
    if (title === "") {
      throw new Error("Unable to validate PR title. title is empty.");
    }

    if (/^[^:]+:\s*$/.test(title)) {
      throw new Error("PR subject cannot be empty.");
    }

    if (title !== title.trim()) {
      throw new Error("PR title cannot have leading or trailing whitespace.");
    }

    const titleMatch = /^[^:]+:\s+(.+)$/.exec(title);
    if (!titleMatch) {
      throw new Error("PR title must include a subject after ': '.");
    }

    const subject = titleMatch[1];
    let subjectCore = subject;
    let hasKnownIssueSuffix = false;
    let hasUnknownIssueSuffix = false;

    if (issuePrefix !== "") {
      const escapedPrefix = escapeRegExp(issuePrefix);
      const validTicketRegex = new RegExp(
        `^(.*)\\s(${escapedPrefix}[1-9][0-9]*)$`,
      );
      const prefixedSuffixRegex = new RegExp(`\\s${escapedPrefix}[0-9]+$`);

      const validMatch = validTicketRegex.exec(subject);
      if (validMatch) {
        hasKnownIssueSuffix = true;
        subjectCore = validMatch[1];
      } else if (prefixedSuffixRegex.test(subject)) {
        throw new Error(
          `Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`,
        );
      } else {
        const trailingIssueMatch = trailingIssueLikeSuffixRegex.exec(subject);
        if (trailingIssueMatch) {
          hasUnknownIssueSuffix = true;
          if (!issueUnknown) {
            throw new Error(
              `Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`,
            );
          }
          subjectCore = trailingIssueMatch[1];
        }
      }
    } else {
      const trailingIssueMatch = trailingIssueLikeSuffixRegex.exec(subjectCore);
      if (trailingIssueMatch) {
        hasUnknownIssueSuffix = true;
        if (!issueUnknown) {
          throw new Error(
            "Issue suffix is not allowed unless issue-unknown is true or issue-prefix is configured.",
          );
        }
        subjectCore = trailingIssueMatch[1];
      }
    }

    if (issueMode === "required" && !hasKnownIssueSuffix && !hasUnknownIssueSuffix) {
      throw new Error("Issue suffix is required by issue-mode 'required'.");
    }

    if (subjectCore.length === 0) {
      throw new Error("PR subject cannot be empty.");
    }

    if (enforceLowercase && /[A-Z]/.test(subjectCore)) {
      throw new Error("PR subject must be all lowercase.");
    }

    const firstWord = (subjectCore.split(" ")[0] ?? "").toLowerCase();
    if (!allowedVerbs.has(firstWord)) {
      throw new Error(
        [
          "PR subject must start with an allowed imperative verb,",
          `for example: ${Array.from(allowedVerbs)
            .map((verb) => `'${verb}'`)
            .join(", ")}.`,
        ].join(" "),
      );
    }
  };
}
