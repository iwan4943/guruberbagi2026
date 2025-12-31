import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, AppSettings, User } from '../types';
import { Thumbnail } from '../components/Icons';
import { apiService } from '../services/apiService';
import { Heart, Eye, Edit2, Trash2, QrCode, Star } from 'lucide-react';
import { STORAGE_KEY_FAV, COLORS, SHADOWS, RADIUS } from '../constants';
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

// Internal Component for Individual Card to manage hover state
const MediaCard = ({ item, user, favorites, toggleFav, onPreview, onEdit, onDelete, onQr }: any) => {
    const [hover, setHover] = useState(false);
    const isOwner = user.name === item.author;
    const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
    const isFav = favorites.includes(item.id);
    const [favHover, setFavHover] = useState(false);

    let finalQrLink = item.linkContent;
    if ((!finalQrLink || finalQrLink.length < 5) && item.htmlContent) {
        const match = item.htmlContent.match(/src\s*=\s*["']([^"']+)["']/i);
        if (match && match[1]) finalQrLink = match[1];
    }

    const styles = {
        card: {
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${hover ? COLORS.primary : '#f1f5f9'}`,
            boxShadow: hover ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : SHADOWS.sm,
            display: 'flex',
            flexDirection: 'column' as const,
            height: '100%',
            position: 'relative' as const,
            transition: 'all 0.3s ease',
            transform: hover ? 'translateY(-4px)' : 'none',
        },
        thumbWrapper: {
            height: '160px',
            position: 'relative' as const,
            backgroundColor: COLORS.slate200,
            overflow: 'hidden',
        },
        badgeContainer: {
            position: 'absolute' as const,
            top: '8px',
            left: '8px',
            display: 'flex',
            gap: '4px',
            zIndex: 10,
        },
        badgePending: {
            backgroundColor: COLORS.amber500,
            color: 'white',
            fontSize: '10px',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: SHADOWS.sm,
        },
        badgeKaih: {
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(4px)',
            color: '#d97706',
            border: '1px solid #fcd34d',
            fontSize: '10px',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: RADIUS.full,
            boxShadow: SHADOWS.sm,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        btnFav: {
            position: 'absolute' as const,
            top: '8px',
            right: '8px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            transform: favHover ? 'scale(1.1)' : 'scale(1)',
            color: isFav ? COLORS.red500 : COLORS.slate400,
            zIndex: 20
        },
        viewBadge: {
            position: 'absolute' as const,
            bottom: '8px',
            left: '8px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        content: {
            padding: '16px',
            display: 'flex',
            flexDirection: 'column' as const,
            flexGrow: 1,
        },
        tagRow: {
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '4px',
            marginBottom: '8px',
        },
        tag: (bg: string, color: string, border: string) => ({
            backgroundColor: bg,
            color: color,
            border: `1px solid ${border}`,
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase' as const,
        }),
        title: {
            fontWeight: 800,
            color: COLORS.slate800,
            fontSize: '1rem',
            lineHeight: 1.25,
            marginBottom: '4px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
            height: '2.5em',
        },
        authorRow: {
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: `1px dashed ${COLORS.slate100}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        avatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: COLORS.slate100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: COLORS.slate500,
            flexShrink: 0,
        },
        btnRow: {
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
        },
        btnOpen: {
            flexGrow: 1,
            backgroundColor: COLORS.primary,
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            boxShadow: `0 4px 6px ${COLORS.primary}20`,
            cursor: 'pointer',
        },
        btnIcon: {
            width: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${COLORS.slate200}`,
            borderRadius: '8px',
            color: COLORS.slate500,
            backgroundColor: 'white',
            cursor: 'pointer',
        }
    };

    return (
        <div 
            style={styles.card}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={styles.thumbWrapper}>
                <Thumbnail type={item.type} link={item.linkContent} />
                <div style={styles.badgeContainer}>
                    {item.status === 'BARU' && (isOwner || isAdmin) && <span style={styles.badgePending}>PENDING</span>}
                    {item.kaih && <span style={styles.badgeKaih}><Star size={8} fill="currentColor" /> {item.kaih}</span>}
                </div>
                <button 
                    onClick={(e) => toggleFav(item.id, e)} 
                    style={styles.btnFav}
                    onMouseEnter={() => setFavHover(true)}
                    onMouseLeave={() => setFavHover(false)}
                >
                    <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                </button>
                <div style={styles.viewBadge}>
                    <Eye size={10} /> {item.views}
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.tagRow}>
                    <span style={styles.tag('#f0fdf4', '#15803d', '#dcfce7')}>{item.mapel}</span>
                    <span style={styles.tag('#f0f9ff', '#0369a1', '#e0f2fe')}>{item.fase}</span>
                </div>
                <h3 style={styles.title} title={item.title}>{item.title}</h3>
                
                <div style={styles.authorRow}>
                    <div style={styles.avatar}>{item.author.charAt(0)}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: COLORS.slate700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.author}</div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 500, color: COLORS.slate400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.school}</div>
                    </div>
                </div>

                <div style={styles.btnRow}>
                    <button onClick={() => onPreview(item)} style={styles.btnOpen}>BUKA KARYA</button>
                    {finalQrLink && finalQrLink.length > 5 && (
                        <button onClick={(e) => onQr(finalQrLink, e)} style={styles.btnIcon}><QrCode size={14} /></button>
                    )}
                    {(isOwner || isAdmin) && (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); onEdit(item)}} style={styles.btnIcon}><Edit2 size={14} /></button>
                            <button onClick={(e) => onDelete(item.id, e)} style={{...styles.btnIcon, color: COLORS.red500, borderColor: '#fee2e2', backgroundColor: '#fef2f2'}}><Trash2 size={14} /></button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Gallery: React.FC<GalleryProps> = ({ data, settings, user, searchQuery, refreshData }) => {
  const [filterMapel, setFilterMapel] = useState("");
  const [filterFase, setFilterFase] = useState("");
  const [filterMy, setFilterMy] = useState(false);
  const [filterFav, setFilterFav] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
     const favs = JSON.parse(localStorage.getItem(STORAGE_KEY_FAV) || '[]');
     setFavorites(favs);

     const handleResize = () => setWindowWidth(window.innerWidth);
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
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
          confirmButtonColor: COLORS.red500,
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
          html: `<div style="display:flex;justify-content:center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}" style="max-width:100%; border-radius:8px;"></div><a href="${link}" target="_blank" style="display:block;margin-top:16px;color:#3b82f6;font-weight:bold;text-decoration:none;">Buka Link</a>`,
          showConfirmButton: false,
          showCloseButton: true
      });
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || (item.title + " " + item.author + " " + item.mapel + " " + item.type).toLowerCase().includes(q);
        
        if (!matchesSearch) return false;
        if (filterMapel && item.mapel !== filterMapel) return false;
        if (filterFase && item.fase !== filterFase) return false;
        if (filterMy && item.author !== user.name) return false;
        if (filterFav && !favorites.includes(item.id)) return false;

        const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';
        const isOwner = user.name === item.author;
        if (item.status !== 'DISETUJUI' && !isAdmin && !isOwner) return false;

        return true;
    });
  }, [data, searchQuery, filterMapel, filterFase, filterMy, filterFav, user, favorites]);

  const displayedData = filteredData.slice(0, visibleCount);

  // Responsive Grid Logic using Flexbox
  const getCardWidth = () => {
      if (windowWidth >= 1024) return 'calc(25% - 18px)'; // 4 cols
      if (windowWidth >= 768) return 'calc(33.333% - 16px)'; // 3 cols
      if (windowWidth >= 500) return 'calc(50% - 12px)'; // 2 cols
      return '100%'; // 1 col
  };

  const styles = {
      container: {
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px 16px',
      },
      filterBar: {
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          border: `1px solid ${COLORS.slate200}`,
          boxShadow: SHADOWS.sm,
          marginBottom: '32px',
          display: 'flex',
          flexDirection: windowWidth < 768 ? 'column' as const : 'row' as const,
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
      },
      select: {
          padding: '8px 12px',
          borderRadius: RADIUS.lg,
          border: `1px solid ${COLORS.slate200}`,
          backgroundColor: COLORS.slate50,
          color: COLORS.slate600,
          fontWeight: 700,
          fontSize: '0.875rem',
      },
      btnFilter: (active: boolean, color: string = COLORS.primary) => ({
          padding: '8px 16px',
          borderRadius: RADIUS.full,
          fontSize: '0.75rem',
          fontWeight: 700,
          border: `1px solid ${active ? color : COLORS.slate200}`,
          backgroundColor: active ? color : 'white',
          color: active ? 'white' : color === COLORS.primary ? COLORS.primary : COLORS.slate600,
          cursor: 'pointer',
      }),
      grid: {
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '24px',
          alignItems: 'stretch'
      },
      cardWrapper: {
          width: getCardWidth(),
          flexGrow: 0,
          flexShrink: 0,
      },
      loadMore: {
          marginTop: '40px',
          textAlign: 'center' as const,
      },
      btnLoad: {
          backgroundColor: 'white',
          border: `1px solid ${COLORS.slate300}`,
          color: COLORS.slate600,
          fontWeight: 700,
          padding: '8px 24px',
          borderRadius: RADIUS.full,
          cursor: 'pointer',
          boxShadow: SHADOWS.sm
      },
      empty: {
          textAlign: 'center' as const,
          padding: '80px 0',
          color: COLORS.slate400,
          fontWeight: 700
      }
  };

  return (
    <div style={styles.container}>
       {/* Filters */}
       <div style={styles.filterBar}>
           <div style={{ display: 'flex', gap: '8px', width: windowWidth < 768 ? '100%' : 'auto' }}>
                <select style={{...styles.select, flex: 1}} value={filterMapel} onChange={e => setFilterMapel(e.target.value)}>
                    <option value="">Semua Mata Pelajaran</option>
                    {settings?.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select style={{...styles.select, flex: 1}} value={filterFase} onChange={e => setFilterFase(e.target.value)}>
                    <option value="">Semua Fase</option>
                    {settings?.phases.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
           </div>
           
           <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
               <button onClick={() => { setFilterMy(false); setFilterFav(false); setFilterMapel(""); setFilterFase(""); }} style={styles.btnFilter(false, COLORS.slate800)}>
                   Semua
               </button>
               {user.role !== 'GUEST' && (
                   <button onClick={() => { setFilterMy(!filterMy); setFilterFav(false); }} style={styles.btnFilter(filterMy, COLORS.primary)}>
                       Karya Saya
                   </button>
               )}
               <button onClick={() => { setFilterFav(!filterFav); setFilterMy(false); }} style={styles.btnFilter(filterFav, COLORS.red500)}>
                   Favorit
               </button>
           </div>
       </div>

       {/* Grid */}
       <div style={styles.grid}>
           {displayedData.map(item => (
               <div key={item.id} style={styles.cardWrapper}>
                   <MediaCard 
                        item={item} 
                        user={user} 
                        favorites={favorites} 
                        toggleFav={toggleFav}
                        onPreview={(i: MediaItem) => { setPreviewItem(i); apiService.viewMedia(i.id); }}
                        onQr={showQr}
                        onEdit={setEditingItem}
                        onDelete={handleDelete}
                   />
               </div>
           ))}
       </div>

       {/* Empty State */}
       {displayedData.length === 0 && (
           <div style={styles.empty}>
               <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>🔍</div>
               <p>Tidak ada karya ditemukan.</p>
           </div>
       )}

       {/* Load More */}
       {filteredData.length > visibleCount && (
           <div style={styles.loadMore}>
               <button onClick={() => setVisibleCount(p => p + 12)} style={styles.btnLoad}>
                   Muat Lebih Banyak
               </button>
               <p style={{ fontSize: '0.75rem', color: COLORS.slate400, marginTop: '8px', fontWeight: 600 }}>
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