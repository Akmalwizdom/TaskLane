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
        // Get or create users with simplified roles (admin + member only)
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        $member1 = User::firstOrCreate(
            ['email' => 'john@gmail.com'],
            [
                'name' => 'John Doe',
                'password' => bcrypt('password'),
                'role' => 'member',
            ]
        );

        $member2 = User::firstOrCreate(
            ['email' => 'jane@gmail.com'],
            [
                'name' => 'Jane Smith',
                'password' => bcrypt('password'),
                'role' => 'member',
            ]
        );

        // =========================================
        // HYBRID WORKFLOW SAMPLE TASKS
        // =========================================

        // 1. Admin-created task assigned to member (assigned status)
        $task1 = Task::create([
            'user_id' => $admin->id,
            'title' => 'Landing Page Redesign',
            'description' => "Complete overhaul of the company landing page with new branding guidelines.\n\nRequirements:\n- Update hero section with new messaging\n- Implement new color scheme\n- Add interactive elements and animations\n- Ensure mobile responsiveness",
            'status' => 'assigned',
            'priority' => 'high',
            'due_date' => now()->addDays(5),
        ]);
        $task1->assignees()->attach([$member1->id]);
        $task1->logActivity('created', $admin->id);
        $task1->logActivity('assigned', $admin->id);

        // 2. Admin-created task, member working on it (in-progress)
        $task2 = Task::create([
            'user_id' => $admin->id,
            'title' => 'API Documentation Update',
            'description' => 'Update API documentation with latest endpoints and examples. Include authentication flows and error handling.',
            'status' => 'in-progress',
            'priority' => 'medium',
            'due_date' => now()->addDays(7),
        ]);
        $task2->assignees()->attach([$member2->id]);
        $task2->logActivity('created', $admin->id);
        $task2->logActivity('assigned', $admin->id);
        $task2->logActivity('started', $member2->id);

        // 3. Member-created task (draft, self-initiative)
        $task3 = Task::create([
            'user_id' => $member1->id,
            'title' => 'Performance Optimization Ideas',
            'description' => 'Document ideas for improving application performance based on recent user feedback.',
            'status' => 'draft',
            'priority' => 'low',
            'due_date' => now()->addDays(14),
        ]);
        $task3->logActivity('created', $member1->id);

        // 4. Task submitted for review (pending)
        $task4 = Task::create([
            'user_id' => $admin->id,
            'title' => 'Q1 Marketing Strategy',
            'description' => 'Develop comprehensive marketing plan for the first quarter including social media campaigns, email marketing, and content strategy.',
            'status' => 'pending',
            'priority' => 'high',
            'due_date' => now()->addDays(3),
        ]);
        $task4->assignees()->attach([$member1->id]);
        $task4->logActivity('created', $admin->id);
        $task4->logActivity('assigned', $admin->id);
        $task4->logActivity('started', $member1->id);
        $task4->logActivity('submitted', $member1->id);

        // 5. Approved task
        $task5 = Task::create([
            'user_id' => $admin->id,
            'title' => 'Mobile App Beta Testing',
            'description' => 'Coordinate beta testing phase for the mobile application. Document bugs and user feedback.',
            'status' => 'approved',
            'priority' => 'high',
            'due_date' => now()->subDays(2),
            'approved_by' => $admin->id,
            'approved_at' => now()->subDays(1),
        ]);
        $task5->assignees()->attach([$member1->id]);
        $task5->logActivity('created', $admin->id);
        $task5->logActivity('assigned', $admin->id);
        $task5->logActivity('submitted', $member1->id);
        $task5->logActivity('approved', $admin->id);

        // 6. Rejected task (needs revision)
        $task6 = Task::create([
            'user_id' => $admin->id,
            'title' => 'Customer Feedback Analysis',
            'description' => 'Compile and analyze customer feedback from the past month. Create actionable insights report.',
            'status' => 'rejected',
            'priority' => 'medium',
            'due_date' => now()->addDays(5),
            'approved_by' => $admin->id,
            'approved_at' => now()->subHours(6),
            'rejection_reason' => 'Missing data visualization. Please add charts and graphs to support the analysis.',
        ]);
        $task6->assignees()->attach([$member2->id]);
        $task6->logActivity('created', $admin->id);
        $task6->logActivity('assigned', $admin->id);
        $task6->logActivity('submitted', $member2->id);
        $task6->logActivity('rejected', $admin->id, 'Missing data visualization. Please add charts and graphs to support the analysis.');

        $this->command->info('Created 6 sample tasks demonstrating hybrid workflow:');
        $this->command->info('  - 1 assigned (waiting for member to start)');
        $this->command->info('  - 1 in-progress (member working)');
        $this->command->info('  - 1 draft (member self-initiative)');
        $this->command->info('  - 1 pending (waiting for admin review)');
        $this->command->info('  - 1 approved');
        $this->command->info('  - 1 rejected (needs revision)');
        $this->command->info('Users: 1 admin + 2 members');
    }
}
