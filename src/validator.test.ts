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

  it("throws when title has leading whitespace", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: " feat: add logging" })).toThrow(
      "PR title cannot have leading or trailing whitespace.",
    );
  });

  it("throws when title has trailing whitespace", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat: add logging " })).toThrow(
      "PR title cannot have leading or trailing whitespace.",
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
      "PR subject must start with an allowed imperative verb, for example: 'add', 'adjust', 'bump', 'change', 'clean', 'create', 'disable', 'document', 'drop', 'enable', 'fix', 'implement', 'improve', 'introduce', 'migrate', 'refactor', 'remove', 'rename', 'replace', 'revert', 'simplify', 'update', 'upgrade'.",
    );
  });

  it("accepts custom verbs override", () => {
    const validate = createPullRequestTitleValidator({
      verbs: ["ship"],
    });

    expect(() => validate({ title: "feat: ship logging" })).not.toThrow();
  });

  it("accepts add-verbs additions", () => {
    const validate = createPullRequestTitleValidator({
      addVerbs: ["ship"],
    });

    expect(() => validate({ title: "feat: ship logging" })).not.toThrow();
  });

  it("deduplicates add-verbs against defaults", () => {
    const validate = createPullRequestTitleValidator({
      addVerbs: ["add", "ship", "ship"],
    });

    expect(() => validate({ title: "feat: add logging" })).not.toThrow();
    expect(() => validate({ title: "feat: ship logging" })).not.toThrow();
  });

  it("throws when verbs and add-verbs are both set", () => {
    expect(() =>
      createPullRequestTitleValidator({
        verbs: ["ship"],
        addVerbs: ["polish"],
      }),
    ).toThrow(
      "verbs and add-verbs cannot both be set. Use verbs to override or add-verbs to extend defaults.",
    );
  });

  it("accepts valid issue suffix when configured", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
    });

    expect(() =>
      validate({ title: "feat: add logging ABC-123" }),
    ).not.toThrow();
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

  it("throws when issue-like suffix is used without issue-prefix by default", () => {
    const validate = createPullRequestTitleValidator();

    expect(() => validate({ title: "feat: add logging ABC-123" })).toThrow(
      "Issue suffix is not allowed unless issue-prefix is configured. Set strict-issue-suffix to false to allow it.",
    );
  });

  it("allows issue-like suffix without issue-prefix when strictIssueSuffix is false", () => {
    const validate = createPullRequestTitleValidator({
      strictIssueSuffix: false,
    });

    expect(() =>
      validate({ title: "feat: add logging ABC-123" }),
    ).not.toThrow();
    expect(() => validate({ title: "feat: add logging #123" })).not.toThrow();
  });

  it("throws when suffix uses a different issue format while issue-prefix is configured", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
    });

    expect(() => validate({ title: "feat: add logging XYZ-123" })).toThrow(
      "Issue suffix is invalid. Expected 'ABC-<positive-integer>' (for example ABC-123).",
    );
  });

  it("allows different issue format with configured issue-prefix when strictIssueSuffix is false", () => {
    const validate = createPullRequestTitleValidator({
      issuePrefix: "ABC-",
      strictIssueSuffix: false,
    });

    expect(() =>
      validate({ title: "feat: add logging XYZ-123" }),
    ).not.toThrow();
  });
});
