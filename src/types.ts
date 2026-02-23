export type PullRequestTitleValidatorOptions = {
  issuePrefix?: string;
  strictIssueSuffix?: boolean;
  enforceLowercase?: boolean;
  verbs?: readonly string[];
  addVerbs?: readonly string[];
};

export type PullRequestTitleInput = {
  title: string;
};
