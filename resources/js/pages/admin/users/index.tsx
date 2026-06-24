import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Plus,
    X,
    User,
    Key,
    ClipboardList,
    CheckCircle,
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    slug: string;
}

interface Opd {
    id: number;
    name: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    opd_id: number | null;
    roles: Role[];
    opd: Opd | null;
}

interface ApiToken {
    id: number;
    name: string;
    last_used_at: string | null;
    created_at: string;
}

interface AuditLog {
    id: number;
    action: string;
    ip_address: string | null;
    user_agent: string | null;
    details: string | null;
    created_at: string;
    user: {
        name: string;
        email: string;
    } | null;
}

interface IndexProps {
    users: UserItem[];
    roles: Role[];
    opds: Opd[];
    apiTokens: ApiToken[];
    auditLogs: AuditLog[];
}

export default function UsersIndex({
    users,
    roles,
    opds,
    apiTokens,
    auditLogs,
}: IndexProps) {
    const { flash } = usePage().props as any;

    const [activeTab, setActiveTab] = useState<'users' | 'tokens' | 'logs'>(
        'users',
    );
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [isTokenOpen, setIsTokenOpen] = useState(false);

    // State for Users tab
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userOpdFilter, setUserOpdFilter] = useState('all');
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [userItemsPerPage, setUserItemsPerPage] = useState(10);

    // State for Tokens tab
    const [tokenSearch, setTokenSearch] = useState('');
    const [tokenCurrentPage, setTokenCurrentPage] = useState(1);
    const [tokenItemsPerPage, setTokenItemsPerPage] = useState(10);

    // State for Logs tab
    const [logSearch, setLogSearch] = useState('');
    const [logCurrentPage, setLogCurrentPage] = useState(1);
    const [logItemsPerPage, setLogItemsPerPage] = useState(25);

    // Filtered Users
    const filteredUsers = users.filter((u) => {
        const query = userSearch.toLowerCase();
        const matchesSearch =
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.opd && u.opd.name.toLowerCase().includes(query)) ||
            u.roles.some((r) => r.name.toLowerCase().includes(query));

        const matchesRole =
            userRoleFilter === 'all'
                ? true
                : u.roles.some((r) => r.id.toString() === userRoleFilter);
        const matchesOpd =
            userOpdFilter === 'all'
                ? true
                : u.opd_id?.toString() === userOpdFilter;

        return matchesSearch && matchesRole && matchesOpd;
    });

    const userTotalItems = filteredUsers.length;
    const userTotalPages = Math.ceil(userTotalItems / userItemsPerPage);
    const userLastIndex = userCurrentPage * userItemsPerPage;
    const userFirstIndex = userLastIndex - userItemsPerPage;
    const currentUserItems = filteredUsers.slice(userFirstIndex, userLastIndex);

    // Filtered Tokens
    const filteredTokens = apiTokens.filter((t) => {
        const query = tokenSearch.toLowerCase();

        return t.name.toLowerCase().includes(query);
    });

    const tokenTotalItems = filteredTokens.length;
    const tokenTotalPages = Math.ceil(tokenTotalItems / tokenItemsPerPage);
    const tokenLastIndex = tokenCurrentPage * tokenItemsPerPage;
    const tokenFirstIndex = tokenLastIndex - tokenItemsPerPage;
    const currentTokenItems = filteredTokens.slice(
        tokenFirstIndex,
        tokenLastIndex,
    );

    // Filtered Logs
    const filteredLogs = auditLogs.filter((l) => {
        const query = logSearch.toLowerCase();

        return (
            l.action.toLowerCase().includes(query) ||
            (l.details && l.details.toLowerCase().includes(query)) ||
            (l.ip_address && l.ip_address.toLowerCase().includes(query)) ||
            (l.user && l.user.name.toLowerCase().includes(query)) ||
            (l.user && l.user.email.toLowerCase().includes(query))
        );
    });

    const logTotalItems = filteredLogs.length;
    const logTotalPages = Math.ceil(logTotalItems / logItemsPerPage);
    const logLastIndex = logCurrentPage * logItemsPerPage;
    const logFirstIndex = logLastIndex - logItemsPerPage;
    const currentLogItems = filteredLogs.slice(logFirstIndex, logLastIndex);

    const userForm = useForm({
        name: '',
        email: '',
        password: '',
        role_id: roles[0]?.id || '',
        opd_id: '',
    });

    const tokenForm = useForm({
        name: '',
    });

    const handleUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            userForm.patch(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    toast.success('Pengguna berhasil diperbarui.');
                    setEditingUser(null);
                    userForm.reset();
                },
                onError: () =>
                    toast.error(
                        'Gagal memperbarui pengguna. Periksa kembali form.',
                    ),
            });
        } else {
            userForm.post('/admin/users', {
                onSuccess: () => {
                    toast.success('Pengguna berhasil ditambahkan.');
                    setIsCreateOpen(false);
                    userForm.reset();
                },
                onError: () =>
                    toast.error(
                        'Gagal menambahkan pengguna. Periksa kembali form.',
                    ),
            });
        }
    };

    const handleDeleteUser = (user: UserItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus akun "${user.name}"?`)) {
            userForm.delete(`/admin/users/${user.id}`, {
                onSuccess: () => toast.success('Pengguna berhasil dihapus.'),
                onError: () => toast.error('Gagal menghapus pengguna.'),
            });
        }
    };

    const startEditUser = (user: UserItem) => {
        setEditingUser(user);
        userForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role_id: user.roles[0]?.id || roles[0]?.id,
            opd_id: user.opd_id?.toString() || '',
        });
    };

    const handleTokenSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        tokenForm.post('/admin/users/token', {
            onSuccess: () => {
                toast.success('Token integrasi berhasil dibuat.');
                setIsTokenOpen(false);
                tokenForm.reset();
            },
            onError: () => toast.error('Gagal membuat token API.'),
        });
    };

    const handleDeleteToken = (token: ApiToken) => {
        if (
            confirm(
                `Apakah Anda yakin ingin mencabut token "${token.name}"? Akses API menggunakan token ini akan langsung dinonaktifkan.`,
            )
        ) {
            tokenForm.delete(`/admin/users/token/${token.id}`, {
                onSuccess: () => toast.success('Token berhasil dicabut.'),
                onError: () => toast.error('Gagal mencabut token.'),
            });
        }
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
            <Head title="Keamanan & Pengguna - SATUKAN" />

            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Keamanan & Akses Integrasi
                    </h1>
                    <p className="text-sm text-gray-500">
                        Kelola kredensial petugas loket, token API integrasi
                        pihak ketiga, dan tinjau log audit.
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-gray-150 flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`cursor-pointer border-b-2 pb-3 text-sm font-bold transition-all ${
                        activeTab === 'users'
                            ? 'border-[#355C7D] text-[#355C7D]'
                            : 'border-transparent text-gray-400 hover:text-gray-500'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4" /> Petugas & Pengguna
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('tokens')}
                    className={`cursor-pointer border-b-2 pb-3 text-sm font-bold transition-all ${
                        activeTab === 'tokens'
                            ? 'border-[#355C7D] text-[#355C7D]'
                            : 'border-transparent text-gray-400 hover:text-gray-500'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <Key className="h-4 w-4" /> API Kunci Integrasi
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`cursor-pointer border-b-2 pb-3 text-sm font-bold transition-all ${
                        activeTab === 'logs'
                            ? 'border-[#355C7D] text-[#355C7D]'
                            : 'border-transparent text-gray-400 hover:text-gray-500'
                    }`}
                >
                    <span className="flex items-center gap-1.5">
                        <ClipboardList className="h-4 w-4" /> Log Audit Keamanan
                    </span>
                </button>
            </div>

            {/* TAB CONTENT: USERS LIST */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, email..."
                                    value={userSearch}
                                    onChange={(e) => {
                                        setUserSearch(e.target.value);
                                        setUserCurrentPage(1);
                                    }}
                                    className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                />
                            </div>
                            <select
                                value={userRoleFilter}
                                onChange={(e) => {
                                    setUserRoleFilter(e.target.value);
                                    setUserCurrentPage(1);
                                }}
                                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                                <option value="all">Semua Role</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={userOpdFilter}
                                onChange={(e) => {
                                    setUserOpdFilter(e.target.value);
                                    setUserCurrentPage(1);
                                }}
                                className="max-w-[200px] rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            >
                                <option value="all">Semua OPD</option>
                                {opds.map((opd) => (
                                    <option key={opd.id} value={opd.id}>
                                        {opd.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>Tampilkan</span>
                                <select
                                    value={userItemsPerPage}
                                    onChange={(e) => {
                                        setUserItemsPerPage(
                                            Number(e.target.value),
                                        );
                                        setUserCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entri</span>
                            </div>
                            <button
                                onClick={() => {
                                    userForm.reset();
                                    setIsCreateOpen(true);
                                }}
                                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                            >
                                <Plus className="h-4 w-4" /> Tambah Pengguna
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase dark:border-neutral-800 dark:bg-neutral-800/10">
                                        <th className="px-4 py-3.5">
                                            Nama Lengkap
                                        </th>
                                        <th className="px-4 py-3.5">Email</th>
                                        <th className="px-4 py-3.5">
                                            Role Hak Akses
                                        </th>
                                        <th className="px-4 py-3.5">
                                            Instansi (OPD)
                                        </th>
                                        <th className="px-4 py-3.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUserItems.length > 0 ? (
                                        currentUserItems.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="dark:hover:bg-neutral-850/10 border-b border-gray-50 transition-all hover:bg-gray-50/20 dark:border-neutral-800"
                                            >
                                                <td className="px-4 py-4 font-bold text-gray-800 dark:text-gray-200">
                                                    {user.name}
                                                </td>
                                                <td className="px-4 py-4 text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="border-gray-250/20 rounded border bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                                                        {user.roles[0]?.name ||
                                                            'Tanpa Role'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {user.opd?.name ||
                                                        'Seluruh Wilayah (Global)'}
                                                </td>
                                                <td className="space-x-2 px-4 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            startEditUser(user)
                                                        }
                                                        className="cursor-pointer text-xs font-bold text-gray-400 hover:text-[#355C7D]"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteUser(
                                                                user,
                                                            )
                                                        }
                                                        className="cursor-pointer text-xs font-bold text-gray-400 hover:text-rose-600"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-12 text-center text-gray-400"
                                            >
                                                Tidak ada data pengguna yang
                                                cocok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* User Pagination Controls */}
                        {userTotalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-500 sm:flex-row dark:border-neutral-800 dark:bg-neutral-800/10">
                                <div>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {userFirstIndex + 1}
                                    </span>{' '}
                                    hingga{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {Math.min(
                                            userLastIndex,
                                            userTotalItems,
                                        )}
                                    </span>{' '}
                                    dari{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {userTotalItems}
                                    </span>{' '}
                                    entri
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            setUserCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={userCurrentPage === 1}
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from(
                                        { length: userTotalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                setUserCurrentPage(page)
                                            }
                                            className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                                userCurrentPage === page
                                                    ? 'bg-[#355C7D] text-white shadow-sm'
                                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setUserCurrentPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    userTotalPages,
                                                ),
                                            )
                                        }
                                        disabled={
                                            userCurrentPage === userTotalPages
                                        }
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: API TOKENS */}
            {activeTab === 'tokens' && (
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-[#355C7D]/10 bg-[#355C7D]/5 p-4 sm:flex-row">
                        <p className="max-w-xl text-xs text-gray-500 dark:text-neutral-400">
                            Gunakan Token API untuk mengintegrasikan mesin
                            survei loket eksternal (kiosk tablet pihak ketiga,
                            bot Whatsapp, dll.) untuk otomatisasi submit survei
                            langsung ke database regional.
                        </p>
                        <button
                            onClick={() => {
                                tokenForm.reset();
                                setIsTokenOpen(true);
                            }}
                            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#355C7D] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#284964]"
                        >
                            <Plus className="h-4 w-4" /> Buat Token API
                        </button>
                    </div>

                    {/* Display Plain Text Token once on generation */}
                    {flash?.plainTextToken && (
                        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                Token API Berhasil Dibuat!
                            </div>
                            <p className="text-xs text-emerald-600">
                                Salin token di bawah sekarang. Untuk alasan
                                keamanan, token ini tidak akan diperlihatkan
                                lagi demi menjaga keamanan database.
                            </p>
                            <div className="rounded-lg border border-emerald-200 bg-white p-3 font-mono text-sm font-bold break-all text-gray-800 shadow-inner select-all">
                                {flash.plainTextToken}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama token..."
                                value={tokenSearch}
                                onChange={(e) => {
                                    setTokenSearch(e.target.value);
                                    setTokenCurrentPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Tampilkan</span>
                            <select
                                value={tokenItemsPerPage}
                                onChange={(e) => {
                                    setTokenItemsPerPage(
                                        Number(e.target.value),
                                    );
                                    setTokenCurrentPage(1);
                                }}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span>entri</span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-400 uppercase dark:border-neutral-800 dark:bg-neutral-800/10">
                                        <th className="px-4 py-3.5">
                                            Nama Token Integrasi
                                        </th>
                                        <th className="px-4 py-3.5">
                                            Tanggal Dibuat
                                        </th>
                                        <th className="px-4 py-3.5">
                                            Terakhir Digunakan
                                        </th>
                                        <th className="px-4 py-3.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTokenItems.length > 0 ? (
                                        currentTokenItems.map((token) => (
                                            <tr
                                                key={token.id}
                                                className="dark:hover:bg-neutral-855 border-b border-gray-50 transition-all hover:bg-gray-50/20 dark:border-neutral-800"
                                            >
                                                <td className="px-4 py-4 font-bold text-gray-800 dark:text-gray-200">
                                                    {token.name}
                                                </td>
                                                <td className="px-4 py-4 text-xs text-gray-500">
                                                    {formatDate(
                                                        token.created_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-xs text-gray-500">
                                                    {token.last_used_at
                                                        ? formatDate(
                                                              token.last_used_at,
                                                          )
                                                        : 'Belum Pernah'}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteToken(
                                                                token,
                                                            )
                                                        }
                                                        className="cursor-pointer text-xs font-bold text-rose-500 hover:underline"
                                                    >
                                                        Cabut Akses
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-12 text-center text-gray-400"
                                            >
                                                Tidak ada token integrasi API
                                                yang cocok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Token Pagination Controls */}
                        {tokenTotalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-500 sm:flex-row dark:border-neutral-800 dark:bg-neutral-800/10">
                                <div>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {tokenFirstIndex + 1}
                                    </span>{' '}
                                    hingga{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {Math.min(
                                            tokenLastIndex,
                                            tokenTotalItems,
                                        )}
                                    </span>{' '}
                                    dari{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {tokenTotalItems}
                                    </span>{' '}
                                    entri
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            setTokenCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={tokenCurrentPage === 1}
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from(
                                        { length: tokenTotalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                setTokenCurrentPage(page)
                                            }
                                            className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                                tokenCurrentPage === page
                                                    ? 'bg-[#355C7D] text-white shadow-sm'
                                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setTokenCurrentPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    tokenTotalPages,
                                                ),
                                            )
                                        }
                                        disabled={
                                            tokenCurrentPage === tokenTotalPages
                                        }
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: AUDIT LOGS */}
            {activeTab === 'logs' && (
                <div className="space-y-4">
                    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari aksi, detail, email, IP..."
                                value={logSearch}
                                onChange={(e) => {
                                    setLogSearch(e.target.value);
                                    setLogCurrentPage(1);
                                }}
                                className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-9 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Tampilkan</span>
                            <select
                                value={logItemsPerPage}
                                onChange={(e) => {
                                    setLogItemsPerPage(Number(e.target.value));
                                    setLogCurrentPage(1);
                                }}
                                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>entri</span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase dark:border-neutral-800 dark:bg-neutral-800/10">
                                        <th className="px-4 py-2.5">
                                            Waktu Kejadian
                                        </th>
                                        <th className="px-4 py-2.5">
                                            Pengguna
                                        </th>
                                        <th className="px-4 py-2.5">
                                            Tindakan / Log Audit
                                        </th>
                                        <th className="px-4 py-2.5">
                                            IP Address
                                        </th>
                                        <th className="px-4 py-2.5">
                                            User Agent
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLogItems.length > 0 ? (
                                        currentLogItems.map((log) => (
                                            <tr
                                                key={log.id}
                                                className="dark:hover:bg-neutral-855 border-b border-gray-50 transition-all hover:bg-gray-50/20 dark:border-neutral-800"
                                            >
                                                <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-500">
                                                    {formatDate(log.created_at)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-gray-700 dark:text-gray-300">
                                                        {log.user
                                                            ? log.user.name
                                                            : 'Sistem'}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {log.user?.email ||
                                                            'System Action'}
                                                    </div>
                                                </td>
                                                <td className="max-w-xs px-4 py-3 font-semibold break-words text-gray-600 dark:text-gray-400">
                                                    {log.action}
                                                </td>
                                                <td className="px-4 py-3 font-mono whitespace-nowrap text-gray-500">
                                                    {log.ip_address || '-'}
                                                </td>
                                                <td
                                                    className="max-w-xs truncate px-4 py-3 text-[10px] text-gray-400"
                                                    title={log.user_agent || ''}
                                                >
                                                    {log.user_agent || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-12 text-center text-gray-400"
                                            >
                                                Tidak ada log audit keamanan
                                                yang cocok.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Logs Pagination Controls */}
                        {logTotalPages > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-500 sm:flex-row dark:border-neutral-800 dark:bg-neutral-800/10">
                                <div>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {logFirstIndex + 1}
                                    </span>{' '}
                                    hingga{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {Math.min(logLastIndex, logTotalItems)}
                                    </span>{' '}
                                    dari{' '}
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                                        {logTotalItems}
                                    </span>{' '}
                                    entri
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            setLogCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        disabled={logCurrentPage === 1}
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    {Array.from(
                                        { length: logTotalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() =>
                                                setLogCurrentPage(page)
                                            }
                                            className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                                                logCurrentPage === page
                                                    ? 'bg-[#355C7D] text-white shadow-sm'
                                                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() =>
                                            setLogCurrentPage((prev) =>
                                                Math.min(
                                                    prev + 1,
                                                    logTotalPages,
                                                ),
                                            )
                                        }
                                        disabled={
                                            logCurrentPage === logTotalPages
                                        }
                                        className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 p-2 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: USER CREATE/EDIT */}
            {(isCreateOpen || editingUser) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg animate-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/10">
                            <h3 className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                <User className="h-5 w-5 text-[#355C7D]" />
                                {editingUser
                                    ? `Edit Pengguna: ${editingUser.name}`
                                    : 'Tambah Pengguna Baru'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsCreateOpen(false);
                                    setEditingUser(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={handleUserSubmit}
                            className="space-y-4 p-6"
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={userForm.data.name}
                                    onChange={(e) =>
                                        userForm.setData('name', e.target.value)
                                    }
                                    placeholder="Nama Lengkap Petugas"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Alamat Email
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={userForm.data.email}
                                    onChange={(e) =>
                                        userForm.setData(
                                            'email',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="petugas@satukan.go.id"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                                {userForm.errors.email && (
                                    <p className="mt-1 text-xs text-rose-500">
                                        {userForm.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Password{' '}
                                    {editingUser &&
                                        '(Kosongkan jika tidak diganti)'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={userForm.data.password}
                                    onChange={(e) =>
                                        userForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Minimal 8 karakter"
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Pilih Role Akses
                                    </label>
                                    <select
                                        value={userForm.data.role_id}
                                        onChange={(e) =>
                                            userForm.setData(
                                                'role_id',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                    >
                                        {roles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Hubungkan ke OPD (Opsional)
                                    </label>
                                    <select
                                        value={userForm.data.opd_id}
                                        onChange={(e) =>
                                            userForm.setData(
                                                'opd_id',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                    >
                                        <option value="">
                                            Akses Wilayah Global
                                        </option>
                                        {opds.map((opd) => (
                                            <option key={opd.id} value={opd.id}>
                                                {opd.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreateOpen(false);
                                        setEditingUser(null);
                                    }}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={userForm.processing}
                                    className="rounded-lg bg-[#355C7D] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#284964] disabled:opacity-50"
                                >
                                    {userForm.processing
                                        ? 'Menyimpan...'
                                        : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: TOKEN CREATE */}
            {isTokenOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg animate-in overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl duration-150 zoom-in-95 fade-in dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-800/10">
                            <h3 className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                <Key className="h-5 w-5 text-[#355C7D]" />
                                Buat Token Akses API Baru
                            </h3>
                            <button
                                onClick={() => setIsTokenOpen(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form
                            onSubmit={handleTokenSubmit}
                            className="space-y-4 p-6"
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Nama Token (Deskripsi Penggunaan)
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={tokenForm.data.name}
                                    onChange={(e) =>
                                        tokenForm.setData(
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: Tablet Kios Loket A, Bot Whatsapp SKM, dll."
                                    className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#355C7D] focus:ring-2 focus:ring-[#355C7D]/20 focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setIsTokenOpen(false)}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={tokenForm.processing}
                                    className="rounded-lg bg-[#355C7D] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#284964] disabled:opacity-50"
                                >
                                    {tokenForm.processing
                                        ? 'Membuat...'
                                        : 'Buat Token'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan & Kredensial',
            href: '/admin/users',
        },
    ],
};
