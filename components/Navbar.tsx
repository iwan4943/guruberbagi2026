import React, { useState } from 'react';
import { Search, LogOut, User as UserIcon, LogIn, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { User } from '../types';

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

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 self-start md:self-auto">
           <img src="https://i.imgur.com/kNgOisY.png" alt="Logo" className="h-[48px]" />
           <div className="flex flex-col leading-tight">
             <span className="font-extrabold text-primary text-xl tracking-tight">GURU BERBAGI</span>
             <span className="font-semibold text-slate-500 text-[0.7rem] uppercase tracking-wide">Korwilcambidik Kecamatan Selogiri</span>
           </div>
        </div>

        {/* Search Bar - Only in Gallery View */}
        {currentView === 'GALLERY' && (
          <div className="flex items-center w-full max-w-md bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search size={18} className="text-slate-400 mr-3" />
            <input 
              type="text" 
              className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder:font-medium placeholder:text-slate-400"
              placeholder="Cari karya, mapel, guru..."
              value={searchValue}
              onChange={handleInput}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {currentView === 'ADMIN' ? (
             <button 
                onClick={() => onChangeView('GALLERY')}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-slate-600 border border-slate-300 rounded-full hover:bg-slate-50 transition-colors"
             >
                <ArrowLeft size={16} /> Kembali
             </button>
          ) : (
             isAdmin && (
              <button 
                onClick={() => onChangeView('ADMIN')}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold text-amber-900 bg-amber-400 rounded-full hover:bg-amber-500 transition-colors shadow-sm"
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
             )
          )}

          {user.role === 'GUEST' ? (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 px-5 py-1.5 text-sm font-bold text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <LogIn size={16} /> Login Guru
            </button>
          ) : (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
               <div className="text-right hidden sm:block">
                 <div className="text-xs font-bold text-slate-800">{user.name}</div>
                 <div className="text-[0.6rem] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block">{user.role}</div>
               </div>
               <button 
                 onClick={onLogout}
                 className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors border border-red-100"
                 title="Logout"
               >
                 <LogOut size={14} />
               </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
