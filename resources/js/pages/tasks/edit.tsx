import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { TaskForm, type TaskFormData } from '@/components/tasks/task-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskData {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string | null;
    dueDateFull: string | null;
    assignees: Array<{ id: string; name: string }>;
}

interface Props {
    task: { data: TaskData };
    teamMembers: Array<{ id: string; name: string }>;
    isAdmin: boolean;
}

export default function EditTask({ task, teamMembers, isAdmin }: Props) {
    const { data: taskData } = task;
    const { put, processing } = useForm();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tasks', href: '/tasks' },
        { title: 'Edit Task', href: `/tasks/${taskData.id}/edit` },
    ];

    const handleCancel = () => {
        window.history.back();
    };

    const handleFormSubmit = (formData: TaskFormData, action: 'draft' | 'submit' | 'assign') => {
        router.put(`/tasks/${taskData.id}`, {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            assignee_ids: formData.assigneeId ? [formData.assigneeId] : [],
            due_date: formData.deadline,
            action: action,
        }, {
            onSuccess: () => {
                router.visit(`/tasks/${taskData.id}`);
            },
        });
    };

    // Prepare initial data for TaskForm
    const initialData: Partial<TaskFormData> = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        deadline: taskData.dueDateFull || '',
        assigneeId: taskData.assignees && taskData.assignees.length > 0 
            ? taskData.assignees[0].id.toString() 
            : '',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit - ${taskData.title}`} />
            <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl">
                            Edit Task
                        </CardTitle>
                        <CardDescription>
                            Update the task details below. {isAdmin ? 'You can re-assign it or save updates.' : 'Save changes or submit for approval.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TaskForm
                            initialData={initialData}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                            isSubmitting={processing}
                            teamMembers={teamMembers}
                            isAdmin={isAdmin}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
