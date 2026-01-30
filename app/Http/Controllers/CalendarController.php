<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    /**
     * Display the calendar view.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $month = request('month', now()->month);
        $year = request('year', now()->year);
        
        // Get task counts per day for the month
        $startOfMonth = Carbon::create($year, $month, 1)->startOfMonth();
        $endOfMonth = Carbon::create($year, $month, 1)->endOfMonth();
        
        $tasksByDate = Task::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('assignees', fn ($q) => $q->where('user_id', $user->id));
            })
            ->whereNotNull('due_date')
            ->whereBetween('due_date', [$startOfMonth, $endOfMonth])
            ->selectRaw('due_date, COUNT(*) as count')
            ->groupBy('due_date')
            ->pluck('count', 'due_date')
            ->mapWithKeys(fn ($count, $date) => [
                Carbon::parse($date)->format('Y-m-d') => $count
            ]);

        return Inertia::render('calendar/index', [
            'tasksByDate' => $tasksByDate,
            'currentMonth' => $month,
            'currentYear' => $year,
        ]);
    }

    /**
     * Get tasks for a specific date.
     */
    public function day(): JsonResponse
    {
        $user = Auth::user();
        $date = request('date');
        
        if (!$date) {
            return response()->json(['tasks' => []]);
        }
        
        $tasks = Task::where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('assignees', fn ($q) => $q->where('user_id', $user->id));
            })
            ->onDate($date)
            ->with('assignees')
            ->get()
            ->map(fn ($task) => [
                'id' => (string) $task->id,
                'title' => $task->title,
                'status' => $task->status,
                'priority' => $task->priority,
                'assignees' => $task->assignees->map(fn ($u) => [
                    'name' => $u->name,
                    'initials' => $this->getInitials($u->name),
                ])->take(3),
                'href' => route('tasks.show', $task),
            ]);

        return response()->json(['tasks' => $tasks]);
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
