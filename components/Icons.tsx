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
        className="w-full h-full object-cover"
        loading="lazy"
      />
    );
  }

  let Icon = Code;
  let bgClass = "bg-slate-600";
  
  if (t.includes("VIDEO")) { Icon = Play; bgClass = "bg-red-500"; }
  else if (t.includes("MODUL")) { Icon = BookOpen; bgClass = "bg-emerald-500"; }
  else if (t.includes("GAME")) { Icon = Gamepad2; bgClass = "bg-violet-500"; }
  else if (t.includes("KUIS")) { Icon = Timer; bgClass = "bg-amber-500"; }
  else if (t.includes("STORY") || t.includes("BUKU")) { Icon = BookMarked; bgClass = "bg-amber-700"; }

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-white ${bgClass}`}>
      <Icon size={48} className="mb-2 opacity-90" />
      <span className="text-[10px] font-extrabold tracking-widest uppercase">{t}</span>
    </div>
  );
};
