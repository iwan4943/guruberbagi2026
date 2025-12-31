import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Gallery } from './pages/Gallery';
import { Admin } from './pages/Admin';
import { apiService } from './services/apiService';
import { MediaItem, AppSettings, User } from './types';
import { DEFAULT_USER, STORAGE_KEY_USER } from './constants';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-slate-800 pb-20">
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
          className="fixed bottom-8 right-8 w-16 h-16 bg-slate-800 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 hover:bg-primary transition-all duration-300 z-40 group"
          title="Tambah Karya"
        >
          <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
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
