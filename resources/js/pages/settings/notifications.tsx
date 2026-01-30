import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/settings' },
    { title: 'Notifications', href: '/settings/notifications' },
];

interface NotificationSetting {
    id: string;
    label: string;
    description: string;
    email: boolean;
    push: boolean;
    inApp: boolean;
}

const initialSettings: NotificationSetting[] = [
    {
        id: 'task-assigned',
        label: 'Task Assigned',
        description: 'When a new task is assigned to you',
        email: true,
        push: true,
        inApp: true,
    },
    {
        id: 'task-approved',
        label: 'Task Approved',
        description: 'When your task submission is approved',
        email: true,
        push: true,
        inApp: true,
    },
    {
        id: 'task-rejected',
        label: 'Task Rejected',
        description: 'When your task submission is rejected with feedback',
        email: true,
        push: true,
        inApp: true,
    },
    {
        id: 'approval-request',
        label: 'Approval Request',
        description: 'When someone submits a task for your approval',
        email: true,
        push: true,
        inApp: true,
    },
    {
        id: 'deadline-reminder',
        label: 'Deadline Reminder',
        description: 'Reminders before task deadlines',
        email: false,
        push: true,
        inApp: true,
    },
    {
        id: 'team-updates',
        label: 'Team Updates',
        description: 'When team members are added or removed',
        email: false,
        push: false,
        inApp: true,
    },
];

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                checked ? 'bg-primary' : 'bg-muted'
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`}
            />
        </button>
    );
}

export default function NotificationSettings() {
    const [settings, setSettings] = useState(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (
        settingId: string,
        channel: 'email' | 'push' | 'inApp'
    ) => {
        setSettings((prev) =>
            prev.map((s) =>
                s.id === settingId ? { ...s, [channel]: !s[channel] } : s
            )
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            alert('Settings saved!');
        }, 1000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notification Settings" />
            <div className="mx-auto w-full max-w-4xl p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                        Notification Preferences
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Choose how you want to be notified about updates
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Channels</CardTitle>
                        <CardDescription>
                            Configure which channels receive notifications
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Channel Headers */}
                        <div className="mb-4 hidden grid-cols-[1fr_80px_80px_80px] gap-4 border-b border-border pb-4 md:grid">
                            <div />
                            <div className="flex flex-col items-center gap-1">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    Email
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    Push
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Bell className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">
                                    In-App
                                </span>
                            </div>
                        </div>

                        {/* Settings List */}
                        <div className="space-y-6">
                            {settings.map((setting) => (
                                <div
                                    key={setting.id}
                                    className="grid gap-4 md:grid-cols-[1fr_80px_80px_80px]"
                                >
                                    {/* Label */}
                                    <div>
                                        <Label className="text-sm font-medium">
                                            {setting.label}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            {setting.description}
                                        </p>
                                    </div>

                                    {/* Mobile: Inline labels */}
                                    <div className="flex items-center justify-between md:hidden">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs">Email</span>
                                        </div>
                                        <Toggle
                                            checked={setting.email}
                                            onChange={() => handleToggle(setting.id, 'email')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between md:hidden">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs">Push</span>
                                        </div>
                                        <Toggle
                                            checked={setting.push}
                                            onChange={() => handleToggle(setting.id, 'push')}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between md:hidden">
                                        <div className="flex items-center gap-2">
                                            <Bell className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs">In-App</span>
                                        </div>
                                        <Toggle
                                            checked={setting.inApp}
                                            onChange={() => handleToggle(setting.id, 'inApp')}
                                        />
                                    </div>

                                    {/* Desktop: Grid toggles */}
                                    <div className="hidden justify-center md:flex">
                                        <Toggle
                                            checked={setting.email}
                                            onChange={() => handleToggle(setting.id, 'email')}
                                        />
                                    </div>
                                    <div className="hidden justify-center md:flex">
                                        <Toggle
                                            checked={setting.push}
                                            onChange={() => handleToggle(setting.id, 'push')}
                                        />
                                    </div>
                                    <div className="hidden justify-center md:flex">
                                        <Toggle
                                            checked={setting.inApp}
                                            onChange={() => handleToggle(setting.id, 'inApp')}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end border-t border-border pt-6">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Preferences'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
