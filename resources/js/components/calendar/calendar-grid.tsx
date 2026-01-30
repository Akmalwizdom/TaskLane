import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CalendarDay {
    date: number;
    month: 'prev' | 'current' | 'next';
    taskCount: number;
    isToday?: boolean;
}

interface CalendarGridProps {
    month: number;
    year: number;
    onMonthChange?: (month: number, year: number) => void;
    onDayClick?: (date: Date, taskCount: number) => void;
    taskData?: Record<string, number>; // date string -> task count
    className?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function getHeatmapColor(count: number): string {
    if (count === 0) return 'bg-muted/30';
    if (count === 1) return 'bg-chart-1/20';
    if (count === 2) return 'bg-chart-1/40';
    if (count === 3) return 'bg-chart-1/60';
    return 'bg-chart-1/80';
}

function getDaysInMonth(month: number, year: number, taskData?: Record<string, number>): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    
    const days: CalendarDay[] = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: prevMonthDays - i,
            month: 'prev',
            taskCount: 0,
        });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        // Format date as YYYY-MM-DD to match backend
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const count = taskData?.[dateStr] || 0;
        
        days.push({
            date: i,
            month: 'current',
            taskCount: count,
            isToday: isCurrentMonth && today.getDate() === i,
        });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: i,
            month: 'next',
            taskCount: 0,
        });
    }
    
    return days;
}

export function CalendarGrid({
    month,
    year,
    onMonthChange,
    onDayClick,
    taskData,
    className,
}: CalendarGridProps) {
    const days = getDaysInMonth(month, year, taskData);

    const handlePrevMonth = () => {
        const newMonth = month === 0 ? 11 : month - 1;
        const newYear = month === 0 ? year - 1 : year;
        onMonthChange?.(newMonth, newYear);
    };

    const handleNextMonth = () => {
        const newMonth = month === 11 ? 0 : month + 1;
        const newYear = month === 11 ? year + 1 : year;
        onMonthChange?.(newMonth, newYear);
    };

    const handleDayClick = (day: CalendarDay) => {
        if (day.month !== 'current') return;
        const date = new Date(year, month, day.date);
        onDayClick?.(date, day.taskCount);
    };

    return (
        <div className={cn('rounded-xl border border-border bg-card p-4 md:p-6', className)}>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground md:text-xl">
                    {MONTHS[month]} {year}
                </h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Day Headers */}
            <div className="mb-2 grid grid-cols-7 gap-1">
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => (
                    <button
                        key={index}
                        onClick={() => handleDayClick(day)}
                        disabled={day.month !== 'current'}
                        className={cn(
                            'relative aspect-square rounded-lg p-1 text-sm transition-colors',
                            day.month !== 'current' && 'cursor-not-allowed opacity-30',
                            day.month === 'current' && 'cursor-pointer hover:ring-2 hover:ring-primary/50',
                            day.isToday && 'ring-2 ring-primary',
                            getHeatmapColor(day.month === 'current' ? day.taskCount : 0)
                        )}
                    >
                        <span
                            className={cn(
                                'flex h-6 w-6 items-center justify-center rounded-full text-xs md:text-sm',
                                day.isToday && 'bg-primary font-bold text-primary-foreground'
                            )}
                        >
                            {day.date}
                        </span>
                        {day.month === 'current' && day.taskCount > 0 && (
                            <span className="absolute bottom-1 right-1 text-[10px] font-medium text-primary">
                                {day.taskCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-2 border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">Less</span>
                <div className="flex gap-1">
                    <div className="h-4 w-4 rounded bg-muted/30" />
                    <div className="h-4 w-4 rounded bg-chart-1/20" />
                    <div className="h-4 w-4 rounded bg-chart-1/40" />
                    <div className="h-4 w-4 rounded bg-chart-1/60" />
                    <div className="h-4 w-4 rounded bg-chart-1/80" />
                </div>
                <span className="text-xs text-muted-foreground">More</span>
            </div>
        </div>
    );
}
