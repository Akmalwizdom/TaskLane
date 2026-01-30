<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskActivity extends Model
{
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'task_id',
        'user_id',
        'type',
        'description',
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($activity) {
            $activity->created_at = $activity->created_at ?? now();
        });
    }

    /**
     * Get the task that the activity belongs to.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the user who performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get formatted activity description.
     */
    public function getFormattedDescriptionAttribute(): string
    {
        $descriptions = [
            'created' => 'created this task',
            'updated' => 'updated this task',
            'submitted' => 'submitted for approval',
            'approved' => 'approved this task',
            'rejected' => 'rejected this task',
            'comment' => $this->description,
        ];

        return $descriptions[$this->type] ?? $this->description ?? 'performed an action';
    }
}
