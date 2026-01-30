<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'due_date' => ['nullable', 'date', 'after:today'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'action' => ['required', 'in:draft,submit'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'A task title is required.',
            'title.max' => 'The task title cannot exceed 255 characters.',
            'priority.in' => 'Priority must be low, medium, or high.',
            'due_date.after' => 'The due date must be in the future.',
            'assignee_ids.*.exists' => 'One or more selected team members do not exist.',
        ];
    }
}
