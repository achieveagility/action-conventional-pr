import { describe, expect, it } from "vitest";
import { createPullRequestTitleValidator } from "./validator";

describe("createPullRequestTitleValidator", () => {
  it("accepts a valid title with default settings", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat: add logging" })).not.toThrow();
  });

  it("throws when title is empty", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "" })).toThrow(
      "Unable to validate PR title. title is empty.",
    );
  });

  it("throws when title does not have a subject separator", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat add logging" })).toThrow(
      "PR title must include a subject after ': '.",
    );
  });

  it("throws when subject is empty", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat: " })).toThrow(
      "PR subject cannot be empty.",
    );
  });

  it("throws when subject contains uppercase by default", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat: Add logging" })).toThrow(
      "PR subject must be all lowercase.",
    );
  });

  it("allows uppercase when enforceLowercase is false", () => {
    const validate = createPullRequestTitleValidator({
      enforceLowercase: false,
    });

    expect(() => validate({ title: "feat: Add logging" })).not.toThrow();
  });

  it("throws when first word is not an allowed imperative verb", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat: ship logging" })).toThrow(
      "PR subject must start with an allowed imperative verb (for example: add, update, fix, remove, refactor).",
    );
  });

  it("accepts custom imperative verbs", () => {
    const validate = createPullRequestTitleValidator({
      imperativeVerbs: ["ship"],
    });

    expect(() => validate({ title: "feat: ship logging" })).not.toThrow();
  });

  it("accepts valid issue suffix when configured", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
    });

    expect(() => validate({ title: "feat: add logging ABC-123" })).not.toThrow();
  });

  it("throws when subject has uppercase even with a valid issue suffix", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
    });

    expect(() => validate({ title: "feat: Add logging ABC-123" })).toThrow(
      "PR subject must be all lowercase.",
    );
  });

  it("throws for zero-valued issue suffix when configured", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
    });

    expect(() => validate({ title: "feat: add logging ABC-0" })).toThrow(
      "Issue suffix is invalid. Expected 'ABC-<positive-integer>' (for example ABC-123).",
    );
  });

  it("throws for malformed issue suffix when configured", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
    });

    expect(() => validate({ title: "feat: add logging ABC-001" })).toThrow(
      "Issue suffix is invalid. Expected 'ABC-<positive-integer>' (for example ABC-123).",
    );
  });
});
