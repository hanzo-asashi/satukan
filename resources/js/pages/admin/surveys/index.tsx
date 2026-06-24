import { Head, useForm } from '@inertiajs/react';
import {
    Plus,
    X,
    Landmark,
    Eye,
    Globe,
    Archive,
    Trash,
    CheckSquare,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface Question {
    id: number;
    indicator_code: string;
    indicator_name: string;
    question_text: string;
}

interface Survey {
    id: number;
    title: string;
    description: string | null;
    is_published: boolean;
    token: string;
    period: Period;
    unit: Unit;
    questions: Question[];
}

interface IndexProps {
    surveys: Survey[];
    periods: Period[];
    units: Unit[];
}

export default function SurveysIndex({ surveys, periods, units }: IndexProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [unitFilter, setUnitFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredSurveys = surveys.filter((survey) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            survey.title.toLowerCase().includes(query) ||
            (survey.description &&
                survey.description.toLowerCase().includes(query)) ||
            survey.unit.name.toLowerCase().includes(query) ||
            survey.unit.opd.name.toLowerCase().includes(query);

        const matchesPeriod =
            periodFilter === 'all'
                ? true
                : survey.period.id.toString() === periodFilter;
        const matchesUnit =
            unitFilter === 'all'
                ? true
                : survey.unit.id.toString() === unitFilter;
        const matchesStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'active'
                  ? survey.is_published
                  : !survey.is_published;

        return matchesSearch && matchesPeriod && matchesUnit && matchesStatus;
    });

    const totalItems = filteredSurveys.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSurveys.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const {
        data,
        setData,
        post,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        title: '',
        description: '',
        period_id: periods[0]?.id || '',
        unit_id: units[0]?.id || '',
        is_published: true,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/admin/surveys', {
            onSuccess: () => {
                toast.success(
                    'Survei berhasil dibuat beserta 9 indikator wajib.',
                );
                setIsCreateOpen(false);
                reset();
            },
            onError: () =>
                toast.error('Gagal membuat survei. Cek kembali form Anda.'),
        });
    };

    const togglePublish = (survey: Survey) => {
        post(`/admin/surveys/${survey.id}/toggle-publish`, {
            onSuccess: () => {
                const statusText = !survey.is_published
                    ? 'dipublikasikan'
                    : 'diarsipkan';
                toast.success(`Survei berhasil ${statusText}.`);
            },
            onError: () => toast.error('Gagal merubah status publikasi.'),
        });
    };

    const handleDelete = (survey: Survey) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus survei "${survey.title}"? Seluruh respon dan detail kuesioner akan terhapus permanen.`,
            )
        ) {
            destroy(`/admin/surveys/${survey.id}`, {
                onSuccess: () => toast.success('Survei berhasil dihapus.'),
                onError: () => toast.error('Gagal menghapus survei.'),
            });
        }
    };

    return (
        <div className="space-y-6 p-6">
            <Head title="Kelola Formulir Survei - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Formulir Survei (SKM)
                    </h1>
                    <p className="text-sm text-gray-500">
                        Buat, publikasikan, dan tinjau struktur kuesioner
                        kepuasan pelayanan.
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
                    Buat Formulir
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex w-full flex-col items-center justify-between gap-3 md:flex-row">
                    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:flex-row">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari judul, unit, OPD..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                        <select
                            value={periodFilter}
                            onChange={(e) => {
                                setPeriodFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="all">Semua Periode</option>
                            {periods.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={unitFilter}
                            onChange={(e) => {
                                setUnitFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="all">Semua Unit</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Live (Aktif)</option>
                            <option value="inactive">Arsip</option>
                        </select>
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
            </div>

            {/* Surveys List Table */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase dark:border-neutral-800 dark:bg-neutral-800/10">
                                <th className="px-4 py-3.5">
                                    Judul / Unit Layanan
                                </th>
                                <th className="px-4 py-3.5">Periode</th>
                                <th className="px-4 py-3.5">Indikator Wajib</th>
                                <th className="px-4 py-3.5">
                                    Status Publikasi
                                </th>
                                <th className="px-4 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((survey) => (
                                    <tr
                                        key={survey.id}
                                        className="border-b border-gray-50 transition-all hover:bg-gray-50/30 dark:border-neutral-800 dark:hover:bg-neutral-800/10"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-800 dark:text-gray-200">
                                                {survey.title}
                                            </div>
                                            <div className="text-[10px] text-gray-400 dark:text-neutral-500">
                                                {survey.unit.opd.name} &bull;{' '}
                                                {survey.unit.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-xs font-medium text-gray-500">
                                            {survey.period.name}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                <CheckSquare className="h-4 w-4 text-[#355C7D]" />
                                                {survey.questions.length} Unsur
                                                (U1-U9)
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                    survey.is_published
                                                        ? 'border border-emerald-200 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                        : 'border border-amber-200 bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                                }`}
                                            >
                                                {survey.is_published ? (
                                                    <>
                                                        <Globe className="h-3 w-3" />{' '}
                                                        Live (Aktif)
                                                    </>
                                                ) : (
                                                    <>
                                                        <Archive className="h-3 w-3" />{' '}
                                                        Arsip
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="space-x-2 px-4 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    setSelectedSurvey(survey)
                                                }
                                                className="inline-flex cursor-pointer rounded p-1.5 text-gray-400 transition-all hover:bg-gray-100 hover:text-blue-600"
                                                title="Lihat Rincian Pertanyaan"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    togglePublish(survey)
                                                }
                                                className={`inline-flex cursor-pointer rounded p-1.5 transition-all hover:bg-gray-100 ${
                                                    survey.is_published
                                                        ? 'text-amber-500 hover:text-amber-600'
                                                        : 'text-emerald-500 hover:text-emerald-600'
                                                }`}
                                                title={
                                                    survey.is_published
                                                        ? 'Arsipkan'
                                                        : 'Aktifkan'
                                                }
                                            >
                                                {survey.is_published ? (
                                                    <Archive className="h-4 w-4" />
                                                ) : (
                                                    <Globe className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(survey)
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
                                        colSpan={5}
                                        className="py-12 text-center text-gray-400"
                                    >
                                        <Landmark className="mx-auto h-12 w-12 stroke-1" />
                                        <p className="mt-2 text-sm">
                                            Tidak ada data survei yang cocok.
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
                                Buat Formulir Survei
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
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Judul Survei
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Survei Kepuasan Masyarakat - Layanan KTP"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Deskripsi / Pengantar
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Isi pengantar, dasar hukum, dan arahan pengisian kuesioner..."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Pilih Periode Survei
                                    </label>
                                    <select
                                        value={data.period_id}
                                        onChange={(e) =>
                                            setData('period_id', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                    >
                                        {periods.map((period) => (
                                            <option
                                                key={period.id}
                                                value={period.id}
                                            >
                                                {period.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Pilih Unit Layanan
                                    </label>
                                    <select
                                        value={data.unit_id}
                                        onChange={(e) =>
                                            setData('unit_id', e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                    >
                                        {units.map((unit) => (
                                            <option
                                                key={unit.id}
                                                value={unit.id}
                                            >
                                                {unit.opd.name} - {unit.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_published_create"
                                    checked={data.is_published}
                                    onChange={(e) =>
                                        setData(
                                            'is_published',
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-[#355C7D] focus:ring-[#355C7D]/20"
                                />
                                <label
                                    htmlFor="is_published_create"
                                    className="text-xs font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    Publikasikan Langsung
                                </label>
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

            {/* MODAL: VIEW DETAILS (9 QUESTIONS LIST) */}
            {selectedSurvey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl animate-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/10">
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    Rincian Pertanyaan SKM
                                </h3>
                                <p className="text-xs text-gray-400">
                                    {selectedSurvey.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedSurvey(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="max-h-[450px] space-y-4 overflow-y-auto p-6">
                            {selectedSurvey.questions.map((q) => (
                                <div
                                    key={q.id}
                                    className="space-y-1 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/20"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="rounded bg-[#355C7D]/10 px-2 py-0.5 text-[10px] font-bold text-[#355C7D]">
                                            {q.indicator_code}
                                        </span>
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {q.indicator_name}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-normal text-gray-500">
                                        {q.question_text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-800/10">
                            <button
                                onClick={() => setSelectedSurvey(null)}
                                className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

SurveysIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Survei',
            href: '/admin/surveys',
        },
    ],
};
