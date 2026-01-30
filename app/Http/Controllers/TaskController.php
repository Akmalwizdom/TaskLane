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
        
        $tasks = Task::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('assignees', fn ($q) => $q->where('user_id', $user->id));
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
        $teamMembers = User::select('id', 'name', 'email')
            ->where('id', '!=', Auth::id())
            ->get();

        return Inertia::render('tasks/create', [
            'teamMembers' => $teamMembers,
        ]);
    }

    /**
     * Store a newly created task.
     */
    public function store(StoreTaskRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $action = $validated['action'];
        unset($validated['action'], $validated['assignee_ids']);

        $task = Auth::user()->tasks()->create([
            ...$validated,
            'status' => $action === 'submit' ? 'pending' : 'draft',
        ]);

        // Attach assignees
        if ($request->has('assignee_ids')) {
            $task->assignees()->attach($request->assignee_ids);
        }

        // Log activity
        $task->logActivity($action === 'submit' ? 'submitted' : 'created');

        return redirect()->route('tasks.index')
            ->with('success', $action === 'submit' 
                ? 'Task submitted for approval.' 
                : 'Task saved as draft.');
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load(['user', 'assignees', 'approver', 'attachments', 'activities.user']);

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
        if ($action === 'submit' && $task->status === 'draft') {
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
