<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create users with different roles
        $admin = User::firstOrCreate(
            ['email' => 'admin@tasklane.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        $approver = User::firstOrCreate(
            ['email' => 'approver@tasklane.com'],
            [
                'name' => 'Sarah Manager',
                'password' => bcrypt('password'),
                'role' => 'approver',
            ]
        );

        $member1 = User::firstOrCreate(
            ['email' => 'john@tasklane.com'],
            [
                'name' => 'John Doe',
                'password' => bcrypt('password'),
                'role' => 'member',
            ]
        );

        $member2 = User::firstOrCreate(
            ['email' => 'jane@tasklane.com'],
            [
                'name' => 'Jane Smith',
                'password' => bcrypt('password'),
                'role' => 'member',
            ]
        );

        // Create sample tasks
        $tasks = [
            [
                'user_id' => $member1->id,
                'title' => 'Landing Page Redesign',
                'description' => "Complete overhaul of the company landing page with new branding guidelines.\n\nThis task involves:\n- Updating the hero section with new messaging\n- Implementing the new color scheme\n- Adding interactive elements and animations\n- Ensuring mobile responsiveness\n- Optimizing for Core Web Vitals",
                'status' => 'in-progress',
                'priority' => 'high',
                'due_date' => now()->addDays(5),
            ],
            [
                'user_id' => $member1->id,
                'title' => 'Q1 Marketing Strategy',
                'description' => 'Develop comprehensive marketing plan for the first quarter including social media campaigns, email marketing, and content strategy.',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays(10),
            ],
            [
                'user_id' => $member2->id,
                'title' => 'Customer Feedback Analysis',
                'description' => 'Compile and analyze customer feedback from the past month. Create actionable insights report.',
                'status' => 'completed',
                'priority' => 'low',
                'due_date' => now()->subDays(2),
            ],
            [
                'user_id' => $member1->id,
                'title' => 'Mobile App Beta Testing',
                'description' => 'Coordinate beta testing phase for the mobile application. Document bugs and user feedback.',
                'status' => 'approved',
                'priority' => 'high',
                'due_date' => now()->addDays(3),
                'approved_by' => $approver->id,
                'approved_at' => now()->subDays(1),
            ],
            [
                'user_id' => $member2->id,
                'title' => 'Product Demo Preparation',
                'description' => 'Prepare materials and demo environment for product showcase to potential clients.',
                'status' => 'draft',
                'priority' => 'medium',
                'due_date' => now()->addDays(15),
            ],
            [
                'user_id' => $member1->id,
                'title' => 'API Documentation Update',
                'description' => 'Update API documentation with latest endpoints and examples. Include authentication flows.',
                'status' => 'rejected',
                'priority' => 'low',
                'due_date' => now()->subDays(5),
                'approved_by' => $approver->id,
                'approved_at' => now()->subDays(3),
                'rejection_reason' => 'Missing authentication section. Please add OAuth2 flow documentation.',
            ],
        ];

        foreach ($tasks as $taskData) {
            $task = Task::create($taskData);
            
            // Add some assignees
            if ($task->user_id === $member1->id) {
                $task->assignees()->attach([$member2->id]);
            } else {
                $task->assignees()->attach([$member1->id]);
            }
            
            // Log creation activity
            $task->logActivity('created', $task->user_id);
            
            // Add more activities based on status
            if ($task->status === 'pending') {
                $task->logActivity('submitted', $task->user_id);
            } elseif ($task->status === 'approved') {
                $task->logActivity('submitted', $task->user_id);
                $task->logActivity('approved', $approver->id);
            } elseif ($task->status === 'rejected') {
                $task->logActivity('submitted', $task->user_id);
                $task->logActivity('rejected', $approver->id, $task->rejection_reason);
            }
        }

        $this->command->info('Created ' . count($tasks) . ' sample tasks with activities.');
    }
}
