import * as React from 'react';
import { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { ActivityTimeline, ApprovalSidebar, type ActivityEvent, type ApprovalInfo } from '@/components/tasks';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
    const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tasks', href: '/tasks' },
        { title: taskData.title, href: '#' },
    ];

    const handleStartWork = () => {
        setIsStartDialogOpen(false);
        router.post(`/tasks/${taskData.id}/start-work`, {}, {
            onSuccess: () => {},
        });
    };

    const handleSubmit = () => {
        setIsSubmitDialogOpen(false);
        router.post(`/tasks/${taskData.id}/submit`, {}, {
            onSuccess: () => {},
        });
    };

    const handleApprove = () => {
        setIsApproveDialogOpen(false);
        router.post(`/tasks/${taskData.id}/approve`, {}, {
            onSuccess: () => {},
        });
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) return;
        setIsRejectDialogOpen(false);
        router.post(`/tasks/${taskData.id}/reject`, { rejection_reason: rejectionReason }, {
            onSuccess: () => {
                setRejectionReason('');
            },
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
                                    <Button onClick={() => setIsStartDialogOpen(true)} size="sm" className="gap-1.5">
                                        <Play className="h-3.5 w-3.5" />
                                        Start Work
                                    </Button>
                                )}
                                {permissions.canSubmit && (
                                    <Button onClick={() => setIsSubmitDialogOpen(true)} size="sm" className="gap-1.5">
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
                            onApprove={() => setIsApproveDialogOpen(true)}
                            onReject={() => setIsRejectDialogOpen(true)}
                            canApprove={permissions.canApprove}
                        />
                    </div>
                )}
            </div>

            {/* Confirmation Dialogs */}
            <AlertDialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Start working on this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will change the task status to "In Progress" and notify the team.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStartWork}>Start Work</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit task for review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your work will be locked and sent to admins for approval.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the task as approved and notify the creator.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">Approve</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for the rejection so the creator can make improvements.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Textarea 
                            placeholder="Reason for rejection..." 
                            value={rejectionReason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectionReason('')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleReject} 
                            disabled={!rejectionReason.trim()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Reject Task
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
