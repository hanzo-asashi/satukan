import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Users, Award, Search, ArrowUpRight, ShieldAlert, Sparkles } from 'lucide-react';

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
        path: 'M 70 80 L 80 40 L 220 20 L 240 100 L 140 120 Z' 
    },
    { 
        name: 'Donri-Donri', 
        code: 'KEC-DONRIDONRI', 
        centroid: { x: 270, y: 70 }, 
        path: 'M 220 20 L 320 30 L 300 120 L 240 100 Z' 
    },
    { 
        name: 'Lilirilau', 
        code: 'KEC-LILIRILAU', 
        centroid: { x: 380, y: 100 }, 
        path: 'M 320 30 L 460 50 L 480 140 L 350 160 L 300 120 Z' 
    },
    { 
        name: 'Lalabata', 
        code: 'KEC-LALABATA', 
        centroid: { x: 145, y: 155 }, 
        path: 'M 60 170 L 70 80 L 140 120 L 240 100 L 250 180 L 160 210 Z' 
    },
    { 
        name: 'Ganra', 
        code: 'KEC-GANRA', 
        centroid: { x: 275, y: 142 }, 
        path: 'M 240 100 L 300 120 L 330 170 L 250 180 Z' 
    },
    { 
        name: 'Liliriaja', 
        code: 'KEC-LILIRIAJA', 
        centroid: { x: 320, y: 215 }, 
        path: 'M 250 180 L 330 170 L 350 160 L 420 230 L 290 260 Z' 
    },
    { 
        name: 'Citta', 
        code: 'KEC-CITTA', 
        centroid: { x: 440, y: 185 }, 
        path: 'M 350 160 L 480 140 L 520 210 L 420 230 Z' 
    },
    { 
        name: 'Marioriwawo', 
        code: 'KEC-MARIORIWAWO', 
        centroid: { x: 230, y: 280 }, 
        path: 'M 60 170 L 160 210 L 250 180 L 290 260 L 420 230 L 380 340 L 200 360 L 100 280 Z' 
    }
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
            y: e.clientY - rect.top
        });
    };

    // Calculate score details for a Kecamatan
    const getKecData = (code: string) => {
        const item = breakdown.find(b => b.code === code);
        return {
            id: item?.id ?? null,
            score: item?.score ?? 0,
            grade: item?.grade ?? 'D',
            grade_label: item?.grade_label ?? 'Belum ada data',
            respondents: item?.total_respondents ?? 0
        };
    };

    // Get color classes based on IKM score
    const getKecColorClass = (score: number, code: string) => {
        const isSelected = selectedKecCode === code;
        const baseClasses = "transition-all duration-300 cursor-pointer stroke-[1.5] hover:stroke-white hover:stroke-[3.5] hover:opacity-95 drop-shadow-sm";
        const selectedOutline = isSelected ? "stroke-white stroke-[4] filter brightness-110 drop-shadow-lg" : "stroke-slate-100 dark:stroke-neutral-900";

        if (score === 0) {
            return `${baseClasses} fill-slate-200 hover:fill-slate-300 dark:fill-neutral-800 dark:hover:fill-neutral-700 ${selectedOutline}`;
        }
        if (score >= 88.31) {
            return `${baseClasses} fill-emerald-500 hover:fill-emerald-600 dark:fill-emerald-600/90 dark:hover:fill-emerald-500/90 ${selectedOutline}`;
        }
        if (score >= 76.61) {
            return `${baseClasses} fill-blue-500 hover:fill-blue-600 dark:fill-blue-600/90 dark:hover:fill-blue-500/90 ${selectedOutline}`;
        }
        if (score >= 65.00) {
            return `${baseClasses} fill-amber-500 hover:fill-amber-600 dark:fill-amber-600/90 dark:hover:fill-amber-500/90 ${selectedOutline}`;
        }
        return `${baseClasses} fill-rose-500 hover:fill-rose-600 dark:fill-rose-600/90 dark:hover:fill-rose-500/90 ${selectedOutline}`;
    };

    const getGradeBadgeColorClass = (grade: string, score: number) => {
        if (score === 0) return 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300';
        switch (grade) {
            case 'A': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200';
            case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200';
            case 'C': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200';
            default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200';
        }
    };

    // Filter and sort kecamatans
    const filteredKecList = KECAMATAN_LIST.map(kec => {
        const data = getKecData(kec.code);
        return { ...kec, ...data };
    })
    .filter(kec => kec.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.score - a.score);

    const activeSelectedKec = KECAMATAN_LIST.find(k => k.code === selectedKecCode);
    const selectedData = selectedKecCode ? getKecData(selectedKecCode) : null;

    const totalKecWithData = filteredKecList.filter(k => k.score > 0);
    const avgKec = totalKecWithData.length > 0
        ? totalKecWithData.reduce((acc, curr) => acc + curr.score, 0) / totalKecWithData.length
        : 0;

    return (
        <div className="grid lg:grid-cols-12 gap-6">
            {/* Interactive Heatmap Map Card */}
            <div className="lg:col-span-8 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4 gap-4">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-base flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-[#355C7D]" />
                            Peta Spasial Kepuasan Pelayanan (Heatmap)
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Peta sebaran Indeks Kepuasan Masyarakat (IKM) Kecamatan di Kabupaten Soppeng.
                        </p>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 block"></span> A (Sangat Baik)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500 block"></span> B (Baik)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 block"></span> C (Kurang Baik)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 block"></span> D (Tidak Baik)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-neutral-800 block"></span> N/A (Kosong)</span>
                    </div>
                </div>

                {/* SVG Container */}
                <div 
                    className="relative flex items-center justify-center bg-slate-50/50 dark:bg-neutral-950/20 rounded-xl p-4 border border-slate-100 dark:border-neutral-800 h-[340px] overflow-hidden"
                    onMouseMove={handleMouseMove}
                >
                    <svg 
                        viewBox="0 0 560 380" 
                        className="w-full h-full max-h-[320px] select-none"
                    >
                        <g>
                            {KECAMATAN_LIST.map((kec) => {
                                const data = getKecData(kec.code);
                                const colorClass = getKecColorClass(data.score, kec.code);
                                const isSelected = selectedKecCode === kec.code;

                                return (
                                    <g key={kec.code}>
                                        <path
                                            d={kec.path}
                                            className={colorClass}
                                            onClick={() => setSelectedKecCode(isSelected ? null : kec.code)}
                                            onMouseEnter={() => setHoveredKec({ name: kec.name, ...data })}
                                            onMouseLeave={() => setHoveredKec(null)}
                                        />
                                        
                                        {/* Label text */}
                                        <text
                                            x={kec.centroid.x}
                                            y={kec.centroid.y}
                                            textAnchor="middle"
                                            onClick={() => setSelectedKecCode(isSelected ? null : kec.code)}
                                            className={`select-none pointer-events-none font-extrabold text-[9px] uppercase tracking-wider ${
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
                            className="absolute pointer-events-none bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-slate-100 dark:border-neutral-800 rounded-lg p-3 shadow-xl z-20 space-y-1.5 min-w-[140px] text-left transition-all duration-75"
                            style={{ 
                                left: `${tooltipPos.x + 15}px`, 
                                top: `${tooltipPos.y + 15}px` 
                            }}
                        >
                            <div className="font-extrabold text-xs text-gray-800 dark:text-white">Kec. {hoveredKec.name}</div>
                            <div className="border-t border-slate-100 dark:border-neutral-800 pt-1 flex items-center justify-between gap-4">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase">Skor IKM:</span>
                                <span className="text-xs font-black text-[#355C7D] dark:text-blue-400">
                                    {hoveredKec.score > 0 ? hoveredKec.score.toFixed(2) : '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase">Responden:</span>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{hoveredKec.respondents}</span>
                            </div>
                            {hoveredKec.score > 0 && (
                                <div className={`text-[8.5px] font-black px-1.5 py-0.5 rounded text-center uppercase tracking-wide ${getGradeBadgeColorClass(hoveredKec.grade, hoveredKec.score)}`}>
                                    {hoveredKec.grade_label}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Kecamatan Rankings & Detail Sidebar */}
            <div className="lg:col-span-4 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm flex flex-col h-[460px]">
                {/* Search */}
                <div className="space-y-4 border-b border-gray-100 dark:border-neutral-800 pb-4">
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-base">Peringkat Kecamatan</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Daftar performa per wilayah kecamatan.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari kecamatan..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-xs dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                        />
                    </div>
                </div>

                {/* List / Selection Detail */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-thin pr-1">
                    {selectedKecCode && selectedData && activeSelectedKec ? (
                        /* Selected Kecamatan Deep Info */
                        <div className="space-y-4 bg-slate-50/50 dark:bg-neutral-950/20 p-4 rounded-lg border border-slate-100 dark:border-neutral-800 animate-fadeIn">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">Kec. {activeSelectedKec.name}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium">Kode: {activeSelectedKec.code}</span>
                                </div>
                                <button 
                                    onClick={() => setSelectedKecCode(null)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    Tutup
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-md border border-slate-100 dark:border-neutral-800">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Skor IKM</span>
                                    <span className="text-xl font-black text-[#355C7D] dark:text-blue-400 block mt-1">
                                        {selectedData.score > 0 ? selectedData.score.toFixed(2) : '-'}
                                    </span>
                                </div>
                                <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-md border border-slate-100 dark:border-neutral-800">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Responden</span>
                                    <span className="text-xl font-black text-slate-800 dark:text-white block mt-1">
                                        {selectedData.respondents}
                                    </span>
                                </div>
                            </div>

                            {selectedData.score > 0 ? (
                                <div className="space-y-3">
                                    <div className="bg-white dark:bg-neutral-900 p-3 rounded-md border border-slate-100 dark:border-neutral-800 space-y-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Mutu Layanan</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${getGradeBadgeColorClass(selectedData.grade, selectedData.score)}`}>
                                                {selectedData.grade_label} ({selectedData.grade})
                                            </span>
                                        </div>
                                    </div>
                                    {selectedData.id && (
                                        <Link
                                            href={`/admin/units?opd_id=${selectedData.id}`}
                                            className="w-full inline-flex items-center justify-center px-3 py-2 text-xs font-bold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg transition-all gap-1 cursor-pointer"
                                        >
                                            Lihat Unit Pelayanan Kecamatan
                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-slate-100/50 dark:bg-neutral-900 p-3 rounded-md border border-dashed border-slate-200 dark:border-neutral-800 text-center py-5">
                                    <ShieldAlert className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                                    <span className="text-[10px] text-gray-400 font-semibold block">Belum Ada Data Survei</span>
                                    <span className="text-[9px] text-gray-400 block mt-0.5">Kecamatan ini belum memiliki jawaban responden yang tercatat.</span>
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
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-[#355C7D]/5 border-[#355C7D] dark:bg-[#355C7D]/10 dark:border-blue-500'
                                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50 dark:bg-neutral-900/40 dark:border-neutral-800 dark:hover:bg-neutral-800/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-gray-400 w-4">{index + 1}</span>
                                        <div>
                                            <div className="text-xs font-extrabold text-gray-800 dark:text-white">Kec. {kec.name}</div>
                                            <div className="text-[9px] text-gray-400 mt-0.5">{kec.respondents} Responden</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-black ${hasData ? 'text-[#355C7D] dark:text-blue-400' : 'text-slate-400'}`}>
                                            {hasData ? kec.score.toFixed(2) : 'N/A'}
                                        </div>
                                        {hasData && (
                                            <span className={`text-[8px] font-black px-1 py-0.2 rounded inline-block mt-0.5 uppercase tracking-wide ${
                                                kec.grade === 'A' ? 'text-emerald-500' :
                                                kec.grade === 'B' ? 'text-blue-500' :
                                                kec.grade === 'C' ? 'text-amber-500' : 'text-rose-500'
                                            }`}>
                                                Grade {kec.grade}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    
                    {filteredKecList.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-xs">
                            Tidak ada kecamatan yang cocok.
                        </div>
                    )}
                </div>
                
                {/* Footer average info */}
                {filteredKecList.length > 0 && !selectedKecCode && (
                    <div className="border-t border-gray-100 dark:border-neutral-800 pt-3 mt-auto">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-400">Rerata Wilayah:</span>
                            <span className="font-black text-gray-800 dark:text-white flex items-center gap-1">
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
