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
            || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Both admin and members can create tasks
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Task $task): bool
    {
        // Creator can update if not yet approved/rejected
        // Assignee can update if task is assigned to them and status is 'assigned' or 'in-progress'
        $isCreator = $user->id === $task->user_id;
        $isAssignee = $task->assignees->contains('id', $user->id);
        $isEditable = !in_array($task->status, ['approved', 'rejected', 'pending']);
        
        return ($isCreator || $isAssignee) && $isEditable;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Task $task): bool
    {
        // Only creator can delete, and only if draft or assigned
        return $user->id === $task->user_id 
            && in_array($task->status, ['draft', 'assigned']);
    }

    /**
     * Determine whether the user can start working on the task.
     */
    public function startWork(User $user, Task $task): bool
    {
        // Assignee can start work if task is assigned to them
        return $task->assignees->contains('id', $user->id)
            && $task->status === 'assigned';
    }

    /**
     * Determine whether the user can submit the task for review.
     */
    public function submit(User $user, Task $task): bool
    {
        // Creator can submit their own draft task
        // Assignee can submit tasks they're working on
        $isCreator = $user->id === $task->user_id;
        $isAssignee = $task->assignees->contains('id', $user->id);
        
        if ($isCreator && $task->status === 'draft') {
            return true;
        }
        
        if ($isAssignee && in_array($task->status, ['assigned', 'in-progress', 'rejected'])) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine whether the user can approve/reject the task.
     */
    public function approve(User $user, Task $task): bool
    {
        // Must be admin, task must be pending, and can't approve own task
        return $user->isAdmin() 
            && $task->status === 'pending'
            && $user->id !== $task->user_id;
    }
}
