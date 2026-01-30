import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WaitingBadge } from '@/components/ui/status-badge';
import { Check, X } from 'lucide-react';

export interface ApprovalItem {
    id: string;
    title: string;
    requester: {
        name: string;
        avatar?: string;
    };
    thumbnail?: string;
    submittedAt: string;
    status?: 'waiting' | 'pending';
}

interface ApprovalCardProps {
    item: ApprovalItem;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onView?: (id: string) => void;
    className?: string;
}

export function ApprovalCard({
    item,
    onApprove,
    onReject,
    onView,
    className,
}: ApprovalCardProps) {
    return (
        <div
            className={cn(
                'group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center md:gap-6 md:p-5',
                className
            )}
        >
            {/* Content Section */}
            <div
                className="flex flex-1 cursor-pointer gap-4"
                onClick={() => onView?.(item.id)}
            >
                {/* Thumbnail */}
                {item.thumbnail && (
                    <div
                        className="h-16 w-16 shrink-0 rounded-lg border border-border bg-cover bg-center md:h-20 md:w-20"
                        style={{ backgroundImage: `url(${item.thumbnail})` }}
                        aria-hidden="true"
                    />
                )}

                {/* Text Content */}
                <div className="flex min-w-0 flex-col justify-center">
                    <div className="mb-1 flex items-center gap-2">
                        <WaitingBadge size="sm" />
                    </div>
                    <h3 className="mb-0.5 truncate text-base font-semibold text-foreground">
                        {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Requested by{' '}
                        <span className="font-medium text-foreground/80">
                            {item.requester.name}
                        </span>{' '}
                        • {item.submittedAt}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex shrink-0 items-center gap-2">
                <Button
                    size="sm"
                    className="flex-1 gap-1.5 md:flex-none"
                    onClick={() => onApprove?.(item.id)}
                >
                    <Check className="h-4 w-4" />
                    Approve
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 md:flex-none"
                    onClick={() => onReject?.(item.id)}
                >
                    <X className="h-4 w-4" />
                    Reject
                </Button>
            </div>
        </div>
    );
}

// Section header for approval list
interface ApprovalSectionHeaderProps {
    count: number;
    className?: string;
}

export function ApprovalSectionHeader({
    count,
    className,
}: ApprovalSectionHeaderProps) {
    return (
        <div
            className={cn(
                'mb-4 flex items-center justify-between md:mb-6',
                className
            )}
        >
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground">
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground md:text-xl">
                    Awaiting Your Approval
                </h2>
            </div>
            <span className="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-warning-foreground">
                {count} Pending
            </span>
        </div>
    );
}
