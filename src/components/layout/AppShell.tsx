import React, { useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, CircularProgress, Backdrop, Typography } from '@mui/material';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import darkTheme from '../../theme/theme';
import AppSidebar from './AppSidebar';
import WorkspaceHeader from './WorkspaceHeader';
import MermaidEditor from '../diagrams/MermaidEditor';
import PreviewPanel from './PreviewPanel';
import WorkspaceGuide from './WorkspaceGuide';
import { useAppPlanStore } from '../../store/useAppPlanStore';

const AppShell: React.FC = () => {
  const { isLoaded, isReloading, workspacePath, reloadWorkspace, previewLayout } = useAppPlanStore();

  useEffect(() => {
    reloadWorkspace();
  }, [reloadWorkspace]);

  if (!isLoaded) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!workspacePath) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <WorkspaceGuide />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', width: '100vw', display: 'flex', overflow: 'hidden' }}>
        <PanelGroup orientation="horizontal" style={{ width: '100%', height: '100%' }}>
          {/* Left Sidebar: Apps List */}
          <Panel defaultSize="20%" minSize="15%" maxSize="30%">
            <AppSidebar />
          </Panel>
          
          <PanelResizeHandle>
            <Box sx={{ 
              width: { xs: '8px', sm: '4px' }, 
              height: '100%', 
              bgcolor: 'divider',
              '&:hover': { bgcolor: 'primary.main' },
              cursor: 'col-resize',
              transition: 'background-color 0.2s'
            }} />
          </PanelResizeHandle>

          {/* Main Working Area (Editor and Preview Split) */}
          <Panel defaultSize="80%" minSize="50%">
            <PanelGroup orientation={previewLayout} style={{ width: '100%', height: '100%' }}>
              
              {/* Editor Workspace */}
              <Panel defaultSize="50%" minSize="20%">
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  bgcolor: 'background.default'
                }}>
                  <Box sx={{ bgcolor: 'background.paper' }}>
                    <WorkspaceHeader />
                  </Box>
                  <MermaidEditor />
                </Box>
              </Panel>

              <PanelResizeHandle>
                {previewLayout === 'horizontal' ? (
                  <Box sx={{ 
                    width: { xs: '8px', sm: '4px' }, 
                    height: '100%', 
                    bgcolor: 'divider',
                    '&:hover': { bgcolor: 'primary.main' },
                    cursor: 'col-resize',
                    transition: 'background-color 0.2s'
                  }} />
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: { xs: '8px', sm: '4px' }, 
                    bgcolor: 'divider',
                    '&:hover': { bgcolor: 'primary.main' },
                    cursor: 'row-resize',
                    transition: 'background-color 0.2s'
                  }} />
                )}
              </PanelResizeHandle>

              {/* Preview Panel */}
              <Panel defaultSize="50%" minSize="20%">
                <PreviewPanel />
              </Panel>

            </PanelGroup>
          </Panel>
        </PanelGroup>

        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 9999, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'rgba(30,30,30,0.7)', backdropFilter: 'blur(2px)' }}
          open={isReloading}
        >
          <CircularProgress color="primary" size={50} />
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2 }}>
            Syncing Workspace...
          </Typography>
        </Backdrop>
      </Box>
    </ThemeProvider>
  );
};

export default AppShell;
