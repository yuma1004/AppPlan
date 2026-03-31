import { create } from 'zustand';
import { AppItem } from '../types/app';
import { DiagramItem } from '../types/diagram';
import { readDir, readTextFile, writeTextFile, exists, remove, mkdir } from '@tauri-apps/plugin-fs';
import { parseMarkdownDiagram, generateMarkdownDiagram } from '../utils/markdownParser';
import { GitProjectStatus } from '../types/git';
import { getProjectGitStatus } from '../utils/git/parseGitStatus';

// Tauri API for joining paths if needed, but we can do simple string concat
// import { join } from '@tauri-apps/api/path';

interface AppPlanState {
  apps: AppItem[];
  diagrams: DiagramItem[];
  selectedAppId: string | null;
  selectedDiagramId: string | null;
  isLoaded: boolean;
  isReloading: boolean;
  
  workspaceError: string | null;
  
  // Multi-Project Management
  openProjectPaths: string[]; // List of currently open project root paths
  recentProjects: { name: string; rootPath: string }[];
  lastViewedDiagramIdPerApp: Record<string, string | null>;
  openProject: (path: string, replace?: boolean) => Promise<void>;
  addProject: (path: string) => Promise<void>;
  closeProject: (projectId: string) => void;

  // Actions
  selectApp: (appId: string) => void;
  selectDiagram: (diagramId: string) => void;
  updateDiagramCode: (code: string) => void;
  
  // Storage (Legacy / Wrapper)
  workspacePath: string | null; 
  loadWorkspace: (path: string) => Promise<void>;
  reloadWorkspace: () => Promise<void>;
  createSampleWorkspace: (parentPath: string) => Promise<void>;
  createDiagram: (appId: string, title: string, type: string) => Promise<void>;
  deleteDiagram: (diagramId: string) => Promise<void>;

  // Git features
  gitStatuses: Record<string, GitProjectStatus>;
  gitOnlyMode: boolean;
  loadGitStatus: (projectId: string, projectPath: string) => Promise<void>;
  loadAllGitStatuses: () => Promise<void>;
  toggleGitOnlyMode: () => void;

  // Layout Layout
  previewLayout: 'horizontal' | 'vertical';
  togglePreviewLayout: () => void;
}

// Basic path joiner utility
const joinPath = (...parts: string[]) => parts.join('/').replace(/\/+/g, '/');

const savedRecent = localStorage.getItem('appplan_recent_projects');
const initialRecent = savedRecent ? JSON.parse(savedRecent) : [];

const savedPaths = localStorage.getItem('appplan_open_projects');
let initialOpenPaths: string[] = savedPaths ? JSON.parse(savedPaths) : [];

const legacyWorkspace = localStorage.getItem('appplan_workspace');
if (initialOpenPaths.length === 0 && legacyWorkspace) {
  initialOpenPaths = [legacyWorkspace];
}

