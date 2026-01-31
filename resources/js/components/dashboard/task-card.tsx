import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

export type TaskStatus =
    | 'draft'
    | 'assigned'
    | 'pending'
    | 'in-progress'
    | 'completed'
    | 'approved'
    | 'rejected';

export interface TaskItem {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    dueDate?: string;
    assignees?: Array<{
        id: string;
        name: string;
        avatar?: string;
    }>;
    href?: string;
}

interface TaskCardProps {
    task: TaskItem;
    onClick?: (id: string) => void;
    className?: string;
}

const statusLabels: Record<TaskStatus, string> = {
    draft: 'Draft',
    assigned: 'Assigned',
    pending: 'Pending',
    'in-progress': 'In Progress',
    completed: 'Completed',
    approved: 'Approved',
    rejected: 'Rejected',
};

export function TaskCard({ task, onClick, className }: TaskCardProps) {
    const cardContent = (
        <>
            {/* Header: Status & Date */}
            <div className="mb-3 flex items-start justify-between md:mb-4">
                <StatusBadge variant={task.status}>
                    {statusLabels[task.status]}
                </StatusBadge>

                {task.dueDate && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase">
                            {task.dueDate}
                        </span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="mb-2 text-base font-semibold text-foreground group-hover:text-primary">
                {task.title}
            </h3>

            {/* Description */}
            {task.description && (
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {task.description}
                </p>
            )}

            {/* Footer: Assignees & Due Info */}
            <div className="flex items-center justify-between border-t border-border pt-3 md:pt-4">
                {/* Assignees */}
                <div className="flex -space-x-2">
                    {task.assignees?.slice(0, 3).map((assignee) => (
                        <Avatar
                            key={assignee.id}
                            className="h-7 w-7 border-2 border-card"
                        >
                            <AvatarImage
                                src={assignee.avatar}
                                alt={assignee.name}
                            />
                            <AvatarFallback className="text-xs">
                                {(assignee.name || '')
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                            </AvatarFallback>
                        </Avatar>
                    ))}
                    {task.assignees && task.assignees.length > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium text-muted-foreground">
                            +{task.assignees.length - 3}
                        </div>
                    )}
                </div>

                {/* Status Indicator */}
                {task.status === 'completed' || task.status === 'approved' ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Done
                    </span>
                ) : task.dueDate ? (
                    <span className="text-xs font-medium text-muted-foreground">
                        Due in 2 days
                    </span>
                ) : null}
            </div>
        </>
    );

    const cardClassName = cn(
        'group block cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md md:p-5',
        className
    );

    if (task.href) {
        return (
            <Link href={task.href} className={cardClassName}>
                {cardContent}
            </Link>
        );
    }

    return (
        <div
            onClick={() => onClick?.(task.id)}
            className={cardClassName}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick?.(task.id);
                }
            }}
        >
            {cardContent}
        </div>
    );
}

// Add New Task Placeholder Card
interface AddTaskCardProps {
    onClick?: () => void;
    href?: string;
    className?: string;
}

export function AddTaskCard({ onClick, href, className }: AddTaskCardProps) {
    const cardContent = (
        <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-current">
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                    />
                </svg>
            </div>
            <span className="text-sm font-semibold">Create New Task</span>
        </>
    );

    const cardClassName = cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/50 hover:text-primary',
        className
    );

    if (href) {
        return (
            <Link href={href} className={cardClassName}>
                {cardContent}
            </Link>
        );
    }

    return (
        <button type="button" onClick={onClick} className={cardClassName}>
            {cardContent}
        </button>
    );
}


// Section header for task list
interface TaskSectionHeaderProps {
    title?: string;
    onViewAll?: () => void;
    viewAllHref?: string;
    className?: string;
}

export function TaskSectionHeader({
    title = 'My Active Tasks',
    onViewAll,
    viewAllHref,
    className,
}: TaskSectionHeaderProps) {
    return (
        <div
            className={cn(
                'mb-4 flex items-center justify-between md:mb-6',
                className
            )}
        >
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground md:text-xl">
                    {title}
                </h2>
            </div>

            {(onViewAll || viewAllHref) && (
                <Link
                    href={viewAllHref || '#'}
                    onClick={onViewAll}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    View All
                </Link>
            )}
        </div>
    );
}
