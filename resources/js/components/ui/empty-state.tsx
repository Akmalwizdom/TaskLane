import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    secondaryAction?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    className?: string;
    children?: React.ReactNode;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center',
                className
            )}
        >
            {Icon && (
                <div className="relative mb-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                </div>
            )}

            <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>

            {description && (
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}

            {(action || secondaryAction) && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {action && (
                        <Button onClick={action.onClick} asChild={!!action.href}>
                            {action.href ? (
                                <a href={action.href}>{action.label}</a>
                            ) : (
                                action.label
                            )}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            variant="outline"
                            onClick={secondaryAction.onClick}
                            asChild={!!secondaryAction.href}
                        >
                            {secondaryAction.href ? (
                                <a href={secondaryAction.href}>
                                    {secondaryAction.label}
                                </a>
                            ) : (
                                secondaryAction.label
                            )}
                        </Button>
                    )}
                </div>
            )}

            {children}
        </div>
    );
}

// Preset empty states for common scenarios
export function NoTasksEmptyState({
    onCreateTask,
}: {
    onCreateTask?: () => void;
}) {
    return (
        <EmptyState
            title="Everything is up to date"
            description="You've cleared your queue. Take a moment to breathe or start a new workflow."
            action={{
                label: 'Create your first task',
                onClick: onCreateTask,
            }}
        />
    );
}

export function NoApprovalsEmptyState() {
    return (
        <EmptyState
            title="No pending approvals"
            description="There are no items waiting for your review at the moment."
        />
    );
}

export function NoResultsEmptyState({
    searchQuery,
    onClear,
}: {
    searchQuery?: string;
    onClear?: () => void;
}) {
    return (
        <EmptyState
            title="No results found"
            description={
                searchQuery
                    ? `No items match "${searchQuery}". Try a different search term.`
                    : 'No items match your current filters.'
            }
            action={
                onClear
                    ? {
                          label: 'Clear filters',
                          onClick: onClear,
                      }
                    : undefined
            }
        />
    );
}
