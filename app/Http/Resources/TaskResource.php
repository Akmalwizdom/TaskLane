<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'dueDate' => $this->due_date?->format('M j'),
            'dueDateFull' => $this->due_date?->format('Y-m-d'),
            'createdAt' => $this->created_at?->format('M j, Y'),
            'assignees' => $this->whenLoaded('assignees', fn () => 
                $this->assignees->map(fn ($user) => [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'initials' => $this->getInitials($user->name),
                ])
            ),
            'assigneeIds' => $this->whenLoaded('assignees', fn () => 
                $this->assignees->pluck('id')->map(fn ($id) => (string) $id)
            ),
            'creator' => $this->whenLoaded('user', fn () => [
                'id' => (string) $this->user->id,
                'name' => $this->user->name,
                'initials' => $this->getInitials($this->user->name),
            ]),
            'approver' => $this->whenLoaded('approver', fn () => 
                $this->approver ? [
                    'id' => (string) $this->approver->id,
                    'name' => $this->approver->name,
                ] : null
            ),
            'approvedAt' => $this->approved_at?->format('M j, Y'),
            'rejectionReason' => $this->rejection_reason,
            'href' => route('tasks.show', $this->resource),
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
