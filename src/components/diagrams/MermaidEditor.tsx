import React from 'react';
import Editor from '@monaco-editor/react';
import { Box } from '@mui/material';
import { useAppPlanStore } from '../../store/useAppPlanStore';

const MermaidEditor: React.FC = () => {
  const { diagrams, selectedDiagramId, updateDiagramCode } = useAppPlanStore();
  const diagram = diagrams.find(d => d.id === selectedDiagramId);

  if (!diagram) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box color="text.secondary">No editor available without selection.</Box>
      </Box>
    );
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateDiagramCode(value);
    }
  };

  return (
    <Box sx={{ flex: 1, overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage="markdown"
        theme="vs-dark"
        value={diagram.mermaidCode}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16 }
        }}
      />
    </Box>
  );
};

export default MermaidEditor;