async function scanProject(appPath: string): Promise<{ app: AppItem | null; diagrams: DiagramItem[] }> {
  const pathParts = appPath.split(/[\\/]/);
  const appName = pathParts[pathParts.length - 1] || 'AppProject';

  const docsPath = joinPath(appPath, 'docs');
  const hasDocsOuter = await exists(docsPath);

  if (!hasDocsOuter) return { app: null, diagrams: [] };

  const appId = appPath;
  const app: AppItem = {
    id: appId,
    name: appName,
    description: `Project: ${appName}`,
    updatedAt: new Date().toISOString()
  };

  const diagrams: DiagramItem[] = [];

  const readDiagrams = async (dirPath: string, rootType: string) => {
    try {
      const dirEntries = await readDir(dirPath);
      for (const dEntry of dirEntries) {
        if (!dEntry.name || dEntry.name.startsWith('.')) continue;

        const fullPath = joinPath(dirPath, dEntry.name);
        
        if (dEntry.isDirectory) {
          const nextRootType = rootType === 'docs' ? dEntry.name : rootType;
          await readDiagrams(fullPath, nextRootType);
        } else if (dEntry.isFile && (dEntry.name.endsWith('.md') || dEntry.name.endsWith('.mmd'))) {
          try {
            const content = await readTextFile(fullPath);
            const parsed = parseMarkdownDiagram(content);
            
            let finalTitle = parsed.title;
            if (finalTitle === 'Untitled Diagram') {
               let baseName = dEntry.name.replace(/\.(md|mmd)$/i, '');
               baseName = baseName.replace(/^[0-9]+_/, '');
               finalTitle = baseName.split(/[-_]/)
                 .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                 .join(' ');
            }

            diagrams.push({
              id: fullPath,
              appId: appId,
              title: finalTitle,
              type: parsed.type as any,
              description: parsed.description || '',
              mermaidCode: parsed.mermaidCode,
              codeLang: parsed.codeLang || 'markdown',
              updatedAt: new Date().toISOString(),
              filePath: fullPath,
              relativePath: fullPath.replace(appPath, '').replace(/^[\\\/]/, ''),
              projectRoot: appPath,
              diagramRoot: joinPath(docsPath, rootType),
              sourceFolderType: rootType === 'docs' ? 'general' : rootType,
            });
          } catch (err) {
            console.warn("Skipping file due to read error", fullPath, err);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to read directory", dirPath, err);
    }
  };

  await readDiagrams(docsPath, 'docs');

  if (diagrams.length === 0) return { app: null, diagrams: [] };

  return { app, diagrams };
}

export const useAppPlanStore = create<AppPlanState>((set, get) => ({
  apps: [],
  diagrams: [],
  selectedAppId: null,
  selectedDiagramId: null,
  isLoaded: false,
  isReloading: false,
  
  workspaceError: null,
  
  openProjectPaths: initialOpenPaths,
  recentProjects: initialRecent,
  lastViewedDiagramIdPerApp: {},
  workspacePath: legacyWorkspace,
  previewLayout: 'horizontal',

  togglePreviewLayout: () => set((state) => ({
    previewLayout: state.previewLayout === 'horizontal' ? 'vertical' : 'horizontal'
  })),

  openProject: async (path: string, replace = true) => {
    if (replace) {
      set({ apps: [], diagrams: [], openProjectPaths: [], selectedAppId: null, selectedDiagramId: null });
    }
    await get().addProject(path);
  },

  addProject: async (path: string) => {
    const state = get();
    if (state.openProjectPaths.includes(path)) {
      get().selectApp(path);
      return;
    }

    const { app, diagrams } = await scanProject(path);
    if (!app) {
      set({ workspaceError: `No docs directory found in ${path}` });
      return;
    }

    const newPaths = [...state.openProjectPaths, path];
    localStorage.setItem('appplan_open_projects', JSON.stringify(newPaths));

    // Update recent projects
    const newRecent = [{ name: app.name, rootPath: path }, ...state.recentProjects.filter(p => p.rootPath !== path)].slice(0, 10);
    localStorage.setItem('appplan_recent_projects', JSON.stringify(newRecent));

    set((state) => {
      const newApps = [...state.apps, app];
      const newDiagrams = [...state.diagrams, ...diagrams];
      let selAppId = state.selectedAppId;
      if (!selAppId) {
        selAppId = app.id;
      }
      return {
        apps: newApps,
        diagrams: newDiagrams,
        openProjectPaths: newPaths,
        recentProjects: newRecent,
        selectedAppId: selAppId,
        isLoaded: true
      };
    });

    get().selectApp(app.id);
    await get().loadGitStatus(app.id, app.id);
  },

  closeProject: (projectId: string) => {
    set((state) => {
      const newPaths = state.openProjectPaths.filter(p => p !== projectId);
      localStorage.setItem('appplan_open_projects', JSON.stringify(newPaths));
      const newApps = state.apps.filter(a => a.id !== projectId);
      const newDiagrams = state.diagrams.filter(d => d.appId !== projectId);
      let selAppId = state.selectedAppId;
      if (selAppId === projectId) {
        selAppId = newApps.length > 0 ? newApps[newApps.length - 1].id : null;
      }
      return {
        openProjectPaths: newPaths,
        apps: newApps,
        diagrams: newDiagrams,
        selectedAppId: selAppId
      };
    });
    const selAppId = get().selectedAppId;
    if (selAppId) {
      get().selectApp(selAppId);
    }
  },

  selectApp: (appId: string) => {
    set((state) => {
      const lastViewed = state.lastViewedDiagramIdPerApp[appId];
      let firstDiagramId = lastViewed;
      if (!firstDiagramId) {
        const appDiagrams = state.diagrams.filter(d => d.appId === appId);
        firstDiagramId = appDiagrams.length > 0 ? appDiagrams[0].id : null;
      }
      return {
        selectedAppId: appId,
        selectedDiagramId: firstDiagramId
      };
    });
  },

  selectDiagram: (diagramId: string) => set((state) => ({ 
    selectedDiagramId: diagramId,
    lastViewedDiagramIdPerApp: { ...state.lastViewedDiagramIdPerApp, [state.selectedAppId || '']: diagramId }
  })),

  updateDiagramCode: (code: string) => {
    const state = get();
    if (!state.selectedDiagramId) return;
    
    const diagram = state.diagrams.find(d => d.id === state.selectedDiagramId);
    if (!diagram) return;

    const newUpdatedAt = new Date().toISOString();

    set((state) => {
      return {
        diagrams: state.diagrams.map(d => 
          d.id === state.selectedDiagramId ? { ...d, mermaidCode: code, updatedAt: newUpdatedAt } : d
        )
      };
    });

    const updatedDiagram = { ...diagram, mermaidCode: code, updatedAt: newUpdatedAt };
    
    if ((window as any)._appPlanSaveTimeout) {
       clearTimeout((window as any)._appPlanSaveTimeout);
    }
    
    (window as any)._appPlanSaveTimeout = setTimeout(async () => {
      try {
        const fileContent = generateMarkdownDiagram(updatedDiagram as any, newUpdatedAt);
        await writeTextFile(updatedDiagram.id, fileContent);
        get().loadGitStatus(diagram.appId, diagram.appId);
      } catch (e) {
        console.error("Failed to write markdown file:", e);
      }
    }, 500);
  },

  loadWorkspace: async (path: string) => {
    await get().openProject(path, true);
  },

  createSampleWorkspace: async (parentPath: string) => {
    const sampleDir = joinPath(parentPath, 'AppPlanSample');
    const architectureDir = joinPath(sampleDir, 'docs', 'appplan', 'architecture');
    try {
      await mkdir(architectureDir, { recursive: true });
      const fileContent = `---
title: System Architecture
type: architecture
description: AI-generated architecture
---

\`\`\`mermaid
graph TD
  A[User] --> B[AppPlan Client]
  B --> C[Workspace Storage]
  B --> D[Design Diagram]
\`\`\`
`;
      await writeTextFile(joinPath(architectureDir, 'architecture_diagram.md'), fileContent);
      await get().openProject(sampleDir, true);
    } catch(err: any) {
      console.error(err);
      set({ workspaceError: "Failed to create sample: " + err.toString() });
    }
  },

  reloadWorkspace: async () => {
    const { openProjectPaths } = get();
    if (!openProjectPaths || openProjectPaths.length === 0) {
      set({ apps: [], diagrams: [], isLoaded: true, workspaceError: null });
      return;
    }

    try {
      set({ isReloading: true, workspaceError: null });
      
      // Artificial delay for UX feedback as requested
      await new Promise(r => setTimeout(r, 800));

      const newApps: AppItem[] = [];
      const newDiagrams: DiagramItem[] = [];

      for (const path of openProjectPaths) {
        const { app, diagrams } = await scanProject(path);
        if (app) {
          newApps.push(app);
          newDiagrams.push(...diagrams);
        }
      }

      set((state) => {
        let selectedAppId = state.selectedAppId;
        if (!selectedAppId || !newApps.find(a => a.id === selectedAppId)) {
          selectedAppId = newApps.length > 0 ? newApps[0].id : null;
        }

        let selectedDiagramId = state.selectedDiagramId;
        const currentAppDiagrams = newDiagrams.filter(d => d.appId === selectedAppId);
        if (!selectedDiagramId || !currentAppDiagrams.find(d => d.id === selectedDiagramId)) {
          selectedDiagramId = currentAppDiagrams.length > 0 ? currentAppDiagrams[0].id : null;
        }

        return {
          apps: newApps,
          diagrams: newDiagrams,
          selectedAppId,
          selectedDiagramId,
          isLoaded: true,
          isReloading: false
        };
      });

      get().loadAllGitStatuses();

    } catch (e) {
      console.error("Failed to reload workspace:", e);
      set({ apps: [], diagrams: [], isLoaded: true, isReloading: false });
    }
  },

  createDiagram: async (appId: string, title: string, type: string) => {
    const { workspacePath, reloadWorkspace, diagrams } = get();
    if (!workspacePath) return;

    // Use timestamp to avoid collision
    const fileName = `${type}_${Date.now()}.md`;
    
    // Find an existing root from this app, default to docs/appplan
    const existingRoot = diagrams.find(d => d.appId === appId)?.diagramRoot;
    const saveRoot = existingRoot || joinPath(appId, 'docs', 'appplan');
    const newFilePath = joinPath(saveRoot, fileName);

    const now = new Date().toISOString();
    const newDiagram = {
      title,
      type: type as any,
      description: 'New Diagram',
      mermaidCode: 'graph TD\n  A-->B;',
      tags: [],
      updatedAt: now
    };

    const fileContent = generateMarkdownDiagram(newDiagram, now);

    try {
      await mkdir(saveRoot, { recursive: true });
      await writeTextFile(newFilePath, fileContent);
      await reloadWorkspace();
      
      // Select the newly created file
      set({ selectedDiagramId: newFilePath });
      await get().loadGitStatus(appId, appId);
    } catch (e) {
      console.error("Failed to create diagram:", e);
    }
  },

  deleteDiagram: async (diagramId: string) => {
    try {
      const { selectedAppId } = get();
      await remove(diagramId);
      await get().reloadWorkspace();
      if (selectedAppId) {
        await get().loadGitStatus(selectedAppId, selectedAppId);
      }
    } catch (e) {
      console.error("Failed to delete diagram:", e);
    }
  },

  // Git logic
  gitStatuses: {},
  gitOnlyMode: false,

  loadGitStatus: async (projectId: string, projectPath: string) => {
    const status = await getProjectGitStatus(projectId, projectPath);
    set(state => ({
      gitStatuses: {
        ...state.gitStatuses,
        [projectId]: status
      }
    }));
  },

  loadAllGitStatuses: async () => {
    const { apps } = get();
    for (const app of apps) {
      await get().loadGitStatus(app.id, app.id); // appId is absolute path
    }
  },

  toggleGitOnlyMode: () => {
    set(state => ({ gitOnlyMode: !state.gitOnlyMode }));
  }
}));
