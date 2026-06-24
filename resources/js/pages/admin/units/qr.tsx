import { Head, Link } from '@inertiajs/react';
import {
    Landmark,
    ArrowLeft,
    Printer,
    ExternalLink,
    QrCode,
} from 'lucide-react';

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

export default function QrCodePage({ unit, surveyUrl }: QrProps) {
    const qrImageUrl = surveyUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(surveyUrl)}`
        : '';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6 p-6">
            <Head title={`Kode QR - ${unit.name}`} />

            {/* Print Stylesheet Override */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
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
            `,
                }}
            />

            {/* Header controls (Hidden during print) */}
            <div className="no-print flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href="/admin/units"
                        className="mb-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Kembali ke Unit Layanan
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Kode QR Survei Kepuasan
                    </h1>
                    <p className="text-sm text-gray-500">
                        Cetak dan pajang kartu survei ini pada loket fisik
                        pelayanan untuk di-scan oleh masyarakat.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                    >
                        <Printer className="h-4 w-4" />
                        Cetak Kartu QR
                    </button>
                    {surveyUrl && (
                        <a
                            href={surveyUrl}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
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
                        className="flex w-[420px] flex-col justify-between space-y-8 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-2xl"
                        style={{ contentVisibility: 'auto' }}
                    >
                        {/* Top Band */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-2 text-[#355C7D]">
                                <Landmark className="h-10 w-10" />
                                <span className="text-2xl font-extrabold tracking-wider">
                                    SATUKAN
                                </span>
                            </div>
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                                Pengukuran Indeks Kepuasan Masyarakat
                            </span>
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                            <h2 className="text-xl font-black tracking-tight text-gray-800">
                                KARTU SURVEI LOKET
                            </h2>
                            <h3 className="text-sm font-bold text-[#355C7D]">
                                {unit.name}
                            </h3>
                            <p className="text-[11px] font-medium text-gray-400">
                                {unit.opd.name}
                            </p>
                        </div>

                        {/* QR Image Container */}
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/50 p-6 shadow-inner">
                            <img
                                src={qrImageUrl}
                                alt="Loket Survey QR Code"
                                className="h-56 w-56 rounded-lg border bg-white object-contain p-2"
                            />
                            <span className="mt-4 flex items-center gap-1 text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                                <QrCode className="h-3 w-3" />
                                Scan Menggunakan Smartphone Anda
                            </span>
                        </div>

                        {/* Footnotes */}
                        <div className="border-gray-150 border-t pt-4 text-[10px] leading-normal font-medium text-gray-400">
                            Aspirasi dan kritik Anda dilindungi oleh hukum
                            kerahasiaannya untuk peningkatan mutu loket publik
                            secara berkala.
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-md rounded-xl border bg-white py-20 text-center text-gray-400">
                        <QrCode className="mx-auto h-16 w-16 stroke-1" />
                        <h3 className="mt-4 font-bold text-gray-700">
                            Belum Ada Survei Aktif
                        </h3>
                        <p className="mx-auto mt-2 max-w-xs text-sm text-gray-400">
                            Unit layanan ini belum memiliki survei aktif di
                            periode ini. Silakan buat survei baru terlebih
                            dahulu.
                        </p>
                        <Link
                            href="/admin/surveys"
                            className="mt-5 inline-block rounded-lg bg-[#355C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#284964]"
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
