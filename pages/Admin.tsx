import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, User, TeacherStat, SchoolStat } from '../types';
import { apiService } from '../services/apiService';
import { Layers, CheckCircle2, Clock, Users, Trash2, Edit, Award } from 'lucide-react';
import Swal from 'sweetalert2';

interface AdminProps {
    data: MediaItem[];
    user: User;
    refreshData: () => void;
}

export const Admin: React.FC<AdminProps> = ({ data, user, refreshData }) => {
    const [activeTab, setActiveTab] = useState<'KURASI' | 'USERS' | 'RANK_SCHOOL' | 'RANK_TEACHER'>('KURASI');
    const [usersList, setUsersList] = useState<any[]>([]); // Raw user arrays for simplicity or map them

    // Stats
    const stats = useMemo(() => ({
        total: data.length,
        approved: data.filter(i => i.status === 'DISETUJUI').length,
        pending: data.filter(i => i.status === 'BARU').length,
    }), [data]);

    // Load users on mount if admin
    useEffect(() => {
        if (user.role === 'ADMIN') {
            apiService.fetchUsers().then(setUsersList);
        }
    }, [user]);

    // Derived Rankings
    const { schoolStats, teacherStats } = useMemo(() => {
        const tStats: Record<string, TeacherStat> = {};
        const sStats: Record<string, { teachers: Set<string>, count: number }> = {};

        data.forEach(item => {
            // Teacher Stats
            if (!tStats[item.author]) {
                tStats[item.author] = { name: item.author, school: item.school, count: 0 };
            }
            tStats[item.author].count++;

            // School Stats
            const sName = item.school || "Tanpa Sekolah";
            if (!sStats[sName]) sStats[sName] = { teachers: new Set(), count: 0 };
            sStats[sName].count++;
            sStats[sName].teachers.add(item.author);
        });

        // Also add users to school stats who haven't posted yet
        usersList.forEach(u => {
            const sName = u[1] || "Tanpa Sekolah";
            if (!sStats[sName]) sStats[sName] = { teachers: new Set(), count: 0 };
            sStats[sName].teachers.add(u[0]);
        });

        const sResult: SchoolStat[] = Object.entries(sStats).map(([name, val]) => ({
            name,
            teacherCount: val.teachers.size,
            mediaCount: val.count,
            percentage: data.length > 0 ? (val.count / data.length) * 100 : 0
        })).sort((a,b) => b.mediaCount - a.mediaCount);

        const tResult: TeacherStat[] = Object.values(tStats).sort((a,b) => b.count - a.count);

        return { schoolStats: sResult, teacherStats: tResult };
    }, [data, usersList]);

    // Handlers
    const handleKurasi = (item: MediaItem) => {
        Swal.fire({
            title: 'Kurasi Karya',
            html: `
                <select id="swal-status" class="w-full p-2 border rounded mb-3">
                    <option value="BARU" ${item.status === 'BARU' ? 'selected' : ''}>BARU (Pending)</option>
                    <option value="DISETUJUI" ${item.status === 'DISETUJUI' ? 'selected' : ''}>DISETUJUI (Tampil)</option>
                    <option value="REVISI" ${item.status === 'REVISI' ? 'selected' : ''}>REVISI</option>
                </select>
                <textarea id="swal-feedback" class="w-full p-2 border rounded" placeholder="Catatan...">${item.feedback || ''}</textarea>
            `,
            showCancelButton: true,
            preConfirm: () => {
                const status = (document.getElementById('swal-status') as HTMLSelectElement).value;
                const feedback = (document.getElementById('swal-feedback') as HTMLTextAreaElement).value;
                return { status, feedback };
            }
        }).then(async (res) => {
            if (res.isConfirmed) {
                await apiService.updateKurasi(item.id, res.value.status, res.value.feedback);
                refreshData();
                Swal.fire('Updated', '', 'success');
            }
        });
    };

    const handleAddUser = () => {
        Swal.fire({
            title: 'Tambah Guru',
            html: `
                <input id="u-name" class="swal2-input" placeholder="Nama Lengkap">
                <input id="u-school" class="swal2-input" placeholder="Unit Kerja">
                <input id="u-pin" class="swal2-input" placeholder="PIN Login">
                <select id="u-role" class="swal2-input">
                    <option value="GURU">GURU</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            `,
            preConfirm: () => {
                 return {
                    nama: (document.getElementById('u-name') as HTMLInputElement).value,
                    sekolah: (document.getElementById('u-school') as HTMLInputElement).value,
                    pin: (document.getElementById('u-pin') as HTMLInputElement).value,
                    role: (document.getElementById('u-role') as HTMLSelectElement).value,
                    oldPin: ""
                 };
            }
        }).then(async (res) => {
             if (res.isConfirmed) {
                 await apiService.saveUser(res.value);
                 apiService.fetchUsers().then(setUsersList);
                 Swal.fire('Saved', '', 'success');
             }
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-800">Dashboard Admin</h1>
                <p className="text-slate-500 text-sm">Kelola data dan pantau aktivitas guru.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                    <div className="text-4xl font-extrabold mb-1">{stats.total}</div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2"><Layers size={14}/> Total Karya</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
                    <div className="text-4xl font-extrabold mb-1">{stats.approved}</div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2"><CheckCircle2 size={14}/> Disetujui</div>
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-200">
                    <div className="text-4xl font-extrabold mb-1">{stats.pending}</div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2"><Clock size={14}/> Menunggu</div>
                </div>
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl p-6 text-white shadow-lg shadow-slate-300">
                    <div className="text-4xl font-extrabold mb-1">{usersList.length}</div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-2"><Users size={14}/> Guru Terdaftar</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                <div className="flex border-b border-slate-100 overflow-x-auto">
                    {[
                        { id: 'KURASI', label: 'Kurasi Karya' },
                        { id: 'USERS', label: 'Data Guru', role: 'ADMIN' },
                        { id: 'RANK_SCHOOL', label: 'Top Sekolah', role: 'ADMIN' },
                        { id: 'RANK_TEACHER', label: 'Top Guru', role: 'ADMIN' },
                    ].map(tab => {
                         if (tab.role && user.role !== tab.role) return null;
                         return (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary bg-teal-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            >
                                {tab.label}
                            </button>
                         );
                    })}
                </div>

                <div className="p-6 overflow-x-auto">
                    {/* Content */}
                    {activeTab === 'KURASI' && (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-extrabold text-slate-400 uppercase border-b border-slate-200">
                                    <th className="pb-3 pl-2">Info Karya</th>
                                    <th className="pb-3">Guru</th>
                                    <th className="pb-3 text-center">Status</th>
                                    <th className="pb-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {data.map(item => (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                                        <td className="py-3 pl-2">
                                            <div className="font-bold text-slate-800">{item.title}</div>
                                            <div className="text-xs text-slate-500">{item.type}</div>
                                        </td>
                                        <td className="py-3">
                                            <div className="font-bold text-slate-700">{item.author}</div>
                                            <div className="text-xs text-slate-500">{item.school}</div>
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-[10px] font-extrabold ${item.status === 'DISETUJUI' ? 'bg-emerald-100 text-emerald-700' : (item.status === 'REVISI' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="py-3 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleKurasi(item)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600"><Edit size={16}/></button>
                                                <button onClick={() => apiService.deleteMedia(item.id).then(refreshData)} className="p-1.5 rounded hover:bg-red-100 text-red-600"><Trash2 size={16}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'USERS' && (
                        <div>
                             <div className="flex justify-end mb-4">
                                 <button onClick={handleAddUser} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-dark">
                                     + Tambah Guru
                                 </button>
                             </div>
                             <table className="w-full text-left">
                                <thead className="text-xs font-extrabold text-slate-400 uppercase border-b">
                                    <tr><th className="pb-3 pl-2">Nama</th><th className="pb-3">PIN</th><th className="pb-3">Role</th><th className="pb-3 text-center">Aksi</th></tr>
                                </thead>
                                <tbody className="text-sm">
                                    {usersList.map((u, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                            <td className="py-3 pl-2">
                                                <div className="font-bold">{u[0]}</div>
                                                <div className="text-xs text-slate-500">{u[1]}</div>
                                            </td>
                                            <td className="py-3 font-mono text-slate-500">{u[2]}</td>
                                            <td className="py-3"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">{u[3]}</span></td>
                                            <td className="py-3 text-center">
                                                <button onClick={() => apiService.deleteUser(u[2]).then(() => apiService.fetchUsers().then(setUsersList))} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    )}

                    {activeTab === 'RANK_SCHOOL' && (
                        <table className="w-full text-left">
                           <thead className="text-xs font-extrabold text-slate-400 uppercase border-b">
                               <tr><th className="pb-3 w-10 text-center">#</th><th className="pb-3">Satuan Pendidikan</th><th className="pb-3 text-center">Guru</th><th className="pb-3 text-center">Karya</th><th className="pb-3 text-center">Progress</th></tr>
                           </thead>
                           <tbody className="text-sm">
                               {schoolStats.map((s, i) => (
                                   <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                       <td className="py-3 text-center font-bold text-slate-400">{i+1}</td>
                                       <td className="py-3 font-bold text-slate-800">{s.name}</td>
                                       <td className="py-3 text-center"><span className="bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded">{s.teacherCount}</span></td>
                                       <td className="py-3 text-center"><span className="bg-teal-50 text-teal-700 font-bold px-2 py-1 rounded">{s.mediaCount}</span></td>
                                       <td className="py-3 align-middle w-1/4">
                                           <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                               <div className="bg-primary h-full" style={{width: `${s.percentage}%`}}></div>
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                    )}
                    
                    {activeTab === 'RANK_TEACHER' && (
                         <table className="w-full text-left">
                            <thead className="text-xs font-extrabold text-slate-400 uppercase border-b">
                                <tr><th className="pb-3 w-10 text-center">#</th><th className="pb-3">Nama Guru</th><th className="pb-3">Sekolah</th><th className="pb-3 text-center">Total Karya</th></tr>
                            </thead>
                            <tbody className="text-sm">
                                {teacherStats.slice(0, 100).map((t, i) => (
                                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                                        <td className="py-3 text-center">
                                            {i < 3 ? <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto ${i===0?'bg-yellow-400':i===1?'bg-slate-400':'bg-orange-400'}`}>{i+1}</div> : <span className="text-slate-400 font-bold">{i+1}</span>}
                                        </td>
                                        <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                                            {t.name}
                                            {i < 3 && <Award size={14} className="text-amber-500" />}
                                        </td>
                                        <td className="py-3 text-xs text-slate-500 font-bold">{t.school}</td>
                                        <td className="py-3 text-center"><span className="bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full">{t.count}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    )}
                </div>
            </div>
        </div>
    );
};
