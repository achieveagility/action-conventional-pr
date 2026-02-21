export type PullRequestTitleValidatorOptions = {
  issuePrefix?: string;
  enforceLowercase?: boolean;
  imperativeVerbs?: readonly string[];
};

export type PullRequestTitleInput = {
  title: string;
};
