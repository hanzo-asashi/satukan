import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Pencil, Trash, X, Calendar, CheckCircle2, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Period {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface IndexProps {
    periods: Period[];
    canManage: boolean;
}

export default function PeriodsIndex({ periods, canManage }: IndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredPeriods = periods.filter(period => {
        const matchesSearch = period.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = 
            statusFilter === 'all' ? true :
            statusFilter === 'active' ? period.is_active :
            !period.is_active;
        return matchesSearch && matchesStatus;
    });

    const totalItems = filteredPeriods.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPeriods.slice(indexOfFirstItem, indexOfLastItem);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
    };

    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: false,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/periods', {
            onSuccess: () => {
                toast.success('Periode survei berhasil ditambahkan.');
                setIsCreateOpen(false);
                reset();
            },
            onError: () => toast.error('Gagal menambahkan periode survei.')
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPeriod) return;

        patch(`/admin/periods/${editingPeriod.id}`, {
            onSuccess: () => {
                toast.success('Periode survei berhasil diperbarui.');
                setEditingPeriod(null);
                reset();
            },
            onError: () => toast.error('Gagal memperbarui periode survei.')
        });
    };

    const handleDelete = (period: Period) => {
        if (confirm(`Apakah Anda yakin ingin menghapus periode "${period.name}"? Seluruh data survei dan hasil kalkulasi pada periode ini akan dihapus permanen.`)) {
            destroy(`/admin/periods/${period.id}`, {
                onSuccess: () => toast.success('Periode survei berhasil dihapus.'),
                onError: () => toast.error('Gagal menghapus periode survei.')
            });
        }
    };

    const startEdit = (period: Period) => {
        setEditingPeriod(period);
        setData({
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date,
            is_active: period.is_active,
        });
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Kelola Periode Survei - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Periode Survei Nasional</h1>
                    <p className="text-sm text-gray-500">Kelola kuartal/semester penjadwalan survei dan pembatasan data IKM.</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => {
                            reset();
                            setIsCreateOpen(true);
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all gap-1.5"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Periode
                    </button>
                )}
            </div>

            {/* Main view grid */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Info Note */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-[#355C7D]/5 p-5 rounded-xl border border-[#355C7D]/10 space-y-3">
                        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 dark:text-white">
                            <CheckCircle2 className="h-5 w-5 text-[#355C7D]" />
                            Ketentuan Periode Aktif
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed dark:text-neutral-400">
                            Hanya boleh ada <strong>satu periode aktif</strong> dalam satu waktu. Ketika Anda mengaktifkan sebuah periode baru, sistem akan menonaktifkan periode aktif sebelumnya secara otomatis.
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed dark:text-neutral-400">
                            Responden masyarakat umum hanya dapat mengisi kuesioner survei yang ditautkan ke periode aktif saat ini.
                        </p>
                    </div>
                </div>

                {/* Table list */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama periode..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D]"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Arsip</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
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

                    {/* Table Card */}
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-neutral-800 text-xs font-bold text-gray-400 uppercase bg-gray-50/50 dark:bg-neutral-800/10">
                                        <th className="py-3.5 px-4">Nama Periode</th>
                                        <th className="py-3.5 px-4">Tanggal Pelaksanaan</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        {canManage && <th className="py-3.5 px-4 text-right">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? (
                                        currentItems.map((period) => (
                                            <tr key={period.id} className="border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50/30 dark:hover:bg-neutral-800/10 transition-all">
                                                <td className="py-4 px-4 font-bold text-gray-800 dark:text-gray-200">
                                                    {period.name}
                                                </td>
                                                <td className="py-4 px-4 text-xs text-gray-500">
                                                    {formatDate(period.start_date)} s/d {formatDate(period.end_date)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                                        period.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200'
                                                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                                                    }`}>
                                                        {period.is_active ? 'Aktif' : 'Arsip'}
                                                    </span>
                                                </td>
                                                {canManage && (
                                                    <td className="py-4 px-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => startEdit(period)}
                                                            className="inline-flex p-1.5 text-gray-400 hover:text-[#355C7D] rounded hover:bg-gray-100 transition-all cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(period)}
                                                            className="inline-flex p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-gray-100 transition-all cursor-pointer"
                                                            title="Hapus"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={canManage ? 4 : 3} className="text-center py-12 text-gray-400">
                                                <Calendar className="h-12 w-12 mx-auto stroke-1" />
                                                <p className="mt-2 text-sm">Tidak ada periode survei yang cocok.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-800/10 text-sm text-gray-500">
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
                    </div>
                </div>
            </div>

            {/* MODAL: CREATE FORM */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Plus className="h-5 w-5 text-[#355C7D]" />
                                Tambah Periode Survei
                            </h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Periode</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Triwulan III - 2026"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active_create"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-[#355C7D] focus:ring-[#355C7D]/20 rounded border-gray-300"
                                />
                                <label htmlFor="is_active_create" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Jadikan sebagai Periode Aktif
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT FORM */}
            {editingPeriod && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Pencil className="h-5 w-5 text-[#355C7D]" />
                                Edit Periode: {editingPeriod.name}
                            </h3>
                            <button onClick={() => setEditingPeriod(null)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Periode</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Triwulan III - 2026"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tanggal Selesai</label>
                                    <input
                                        type="date"
                                        required
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_active_edit"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-[#355C7D] focus:ring-[#355C7D]/20 rounded border-gray-300"
                                />
                                <label htmlFor="is_active_edit" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Jadikan sebagai Periode Aktif
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingPeriod(null)}
                                    className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

PeriodsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Periode Survei',
            href: '/admin/periods',
        },
    ],
};
