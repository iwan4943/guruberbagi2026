import React, { useState, useMemo, useEffect } from 'react';
import { MediaItem, User, TeacherStat, SchoolStat } from '../types';
import { apiService } from '../services/apiService';
import { Layers, CheckCircle2, Clock, Users, Trash2, Edit, Award } from 'lucide-react';
import Swal from 'sweetalert2';
import { COLORS, SHADOWS, RADIUS } from '../constants';

interface AdminProps {
    data: MediaItem[];
    user: User;
    refreshData: () => void;
}

export const Admin: React.FC<AdminProps> = ({ data, user, refreshData }) => {
    const [activeTab, setActiveTab] = useState<'KURASI' | 'USERS' | 'RANK_SCHOOL' | 'RANK_TEACHER'>('KURASI');
    const [usersList, setUsersList] = useState<any[]>([]); 
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        if (user.role === 'ADMIN') apiService.fetchUsers().then(setUsersList);
        return () => window.removeEventListener('resize', handleResize);
    }, [user]);

    // Stats
    const stats = useMemo(() => ({
        total: data.length,
        approved: data.filter(i => i.status === 'DISETUJUI').length,
        pending: data.filter(i => i.status === 'BARU').length,
    }), [data]);

    // Derived Rankings
    const { schoolStats, teacherStats } = useMemo(() => {
        const tStats: Record<string, TeacherStat> = {};
        const sStats: Record<string, { teachers: Set<string>, count: number }> = {};

        data.forEach(item => {
            if (!tStats[item.author]) tStats[item.author] = { name: item.author, school: item.school, count: 0 };
            tStats[item.author].count++;

            const sName = item.school || "Tanpa Sekolah";
            if (!sStats[sName]) sStats[sName] = { teachers: new Set(), count: 0 };
            sStats[sName].count++;
            sStats[sName].teachers.add(item.author);
        });

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
                <div style="text-align:left; margin-bottom: 8px; font-weight:bold; font-size:0.8rem; color:#64748b;">STATUS</div>
                <select id="swal-status" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:16px;">
                    <option value="BARU" ${item.status === 'BARU' ? 'selected' : ''}>BARU (Pending)</option>
                    <option value="DISETUJUI" ${item.status === 'DISETUJUI' ? 'selected' : ''}>DISETUJUI (Tampil)</option>
                    <option value="REVISI" ${item.status === 'REVISI' ? 'selected' : ''}>REVISI</option>
                </select>
                <div style="text-align:left; margin-bottom: 8px; font-weight:bold; font-size:0.8rem; color:#64748b;">FEEDBACK</div>
                <textarea id="swal-feedback" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px; min-height:80px;" placeholder="Catatan...">${item.feedback || ''}</textarea>
            `,
            showCancelButton: true,
            confirmButtonColor: COLORS.primary,
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
                <input id="u-name" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #cbd5e1; border-radius:8px;" placeholder="Nama Lengkap">
                <input id="u-school" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #cbd5e1; border-radius:8px;" placeholder="Unit Kerja">
                <input id="u-pin" style="width:100%; padding:10px; margin-bottom:10px; border:1px solid #cbd5e1; border-radius:8px;" placeholder="PIN Login">
                <select id="u-role" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                    <option value="GURU">GURU</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
            `,
            confirmButtonColor: COLORS.primary,
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

    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' },
        header: { marginBottom: '32px' },
        title: { fontSize: '1.5rem', fontWeight: 800, color: COLORS.slate800, margin: 0 },
        subtitle: { fontSize: '0.875rem', color: COLORS.slate500, marginTop: '4px' },
        statsGrid: {
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '16px',
            marginBottom: '32px',
        },
        statCard: (from: string, to: string, shadow: string) => ({
            flex: '1 1 200px',
            padding: '24px',
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${from}, ${to})`,
            color: 'white',
            boxShadow: `0 10px 15px -3px ${shadow}`,
        }),
        statVal: { fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, marginBottom: '4px' },
        statLabel: { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, opacity: 0.9, display: 'flex', alignItems: 'center', gap: '8px' },
        
        tabNav: {
            backgroundColor: 'white',
            borderRadius: '16px',
            border: `1px solid ${COLORS.slate200}`,
            boxShadow: SHADOWS.sm,
            overflow: 'hidden',
            marginBottom: '24px',
        },
        tabHeader: {
            display: 'flex',
            borderBottom: `1px solid ${COLORS.slate100}`,
            overflowX: 'auto' as const,
        },
        tabBtn: (active: boolean) => ({
            padding: '16px 24px',
            fontSize: '0.875rem',
            fontWeight: 700,
            whiteSpace: 'nowrap' as const,
            border: 'none',
            backgroundColor: active ? '#f0fdf4' : 'transparent',
            color: active ? COLORS.primary : COLORS.slate500,
            borderBottom: active ? `2px solid ${COLORS.primary}` : 'none',
            cursor: 'pointer',
        }),
        content: {
            padding: '24px',
            overflowX: 'auto' as const,
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '0.875rem',
        },
        th: {
            textAlign: 'left' as const,
            padding: '12px 8px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: COLORS.slate400,
            textTransform: 'uppercase' as const,
            borderBottom: `1px solid ${COLORS.slate200}`,
        },
        td: {
            padding: '12px 8px',
            borderBottom: `1px solid ${COLORS.slate50}`,
            verticalAlign: 'middle',
        },
        actionBtn: (color: string) => ({
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: color,
            cursor: 'pointer',
        }),
        statusBadge: (status: string) => ({
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.65rem',
            fontWeight: 800,
            backgroundColor: status === 'DISETUJUI' ? '#d1fae5' : (status === 'REVISI' ? '#fee2e2' : '#fef3c7'),
            color: status === 'DISETUJUI' ? '#047857' : (status === 'REVISI' ? '#b91c1c' : '#b45309'),
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Dashboard Admin</h1>
                <p style={styles.subtitle}>Kelola data dan pantau aktivitas guru.</p>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard('#3b82f6', '#2563eb', 'rgba(59, 130, 246, 0.3)')}>
                    <div style={styles.statVal}>{stats.total}</div>
                    <div style={styles.statLabel}><Layers size={14}/> Total Karya</div>
                </div>
                <div style={styles.statCard('#10b981', '#059669', 'rgba(16, 185, 129, 0.3)')}>
                    <div style={styles.statVal}>{stats.approved}</div>
                    <div style={styles.statLabel}><CheckCircle2 size={14}/> Disetujui</div>
                </div>
                <div style={styles.statCard('#fbbf24', '#f59e0b', 'rgba(251, 191, 36, 0.3)')}>
                    <div style={styles.statVal}>{stats.pending}</div>
                    <div style={styles.statLabel}><Clock size={14}/> Menunggu</div>
                </div>
                <div style={styles.statCard('#64748b', '#475569', 'rgba(100, 116, 139, 0.3)')}>
                    <div style={styles.statVal}>{usersList.length}</div>
                    <div style={styles.statLabel}><Users size={14}/> Guru Terdaftar</div>
                </div>
            </div>

            {/* Navigation */}
            <div style={styles.tabNav}>
                <div style={styles.tabHeader}>
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
                                style={styles.tabBtn(activeTab === tab.id)}
                            >
                                {tab.label}
                            </button>
                         );
                    })}
                </div>

                <div style={styles.content}>
                    {activeTab === 'KURASI' && (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Info Karya</th>
                                    <th style={styles.th}>Guru</th>
                                    <th style={{...styles.th, textAlign: 'center'}}>Status</th>
                                    <th style={{...styles.th, textAlign: 'center'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(item => (
                                    <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.slate50}` }}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 700, color: COLORS.slate800 }}>{item.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: COLORS.slate500 }}>{item.type}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 700, color: COLORS.slate700 }}>{item.author}</div>
                                            <div style={{ fontSize: '0.75rem', color: COLORS.slate500 }}>{item.school}</div>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <span style={styles.statusBadge(item.status)}>{item.status}</span>
                                        </td>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            <button onClick={() => handleKurasi(item)} style={styles.actionBtn(COLORS.primary)}><Edit size={16}/></button>
                                            <button onClick={() => apiService.deleteMedia(item.id).then(refreshData)} style={styles.actionBtn(COLORS.red500)}><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'USERS' && (
                        <div>
                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                 <button onClick={handleAddUser} style={{ backgroundColor: COLORS.primary, color: 'white', fontWeight: 700, fontSize: '0.75rem', padding: '8px 16px', borderRadius: RADIUS.full, border: 'none', cursor: 'pointer' }}>
                                     + Tambah Guru
                                 </button>
                             </div>
                             <table style={styles.table}>
                                <thead>
                                    <tr><th style={styles.th}>Nama</th><th style={styles.th}>PIN</th><th style={styles.th}>Role</th><th style={{...styles.th, textAlign: 'center'}}>Aksi</th></tr>
                                </thead>
                                <tbody>
                                    {usersList.map((u, i) => (
                                        <tr key={i}>
                                            <td style={styles.td}>
                                                <div style={{ fontWeight: 700 }}>{u[0]}</div>
                                                <div style={{ fontSize: '0.75rem', color: COLORS.slate500 }}>{u[1]}</div>
                                            </td>
                                            <td style={{...styles.td, fontFamily: 'monospace', color: COLORS.slate500 }}>{u[2]}</td>
                                            <td style={styles.td}><span style={{ backgroundColor: COLORS.slate100, padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{u[3]}</span></td>
                                            <td style={{...styles.td, textAlign: 'center'}}>
                                                <button onClick={() => apiService.deleteUser(u[2]).then(() => apiService.fetchUsers().then(setUsersList))} style={styles.actionBtn(COLORS.red500)}><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    )}

                    {activeTab === 'RANK_SCHOOL' && (
                        <table style={styles.table}>
                           <thead>
                               <tr><th style={{...styles.th, textAlign: 'center', width: '40px'}}>#</th><th style={styles.th}>Satuan Pendidikan</th><th style={{...styles.th, textAlign: 'center'}}>Guru</th><th style={{...styles.th, textAlign: 'center'}}>Karya</th><th style={{...styles.th, textAlign: 'center'}}>Progress</th></tr>
                           </thead>
                           <tbody>
                               {schoolStats.map((s, i) => (
                                   <tr key={i}>
                                       <td style={{...styles.td, textAlign: 'center', fontWeight: 700, color: COLORS.slate400 }}>{i+1}</td>
                                       <td style={{...styles.td, fontWeight: 700, color: COLORS.slate800 }}>{s.name}</td>
                                       <td style={{...styles.td, textAlign: 'center'}}><span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{s.teacherCount}</span></td>
                                       <td style={{...styles.td, textAlign: 'center'}}><span style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>{s.mediaCount}</span></td>
                                       <td style={{...styles.td, width: '25%'}}>
                                           <div style={{ width: '100%', backgroundColor: COLORS.slate100, borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                               <div style={{ backgroundColor: COLORS.primary, height: '100%', width: `${s.percentage}%` }}></div>
                                           </div>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                        </table>
                    )}
                    
                    {activeTab === 'RANK_TEACHER' && (
                         <table style={styles.table}>
                            <thead>
                                <tr><th style={{...styles.th, textAlign: 'center', width: '40px'}}>#</th><th style={styles.th}>Nama Guru</th><th style={styles.th}>Sekolah</th><th style={{...styles.th, textAlign: 'center'}}>Total Karya</th></tr>
                            </thead>
                            <tbody>
                                {teacherStats.slice(0, 100).map((t, i) => (
                                    <tr key={i}>
                                        <td style={{...styles.td, textAlign: 'center'}}>
                                            {i < 3 ? <div style={{ width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, margin: '0 auto', backgroundColor: i===0?'#facc15':i===1?'#94a3b8':'#fb923c' }}>{i+1}</div> : <span style={{ color: COLORS.slate400, fontWeight: 700 }}>{i+1}</span>}
                                        </td>
                                        <td style={{...styles.td, fontWeight: 700, color: COLORS.slate800 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {t.name}
                                                {i < 3 && <Award size={14} color="#f59e0b" />}
                                            </div>
                                        </td>
                                        <td style={{...styles.td, fontSize: '0.75rem', color: COLORS.slate500, fontWeight: 700 }}>{t.school}</td>
                                        <td style={{...styles.td, textAlign: 'center'}}><span style={{ backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: 700, padding: '4px 12px', borderRadius: RADIUS.full }}>{t.count}</span></td>
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