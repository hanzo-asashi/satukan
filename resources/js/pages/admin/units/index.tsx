import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    Pencil,
    Trash,
    X,
    Landmark,
    QrCode,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Opd {
    id: number;
    name: string;
    code: string;
}

interface Unit {
    id: number;
    opd_id: number;
    name: string;
    code: string;
    description: string | null;
    opd: Opd;
}

interface IndexProps {
    units: Unit[];
    opds: Opd[];
}

export default function UnitsIndex({ units, opds }: IndexProps) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles[0]?.slug === 'superadmin';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOpdId, setSelectedOpdId] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Search and Filter
    const filteredUnits = units.filter((unit) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            unit.name.toLowerCase().includes(query) ||
            unit.code.toLowerCase().includes(query) ||
            (unit.description &&
                unit.description.toLowerCase().includes(query)) ||
            unit.opd.name.toLowerCase().includes(query);

        const matchesOpd =
            selectedOpdId === '' || unit.opd_id.toString() === selectedOpdId;

        return matchesSearch && matchesOpd;
    });

    // Pagination Calculations
    const totalItems = filteredUnits.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleOpdFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOpdId(e.target.value);
        setCurrentPage(1);
    };

    const {
        data,
        setData,
        post,
        patch,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        opd_id: opds[0]?.id || '',
        name: '',
        code: '',
        description: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/units', {
            onSuccess: () => {
                toast.success('Unit layanan berhasil ditambahkan.');
                setIsCreateOpen(false);
                reset();
            },
            onError: () =>
                toast.error('Gagal menambahkan unit. Cek kembali form Anda.'),
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUnit) {
            return;
        }

        patch(`/admin/units/${editingUnit.id}`, {
            onSuccess: () => {
                toast.success('Unit layanan berhasil diperbarui.');
                setEditingUnit(null);
                reset();
            },
            onError: () =>
                toast.error('Gagal memperbarui unit. Cek kembali form Anda.'),
        });
    };

    const handleDelete = (unit: Unit) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus unit layanan "${unit.name}"?`,
            )
        ) {
            destroy(`/admin/units/${unit.id}`, {
                onSuccess: () =>
                    toast.success('Unit layanan berhasil dihapus.'),
                onError: () => toast.error('Gagal menghapus unit layanan.'),
            });
        }
    };

    const startEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setData({
            opd_id: unit.opd_id,
            name: unit.name,
            code: unit.code,
            description: unit.description || '',
        });
    };

    return (
        <div className="space-y-6 p-6">
            <Head title="Kelola Unit Layanan - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Unit Pelayanan Publik (Layanan)
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola unit loket pelayanan publik yang dievaluasi
                        indeks kepuasannya.
                    </p>
                </div>
                <button
                    onClick={() => {
                        reset();
                        setIsCreateOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Unit
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center md:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau kode unit..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                    </div>
                    {isSuperAdmin && (
                        <select
                            value={selectedOpdId}
                            onChange={handleOpdFilterChange}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            <option value="">Semua OPD</option>
                            {opds.map((opd) => (
                                <option key={opd.id} value={opd.id}>
                                    {opd.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-2 self-end text-sm text-gray-500 md:self-auto">
                    <span>Tampilkan</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="rounded-lg border border-gray-200 px-2 py-1 text-sm focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800"
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
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase dark:border-neutral-800 dark:bg-neutral-800/10">
                                <th className="px-4 py-3.5">
                                    Nama Unit Layanan
                                </th>
                                <th className="px-4 py-3.5">Kode Unit</th>
                                {isSuperAdmin && (
                                    <th className="px-4 py-3.5">Parent OPD</th>
                                )}
                                <th className="px-4 py-3.5">Deskripsi</th>
                                <th className="px-4 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((unit) => (
                                    <tr
                                        key={unit.id}
                                        className="border-b border-gray-50 transition-all hover:bg-gray-50/30 dark:border-neutral-800 dark:hover:bg-neutral-800/10"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-800 dark:text-gray-200">
                                                {unit.name}
                                            </div>
                                            {!isSuperAdmin && (
                                                <div className="text-[10px] text-gray-400">
                                                    {unit.opd.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-semibold text-gray-500">
                                            {unit.code}
                                        </td>
                                        {isSuperAdmin && (
                                            <td className="px-4 py-4 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                {unit.opd.name}
                                            </td>
                                        )}
                                        <td className="max-w-xs truncate px-4 py-4 text-xs text-gray-500">
                                            {unit.description || '-'}
                                        </td>
                                        <td className="space-x-2 px-4 py-4 text-right">
                                            <Link
                                                href={`/admin/units/${unit.id}/qr`}
                                                className="inline-flex cursor-pointer rounded p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-blue-600"
                                                title="Generate Kode QR Survei"
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => startEdit(unit)}
                                                className="inline-flex cursor-pointer rounded p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-[#355C7D]"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(unit)
                                                }
                                                className="inline-flex cursor-pointer rounded p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-rose-600"
                                                title="Hapus"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={isSuperAdmin ? 5 : 4}
                                        className="py-12 text-center text-gray-400"
                                    >
                                        <Landmark className="mx-auto h-12 w-12 stroke-1" />
                                        <p className="mt-2 text-sm">
                                            Tidak ada unit layanan yang cocok.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-500 sm:flex-row dark:border-neutral-800 dark:bg-neutral-800/10">
                        <div>
                            Menampilkan{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {indexOfFirstItem + 1}
                            </span>{' '}
                            hingga{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {Math.min(indexOfLastItem, totalItems)}
                            </span>{' '}
                            dari{' '}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {totalItems}
                            </span>{' '}
                            entri
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={currentPage === 1}
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                        currentPage === page
                                            ? 'bg-[#355C7D] text-white shadow-sm'
                                            : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
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
                    <div className="w-full max-w-lg animate-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/10">
                            <h3 className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                <Plus className="h-5 w-5 text-[#355C7D]" />
                                Tambah Unit Layanan
                            </h3>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={handleCreateSubmit}
                            className="space-y-4 p-6"
                        >
                            {isSuperAdmin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Pilih Instansi / OPD
                                    </label>
                                    <select
                                        value={data.opd_id}
                                        onChange={(e) =>
                                            setData('opd_id', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                    >
                                        {opds.map((opd) => (
                                            <option key={opd.id} value={opd.id}>
                                                {opd.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Unit Pelayanan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Pelayanan KTP-el dan Kartu Keluarga"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Kode Unit Layanan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9-]/g, ''),
                                        )
                                    }
                                    placeholder="DISDUKCAPIL-KTP"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                                {errors.code && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Deskripsi Layanan
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Deskripsi singkat jenis pelayanan loket..."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-[#355C7D] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#284964] disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: EDIT FORM */}
            {editingUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg animate-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/10">
                            <h3 className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                <Pencil className="h-5 w-5 text-[#355C7D]" />
                                Edit Unit: {editingUnit.name}
                            </h3>
                            <button
                                onClick={() => setEditingUnit(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={handleEditSubmit}
                            className="space-y-4 p-6"
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Unit Pelayanan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Pelayanan KTP-el dan Kartu Keluarga"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Kode Unit Layanan
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.code}
                                    onChange={(e) =>
                                        setData(
                                            'code',
                                            e.target.value
                                                .toUpperCase()
                                                .replace(/[^A-Z0-9-]/g, ''),
                                        )
                                    }
                                    placeholder="DISDUKCAPIL-KTP"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                                {errors.code && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {errors.code}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Deskripsi Layanan
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Deskripsi singkat jenis pelayanan loket..."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingUnit(null)}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-lg bg-[#355C7D] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#284964] disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

UnitsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Unit Layanan',
            href: '/admin/units',
        },
    ],
};
