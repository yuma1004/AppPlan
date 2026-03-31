import React from 'react';
import { Box, Typography, IconButton, Tooltip, List } from '@mui/material';
import { useAppPlanStore } from '../../store/useAppPlanStore';
import AppListItem from '../apps/AppListItem';
import AppsIcon from '@mui/icons-material/Apps';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

import AddIcon from '@mui/icons-material/Add';

const AppSidebar: React.FC = () => {
  const { apps, selectedAppId, selectApp, openProject, addProject, closeProject, gitStatuses, gitOnlyMode, toggleGitOnlyMode } = useAppPlanStore();

  const handleOpenWorkspace = async (replace: boolean) => {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select AppPlan Project Folder'
      });
      if (selected && typeof selected === 'string') {
        if (replace) {
          await openProject(selected, true);
        } else {
          await addProject(selected);
        }
      }
    } catch (e) {
      console.error("Failed to open dialog:", e);
    }
  };

  const displayedApps = gitOnlyMode 
    ? apps.filter(app => gitStatuses[app.id]?.hasChanges)
    : apps;

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        height: 64, 
        px: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AppsIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
            AppPlan
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Close all and open a new project" placement="bottom">
            <IconButton 
              color="primary" 
              onClick={() => handleOpenWorkspace(true)}
              size="small"
              sx={{ bgcolor: 'rgba(97, 218, 251, 0.08)', '&:hover': { bgcolor: 'rgba(97, 218, 251, 0.16)' } }}
            >
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add project to sidebar" placement="bottom">
            <IconButton 
              color="secondary" 
              onClick={() => handleOpenWorkspace(false)}
              size="small"
              sx={{ bgcolor: 'rgba(244, 143, 177, 0.08)', '&:hover': { bgcolor: 'rgba(244, 143, 177, 0.16)' } }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="overline" color="text.secondary">
          APPLICATIONS
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Reload Workspace">
            <IconButton 
              size="small" 
              onClick={() => useAppPlanStore.getState().reloadWorkspace()}
              sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={gitOnlyMode ? "Show all projects" : "Show changed only"}>
            <IconButton 
              size="small" 
              color={gitOnlyMode ? 'primary' : 'default'} 
              onClick={toggleGitOnlyMode}
              sx={{ opacity: gitOnlyMode ? 1 : 0.5 }}
            >
              {gitOnlyMode ? <FilterListIcon fontSize="small" /> : <FilterAltOffIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <List sx={{ flex: 1, overflowY: 'auto', px: 1 }}>
        {displayedApps.map(app => (
          <AppListItem
            key={app.id}
            app={app}
            selected={app.id === selectedAppId}
            onClick={() => selectApp(app.id)}
            onClose={() => closeProject(app.id)}
          />
        ))}
        {displayedApps.length === 0 && (
          <Box sx={{ mt: 4, px: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {gitOnlyMode ? "No changed projects" : "No project found"}
            </Typography>
            {!gitOnlyMode && (
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1, lineHeight: 1.4 }}>
                Selected directory must contain a <code>docs/</code> folder with your architecture diagrams.
              </Typography>
            )}
          </Box>
        )}
      </List>
    </Box>
  );
};

export default AppSidebar;
