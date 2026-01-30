import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { TaskForm, type TaskFormData } from '@/components/tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamMember {
    id: string;
    name: string;
    email: string;
}

interface Props {
    teamMembers: TeamMember[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tasks', href: '/tasks' },
    { title: 'Create Task', href: '/tasks/create' },
];

export default function CreateTask({ teamMembers }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        due_date: '',
        assignee_ids: [] as string[],
        action: 'submit' as 'draft' | 'submit',
    });

    const handleSubmit = (formData: TaskFormData, action: 'draft' | 'submit') => {
        post('/tasks', {
            data: {
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                due_date: formData.dueDate,
                assignee_ids: formData.assigneeIds,
                action: action,
            },
            onSuccess: () => {
                router.visit('/tasks');
            },
        });
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Task" />
            <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl">
                            Create New Task
                        </CardTitle>
                        <CardDescription>
                            Fill in the details below to create a new task. You can save it as a draft or submit it directly for approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isSubmitting={processing}
                            teamMembers={teamMembers}
                            errors={errors}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
