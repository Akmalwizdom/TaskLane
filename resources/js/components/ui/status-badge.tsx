import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors',
    {
        variants: {
            variant: {
                pending:
                    'bg-warning/15 text-warning-foreground border border-warning/30 dark:bg-warning/20 dark:border-warning/40',
                waiting:
                    'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
                'in-progress':
                    'bg-info/10 text-info border border-info/20 dark:bg-info/20 dark:border-info/30',
                completed:
                    'bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:border-success/30',
                approved:
                    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800',
                rejected:
                    'bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:border-destructive/30',
                draft: 'bg-muted text-muted-foreground border border-border',
                overdue:
                    'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800',
            },
            size: {
                sm: 'text-[10px] px-1.5 py-0.5',
                default: 'text-xs px-2 py-0.5',
                lg: 'text-sm px-2.5 py-1',
            },
        },
        defaultVariants: {
            variant: 'pending',
            size: 'default',
        },
    }
);

export interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof statusBadgeVariants> {
    icon?: React.ReactNode;
}

export function StatusBadge({
    className,
    variant,
    size,
    icon,
    children,
    ...props
}: StatusBadgeProps) {
    return (
        <span
            className={cn(statusBadgeVariants({ variant, size, className }))}
            {...props}
        >
            {icon}
            {children}
        </span>
    );
}

// Pre-configured badge components for common statuses
export function PendingBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="pending" className={className} {...props}>
            Pending
        </StatusBadge>
    );
}

export function WaitingBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="waiting" className={className} {...props}>
            Waiting
        </StatusBadge>
    );
}

export function InProgressBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="in-progress" className={className} {...props}>
            In Progress
        </StatusBadge>
    );
}

export function CompletedBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="completed" className={className} {...props}>
            Completed
        </StatusBadge>
    );
}

export function ApprovedBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="approved" className={className} {...props}>
            Approved
        </StatusBadge>
    );
}

export function RejectedBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="rejected" className={className} {...props}>
            Rejected
        </StatusBadge>
    );
}

export function DraftBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="draft" className={className} {...props}>
            Draft
        </StatusBadge>
    );
}

export function OverdueBadge({ className, ...props }: Omit<StatusBadgeProps, 'variant'>) {
    return (
        <StatusBadge variant="overdue" className={className} {...props}>
            Overdue
        </StatusBadge>
    );
}
