import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Landmark, ArrowLeft, ArrowRight, CheckCircle2, User, Smile, Frown, Sparkles, AlertCircle, Monitor, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
    id: number;
    indicator_code: string;
    indicator_name: string;
    question_text: string;
    scale_1_label: string;
    scale_2_label: string;
    scale_3_label: string;
    scale_4_label: string;
}

interface Unit {
    id: number;
    name: string;
    opd: {
        name: string;
    };
}

interface Survey {
    id: number;
    title: string;
    description: string | null;
    token: string;
    unit: Unit;
    questions: Question[];
}

interface SurveyProps {
    survey: Survey;
}

export default function SurveyPage({ survey }: SurveyProps) {
    const [step, setStep] = useState(1);
    const [isAnonymous, setIsAnonymous] = useState(false);
    
    // Kiosk Mode States
    const [isKiosk, setIsKiosk] = useState(false);
    const [kioskStep, setKioskStep] = useState(0); // 0: Start screen, 1-9: Questions, 10: Thank you screen
    const [submittingKiosk, setSubmittingKiosk] = useState(false);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initial form state
    const { data, setData, post, processing, errors } = useForm({
        survey_id: survey.id,
        respondent: {
            nik: '',
            name: '',
            gender: '' as 'L' | 'P' | '',
            age: '' as number | '',
            education: '',
            job: '',
            phone: '',
            email: '',
        },
        answers: survey.questions.map(q => ({
            question_id: q.id,
            score: 0,
        })),
        complaint: {
            content: '',
        }
    });

    // Detect kiosk mode query param (?kiosk=1) on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('kiosk') === '1') {
            setIsKiosk(true);
            setKioskStep(0);
        }
    }, []);

    // Kiosk Mode Activity Tracker & Auto-Reset (15 seconds)
    const resetIdleTimer = () => {
        if (!isKiosk) return;
        
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        
        idleTimerRef.current = setTimeout(() => {
            // Only reset if we are active on a question screen
            if (kioskStep > 0 && kioskStep < 10) {
                toast.info('Sesi direset karena tidak ada aktivitas.');
                resetKiosk();
            }
        }, 15000); // 15 seconds idle timeout
    };

    useEffect(() => {
        if (isKiosk) {
            resetIdleTimer();
            
            const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            const handleActivity = () => resetIdleTimer();
            
            events.forEach(event => {
                window.addEventListener(event, handleActivity);
            });
            
            return () => {
                if (idleTimerRef.current) {
                    clearTimeout(idleTimerRef.current);
                }
                events.forEach(event => {
                    window.removeEventListener(event, handleActivity);
                });
            };
        }
    }, [isKiosk, kioskStep]);

    // Handle resetting kiosk state
    const resetKiosk = () => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        setKioskStep(0);
        setSubmittingKiosk(false);
        setData('answers', survey.questions.map(q => ({
            question_id: q.id,
            score: 0,
        })));
    };

    const handleRespondentChange = (key: string, value: any) => {
        setData('respondent', {
            ...data.respondent,
            [key]: value,
        });
    };

    const handleAnswerChange = (questionId: number, score: number) => {
        const updatedAnswers = data.answers.map(ans => {
            if (ans.question_id === questionId) {
                return { ...ans, score };
            }
            return ans;
        });
        setData('answers', updatedAnswers);
    };

    // Kiosk Mode answer handler with auto-advance and auto-submit
    const handleKioskAnswer = (questionId: number, score: number) => {
        const updatedAnswers = data.answers.map(ans => {
            if (ans.question_id === questionId) {
                return { ...ans, score };
            }
            return ans;
        });
        
        // Update local answers state
        setData('answers', updatedAnswers);

        // If it's the last question (index 8), trigger immediate submit in background
        if (kioskStep === survey.questions.length) {
            setSubmittingKiosk(true);
            
            const payload = {
                survey_id: survey.id,
                answers: updatedAnswers,
                respondent: {
                    nik: '',
                    name: 'Responden Kiosk',
                    gender: 'L', // default demographic placeholders
                    age: 30,
                    education: 'SMA',
                    job: 'Lainnya',
                    phone: '',
                    email: '',
                },
                complaint: {
                    content: '',
                }
            };

            router.post('/public/survey/submit', payload, {
                onSuccess: () => {
                    setKioskStep(10); // Transition to Thank You screen
                    // Auto reset thank you screen back to start page after 4 seconds
                    setTimeout(() => {
                        resetKiosk();
                    }, 4000);
                },
                onError: () => {
                    toast.error('Gagal mengirim jawaban. Mengulang survei...');
                    resetKiosk();
                }
            });
        } else {
            // Auto advance to next question
            setKioskStep(prev => prev + 1);
        }
    };

    const handleNextStep = () => {
        if (step === 1) {
            // Validate Respondent details if not anonymous
            if (!isAnonymous) {
                if (!data.respondent.gender) {
                    toast.error('Pilih jenis kelamin Anda');
                    return;
                }
                if (!data.respondent.age) {
                    toast.error('Masukkan usia Anda');
                    return;
                }
                if (!data.respondent.education) {
                    toast.error('Pilih jenjang pendidikan terakhir Anda');
                    return;
                }
                if (!data.respondent.job) {
                    toast.error('Pilih pekerjaan Anda');
                    return;
                }
            } else {
                // Populate anonymous placeholders but keep demographics
                if (!data.respondent.gender || !data.respondent.age || !data.respondent.education || !data.respondent.job) {
                    toast.error('Mohon lengkapi data demografi (Usia, Kelamin, Pendidikan, Pekerjaan) meskipun dalam mode Anonim.');
                    return;
                }
            }
            setStep(2);
        } else if (step === 2) {
            // Validate all questions answered
            const unanswered = data.answers.some(ans => ans.score === 0);
            if (unanswered) {
                toast.error('Mohon jawab seluruh 9 pertanyaan unsur kepuasan.');
                return;
            }
            setStep(3);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/public/survey/submit', {
            onSuccess: () => {
                toast.success('Survei berhasil dikirim! Terima kasih.');
            },
            onError: (err) => {
                if (err.message) {
                    toast.error(err.message);
                } else {
                    toast.error('Gagal mengirim survei. Silakan periksa kembali isian Anda.');
                }
            }
        });
    };

    const educationOptions = ['SD', 'SMP', 'SMA', 'Diploma (D1-D4)', 'Sarjana (S1)', 'Magister (S2)', 'Doktor (S3)'];
    const jobOptions = ['PNS / ASN', 'Pegawai Swasta', 'TNI / POLRI', 'Wirausaha / Pedagang', 'Petani / Buruh', 'Pelajar / Mahasiswa', 'Ibu Rumah Tangga', 'Lainnya'];

    // -------------------------------------------------------------
    // RENDER KIOSK MODE INTERFACE
    // -------------------------------------------------------------
    if (isKiosk) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-6 select-none relative overflow-hidden">
                <Head title={`Mode Kiosk - ${survey.unit.name}`} />

                {/* Subtle Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#355C7D]/15 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Kiosk Header */}
                <div className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-white/5 pb-4 z-10">
                    <div className="flex items-center gap-2.5 text-blue-400">
                        <Landmark className="h-7 w-7" />
                        <span className="font-black text-lg tracking-widest text-white">SATUKAN</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Loket Layanan Kiosk</span>
                        <span className="text-sm font-black text-blue-400">{survey.unit.name}</span>
                    </div>
                </div>

                {/* Main Interactive Screen */}
                <div className="w-full max-w-4xl mx-auto flex-grow flex flex-col justify-center py-8 z-10">
                    
                    {/* Kiosk Step 0: Welcome Screen */}
                    {kioskStep === 0 && (
                        <div className="text-center space-y-8 animate-fadeIn">
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center p-5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-2">
                                    <Monitor className="h-12 w-12 text-blue-400" />
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                    SURVEI KEPUASAN MASYARAKAT
                                </h1>
                                <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                                    Satu ketukan Anda membantu kami mengevaluasi dan meningkatkan layanan publik di <span className="text-white font-bold">{survey.unit.opd.name}</span>.
                                </p>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => setKioskStep(1)}
                                    className="px-10 py-5 bg-gradient-to-r from-blue-600 to-[#355C7D] hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg sm:text-xl rounded-2xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all duration-300 transform active:scale-95 cursor-pointer uppercase tracking-widest border border-white/10"
                                >
                                    Sentuh untuk Memulai
                                </button>
                            </div>
                        </div>
                    )}

                    {kioskStep >= 1 && kioskStep <= 9 && (
                        <div className="space-y-8 animate-fadeIn">
                            {/* Question Header & Progress */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    <span>Unsur: {survey.questions[kioskStep - 1].indicator_name}</span>
                                    <span className="text-blue-400">Pertanyaan {kioskStep} dari {survey.questions.length}</span>
                                </div>
                                {/* Visual progress indicators */}
                                <div className="h-2 bg-white/5 rounded-full flex overflow-hidden">
                                    {survey.questions.map((_, idx) => (
                                        <div 
                                            key={idx}
                                            className={`flex-1 h-full border-r border-slate-900 last:border-0 transition-all duration-300 ${
                                                idx < kioskStep ? 'bg-blue-500' : 'bg-white/5'
                                            }`}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Large Question Text */}
                            <div className="bg-white/[0.02] border border-white/5 p-6 sm:p-8 rounded-2xl">
                                <h2 className="text-xl sm:text-2xl font-bold leading-normal text-slate-100 text-center">
                                    {survey.questions[kioskStep - 1].question_text}
                                </h2>
                            </div>

                            {/* Giant Tap Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { val: 1, emoji: '😠', label: survey.questions[kioskStep - 1].scale_1_label, color: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500 text-red-400' },
                                    { val: 2, emoji: '🙁', label: survey.questions[kioskStep - 1].scale_2_label, color: 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500 text-orange-400' },
                                    { val: 3, emoji: '😐', label: survey.questions[kioskStep - 1].scale_3_label, color: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500 text-blue-400' },
                                    { val: 4, emoji: '😄', label: survey.questions[kioskStep - 1].scale_4_label, color: 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500 text-emerald-400' },
                                ].map((opt) => (
                                    <button
                                        key={opt.val}
                                        type="button"
                                        disabled={submittingKiosk}
                                        onClick={() => handleKioskAnswer(survey.questions[kioskStep - 1].id, opt.val)}
                                        className={`p-6 sm:p-8 rounded-2xl border-2 flex flex-col items-center justify-between text-center gap-3 transition-all duration-150 transform active:scale-95 cursor-pointer disabled:opacity-50 ${opt.color}`}
                                    >
                                        <span className="text-4xl sm:text-5xl">{opt.emoji}</span>
                                        <div className="space-y-1">
                                            <span className="text-xl sm:text-2xl font-black block">{opt.val}</span>
                                            <span className="text-xs sm:text-sm font-semibold tracking-wide uppercase opacity-90">{opt.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Back control */}
                            <div className="flex justify-start">
                                <button
                                    type="button"
                                    onClick={() => setKioskStep(prev => prev - 1)}
                                    className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-all gap-1.5 cursor-pointer"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Kembali ke unsur sebelumnya
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Kiosk Step 10: Thank You Screen */}
                    {kioskStep === 10 && (
                        <div className="text-center space-y-6 py-6 animate-scaleIn">
                            <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-bounce">
                                <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-400">TERIMA KASIH!</h1>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-100">Penilaian Anda Berhasil Terkirim</h3>
                            </div>
                            <p className="text-slate-400 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
                                Tanggapan Anda sangat bernilai untuk mewujudkan pelayanan publik Kabupaten Soppeng yang transparan, berkualitas, dan akuntabel.
                            </p>
                            <div className="pt-4 flex items-center justify-center gap-2 text-slate-500 text-xs font-semibold">
                                <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                                <span>Mempersiapkan layar untuk pengisian berikutnya...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Kiosk Footer Admin Toggles */}
                <div className="w-full max-w-4xl mx-auto flex items-center justify-between border-t border-white/5 pt-4 text-slate-500 text-[10px] sm:text-xs z-10 font-bold uppercase tracking-wider">
                    <span>SATUKAN Kiosk Mode • Auto-reset aktif</span>
                    <button
                        type="button"
                        onClick={() => {
                            setIsKiosk(false);
                            setStep(1);
                        }}
                        className="text-slate-500 hover:text-white transition-all cursor-pointer"
                    >
                        Keluar Mode Kios
                    </button>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------
    // RENDER STANDARD DESKTOP/MOBILE PORTAL INTERFACE
    // -------------------------------------------------------------
    return (
        <div className="min-h-screen bg-[#F7F9FC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between relative">
            <Head title={`Survei - ${survey.unit.name}`} />

            {/* Admin trigger to enter Kiosk Mode */}
            <div className="absolute top-4 right-4">
                <button
                    type="button"
                    onClick={() => {
                        setIsKiosk(true);
                        setKioskStep(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
                >
                    <Monitor className="h-3.5 w-3.5 text-[#355C7D]" />
                    Mode Kios Tablet
                </button>
            </div>

            {/* Header branding */}
            <div className="max-w-3xl mx-auto w-full mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2 text-[#355C7D]">
                    <Landmark className="h-8 w-8" />
                    <span className="font-extrabold text-xl tracking-wider">SATUKAN</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{survey.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{survey.unit.opd.name} - {survey.unit.name}</p>
            </div>

            {/* Main questionnaire card */}
            <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex-grow flex flex-col justify-between">
                {/* Progress bar */}
                <div className="bg-gray-100 h-1.5 w-full flex">
                    <div className={`bg-[#355C7D] h-1.5 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
                </div>

                <div className="p-6 sm:p-10 flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* STEP 1: RESPONDENT PROFILE */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="border-b border-gray-100 pb-4">
                                    <h3 className="text-lg font-bold text-[#355C7D] flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Langkah 1: Profil Responden
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">Data demografi diperlukan untuk keperluan validasi statistik Indeks Kepuasan Masyarakat (IKM).</p>
                                </div>

                                <div className="flex items-center justify-between bg-[#355C7D]/5 p-4 rounded-xl border border-[#355C7D]/10">
                                    <div>
                                        <span className="font-bold text-sm text-[#355C7D] block">Isi Sebagai Anonim</span>
                                        <span className="text-xs text-gray-500">Nama, NIK, Telepon, & Email Anda akan disembunyikan.</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isAnonymous}
                                            onChange={(e) => {
                                                setIsAnonymous(e.target.checked);
                                                if (e.target.checked) {
                                                    handleRespondentChange('name', 'Anonymous');
                                                    handleRespondentChange('nik', '');
                                                    handleRespondentChange('phone', '');
                                                    handleRespondentChange('email', '');
                                                } else {
                                                    handleRespondentChange('name', '');
                                                }
                                            }}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#355C7D]"></div>
                                    </label>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* NIK */}
                                    {!isAnonymous && (
                                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                                            <label className="text-sm font-semibold text-gray-700">NIK (Nomor Induk Kependudukan)</label>
                                            <input
                                                type="text"
                                                maxLength={16}
                                                placeholder="16 Digit NIK (Opsional)"
                                                value={data.respondent.nik}
                                                onChange={e => handleRespondentChange('nik', e.target.value.replace(/[^0-9]/g, ''))}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                            />
                                            {errors['respondent.nik'] && <p className="text-xs text-rose-500 mt-1">{errors['respondent.nik']}</p>}
                                        </div>
                                    )}

                                    {/* Name */}
                                    {!isAnonymous && (
                                        <div className="space-y-1.5 col-span-2 md:col-span-1">
                                            <label className="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                placeholder="Nama Lengkap Anda"
                                                value={data.respondent.name}
                                                onChange={e => handleRespondentChange('name', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Gender */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Jenis Kelamin</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleRespondentChange('gender', 'L')}
                                                className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                    data.respondent.gender === 'L'
                                                        ? 'border-[#355C7D] bg-[#355C7D]/5 text-[#355C7D]'
                                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                }`}
                                            >
                                                Laki-Laki
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRespondentChange('gender', 'P')}
                                                className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                                                    data.respondent.gender === 'P'
                                                        ? 'border-[#355C7D] bg-[#355C7D]/5 text-[#355C7D]'
                                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                                }`}
                                            >
                                                Perempuan
                                            </button>
                                        </div>
                                    </div>

                                    {/* Age */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Usia (Tahun)</label>
                                        <input
                                            type="number"
                                            min={10}
                                            max={120}
                                            placeholder="Usia Anda"
                                            value={data.respondent.age}
                                            onChange={e => handleRespondentChange('age', e.target.value === '' ? '' : parseInt(e.target.value))}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                        />
                                    </div>

                                    {/* Education */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Pendidikan Terakhir</label>
                                        <select
                                            value={data.respondent.education}
                                            onChange={e => handleRespondentChange('education', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                        >
                                            <option value="">Pilih Pendidikan</option>
                                            {educationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>

                                    {/* Job */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Pekerjaan Utama</label>
                                        <select
                                            value={data.respondent.job}
                                            onChange={e => handleRespondentChange('job', e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm bg-white"
                                        >
                                            <option value="">Pilih Pekerjaan</option>
                                            {jobOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>

                                    {/* Phone */}
                                    {!isAnonymous && (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Nomor Telepon/HP</label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: 081234567890"
                                                value={data.respondent.phone}
                                                onChange={e => handleRespondentChange('phone', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Email */}
                                    {!isAnonymous && (
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Alamat Email</label>
                                            <input
                                                type="email"
                                                placeholder="Email Anda"
                                                value={data.respondent.email}
                                                onChange={e => handleRespondentChange('email', e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: 9 QUESTIONS */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="border-b border-gray-100 pb-4">
                                    <h3 className="text-lg font-bold text-[#355C7D] flex items-center gap-2">
                                        <Smile className="h-5 w-5" />
                                        Langkah 2: Evaluasi Unsur Pelayanan
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">Berikan penilaian jujur Anda terhadap layanan yang dirasakan. Mutu 1 (Terendah) sampai 4 (Tertinggi).</p>
                                </div>

                                <div className="space-y-8">
                                    {survey.questions.map((question) => {
                                        const currentAnswer = data.answers.find(ans => ans.question_id === question.id);
                                        const currentScore = currentAnswer ? currentAnswer.score : 0;

                                        return (
                                            <div key={question.id} className="p-6 bg-slate-50/50 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="inline-flex items-center justify-center h-6 w-10 bg-[#355C7D]/10 rounded-md font-bold text-xs text-[#355C7D] mt-0.5">
                                                        {question.indicator_code}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-snug">
                                                        {question.question_text}
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                                    {[
                                                        { val: 1, label: question.scale_1_label },
                                                        { val: 2, label: question.scale_2_label },
                                                        { val: 3, label: question.scale_3_label },
                                                        { val: 4, label: question.scale_4_label },
                                                    ].map((opt) => {
                                                        const isSelected = currentScore === opt.val;
                                                        return (
                                                            <button
                                                                key={opt.val}
                                                                type="button"
                                                                onClick={() => handleAnswerChange(question.id, opt.val)}
                                                                className={`p-4 rounded-xl border-2 flex flex-col items-center text-center justify-between gap-2.5 transition-all ${
                                                                    isSelected
                                                                        ? 'border-[#355C7D] bg-[#355C7D]/5 text-[#355C7D] font-bold shadow-md'
                                                                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                                                                }`}
                                                            >
                                                                <span className="font-black text-lg">{opt.val}</span>
                                                                <span className="text-xs tracking-tight line-clamp-2 leading-tight">{opt.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: COMPLAINTS */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="border-b border-gray-100 pb-4">
                                    <h3 className="text-lg font-bold text-[#355C7D] flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Langkah 3: Pengaduan & Saran Masukan
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1">Aduan atau keluhan Anda akan diteruskan secara otomatis ke tim pengawas tindak lanjut pelayanan publik.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Tulis Pengaduan / Keluhan / Saran (Opsional)</label>
                                        <textarea
                                            rows={6}
                                            placeholder="Tulis kritik, keluhan pelayanan, atau saran peningkatan fasilitas loket di sini..."
                                            value={data.complaint.content}
                                            onChange={e => setData('complaint', { content: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-sm"
                                        />
                                    </div>
                                    
                                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3 text-emerald-800 text-sm">
                                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                                        <div>
                                            <span className="font-bold block">Seluruh data telah diisi dengan lengkap!</span>
                                            <span className="text-xs text-emerald-600">Klik tombol "Kirim Respon" di bawah untuk memproses IKM.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50 border-t border-gray-100 p-6 flex items-center justify-between gap-4">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={() => setStep(prev => prev - 1)}
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 rounded-lg shadow-sm text-gray-700 transition-all gap-1.5 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </button>
                    ) : (
                        <a
                            href="/"
                            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 rounded-lg shadow-sm text-gray-500 transition-all gap-1.5 cursor-pointer"
                        >
                            Batal
                        </a>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={handleNextStep}
                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all gap-1.5 cursor-pointer"
                        >
                            Lanjutkan
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50 transition-all gap-1.5 cursor-pointer"
                        >
                            {processing ? 'Mengirim...' : 'Kirim Respon'}
                            <Sparkles className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Empty block for flex layout alignment */}
            <div className="mt-8 text-center text-xs text-gray-400">
                Layanan pengaduan dijamin aman oleh UU No.25 Tahun 2009 tentang Pelayanan Publik.
            </div>
        </div>
    );
}
