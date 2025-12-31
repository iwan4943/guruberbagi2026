import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Gallery } from './pages/Gallery';
import { Admin } from './pages/Admin';
import { apiService } from './services/apiService';
import { MediaItem, AppSettings, User } from './types';
import { DEFAULT_USER, STORAGE_KEY_USER, COLORS, SHADOWS, RADIUS } from './constants';
import { Plus } from 'lucide-react';
import { MediaForm } from './components/Forms';
import Swal from 'sweetalert2';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MediaItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [view, setView] = useState<'GALLERY' | 'ADMIN'>('GALLERY');
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [fabHover, setFabHover] = useState(false);

  // Initialize
  useEffect(() => {
    // Load User
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load Data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await apiService.fetchAll();
      setData(res.media);
      // Map settings rows to object
      const rawS = res.settings;
      if (rawS && rawS.length > 0) {
        setSettings({
          types: rawS.map(r => r[0]).filter(Boolean),
          subjects: rawS.map(r => r[1]).filter(Boolean),
          phases: rawS.map(r => r[2]).filter(Boolean),
          kaih: rawS.map(r => r[3]).filter(Boolean),
          semesters: rawS.map(r => r[4]).filter(Boolean),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    Swal.fire({
      title: 'Login Guru',
      input: 'password',
      inputPlaceholder: 'Masukkan PIN',
      showCancelButton: true,
      confirmButtonText: 'Login',
      cancelButtonText: 'Batal',
      confirmButtonColor: COLORS.primary,
      showLoaderOnConfirm: true,
      preConfirm: async (pin) => {
        try {
          const u = await apiService.login(pin);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
          setUser(u);
          return u;
        } catch (error) {
          Swal.showValidationMessage(`Login gagal: ${(error as Error).message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({ icon: 'success', title: 'Berhasil Login', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(DEFAULT_USER);
    setView('GALLERY');
  };

  const styles = {
    container: {
        minHeight: '100vh',
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        color: COLORS.slate800,
        paddingBottom: '80px',
        backgroundColor: COLORS.bgBody
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.slate100
    },
    loader: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        borderBottom: `4px solid ${COLORS.primary}`,
        animation: 'spin 1s linear infinite'
    },
    fab: {
        position: 'fixed' as const,
        bottom: '32px',
        right: '32px',
        width: '64px',
        height: '64px',
        backgroundColor: fabHover ? COLORS.primary : COLORS.slate800,
        color: 'white',
        borderRadius: '16px',
        boxShadow: SHADOWS.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        zIndex: 40,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: fabHover ? 'scale(1.1)' : 'scale(1)'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="animate-spin" style={styles.loader}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
        onSearch={setSearchQuery}
        currentView={view}
        onChangeView={setView}
      />

      <main>
        {view === 'GALLERY' && (
          <Gallery 
            data={data} 
            settings={settings} 
            user={user} 
            searchQuery={searchQuery}
            refreshData={loadData}
          />
        )}
        {view === 'ADMIN' && (
          <Admin 
            data={data} 
            user={user}
            refreshData={loadData}
          />
        )}
      </main>

      {/* Floating Action Button (Only for Teachers/Admins in Gallery) */}
      {user.role !== 'GUEST' && view === 'GALLERY' && (
        <button 
          onClick={() => setShowAddModal(true)}
          style={styles.fab}
          onMouseEnter={() => setFabHover(true)}
          onMouseLeave={() => setFabHover(false)}
          title="Tambah Karya"
        >
          <Plus size={32} style={{ transition: 'transform 0.3s', transform: fabHover ? 'rotate(90deg)' : 'none' }} />
        </button>
      )}

      {showAddModal && (
        <MediaForm 
          user={user}
          settings={settings}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); loadData(); Swal.fire('Berhasil', 'Karya berhasil disimpan', 'success'); }}
        />
      )}
    </div>
  );
};

export default App;