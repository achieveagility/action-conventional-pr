import { defaultImperativeVerbs } from "./verbs";

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeVerbs(input?: readonly string[]): string[] {
  if (!input) {
    return [];
  }

  return input.map((verb) => verb.trim().toLowerCase()).filter((verb) => verb.length > 0);
}

export function getAllowedVerbs(options: {
  verbs?: readonly string[];
  addVerbs?: readonly string[];
}): Set<string> {
  const verbs = normalizeVerbs(options.verbs);
  const addVerbs = normalizeVerbs(options.addVerbs);

  if (verbs.length > 0 && addVerbs.length > 0) {
    throw new Error(
      "verbs and add-verbs cannot both be set. Use verbs to override or add-verbs to extend defaults.",
    );
  }

  if (options.verbs && verbs.length === 0) {
    throw new Error("verbs must contain at least one non-empty verb when provided.");
  }

  if (verbs.length > 0) {
    return new Set(verbs);
  }

  if (addVerbs.length > 0) {
    return new Set([...defaultImperativeVerbs, ...addVerbs]);
  }

  return new Set(defaultImperativeVerbs);
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

export function parseVerbsInput(input: string): string[] | undefined {
  const trimmedInput = input.trim();
  if (trimmedInput.length === 0) {
    return undefined;
  }

  return input
    .split(",")
    .map((verb) => verb.trim())
    .filter((verb) => verb.length > 0);
}
