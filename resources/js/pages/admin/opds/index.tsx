import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Building, Plus, Pencil, Trash, X, Landmark, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Opd {
    id: number;
    name: string;
    code: string;
    logo_url: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    units_count: number;
}

interface IndexProps {
    opds: Opd[];
}

export default function OpdsIndex({ opds }: IndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOpd, setEditingOpd] = useState<Opd | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredOpds = opds.filter(opd => {
        const query = searchQuery.toLowerCase();
        return (
            opd.name.toLowerCase().includes(query) ||
            opd.code.toLowerCase().includes(query) ||
            (opd.email && opd.email.toLowerCase().includes(query)) ||
            (opd.phone && opd.phone.toLowerCase().includes(query))
        );
    });

    const totalItems = filteredOpds.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOpds.slice(indexOfFirstItem, indexOfLastItem);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const { data, setData, post, patch, delete: destroy, processing, reset, errors } = useForm({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        logo_url: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/opds', {
            onSuccess: () => {
                toast.success('OPD berhasil ditambahkan.');
                setIsCreateOpen(false);
                reset();
            },
            onError: () => toast.error('Gagal menambahkan OPD. Cek kembali form Anda.')
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOpd) return;

        patch(`/admin/opds/${editingOpd.id}`, {
            onSuccess: () => {
                toast.success('OPD berhasil diperbarui.');
                setEditingOpd(null);
                reset();
            },
            onError: () => toast.error('Gagal memperbarui OPD. Cek kembali form Anda.')
        });
    };

    const handleDelete = (opd: Opd) => {
        if (confirm(`Apakah Anda yakin ingin menghapus OPD "${opd.name}"? Seluruh unit layanan di bawah OPD ini juga akan dihapus.`)) {
            destroy(`/admin/opds/${opd.id}`, {
                onSuccess: () => toast.success('OPD berhasil dihapus.'),
                onError: () => toast.error('Gagal menghapus OPD.')
            });
        }
    };

    const startEdit = (opd: Opd) => {
        setEditingOpd(opd);
        setData({
            name: opd.name,
            code: opd.code,
            address: opd.address || '',
            phone: opd.phone || '',
            email: opd.email || '',
            logo_url: opd.logo_url || '',
        });
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Kelola OPD - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Organisasi Perangkat Daerah (OPD)</h1>
                    <p className="text-sm text-gray-500">Kelola daftar instansi kedinasan regional penyelenggara pelayanan publik.</p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setIsCreateOpen(true);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all gap-1.5"
                >
                    <Plus className="h-4 w-4" />
                    Tambah OPD
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau kode OPD..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                    />
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
                                <th className="py-3.5 px-4">Nama OPD</th>
                                <th className="py-3.5 px-4">Kode</th>
                                <th className="py-3.5 px-4">Kontak</th>
                                <th className="py-3.5 px-4">Jumlah Unit</th>
                                <th className="py-3.5 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((opd) => (
                                    <tr key={opd.id} className="border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50/30 dark:hover:bg-neutral-800/10 transition-all">
                                        <td className="py-4 px-4 font-bold text-gray-800 dark:text-gray-200">
                                            {opd.name}
                                        </td>
                                        <td className="py-4 px-4 text-xs font-semibold text-gray-500">
                                            {opd.code}
                                        </td>
                                        <td className="py-4 px-4 text-xs text-gray-500 space-y-0.5">
                                            <div>Telp: {opd.phone || '-'}</div>
                                            <div>Email: {opd.email || '-'}</div>
                                        </td>
                                        <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
                                            {opd.units_count} Unit Layanan
                                        </td>
                                        <td className="py-4 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => startEdit(opd)}
                                                className="inline-flex p-1.5 text-gray-400 hover:text-[#355C7D] rounded hover:bg-gray-100 transition-all cursor-pointer"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(opd)}
                                                className="inline-flex p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-gray-100 transition-all cursor-pointer"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-400">
                                        <Building className="h-12 w-12 mx-auto stroke-1" />
                                        <p className="mt-2 text-sm">Tidak ada data OPD yang cocok.</p>
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

            {/* MODAL: CREATE FORM */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Plus className="h-5 w-5 text-[#355C7D]" />
                                Tambah OPD Baru
                            </h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Instansi / OPD</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Dinas Kependudukan dan Pencatatan Sipil"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Kode Unik OPD</label>
                                <input
                                    type="text"
                                    required
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                                    placeholder="DISDUKCAPIL"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                                {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Telepon</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="021-XXXXXXX"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Instansi</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="dinas@satukan.go.id"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Alamat Kantor</label>
                                <textarea
                                    rows={3}
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Jl. Raya Pemerintahan No. 12..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
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
            {editingOpd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-gray-100 dark:border-neutral-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-5 bg-gray-50/50 dark:bg-neutral-800/10">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <Pencil className="h-5 w-5 text-[#355C7D]" />
                                Edit OPD: {editingOpd.name}
                            </h3>
                            <button onClick={() => setEditingOpd(null)} className="text-gray-400 hover:text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Instansi / OPD</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Dinas Kependudukan dan Pencatatan Sipil"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Kode Unik OPD</label>
                                <input
                                    type="text"
                                    required
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                                    placeholder="DISDUKCAPIL"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                                {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Telepon</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="021-XXXXXXX"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Instansi</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="dinas@satukan.go.id"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Alamat Kantor</label>
                                <textarea
                                    rows={3}
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Jl. Raya Pemerintahan No. 12..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingOpd(null)}
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

OpdsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola OPD',
            href: '/admin/opds',
        },
    ],
};
