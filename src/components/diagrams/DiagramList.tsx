import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { useAppPlanStore } from '../../store/useAppPlanStore';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const DiagramList: React.FC = () => {
  const { diagrams, selectedAppId, selectedDiagramId, selectDiagram } = useAppPlanStore();

  const currentAppDiagrams = diagrams.filter(d => d.appId === selectedAppId);

  if (currentAppDiagrams.length === 0) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">No diagrams found for this app.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto', borderBottom: 1, borderColor: 'divider' }}>
      {currentAppDiagrams.map(diagram => (
        <Paper
          key={diagram.id}
          elevation={diagram.id === selectedDiagramId ? 4 : 1}
          sx={{
            px: 2,
            py: 1,
            cursor: 'pointer',
            minWidth: 150,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: diagram.id === selectedDiagramId ? 'rgba(97, 218, 251, 0.1)' : 'background.paper',
            border: '1px solid',
            borderColor: diagram.id === selectedDiagramId ? 'primary.main' : 'transparent',
            '&:hover': {
              borderColor: 'primary.main',
            }
          }}
          onClick={() => selectDiagram(diagram.id)}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: diagram.id === selectedDiagramId ? 600 : 400 }}>
              {diagram.title}
            </Typography>
            <AccountTreeIcon fontSize="small" color="primary" />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Chip label={diagram.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default DiagramList;
