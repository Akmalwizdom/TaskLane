<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Display a listing of team members.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', User::class);
        
        $members = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('name')
            ->get()
            ->map(fn ($user) => [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'initials' => $this->getInitials($user->name),
                'joinedAt' => $user->created_at->format('M j, Y'),
            ]);

        return Inertia::render('settings/team', [
            'members' => $members,
            'canManage' => Auth::user()->isAdmin(),
        ]);
    }

    /**
     * Update a team member's role.
     */
    public function updateRole(User $user): RedirectResponse
    {
        $this->authorize('update', $user);
        
        $validated = request()->validate([
            'role' => ['required', Rule::in(['admin', 'approver', 'member'])],
        ]);

        $user->update(['role' => $validated['role']]);

        return redirect()->back()
            ->with('success', "Updated {$user->name}'s role to {$validated['role']}.");
    }

    /**
     * Invite a new team member.
     */
    public function invite(): RedirectResponse
    {
        $this->authorize('create', User::class);
        
        $validated = request()->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', Rule::in(['admin', 'approver', 'member'])],
        ]);

        // For now, create a placeholder user that needs to be activated
        // In production, you'd send an invitation email
        $user = User::create([
            'name' => explode('@', $validated['email'])[0],
            'email' => $validated['email'],
            'password' => bcrypt(str()->random(32)),
            'role' => $validated['role'],
        ]);

        return redirect()->back()
            ->with('success', "Invited {$validated['email']} as {$validated['role']}.");
    }

    /**
     * Remove a team member.
     */
    public function remove(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);
        
        // Don't allow removing yourself
        if ($user->id === Auth::id()) {
            return redirect()->back()
                ->with('error', 'You cannot remove yourself from the team.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->back()
            ->with('success', "Removed {$name} from the team.");
    }

    /**
     * Get user initials from name.
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', $name);
        $initials = '';
        
        foreach ($words as $word) {
            $initials .= strtoupper(substr($word, 0, 1));
        }
        
        return substr($initials, 0, 2);
    }
}
