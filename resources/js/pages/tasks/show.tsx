import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ActivityTimeline, ApprovalSidebar, type ActivityEvent, type ApprovalInfo } from '@/components/tasks';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Edit2, Play, Send, User } from 'lucide-react';

interface Assignee {
    id: string;
    name: string;
    initials: string;
}

interface Permissions {
    canUpdate: boolean;
    canDelete: boolean;
    canStartWork: boolean;
    canSubmit: boolean;
    canApprove: boolean;
}

interface TaskData {
    id: string;
    title: string;
    description: string;
    status: 'draft' | 'assigned' | 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    dueDate: string | null;
    dueDateFull: string | null;
    createdAt: string;
    assignees: Assignee[];
    creator: {
        id: string;
        name: string;
        initials: string;
    };
    approver?: {
        id: string;
        name: string;
    } | null;
    approvedAt?: string | null;
    rejectionReason?: string | null;
    href: string;
}

interface Activity {
    id: string;
    user: {
        id: string;
        name: string;
        initials: string;
    };
    type: string;
    description: string;
    time: string;
}

interface Props {
    task: { data: TaskData };
    activities: Activity[];
    permissions: Permissions;
}

export default function ShowTask({ task, activities, permissions }: Props) {
    const { data: taskData } = task;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tasks', href: '/tasks' },
        { title: taskData.title, href: '#' },
    ];

    const handleStartWork = () => {
        router.post(`/tasks/${taskData.id}/start-work`, {}, {
            onSuccess: () => {},
        });
    };

    const handleSubmit = () => {
        router.post(`/tasks/${taskData.id}/submit`, {}, {
            onSuccess: () => {},
        });
    };

    const handleApprove = () => {
        router.post(`/tasks/${taskData.id}/approve`, {}, {
            onSuccess: () => {},
        });
    };

    const handleReject = () => {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (reason === null) return; // Cancelled

        router.post(`/tasks/${taskData.id}/reject`, { rejection_reason: reason }, {
            onSuccess: () => {},
        });
    };

    // Transform activities to the expected format
    const activityEvents: ActivityEvent[] = activities.map((activity) => ({
        id: activity.id,
        type: activity.type as ActivityEvent['type'],
        user: { name: activity.user.name },
        timestamp: activity.time,
        description: activity.description,
    }));

    // Build approval info for sidebar
    const approvalInfo: ApprovalInfo | undefined = taskData.status === 'pending' ? {
        status: 'pending',
        submittedAt: taskData.createdAt,
    } : taskData.status === 'approved' && taskData.approver ? {
        status: 'approved',
        approver: { name: taskData.approver.name },
        submittedAt: taskData.createdAt,
        decidedAt: taskData.approvedAt || undefined,
    } : taskData.status === 'rejected' && taskData.approver ? {
        status: 'rejected',
        approver: { name: taskData.approver.name },
        submittedAt: taskData.createdAt,
        decidedAt: taskData.approvedAt || undefined,
        feedback: taskData.rejectionReason || undefined,
    } : undefined;

    const priorityClass = {
        low: 'bg-muted text-muted-foreground',
        medium: 'bg-amber-500/10 text-amber-600',
        high: 'bg-destructive/10 text-destructive',
    }[taskData.priority || 'medium'];

    const statusLabels: Record<string, string> = {
        draft: 'Draft',
        assigned: 'Assigned',
        pending: 'Pending Review',
        'in-progress': 'In Progress',
        completed: 'Completed',
        approved: 'Approved',
        rejected: 'Rejected',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={taskData.title} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 lg:flex-row lg:gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Task Header */}
                    <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <StatusBadge variant={taskData.status} size="lg">
                                    {statusLabels[taskData.status || 'draft']}
                                </StatusBadge>
                                <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${priorityClass}`}>
                                    {(taskData.priority || 'medium').charAt(0).toUpperCase() + (taskData.priority || 'medium').slice(1)} Priority
                                </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {permissions.canUpdate && (
                                    <Link href={`/tasks/${taskData.id}/edit`}>
                                        <Button variant="outline" size="sm" className="gap-1.5">
                                            <Edit2 className="h-3.5 w-3.5" />
                                            Edit
                                        </Button>
                                    </Link>
                                )}
                                {permissions.canStartWork && (
                                    <Button onClick={handleStartWork} size="sm" className="gap-1.5">
                                        <Play className="h-3.5 w-3.5" />
                                        Start Work
                                    </Button>
                                )}
                                {permissions.canSubmit && (
                                    <Button onClick={handleSubmit} size="sm" className="gap-1.5">
                                        <Send className="h-3.5 w-3.5" />
                                        Submit for Review
                                    </Button>
                                )}
                            </div>
                        </div>

                        <h1 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
                            {taskData.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                <span>Created by {taskData.creator?.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{taskData.createdAt}</span>
                            </div>
                            {taskData.dueDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    <span>Due {taskData.dueDate}</span>
                                </div>
                            )}
                        </div>

                        {/* Rejection Feedback */}
                        {taskData.status === 'rejected' && taskData.rejectionReason && (
                            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                <h4 className="mb-1 text-sm font-semibold text-destructive">Revision Required</h4>
                                <p className="text-sm text-muted-foreground">{taskData.rejectionReason}</p>
                            </div>
                        )}

                        {/* Description */}
                        {taskData.description && (
                            <div className="prose prose-sm max-w-none text-foreground">
                                <h3 className="text-base font-semibold">Description</h3>
                                <div className="whitespace-pre-wrap text-muted-foreground">
                                    {taskData.description}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Assignees */}
                    {taskData.assignees && taskData.assignees.length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-4 text-base font-semibold text-foreground">
                                Assignees
                            </h3>
                            <div className="flex flex-wrap gap-3">
                                {taskData.assignees.map((assignee) => (
                                    <div
                                        key={assignee.id}
                                        className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
                                    >
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs">
                                                {assignee.initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{assignee.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Activity Timeline */}
                    {activityEvents.length > 0 && (
                        <div className="rounded-xl border border-border bg-card p-5 md:p-6">
                            <h3 className="mb-6 text-base font-semibold text-foreground">
                                Activity
                            </h3>
                            <ActivityTimeline activities={activityEvents} />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                {(approvalInfo || permissions.canApprove) && (
                    <div className="w-full space-y-6 lg:w-80 xl:w-96">
                        <ApprovalSidebar
                            approval={approvalInfo}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            canApprove={permissions.canApprove}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
