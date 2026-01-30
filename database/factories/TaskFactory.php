<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['draft', 'pending', 'in-progress', 'completed', 'approved', 'rejected'];
        $priorities = ['low', 'medium', 'high'];

        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraphs(2, true),
            'status' => fake()->randomElement($statuses),
            'priority' => fake()->randomElement($priorities),
            'due_date' => fake()->dateTimeBetween('now', '+30 days'),
        ];
    }

    /**
     * Set task as draft.
     */
    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    /**
     * Set task as pending approval.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Set task as in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in-progress',
        ]);
    }

    /**
     * Set task as completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    /**
     * Set task as approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_by' => User::factory()->state(['role' => 'approver']),
            'approved_at' => now(),
        ]);
    }

    /**
     * Set task as rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'approved_by' => User::factory()->state(['role' => 'approver']),
            'approved_at' => now(),
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Set task with high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'high',
        ]);
    }
}
