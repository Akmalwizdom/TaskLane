<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Display a listing of tasks.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Admin sees all tasks, members see only their own or assigned to them
        $tasks = Task::query()
            ->when(!$user->isAdmin(), function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                        ->orWhereHas('assignees', fn ($sub) => $sub->where('user_id', $user->id));
                });
            })
            ->when(request('search'), function ($query, $search) {
                $query->where('title', 'ilike', "%{$search}%");
            })
            ->when(request('status'), function ($query, $status) {
                $query->where('status', $status);
            })
            ->with(['user', 'assignees'])
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('tasks/index', [
            'tasks' => TaskResource::collection($tasks),
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new task.
     */
    public function create(): Response
    {
        $user = Auth::user();
        
        // Get team members for assignment
        $teamMembers = User::select('id', 'name', 'email')
            ->where('id', '!=', Auth::id())
            ->get();

        return Inertia::render('tasks/create', [
            'teamMembers' => $teamMembers,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $action = $validated['action'];
        $assigneeIds = $validated['assignee_ids'] ?? [];
        unset($validated['action'], $validated['assignee_ids']);

        $user = Auth::user();
        
        // Determine initial status based on action and role
        if ($user->isAdmin() && !empty($assigneeIds) && $action === 'assign') {
            $status = 'assigned';
            $activityType = 'assigned';
        } elseif ($action === 'submit') {
            $status = 'pending';
            $activityType = 'submitted';
        } else {
            $status = 'draft';
            $activityType = 'created';
        }

        $task = Auth::user()->tasks()->create([
            ...$validated,
            'status' => $status,
        ]);

        // Attach assignees
        if (!empty($assigneeIds)) {
            $task->assignees()->attach($assigneeIds);
        }

        // Log activity
        $task->logActivity($activityType);

        $message = match($status) {
            'assigned' => 'Task assigned successfully.',
            'pending' => 'Task submitted for approval.',
            default => 'Task saved as draft.',
        };

        return redirect()->route('tasks.index')->with('success', $message);
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load(['user', 'assignees', 'approver', 'attachments', 'activities.user']);
        
        $user = Auth::user();

        return Inertia::render('tasks/show', [
            'task' => new TaskResource($task),
            'activities' => $task->activities->map(fn ($activity) => [
                'id' => (string) $activity->id,
                'user' => [
                    'id' => (string) $activity->user->id,
                    'name' => $activity->user->name,
                    'initials' => $this->getInitials($activity->user->name),
                ],
                'type' => $activity->type,
                'description' => $activity->formatted_description,
                'time' => $activity->created_at->diffForHumans(),
            ]),
            'permissions' => [
                'canUpdate' => $user->can('update', $task),
                'canDelete' => $user->can('delete', $task),
                'canStartWork' => $user->can('startWork', $task),
                'canSubmit' => $user->can('submit', $task),
                'canApprove' => $user->can('approve', $task),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified task.
     */
    public function edit(Task $task): Response
    {
        $this->authorize('update', $task);

        $teamMembers = User::select('id', 'name', 'email')
            ->where('id', '!=', Auth::id())
            ->get();

        return Inertia::render('tasks/edit', [
            'task' => new TaskResource($task),
            'teamMembers' => $teamMembers,
            'isAdmin' => Auth::user()->isAdmin(),
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $validated = $request->validated();
        $action = $validated['action'] ?? null;
        unset($validated['action'], $validated['assignee_ids']);

        $task->update($validated);

        // Sync assignees
        if ($request->has('assignee_ids')) {
            $task->assignees()->sync($request->assignee_ids);
        }

        // Handle submit action
        if ($action === 'submit' && in_array($task->status, ['draft', 'in-progress', 'rejected'])) {
            $task->update(['status' => 'pending']);
            $task->logActivity('submitted');
        } else {
            $task->logActivity('updated');
        }

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Task updated successfully.');
    }

    /**
     * Remove the specified task.
     */
    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->route('tasks.index')
            ->with('success', 'Task deleted successfully.');
    }

    /**
     * Start working on the assigned task.
     */
    public function startWork(Task $task): RedirectResponse
    {
        $this->authorize('startWork', $task);

        $task->update(['status' => 'in-progress']);
        $task->logActivity('started');

        return redirect()->back()
            ->with('success', 'You have started working on this task.');
    }

    /**
     * Submit the task for review.
     */
    public function submit(Task $task): RedirectResponse
    {
        $this->authorize('submit', $task);

        $task->update(['status' => 'pending']);
        $task->logActivity('submitted');

        return redirect()->back()
            ->with('success', 'Task submitted for review.');
    }

    /**
     * Approve the specified task.
     */
    public function approve(Task $task): RedirectResponse
    {
        $this->authorize('approve', $task);

        $task->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        $task->logActivity('approved');

        return redirect()->back()
            ->with('success', 'Task approved successfully.');
    }

    /**
     * Reject the specified task.
     */
    public function reject(Task $task): RedirectResponse
    {
        $this->authorize('approve', $task);

        $task->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => request('rejection_reason'),
        ]);

        $task->logActivity('rejected', auth()->id(), request('rejection_reason'));

        return redirect()->back()
            ->with('success', 'Task rejected.');
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
