import { escapeRegExp, getAllowedVerbs } from "./parsing";
import type { PullRequestTitleInput, PullRequestTitleValidatorOptions } from "./types";

export function createPullRequestTitleValidator(options: PullRequestTitleValidatorOptions = {}) {
  const issuePrefixes = Array.isArray(options.issuePrefix)
    ? options.issuePrefix.map((prefix) => prefix.trim()).filter((prefix) => prefix.length > 0)
    : options.issuePrefix
      ? [options.issuePrefix.trim()].filter((prefix) => prefix.length > 0)
      : [];
  const issueMode = options.issueMode ?? "optional";
  const issueUnknown = options.issueUnknown ?? false;
  const issueNearMiss = options.issueNearMiss ?? false;
  const trailingPunctuation = options.trailingPunctuation ?? false;
  const enforceLowercase = options.enforceLowercase ?? true;
  const allowedVerbs = getAllowedVerbs({
    verbs: options.verbs,
    addVerbs: options.addVerbs,
  });
  const issueLikeSuffixPattern = "([a-z][a-z0-9_]*-[0-9]+|#[0-9]+)";
  const trailingIssueLikeSuffixRegex = new RegExp(`^(.*)\\s${issueLikeSuffixPattern}$`, "i");
  const issuePrefixConfigs = issuePrefixes.map((issuePrefix) => {
    const escapedPrefix = escapeRegExp(issuePrefix);
    const issuePrefixNearMissBase = issuePrefix.replace(/[^a-z0-9]+$/i, "");

    return {
      issuePrefix,
      validTicketRegex: new RegExp(`^(.*)\\s(${escapedPrefix}[1-9][0-9]*)$`),
      prefixedSuffixRegex: new RegExp(`\\s${escapedPrefix}[0-9]+$`),
      issueNearMissRegex:
        issuePrefixNearMissBase !== issuePrefix
          ? new RegExp(`\\s${escapeRegExp(issuePrefixNearMissBase)}[0-9]+$`, "i")
          : null,
    };
  });
  const getIssueSuffixErrorMessage = () => {
    if (issuePrefixes.length === 1) {
      const issuePrefix = issuePrefixes[0];
      return `Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`;
    }

    return `Issue suffix is invalid. Expected one of: ${issuePrefixes
      .map((issuePrefix) => `'${issuePrefix}<positive-integer>'`)
      .join(", ")}.`;
  };
  if (issueMode === "required" && issuePrefixes.length === 0 && !issueUnknown) {
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

    if (/ {2,}/.test(title)) {
      throw new Error("PR title cannot contain repeated spaces.");
    }

    if (enforceLowercase && /[A-Z]/.test(title)) {
      throw new Error("PR title must be all lowercase.");
    }

    const titleMatch = /^[^:]+:\s+(.+)$/.exec(title);
    if (!titleMatch) {
      throw new Error("PR title must include a subject after ': '.");
    }

    const subject = titleMatch[1];
    let subjectCore = subject;
    let hasKnownIssueSuffix = false;
    let hasUnknownIssueSuffix = false;

    if (issuePrefixConfigs.length > 0) {
      const validPrefixConfig = issuePrefixConfigs.find(({ validTicketRegex }) =>
        validTicketRegex.test(subject),
      );

      if (validPrefixConfig) {
        const validMatch = validPrefixConfig.validTicketRegex.exec(subject);
        hasKnownIssueSuffix = true;
        subjectCore = validMatch?.[1] ?? subjectCore;
      } else {
        const invalidPrefixConfig = issuePrefixConfigs.find(
          ({ issueNearMissRegex, prefixedSuffixRegex }) =>
            prefixedSuffixRegex.test(subject) ||
            (!!issueNearMissRegex && issueNearMissRegex.test(subject) && !issueNearMiss),
        );

        if (invalidPrefixConfig) {
          throw new Error(getIssueSuffixErrorMessage());
        }

        const trailingIssueMatch = trailingIssueLikeSuffixRegex.exec(subject);
        if (trailingIssueMatch) {
          hasUnknownIssueSuffix = true;
          if (!issueUnknown) {
            throw new Error(getIssueSuffixErrorMessage());
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

    if (!trailingPunctuation && /[.!?,;:]$/.test(subjectCore)) {
      throw new Error("PR subject cannot end with trailing punctuation.");
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
