declare const console: {
  error: (message?: unknown, ...optionalParams: unknown[]) => void;
};

declare const process: {
  env: Record<string, string | undefined>;
  exit: (code?: number) => never;
};
