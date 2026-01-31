import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { TaskCard, AddTaskCard, type TaskItem } from '@/components/dashboard';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    tasks: {
        data: TaskItem[];
        links: PaginationLink[];
        meta?: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filters: {
        search?: string;
        status?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tasks', href: '/tasks' },
];

type StatusFilter = 'all' | 'draft' | 'assigned' | 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';

export default function TasksIndex({ tasks, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>((filters.status as StatusFilter) || 'all');

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get('/tasks', { 
                    search: searchQuery || undefined,
                    status: statusFilter === 'all' ? undefined : statusFilter 
                }, { 
                    preserveState: true,
                    replace: true 
                });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const handleStatusChange = (status: StatusFilter) => {
        setStatusFilter(status);
        router.get('/tasks', { 
            search: searchQuery || undefined,
            status: status === 'all' ? undefined : status 
        }, { 
            preserveState: true,
            replace: true 
        });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        router.get('/tasks', {}, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                            Tasks
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and track all your tasks in one place
                        </p>
                    </div>
                    <Link href="/tasks/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Task
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-10 pl-9"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter}
                        onValueChange={(v) => handleStatusChange(v as StatusFilter)}
                    >
                        <SelectTrigger className="h-10 w-full sm:w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap gap-2">
                    {(['all', 'draft', 'assigned', 'pending', 'in-progress', 'completed', 'approved', 'rejected'] as StatusFilter[]).map(
                        (status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                    statusFilter === status
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                            </button>
                        )
                    )}
                </div>

                {/* Task Grid */}
                {tasks.data.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tasks.data.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No tasks found"
                        description={
                            searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filters.'
                                : 'Create your first task to get started.'
                        }
                        action={
                            searchQuery || statusFilter !== 'all'
                                ? {
                                      label: 'Clear filters',
                                      onClick: clearFilters,
                                  }
                                : { label: 'Create Task', href: '/tasks/create' }
                        }
                    />
                )}

                {/* Pagination */}
                {tasks.links && tasks.links.length > 3 && (
                    <div className="flex justify-center gap-1">
                        {tasks.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded text-sm ${
                                    link.active 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
