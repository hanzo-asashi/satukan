import { Head, Link } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { useState } from 'react';
import { ShieldCheck, ArrowRight, ClipboardCheck, Sparkles, Building, Landmark, ChevronDown, CheckCircle, HelpCircle, Star, Search, Quote, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface Unit {
    id: number;
    opd_id: number;
    name: string;
    code: string;
    description: string | null;
}

interface Opd {
    id: number;
    name: string;
    code: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    units: Unit[];
}

interface IndicatorDetail {
    code: string;
    name: string;
    nrr: number;
    nrr_weighted: number;
}

interface GlobalStats {
    score: number;
    grade: string;
    grade_label: string;
    total_respondents: number;
    lowest_indicator: { code: string; name: string; score: number } | null;
    highest_indicator: { code: string; name: string; score: number } | null;
    indicators?: Record<string, IndicatorDetail>;
}

interface WelcomeProps {
    opds: Opd[];
    globalStats: GlobalStats;
    auth: {
        user: any;
    };
}

export default function Welcome({ opds, globalStats, auth }: WelcomeProps) {
    const [selectedOpdId, setSelectedOpdId] = useState<number | null>(opds[0]?.id || null);
    const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
    const [opdSearchQuery, setOpdSearchQuery] = useState('');
    const [unitSearchQuery, setUnitSearchQuery] = useState('');

    const filteredOpds = opds.filter(o => 
        o.name.toLowerCase().includes(opdSearchQuery.toLowerCase()) ||
        o.code.toLowerCase().includes(opdSearchQuery.toLowerCase())
    );

    const selectedOpd = opds.find(o => o.id === selectedOpdId);

    const filteredUnits = selectedOpd 
        ? selectedOpd.units.filter(u =>
            u.name.toLowerCase().includes(unitSearchQuery.toLowerCase()) ||
            u.code.toLowerCase().includes(unitSearchQuery.toLowerCase())
          )
        : [];

    const toggleFaq = (index: number) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200';
            case 'B': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200';
            case 'C': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200';
            default: return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200';
        }
    };

    // Standard 9 Indicators fallback if none is seeded/returned yet
    const defaultIndicators = [
        { code: 'U1', name: 'Persyaratan', score: 3.2 },
        { code: 'U2', name: 'Prosedur', score: 3.1 },
        { code: 'U3', name: 'Waktu Penyelesaian', score: 3.0 },
        { code: 'U4', name: 'Biaya/Tarif', score: 3.8 },
        { code: 'U5', name: 'Produk Pelayanan', score: 3.3 },
        { code: 'U6', name: 'Kompetensi Pelaksana', score: 3.4 },
        { code: 'U7', name: 'Perilaku Pelaksana', score: 3.5 },
        { code: 'U8', name: 'Penanganan Pengaduan', score: 3.1 },
        { code: 'U9', name: 'Sarana & Prasarana', score: 3.2 },
    ];

    const stats = globalStats || {
        score: 82.5,
        grade: 'B',
        grade_label: 'Baik',
        total_respondents: 0,
        lowest_indicator: { code: 'U3', name: 'Waktu Penyelesaian', score: 3.0 },
        highest_indicator: { code: 'U4', name: 'Biaya/Tarif', score: 3.8 }
    };

    const faqs = [
        {
            q: "Apa itu Survei Kepuasan Masyarakat (SKM)?",
            a: "SKM adalah kegiatan pengukuran secara komprehensif tentang tingkat kepuasan masyarakat terhadap kualitas pelayanan yang diberikan oleh penyelenggara pelayanan publik berdasarkan Permen PANRB No.14 Tahun 2017."
        },
        {
            q: "Apakah data pribadi saya aman dan dirahasiakan?",
            a: "Ya. Partisipasi Anda dalam pengisian survei dapat dilakukan secara anonim. Jika Anda memasukkan data pribadi seperti NIK, hal tersebut digunakan semata-mata untuk mencegah data duplikat dan validasi statistik, serta tidak akan dipublikasikan."
        },
        {
            q: "Bagaimana cara membaca skor IKM?",
            a: "Nilai IKM dikonversikan menjadi nilai 25-100. Nilai 88.31 - 100 mendapatkan mutu pelayanan A (Sangat Baik), 76.61 - 88.30 mutu pelayanan B (Baik), 65.00 - 76.60 mutu pelayanan C (Kurang Baik), dan di bawah 65.00 mutu pelayanan D (Tidak Baik)."
        },
        {
            q: "Bagaimana tindak lanjut hasil survei?",
            a: "Setiap OPD diwajibkan menyusun rekomendasi peningkatan dan rencana tindak lanjut perbaikan berkala atas indikator layanan yang mendapat nilai rendah."
        }
    ];

    const getIndicatorTheme = (score25To100: number) => {
        if (score25To100 >= 88.31) {
            return {
                grade: 'A',
                colorClass: 'from-emerald-400 to-teal-500',
                bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                textClass: 'text-emerald-600',
            };
        } else if (score25To100 >= 76.61) {
            return {
                grade: 'B',
                colorClass: 'from-[#355C7D] to-[#4c789a]',
                bgLight: 'bg-blue-50 text-blue-800 border-blue-100',
                textClass: 'text-[#355C7D]',
            };
        } else if (score25To100 >= 65.00) {
            return {
                grade: 'C',
                colorClass: 'from-amber-400 to-orange-500',
                bgLight: 'bg-amber-50 text-amber-700 border-amber-100',
                textClass: 'text-amber-600',
            };
        } else {
            return {
                grade: 'D',
                colorClass: 'from-rose-400 to-red-500',
                bgLight: 'bg-rose-50 text-rose-700 border-rose-100',
                textClass: 'text-rose-600',
            };
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Head>
                <title>SOPPENG - Sistem Terpadu Ukur Kepuasan Masyarakat Kabupaten Soppeng</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet" />
                <style>{`
                    @keyframes float-slow {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-12px) scale(1.02); }
                    }
                    @keyframes float-medium {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(10px) scale(0.98); }
                    }
                    .animate-float-slow {
                        animation: float-slow 8s ease-in-out infinite;
                    }
                    .animate-float-medium {
                        animation: float-medium 6s ease-in-out infinite;
                    }
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(15, 23, 42, 0.02);
                        border-radius: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: rgba(53, 92, 125, 0.25);
                        border-radius: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(53, 92, 125, 0.45);
                    }
                `}</style>
            </Head>

            {/* Premium Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#355C7D] rounded-lg text-white">
                            <Landmark className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="font-extrabold text-lg tracking-wider text-[#355C7D] block">SATUKAN</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">SKM Nasional Portal</span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all"
                            >
                                Dashboard Admin
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-[#355C7D] bg-white border border-[#355C7D]/20 hover:bg-gray-50 rounded-lg shadow-sm transition-all"
                            >
                                Login Petugas
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0e1e38] via-[#122543] to-[#203b5f] text-white py-20 lg:py-28">
                {/* Glowing ambient blobs with animations */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-float-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F4D35E]/5 rounded-full blur-3xl -z-10 animate-float-medium" style={{ animationDelay: '2s' }}></div>
                
                {/* Beautiful clean SVG grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 -z-10"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,211,94,0.06),transparent_60%)] -z-10"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F4D35E] border border-white/10 text-xs font-semibold tracking-wider shadow-sm">
                            <Sparkles className="h-4.5 w-4.5 text-[#F4D35E] animate-pulse" />
                            Permen PANRB No. 14 Tahun 2017
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Suara Anda Menentukan <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4D35E] to-[#ffd758]">Kualitas Pelayanan Publik</span>
                        </h1>
                        <p className="text-lg text-gray-200/95 max-w-xl font-light leading-relaxed">
                            Selamat datang di Soppeng, Portal Pengukuran Survei Kepuasan Masyarakat (SKM) Regional. Mari bersama-sama wujudkan tata kelola pelayanan yang prima dan akuntabel.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <a
                                href="#survey-portal"
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-[#1F2937] bg-gradient-to-r from-[#F4D35E] to-[#ffd758] hover:from-[#ffd758] hover:to-[#e2c14c] rounded-xl shadow-lg hover:shadow-[#F4D35E]/20 transition-all duration-250 hover:-translate-y-0.5 gap-2"
                            >
                                Mulai Isi Survei
                                <ArrowRight className="h-5 w-5" />
                            </a>
                            <a
                                href="#skm-statistics"
                                className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl shadow-md transition-all duration-205 hover:-translate-y-0.5"
                            >
                                Lihat Statistik Regional
                            </a>
                        </div>
                    </div>

                    {/* Overall Score Card */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/15 shadow-[0_8px_32px_0_rgba(15,23,42,0.37)] space-y-6 hover:border-white/25 hover:shadow-2xl transition-all duration-300 group">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-300">Skor Indeks Kepuasan (IKM)</span>
                                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold tracking-wide">
                                    Nasional Sync Aktif
                                </span>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center sm:justify-start">
                                {/* SVG Circular Gauge */}
                                <div className="relative flex items-center justify-center shrink-0">
                                    <svg className="w-28 h-28 transform -rotate-90">
                                        {/* Outer circle shadow/background */}
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="48"
                                            className="stroke-white/10"
                                            strokeWidth="8"
                                            fill="transparent"
                                        />
                                        {/* Colored score track */}
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="48"
                                            className="stroke-[#F4D35E] drop-shadow-[0_0_8px_rgba(244,211,94,0.5)]"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={301.6}
                                            strokeDashoffset={301.6 - (stats.score / 100) * 301.6}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    {/* Centered score text */}
                                    <div className="absolute text-center">
                                        <span className="text-2xl font-black tracking-tight text-white block">{stats.score.toFixed(1)}</span>
                                        <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block -mt-1">IKM</span>
                                    </div>
                                </div>

                                <div className="text-center sm:text-left space-y-1">
                                    <div className="text-3xl font-extrabold flex items-center justify-center sm:justify-start gap-2">
                                        Mutu: <span className="text-[#F4D35E] font-black">{stats.grade}</span>
                                    </div>
                                    <div className="text-sm text-gray-250">Kategori: <span className="font-bold text-[#F4D35E]">{stats.grade_label}</span></div>
                                    <div className="text-[11px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded inline-block">
                                        Tingkat Kepuasan Publik
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <span className="text-xs text-gray-400 block">Total Responden</span>
                                    <span className="text-lg font-bold block tracking-tight">{stats.total_respondents.toLocaleString('id-ID')}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-400 block">Status Mutu</span>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg inline-block mt-1 border border-emerald-400/20">
                                        Memenuhi Standar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bupati Quote Section */}
            <section className="py-16 bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#355C7D]/5 rounded-full blur-3xl -z-10"></div>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-[#355C7D] to-[#4c789a] rounded-3xl p-8 sm:p-12 shadow-xl relative text-white overflow-hidden">
                        {/* Decorative background grid pattern inside card */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#F4D35E]/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
                            <div className="md:col-span-8 space-y-6">
                                <Quote className="h-10 w-10 text-[#F4D35E] opacity-80" />
                                <blockquote className="text-lg sm:text-xl font-medium italic leading-relaxed text-slate-100">
                                    "Pelayanan publik yang prima tidak lahir dari keheningan, melainkan dari kritik dan saran konstruktif yang Anda berikan. Setiap lembar survei yang Anda isi adalah fondasi utama bagi kemajuan pelayanan publik di Kabupaten Soppeng."
                                </blockquote>
                                <div className="border-t border-white/20 pt-4 flex items-center gap-4">
                                    <div>
                                        <h5 className="font-extrabold text-[#F4D35E] text-base sm:text-lg">H. Suwardi Haseng, S.E.</h5>
                                        <p className="text-xs text-slate-350 uppercase tracking-widest font-medium mt-0.5">Bupati Soppeng</p>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-4 flex justify-center">
                                <div className="relative group">
                                    {/* Golden glow backplate */}
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#F4D35E] to-[#e2c14c] opacity-75 blur-md group-hover:opacity-100 transition duration-300"></div>
                                    <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-[#1E293B] border-2 border-white/20 flex flex-col items-center justify-center text-center p-4">
                                        <div className="p-3 bg-white/10 rounded-full text-[#F4D35E] mb-2">
                                            <Award className="h-10 w-10" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-250">Pemerintah Kabupaten</span>
                                        <span className="text-sm font-extrabold text-[#F4D35E] uppercase tracking-wider">SOPPENG</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics and Indicator breakdown */}
            <section id="skm-statistics" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl font-extrabold text-[#355C7D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Kinerja Pelayanan Berdasarkan Unsur</h2>
                    <p className="text-gray-500">
                        Skor IKM regional dihitung berdasarkan rata-rata tertimbang dari 9 unsur wajib pelayanan sesuai Permen PANRB No. 14 Tahun 2017.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {defaultIndicators.map((ind) => {
                        // Find dynamic score if returned
                        const dbIndicator = stats.indicators?.[ind.code];
                        const displayScore = dbIndicator ? dbIndicator.nrr : ind.score;
                        const score25To100 = displayScore * 25;
                        const theme = getIndicatorTheme(score25To100);
                        
                        return (
                            <div key={ind.code} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-305 group relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-all duration-300 from-[#355C7D] to-[#4c789a]"></div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-[#355C7D]/5 rounded-lg font-bold text-[#355C7D] text-sm group-hover:bg-[#355C7D] group-hover:text-white transition-all duration-300">{ind.code}</div>
                                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded border ${theme.bgLight}`}>{theme.grade}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-black ${theme.textClass}`}>{score25To100.toFixed(2)}</div>
                                        <div className="text-xs text-gray-400">Nilai: {displayScore.toFixed(2)}</div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{ind.name}</h4>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                                        <div 
                                            className={`bg-gradient-to-r ${theme.colorClass} h-2 rounded-full transition-all duration-500 ease-out`} 
                                            style={{ width: `${(displayScore / 4) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-gradient-to-br from-[#355C7D]/5 to-[#507290]/5 rounded-3xl p-6 border border-[#355C7D]/10">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-slate-100">
                        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl shrink-0 mt-1">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-gray-800 text-sm sm:text-base">Indikator Terendah (Rekomendasi Utama)</h4>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                                {stats.lowest_indicator ? `${stats.lowest_indicator.code} - ${stats.lowest_indicator.name} (Mutu: ${(stats.lowest_indicator.score * 25).toFixed(2)})` : 'Belum Terhitung'}
                            </p>
                            <span className="text-xs text-rose-600 font-semibold inline-block mt-2">Memerlukan rencana aksi perbaikan dari OPD terkait.</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm border border-slate-100">
                        <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-2xl shrink-0 mt-1">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-extrabold text-gray-800 text-sm sm:text-base">Indikator Tertinggi (Pertahankan & Apresiasi)</h4>
                            <p className="text-sm font-semibold text-slate-700 mt-1">
                                {stats.highest_indicator ? `${stats.highest_indicator.code} - ${stats.highest_indicator.name} (Mutu: ${(stats.highest_indicator.score * 25).toFixed(2)})` : 'Belum Terhitung'}
                            </p>
                            <span className="text-xs text-emerald-600 font-semibold inline-block mt-2">Apresiasi untuk performa layanan prima yang konsisten.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portal Pemilihan Unit & Survei */}
            <section id="survey-portal" className="py-20 bg-white border-y border-slate-100 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl font-extrabold text-[#355C7D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Akses Survei Kepuasan Masyarakat</h2>
                        <p className="text-gray-500">
                            Silakan pilih Organisasi Perangkat Daerah (OPD) dan Unit Layanan tempat Anda baru saja menerima pelayanan untuk mulai mengisi survei.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                        {/* OPD List Tabs */}
                        <div className="lg:col-span-4 flex flex-col">
                            <h4 className="font-extrabold text-gray-700 text-xs tracking-wider uppercase mb-4 flex items-center gap-2">
                                <Building className="h-4 w-4 text-[#355C7D]" />
                                Pilih Dinas / OPD
                            </h4>
                            
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari dinas / instansi..."
                                    value={opdSearchQuery}
                                    onChange={(e) => setOpdSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4D35E]/40 focus:border-[#355C7D] bg-white transition-all"
                                />
                            </div>

                            <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1.5 custom-scrollbar flex-1">
                                {filteredOpds.length > 0 ? (
                                    filteredOpds.map((opd) => (
                                        <button
                                            key={opd.id}
                                            onClick={() => {
                                                setSelectedOpdId(opd.id);
                                                setUnitSearchQuery('');
                                            }}
                                            className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer relative overflow-hidden group ${
                                                selectedOpdId === opd.id
                                                    ? 'border-transparent bg-gradient-to-r from-[#355C7D] to-[#4c789a] text-white font-bold shadow-md shadow-[#355C7D]/15'
                                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            {selectedOpdId === opd.id && (
                                                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#F4D35E] rounded-r-md"></span>
                                            )}
                                            <span className="text-sm line-clamp-1 pl-1">{opd.name}</span>
                                            <Building className={`h-4 w-4 shrink-0 transition-transform duration-300 ${selectedOpdId === opd.id ? 'opacity-90 scale-110 text-[#F4D35E]' : 'opacity-40 group-hover:translate-x-0.5'}`} />
                                        </button>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-gray-200 p-4">
                                        Tidak ada dinas yang cocok.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Units list */}
                        <div className="lg:col-span-8 bg-slate-50/70 rounded-3xl p-6 sm:p-8 border border-slate-100 flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="space-y-1">
                                    <h4 className="font-extrabold text-gray-700 text-xs tracking-wider uppercase flex items-center gap-2">
                                        <Landmark className="h-4 w-4 text-[#355C7D]" />
                                        Unit Layanan Publik
                                    </h4>
                                    <p className="text-[11px] text-[#355C7D] font-semibold max-w-md line-clamp-1">{selectedOpd ? selectedOpd.name : ''}</p>
                                </div>
                                
                                {selectedOpd && selectedOpd.units.length > 3 && (
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cari unit layanan..."
                                            value={unitSearchQuery}
                                            onChange={(e) => setUnitSearchQuery(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4D35E]/40 focus:border-[#355C7D] bg-white transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {selectedOpd && selectedOpd.units.length > 0 ? (
                                <div className="max-h-[480px] overflow-y-auto space-y-3 pr-1.5 custom-scrollbar flex-1">
                                    {filteredUnits.length > 0 ? (
                                        filteredUnits.map((unit) => {
                                            // Active survey token
                                            const token = `${unit.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-period-1`;
                                            return (
                                                <div key={unit.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-200 hover:shadow-md transition-all duration-300 group">
                                                    <div className="space-y-1.5 flex-1 pr-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            <h5 className="font-extrabold text-slate-800 text-sm sm:text-base leading-none group-hover:text-[#355C7D] transition-colors">{unit.name}</h5>
                                                            <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">{unit.code}</span>
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-slate-500 mt-2 line-clamp-2 max-w-2xl">{unit.description || 'Pelayanan publik prima untuk warga.'}</p>
                                                    </div>
                                                    <Link
                                                        href={`/public/survey/${token}`}
                                                        className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#355C7D] to-[#4c789a] hover:from-[#284964] hover:to-[#3b5e7d] rounded-xl shadow-md hover:shadow-[#355C7D]/20 shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] gap-1.5 cursor-pointer"
                                                    >
                                                        Isi Survei
                                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-gray-400 text-xs bg-white rounded-2xl border border-dashed border-gray-200 p-4">
                                            Tidak ada unit layanan yang cocok.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <ClipboardCheck className="h-12 w-12 mx-auto stroke-1 text-slate-305" />
                                    <p className="mt-3 text-sm font-medium">Tidak ada unit layanan yang aktif untuk OPD ini saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Panduan Alur */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl font-extrabold text-[#355C7D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Alur Pengisian Survei</h2>
                    <p className="text-gray-500">
                        Proses pengisian survei sangat cepat, sederhana, dan dilindungi hukum untuk kerahasiaan identitas Anda.
                    </p>
                </div>
 
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { step: "01", title: "Pilih Unit Layanan", desc: "Pilih OPD dan unit layanan yang melayani Anda di portal ini atau langsung scan kode QR di loket." },
                        { step: "02", title: "Profil Responden", desc: "Lengkapi data pendukung seperti rentang usia, pendidikan, pekerjaan. NIK bersifat opsional." },
                        { step: "03", title: "Jawab 9 Unsur SKM", desc: "Berikan penilaian obyektif atas 9 unsur pelayanan wajib yang Anda rasakan." },
                        { step: "04", title: "Kirim & Aduan", desc: "Tambahkan saran keluhan atau aduan secara terpadu sebelum mengirim data." }
                    ].map((step, idx) => (
                        <div key={idx} className="relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md hover:border-slate-200 transition-all duration-300 group">
                            <span className="text-4xl font-black text-[#355C7D]/10 group-hover:text-[#355C7D]/20 transition-all duration-300 block">{step.step}</span>
                            <h4 className="font-extrabold text-slate-800 text-base">{step.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-extrabold text-[#355C7D]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Pertanyaan yang Sering Diajukan (FAQ)</h2>
                        <p className="text-gray-500">Segala informasi terkait pengisian dan keamanan data survei Anda.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-800 text-sm sm:text-base hover:bg-slate-50/50 transition-all gap-4 cursor-pointer"
                                >
                                    <span className="flex items-center gap-3">
                                        <HelpCircle className="h-5 w-5 text-[#355C7D] shrink-0" />
                                        {faq.q}
                                    </span>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 ease-out ${faqOpen[idx] ? 'rotate-180 text-[#355C7D]' : ''}`} />
                                </button>
                                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${faqOpen[idx] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        <div className="p-5 pt-0 text-sm text-gray-500 leading-relaxed bg-slate-50/30">
                                            <div className="border-t border-slate-100/85 pt-4">
                                                {faq.a}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Footer */}
            <footer className="bg-[#1F2937] text-gray-300 py-16 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg text-[#F4D35E]">
                                <Landmark className="h-6 w-6" />
                            </div>
                            <span className="font-extrabold text-lg text-white tracking-wider">SOPPENG</span>
                        </div>
                        <p className="text-sm text-gray-400 max-w-sm">
                            Sistem Terpadu Ukur Kepuasan Masyarakat Nasional. Platform evaluasi pelayanan publik regional berstandar Permen PANRB No. 14 Tahun 2017.
                        </p>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Dasar Hukum</h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>UU No. 25 Tahun 2009 tentang Pelayanan Publik</li>
                            <li>Permen PANRB No. 14 Tahun 2017 tentang Pedoman SKM</li>
                            <li>Perpres No. 95 Tahun 2018 tentang SPBE</li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-bold text-white mb-4 uppercase tracking-wider text-sm">Kontak Teknis</h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Diskominfo Kabupaten Soppeng</li>
                            <li>Jl. Pemerintahan No. 1</li>
                            <li>Email: support@soppeng.go.id</li>
                        </ul>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
                    <p>© 2026 Pemerintah Kabupaten Soppeng. Hak Cipta Dilindungi Undang-Undang.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-gray-400">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-gray-400">Syarat Ketentuan</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
