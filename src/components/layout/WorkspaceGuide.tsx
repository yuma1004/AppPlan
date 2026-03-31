import React from 'react';
import { Box, Typography, Button, Paper, Alert, List, ListItem, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAppPlanStore } from '../../store/useAppPlanStore';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

const WorkspaceGuide: React.FC = () => {
  const { openProject, workspaceError, createSampleWorkspace, recentProjects } = useAppPlanStore();

  const handleSelectWorkspace = async () => {
    try {
      const selectedPath = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select Project Folder',
      });
      if (selectedPath && !Array.isArray(selectedPath)) {
        await openProject(selectedPath, true);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleGenerateSample = async () => {
    try {
      const selectedParent = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select a folder to create Sample Workspace inside',
      });
      if (selectedParent && !Array.isArray(selectedParent)) {
        await createSampleWorkspace(selectedParent);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4, bgcolor: 'background.default', overflowY: 'auto' }}>
      <Paper elevation={3} sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 600, width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 2 }}>
          AppPlan
        </Typography>
        <Typography variant="subtitle1" color="text.primary" sx={{ mb: 2, textAlign: 'center' }}>
          Manage your architecture and design diagrams centrally.
        </Typography>
        
        <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: 2, mb: 4, width: '100%' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            💡 <strong>How to start:</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Select the <strong>Root Directory</strong> of your project.<br/>
            (e.g., <code>C:\Users\username\Projects\MyApp</code>)
            <br/><br/>
            AppPlan will automatically discover architecture and design files inside your project's <code>docs/</code> folder.
          </Typography>
        </Box>

        {workspaceError && (
          <Alert severity="error" sx={{ mb: 4, width: '100%' }}>
            {workspaceError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<FolderOpenIcon />}
            onClick={handleSelectWorkspace}
            sx={{ py: 2, fontSize: '1.1rem', borderRadius: 2, textTransform: 'none' }}
          >
            Select Project Root Directory
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 'bold' }}>OR TRY IT OUT</Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Button
            variant="outlined"
            color="secondary"
            size="large"
            startIcon={<AutoAwesomeIcon />}
            onClick={handleGenerateSample}
            sx={{ py: 2, fontSize: '1.1rem', borderRadius: 2, textTransform: 'none' }}
          >
            Generate Sample Project
          </Button>
        </Box>
        
        {recentProjects && recentProjects.length > 0 && (
          <Box sx={{ width: '100%', mt: 6 }}>
            <Typography variant="overline" color="text.secondary">
              Recent Projects
            </Typography>
            <List disablePadding>
              {recentProjects.map((p, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemButton onClick={() => openProject(p.rootPath, true)} sx={{ borderRadius: 1, mb: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <HistoryIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={p.name} 
                      secondary={p.rootPath}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default WorkspaceGuide;
