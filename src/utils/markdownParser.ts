import yaml from 'yaml';
import { DiagramItem } from '../types/diagram';

export interface ParsedDiagram extends Omit<DiagramItem, 'id' | 'appId' | 'filePath' | 'relativePath' | 'projectRoot' | 'diagramRoot' | 'sourceFolderType'> {
  tags?: string[];
}

export const parseMarkdownDiagram = (fileContent: string): ParsedDiagram => {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = fileContent.match(frontmatterRegex);

  let title = 'Untitled Diagram';
  let type: string | undefined = undefined;
  let description = '';
  let tags: string[] = [];

  if (match && match[1]) {
    try {
      const frontmatter = yaml.parse(match[1]);
      if (frontmatter.title) title = frontmatter.title;
      if (frontmatter.type) type = frontmatter.type;
      if (frontmatter.description) description = frontmatter.description;
      if (frontmatter.tags && Array.isArray(frontmatter.tags)) tags = frontmatter.tags;
    } catch (e) {
      console.warn('Failed to parse frontmatter:', e);
    }
  }

  // Extract code block using indexOf to prevent ReDoS on missing closing tags
  let mermaidCode = '';
  let codeLang = 'mermaid';

  const startIdx = fileContent.indexOf('```');
  const diagramTypes = ['flow', 'architecture', 'er', 'routing', 'ui', 'sequence', 'diagram', 'uml'];
  const hasMermaid = fileContent.includes('```mermaid');
  
  // Decide whether it's primarily a diagram or a text doc
  const isDiagramType = (type && diagramTypes.includes(type)) || (!type && hasMermaid);

  if (isDiagramType && startIdx !== -1) {
    const nextNewline = fileContent.indexOf('\n', startIdx);
    if (nextNewline !== -1) {
      const langLine = fileContent.substring(startIdx + 3, nextNewline).replace(/\r/g, '').trim();
      codeLang = langLine || 'mermaid';
      
      const endIdx = fileContent.indexOf('```', nextNewline + 1);
      if (endIdx !== -1) {
        mermaidCode = fileContent.substring(nextNewline + 1, endIdx).trim();
      } else {
        mermaidCode = fileContent.substring(nextNewline + 1).trim();
      }
    }
  } else {
    // Treat as a full Markdown document
    const bodyStartIndex = match ? match[0].length : 0;
    mermaidCode = fileContent.substring(bodyStartIndex).trim();
    codeLang = 'markdown';
    if (!type) {
      type = 'doc';
    }
  }

  // Fallback if type is still empty for some reason
  if (!type) {
    type = 'flow';
  }

  return {
    title,
    type: type as any,
    description,
    tags,
    mermaidCode,
    codeLang,
    updatedAt: new Date().toISOString()
  };
};

export const generateMarkdownDiagram = (diagram: ParsedDiagram, updatedAt: string): string => {
  const frontmatterObj: any = {
    title: diagram.title,
    type: diagram.type,
    updatedAt,
  };
  
  if (diagram.description) frontmatterObj.description = diagram.description;
  if (diagram.tags && diagram.tags.length > 0) frontmatterObj.tags = diagram.tags;

  const frontmatterStr = yaml.stringify(frontmatterObj);
  const lang = diagram.codeLang || 'mermaid';

  if (lang === 'markdown') {
    return `---
${frontmatterStr.trim()}
---

${diagram.mermaidCode}
`;
  }

  return `---
${frontmatterStr.trim()}
---

\`\`\`${lang}
${diagram.mermaidCode}
\`\`\`
`;
};
