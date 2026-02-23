import { describe, expect, it } from "vitest";
import { runFromEnv } from "./runtime";

describe("runFromEnv", () => {
  it("treats empty verbs inputs as unset", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging",
      ISSUE_PREFIX: "",
      ENFORCE_LOWERCASE: "true",
      VERBS: "",
      ADD_VERBS: "",
    };

    try {
      expect(() => runFromEnv()).not.toThrow();
    } finally {
      process.env = originalEnv;
    }
  });
});
