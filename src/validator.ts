import { escapeRegExp, getAllowedVerbs } from "./parsing";
import type {
  PullRequestTitleInput,
  PullRequestTitleValidatorOptions,
} from "./types";

export function createPullRequestTitleValidator(
  options: PullRequestTitleValidatorOptions = {},
) {
  const issuePrefix = options.issuePrefix ?? "";
  const enforceLowercase = options.enforceLowercase ?? true;
  const allowedVerbs = getAllowedVerbs({
    verbs: options.verbs,
    addVerbs: options.addVerbs,
  });

  return ({ title }: PullRequestTitleInput): void => {
    if (title === "") {
      throw new Error("Unable to validate PR title. title is empty.");
    }

    if (/^[^:]+:\s*$/.test(title)) {
      throw new Error("PR subject cannot be empty.");
    }

    const titleMatch = /^[^:]+:\s+(.+)$/.exec(title);
    if (!titleMatch) {
      throw new Error("PR title must include a subject after ': '.");
    }

    const subject = titleMatch[1];
    let subjectCore = subject;

    if (issuePrefix !== "") {
      const escapedPrefix = escapeRegExp(issuePrefix);
      const validTicketRegex = new RegExp(`^(.*)\\s(${escapedPrefix}[1-9][0-9]*)$`);
      const prefixedSuffixRegex = new RegExp(`\\s${escapedPrefix}[0-9]+$`);

      const validMatch = validTicketRegex.exec(subject);
      if (validMatch) {
        subjectCore = validMatch[1];
      } else if (prefixedSuffixRegex.test(subject)) {
        throw new Error(
          `Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`,
        );
      }
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
        "PR subject must start with an allowed imperative verb (for example: add, update, fix, remove, refactor).",
      );
    }
  };
}
