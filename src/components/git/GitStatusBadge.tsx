import React from 'react';
import { Box } from '@mui/material';

interface Props {
  code: string;
}

const GitStatusBadge: React.FC<Props> = ({ code }) => {
  if (!code || code.trim().length === 0) return null;

  let color = '#999';
  const c = code.trim();
  
  if (c.includes('M')) color = '#e2c08d'; // modified: orange/yellow
  if (c.includes('A')) color = '#81b88b'; // added: green
  if (c.includes('D')) color = '#c74e39'; // deleted: red
  if (c.includes('?')) color = '#888888'; // untracked: grey
  if (c.includes('R')) color = '#b392f0'; // renamed: purple

  return (
    <Box sx={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minWidth: 18,
      height: 18, 
      borderRadius: '3px', 
      bgcolor: `${color}25`,
      color: color,
      fontSize: '10px',
      fontWeight: 'bold',
      fontFamily: 'monospace',
      ml: 1
    }} title={c}>
      {c}
    </Box>
  );
};

export default GitStatusBadge;
