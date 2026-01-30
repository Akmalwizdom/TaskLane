import { Link } from '@inertiajs/react';
import { Calendar, CheckSquare, LayoutGrid, Settings } from 'lucide-react';
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
import * as routes from '@/routes';
import appearance from '@/routes/appearance';
import calendar from '@/routes/calendar';
import notifications from '@/routes/notifications';
import profile from '@/routes/profile';
import tasks from '@/routes/tasks';
import team from '@/routes/team';
import userPassword from '@/routes/user-password';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: routes.dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Tasks',
        href: tasks.index(),
        icon: CheckSquare,
    },
    {
        title: 'Calendar',
        href: calendar.index(),
        icon: Calendar,
    },
    {
        title: 'Settings',
        href: '#',
        icon: Settings,
        items: [
            {
                title: 'Profile',
                href: profile.edit(),
            },
            {
                title: 'Notifications',
                href: notifications.edit(),
            },
            {
                title: 'Security',
                href: userPassword.edit(),
            },
            {
                title: 'Appearance',
                href: appearance.edit(),
            },
            {
                title: 'Team Settings',
                href: team.index(),
            },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={routes.dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} title="Platform" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
