export type PullRequestTitleValidatorOptions = {
  issuePrefix?: string;
  enforceLowercase?: boolean;
  verbs?: readonly string[];
  addVerbs?: readonly string[];
};

export type PullRequestTitleInput = {
  title: string;
};
