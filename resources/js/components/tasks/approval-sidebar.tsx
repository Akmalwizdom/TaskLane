import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Clock } from 'lucide-react';
import type { TaskStatus } from '@/components/dashboard/task-card';

export interface ApprovalInfo {
    status: 'pending' | 'approved' | 'rejected';
    approver?: {
        name: string;
        avatar?: string;
        role?: string;
    };
    submittedAt: string;
    decidedAt?: string;
    feedback?: string;
}

interface ApprovalSidebarProps {
    approval: ApprovalInfo;
    onApprove?: () => void;
    onReject?: () => void;
    canApprove?: boolean;
    className?: string;
}

export function ApprovalSidebar({
    approval,
    onApprove,
    onReject,
    canApprove = false,
    className,
}: ApprovalSidebarProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card p-5',
                className
            )}
        >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Approval Status</h3>
                <StatusBadge
                    variant={
                        approval.status === 'approved'
                            ? 'approved'
                            : approval.status === 'rejected'
                            ? 'rejected'
                            : 'waiting'
                    }
                >
                    {approval.status === 'approved'
                        ? 'Approved'
                        : approval.status === 'rejected'
                        ? 'Rejected'
                        : 'Waiting'}
                </StatusBadge>
            </div>

            {/* Approver Info */}
            {approval.approver && (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={approval.approver.avatar}
                            alt={approval.approver.name}
                        />
                        <AvatarFallback>
                            {approval.approver.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            {approval.approver.name}
                        </p>
                        {approval.approver.role && (
                            <p className="text-xs text-muted-foreground">
                                {approval.approver.role}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="mb-4 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Submitted {approval.submittedAt}</span>
                </div>
                {approval.decidedAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {approval.status === 'approved' ? (
                            <Check className="h-4 w-4 text-success" />
                        ) : (
                            <X className="h-4 w-4 text-destructive" />
                        )}
                        <span>
                            {approval.status === 'approved' ? 'Approved' : 'Rejected'}{' '}
                            {approval.decidedAt}
                        </span>
                    </div>
                )}
            </div>

            {/* Feedback (for rejected) */}
            {approval.feedback && approval.status === 'rejected' && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-destructive">
                        Rejection Feedback
                    </p>
                    <p className="text-sm text-foreground">{approval.feedback}</p>
                </div>
            )}

            {/* Action Buttons */}
            {canApprove && approval.status === 'pending' && (
                <div className="flex gap-2 border-t border-border pt-4">
                    <Button
                        className="flex-1 gap-1.5"
                        onClick={onApprove}
                    >
                        <Check className="h-4 w-4" />
                        Approve
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={onReject}
                    >
                        <X className="h-4 w-4" />
                        Reject
                    </Button>
                </div>
            )}

            {/* Waiting Message */}
            {!canApprove && approval.status === 'pending' && (
                <div className="rounded-lg bg-warning/10 p-3 text-center">
                    <p className="text-sm text-warning-foreground">
                        Waiting for approval from your manager
                    </p>
                </div>
            )}
        </div>
    );
}
