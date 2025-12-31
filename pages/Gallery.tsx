import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, AppSettings, User } from '../types';
import { Thumbnail } from '../components/Icons';
import { apiService } from '../services/apiService';
import { Heart, Eye, Edit2, Trash2, QrCode, Star } from 'lucide-react';
import { STORAGE_KEY_FAV } from '../constants';
import { PreviewOverlay } from '../components/PreviewOverlay';
import { MediaForm } from '../components/Forms';
import Swal from 'sweetalert2';

interface GalleryProps {
  data: MediaItem[];
  settings: AppSettings | null;
  user: User;
  searchQuery: string;
  refreshData: () => void;
}

export const Gallery: React.FC<GalleryProps> = ({ data, settings, user, searchQuery, refreshData }) => {
  const [filterMapel, setFilterMapel] = useState("");
  const [filterFase, setFilterFase] = useState("");
  const [filterMy, setFilterMy] = useState(false);
  const [filterFav, setFilterFav] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  useEffect(() => {
     const favs = JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || '[]');
     setFavorites(favs);
  }, []);

  const toggleFav = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      let newFavs = [...favorites];
      if (newFavs.includes(id)) {
          newFavs = newFavs.filter(f => f !== id);
      } else {
          newFavs.push(id);
      }
      setFavorites(newFavs);
      localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify(newFavs));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      Swal.fire({
          title: 'Hapus Karya?',
          text: "Data tidak bisa dikembalikan",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, Hapus',
          cancelButtonText: 'Batal'
      }).then(async (result) => {
          if (result.isConfirmed) {
              await apiService.deleteMedia(id);
              refreshData();
              Swal.fire('Terhapus!', '', 'success');
          }
      });
  };
  
  const showQr = (link: string, e: React.MouseEvent) => {
      e.stopPropagation();
      Swal.fire({
          title: 'Scan QR',
          html: `<div class="flex justify-center"><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}" class="max-w-full h-auto rounded-lg shadow-sm"></div><a href="${link}" target="_blank" class="block mt-4 text-blue-500 font-bold hover:underline">Buka Link</a>`,
          showConfirmButton: false,
          showCloseButton: true
      });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
        // Search
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || (item.title + " " + item.author + " " + item.mapel + " " + item.type).toLowerCase().includes(q);
        
        // Filters
        if (!matchesSearch) return false;
        if (filterMapel && item.mapel !== filterMapel) return false;
        if (filterFase && item.fase !== filterFase) return false;
        if (filterMy && item.author !== user.name) return false;
        if (filterFav && !favorites.includes(item.id)) return false;

        // Visibility rules
        const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
        const isOwner = user.name === item.author;
        if (item.status !== 'DISETUJUI' && !isAdmin && !isOwner) return false;

        return true;
    });
  }, [data, searchQuery, filterMapel, filterFase, filterMy, filterFav, user, favorites]);

  const displayedData = filteredData.slice(0, visibleCount);

  return (
    <div className="container mx-auto px-4 py-6">
       {/* Filters */}
       <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex gap-2 w-full md:w-auto">
                <select className="form-select bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-primary py-2" value={filterMapel} onChange={e => setFilterMapel(e.target.value)}>
                    <option value="">Semua Mata Pelajaran</option>
                    {settings?.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="form-select bg-slate-50 border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-primary py-2" value={filterFase} onChange={e => setFilterFase(e.target.value)}>
                    <option value="">Semua Fase</option>
                    {settings?.phases.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
           </div>
           
           <div className="flex gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
               <button onClick={() => { setFilterMy(false); setFilterFav(false); setFilterMapel(""); setFilterFase(""); }} className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold bg-slate-800 text-white shadow-sm hover:bg-slate-700 transition">
                   Semua
               </button>
               {user.role !== 'GUEST' && (
                   <button onClick={() => { setFilterMy(!filterMy); setFilterFav(false); }} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition ${filterMy ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary hover:bg-teal-50'}`}>
                       Karya Saya
                   </button>
               )}
               <button onClick={() => { setFilterFav(!filterFav); setFilterMy(false); }} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition ${filterFav ? 'bg-red-500 text-white border-red-500' : 'bg-white text-red-500 border-red-200 hover:bg-red-50'}`}>
                   Favorit
               </button>
           </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
           {displayedData.map(item => {
               const isOwner = user.name === item.author;
               const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
               const isFav = favorites.includes(item.id);

               // Logic to extract QR link
               let finalQrLink = item.linkContent;
               if ((!finalQrLink || finalQrLink.length < 5) && item.htmlContent) {
                    const match = item.htmlContent.match(/src\s*=\s*["']([^"']+)["']/i);
                    if (match && match[1]) finalQrLink = match[1];
               }

               return (
                   <div key={item.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
                       {/* Thumbnail Area */}
                       <div className="h-[160px] relative bg-slate-200 overflow-hidden">
                           <Thumbnail type={item.type} link={item.linkContent} />
                           
                           {/* Badges */}
                           <div className="absolute top-2 left-2 flex gap-1">
                               {item.status === 'BARU' && (isOwner || isAdmin) && <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-1 rounded shadow-sm">PENDING</span>}
                               {item.kaih && <span className="bg-white/90 backdrop-blur text-amber-600 border border-amber-300 text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm flex items-center gap-1"><Star size={8} fill="currentColor" /> {item.kaih}</span>}
                           </div>

                           <button onClick={(e) => toggleFav(item.id, e)} className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center transition hover:scale-110 ${isFav ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}>
                               <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                           </button>

                           <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                               <Eye size={10} /> {item.views}
                           </div>
                       </div>

                       {/* Content Area */}
                       <div className="p-4 flex flex-col flex-grow">
                           <div className="flex flex-wrap gap-1 mb-2">
                               <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{item.mapel}</span>
                               <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{item.fase}</span>
                           </div>
                           
                           <h3 className="font-extrabold text-slate-800 leading-tight mb-1 line-clamp-2" title={item.title}>
                               {item.title}
                           </h3>
                           
                           <div className="mt-auto pt-4 border-t border-dashed border-slate-100 flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                   {item.author.charAt(0)}
                               </div>
                               <div className="overflow-hidden">
                                   <div className="text-xs font-bold text-slate-700 truncate">{item.author}</div>
                                   <div className="text-[10px] font-medium text-slate-400 truncate">{item.school}</div>
                               </div>
                           </div>

                           {/* Actions */}
                           <div className="mt-3 flex gap-2">
                               <button onClick={() => { setPreviewItem(item); apiService.viewMedia(item.id); }} className="flex-grow bg-primary hover:bg-primary-dark text-white text-xs font-bold py-2 rounded-lg shadow-primary/20 shadow-md transition-colors">
                                   BUKA KARYA
                               </button>
                               {finalQrLink && finalQrLink.length > 5 && (
                                   <button onClick={(e) => showQr(finalQrLink, e)} className="w-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800">
                                       <QrCode size={14} />
                                   </button>
                               )}
                               {(isOwner || isAdmin) && (
                                   <>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="w-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={(e) => handleDelete(item.id, e)} className="w-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                                        <Trash2 size={14} />
                                    </button>
                                   </>
                               )}
                           </div>
                       </div>
                   </div>
               );
           })}
       </div>

       {/* Empty State */}
       {displayedData.length === 0 && (
           <div className="text-center py-20">
               <div className="inline-block p-4 rounded-full bg-slate-100 text-slate-300 mb-4">
                   <div className="text-4xl">🔍</div>
               </div>
               <p className="text-slate-500 font-bold">Tidak ada karya ditemukan.</p>
           </div>
       )}

       {/* Load More */}
       {filteredData.length > visibleCount && (
           <div className="text-center mt-10">
               <button onClick={() => setVisibleCount(p => p + 12)} className="bg-white border border-slate-300 text-slate-600 font-bold px-6 py-2 rounded-full hover:bg-slate-50 shadow-sm transition">
                   Muat Lebih Banyak
               </button>
               <p className="text-xs text-slate-400 mt-2 font-medium">
                   Menampilkan {displayedData.length} dari {filteredData.length} karya
               </p>
           </div>
       )}

       {/* Preview Overlay */}
       {previewItem && <PreviewOverlay item={previewItem} onClose={() => setPreviewItem(null)} />}
       
       {/* Edit Modal */}
       {editingItem && (
           <MediaForm 
                user={user} 
                settings={settings} 
                initialData={editingItem} 
                onClose={() => setEditingItem(null)} 
                onSuccess={() => { setEditingItem(null); refreshData(); }} 
            />
       )}
    </div>
  );
};
