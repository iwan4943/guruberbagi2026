import React, { useState } from 'react';
import { Search, LogOut, LogIn, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { COLORS, SHADOWS, RADIUS } from '../constants';

interface NavbarProps {
  user: User;
  onLogin: () => void;
  onLogout: () => void;
  onSearch: (q: string) => void;
  currentView: 'GALLERY' | 'ADMIN';
  onChangeView: (v: 'GALLERY' | 'ADMIN') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, onSearch, currentView, onChangeView }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  const isAdmin = user.role === 'ADMIN' || user.role === 'MODERATOR';

  const styles = {
    nav: {
      position: 'sticky' as const,
      top: 0,
      zIndex: 40,
      backgroundColor: COLORS.white,
      borderBottom: `1px solid ${COLORS.slate200}`,
      boxShadow: SHADOWS.sm,
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '12px 16px',
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    brand: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    brandText: {
      display: 'flex',
      flexDirection: 'column' as const,
      lineHeight: 1.1,
    },
    brandTitle: {
      fontWeight: 800,
      color: COLORS.primary,
      fontSize: '1.25rem',
      letterSpacing: '-0.025em',
    },
    brandSubtitle: {
      fontWeight: 600,
      color: COLORS.slate500,
      fontSize: '0.7rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    searchContainer: {
      flex: 1,
      maxWidth: '450px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      border: `1px solid ${COLORS.slate200}`,
      borderRadius: RADIUS.full,
      padding: '8px 16px',
      boxShadow: SHADOWS.sm,
    },
    input: {
      width: '100%',
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: COLORS.slate700,
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    btnAdmin: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: '#78350f', // amber-900
      backgroundColor: '#fbbf24', // amber-400
      border: 'none',
      borderRadius: RADIUS.full,
    },
    btnBack: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: COLORS.slate600,
      border: `1px solid ${COLORS.slate300}`,
      backgroundColor: 'white',
      borderRadius: RADIUS.full,
    },
    btnLogin: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 20px',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: COLORS.primary,
      border: `1px solid ${COLORS.primary}`,
      backgroundColor: 'transparent',
      borderRadius: RADIUS.full,
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingLeft: '8px',
      borderLeft: `1px solid ${COLORS.slate200}`,
    },
    userInfo: {
      textAlign: 'right' as const,
    },
    badge: {
        fontSize: '0.6rem',
        fontWeight: 700,
        color: COLORS.slate500,
        backgroundColor: COLORS.slate100,
        padding: '2px 8px',
        borderRadius: RADIUS.full,
        display: 'inline-block'
    },
    btnLogout: {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.red50,
        color: COLORS.red500,
        border: '1px solid #fee2e2',
        cursor: 'pointer'
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand}>
           <img src="https://i.imgur.com/kNgOisY.png" alt="Logo" style={{ height: '48px' }} />
           <div style={styles.brandText}>
             <span style={styles.brandTitle}>GURU BERBAGI</span>
             <span style={styles.brandSubtitle}>Korwilcambidik Kecamatan Selogiri</span>
           </div>
        </div>

        {/* Search Bar - Only in Gallery View */}
        {currentView === 'GALLERY' ? (
          <div style={styles.searchContainer}>
            <Search size={18} color={COLORS.slate400} style={{ marginRight: '12px' }} />
            <input 
              type="text" 
              style={styles.input}
              placeholder="Cari karya, mapel, guru..."
              value={searchValue}
              onChange={handleInput}
            />
          </div>
        ) : <div style={{ flex: 1 }}></div>}

        {/* Actions */}
        <div style={styles.actions}>
          {currentView === 'ADMIN' ? (
             <button onClick={() => onChangeView('GALLERY')} style={styles.btnBack}>
                <ArrowLeft size={16} /> Kembali
             </button>
          ) : (
             isAdmin && (
              <button onClick={() => onChangeView('ADMIN')} style={styles.btnAdmin}>
                <LayoutDashboard size={16} /> Dashboard
              </button>
             )
          )}

          {user.role === 'GUEST' ? (
            <button onClick={onLogin} style={styles.btnLogin}>
              <LogIn size={16} /> Login Guru
            </button>
          ) : (
            <div style={styles.userSection}>
               <div style={styles.userInfo}>
                 <div style={{ fontSize: '0.75rem', fontWeight: 700, color: COLORS.slate800 }}>{user.name}</div>
                 <div style={styles.badge}>{user.role}</div>
               </div>
               <button onClick={onLogout} style={styles.btnLogout} title="Logout">
                 <LogOut size={14} />
               </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};