import { Link } from '@inertiajs/react';
import {
    MapPin,
    Search,
    ArrowUpRight,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface BreakdownItem {
    id: number;
    name: string;
    code: string;
    total_respondents: number;
    score: number;
    grade: string;
    grade_label: string;
}

interface SoppengMapProps {
    breakdown: BreakdownItem[];
}

const KECAMATAN_LIST = [
    {
        name: 'Marioriawa',
        code: 'KEC-MARIORIAWA',
        centroid: { x: 145, y: 70 },
        path: 'M 70 80 L 80 40 L 220 20 L 240 100 L 140 120 Z',
    },
    {
        name: 'Donri-Donri',
        code: 'KEC-DONRIDONRI',
        centroid: { x: 270, y: 70 },
        path: 'M 220 20 L 320 30 L 300 120 L 240 100 Z',
    },
    {
        name: 'Lilirilau',
        code: 'KEC-LILIRILAU',
        centroid: { x: 380, y: 100 },
        path: 'M 320 30 L 460 50 L 480 140 L 350 160 L 300 120 Z',
    },
    {
        name: 'Lalabata',
        code: 'KEC-LALABATA',
        centroid: { x: 145, y: 155 },
        path: 'M 60 170 L 70 80 L 140 120 L 240 100 L 250 180 L 160 210 Z',
    },
    {
        name: 'Ganra',
        code: 'KEC-GANRA',
        centroid: { x: 275, y: 142 },
        path: 'M 240 100 L 300 120 L 330 170 L 250 180 Z',
    },
    {
        name: 'Liliriaja',
        code: 'KEC-LILIRIAJA',
        centroid: { x: 320, y: 215 },
        path: 'M 250 180 L 330 170 L 350 160 L 420 230 L 290 260 Z',
    },
    {
        name: 'Citta',
        code: 'KEC-CITTA',
        centroid: { x: 440, y: 185 },
        path: 'M 350 160 L 480 140 L 520 210 L 420 230 Z',
    },
    {
        name: 'Marioriwawo',
        code: 'KEC-MARIORIWAWO',
        centroid: { x: 230, y: 280 },
        path: 'M 60 170 L 160 210 L 250 180 L 290 260 L 420 230 L 380 340 L 200 360 L 100 280 Z',
    },
];

export function SoppengMap({ breakdown }: SoppengMapProps) {
    const [hoveredKec, setHoveredKec] = useState<any>(null);
    const [selectedKecCode, setSelectedKecCode] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [searchQuery, setSearchQuery] = useState('');

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    // Calculate score details for a Kecamatan
    const getKecData = (code: string) => {
        const item = breakdown.find((b) => b.code === code);

        return {
            id: item?.id ?? null,
            score: item?.score ?? 0,
            grade: item?.grade ?? 'D',
            grade_label: item?.grade_label ?? 'Belum ada data',
            respondents: item?.total_respondents ?? 0,
        };
    };

    // Get color classes based on IKM score
    const getKecColorClass = (score: number, code: string) => {
        const isSelected = selectedKecCode === code;
        const baseClasses =
            'transition-all duration-300 cursor-pointer stroke-[1.5] hover:stroke-white hover:stroke-[3.5] hover:opacity-95 drop-shadow-sm';
        const selectedOutline = isSelected
            ? 'stroke-white stroke-[4] filter brightness-110 drop-shadow-lg'
            : 'stroke-slate-100 dark:stroke-neutral-900';

        if (score === 0) {
            return `${baseClasses} fill-slate-200 hover:fill-slate-300 dark:fill-neutral-800 dark:hover:fill-neutral-700 ${selectedOutline}`;
        }

        if (score >= 88.31) {
            return `${baseClasses} fill-emerald-500 hover:fill-emerald-600 dark:fill-emerald-600/90 dark:hover:fill-emerald-500/90 ${selectedOutline}`;
        }

        if (score >= 76.61) {
            return `${baseClasses} fill-blue-500 hover:fill-blue-600 dark:fill-blue-600/90 dark:hover:fill-blue-500/90 ${selectedOutline}`;
        }

        if (score >= 65.0) {
            return `${baseClasses} fill-amber-500 hover:fill-amber-600 dark:fill-amber-600/90 dark:hover:fill-amber-500/90 ${selectedOutline}`;
        }

        return `${baseClasses} fill-rose-500 hover:fill-rose-600 dark:fill-rose-600/90 dark:hover:fill-rose-500/90 ${selectedOutline}`;
    };

    const getGradeBadgeColorClass = (grade: string, score: number) => {
        if (score === 0) {
            return 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300';
        }

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

    // Filter and sort kecamatans
    const filteredKecList = KECAMATAN_LIST.map((kec) => {
        const data = getKecData(kec.code);

        return { ...kec, ...data };
    })
        .filter((kec) =>
            kec.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => b.score - a.score);

    const activeSelectedKec = KECAMATAN_LIST.find(
        (k) => k.code === selectedKecCode,
    );
    const selectedData = selectedKecCode ? getKecData(selectedKecCode) : null;

    const totalKecWithData = filteredKecList.filter((k) => k.score > 0);
    const avgKec =
        totalKecWithData.length > 0
            ? totalKecWithData.reduce((acc, curr) => acc + curr.score, 0) /
              totalKecWithData.length
            : 0;

    return (
        <div className="grid gap-6 lg:grid-cols-12">
            {/* Interactive Heatmap Map Card */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-8 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center dark:border-neutral-800">
                    <div>
                        <h3 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-white">
                            <MapPin className="h-5 w-5 text-[#355C7D]" />
                            Peta Spasial Kepuasan Pelayanan (Heatmap)
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                            Peta sebaran Indeks Kepuasan Masyarakat (IKM)
                            Kecamatan di Kabupaten Soppeng.
                        </p>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        <span className="flex items-center gap-1.5">
                            <span className="block h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>{' '}
                            A (Sangat Baik)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="block h-2.5 w-2.5 rounded-sm bg-blue-500"></span>{' '}
                            B (Baik)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="block h-2.5 w-2.5 rounded-sm bg-amber-500"></span>{' '}
                            C (Kurang Baik)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="block h-2.5 w-2.5 rounded-sm bg-rose-500"></span>{' '}
                            D (Tidak Baik)
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="block h-2.5 w-2.5 rounded-sm bg-slate-200 dark:bg-neutral-800"></span>{' '}
                            N/A (Kosong)
                        </span>
                    </div>
                </div>

                {/* SVG Container */}
                <div
                    className="relative flex h-[340px] items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/20"
                    onMouseMove={handleMouseMove}
                >
                    <svg
                        viewBox="0 0 560 380"
                        className="h-full max-h-[320px] w-full select-none"
                    >
                        <g>
                            {KECAMATAN_LIST.map((kec) => {
                                const data = getKecData(kec.code);
                                const colorClass = getKecColorClass(
                                    data.score,
                                    kec.code,
                                );
                                const isSelected = selectedKecCode === kec.code;

                                return (
                                    <g key={kec.code}>
                                        <path
                                            d={kec.path}
                                            className={colorClass}
                                            onClick={() =>
                                                setSelectedKecCode(
                                                    isSelected
                                                        ? null
                                                        : kec.code,
                                                )
                                            }
                                            onMouseEnter={() =>
                                                setHoveredKec({
                                                    name: kec.name,
                                                    ...data,
                                                })
                                            }
                                            onMouseLeave={() =>
                                                setHoveredKec(null)
                                            }
                                        />

                                        {/* Label text */}
                                        <text
                                            x={kec.centroid.x}
                                            y={kec.centroid.y}
                                            textAnchor="middle"
                                            onClick={() =>
                                                setSelectedKecCode(
                                                    isSelected
                                                        ? null
                                                        : kec.code,
                                                )
                                            }
                                            className={`pointer-events-none text-[9px] font-extrabold tracking-wider uppercase select-none ${
                                                data.score === 0
                                                    ? 'fill-slate-500 dark:fill-neutral-400'
                                                    : 'fill-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]'
                                            }`}
                                        >
                                            {kec.name}
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>

                    {/* Floating Tooltip */}
                    {hoveredKec && (
                        <div
                            className="pointer-events-none absolute z-20 min-w-[140px] space-y-1.5 rounded-lg border border-slate-100 bg-white/95 p-3 text-left shadow-xl backdrop-blur-sm transition-all duration-75 dark:border-neutral-800 dark:bg-neutral-900/95"
                            style={{
                                left: `${tooltipPos.x + 15}px`,
                                top: `${tooltipPos.y + 15}px`,
                            }}
                        >
                            <div className="text-xs font-extrabold text-gray-800 dark:text-white">
                                Kec. {hoveredKec.name}
                            </div>
                            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-1 dark:border-neutral-800">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                    Skor IKM:
                                </span>
                                <span className="text-xs font-black text-[#355C7D] dark:text-blue-400">
                                    {hoveredKec.score > 0
                                        ? hoveredKec.score.toFixed(2)
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase">
                                    Responden:
                                </span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                    {hoveredKec.respondents}
                                </span>
                            </div>
                            {hoveredKec.score > 0 && (
                                <div
                                    className={`rounded px-1.5 py-0.5 text-center text-[8.5px] font-black tracking-wide uppercase ${getGradeBadgeColorClass(hoveredKec.grade, hoveredKec.score)}`}
                                >
                                    {hoveredKec.grade_label}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Kecamatan Rankings & Detail Sidebar */}
            <div className="flex h-[460px] flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-4 dark:border-neutral-800 dark:bg-neutral-900">
                {/* Search */}
                <div className="space-y-4 border-b border-gray-100 pb-4 dark:border-neutral-800">
                    <div>
                        <h3 className="text-base font-bold text-gray-800 dark:text-white">
                            Peringkat Kecamatan
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-400">
                            Daftar performa per wilayah kecamatan.
                        </p>
                    </div>
                    <div className="relative">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari kecamatan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 py-1.5 pr-4 pl-9 text-xs focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        />
                    </div>
                </div>

                {/* List / Selection Detail */}
                <div className="flex-1 scrollbar-thin space-y-2.5 overflow-y-auto py-3 pr-1">
                    {selectedKecCode && selectedData && activeSelectedKec ? (
                        /* Selected Kecamatan Deep Info */
                        <div className="animate-fadeIn space-y-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/20">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">
                                        Kec. {activeSelectedKec.name}
                                    </h4>
                                    <span className="text-[10px] font-medium text-gray-400">
                                        Kode: {activeSelectedKec.code}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setSelectedKecCode(null)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    Tutup
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="rounded-md border border-slate-100 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span className="block text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                        Skor IKM
                                    </span>
                                    <span className="mt-1 block text-xl font-black text-[#355C7D] dark:text-blue-400">
                                        {selectedData.score > 0
                                            ? selectedData.score.toFixed(2)
                                            : '-'}
                                    </span>
                                </div>
                                <div className="rounded-md border border-slate-100 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span className="block text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                        Responden
                                    </span>
                                    <span className="mt-1 block text-xl font-black text-slate-800 dark:text-white">
                                        {selectedData.respondents}
                                    </span>
                                </div>
                            </div>

                            {selectedData.score > 0 ? (
                                <div className="space-y-3">
                                    <div className="space-y-1 rounded-md border border-slate-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                        <span className="block text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                                            Mutu Layanan
                                        </span>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span
                                                className={`rounded px-2 py-0.5 text-[10px] font-black tracking-wide uppercase ${getGradeBadgeColorClass(selectedData.grade, selectedData.score)}`}
                                            >
                                                {selectedData.grade_label} (
                                                {selectedData.grade})
                                            </span>
                                        </div>
                                    </div>
                                    {selectedData.id && (
                                        <Link
                                            href={`/admin/units?opd_id=${selectedData.id}`}
                                            className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#355C7D] px-3 py-2 text-xs font-bold text-white transition-all hover:bg-[#284964]"
                                        >
                                            Lihat Unit Pelayanan Kecamatan
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-md border border-dashed border-slate-200 bg-slate-100/50 p-3 py-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
                                    <ShieldAlert className="mx-auto mb-1.5 h-5 w-5 text-slate-400" />
                                    <span className="block text-[10px] font-semibold text-gray-400">
                                        Belum Ada Data Survei
                                    </span>
                                    <span className="mt-0.5 block text-[9px] text-gray-400">
                                        Kecamatan ini belum memiliki jawaban
                                        responden yang tercatat.
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Kecamatan Ranking List */
                        filteredKecList.map((kec, index) => {
                            const isSelected = selectedKecCode === kec.code;
                            const hasData = kec.score > 0;

                            return (
                                <div
                                    key={kec.code}
                                    onClick={() => setSelectedKecCode(kec.code)}
                                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                                        isSelected
                                            ? 'border-[#355C7D] bg-[#355C7D]/5 dark:border-blue-500 dark:bg-[#355C7D]/10'
                                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-800/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-4 text-xs font-black text-gray-400">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <div className="text-xs font-extrabold text-gray-800 dark:text-white">
                                                Kec. {kec.name}
                                            </div>
                                            <div className="mt-0.5 text-[9px] text-gray-400">
                                                {kec.respondents} Responden
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`text-xs font-black ${hasData ? 'text-[#355C7D] dark:text-blue-400' : 'text-slate-400'}`}
                                        >
                                            {hasData
                                                ? kec.score.toFixed(2)
                                                : 'N/A'}
                                        </div>
                                        {hasData && (
                                            <span
                                                className={`py-0.2 mt-0.5 inline-block rounded px-1 text-[8px] font-black tracking-wide uppercase ${
                                                    kec.grade === 'A'
                                                        ? 'text-emerald-500'
                                                        : kec.grade === 'B'
                                                          ? 'text-blue-500'
                                                          : kec.grade === 'C'
                                                            ? 'text-amber-500'
                                                            : 'text-rose-500'
                                                }`}
                                            >
                                                Grade {kec.grade}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {filteredKecList.length === 0 && (
                        <div className="py-8 text-center text-xs text-gray-400">
                            Tidak ada kecamatan yang cocok.
                        </div>
                    )}
                </div>

                {/* Footer average info */}
                {filteredKecList.length > 0 && !selectedKecCode && (
                    <div className="mt-auto border-t border-gray-100 pt-3 dark:border-neutral-800">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-400">
                                Rerata Wilayah:
                            </span>
                            <span className="flex items-center gap-1 font-black text-gray-800 dark:text-white">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                {avgKec > 0 ? avgKec.toFixed(2) : 'N/A'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
