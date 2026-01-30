import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon?: LucideIcon;
    label: string;
    value: string | number;
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
    className?: string;
}

const variantStyles = {
    default: 'bg-muted/50 text-muted-foreground',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning-foreground',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info',
};

export function StatsCard({
    icon: Icon,
    label,
    value,
    variant = 'default',
    className,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm',
                className
            )}
        >
            {Icon && (
                <div
                    className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                        variantStyles[variant]
                    )}
                >
                    <Icon className="h-5 w-5" />
                </div>
            )}
            <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                </p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

// Dashboard stats row component
interface DashboardStatsProps {
    stats: Array<{
        icon?: LucideIcon;
        label: string;
        value: string | number;
        variant?: StatsCardProps['variant'];
    }>;
    className?: string;
}

export function DashboardStats({ stats, className }: DashboardStatsProps) {
    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4',
                className
            )}
        >
            {stats.map((stat, index) => (
                <StatsCard
                    key={index}
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                    variant={stat.variant}
                />
            ))}
        </div>
    );
}
