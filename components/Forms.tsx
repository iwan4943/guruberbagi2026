import React, { useState, useEffect } from 'react';
import { User, MediaItem, AppSettings } from '../types';
import { apiService } from '../services/apiService';
import { X, RefreshCw } from 'lucide-react';
import { COLORS, RADIUS, SHADOWS } from '../constants';

interface MediaFormProps {
    user: User;
    settings: AppSettings | null;
    initialData?: MediaItem;
    onClose: () => void;
    onSuccess: () => void;
}

export const MediaForm: React.FC<MediaFormProps> = ({ user, settings, initialData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        judul: '',
        mapel: '',
        jenis: '',
        fase: '',
        sem: '',
        kaihType: '',
        isKaih: false,
        sourceType: 'LINK',
        link: '',
        linkStory: '',
        html: '',
    });

    useEffect(() => {
        if (initialData) {
            const isStory = initialData.linkContent.includes('g.co') || initialData.linkContent.includes('gemini');
            const isHtml = initialData.htmlContent.length > 10;
            const sourceType = isHtml ? 'HTML' : (isStory ? 'STORY' : 'LINK');
            
            setFormData({
                judul: initialData.title,
                mapel: initialData.mapel,
                jenis: initialData.type,
                fase: initialData.fase,
                sem: initialData.semester,
                kaihType: initialData.kaih,
                isKaih: !!initialData.kaih,
                sourceType,
                link: (!isStory && !isHtml) ? initialData.linkContent : '',
                linkStory: isStory ? initialData.linkContent : '',
                html: isHtml ? initialData.htmlContent : '',
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            id: initialData?.id,
            user: user.name,
            school: user.school || "-",
            judul: formData.judul,
            mapel: formData.mapel,
            jenis: formData.jenis,
            fase: formData.fase,
            sem: formData.sem,
            kaih: formData.isKaih ? formData.kaihType : "",
            link: formData.sourceType === 'STORY' ? formData.linkStory : formData.link,
            html: formData.sourceType === 'HTML' ? formData.html : ""
        };

        try {
            await apiService.addMedia(payload);
            onSuccess();
        } catch (error) {
            alert("Gagal menyimpan: " + error);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed' as const,
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            padding: '16px',
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: SHADOWS.lg,
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto' as const,
            display: 'flex',
            flexDirection: 'row' as const, // Might need wrap for mobile
            flexWrap: 'wrap' as const,
        },
        formSide: {
            flex: '3',
            minWidth: '300px',
            padding: '24px',
            borderRight: `1px solid ${COLORS.slate100}`,
        },
        previewSide: {
            flex: '2',
            minWidth: '300px',
            backgroundColor: COLORS.slate50,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
        },
        title: {
            fontWeight: 800,
            color: COLORS.primary,
            fontSize: '1.125rem',
            margin: 0,
        },
        label: {
            display: 'block',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            color: COLORS.slate500,
            marginBottom: '4px',
        },
        input: {
            width: '100%',
            padding: '8px',
            backgroundColor: COLORS.slate50,
            border: `1px solid ${COLORS.slate300}`,
            borderRadius: RADIUS.lg,
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: COLORS.slate800,
            marginBottom: '16px',
        },
        row: {
            display: 'flex',
            gap: '16px',
            marginBottom: '4px'
        },
        select: {
            width: '100%',
            padding: '8px',
            border: `1px solid ${COLORS.slate300}`,
            borderRadius: RADIUS.lg,
            fontSize: '0.875rem',
        },
        kaihBox: {
            backgroundColor: '#fffbeb', // amber-50
            border: '1px solid #fef3c7',
            borderRadius: RADIUS.xl,
            padding: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        typeBtn: (active: boolean) => ({
            padding: '6px 12px',
            borderRadius: RADIUS.lg,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            border: `1px solid ${active ? COLORS.primary : COLORS.slate200}`,
            backgroundColor: active ? COLORS.primary : 'white',
            color: active ? 'white' : COLORS.slate500,
            cursor: 'pointer',
        }),
        btnCancel: {
            padding: '8px 16px',
            borderRadius: RADIUS.full,
            color: COLORS.slate500,
            fontWeight: 'bold',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '0.875rem',
        },
        btnSave: {
            padding: '8px 24px',
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.primary,
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            boxShadow: SHADOWS.md,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.5 : 1,
            fontSize: '0.875rem',
        }
    };

    const renderSelect = (label: string, field: keyof typeof formData, options: string[] = []) => (
        <div style={{ flex: 1, marginBottom: '12px' }}>
            <label style={styles.label}>{label}</label>
            <select 
                style={styles.select}
                value={formData[field] as string}
                onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                required
            >
                <option value="">Pilih...</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
                <option value="LAINNYA">LAINNYA (Tulis Sendiri)</option>
            </select>
        </div>
    );

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                {/* Form Side */}
                <div style={styles.formSide}>
                    <div style={styles.header}>
                        <h3 style={styles.title}>
                            {initialData ? 'Edit Karya' : 'Bagikan Karya'}
                        </h3>
                        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: COLORS.slate400 }}>
                            <X size={20}/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={styles.label}>Judul Karya <span style={{ color: COLORS.red500 }}>*</span></label>
                            <input 
                                type="text" 
                                style={styles.input}
                                value={formData.judul}
                                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                                required
                            />
                        </div>

                        <div style={styles.row}>
                            {renderSelect('Mata Pelajaran', 'mapel', settings?.subjects)}
                            {renderSelect('Jenis Media', 'jenis', settings?.types)}
                        </div>
                        <div style={styles.row}>
                            {renderSelect('Fase / Kelas', 'fase', settings?.phases)}
                            {renderSelect('Semester', 'sem', settings?.semesters)}
                        </div>

                        {/* KAIH Section */}
                        <div style={styles.kaihBox}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#92400e' }}>Program KAIH?</span>
                                <span style={{ fontSize: '0.65rem', color: '#d97706' }}>Kebiasaan Anak Indonesia Hebat</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {formData.isKaih && (
                                    <select 
                                        style={{ fontSize: '0.75rem', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        value={formData.kaihType}
                                        onChange={(e) => setFormData({...formData, kaihType: e.target.value})}
                                    >
                                        <option value="">Pilih...</option>
                                        {settings?.kaih?.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                )}
                                <input 
                                    type="checkbox" 
                                    style={{ width: '20px', height: '20px' }}
                                    checked={formData.isKaih}
                                    onChange={(e) => setFormData({...formData, isKaih: e.target.checked})}
                                />
                            </div>
                        </div>

                        {/* Content Source */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{...styles.label, marginBottom: '8px'}}>Tipe Konten</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {['LINK', 'STORY', 'HTML'].map(t => (
                                    <button 
                                        type="button"
                                        key={t}
                                        onClick={() => setFormData({...formData, sourceType: t})}
                                        style={styles.typeBtn(formData.sourceType === t)}
                                    >
                                        {t === 'LINK' && '🔗 Link Umum'}
                                        {t === 'STORY' && '📖 Storybook'}
                                        {t === 'HTML' && '💻 Embed Code'}
                                    </button>
                                ))}
                            </div>

                            {formData.sourceType === 'LINK' && (
                                <input type="url" placeholder="Paste link Youtube / Drive / Quizizz..." style={styles.input} value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                            )}
                            {formData.sourceType === 'STORY' && (
                                <input type="url" placeholder="Paste link Gemini / Storybook..." style={{...styles.input, backgroundColor: '#eff6ff', borderColor: '#bfdbfe'}} value={formData.linkStory} onChange={e => setFormData({...formData, linkStory: e.target.value})} />
                            )}
                            {formData.sourceType === 'HTML' && (
                                <textarea rows={3} placeholder="<iframe src='...'></iframe>" style={{...styles.input, fontFamily: 'monospace', fontSize: '0.75rem'}} value={formData.html} onChange={e => setFormData({...formData, html: e.target.value})} />
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                            <button type="button" onClick={onClose} style={styles.btnCancel}>Batal</button>
                            <button disabled={loading} type="submit" style={styles.btnSave}>
                                {loading && <RefreshCw className="animate-spin" size={16} />}
                                SIMPAN
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Side