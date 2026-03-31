import React from 'react';
import { Box } from '@mui/material';
import MermaidPreview from '../diagrams/MermaidPreview';

const PreviewPanel: React.FC = () => {
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      borderLeft: 1,
      borderColor: 'divider',
    }}>
      <MermaidPreview />
    </Box>
  );
};

export default PreviewPanel;
