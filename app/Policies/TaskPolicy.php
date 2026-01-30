<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Task $task): bool
    {
        return $user->id === $task->user_id 
            || $task->assignees->contains('id', $user->id)
            || $user->canApprove();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // Only creator can update, and only if not approved/rejected
        return $user->id === $task->user_id 
            && !in_array($task->status, ['approved', 'rejected']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Only creator can delete, and only if draft
        return $user->id === $task->user_id && $task->status === 'draft';
    }

    /**
     * Determine whether the user can approve/reject the task.
     */
    public function approve(User $user, Task $task): bool
    {
        // Must be approver and task must be pending
        return $user->canApprove() 
            && $task->status === 'pending'
            && $user->id !== $task->user_id; // Can't approve own task
    }
}
