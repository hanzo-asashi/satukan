import { Head, Link } from '@inertiajs/react';
import {
    ClipboardCheck,
    MessageSquare,
    TrendingUp,
    AlertTriangle,
    ArrowUpRight,
    CheckCircle,
    Search,
    FileText,
    Download,
} from 'lucide-react';
import { useState } from 'react';
import { SoppengMap } from '@/components/soppeng-map';
import { dashboard } from '@/routes';

interface IndicatorDetail {
    code: string;
    name: string;
    nrr: number;
    nrr_weighted: number;
}

interface Stats {
    score: number;
    grade: string;
    grade_label: string;
    total_respondents: number;
    lowest_indicator: { code: string; name: string; score: number } | null;
    highest_indicator: { code: string; name: string; score: number } | null;
    indicators: Record<string, IndicatorDetail>;
}

interface TrendPoint {
    month: string;
    score: number;
    respondents: number;
}

interface BreakdownItem {
    id: number;
    name: string;
    code: string;
    total_respondents: number;
    score: number;
    grade: string;
    grade_label: string;
}

interface Complaint {
    id: number;
    name: string;
    content: string;
    status: 'pending' | 'resolved';
    created_at: string;
    unit: {
        name: string;
        opd: {
            name: string;
        };
    };
}

interface Period {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

interface RtlStats {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
    completion_rate: number;
}

interface DashboardProps {
    activePeriod: Period | null;
    stats: Stats;
    trend: TrendPoint[];
    breakdown: BreakdownItem[];
    recentComplaints: Complaint[];
    rtlStats: RtlStats;
    isSuperAdmin: boolean;
}

export default function Dashboard({
    activePeriod,
    stats,
    trend,
    breakdown,
    recentComplaints,
    rtlStats,
    isSuperAdmin,
}: DashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const sortedBreakdown = [...breakdown].sort((a, b) => b.score - a.score);
    const topPerformers = sortedBreakdown.slice(0, 3);
    const bottomPerformers = [...breakdown]
        .filter((item) => item.total_respondents > 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
    // Custom SVG Line Chart coordinates calculation
    const renderTrendChart = () => {
        if (trend.length === 0) {
            return (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                    Belum ada data tren yang cukup untuk dirender.
                </div>
            );
        }

        const width = 500;
        const height = 150;
        const padding = 20;

        const maxVal = 100;
        const minVal = 0;

        const points = trend.map((point, index) => {
            const x =
                padding +
                (index * (width - padding * 2)) / Math.max(1, trend.length - 1);
            // Invert Y coordinate since SVG (0,0) is top-left
            const y =
                height -
                padding -
                ((point.score - minVal) / (maxVal - minVal)) *
                    (height - padding * 2);

            return { x, y, score: point.score, month: point.month };
        });

        const linePath = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');
        const areaPath =
            points.length > 0
                ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
                : '';

        return (
            <div className="space-y-4">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="h-48 w-full overflow-visible"
                >
                    {/* Grid lines */}
                    <line
                        x1={padding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        className="stroke-gray-100 dark:stroke-neutral-800"
                        strokeWidth={1}
                    />
                    <line
                        x1={padding}
                        y1={height / 2}
                        x2={width - padding}
                        y2={height / 2}
                        className="stroke-gray-50 dark:stroke-neutral-900"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                    />
                    <line
                        x1={padding}
                        y1={padding}
                        x2={width - padding}
                        y2={padding}
                        className="stroke-gray-100 dark:stroke-neutral-800"
                        strokeWidth={1}
                    />

                    {/* Area fill */}
                    {areaPath && (
                        <path
                            d={areaPath}
                            className="fill-[#355C7D]/10 dark:fill-[#355C7D]/20"
                        />
                    )}

                    {/* Trend Line */}
                    {linePath && (
                        <path
                            d={linePath}
                            fill="none"
                            className="stroke-[#355C7D]"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={4}
                                className="fill-white stroke-[#355C7D]"
                                strokeWidth={2}
                            />
                            <text
                                x={p.x}
                                y={p.y - 8}
                                textAnchor="middle"
                                className="fill-gray-600 text-[10px] font-bold dark:fill-gray-300"
                            >
                                {p.score.toFixed(1)}
                            </text>
                        </g>
                    ))}

                    {/* Labels */}
                    {points.map((p, i) => (
                        <text
                            key={i}
                            x={p.x}
                            y={height - 2}
                            textAnchor="middle"
                            className="fill-gray-400 text-[8px]"
                        >
                            {p.month.split(' ')[0]}
                        </text>
                    ))}
                </svg>
            </div>
        );
    };

    const getGradeBadgeClass = (grade: string) => {
        switch (grade) {
            case 'A':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200';
            case 'B':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200';
            case 'C':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200';
            default:
                return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <Head title="Dashboard SKM" />

            {/* Dashboard Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard Analitis
                    </h1>
                    <p className="text-sm text-gray-500">
                        {activePeriod
                            ? `Periode Aktif: ${activePeriod.name}`
                            : 'Tidak ada periode survei aktif.'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/recommendations"
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                    >
                        Tindak Lanjut SKM
                    </Link>
                    <a
                        href={`/admin/export/excel${activePeriod ? `?period_id=${activePeriod.id}` : ''}`}
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                    >
                        <Download className="h-4 w-4" />
                        Ekspor Excel
                    </a>
                    <a
                        href={`/admin/export/pdf?autoprint=1${activePeriod ? `&period_id=${activePeriod.id}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                    >
                        <FileText className="h-4 w-4" />
                        Cetak Laporan (PDF)
                    </a>
                    {isSuperAdmin && (
                        <Link
                            href="/admin/sync"
                            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                        >
                            Integrasi Nasional
                        </Link>
                    )}
                </div>
            </div>

            {/* Top Stat Widget Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Respondents */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="space-y-1">
                        <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                            Total Responden
                        </span>
                        <span className="block text-2xl font-black tracking-tight text-gray-800 dark:text-white">
                            {stats.total_respondents.toLocaleString('id-ID')}
                        </span>
                        <span className="block text-[10px] font-semibold text-emerald-500">
                            Dalam Periode Aktif
                        </span>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-gray-500 dark:bg-neutral-800">
                        <ClipboardCheck className="h-6 w-6" />
                    </div>
                </div>

                {/* IKM Score */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="space-y-1">
                        <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                            Skor IKM
                        </span>
                        <span className="block text-2xl font-black tracking-tight text-gray-800 dark:text-white">
                            {stats.score.toFixed(2)}
                        </span>
                        <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${getGradeBadgeClass(stats.grade)}`}
                        >
                            {stats.grade_label} ({stats.grade})
                        </span>
                    </div>
                    <div className="rounded-lg bg-[#355C7D]/10 p-3 text-[#355C7D]">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                </div>

                {/* Lowest Indicator */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="space-y-1">
                        <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                            Unsur Terendah
                        </span>
                        <span className="line-clamp-1 block text-base font-bold text-gray-800 dark:text-white">
                            {stats.lowest_indicator
                                ? `${stats.lowest_indicator.code} - ${stats.lowest_indicator.name}`
                                : 'Belum Ada'}
                        </span>
                        <span className="block text-[10px] font-semibold text-rose-500">
                            Skor:{' '}
                            {stats.lowest_indicator
                                ? (stats.lowest_indicator.score * 25).toFixed(2)
                                : '0.00'}
                        </span>
                    </div>
                    <div className="rounded-lg bg-rose-50 p-3 text-rose-500 dark:bg-rose-950/20">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                {/* Highest Indicator */}
                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="space-y-1">
                        <span className="block text-xs font-semibold tracking-wider text-gray-400 uppercase">
                            Unsur Tertinggi
                        </span>
                        <span className="line-clamp-1 block text-base font-bold text-gray-800 dark:text-white">
                            {stats.highest_indicator
                                ? `${stats.highest_indicator.code} - ${stats.highest_indicator.name}`
                                : 'Belum Ada'}
                        </span>
                        <span className="block text-[10px] font-semibold text-emerald-500">
                            Skor:{' '}
                            {stats.highest_indicator
                                ? (stats.highest_indicator.score * 25).toFixed(
                                      2,
                                  )
                                : '0.00'}
                        </span>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3 text-emerald-500 dark:bg-emerald-950/20">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Executive Leaderboard & RTL Progress */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Leaderboard Card */}
                <div className="space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-gray-100 pb-3 dark:border-neutral-800">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">
                            {isSuperAdmin
                                ? 'Papan Peringkat Kinerja OPD Kabupaten Soppeng'
                                : 'Peringkat Kinerja Unit Pelayanan'}
                        </h3>
                        <p className="text-xs text-gray-400">
                            Analisis komparatif kinerja pelayanan berdasarkan
                            nilai IKM terhitung.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Top Performers */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                🏆 3 Kinerja Tertinggi
                            </h4>
                            <div className="space-y-2">
                                {topPerformers.length > 0 ? (
                                    topPerformers.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-lg border border-emerald-100/50 bg-emerald-50/30 p-3 dark:border-emerald-900/20 dark:bg-emerald-950/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span className="line-clamp-1 block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400">
                                                        Responden:{' '}
                                                        {item.total_respondents}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-black text-emerald-700 dark:text-emerald-400">
                                                    {item.score.toFixed(2)}
                                                </span>
                                                <span className="text-[9px] font-bold tracking-wide text-emerald-600 uppercase">
                                                    {item.grade}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-xs text-gray-400">
                                        Tidak ada data
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Performers */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400">
                                <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                                ⚠️ 3 Perlu Intervensi (Terendah)
                            </h4>
                            <div className="space-y-2">
                                {bottomPerformers.length > 0 ? (
                                    bottomPerformers.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-lg border border-rose-100/50 bg-rose-50/30 p-3 dark:border-rose-900/20 dark:bg-rose-950/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-extrabold text-rose-800 dark:bg-rose-900 dark:text-rose-300">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <span className="line-clamp-1 block text-xs font-bold text-gray-800 dark:text-gray-200">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400">
                                                        Responden:{' '}
                                                        {item.total_respondents}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-black text-rose-700 dark:text-rose-400">
                                                    {item.score.toFixed(2)}
                                                </span>
                                                <span className="text-[9px] font-bold tracking-wide text-rose-600 uppercase">
                                                    {item.grade}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-xs text-gray-400">
                                        Tidak ada data berkinerja rendah
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RTL Progress Card */}
                <div className="flex flex-col justify-between space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div>
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
                            <div>
                                <h3 className="text-base font-bold text-gray-800 dark:text-white">
                                    Realisasi RTL
                                </h3>
                                <p className="text-xs text-gray-400">
                                    Progress rencana aksi tindak lanjut
                                </p>
                            </div>
                            <ClipboardCheck className="h-5 w-5 text-gray-400" />
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                            <div className="relative flex items-center justify-center">
                                <svg className="h-24 w-24 -rotate-90 transform">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        className="fill-none stroke-gray-100 dark:stroke-neutral-800"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        className="fill-none stroke-[#355C7D] transition-all duration-500"
                                        strokeWidth="8"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={
                                            251.2 -
                                            (251.2 * rtlStats.completion_rate) /
                                                100
                                        }
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="block text-xl font-black text-gray-800 dark:text-white">
                                        {rtlStats.completion_rate}%
                                    </span>
                                    <span className="block text-[8px] font-bold tracking-wider text-gray-400 uppercase">
                                        Selesai
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-emerald-50/50 p-2 dark:bg-emerald-950/10">
                            <span className="block text-[10px] font-semibold text-gray-400">
                                Selesai
                            </span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                                {rtlStats.completed}
                            </span>
                        </div>
                        <div className="rounded-lg bg-blue-50/50 p-2 dark:bg-blue-950/10">
                            <span className="block text-[10px] font-semibold text-gray-400">
                                Proses
                            </span>
                            <span className="text-sm font-black text-blue-700 dark:text-blue-400">
                                {rtlStats.in_progress}
                            </span>
                        </div>
                        <div className="rounded-lg bg-neutral-100 p-2 dark:bg-neutral-800">
                            <span className="block text-[10px] font-semibold text-gray-400">
                                Menunggu
                            </span>
                            <span className="text-sm font-black text-gray-600 dark:text-gray-400">
                                {rtlStats.not_started}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Peta Spasial Kepuasan Pelayanan (Heatmap) for Superadmin */}
            {isSuperAdmin && <SoppengMap breakdown={breakdown} />}

            {/* Middle Section: Trend Chart & Indicator Breakdown */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Trend Chart */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-7 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-gray-55 flex items-center justify-between border-b pb-4">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">
                            Tren Indeks Kepuasan Bulanan
                        </h3>
                        <span className="text-xs text-gray-400">
                            Skala Konversi 0 - 100
                        </span>
                    </div>
                    {renderTrendChart()}
                </div>

                {/* Unsur Rankings */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-gray-55 flex items-center justify-between border-b pb-4">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">
                            Rincian Unsur SKM
                        </h3>
                        <span className="text-xs text-gray-400">
                            Rerata NRR
                        </span>
                    </div>
                    <div className="max-h-48 space-y-3.5 overflow-y-auto">
                        {Object.values(stats.indicators).map((ind) => (
                            <div key={ind.code} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="line-clamp-1 font-medium text-gray-700 dark:text-gray-300">
                                        {ind.code}. {ind.name}
                                    </span>
                                    <span className="font-bold text-[#355C7D]">
                                        {ind.nrr.toFixed(2)}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-neutral-800">
                                    <div
                                        className="h-1.5 rounded-full bg-[#355C7D] transition-all duration-300"
                                        style={{
                                            width: `${(ind.nrr / 4) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom section: Breakdown list and Recent Complaints */}
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Breakdown List (OPD or Unit) */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center dark:border-neutral-800">
                        <div>
                            <h3 className="text-base font-bold text-gray-800 dark:text-white">
                                {isSuperAdmin
                                    ? 'Kinerja Indeks Kepuasan Per OPD'
                                    : 'Kinerja Indeks Kepuasan Per Unit Layanan'}
                            </h3>
                            <p className="mt-1 text-xs text-gray-400">
                                Daftar performa mutu pelayanan untuk periode
                                saat ini.
                            </p>
                        </div>
                        <div className="relative w-full sm:w-60">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={
                                    isSuperAdmin
                                        ? 'Cari OPD...'
                                        : 'Cari unit...'
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 py-1.5 pr-4 pl-9 text-xs focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="max-h-[360px] scrollbar-thin overflow-y-auto pr-1">
                        <table className="w-full border-collapse text-left text-sm">
                            <thead>
                                <tr className="sticky top-0 z-10 text-xs font-bold text-gray-400 uppercase">
                                    <th className="border-b border-gray-100 bg-white px-2 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        Nama Instansi/Unit
                                    </th>
                                    <th className="border-b border-gray-100 bg-white px-2 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        Responden
                                    </th>
                                    <th className="border-b border-gray-100 bg-white px-2 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        Nilai IKM
                                    </th>
                                    <th className="border-b border-gray-100 bg-white px-2 py-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        Mutu Pelayanan
                                    </th>
                                    <th className="border-b border-gray-100 bg-white px-2 py-3 text-right dark:border-neutral-800 dark:bg-neutral-900">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {breakdown.filter(
                                    (item) =>
                                        item.name
                                            .toLowerCase()
                                            .includes(
                                                searchQuery.toLowerCase(),
                                            ) ||
                                        item.code
                                            .toLowerCase()
                                            .includes(
                                                searchQuery.toLowerCase(),
                                            ),
                                ).length > 0 ? (
                                    breakdown
                                        .filter(
                                            (item) =>
                                                item.name
                                                    .toLowerCase()
                                                    .includes(
                                                        searchQuery.toLowerCase(),
                                                    ) ||
                                                item.code
                                                    .toLowerCase()
                                                    .includes(
                                                        searchQuery.toLowerCase(),
                                                    ),
                                        )
                                        .map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-gray-50 transition-all hover:bg-gray-50/50 dark:border-neutral-800 dark:hover:bg-neutral-800/20"
                                            >
                                                <td className="px-2 py-3.5">
                                                    <div className="font-bold text-gray-800 dark:text-gray-200">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        Kode: {item.code}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-3.5 font-medium text-gray-600 dark:text-gray-400">
                                                    {item.total_respondents.toLocaleString(
                                                        'id-ID',
                                                    )}
                                                </td>
                                                <td className="px-2 py-3.5 font-extrabold text-[#355C7D]">
                                                    {item.score.toFixed(2)}
                                                </td>
                                                <td className="px-2 py-3.5">
                                                    <span
                                                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${getGradeBadgeClass(item.grade)}`}
                                                    >
                                                        {item.grade_label} (
                                                        {item.grade})
                                                    </span>
                                                </td>
                                                <td className="px-2 py-3.5 text-right">
                                                    <Link
                                                        href={
                                                            isSuperAdmin
                                                                ? `/admin/units?opd_id=${item.id}`
                                                                : `/admin/units/${item.id}/qr`
                                                        }
                                                        className="inline-flex items-center gap-0.5 text-xs font-bold text-[#355C7D] hover:underline"
                                                    >
                                                        Detail
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-8 text-center text-xs text-gray-400"
                                        >
                                            Tidak ada instansi/unit yang cocok.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Complaints Box */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-gray-55 flex items-center justify-between border-b pb-4">
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">
                            Aduan Publik Terbaru
                        </h3>
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="max-h-[300px] space-y-4 overflow-y-auto pr-1">
                        {recentComplaints.length > 0 ? (
                            recentComplaints.map((comp) => (
                                <div
                                    key={comp.id}
                                    className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/40"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {comp.name}
                                        </span>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                comp.status === 'resolved'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                            }`}
                                        >
                                            {comp.status === 'resolved'
                                                ? 'Selesai'
                                                : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="line-clamp-2 text-xs leading-normal text-gray-500">
                                        {comp.content}
                                    </p>
                                    <div className="text-[9px] text-gray-400">
                                        Unit: {comp.unit.name}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs text-gray-400">
                                Tidak ada keluhan/aduan masuk dalam periode
                                aktif.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
