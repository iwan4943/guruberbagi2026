import React from 'react';
import { 
  Video, BookOpen, Gamepad2, Timer, BookMarked, 
  Code, Play, FileText
} from 'lucide-react';

interface ThumbnailProps {
  type: string;
  link?: string;
}

const getYoutubeId = (url: string) => {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return (match && match[2].length === 11) ? match[2] : false;
};

export const Thumbnail: React.FC<ThumbnailProps> = ({ type, link }) => {
  const t = (type || "").toUpperCase();
  const ytId = link ? getYoutubeId(link) : null;

  if (ytId) {
    return (
      <img 
        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} 
        alt="Thumbnail" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
    );
  }

  let Icon = Code;
  let bgColor = "#475569"; // slate-600
  
  if (t.includes("VIDEO")) { Icon = Play; bgColor = "#ef4444"; }
  else if (t.includes("MODUL")) { Icon = BookOpen; bgColor = "#10b981"; }
  else if (t.includes("GAME")) { Icon = Gamepad2; bgColor = "#8b5cf6"; }
  else if (t.includes("KUIS")) { Icon = Timer; bgColor = "#f59e0b"; }
  else if (t.includes("STORY") || t.includes("BUKU")) { Icon = BookMarked; bgColor = "#b45309"; }

  return (
    <div style={{
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      color: 'white',
      backgroundColor: bgColor
    }}>
      <Icon size={48} style={{ marginBottom: '8px', opacity: 0.9 }} />
      <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {t}
      </span>
    </div>
  );
};