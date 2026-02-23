export type IssueMode = "optional" | "required";

export type PullRequestTitleValidatorOptions = {
  issuePrefix?: string;
  issueMode?: IssueMode;
  issueUnknown?: boolean;
  enforceLowercase?: boolean;
  verbs?: readonly string[];
  addVerbs?: readonly string[];
};

export type PullRequestTitleInput = {
  title: string;
};
