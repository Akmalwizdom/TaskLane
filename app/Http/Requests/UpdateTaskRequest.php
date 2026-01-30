<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['sometimes', 'required', 'in:low,medium,high'],
            'status' => ['sometimes', Rule::in(['draft', 'pending', 'in-progress', 'completed'])],
            'due_date' => ['nullable', 'date'],
            'assignee_ids' => ['nullable', 'array'],
            'assignee_ids.*' => ['exists:users,id'],
            'action' => ['nullable', 'in:draft,submit'],
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
            'status.in' => 'Invalid status value.',
            'assignee_ids.*.exists' => 'One or more selected team members do not exist.',
        ];
    }
}
