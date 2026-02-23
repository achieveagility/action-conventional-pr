import { describe, expect, it } from "vitest";
import { runFromEnv } from "./runtime";

describe("runFromEnv", () => {
  it("treats empty verbs inputs as unset", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging",
      ISSUE_PREFIX: "",
      ISSUE_MODE: "optional",
      ISSUE_UNKNOWN: "false",
      ISSUE_NEAR_MISS: "false",
      TRAILING_PUNCTUATION: "false",
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

  it("rejects issue-like suffix when issue-unknown is false", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging ABC-123",
      ISSUE_PREFIX: "",
      ISSUE_MODE: "optional",
      ISSUE_UNKNOWN: "false",
      ISSUE_NEAR_MISS: "false",
      TRAILING_PUNCTUATION: "false",
      ENFORCE_LOWERCASE: "true",
      VERBS: "",
      ADD_VERBS: "",
    };

    try {
      expect(() => runFromEnv()).toThrow(
        "Issue suffix is not allowed unless issue-unknown is true or issue-prefix is configured.",
      );
    } finally {
      process.env = originalEnv;
    }
  });

  it("allows issue-like suffix when issue-unknown is true", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging ABC-123",
      ISSUE_PREFIX: "",
      ISSUE_MODE: "optional",
      ISSUE_UNKNOWN: "true",
      ISSUE_NEAR_MISS: "false",
      TRAILING_PUNCTUATION: "false",
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

  it("requires issue suffix when issue-mode is required", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging",
      ISSUE_PREFIX: "ABC-",
      ISSUE_MODE: "required",
      ISSUE_UNKNOWN: "false",
      ISSUE_NEAR_MISS: "false",
      TRAILING_PUNCTUATION: "false",
      ENFORCE_LOWERCASE: "true",
      VERBS: "",
      ADD_VERBS: "",
    };

    try {
      expect(() => runFromEnv()).toThrow(
        "Issue suffix is required by issue-mode 'required'.",
      );
    } finally {
      process.env = originalEnv;
    }
  });

  it("rejects trailing punctuation when trailing-punctuation is false", () => {
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      PR_TITLE: "feat: add logging.",
      ISSUE_PREFIX: "",
      ISSUE_MODE: "optional",
      ISSUE_UNKNOWN: "false",
      ISSUE_NEAR_MISS: "false",
      TRAILING_PUNCTUATION: "false",
      ENFORCE_LOWERCASE: "true",
      VERBS: "",
      ADD_VERBS: "",
    };

    try {
      expect(() => runFromEnv()).toThrow(
        "PR subject cannot end with trailing punctuation.",
      );
    } finally {
      process.env = originalEnv;
    }
  });
});
