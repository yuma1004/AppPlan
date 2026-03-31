import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Box, Typography, IconButton, Tooltip, Paper } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import TranslateIcon from '@mui/icons-material/Translate';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { useAppPlanStore } from '../../store/useAppPlanStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Initialize mermaid with dark theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
});

const MermaidPreview: React.FC = () => {
  const { diagrams, selectedDiagramId, previewLayout, togglePreviewLayout } = useAppPlanStore();
  const diagram = diagrams.find(d => d.id === selectedDiagramId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // New features state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom on document change
  useEffect(() => {
    setZoomLevel(1);
  }, [selectedDiagramId]);

  // Simple hardcoded dictionary for Japanese Translation
  const ER_DICTIONARY: Record<string, string> = {
    'User': 'ユーザー',
    'Post': '投稿',
    'Order': '注文',
    'Customer': '顧客',
    'Client': 'クライアント',
    'Product': '製品',
    'Store': '店舗',
    'Frontend': 'フロントエンド',
    'Backend': 'バックエンド',
    'State': '状態',
    'Logic': 'ロジック',
    'System': 'システム',
    'Settings': '設定',
    'History': '履歴',
    'Profile': 'プロフィール',
    'Account': 'アカウント'
  };

  const getTranslatedCode = (code: string) => {
    // Only target strings inside [], (), {}, "" to prevent breaking mermaid keywords/structure
    let newCode = code;
    const labelRegex = /\[(.*?)\]|\"(.*?)\"|\((.*?)\)|\{(.*?)\}/g;
    
    newCode = newCode.replace(labelRegex, (match, p1, p2, p3, p4) => {
      const textToTranslate = p1 || p2 || p3 || p4;
      if (!textToTranslate) return match;
      
      let translated = textToTranslate;
      Object.entries(ER_DICTIONARY).forEach(([en, ja]) => {
        // Case-insensitive word boundary replace
        translated = translated.replace(new RegExp(`\\b${en}\\b`, 'gi'), ja);
      });
      // Carefully inject the translated text back into its wrapping braces
      return match.replace(textToTranslate, translated);
    });
    return newCode;
  };

  const handleScreenshot = async () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) return;

    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { writeFile } = await import('@tauri-apps/plugin-fs');

      const clone = svgElement.cloneNode(true) as SVGSVGElement;
      const svgData = new XMLSerializer().serializeToString(clone);
      const canvas = document.createElement('canvas');
      
      let w = 800, h = 600;
      const viewBox = clone.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(' ');
        if (parts.length === 4) {
          w = parseFloat(parts[2]);
          h = parseFloat(parts[3]);
        }
      } else {
        w = parseInt(clone.getAttribute('width') || '800', 10);
        h = parseInt(clone.getAttribute('height') || '600', 10);
      }
      
      const scale = 2;
      canvas.width = w * scale;
      canvas.height = h * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = async () => {
        ctx.fillStyle = '#222'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const base64Data = pngUrl.replace(/^data:image\/png;base64,/, "");

        const filePath = await save({
          title: 'Save Diagram',
          defaultPath: `${diagram?.title.replace(/\s+/g, '_')}_${Date.now()}.png`,
          filters: [{ name: 'Image', extensions: ['png'] }]
        });

        if (filePath) {
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          await writeFile(filePath, bytes);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (e) {
      console.error("Screenshot or Save failed:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    if (!diagram || !diagram.mermaidCode || !containerRef.current) {
      if (containerRef.current && diagram?.mermaidCode === '') {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    const renderDiagram = async () => {
      try {
        setError(null);
        const id = `mermaid-${Date.now()}`;
        const sourceCode = isTranslated ? getTranslatedCode(diagram.mermaidCode) : diagram.mermaidCode;
        const { svg } = await mermaid.render(id, sourceCode);
        
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError(err.message || String(err));
        }
      }
    };

    const timeoutId = setTimeout(() => {
      renderDiagram();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [diagram?.mermaidCode, isTranslated]);

  // Hook for Fullscreen Escape key 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Hook for Ctrl + Scroll zoom
  useEffect(() => {
    const wrapper = containerRef.current?.parentElement;
    if (!wrapper) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setZoomLevel(prev => {
          const delta = e.deltaY > 0 ? -0.1 : 0.1;
          return Math.max(0.1, Math.min(prev + delta, 5));
        });
      }
    };

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    return () => wrapper.removeEventListener('wheel', handleWheel);
  }, [selectedDiagramId, isFullscreen]); // Re-attach if wrapper unmounts/remounts


  const renderToolbarButtons = () => {
    const isMermaid = diagram?.codeLang === 'mermaid';
    return (
      <>
        {!isFullscreen && (
          <Tooltip title={previewLayout === 'horizontal' ? "Split Bottom" : "Split Right"}>
            <IconButton size="small" onClick={togglePreviewLayout} sx={{ color: 'text.primary' }}>
              {previewLayout === 'horizontal' ? <ViewStreamIcon fontSize="small" /> : <ViewColumnIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
        {isMermaid && (
          <Tooltip title={isTranslated ? "Show English" : "Translate ER Entities to JP"}>
            <IconButton size={isFullscreen ? "medium" : "small"} onClick={() => setIsTranslated(!isTranslated)} sx={{ color: isTranslated ? 'primary.main' : (isFullscreen ? '#ffffff !important' : 'text.primary') }}>
              <TranslateIcon fontSize={isFullscreen ? "medium" : "small"} />
            </IconButton>
          </Tooltip>
        )}
        {isMermaid && (
          <Tooltip title="Capture Full PNG">
            <IconButton size={isFullscreen ? "medium" : "small"} onClick={handleScreenshot} sx={{ color: isFullscreen ? '#ffffff !important' : 'text.primary' }}>
              <PhotoCameraIcon fontSize={isFullscreen ? "medium" : "small"} />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}>
          <IconButton size={isFullscreen ? "medium" : "small"} onClick={() => setIsFullscreen(!isFullscreen)} sx={{ color: isFullscreen ? '#ffffff !important' : 'text.primary' }}>
            {isFullscreen ? <FullscreenExitIcon fontSize={isFullscreen ? "medium" : "small"} /> : <FullscreenIcon fontSize={isFullscreen ? "medium" : "small"} />}
          </IconButton>
        </Tooltip>
      </>
    );
  };

  const renderFloatingToolbar = () => {
    if (!isFullscreen || error) return null;
    return (
      <Paper 
        elevation={4} 
        sx={{ 
          position: 'fixed', 
          top: 24, 
          right: 24, 
          zIndex: 99999, 
          display: 'flex', 
          gap: 1, 
          p: 1,
          bgcolor: 'rgba(30,30,30,0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          '& svg': {
            color: '#fff !important',
            opacity: 1
          }
        }}
      >
        {renderToolbarButtons()}
      </Paper>
    );
  };

  const renderHeader = () => {
    if (isFullscreen) return null;
    return (
      <Box sx={{ 
        height: 64, 
        px: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        bgcolor: 'background.paper', 
        borderBottom: 1, 
        borderColor: 'divider',
        boxSizing: 'border-box',
        flexShrink: 0 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VisibilityIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Preview</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {diagram && !error && renderToolbarButtons()}
        </Box>
      </Box>
    );
  };

  if (!diagram) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {renderHeader()}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No diagram selected.</Typography>
        </Box>
      </Box>
    );
  }

  if (diagram.codeLang && diagram.codeLang !== 'mermaid') {
    const isMarkdown = diagram.codeLang === 'markdown';

    // Same container rules for fullscreen markdown
    const mdContainerStyles = isFullscreen ? {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999,
      bgcolor: 'background.default',
      p: { xs: 2, md: 8 },
      overflowY: 'auto' as const,
    } : {
      flex: 1, 
      overflow: 'auto', 
      p: { xs: 2, md: 4 },
    };

    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default', position: 'relative' }}>
        {renderHeader()}
        {renderFloatingToolbar()}
        <Box sx={mdContainerStyles}>
          {isMarkdown ? (
            <Box sx={{ 
              color: 'text.primary',
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              lineHeight: 1.7,
              maxWidth: 800,
              margin: '0 auto',
              '& h1, & h2, & h3': { color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 1, mb: 2, mt: 4 },
              '& h1': { fontSize: '2rem', mt: 0 },
              '& p': { mb: 2, color: 'text.secondary' },
              '& ul, & ol': { mb: 2, color: 'text.secondary', pl: 3 },
              '& li': { mb: 0.5 },
              '& code': { bgcolor: 'rgba(255,255,255,0.1)', p: '2px 6px', borderRadius: 1, color: '#ffb86c', fontSize: '0.9em' },
              '& pre': { bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2, overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' },
              '& pre code': { bgcolor: 'transparent', color: 'inherit', p: 0 },
              '& a': { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } },
              '& blockquote': { borderLeft: '4px solid primary.main', m: 0, pl: 2, color: 'text.secondary', fontStyle: 'italic' },
              '& table': { width: '100%', borderCollapse: 'collapse', mb: 3 },
              '& th, & td': { p: 1.5, borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' },
              '& th': { color: '#fff', fontWeight: 600, bgcolor: 'rgba(255,255,255,0.02)' }
            }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {diagram.mermaidCode}
              </ReactMarkdown>
            </Box>
          ) : (
            <Box>
              <Typography variant="overline" color="text.disabled" sx={{ mb: 2, display: 'block' }}>
                Preformatted Text ({diagram.codeLang})
              </Typography>
              <Typography component="pre" variant="body2" sx={{ fontFamily: 'monospace', m: 0, whiteSpace: 'pre-wrap', color: 'text.secondary', bgcolor: 'rgba(0,0,0,0.2)', p: 3, borderRadius: 2 }}>
                {diagram.mermaidCode}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  const containerStyles = isFullscreen ? {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    bgcolor: 'background.default',
    p: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  } : {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
    p: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default', position: 'relative' }}>
      {renderHeader()}
      
      {error && (
        <Box sx={{ p: 2, m: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'error.main', borderRadius: 1 }}>
          <Typography variant="overline" color="error">Diagram Parsing Error</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', mt: 1 }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* Main Container wrapping containerRef to preserve SVG */}
      <Box sx={containerStyles as any}>
        {renderFloatingToolbar()}
        <Box
          ref={containerRef}
          sx={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            zoom: zoomLevel, // standard WebKit zoom allows perfect bounding box adjustments
            '& svg': isFullscreen ? {
              width: 'auto',
              height: 'auto',
              maxHeight: '90vh',
              maxWidth: '90vw'
            } : {
              maxWidth: '100%',
              height: 'auto',
              minHeight: '200px',
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default MermaidPreview;
