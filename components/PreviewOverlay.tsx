import React, { useRef, useState, useEffect } from 'react';
import { X, Maximize, ExternalLink } from 'lucide-react';
import { MediaItem } from '../types';

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
            // Fallback
            window.open(item.linkContent || "", "_blank");
        });
        setFullscreen(true);
    } else {
        document.exitFullscreen();
        setFullscreen(false);
    }
  };

  // Determine content type and source
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

  // Effect to handle blob URL cleanup
  useEffect(() => {
    return () => {
        if(blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);


  if (isExternal) {
      // For Gemini or direct external links that can't be embedded easily
      window.open(contentSrc, '_blank');
      onClose();
      return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" ref={containerRef}>
      {/* Header controls */}
      <div className={`flex items-center justify-between px-4 py-3 bg-neutral-900 text-white transition-opacity duration-300 ${fullscreen ? 'opacity-0 hover:opacity-100 absolute top-0 w-full z-10 bg-black/80' : ''}`}>
         <h3 className="font-bold text-lg truncate max-w-[60%]">{item.title}</h3>
         <div className="flex items-center gap-3">
            <button 
                onClick={toggleFullscreen}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold uppercase tracking-wider transition-colors"
            >
                <Maximize size={14} /> Fullscreen
            </button>
            <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
                <X size={18} />
            </button>
         </div>
      </div>

      {/* Floating exit button for fullscreen */}
      {fullscreen && (
          <button 
            onClick={() => { document.exitFullscreen(); setFullscreen(false); }}
            className="fixed top-5 right-5 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-red-600/90 text-white shadow-lg backdrop-blur hover:scale-110 transition-transform"
          >
              <X size={24} />
          </button>
      )}

      {/* Content Frame */}
      <div className="flex-grow bg-white relative w-full h-full">
         <iframe 
            src={isHtml ? blobUrl : contentSrc}
            className="w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title="Preview"
         />
      </div>
    </div>
  );
};
