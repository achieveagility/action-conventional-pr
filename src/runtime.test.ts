import { describe, expect, it } from "vitest";
import { runFromEnv } from "./runtime";

describe("runFromEnv", () => {
  it("treats empty verbs inputs as unset", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging",
      ISSUE_PREFIX: "",
      STRICT_ISSUE_SUFFIX: "true",
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

  it("rejects issue-like suffix when strict-issue-suffix is true", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging ABC-123",
      ISSUE_PREFIX: "",
      STRICT_ISSUE_SUFFIX: "true",
      ENFORCE_LOWERCASE: "true",
      VERBS: "",
      ADD_VERBS: "",
    };

    try {
      expect(() => runFromEnv()).toThrow(
        "Issue suffix is not allowed unless issue-prefix is configured. Set strict-issue-suffix to false to allow it.",
      );
    } finally {
      process.env = originalEnv;
    }
  });

  it("allows issue-like suffix when strict-issue-suffix is false", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging ABC-123",
      ISSUE_PREFIX: "",
      STRICT_ISSUE_SUFFIX: "false",
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
