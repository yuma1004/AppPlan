import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useAppPlanStore } from '../../store/useAppPlanStore';
import dayjs from 'dayjs';

const WorkspaceHeader: React.FC = () => {
  const { diagrams, selectedDiagramId } = useAppPlanStore();
  const diagram = diagrams.find(d => d.id === selectedDiagramId);

  if (!diagram) {
    return (
      <Box sx={{ height: 64, px: 2, display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', boxSizing: 'border-box' }}>
        <Typography variant="body1" color="text.secondary">Select a diagram to view details.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: 64, 
      px: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      borderBottom: 1, 
      borderColor: 'divider', 
      boxSizing: 'border-box',
      flexShrink: 0
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1 }}>
            {diagram.title}
          </Typography>
          <Chip 
            label={diagram.type.toUpperCase()} 
            size="small" 
            color="primary"
            variant="filled"
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
          Last modified: {dayjs(diagram.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
        </Typography>
      </Box>
      {diagram.description && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {diagram.description}
        </Typography>
      )}
    </Box>
  );
};

export default WorkspaceHeader;
