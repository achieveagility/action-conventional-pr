const DEFAULT_IMPERATIVE_VERBS = [
  "add",
  "adjust",
  "bump",
  "change",
  "clean",
  "create",
  "disable",
  "document",
  "drop",
  "enable",
  "fix",
  "implement",
  "improve",
  "introduce",
  "migrate",
  "optimize",
  "refactor",
  "remove",
  "rename",
  "replace",
  "revert",
  "simplify",
  "update",
  "upgrade"
] as const;

const title = process.env.PR_TITLE ?? "";
const issuePrefix = process.env.ISSUE_PREFIX ?? "";
const enforceLowercaseInput = process.env.ENFORCE_LOWERCASE ?? "true";
const imperativeVerbsInput = process.env.IMPERATIVE_VERBS ?? "";

function fail(message: string): never {
  console.error(`::error::${message}`);
  process.exit(1);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAllowedVerbs(input: string): Set<string> {
  if (input.trim() === "") {
    return new Set(DEFAULT_IMPERATIVE_VERBS);
  }

  const verbs = input
    .split(",")
    .map((verb) => verb.trim().toLowerCase())
    .filter((verb) => verb.length > 0);

  if (verbs.length === 0) {
    fail("imperative-verbs must contain at least one verb when provided.");
  }

  return new Set(verbs);
}

function parseBooleanInput(name: string, value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  fail(`${name} must be either 'true' or 'false'.`);
}

if (title === "") {
  fail("Unable to validate PR title. PR_TITLE is empty.");
}

const titleMatch = /^[^:]+:\s+(.+)$/.exec(title);
if (!titleMatch) {
  fail("PR title must include a subject after ': '.");
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
    fail(
      `Issue suffix is invalid. Expected '${issuePrefix}<positive-integer>' (for example ${issuePrefix}123).`
    );
  }
}

if (subjectCore.length === 0) {
  fail("PR subject cannot be empty.");
}

const enforceLowercase = parseBooleanInput("enforce-lowercase", enforceLowercaseInput);
if (enforceLowercase && /[A-Z]/.test(subjectCore)) {
  fail("PR subject must be all lowercase.");
}

const firstWord = (subjectCore.split(" ")[0] ?? "").toLowerCase();
const allowedVerbs = getAllowedVerbs(imperativeVerbsInput);
if (!allowedVerbs.has(firstWord)) {
  fail(
    "PR subject must start with an allowed imperative verb (for example: add, update, fix, remove, refactor)."
  );
}
