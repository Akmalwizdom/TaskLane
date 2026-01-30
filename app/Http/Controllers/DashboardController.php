<?php

namespace App\Http\Controllers;

use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Calculate stats
        $stats = $this->getStats($user);
        
        // Get pending approvals (for approvers only)
        $approvals = [];
        if ($user->canApprove()) {
            $approvals = Task::pendingApproval()
                ->with(['user', 'assignees'])
                ->where('user_id', '!=', $user->id) // Can't approve own tasks
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($task) => [
                    'id' => (string) $task->id,
                    'title' => $task->title,
                    'submittedBy' => $task->user->name,
                    'priority' => $task->priority,
                    'submittedAt' => $task->created_at->diffForHumans(),
                    'href' => route('tasks.show', $task),
                ]);
        }
        
        // Get user's active tasks
        $tasks = Task::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('assignees', fn ($q) => $q->where('user_id', $user->id));
            })
            ->whereNotIn('status', ['approved', 'rejected', 'completed'])
            ->with('assignees')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($task) => [
                'id' => (string) $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority,
                'dueDate' => $task->due_date?->format('M j'),
                'assignees' => $task->assignees->map(fn ($u) => [
                    'initials' => $this->getInitials($u->name),
                ])->take(3),
                'href' => route('tasks.show', $task),
            ]);
        
        return Inertia::render('dashboard', [
            'stats' => $stats,
            'approvals' => $approvals,
            'tasks' => $tasks,
            'userName' => $user->name,
            'canApprove' => $user->canApprove(),
        ]);
    }

    /**
     * Get dashboard statistics for user.
     */
    private function getStats($user): array
    {
        $baseQuery = Task::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->orWhereHas('assignees', fn ($q) => $q->where('user_id', $user->id));
        });

        $total = (clone $baseQuery)->count();
        $pending = (clone $baseQuery)->where('status', 'pending')->count();
        $inProgress = (clone $baseQuery)->where('status', 'in-progress')->count();
        $completed = (clone $baseQuery)->where('status', 'completed')->count();
        $approved = (clone $baseQuery)->where('status', 'approved')->count();

        return [
            [
                'icon' => 'FileText',
                'label' => 'Total Tasks',
                'value' => $total,
                'variant' => 'default',
            ],
            [
                'icon' => 'Clock',
                'label' => 'Pending Approval',
                'value' => $pending,
                'variant' => 'warning',
            ],
            [
                'icon' => 'Play',
                'label' => 'In Progress',
                'value' => $inProgress,
                'variant' => 'info',
            ],
            [
                'icon' => 'CheckCircle',
                'label' => 'Completed',
                'value' => $completed + $approved,
                'variant' => 'success',
            ],
        ];
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
