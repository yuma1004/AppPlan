import { DiagramItem } from '../../types/diagram';
import { GitProjectStatus, GitFileStatusInfo } from '../../types/git';

export const getGitStatusForDiagram = (
  diagram: DiagramItem,
  projectStatus?: GitProjectStatus
): GitFileStatusInfo | null => {
  if (!projectStatus || !projectStatus.hasChanges) return null;

  // diagram.id is an absolute path.
  // git file.path is relative to the project root.
  // We can normalize path separators and check if diagram.id ends with file.path
  
  const diagramPathNormalized = diagram.id.replace(/\\/g, '/');

  for (const file of projectStatus.changedFiles) {
    const filePathNormalized = file.path.replace(/\\/g, '/');
    if (diagramPathNormalized.endsWith(filePathNormalized)) {
      return file;
    }
  }

  return null;
};
