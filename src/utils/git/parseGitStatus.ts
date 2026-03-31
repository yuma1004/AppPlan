import { Command } from '@tauri-apps/plugin-shell';
import { GitFileStatusInfo, GitProjectStatus } from '../../types/git';

export const parseGitStatusOutput = (output: string): GitFileStatusInfo[] => {
  const lines = output.split('\n');
  const files: GitFileStatusInfo[] = [];

  for (const line of lines) {
    if (!line || line.trim().length === 0) continue;

    // git status --porcelain outputs "XY PATH"
    // XY is the status code, length 2, then space, then path
    const code = line.substring(0, 2);
    let path = line.substring(3).trim();

    // If renamed, it might be "XY old_path -> new_path", we just keep the whole string or parse it 
    // for simplicity, we'll keep the new_path or the whole raw string.
    if (path.includes(' -> ')) {
      path = path.split(' -> ')[1].trim();
    }
    
    // Remove wrapping quotes if path contains spaces and is quoted
    if (path.startsWith('"') && path.endsWith('"')) {
      path = path.slice(1, -1);
    }

    let label: GitFileStatusInfo['label'] = 'unknown';
    if (code.includes('?')) label = 'untracked';
    else if (code.includes('A')) label = 'added';
    else if (code.includes('D')) label = 'deleted';
    else if (code.includes('R')) label = 'renamed';
    else if (code.includes('M')) label = 'modified';

    files.push({ path, code, label });
  }

  return files;
};

export const getProjectGitStatus = async (projectId: string, projectPath: string): Promise<GitProjectStatus> => {
  try {
    // 1. Check if git repository
    // Use git -C projectPath rev-parse --is-inside-work-tree
    const isGitCmd = Command.create('git', ['-C', projectPath, 'rev-parse', '--is-inside-work-tree']);
    const isGitResult = await isGitCmd.execute();
    
    if (isGitResult.code !== 0) {
      return {
        projectId,
        projectPath,
        isGitRepo: false,
        changedFiles: [],
        hasChanges: false
      };
    }

    // 2. Get status for docs/appplan filtering? Or global?
    // User wants to see UI changes. We'll get all and filter in frontend if needed.
    const statusCmd = Command.create('git', ['-C', projectPath, 'status', '--porcelain']);
    const statusResult = await statusCmd.execute();

    if (statusResult.code !== 0) {
      throw new Error(`Git status failed: ${statusResult.stderr}`);
    }

    const changedFiles = parseGitStatusOutput(statusResult.stdout);
    
    return {
      projectId,
      projectPath,
      isGitRepo: true,
      changedFiles,
      hasChanges: changedFiles.length > 0
    };

  } catch (err) {
    console.error(`Failed to get git status for ${projectPath}:`, err);
    return {
      projectId,
      projectPath,
      isGitRepo: false,
      changedFiles: [],
      hasChanges: false
    };
  }
};
