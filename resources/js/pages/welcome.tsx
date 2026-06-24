import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardCheck,
    Sparkles,
    Building,
    Landmark,
    ChevronDown,
    HelpCircle,
    Search,
    Quote,
    Award,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login } from '@/routes';

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
    const [selectedOpdId, setSelectedOpdId] = useState<number | null>(
        opds[0]?.id || null,
    );
    const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
    const [opdSearchQuery, setOpdSearchQuery] = useState('');
    const [unitSearchQuery, setUnitSearchQuery] = useState('');

    const filteredOpds = opds.filter(
        (o) =>
            o.name.toLowerCase().includes(opdSearchQuery.toLowerCase()) ||
            o.code.toLowerCase().includes(opdSearchQuery.toLowerCase()),
    );

    const selectedOpd = opds.find((o) => o.id === selectedOpdId);

    const filteredUnits = selectedOpd
        ? selectedOpd.units.filter(
              (u) =>
                  u.name
                      .toLowerCase()
                      .includes(unitSearchQuery.toLowerCase()) ||
                  u.code.toLowerCase().includes(unitSearchQuery.toLowerCase()),
          )
        : [];

    const toggleFaq = (index: number) => {
        setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
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
        lowest_indicator: {
            code: 'U3',
            name: 'Waktu Penyelesaian',
            score: 3.0,
        },
        highest_indicator: { code: 'U4', name: 'Biaya/Tarif', score: 3.8 },
    };

    const faqs = [
        {
            q: 'Apa itu Survei Kepuasan Masyarakat (SKM)?',
            a: 'SKM adalah kegiatan pengukuran secara komprehensif tentang tingkat kepuasan masyarakat terhadap kualitas pelayanan yang diberikan oleh penyelenggara pelayanan publik berdasarkan Permen PANRB No.14 Tahun 2017.',
        },
        {
            q: 'Apakah data pribadi saya aman dan dirahasiakan?',
            a: 'Ya. Partisipasi Anda dalam pengisian survei dapat dilakukan secara anonim. Jika Anda memasukkan data pribadi seperti NIK, hal tersebut digunakan semata-mata untuk mencegah data duplikat dan validasi statistik, serta tidak akan dipublikasikan.',
        },
        {
            q: 'Bagaimana cara membaca skor IKM?',
            a: 'Nilai IKM dikonversikan menjadi nilai 25-100. Nilai 88.31 - 100 mendapatkan mutu pelayanan A (Sangat Baik), 76.61 - 88.30 mutu pelayanan B (Baik), 65.00 - 76.60 mutu pelayanan C (Kurang Baik), dan di bawah 65.00 mutu pelayanan D (Tidak Baik).',
        },
        {
            q: 'Bagaimana tindak lanjut hasil survei?',
            a: 'Setiap OPD diwajibkan menyusun rekomendasi peningkatan dan rencana tindak lanjut perbaikan berkala atas indikator layanan yang mendapat nilai rendah.',
        },
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
        } else if (score25To100 >= 65.0) {
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
        <div
            className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <Head>
                <title>
                    SOPPENG - Sistem Terpadu Ukur Kepuasan Masyarakat Kabupaten
                    Soppeng
                </title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap"
                    rel="stylesheet"
                />
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
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#355C7D] p-2 text-white">
                            <Landmark className="h-6 w-6" />
                        </div>
                        <div>
                            <span className="block text-lg font-extrabold tracking-wider text-[#355C7D]">
                                SATUKAN
                            </span>
                            <span className="block text-[10px] font-medium tracking-widest text-gray-500 uppercase">
                                SKM Nasional Portal
                            </span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center rounded-lg bg-[#355C7D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                            >
                                Dashboard Admin
                            </Link>
                        ) : (
                            <Link
                                href={login()}
                                className="inline-flex items-center justify-center rounded-lg border border-[#355C7D]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#355C7D] shadow-sm transition-all hover:bg-gray-50"
                            >
                                Login Petugas
                            </Link>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0e1e38] via-[#122543] to-[#203b5f] py-20 text-white lg:py-28">
                {/* Glowing ambient blobs with animations */}
                <div className="animate-float-slow absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div
                    className="animate-float-medium absolute right-1/4 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-[#F4D35E]/5 blur-3xl"
                    style={{ animationDelay: '2s' }}
                ></div>

                {/* Beautiful clean SVG grid pattern */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-25"></div>
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_30%,rgba(244,211,94,0.06),transparent_60%)]"></div>

                <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
                    <div className="space-y-6 lg:col-span-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#F4D35E] shadow-sm">
                            <Sparkles className="h-4.5 w-4.5 animate-pulse text-[#F4D35E]" />
                            Permen PANRB No. 14 Tahun 2017
                        </div>
                        <h1
                            className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Suara Anda Menentukan <br />
                            <span className="bg-gradient-to-r from-[#F4D35E] to-[#ffd758] bg-clip-text text-transparent">
                                Kualitas Pelayanan Publik
                            </span>
                        </h1>
                        <p className="max-w-xl text-lg leading-relaxed font-light text-gray-200/95">
                            Selamat datang di Soppeng, Portal Pengukuran Survei
                            Kepuasan Masyarakat (SKM) Regional. Mari
                            bersama-sama wujudkan tata kelola pelayanan yang
                            prima dan akuntabel.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <a
                                href="#survey-portal"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F4D35E] to-[#ffd758] px-6 py-3 text-base font-semibold text-[#1F2937] shadow-lg transition-all duration-250 hover:-translate-y-0.5 hover:from-[#ffd758] hover:to-[#e2c14c] hover:shadow-[#F4D35E]/20"
                            >
                                Mulai Isi Survei
                                <ArrowRight className="h-5 w-5" />
                            </a>
                            <a
                                href="#skm-statistics"
                                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-205 hover:-translate-y-0.5 hover:bg-white/10"
                            >
                                Lihat Statistik Regional
                            </a>
                        </div>
                    </div>

                    {/* Overall Score Card */}
                    <div className="flex justify-center lg:col-span-5">
                        <div className="group w-full max-w-md space-y-6 rounded-3xl border border-white/15 bg-white/10 p-8 shadow-[0_8px_32px_0_rgba(15,23,42,0.37)] backdrop-blur-lg transition-all duration-300 hover:border-white/25 hover:shadow-2xl">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase">
                                    Skor Indeks Kepuasan (IKM)
                                </span>
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300">
                                    Nasional Sync Aktif
                                </span>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-start">
                                {/* SVG Circular Gauge */}
                                <div className="relative flex shrink-0 items-center justify-center">
                                    <svg className="h-28 w-28 -rotate-90 transform">
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
                                            strokeDashoffset={
                                                301.6 -
                                                (stats.score / 100) * 301.6
                                            }
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    {/* Centered score text */}
                                    <div className="absolute text-center">
                                        <span className="block text-2xl font-black tracking-tight text-white">
                                            {stats.score.toFixed(1)}
                                        </span>
                                        <span className="-mt-1 block text-[10px] font-bold tracking-wider text-gray-300 uppercase">
                                            IKM
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1 text-center sm:text-left">
                                    <div className="flex items-center justify-center gap-2 text-3xl font-extrabold sm:justify-start">
                                        Mutu:{' '}
                                        <span className="font-black text-[#F4D35E]">
                                            {stats.grade}
                                        </span>
                                    </div>
                                    <div className="text-gray-250 text-sm">
                                        Kategori:{' '}
                                        <span className="font-bold text-[#F4D35E]">
                                            {stats.grade_label}
                                        </span>
                                    </div>
                                    <div className="inline-block rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
                                        Tingkat Kepuasan Publik
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <span className="block text-xs text-gray-400">
                                        Total Responden
                                    </span>
                                    <span className="block text-lg font-bold tracking-tight">
                                        {stats.total_respondents.toLocaleString(
                                            'id-ID',
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400">
                                        Status Mutu
                                    </span>
                                    <span className="mt-1 inline-block rounded-lg border border-emerald-400/20 bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                                        Memenuhi Standar
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bupati Quote Section */}
            <section className="relative overflow-hidden bg-white py-16">
                <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-[#355C7D]/5 blur-3xl"></div>
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#355C7D] to-[#4c789a] p-8 text-white shadow-xl sm:p-12">
                        {/* Decorative background grid pattern inside card */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
                        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-[#F4D35E]/10 blur-2xl"></div>

                        <div className="relative z-10 grid items-center gap-8 md:grid-cols-12">
                            <div className="space-y-6 md:col-span-8">
                                <Quote className="h-10 w-10 text-[#F4D35E] opacity-80" />
                                <blockquote className="text-lg leading-relaxed font-medium text-slate-100 italic sm:text-xl">
                                    "Pelayanan publik yang prima tidak lahir
                                    dari keheningan, melainkan dari kritik dan
                                    saran konstruktif yang Anda berikan. Setiap
                                    lembar survei yang Anda isi adalah fondasi
                                    utama bagi kemajuan pelayanan publik di
                                    Kabupaten Soppeng."
                                </blockquote>
                                <div className="flex items-center gap-4 border-t border-white/20 pt-4">
                                    <div>
                                        <h5 className="text-base font-extrabold text-[#F4D35E] sm:text-lg">
                                            H. Suwardi Haseng, S.E.
                                        </h5>
                                        <p className="text-slate-350 mt-0.5 text-xs font-medium tracking-widest uppercase">
                                            Bupati Soppeng
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center md:col-span-4">
                                <div className="group relative">
                                    {/* Golden glow backplate */}
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#F4D35E] to-[#e2c14c] opacity-75 blur-md transition duration-300 group-hover:opacity-100"></div>
                                    <div className="relative flex h-44 w-44 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-[#1E293B] p-4 text-center">
                                        <div className="mb-2 rounded-full bg-white/10 p-3 text-[#F4D35E]">
                                            <Award className="h-10 w-10" />
                                        </div>
                                        <span className="text-gray-250 text-xs font-bold">
                                            Pemerintah Kabupaten
                                        </span>
                                        <span className="text-sm font-extrabold tracking-wider text-[#F4D35E] uppercase">
                                            SOPPENG
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics and Indicator breakdown */}
            <section
                id="skm-statistics"
                className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
            >
                <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
                    <h2
                        className="text-3xl font-extrabold text-[#355C7D]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Kinerja Pelayanan Berdasarkan Unsur
                    </h2>
                    <p className="text-gray-500">
                        Skor IKM regional dihitung berdasarkan rata-rata
                        tertimbang dari 9 unsur wajib pelayanan sesuai Permen
                        PANRB No. 14 Tahun 2017.
                    </p>
                </div>

                <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {defaultIndicators.map((ind) => {
                        // Find dynamic score if returned
                        const dbIndicator = stats.indicators?.[ind.code];
                        const displayScore = dbIndicator
                            ? dbIndicator.nrr
                            : ind.score;
                        const score25To100 = displayScore * 25;
                        const theme = getIndicatorTheme(score25To100);

                        return (
                            <div
                                key={ind.code}
                                className="group relative flex flex-col justify-between space-y-4 overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-305 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#355C7D] to-[#4c789a] opacity-0 transition-all duration-300 group-hover:opacity-100"></div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-lg bg-[#355C7D]/5 p-2 text-sm font-bold text-[#355C7D] transition-all duration-300 group-hover:bg-[#355C7D] group-hover:text-white">
                                            {ind.code}
                                        </div>
                                        <span
                                            className={`rounded border px-2 py-0.5 text-[10px] font-extrabold ${theme.bgLight}`}
                                        >
                                            {theme.grade}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div
                                            className={`text-lg font-black ${theme.textClass}`}
                                        >
                                            {score25To100.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Nilai: {displayScore.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="line-clamp-1 text-sm font-bold text-slate-700">
                                        {ind.name}
                                    </h4>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`bg-gradient-to-r ${theme.colorClass} h-2 rounded-full transition-all duration-500 ease-out`}
                                            style={{
                                                width: `${(displayScore / 4) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 rounded-3xl border border-[#355C7D]/10 bg-gradient-to-br from-[#355C7D]/5 to-[#507290]/5 p-6 md:grid-cols-2">
                    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                        <div className="mt-1 shrink-0 rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-rose-500">
                            <TrendingDown className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-gray-800 sm:text-base">
                                Indikator Terendah (Rekomendasi Utama)
                            </h4>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {stats.lowest_indicator
                                    ? `${stats.lowest_indicator.code} - ${stats.lowest_indicator.name} (Mutu: ${(stats.lowest_indicator.score * 25).toFixed(2)})`
                                    : 'Belum Terhitung'}
                            </p>
                            <span className="mt-2 inline-block text-xs font-semibold text-rose-600">
                                Memerlukan rencana aksi perbaikan dari OPD
                                terkait.
                            </span>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
                        <div className="mt-1 shrink-0 rounded-2xl border border-emerald-100 bg-emerald-50 p-3.5 text-emerald-500">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-gray-800 sm:text-base">
                                Indikator Tertinggi (Pertahankan & Apresiasi)
                            </h4>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {stats.highest_indicator
                                    ? `${stats.highest_indicator.code} - ${stats.highest_indicator.name} (Mutu: ${(stats.highest_indicator.score * 25).toFixed(2)})`
                                    : 'Belum Terhitung'}
                            </p>
                            <span className="mt-2 inline-block text-xs font-semibold text-emerald-600">
                                Apresiasi untuk performa layanan prima yang
                                konsisten.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Portal Pemilihan Unit & Survei */}
            <section
                id="survey-portal"
                className="relative border-y border-slate-100 bg-white py-20"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
                        <h2
                            className="text-3xl font-extrabold text-[#355C7D]"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Akses Survei Kepuasan Masyarakat
                        </h2>
                        <p className="text-gray-500">
                            Silakan pilih Organisasi Perangkat Daerah (OPD) dan
                            Unit Layanan tempat Anda baru saja menerima
                            pelayanan untuk mulai mengisi survei.
                        </p>
                    </div>

                    <div className="grid items-stretch gap-8 lg:grid-cols-12">
                        {/* OPD List Tabs */}
                        <div className="flex flex-col lg:col-span-4">
                            <h4 className="mb-4 flex items-center gap-2 text-xs font-extrabold tracking-wider text-gray-700 uppercase">
                                <Building className="h-4 w-4 text-[#355C7D]" />
                                Pilih Dinas / OPD
                            </h4>

                            <div className="relative mb-3">
                                <Search className="absolute top-3.5 left-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari dinas / instansi..."
                                    value={opdSearchQuery}
                                    onChange={(e) =>
                                        setOpdSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-4 pl-9 text-xs transition-all focus:border-[#355C7D] focus:ring-2 focus:ring-[#F4D35E]/40 focus:outline-none"
                                />
                            </div>

                            <div className="custom-scrollbar max-h-[480px] flex-1 space-y-2 overflow-y-auto pr-1.5">
                                {filteredOpds.length > 0 ? (
                                    filteredOpds.map((opd) => (
                                        <button
                                            key={opd.id}
                                            onClick={() => {
                                                setSelectedOpdId(opd.id);
                                                setUnitSearchQuery('');
                                            }}
                                            className={`group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border p-3.5 text-left transition-all ${
                                                selectedOpdId === opd.id
                                                    ? 'border-transparent bg-gradient-to-r from-[#355C7D] to-[#4c789a] font-bold text-white shadow-md shadow-[#355C7D]/15'
                                                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            {selectedOpdId === opd.id && (
                                                <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-md bg-[#F4D35E]"></span>
                                            )}
                                            <span className="line-clamp-1 pl-1 text-sm">
                                                {opd.name}
                                            </span>
                                            <Building
                                                className={`h-4 w-4 shrink-0 transition-transform duration-300 ${selectedOpdId === opd.id ? 'scale-110 text-[#F4D35E] opacity-90' : 'opacity-40 group-hover:translate-x-0.5'}`}
                                            />
                                        </button>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-4 py-12 text-center text-xs text-gray-400">
                                        Tidak ada dinas yang cocok.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Units list */}
                        <div className="flex flex-col rounded-3xl border border-slate-100 bg-slate-50/70 p-6 sm:p-8 lg:col-span-8">
                            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="space-y-1">
                                    <h4 className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-gray-700 uppercase">
                                        <Landmark className="h-4 w-4 text-[#355C7D]" />
                                        Unit Layanan Publik
                                    </h4>
                                    <p className="line-clamp-1 max-w-md text-[11px] font-semibold text-[#355C7D]">
                                        {selectedOpd ? selectedOpd.name : ''}
                                    </p>
                                </div>

                                {selectedOpd &&
                                    selectedOpd.units.length > 3 && (
                                        <div className="relative w-full sm:w-64">
                                            <Search className="absolute top-2.5 left-3 h-3.5 w-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Cari unit layanan..."
                                                value={unitSearchQuery}
                                                onChange={(e) =>
                                                    setUnitSearchQuery(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pr-3 pl-8 text-xs transition-all focus:border-[#355C7D] focus:ring-2 focus:ring-[#F4D35E]/40 focus:outline-none"
                                            />
                                        </div>
                                    )}
                            </div>

                            {selectedOpd && selectedOpd.units.length > 0 ? (
                                <div className="custom-scrollbar max-h-[480px] flex-1 space-y-3 overflow-y-auto pr-1.5">
                                    {filteredUnits.length > 0 ? (
                                        filteredUnits.map((unit) => {
                                            // Active survey token
                                            const token = `${unit.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-period-1`;

                                            return (
                                                <div
                                                    key={unit.id}
                                                    className="group flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex-1 space-y-1.5 pr-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="relative flex h-2 w-2">
                                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                                            </span>
                                                            <h5 className="text-sm leading-none font-extrabold text-slate-800 transition-colors group-hover:text-[#355C7D] sm:text-base">
                                                                {unit.name}
                                                            </h5>
                                                            <span className="text-slate-650 rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                                                                {unit.code}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 line-clamp-2 max-w-2xl text-xs text-slate-500 sm:text-sm">
                                                            {unit.description ||
                                                                'Pelayanan publik prima untuk warga.'}
                                                        </p>
                                                    </div>
                                                    <Link
                                                        href={`/public/survey/${token}`}
                                                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#355C7D] to-[#4c789a] px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:from-[#284964] hover:to-[#3b5e7d] hover:shadow-[#355C7D]/20 active:scale-[0.98] sm:text-sm"
                                                    >
                                                        Isi Survei
                                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                                    </Link>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 py-12 text-center text-xs text-gray-400">
                                            Tidak ada unit layanan yang cocok.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-gray-400">
                                    <ClipboardCheck className="text-slate-305 mx-auto h-12 w-12 stroke-1" />
                                    <p className="mt-3 text-sm font-medium">
                                        Tidak ada unit layanan yang aktif untuk
                                        OPD ini saat ini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Panduan Alur */}
            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
                    <h2
                        className="text-3xl font-extrabold text-[#355C7D]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        Alur Pengisian Survei
                    </h2>
                    <p className="text-gray-500">
                        Proses pengisian survei sangat cepat, sederhana, dan
                        dilindungi hukum untuk kerahasiaan identitas Anda.
                    </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            step: '01',
                            title: 'Pilih Unit Layanan',
                            desc: 'Pilih OPD dan unit layanan yang melayani Anda di portal ini atau langsung scan kode QR di loket.',
                        },
                        {
                            step: '02',
                            title: 'Profil Responden',
                            desc: 'Lengkapi data pendukung seperti rentang usia, pendidikan, pekerjaan. NIK bersifat opsional.',
                        },
                        {
                            step: '03',
                            title: 'Jawab 9 Unsur SKM',
                            desc: 'Berikan penilaian obyektif atas 9 unsur pelayanan wajib yang Anda rasakan.',
                        },
                        {
                            step: '04',
                            title: 'Kirim & Aduan',
                            desc: 'Tambahkan saran keluhan atau aduan secara terpadu sebelum mengirim data.',
                        },
                    ].map((step, idx) => (
                        <div
                            key={idx}
                            className="group relative space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-slate-200 hover:shadow-md"
                        >
                            <span className="block text-4xl font-black text-[#355C7D]/10 transition-all duration-300 group-hover:text-[#355C7D]/20">
                                {step.step}
                            </span>
                            <h4 className="text-base font-extrabold text-slate-800">
                                {step.title}
                            </h4>
                            <p className="text-xs leading-relaxed text-slate-500">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="border-t border-slate-100 bg-slate-50 py-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-16 space-y-4 text-center">
                        <h2
                            className="text-3xl font-extrabold text-[#355C7D]"
                            style={{
                                fontFamily: "'Space Grotesk', sans-serif",
                            }}
                        >
                            Pertanyaan yang Sering Diajukan (FAQ)
                        </h2>
                        <p className="text-gray-500">
                            Segala informasi terkait pengisian dan keamanan data
                            survei Anda.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left text-sm font-bold text-slate-800 transition-all hover:bg-slate-50/50 sm:text-base"
                                >
                                    <span className="flex items-center gap-3">
                                        <HelpCircle className="h-5 w-5 shrink-0 text-[#355C7D]" />
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ease-out ${faqOpen[idx] ? 'rotate-180 text-[#355C7D]' : ''}`}
                                    />
                                </button>
                                <div
                                    className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${faqOpen[idx] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="bg-slate-50/30 p-5 pt-0 text-sm leading-relaxed text-gray-500">
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
            <footer className="border-t border-gray-800 bg-[#1F2937] py-16 text-gray-300">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
                    <div className="space-y-4 md:col-span-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-white/10 p-2 text-[#F4D35E]">
                                <Landmark className="h-6 w-6" />
                            </div>
                            <span className="text-lg font-extrabold tracking-wider text-white">
                                SOPPENG
                            </span>
                        </div>
                        <p className="max-w-sm text-sm text-gray-400">
                            Sistem Terpadu Ukur Kepuasan Masyarakat Nasional.
                            Platform evaluasi pelayanan publik regional
                            berstandar Permen PANRB No. 14 Tahun 2017.
                        </p>
                    </div>

                    <div>
                        <h5 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
                            Dasar Hukum
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                UU No. 25 Tahun 2009 tentang Pelayanan Publik
                            </li>
                            <li>
                                Permen PANRB No. 14 Tahun 2017 tentang Pedoman
                                SKM
                            </li>
                            <li>Perpres No. 95 Tahun 2018 tentang SPBE</li>
                        </ul>
                    </div>

                    <div>
                        <h5 className="mb-4 text-sm font-bold tracking-wider text-white uppercase">
                            Kontak Teknis
                        </h5>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>Diskominfo Kabupaten Soppeng</li>
                            <li>Jl. Pemerintahan No. 1</li>
                            <li>Email: support@soppeng.go.id</li>
                        </ul>
                    </div>
                </div>

                <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-gray-800 px-4 pt-8 text-xs text-gray-500 sm:px-6 md:flex-row lg:px-8">
                    <p>
                        © 2026 Pemerintah Kabupaten Soppeng. Hak Cipta
                        Dilindungi Undang-Undang.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-gray-400">
                            Kebijakan Privasi
                        </a>
                        <a href="#" className="hover:text-gray-400">
                            Syarat Ketentuan
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
