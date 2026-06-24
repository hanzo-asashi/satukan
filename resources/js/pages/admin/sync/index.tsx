import { Head, useForm } from '@inertiajs/react';
import { Landmark, Settings, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
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
            onSuccess: () => toast.success('Konfigurasi integrasi berhasil disimpan.'),
            onError: () => toast.error('Gagal menyimpan konfigurasi. Periksa kembali form.')
        });
    };

    const handleSyncTrigger = () => {
        toast.promise(
            new Promise((resolve, reject) => {
                triggerForm.post('/admin/sync/trigger', {
                    onSuccess: () => resolve('Sinkronisasi berhasil!'),
                    onError: () => reject('Gagal menyinkronkan data.')
                });
            }),
            {
                loading: 'Menghubungkan ke Portal SKM Nasional...',
                success: 'Sinkronisasi selesai! Log terupdate.',
                error: 'Sinkronisasi gagal. Silakan periksa status log di bawah.'
            }
        );
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 space-y-6">
            <Head title="Integrasi Nasional - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Integrasi SKM Nasional</h1>
                    <p className="text-sm text-gray-500">Konfigurasikan sinkronisasi IKM daerah ke Portal SKM Kementerian PANRB.</p>
                </div>
                <button
                    onClick={handleSyncTrigger}
                    disabled={triggerForm.processing || !settingsForm.data.national_sync_enabled}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50 transition-all gap-1.5"
                >
                    <RefreshCw className={`h-4 w-4 ${triggerForm.processing ? 'animate-spin' : ''}`} />
                    Sinkronkan Sekarang
                </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Settings Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-55 pb-3">
                            <Settings className="h-5 w-5 text-[#355C7D]" />
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm">Konfigurasi API Nasional</h3>
                        </div>

                        <form onSubmit={handleSettingsSubmit} className="space-y-4">
                            {/* Toggle Enable */}
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-neutral-800/20 p-3 rounded-lg border border-gray-100 dark:border-neutral-800">
                                <div>
                                    <span className="font-bold text-xs text-gray-700 dark:text-gray-300 block">Status Sinkronisasi</span>
                                    <span className="text-[10px] text-gray-400">Aktifkan pengiriman berkala pusat.</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settingsForm.data.national_sync_enabled}
                                        onChange={e => settingsForm.setData('national_sync_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#355C7D]"></div>
                                </label>
                            </div>

                            {/* Regional Code */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Kode Wilayah Kemendagri / BPS</label>
                                <input
                                    type="text"
                                    required
                                    value={settingsForm.data.regional_code}
                                    onChange={e => settingsForm.setData('regional_code', e.target.value)}
                                    placeholder="Contoh: 7300 (Kode Provinsi / Kab)"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-xs bg-white"
                                />
                            </div>

                            {/* Regional Name */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Pemerintah Daerah</label>
                                <input
                                    type="text"
                                    required
                                    value={settingsForm.data.regional_name}
                                    onChange={e => settingsForm.setData('regional_name', e.target.value)}
                                    placeholder="Contoh: Pemerintah Kabupaten Satukan"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-xs bg-white"
                                />
                            </div>

                            {/* API Endpoint */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Endpoint API Kementerian PANRB</label>
                                <input
                                    type="url"
                                    required={settingsForm.data.national_sync_enabled}
                                    disabled={!settingsForm.data.national_sync_enabled}
                                    value={settingsForm.data.national_api_endpoint}
                                    onChange={e => settingsForm.setData('national_api_endpoint', e.target.value)}
                                    placeholder="https://skm.panrb.go.id/api/v1/sync"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-xs bg-white disabled:opacity-50"
                                />
                            </div>

                            {/* API Token */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Token Akses API (Bearer Token)</label>
                                <input
                                    type="password"
                                    required={settingsForm.data.national_sync_enabled}
                                    disabled={!settingsForm.data.national_sync_enabled}
                                    value={settingsForm.data.national_api_token}
                                    onChange={e => settingsForm.setData('national_api_token', e.target.value)}
                                    placeholder="API Authorization Token"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#355C7D]/20 focus:border-[#355C7D] text-xs bg-white disabled:opacity-50"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={settingsForm.processing}
                                className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-[#355C7D] hover:bg-[#284964] rounded-lg shadow-sm disabled:opacity-50 transition-all"
                            >
                                {settingsForm.processing ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Logs list Panel */}
                <div className="lg:col-span-7 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-55 pb-3">
                        <Landmark className="h-5 w-5 text-[#355C7D]" />
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm">Riwayat Sinkronisasi Data</h3>
                    </div>

                    <div className="overflow-x-auto max-h-[360px] overflow-y-auto pr-1">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-neutral-800 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/50">
                                    <th className="py-2.5 px-2">Tanggal Sync</th>
                                    <th className="py-2.5 px-2">Status</th>
                                    <th className="py-2.5 px-2">Keterangan / Response Server</th>
                                </tr>
                            </thead>
                            <tbody>
                                {syncLogs.length > 0 ? (
                                    syncLogs.map((log) => (
                                        <tr key={log.id} className="border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50/20">
                                            <td className="py-3 px-2 font-medium text-gray-500 whitespace-nowrap">
                                                {formatDate(log.synced_at)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-0.5 w-max ${
                                                    log.status === 'success'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400 border border-emerald-100'
                                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400 border border-rose-100'
                                                }`}>
                                                    {log.status === 'success' ? (
                                                        <><CheckCircle className="h-3 w-3 shrink-0" /> Sukses</>
                                                    ) : (
                                                        <><AlertTriangle className="h-3 w-3 shrink-0" /> Gagal</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-gray-600 dark:text-gray-400 font-mono text-[10px] max-w-xs break-words">
                                                {log.response_message || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-12 text-gray-400">
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
