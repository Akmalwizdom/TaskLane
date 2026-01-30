import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    ApprovalCard,
    ApprovalSectionHeader,
    TaskCard,
    AddTaskCard,
    TaskSectionHeader,
    DashboardStats,
    type ApprovalItem,
    type TaskItem,
} from '@/components/dashboard';
import { EmptyState } from '@/components/ui/empty-state';
import { Users, CheckCircle2, Clock, FileText, Play } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Stat {
    icon: string;
    label: string;
    value: number;
    variant: 'default' | 'info' | 'warning' | 'success';
}

interface Props {
    stats: Stat[];
    approvals: ApprovalItem[];
    tasks: TaskItem[];
    userName: string;
    canApprove: boolean;
}

// Map icon string to component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users,
    FileText,
    Clock,
    CheckCircle2,
    Play,
};

export default function Dashboard({ stats, approvals, tasks, userName, canApprove }: Props) {
    const hasApprovals = approvals.length > 0;
    const hasTasks = tasks.length > 0;

    // Transform stats to include icon components
    const statsWithIcons = stats.map((stat) => ({
        ...stat,
        icon: iconMap[stat.icon] || FileText,
    }));

    const handleApprove = (id: string) => {
        router.post(`/tasks/${id}/approve`, {}, {
            preserveScroll: true,
        });
    };

    const handleReject = (id: string) => {
        router.post(`/tasks/${id}/reject`, {}, {
            preserveScroll: true,
        });
    };

    const handleViewApproval = (id: string) => {
        router.visit(`/tasks/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                {/* Welcome Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        Here's what's happening with your tasks today.
                    </p>
                </div>

                {/* Stats Row */}
                <DashboardStats stats={statsWithIcons} />

                {/* Awaiting Your Approval Section */}
                {canApprove && hasApprovals ? (
                    <section>
                        <ApprovalSectionHeader count={approvals.length} />
                        <div className="flex flex-col gap-3 md:gap-4">
                            {approvals.map((item) => (
                                <ApprovalCard
                                    key={item.id}
                                    item={item}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                    onView={handleViewApproval}
                                />
                            ))}
                        </div>
                    </section>
                ) : null}

                {/* My Active Tasks Section */}
                <section>
                    <TaskSectionHeader title="My Active Tasks" viewAllHref="/tasks" />
                    {hasTasks ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {tasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                            <AddTaskCard />
                        </div>
                    ) : (
                        <EmptyState
                            title="Everything is up to date"
                            description="You've cleared your queue. Take a moment to breathe or start a new workflow."
                            action={{
                                label: 'Create your first task',
                                href: '/tasks/create',
                            }}
                        />
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
