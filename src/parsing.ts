import { defaultImperativeVerbs } from "./verbs";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getAllowedVerbs(input?: readonly string[]): Set<string> {
  if (!input || input.length === 0) {
    return new Set(defaultImperativeVerbs);
  }

  const verbs = input
    .map((verb) => verb.trim().toLowerCase())
    .filter((verb) => verb.length > 0);

  if (verbs.length === 0) {
    throw new Error(
      "imperativeVerbs must contain at least one non-empty verb when provided.",
    );
  }

  return new Set(verbs);
}

export function parseBooleanInput(name: string, value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error(`${name} must be either 'true' or 'false'.`);
}

export function parseImperativeVerbsInput(input: string): string[] {
  return input
    .split(",")
    .map((verb) => verb.trim())
    .filter((verb) => verb.length > 0);
}
