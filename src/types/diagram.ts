export type DiagramType = 'architecture' | 'er' | 'flow' | 'routing' | 'ui' | 'doc' | 'spec' | 'other';

export interface DiagramItem {
  id: string;      // Usually the full file path
  appId: string;   // The full path of the parent project
  title: string;
  type: DiagramType;
  description: string;
  mermaidCode: string; // Extracted mermaid code (can be empty if not found)
  codeLang?: string;   // Language tag used in markdown (e.g. mermaid, text, sh)
  updatedAt: string;

  // Added for enhanced workspace scanning
  filePath: string;
  relativePath: string;
  projectRoot: string;
  diagramRoot: string;
  sourceFolderType: string;
}
