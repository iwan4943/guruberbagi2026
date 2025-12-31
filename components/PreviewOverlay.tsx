import React, { useRef, useState, useEffect } from 'react';
import { X, Maximize } from 'lucide-react';
import { MediaItem } from '../types';
import { COLORS } from '../constants';

interface PreviewOverlayProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({ item, onClose }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const getYoutubeId = (url: string) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    return (match && match[2].length === 11) ? match[2] : false;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(err => {
            console.error(err);
            window.open(item.linkContent || "", "_blank");
        });
        setFullscreen(true);
    } else {
        document.exitFullscreen();
        setFullscreen(false);
    }
  };

  let contentSrc = "";
  let isHtml = false;
  let isExternal = false;
  let blobUrl = "";

  if (item.htmlContent && item.htmlContent.length > 10) {
      isHtml = true;
      const blob = new Blob([item.htmlContent], { type: 'text/html' });
      blobUrl = URL.createObjectURL(blob);
  } else if (item.linkContent) {
      const link = item.linkContent;
      const ytId = getYoutubeId(link);
      
      if (link.includes('gemini.google.com') || link.includes('g.co')) {
          isExternal = true;
          contentSrc = link.replace('gemini.google.com/share', 'g.co/gemini/share');
      } else if (ytId) {
          contentSrc = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
      } else if (link.includes('drive.google.com')) {
          contentSrc = link.replace(/\/view.*/, '/preview').replace(/\/edit.*/, '/preview');
      } else {
          contentSrc = link;
      }
  }

  useEffect(() => {
    return () => {
        if(blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);


  if (isExternal) {
      window.open(contentSrc, '_blank');
      onClose();
      return null;
  }

  const styles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 50,
        backgroundColor: '#000',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#171717',
        color: 'white',
        transition: 'opacity 0.3s',
        ...(fullscreen ? { 
            position: 'absolute' as const, 
            top: 0, 
            width: '100%', 
            zIndex: 10, 
            backgroundColor: 'rgba(0,0,0,0.8)',
            opacity: 0 // Hover handle by CSS normally, but simpler here
        } : {})
    },
    title: {
        fontWeight: 'bold',
        fontSize: '1.125rem',
        maxWidth: '60%',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    btnFs: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 12px',
        borderRadius: '9999px',
        border: '1px solid rgba(255,255,255,0.2)',
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        cursor: 'pointer',
    },
    btnClose: {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        backgroundColor: COLORS.red500,
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        marginLeft: '12px',
    },
    frameContainer: {
        flexGrow: 1,
        backgroundColor: 'white',
        position: 'relative' as const,
        width: '100%',
        height: '100%',
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
    },
    floatingClose: {
        position: 'fixed' as const,
        top: '20px',
        right: '20px',
        zIndex: 20,
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        backgroundColor: 'rgba(239, 68, 68, 0.9)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
    }
  };

  return (
    <div style={styles.overlay} ref={containerRef}>
      <div style={styles.header}>
         <h3 style={styles.title}>{item.title}</h3>
         <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={toggleFullscreen} style={styles.btnFs}>
                <Maximize size={14} /> Fullscreen
            </button>
            <button onClick={onClose} style={styles.btnClose}>
                <X size={18} />
            </button>
         </div>
      </div>

      {fullscreen && (
          <button onClick={() => { document.exitFullscreen(); setFullscreen(false); }} style={styles.floatingClose}>
              <X size={24} />
          </button>
      )}

      <div style={styles.frameContainer}>
         <iframe 
            src={isHtml ? blobUrl : contentSrc}
            style={styles.iframe}
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Preview"
         />
      </div>
    </div>
  );
};