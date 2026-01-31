<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Tasks CRUD
    Route::resource('tasks', TaskController::class);
    
    // Task approval workflow
    Route::post('tasks/{task}/start-work', [TaskController::class, 'startWork'])->name('tasks.startWork');
    Route::post('tasks/{task}/submit', [TaskController::class, 'submit'])->name('tasks.submit');
    Route::post('tasks/{task}/approve', [TaskController::class, 'approve'])->name('tasks.approve');
    Route::post('tasks/{task}/reject', [TaskController::class, 'reject'])->name('tasks.reject');
    
    // Calendar
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('calendar/day', [CalendarController::class, 'day'])->name('calendar.day');
    
    // Team management
    Route::get('settings/team', [TeamController::class, 'index'])->name('team.index');
    Route::patch('settings/team/{user}/role', [TeamController::class, 'updateRole'])->name('team.updateRole');
    Route::post('settings/team/invite', [TeamController::class, 'invite'])->name('team.invite');
    Route::delete('settings/team/{user}', [TeamController::class, 'remove'])->name('team.remove');
});

require __DIR__.'/settings.php';

