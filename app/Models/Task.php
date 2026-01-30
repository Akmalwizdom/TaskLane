<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'priority',
        'due_date',
        'approved_by',
        'approved_at',
        'rejection_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the user who created the task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who approved/rejected the task.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the users assigned to the task.
     */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_assignees')
            ->withPivot('created_at');
    }

    /**
     * Get the task attachments.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    /**
     * Get the task activities.
     */
    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class)->orderByDesc('created_at');
    }

    /**
     * Scope for tasks not in draft status (published).
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', '!=', 'draft');
    }

    /**
     * Scope for tasks belonging to a specific user.
     */
    public function scopeForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for tasks pending approval.
     */
    public function scopePendingApproval(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for tasks filtered by status.
     */
    public function scopeByStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for tasks on a specific date.
     */
    public function scopeOnDate(Builder $query, string $date): Builder
    {
        return $query->whereDate('due_date', $date);
    }

    /**
     * Log an activity for this task.
     */
    public function logActivity(string $type, ?int $userId = null, ?string $description = null): TaskActivity
    {
        return $this->activities()->create([
            'user_id' => $userId ?? auth()->id(),
            'type' => $type,
            'description' => $description,
        ]);
    }
}
