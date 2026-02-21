export type PrTitleValidatorOptions = {
  issuePrefix?: string;
  enforceLowercase?: boolean;
  imperativeVerbs?: readonly string[];
};

export type PrTitleInput = {
  title: string;
};
