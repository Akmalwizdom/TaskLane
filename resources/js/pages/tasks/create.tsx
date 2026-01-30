import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { TaskForm, type TaskFormData } from '@/components/tasks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tasks', href: '/tasks' },
    { title: 'Create Task', href: '/tasks/create' },
];

export default function CreateTask() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        assigneeId: '',
        deadline: '',
        action: 'submit' as 'draft' | 'submit',
    });

    const handleSubmit = (formData: TaskFormData, action: 'draft' | 'submit') => {
        post('/tasks', {
            preserveState: true,
            onSuccess: () => {
                router.visit('/tasks');
            },
        });
    };

    const handleCancel = () => {
        window.history.back();
    };

    // Update form data when TaskForm changes
    const handleFormSubmit = (formData: TaskFormData, action: 'draft' | 'submit') => {
        // Use router.post for custom data transformation
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
                            Fill in the details below to create a new task. You can save it as a draft or submit it directly for approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                            isSubmitting={processing}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
