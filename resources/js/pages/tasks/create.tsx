import { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { TaskForm, type TaskFormData } from '@/components/tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tasks', href: '/tasks' },
    { title: 'Create Task', href: '/tasks/create' },
];

interface Props {
    teamMembers: Array<{ id: string; name: string }>;
    isAdmin: boolean;
}

export default function CreateTask({ teamMembers, isAdmin }: Props) {
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };
    const [submitting, setSubmitting] = useState(false);

    const handleCancel = () => {
        window.history.back();
    };

    const handleFormSubmit = (formData: TaskFormData, action: 'draft' | 'submit' | 'assign') => {
        setSubmitting(true);
        router.post('/tasks', {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            assignee_ids: formData.assigneeId ? [formData.assigneeId] : [],
            due_date: formData.deadline,
            action: action,
        }, {
            onSuccess: () => {
                router.visit('/tasks');
            },
            onFinish: () => {
                setSubmitting(false);
            }
        });
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
                            Fill in the details below to create a new task. {isAdmin ? 'Assign it to a team member or save as draft.' : 'Save it as a draft or submit it for approval.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                            isSubmitting={submitting}
                            errors={errors}
                            teamMembers={teamMembers}
                            isAdmin={isAdmin}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
