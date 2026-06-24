import { Head, Link } from '@inertiajs/react';
import { Landmark, ArrowLeft, Printer, ExternalLink, QrCode } from 'lucide-react';

interface Opd {
    name: string;
}

interface Unit {
    id: number;
    name: string;
    code: string;
    opd: Opd;
}

interface Survey {
    title: string;
    token: string;
}

interface QrProps {
    unit: Unit;
    survey: Survey | null;
    surveyUrl: string | null;
}

export default function QrCodePage({ unit, survey, surveyUrl }: QrProps) {
    const qrImageUrl = surveyUrl 
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(surveyUrl)}`
        : '';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 space-y-6">
            <Head title={`Kode QR - ${unit.name}`} />

            {/* Print Stylesheet Override */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-qr-card, #printable-qr-card * {
                        visibility: visible;
                    }
                    #printable-qr-card {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        border: none !important;
                        box-shadow: none !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: center !important;
                        align-items: center !important;
                        background: white !important;
                        color: black !important;
                    }
                }
            `}} />

            {/* Header controls (Hidden during print) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5 no-print">
                <div>
                    <Link
                        href="/admin/units"
                        className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 gap-1 mb-2"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Unit Layanan
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Kode QR Survei Kepuasan</h1>
                    <p className="text-sm text-gray-500">Cetak dan pajang kartu survei ini pada loket fisik pelayanan untuk di-scan oleh masyarakat.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm transition-all gap-1.5"
                    >
                        <Printer className="h-4 w-4" />
                        Cetak Kartu QR
                    </button>
                    {surveyUrl && (
                        <a
                            href={surveyUrl}
                            target="_blank"
                            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 rounded-lg shadow-sm text-gray-700 transition-all gap-1.5"
                        >
                            Buka Link Form
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    )}
                </div>
            </div>

            {/* Main content display */}
            <div className="flex justify-center py-6">
                {surveyUrl ? (
                    /* The card layout optimized for both screen viewing and printing */
                    <div 
                        id="printable-qr-card" 
                        className="w-[420px] bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 text-center space-y-8 flex flex-col justify-between"
                        style={{ contentVisibility: 'auto' }}
                    >
                        {/* Top Band */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-2 text-[#355C7D]">
                                <Landmark className="h-10 w-10" />
                                <span className="font-extrabold text-2xl tracking-wider">SATUKAN</span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Pengukuran Indeks Kepuasan Masyarakat
                            </span>
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">KARTU SURVEI LOKET</h2>
                            <h3 className="text-sm font-bold text-[#355C7D]">{unit.name}</h3>
                            <p className="text-[11px] text-gray-400 font-medium">{unit.opd.name}</p>
                        </div>

                        {/* QR Image Container */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
                            <img
                                src={qrImageUrl}
                                alt="Loket Survey QR Code"
                                className="h-56 w-56 object-contain bg-white p-2 rounded-lg border"
                            />
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-4 flex items-center gap-1">
                                <QrCode className="h-3 w-3" />
                                Scan Menggunakan Smartphone Anda
                            </span>
                        </div>

                        {/* Footnotes */}
                        <div className="border-t border-gray-150 pt-4 text-[10px] text-gray-400 leading-normal font-medium">
                            Aspirasi dan kritik Anda dilindungi oleh hukum kerahasiaannya untuk peningkatan mutu loket publik secara berkala.
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border w-full max-w-md text-gray-400">
                        <QrCode className="h-16 w-16 mx-auto stroke-1" />
                        <h3 className="font-bold text-gray-700 mt-4">Belum Ada Survei Aktif</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                            Unit layanan ini belum memiliki survei aktif di periode ini. Silakan buat survei baru terlebih dahulu.
                        </p>
                        <Link
                            href="/admin/surveys"
                            className="inline-block px-4 py-2 mt-5 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm"
                        >
                            Buat Survei
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

QrCodePage.layout = {
    breadcrumbs: [
        {
            title: 'Unit Layanan',
            href: '/admin/units',
        },
        {
            title: 'Kartu QR',
            href: '#',
        },
    ],
};
