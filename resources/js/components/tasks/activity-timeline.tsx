import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    CheckCircle2,
    Clock,
    Edit2,
    FileText,
    MessageSquare,
    XCircle,
} from 'lucide-react';

export type ActivityType =
    | 'created'
    | 'updated'
    | 'submitted'
    | 'approved'
    | 'rejected'
    | 'comment'
    | 'status_change';

export interface ActivityEvent {
    id: string;
    type: ActivityType;
    user: {
        name: string;
        avatar?: string;
    };
    timestamp: string;
    description?: string;
    metadata?: Record<string, string>;
}

interface ActivityTimelineProps {
    activities: ActivityEvent[];
    className?: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
    created: <FileText className="h-4 w-4" />,
    updated: <Edit2 className="h-4 w-4" />,
    submitted: <Clock className="h-4 w-4" />,
    approved: <CheckCircle2 className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
    comment: <MessageSquare className="h-4 w-4" />,
    status_change: <Clock className="h-4 w-4" />,
};

const activityColors: Record<ActivityType, string> = {
    created: 'bg-primary/10 text-primary',
    updated: 'bg-info/10 text-info',
    submitted: 'bg-warning/20 text-warning-foreground',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-destructive/10 text-destructive',
    comment: 'bg-muted text-muted-foreground',
    status_change: 'bg-muted text-muted-foreground',
};

function getActivityMessage(activity: ActivityEvent): string {
    switch (activity.type) {
        case 'created':
            return 'created this task';
        case 'updated':
            return 'updated the task';
        case 'submitted':
            return 'submitted for approval';
        case 'approved':
            return 'approved the task';
        case 'rejected':
            return 'rejected the task';
        case 'comment':
            return 'added a comment';
        case 'status_change':
            return `changed status to ${activity.metadata?.status || 'unknown'}`;
        default:
            return 'performed an action';
    }
}

export function ActivityTimeline({
    activities,
    className,
}: ActivityTimelineProps) {
    if (activities.length === 0) {
        return (
            <div className={cn('text-center text-muted-foreground py-8', className)}>
                No activity yet
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            {/* Timeline line */}
            <div className="absolute left-4 top-0 h-full w-px bg-border" />

            <div className="flex flex-col gap-6">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-4 pl-10">
                        {/* Icon */}
                        <div
                            className={cn(
                                'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full',
                                activityColors[activity.type]
                            )}
                        >
                            {activityIcons[activity.type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage
                                        src={activity.user.avatar}
                                        alt={activity.user.name}
                                    />
                                    <AvatarFallback className="text-[10px]">
                                        {activity.user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">
                                    {activity.user.name}
                                </span>
                                <span className="text-muted-foreground">
                                    {getActivityMessage(activity)}
                                </span>
                            </div>

                            {activity.description && (
                                <p className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                                    {activity.description}
                                </p>
                            )}

                            <span className="mt-1 block text-xs text-muted-foreground">
                                {activity.timestamp}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
