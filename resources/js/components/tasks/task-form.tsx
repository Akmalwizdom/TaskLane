import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export interface TaskFormData {
    title: string;
    description: string;
    assigneeId: string;
    priority: 'low' | 'medium' | 'high';
    deadline: string;
}

interface TaskFormProps {
    initialData?: Partial<TaskFormData>;
    teamMembers?: Array<{ id: string; name: string }>;
    isAdmin?: boolean;
    onSubmit: (data: TaskFormData, action: 'draft' | 'submit' | 'assign') => void;
    onCancel?: () => void;
    isSubmitting?: boolean;
    errors?: Record<string, string>;
    className?: string;
}

export function TaskForm({
    initialData,
    teamMembers = [],
    isAdmin = false,
    onSubmit,
    onCancel,
    isSubmitting = false,
    errors = {},
    className,
}: TaskFormProps) {
    const [formData, setFormData] = useState<TaskFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        assigneeId: initialData?.assigneeId || '',
        priority: initialData?.priority || 'medium',
        deadline: initialData?.deadline || '',
    });

    const handleChange = (
        field: keyof TaskFormData,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (action: 'draft' | 'submit' | 'assign') => {
        onSubmit(formData, action);
    };

    return (
        <form
            className={cn('flex flex-col gap-6', className)}
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(isAdmin && formData.assigneeId ? 'assign' : 'submit');
            }}
        >
            {/* Title */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="title" className="text-sm font-medium">
                    Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="title"
                    placeholder="Enter a clear and descriptive title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                    className={cn("h-11", errors.title && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.title && (
                    <p className="text-xs font-medium text-destructive">{errors.title}</p>
                )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="description" className="text-sm font-medium">
                    Description
                </Label>
                <textarea
                    id="description"
                    placeholder="Describe the task in detail..."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className={cn(
                        "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                        errors.description && "border-destructive focus-visible:ring-destructive"
                    )}
                />
                {errors.description && (
                    <p className="text-xs font-medium text-destructive">{errors.description}</p>
                )}
            </div>

            {/* Two Column Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Assignee */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="assignee" className="text-sm font-medium">
                        Assign To
                    </Label>
                    <Select
                        value={formData.assigneeId}
                        onValueChange={(value) => handleChange('assigneeId', value)}
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                            {teamMembers.map((assignee) => (
                                <SelectItem key={assignee.id} value={assignee.id.toString()}>
                                    {assignee.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.assignee_ids && (
                        <p className="text-xs font-medium text-destructive">{errors.assignee_ids}</p>
                    )}
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="priority" className="text-sm font-medium">
                        Priority
                    </Label>
                    <Select
                        value={formData.priority}
                        onValueChange={(value) => handleChange('priority', value as TaskFormData['priority'])}
                    >
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-success" />
                                    Low
                                </span>
                            </SelectItem>
                            <SelectItem value="medium">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-warning" />
                                    Medium
                                </span>
                            </SelectItem>
                            <SelectItem value="high">
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                    High
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.priority && (
                        <p className="text-xs font-medium text-destructive">{errors.priority}</p>
                    )}
                </div>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-2">
                <Label htmlFor="deadline" className="text-sm font-medium">
                    Deadline
                </Label>
                <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    className={cn("h-11", errors.due_date && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.due_date && (
                    <p className="text-xs font-medium text-destructive">{errors.due_date}</p>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit('draft')}
                    disabled={isSubmitting || !formData.title}
                >
                    Save as Draft
                </Button>
                {isAdmin && formData.assigneeId ? (
                    <Button
                        type="submit"
                        disabled={isSubmitting || !formData.title}
                    >
                        {isSubmitting ? 'Assigning...' : 'Assign Task'}
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        disabled={isSubmitting || !formData.title}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                )}
            </div>
        </form>
    );
}
