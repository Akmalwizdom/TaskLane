import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { X, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DayTask {
    id: string;
    title: string;
    status: 'pending' | 'in-progress' | 'completed' | 'approved';
    time?: string;
}

interface DayPanelProps {
    date: Date | null;
    tasks: DayTask[];
    onClose: () => void;
    onTaskClick?: (taskId: string) => void;
    className?: string;
}

const statusIcons = {
    pending: Clock,
    'in-progress': Clock,
    completed: CheckCircle2,
    approved: CheckCircle2,
};

export function DayPanel({
    date,
    tasks,
    onClose,
    onTaskClick,
    className,
}: DayPanelProps) {
    if (!date) return null;

    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div
            className={cn(
                'rounded-xl border border-border bg-card shadow-lg',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        {formattedDate}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Task List */}
            <div className="max-h-[400px] overflow-y-auto p-4">
                {tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const Icon = statusIcons[task.status];
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => onTaskClick?.(task.id)}
                                    className="flex w-full items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50"
                                >
                                    <div
                                        className={cn(
                                            'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                                            task.status === 'completed' || task.status === 'approved'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/15 text-warning-foreground'
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">
                                            {task.title}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <StatusBadge variant={task.status} size="sm">
                                                {task.status.charAt(0).toUpperCase() +
                                                    task.status.slice(1).replace('-', ' ')}
                                            </StatusBadge>
                                            {task.time && (
                                                <span className="text-xs text-muted-foreground">
                                                    {task.time}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        <p className="text-sm">No tasks for this day</p>
                    </div>
                )}
            </div>
        </div>
    );
}
