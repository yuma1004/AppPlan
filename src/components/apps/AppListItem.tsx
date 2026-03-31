import React from 'react';
import { ListItem, ListItemButton, ListItemText, Typography, Box, Collapse, List, IconButton, Tooltip } from '@mui/material';
import { AppItem } from '../../types/app';

import { useAppPlanStore } from '../../store/useAppPlanStore';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import GitHubIcon from '@mui/icons-material/GitHub';
import { getGitStatusForDiagram } from '../../utils/git/filterDiagramGitStatus';
import GitStatusBadge from '../git/GitStatusBadge';

import CloseIcon from '@mui/icons-material/Close';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useState } from 'react';

interface AppListItemProps {
  app: AppItem;
  selected: boolean;
  onClick: () => void;
  onClose: () => void;
}

const AppListItem: React.FC<AppListItemProps> = ({ app, selected, onClick, onClose }) => {
  const { diagrams, selectedDiagramId, selectDiagram, createDiagram, deleteDiagram, gitStatuses } = useAppPlanStore();
  const appDiagrams = diagrams.filter(d => d.appId === app.id);
  const gitStatus = gitStatuses[app.id];
  const changedDiagramCount = gitStatus?.changedFiles.length || 0;

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleCreateDiagram = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = prompt("Enter new diagram name:", "New Diagram");
    if (title) {
      createDiagram(app.id, title, 'flow');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, diagramId: string) => {
    e.stopPropagation();
    setDeleteTargetId(diagramId);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteTargetId) {
      deleteDiagram(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTargetId(null);
  };

  const activeDeleteTarget = diagrams.find(d => d.id === deleteTargetId);


  const handleCloseProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <Box>
      <ListItem 
        disablePadding 
        secondaryAction={
          <Box sx={{ display: 'flex' }}>
            {selected && (
              <Tooltip title="New Diagram">
                <IconButton edge="end" size="small" onClick={handleCreateDiagram} sx={{ mr: 0.5 }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Close Project">
              <IconButton edge="end" size="small" onClick={handleCloseProject}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      >
        <ListItemButton onClick={onClick} selected={selected}>
          <ListItemText
            disableTypography
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: selected ? 600 : 400, color: 'text.primary' }}>
                  {app.name}
                </Typography>
                {gitStatus?.isGitRepo && (
                  <Tooltip title={`${changedDiagramCount} changes`}>
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, color: changedDiagramCount > 0 ? 'text.secondary' : 'text.disabled' }}>
                      <GitHubIcon sx={{ fontSize: 13, mr: 0.5 }} />
                      {changedDiagramCount > 0 && <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 'bold' }}>{changedDiagramCount}</Typography>}
                    </Box>
                  </Tooltip>
                )}
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>
      <Collapse in={selected} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {appDiagrams.length === 0 && (
             <ListItem sx={{ pl: 4, py: 1 }}>
               <Typography variant="caption" color="text.secondary">No files</Typography>
             </ListItem>
          )}
          {Object.entries(
            appDiagrams.reduce((acc, diagram) => {
              const folder = diagram.sourceFolderType || 'appplan';
              if (!acc[folder]) acc[folder] = [];
              acc[folder].push(diagram);
              return acc;
            }, {} as Record<string, typeof appDiagrams>)
          ).map(([folderName, folderDiagrams]) => (
            <Box key={folderName} sx={{ mb: 1 }}>
              <Typography variant="overline" color="text.disabled" sx={{ pl: 4, display: 'block', mt: 1, mb: 0.5, lineHeight: 1 }}>
                {folderName.toUpperCase()}
              </Typography>
              <List component="div" disablePadding>
                {folderDiagrams.map(diagram => {
                  const fileStatus = getGitStatusForDiagram(diagram, gitStatus);
                  return (
                    <ListItem 
                      key={diagram.id} 
                      disablePadding
                      secondaryAction={
                        <IconButton edge="end" size="small" onClick={(e) => handleDeleteClick(e, diagram.id)}>
                          <DeleteIcon fontSize="small" sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: 'error.main' } }} />
                        </IconButton>
                      }
                    >
                      <ListItemButton 
                        sx={{ pl: 5, py: 0.5 }} 
                        selected={selectedDiagramId === diagram.id}
                        onClick={() => selectDiagram(diagram.id)}
                      >
                        <DescriptionIcon sx={{ fontSize: 16, mr: 1, opacity: selectedDiagramId === diagram.id ? 1 : 0.7 }} />
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: selectedDiagramId === diagram.id ? 'primary.main' : 'text.primary',
                                  flex: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {diagram.title}
                              </Typography>
                              {fileStatus && <GitStatusBadge code={fileStatus.code} />}
                            </Box>
                          } 
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </List>
      </Collapse>

      <Dialog
        open={Boolean(deleteTargetId)}
        onClose={cancelDelete}
        PaperProps={{
          sx: { bgcolor: 'background.paper', backgroundImage: 'none', border: '1px solid', borderColor: 'divider' }
        }}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{activeDeleteTarget?.title}</strong>? <br/>
            This action cannot be undone and will permanently remove the file from your workspace.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={cancelDelete} color="inherit">Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppListItem;
