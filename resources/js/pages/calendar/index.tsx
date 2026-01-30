import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { CalendarGrid, DayPanel } from '@/components/calendar';
import { DashboardStats } from '@/components/dashboard';
import { CheckCircle2, Clock, FileText, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Calendar', href: '/calendar' },
];

interface DayTask {
    id: string;
    title: string;
    status: 'draft' | 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
    priority: string;
    assignees: Array<{ name: string; initials: string }>;
    href: string;
}

interface Props {
    tasksByDate: Record<string, number>;
    currentMonth: number;
    currentYear: number;
}

const stats = [
    { icon: FileText, label: 'Total Tasks', value: 0, variant: 'info' as const },
    { icon: CheckCircle2, label: 'Completed', value: 0, variant: 'success' as const },
    { icon: Clock, label: 'Pending', value: 0, variant: 'warning' as const },
    { icon: TrendingUp, label: 'This Month', value: 0, variant: 'default' as const },
];

export default function CalendarPage({ tasksByDate, currentMonth, currentYear }: Props) {
    const [month, setMonth] = useState(currentMonth - 1); // JS months are 0-indexed
    const [year, setYear] = useState(currentYear);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dayTasks, setDayTasks] = useState<DayTask[]>([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

    const handleMonthChange = (newMonth: number, newYear: number) => {
        setMonth(newMonth);
        setYear(newYear);
        setSelectedDate(null);
        
        // Navigate to fetch new month data
        router.get('/calendar', { 
            month: newMonth + 1, // Convert back to 1-indexed
            year: newYear 
        }, { 
            preserveState: true,
            replace: true,
        });
    };

    const handleDayClick = async (date: Date, taskCount: number) => {
        setSelectedDate(date);
        
        if (taskCount > 0) {
            setIsLoadingTasks(true);
            try {
                const response = await fetch(`/calendar/day?date=${date.toISOString().split('T')[0]}`);
                const data = await response.json();
                setDayTasks(data.tasks || []);
            } catch (error) {
                console.error('Failed to fetch day tasks:', error);
                setDayTasks([]);
            } finally {
                setIsLoadingTasks(false);
            }
        } else {
            setDayTasks([]);
        }
    };

    const handleClosePanel = () => {
        setSelectedDate(null);
        setDayTasks([]);
    };

    // Transform dayTasks to the format expected by DayPanel
    // Filter out draft and rejected statuses as they're not in DayPanel's type
    const panelTasks = dayTasks
        .filter((task) => ['pending', 'in-progress', 'completed', 'approved'].includes(task.status))
        .map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status as 'pending' | 'in-progress' | 'completed' | 'approved',
            time: '', // We don't have time in our model
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        Activity Calendar
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Track your task activities across the month
                    </p>
                </div>

                {/* Calendar + Panel Layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2">
                        <CalendarGrid
                            month={month}
                            year={year}
                            onMonthChange={handleMonthChange}
                            onDayClick={handleDayClick}
                            taskData={tasksByDate}
                        />
                    </div>

                    {/* Day Panel */}
                    <div className="lg:col-span-1">
                        {selectedDate ? (
                            <DayPanel
                                date={selectedDate}
                                tasks={panelTasks}
                                onClose={handleClosePanel}
                            />
                        ) : (
                            <div className="flex h-full min-h-[300px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Select a day to view tasks
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground/70">
                                        Click on any day in the calendar to see the tasks
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
