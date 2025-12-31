import React, { useState, useEffect } from 'react';
import { User, MediaItem, AppSettings } from '../types';
import { apiService } from '../services/apiService';
import { X, Save, RefreshCw } from 'lucide-react';

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
        sourceType: 'LINK', // LINK, STORY, HTML
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
            id: initialData?.id, // If exists, it's edit
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

    // Helper to render select with "Lainnya" option (simplified for this demo to just selects)
    const renderSelect = (label: string, field: keyof typeof formData, options: string[] = []) => (
        <div className="mb-3">
            <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
            <select 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
                {/* Form Side */}
                <div className="p-6 md:w-3/5 border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-extrabold text-primary text-lg">
                            {initialData ? 'Edit Karya' : 'Bagikan Karya'}
                        </h3>
                        <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Judul Karya <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-primary outline-none"
                                value={formData.judul}
                                onChange={(e) => setFormData({...formData, judul: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {renderSelect('Mata Pelajaran', 'mapel', settings?.subjects)}
                            {renderSelect('Jenis Media', 'jenis', settings?.types)}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {renderSelect('Fase / Kelas', 'fase', settings?.phases)}
                            {renderSelect('Semester', 'sem', settings?.semesters)}
                        </div>

                        {/* KAIH Section */}
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex items-center justify-between">
                            <div>
                                <span className="block text-xs font-bold text-amber-800">Program KAIH?</span>
                                <span className="text-[0.65rem] text-amber-600">Kebiasaan Anak Indonesia Hebat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {formData.isKaih && (
                                    <select 
                                        className="text-xs p-1 border rounded bg-white"
                                        value={formData.kaihType}
                                        onChange={(e) => setFormData({...formData, kaihType: e.target.value})}
                                    >
                                        <option value="">Pilih...</option>
                                        {settings?.kaih?.map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                )}
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-primary"
                                    checked={formData.isKaih}
                                    onChange={(e) => setFormData({...formData, isKaih: e.target.checked})}
                                />
                            </div>
                        </div>

                        {/* Content Source */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-500 mb-2">Tipe Konten</label>
                            <div className="flex gap-2 mb-2">
                                {['LINK', 'STORY', 'HTML'].map(t => (
                                    <button 
                                        type="button"
                                        key={t}
                                        onClick={() => setFormData({...formData, sourceType: t})}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${formData.sourceType === t ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200'}`}
                                    >
                                        {t === 'LINK' && '🔗 Link Umum'}
                                        {t === 'STORY' && '📖 Storybook'}
                                        {t === 'HTML' && '💻 Embed Code'}
                                    </button>
                                ))}
                            </div>

                            {formData.sourceType === 'LINK' && (
                                <input type="url" placeholder="Paste link Youtube / Drive / Quizizz..." className="w-full p-2 text-sm border rounded-lg" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                            )}
                            {formData.sourceType === 'STORY' && (
                                <input type="url" placeholder="Paste link Gemini / Storybook..." className="w-full p-2 text-sm border border-blue-300 rounded-lg bg-blue-50" value={formData.linkStory} onChange={e => setFormData({...formData, linkStory: e.target.value})} />
                            )}
                            {formData.sourceType === 'HTML' && (
                                <textarea rows={3} placeholder="<iframe src='...'></iframe>" className="w-full p-2 text-xs font-mono border rounded-lg bg-slate-50" value={formData.html} onChange={e => setFormData({...formData, html: e.target.value})} />
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-slate-500 font-bold hover:bg-slate-100 text-sm">Batal</button>
                            <button disabled={loading} type="submit" className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:bg-primary-dark shadow-md disabled:opacity-50 flex items-center gap-2">
                                {loading && <RefreshCw className="animate-spin" size={16} />}
                                SIMPAN
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Side */}
                <div className="md:w-2/5 bg-slate-50 p-6 flex flex-col items-center justify-center border-t md:border-t-0">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Preview</span>
                    <div className="w-full aspect-video bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
                         <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-bold">
                             Preview Content
                         </div>
                         {/* Simple Preview Logic */}
                         {formData.sourceType === 'LINK' && formData.link && formData.link.includes('youtube') && (
                             <iframe src={`https://www.youtube.com/embed/${formData.link.split('v=')[1]}`} className="relative z-10 w-full h-full" />
                         )}
                    </div>
                    <p className="text-center text-[0.65rem] text-slate-400 mt-4 px-4">
                        Pastikan link yang anda masukkan dapat diakses publik (tidak diprivate).
                    </p>
                </div>
            </div>
        </div>
    );
};
