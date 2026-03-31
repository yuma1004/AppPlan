export type GitFileStatusInfo = {
  path: string;
  code: string; // "M", "A", "D", "??" など
  label: "modified" | "added" | "deleted" | "untracked" | "renamed" | "unknown";
};

export type GitProjectStatus = {
  projectId: string;
  projectPath: string;
  isGitRepo: boolean;
  changedFiles: GitFileStatusInfo[];
  hasChanges: boolean;
};
