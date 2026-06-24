import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Building2,
    Building,
    Calendar,
    FileText,
    ClipboardCheck,
    RefreshCw,
    Users,
    BookOpen,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as opdsIndex } from '@/routes/opds';
import { index as unitsIndex } from '@/routes/units';
import { index as periodsIndex } from '@/routes/periods';
import { index as surveysIndex } from '@/routes/surveys';
import { index as recommendationsIndex } from '@/routes/recommendations';
import { index as syncIndex } from '@/routes/sync';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userRoles = auth?.user?.roles || [];
    const isSuperAdmin = userRoles.some((role: any) => role.slug === 'superadmin');

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (isSuperAdmin) {
        mainNavItems.push(
            {
                title: 'Kelola OPD',
                href: opdsIndex(),
                icon: Building2,
            },
            {
                title: 'Unit Layanan',
                href: unitsIndex(),
                icon: Building,
            },
            {
                title: 'Periode Survei',
                href: periodsIndex(),
                icon: Calendar,
            },
            {
                title: 'Formulir Survei',
                href: surveysIndex(),
                icon: FileText,
            },
            {
                title: 'RTL Tindak Lanjut',
                href: recommendationsIndex(),
                icon: ClipboardCheck,
            },
            {
                title: 'Sinkronisasi Nasional',
                href: syncIndex(),
                icon: RefreshCw,
            },
            {
                title: 'Keamanan & Pengguna',
                href: usersIndex(),
                icon: Users,
            },
        );
    } else {
        mainNavItems.push(
            {
                title: 'Unit Layanan',
                href: unitsIndex(),
                icon: Building,
            },
            {
                title: 'Formulir Survei',
                href: surveysIndex(),
                icon: FileText,
            },
            {
                title: 'RTL Tindak Lanjut',
                href: recommendationsIndex(),
                icon: ClipboardCheck,
            },
        );
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Dokumentasi SKM',
            href: 'https://peraturan.go.id/id/permen-panrb-no-14-tahun-2017',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
