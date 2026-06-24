import { Head, Link } from '@inertiajs/react';
import { Landmark, CheckCircle, Home, FileText } from 'lucide-react';

interface Unit {
    name: string;
    opd: {
        name: string;
    };
}

interface Survey {
    title: string;
    unit: Unit;
}

interface CompleteProps {
    survey: Survey;
}

export default function CompletePage({ survey }: CompleteProps) {
    return (
        <div className="min-h-screen bg-[#F7F9FC] py-20 px-4 flex flex-col justify-center items-center">
            <Head title="Terima Kasih - Survei Selesai" />

            <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-xl p-8 text-center space-y-6">
                <div className="flex justify-center text-emerald-600">
                    <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100 animate-bounce">
                        <CheckCircle className="h-16 w-16" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-800">Terima Kasih!</h2>
                    <p className="text-gray-500 text-sm">
                        Respon dan saran Anda telah berhasil kami terima dan catat ke dalam database IKM Nasional.
                    </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left text-xs text-gray-500 space-y-1.5">
                    <div className="flex justify-between">
                        <span>Layanan:</span>
                        <span className="font-bold text-gray-700">{survey.unit.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>OPD:</span>
                        <span className="font-bold text-gray-700">{survey.unit.opd.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-semibold text-emerald-600">Berhasil Disinkronkan</span>
                    </div>
                </div>

                <p className="text-xs text-gray-400">
                    Setiap aspirasi Anda sangat berarti untuk membangun birokrasi pelayanan publik yang bersih, melayani, dan transparan.
                </p>

                <div className="flex gap-3 pt-2">
                    <Link
                        href="/"
                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all gap-1.5"
                    >
                        <Home className="h-4 w-4" />
                        Kembali ke Home
                    </Link>
                </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs text-gray-400">
                <Landmark className="h-4 w-4" />
                <span>SATUKAN - Sistem Terpadu Ukur Kepuasan Masyarakat Nasional</span>
            </div>
        </div>
    );
}
