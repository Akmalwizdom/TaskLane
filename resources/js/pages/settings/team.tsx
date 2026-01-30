import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Plus, Search, Shield, User, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/settings' },
    { title: 'Team', href: '/settings/team' },
];

interface TeamMember {
    id: string;
    name: string;
    email: string;
    initials: string;
    role: 'admin' | 'approver' | 'member';
    joinedAt: string;
}

interface Props {
    members: TeamMember[];
    canManage: boolean;
}

const roleColors = {
    admin: 'bg-primary/10 text-primary',
    approver: 'bg-warning/15 text-warning-foreground',
    member: 'bg-muted text-muted-foreground',
};

function getRoleLabel(role: TeamMember['role']): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function TeamSettings({ members, canManage }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);
    
    const inviteForm = useForm({
        email: '',
        role: 'member' as 'admin' | 'approver' | 'member',
    });

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
        router.patch(`/settings/team/${memberId}/role`, { role: newRole }, {
            preserveScroll: true,
        });
    };

    const handleRemoveMember = (memberId: string) => {
        if (confirm('Are you sure you want to remove this member?')) {
            router.delete(`/settings/team/${memberId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleInvite = () => {
        inviteForm.post('/settings/team/invite', {
            onSuccess: () => {
                setInviteOpen(false);
                inviteForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Management" />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                            Team Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage team members and their roles
                        </p>
                    </div>
                    {canManage && (
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Invite Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite Team Member</DialogTitle>
                                    <DialogDescription>
                                        Send an invitation to join your team.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="colleague@company.com"
                                            value={inviteForm.data.email}
                                            onChange={(e) => inviteForm.setData('email', e.target.value)}
                                        />
                                        {inviteForm.errors.email && (
                                            <p className="text-sm text-destructive">{inviteForm.errors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={inviteForm.data.role}
                                            onValueChange={(v) => inviteForm.setData('role', v as TeamMember['role'])}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="member">Member</SelectItem>
                                                <SelectItem value="approver">Approver</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setInviteOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleInvite} disabled={inviteForm.processing}>
                                        Send Invitation
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-lg">Team Members</CardTitle>
                                <CardDescription>
                                    {members.length} members in your team
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search members..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop Table */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        <th className="pb-3 pr-4">Member</th>
                                        <th className="pb-3 pr-4">Role</th>
                                        <th className="pb-3 pr-4">Joined</th>
                                        {canManage && <th className="pb-3 w-12"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id}>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="text-sm">
                                                            {member.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-foreground">
                                                            {member.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                {canManage ? (
                                                    <Select
                                                        value={member.role}
                                                        onValueChange={(v) =>
                                                            handleRoleChange(
                                                                member.id,
                                                                v as TeamMember['role']
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="h-8 w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="approver">Approver</SelectItem>
                                                            <SelectItem value="member">Member</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${roleColors[member.role]}`}>
                                                        {getRoleLabel(member.role)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 pr-4 text-sm text-muted-foreground">
                                                {member.joinedAt}
                                            </td>
                                            {canManage && (
                                                <td className="py-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                                        onClick={() => handleRemoveMember(member.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="space-y-4 md:hidden">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="rounded-lg border border-border bg-muted/20 p-4"
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>
                                                    {member.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {member.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {member.email}
                                                </p>
                                            </div>
                                        </div>
                                        {canManage && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleRemoveMember(member.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${roleColors[member.role]}`}
                                        >
                                            {getRoleLabel(member.role)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            Joined {member.joinedAt}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredMembers.length === 0 && (
                            <div className="py-8 text-center text-muted-foreground">
                                <p className="text-sm">No members found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
