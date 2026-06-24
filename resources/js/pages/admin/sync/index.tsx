import { Head, useForm } from '@inertiajs/react';
import {
    Landmark,
    Settings,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SyncLog {
    id: number;
    entity_type: string;
    entity_id: number;
    status: 'success' | 'failed';
    response_message: string | null;
    synced_at: string;
}

interface IndexProps {
    settings: {
        national_sync_enabled: string;
        national_api_endpoint: string;
        national_api_token: string;
        regional_name: string;
        regional_code: string;
    };
    syncLogs: SyncLog[];
}

export default function SyncIndex({ settings, syncLogs }: IndexProps) {
    const settingsForm = useForm({
        national_sync_enabled: settings.national_sync_enabled === '1',
        national_api_endpoint: settings.national_api_endpoint || '',
        national_api_token: settings.national_api_token || '',
        regional_name: settings.regional_name || '',
        regional_code: settings.regional_code || '',
    });

    const triggerForm = useForm({});

    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        settingsForm.post('/admin/sync/settings', {
            onSuccess: () =>
                toast.success('Konfigurasi integrasi berhasil disimpan.'),
            onError: () =>
                toast.error(
                    'Gagal menyimpan konfigurasi. Periksa kembali form.',
                ),
        });
    };

    const handleSyncTrigger = () => {
        toast.promise(
            new Promise((resolve, reject) => {
                triggerForm.post('/admin/sync/trigger', {
                    onSuccess: () => resolve('Sinkronisasi berhasil!'),
                    onError: () => reject('Gagal menyinkronkan data.'),
                });
            }),
            {
                loading: 'Menghubungkan ke Portal SKM Nasional...',
                success: 'Sinkronisasi selesai! Log terupdate.',
                error: 'Sinkronisasi gagal. Silakan periksa status log di bawah.',
            },
        );
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);

        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6 p-6">
            <Head title="Integrasi Nasional - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Integrasi SKM Nasional
                    </h1>
                    <p className="text-sm text-gray-500">
                        Konfigurasikan sinkronisasi IKM daerah ke Portal SKM
                        Kementerian PANRB.
                    </p>
                </div>
                <button
                    onClick={handleSyncTrigger}
                    disabled={
                        triggerForm.processing ||
                        !settingsForm.data.national_sync_enabled
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964] disabled:opacity-50"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${triggerForm.processing ? 'animate-spin' : ''}`}
                    />
                    Sinkronkan Sekarang
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Settings Panel */}
                <div className="space-y-6 lg:col-span-5">
                    <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-gray-55 flex items-center gap-2 border-b pb-3">
                            <Settings className="h-5 w-5 text-[#355C7D]" />
                            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                                Konfigurasi API Nasional
                            </h3>
                        </div>

                        <form
                            onSubmit={handleSettingsSubmit}
                            className="space-y-4"
                        >
                            {/* Toggle Enable */}
                            <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/20">
                                <div>
                                    <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Status Sinkronisasi
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        Aktifkan pengiriman berkala pusat.
                                    </span>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={
                                            settingsForm.data
                                                .national_sync_enabled
                                        }
                                        onChange={(e) =>
                                            settingsForm.setData(
                                                'national_sync_enabled',
                                                e.target.checked,
                                            )
                                        }
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-[#355C7D] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                                </label>
                            </div>

                            {/* Regional Code */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Kode Wilayah Kemendagri / BPS
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={settingsForm.data.regional_code}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'regional_code',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: 7300 (Kode Provinsi / Kab)"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            {/* Regional Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Pemerintah Daerah
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={settingsForm.data.regional_name}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'regional_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Pemerintah Kabupaten Satukan"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            {/* API Endpoint */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Endpoint API Kementerian PANRB
                                </label>
                                <input
                                    type="url"
                                    required={
                                        settingsForm.data.national_sync_enabled
                                    }
                                    disabled={
                                        !settingsForm.data.national_sync_enabled
                                    }
                                    value={
                                        settingsForm.data.national_api_endpoint
                                    }
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'national_api_endpoint',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="https://skm.menpan.go.id/api/v1/sync"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            {/* API Token */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Token Akses API (Bearer Token)
                                </label>
                                <input
                                    type="password"
                                    required={
                                        settingsForm.data.national_sync_enabled
                                    }
                                    disabled={
                                        !settingsForm.data.national_sync_enabled
                                    }
                                    value={settingsForm.data.national_api_token}
                                    onChange={(e) =>
                                        settingsForm.setData(
                                            'national_api_token',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="API Authorization Token"
                                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none disabled:opacity-50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="inline-flex w-full items-center justify-center rounded-lg bg-[#355C7D] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#284964] disabled:opacity-50"
                            >
                                {settingsForm.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Konfigurasi'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Logs list Panel */}
                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-7 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-gray-55 flex items-center gap-2 border-b pb-3">
                        <Landmark className="h-5 w-5 text-[#355C7D]" />
                        <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                            Riwayat Sinkronisasi Data
                        </h3>
                    </div>

                    <div className="max-h-[360px] overflow-x-auto overflow-y-auto pr-1">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase dark:border-neutral-800">
                                    <th className="px-2 py-2.5">
                                        Tanggal Sync
                                    </th>
                                    <th className="px-2 py-2.5">Status</th>
                                    <th className="px-2 py-2.5">
                                        Keterangan / Response Server
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {syncLogs.length > 0 ? (
                                    syncLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="border-b border-gray-50 hover:bg-gray-50/20 dark:border-neutral-800"
                                        >
                                            <td className="px-2 py-3 font-medium whitespace-nowrap text-gray-500">
                                                {formatDate(log.synced_at)}
                                            </td>
                                            <td className="px-2 py-3">
                                                <span
                                                    className={`flex w-max items-center gap-0.5 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                        log.status === 'success'
                                                            ? 'border border-emerald-100 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400'
                                                            : 'border border-rose-100 bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400'
                                                    }`}
                                                >
                                                    {log.status ===
                                                    'success' ? (
                                                        <>
                                                            <CheckCircle className="h-3 w-3 shrink-0" />{' '}
                                                            Sukses
                                                        </>
                                                    ) : (
                                                        <>
                                                            <AlertTriangle className="h-3 w-3 shrink-0" />{' '}
                                                            Gagal
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="max-w-xs px-2 py-3 font-mono text-[10px] break-words text-gray-600 dark:text-gray-400">
                                                {log.response_message || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="py-12 text-center text-gray-400"
                                        >
                                            Belum ada log sinkronisasi nasional.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

SyncIndex.layout = {
    breadcrumbs: [
        {
            title: 'Sinkronisasi Nasional',
            href: '/admin/sync',
        },
    ],
};
