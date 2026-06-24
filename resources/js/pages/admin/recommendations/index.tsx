import { Head, useForm, useHttp } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, X, Landmark, ClipboardList, CheckCircle2, ChevronRight, Activity, Calendar, Search, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

interface FollowUp {
    id: number;
    recommendation_id: number;
    action_plan: string;
    progress_percentage: number;
    status: 'not_started' | 'in_progress' | 'completed';
    notes: string | null;
    deadline: string | null;
    completed_at: string | null;
}

interface Period {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
    opd: {
        name: string;
    };
}

interface Creator {
    name: string;
}

interface Recommendation {
    id: number;
    unit_id: number;
    period_id: number;
    content: string;
    created_at: string;
    unit: Unit;
    period: Period;
    creator: Creator | null;
    follow_ups: FollowUp[];
}

interface IndexProps {
    recommendations: Recommendation[];
    periods: Period[];
    units: Unit[];
}

export default function RecommendationsIndex({ recommendations, periods, units }: IndexProps) {
    const [isRecOpen, setIsRecOpen] = useState(false);
    const [addingFollowUpFor, setAddingFollowUpFor] = useState<Recommendation | null>(null);
    const [updatingFollowUp, setUpdatingFollowUp] = useState<FollowUp | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [unitFilter, setUnitFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredRecommendations = recommendations.filter(rec => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            rec.content.toLowerCase().includes(query) ||
            rec.unit.name.toLowerCase().includes(query) ||
            rec.unit.opd.name.toLowerCase().includes(query) ||
            (rec.creator && rec.creator.name.toLowerCase().includes(query));
            
        const matchesPeriod = periodFilter === 'all' ? true : rec.period_id.toString() === periodFilter;
        const matchesUnit = unitFilter === 'all' ? true : rec.unit_id.toString() === unitFilter;

        return matchesSearch && matchesPeriod && matchesUnit;
    });

    const totalItems = filteredRecommendations.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecommendations.slice(indexOfFirstItem, indexOfLastItem);

    const recForm = useForm({
        unit_id: units[0]?.id || '',
        period_id: periods[0]?.id || '',
        content: '',
        action_plans: [] as string[],
    });

    const fuForm = useForm({
        recommendation_id: '',
        action_plan: '',
        deadline: '',
    });

    const updateForm = useForm({
        progress_percentage: 0,
        status: 'not_started' as 'not_started' | 'in_progress' | 'completed',
        notes: '',
    });

    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [suggestedPlans, setSuggestedPlans] = useState<string[]>([]);
    const [checkedPlans, setCheckedPlans] = useState<Record<string, boolean>>({});
    const [indicatorInfo, setIndicatorInfo] = useState<{
        code: string;
        name: string;
        score: number;
        is_fallback: boolean;
    } | null>(null);

    const aiHttp = useHttp({
        unit_id: '',
        period_id: '',
    });

    const handleGenerateAi = () => {
        setIsGeneratingAi(true);
        aiHttp.setData({
            unit_id: recForm.data.unit_id.toString(),
            period_id: recForm.data.period_id.toString(),
        });
        
        aiHttp.post('/admin/recommendations/generate-ai', {
            onSuccess: (res: any) => {
                setIsGeneratingAi(false);
                if (res) {
                    recForm.setData({
                        ...recForm.data,
                        content: res.recommendation || '',
                        action_plans: res.action_plans || [],
                    });
                    
                    if (res.action_plans) {
                        setSuggestedPlans(res.action_plans);
                        const initialChecked: Record<string, boolean> = {};
                        res.action_plans.forEach((plan: string) => {
                            initialChecked[plan] = true;
                        });
                        setCheckedPlans(initialChecked);
                    } else {
                        setSuggestedPlans([]);
                        setCheckedPlans({});
                    }
                    
                    if (res.indicator_code) {
                        setIndicatorInfo({
                            code: res.indicator_code,
                            name: res.indicator_name,
                            score: res.score,
                            is_fallback: res.is_fallback,
                        });
                    } else {
                        setIndicatorInfo(null);
                    }
                    toast.success('Rekomendasi AI berhasil didapatkan!');
                }
            },
            onError: () => {
                setIsGeneratingAi(false);
                toast.error('Gagal mendapatkan rekomendasi AI.');
            }
        });
    };

    const handlePlanToggle = (plan: string) => {
        const nextChecked = { ...checkedPlans, [plan]: !checkedPlans[plan] };
        setCheckedPlans(nextChecked);
        
        const nextPlans = Object.keys(nextChecked).filter(k => nextChecked[k]);
        recForm.setData('action_plans', nextPlans);
    };

    const handleRecSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        recForm.post('/admin/recommendations', {
            onSuccess: () => {
                toast.success('Rekomendasi perbaikan berhasil disimpan.');
                setIsRecOpen(false);
                recForm.reset();
            },
            onError: () => toast.error('Gagal menyimpan rekomendasi.')
        });
    };

    const handleFuSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fuForm.post('/admin/recommendations/follow-up', {
            onSuccess: () => {
                toast.success('Rencana aksi tindak lanjut berhasil ditambahkan.');
                setAddingFollowUpFor(null);
                fuForm.reset();
            },
            onError: () => toast.error('Gagal menambahkan rencana aksi.')
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!updatingFollowUp) return;

        updateForm.patch(`/admin/recommendations/follow-up/${updatingFollowUp.id}`, {
            onSuccess: () => {
                toast.success('Kemajuan tindak lanjut berhasil diperbarui.');
                setUpdatingFollowUp(null);
                updateForm.reset();
            },
            onError: () => toast.error('Gagal memperbarui kemajuan.')
        });
    };

    const startAddFollowUp = (rec: Recommendation) => {
        setAddingFollowUpFor(rec);
        fuForm.setData('recommendation_id', rec.id.toString());
    };

    const startUpdateFollowUp = (fu: FollowUp) => {
        setUpdatingFollowUp(fu);
        updateForm.setData({
            progress_percentage: fu.progress_percentage,
            status: fu.status,
            notes: fu.notes || '',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200';
            default: return 'bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400 border-gray-200';
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Rekomendasi & Tindak Lanjut - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Rencana Tindak Lanjut (RTL)</h1>
                    <p className="text-sm text-gray-500">Monitor penyusunan rekomendasi perbaikan dan progress pengerjaan rencana aksi tindak lanjut.</p>
                </div>
                <button
                    onClick={() => {
                        recForm.reset();
                        setSuggestedPlans([]);
                        setCheckedPlans({});
                        setIndicatorInfo(null);
                        setIsRecOpen(true);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    Buat Rekomendasi
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari konten, unit, OPD..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                            />
                        </div>
                        <select
                            value={periodFilter}
                            onChange={(e) => {
                                setPeriodFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]"
                        >
                            <option value="all">Semua Periode</option>
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <select
                            value={unitFilter}
                            onChange={(e) => {
                                setUnitFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]"
                        >
                            <option value="all">Semua Unit</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 self-end md:self-auto">
                        <span>Tampilkan</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-sm dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entri</span>
                    </div>
                </div>
            </div>

            {/* Recommendations Accordion/List Cards */}
            <div className="space-y-4">
                {currentItems.length > 0 ? (
                    currentItems.map((rec) => (
                        <div key={rec.id} className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden grid lg:grid-cols-12">
                            {/* Recommendation Info Left Panel */}
                            <div className="lg:col-span-5 p-6 bg-gray-50/50 dark:bg-neutral-800/10 border-r border-gray-100 dark:border-neutral-800 space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] bg-[#355C7D]/10 text-[#355C7D] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        {rec.period.name}
                                    </span>
                                    <h3 className="font-extrabold text-gray-800 dark:text-gray-200 text-base">{rec.unit.name}</h3>
                                    <p className="text-xs text-gray-400 dark:text-neutral-500">{rec.unit.opd.name}</p>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Rekomendasi Analitis:</span>
                                    <p className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed italic">"{rec.content}"</p>
                                </div>

                                <div className="pt-2 text-[10px] text-gray-400 dark:text-neutral-550 border-t border-gray-100 dark:border-neutral-800 flex justify-between">
                                    <span>Oleh: {rec.creator?.name || 'Sistem'}</span>
                                    <span>Tgl: {formatDate(rec.created_at)}</span>
                                </div>
                            </div>

                            {/* Action Plans Right Panel */}
                            <div className="lg:col-span-7 p-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-neutral-500">Rencana Aksi Pengerjaan (Tindak Lanjut)</h4>
                                    <button
                                        onClick={() => startAddFollowUp(rec)}
                                        className="text-xs font-bold text-[#355C7D] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                    >
                                        <Plus className="h-3 w-3" /> Tambah Rencana Aksi
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                    {rec.follow_ups.length > 0 ? (
                                        rec.follow_ups.map((fu) => (
                                            <div key={fu.id} className="p-3 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-lg shadow-sm flex items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h5 className="font-bold text-xs text-gray-800 dark:text-gray-200 leading-normal">
                                                        {fu.action_plan}
                                                    </h5>
                                                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Batas: {fu.deadline ? formatDate(fu.deadline) : 'Tidak ada'}
                                                        </span>
                                                        <span>Progress: {fu.progress_percentage}%</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(fu.status)}`}>
                                                        {fu.status === 'completed' ? 'Selesai' : fu.status === 'in_progress' ? 'Proses' : 'Menunggu'}
                                                    </span>
                                                    <button
                                                        onClick={() => startUpdateFollowUp(fu)}
                                                        className="text-xs font-bold text-gray-400 hover:text-[#355C7D] shrink-0 cursor-pointer"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-xs">
                                            Belum ada rencana aksi tindak lanjut yang diajukan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 text-gray-400">
                        <ClipboardList className="h-16 w-16 mx-auto stroke-1" />
                        <h3 className="font-bold text-gray-700 dark:text-gray-300 mt-4">Belum Ada Rekomendasi</h3>
                        <p className="text-sm text-gray-400 dark:text-neutral-500 mt-2 max-w-xs mx-auto">
                            Tidak ada usulan rekomendasi tindak lanjut pelayanan publik yang cocok.
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border border-gray-100 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 text-sm text-gray-500 shadow-sm mt-4">
                    <div>
                        Menampilkan <span className="font-semibold text-gray-700 dark:text-gray-300">{indexOfFirstItem + 1}</span> hingga <span className="font-semibold text-gray-700 dark:text-gray-300">{Math.min(indexOfLastItem, totalItems)}</span> dari <span className="font-semibold text-gray-700 dark:text-gray-300">{totalItems}</span> entri
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                                    currentPage === page
                                        ? 'bg-[#355C7D] text-white shadow-sm'
                                        : 'border border-gray-200 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="inline-flex items-center justify-center p-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL: ADD RECOMMENDATION */}
            {isRecOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Plus className="h-5 w-5 text-[#355C7D]" />
                                Usulkan Rekomendasi Baru
                            </h3>
                            <button onClick={() => setIsRecOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRecSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pilih Unit Layanan</label>
                                    <select
                                        value={recForm.data.unit_id}
                                        onChange={e => recForm.setData('unit_id', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                    >
                                        {units.map(unit => (
                                            <option key={unit.id} value={unit.id}>{unit.opd.name} - {unit.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Pilih Periode SKM</label>
                                    <select
                                        value={recForm.data.period_id}
                                        onChange={e => recForm.setData('period_id', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                    >
                                        {periods.map(period => (
                                            <option key={period.id} value={period.id}>{period.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Detail Rekomendasi Perbaikan</label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateAi}
                                        disabled={isGeneratingAi}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#355C7D] hover:text-[#284964] disabled:opacity-50 cursor-pointer"
                                    >
                                        {isGeneratingAi ? 'Memproses...' : '⚡ Dapatkan Rekomendasi AI'}
                                    </button>
                                </div>
                                <textarea
                                    rows={4}
                                    required
                                    value={recForm.data.content}
                                    onChange={e => recForm.setData('content', e.target.value)}
                                    placeholder="Berdasarkan evaluasi triwulan unsur Waktu Penyelesaian (U3) bernilai rendah, direkomendasikan penambahan personil loket di jam istirahat..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            {indicatorInfo && (
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg space-y-1">
                                    <div className="flex justify-between text-[11px] font-bold text-amber-800 dark:text-amber-400">
                                        <span>Indikator Terendah: {indicatorInfo.name} ({indicatorInfo.code})</span>
                                        <span>Skor: {indicatorInfo.score.toFixed(2)} / 4.0</span>
                                    </div>
                                    <p className="text-[10px] text-amber-700 dark:text-amber-500">
                                        Sumber: {indicatorInfo.is_fallback ? 'Analisis Aturan Permen PANRB 14/2017' : 'Generasi Cerdas OpenAI'}
                                    </p>
                                </div>
                            )}

                            {suggestedPlans.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rencana Aksi yang Disarankan AI (Otomatis Ditambahkan):</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto p-1 border border-gray-200 rounded-lg dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900">
                                        {suggestedPlans.map((plan, idx) => (
                                            <label key={idx} className="flex items-start gap-2.5 p-2 rounded hover:bg-gray-100 dark:hover:bg-neutral-850 cursor-pointer text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={!!checkedPlans[plan]}
                                                    onChange={() => handlePlanToggle(plan)}
                                                    className="mt-0.5 rounded border-gray-300 text-[#355C7D] focus:ring-[#355C7D]"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">{plan}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsRecOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={recForm.processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    {recForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: ADD ACTION PLAN (FOLLOW UP) */}
            {addingFollowUpFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">Tambah Rencana Aksi</h3>
                                <p className="text-xs text-gray-400">{addingFollowUpFor.unit.name}</p>
                            </div>
                            <button onClick={() => setAddingFollowUpFor(null)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleFuSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Deskripsi Rencana Tindak Lanjut</label>
                                <input
                                    type="text"
                                    required
                                    value={fuForm.data.action_plan}
                                    onChange={e => fuForm.setData('action_plan', e.target.value)}
                                    placeholder="Mengadakan koordinasi internal & shifting jam istirahat"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Batas Waktu (Deadline)</label>
                                <input
                                    type="date"
                                    required
                                    value={fuForm.data.deadline}
                                    onChange={e => fuForm.setData('deadline', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setAddingFollowUpFor(null)}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={fuForm.processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    {fuForm.processing ? 'Menambahkan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: UPDATE FOLLOW UP PROGRESS */}
            {updatingFollowUp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base">Perbarui Progress Tindak Lanjut</h3>
                                <p className="text-xs text-gray-400">{updatingFollowUp.action_plan}</p>
                            </div>
                            <button onClick={() => setUpdatingFollowUp(null)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Status Pengerjaan</label>
                                <select
                                    value={updateForm.data.status}
                                    onChange={e => {
                                        const val = e.target.value as any;
                                        updateForm.setData({
                                            ...updateForm.data,
                                            status: val,
                                            progress_percentage: val === 'completed' ? 100 : updateForm.data.progress_percentage
                                        });
                                    }}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                >
                                    <option value="not_started">Menunggu (Not Started)</option>
                                    <option value="in_progress">Pengerjaan (In Progress)</option>
                                    <option value="completed">Selesai (Completed)</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-semibold">
                                    <label className="text-gray-700 dark:text-gray-300">Kemajuan Progress (%)</label>
                                    <span className="text-[#355C7D]">{updateForm.data.progress_percentage}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="10"
                                    disabled={updateForm.data.status === 'completed'}
                                    value={updateForm.data.progress_percentage}
                                    onChange={e => updateForm.setData('progress_percentage', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Catatan Hambatan / Solusi</label>
                                <textarea
                                    rows={3}
                                    value={updateForm.data.notes}
                                    onChange={e => updateForm.setData('notes', e.target.value)}
                                    placeholder="Tulis hambatan lapangan atau catatan penyelesaian..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setUpdatingFollowUp(null)}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateForm.processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    {updateForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

RecommendationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Rekomendasi & RTL',
            href: '/admin/recommendations',
        },
    ],
};
