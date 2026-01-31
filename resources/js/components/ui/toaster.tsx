import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';

interface Toast {
    id: string;
    type: 'success' | 'error';
    message: string;
}

export function Toaster() {
    const { flash } = usePage<SharedData>().props;
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        if (flash.success) {
            addToast('success', flash.success as string);
        }
        if (flash.error) {
            addToast('error', flash.error as string);
        }
    }, [flash]);

    const addToast = (type: 'success' | 'error', message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, message }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
                        toast.type === 'success' 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
                    )}
                >
                    {toast.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-sm font-medium">
                        {toast.message}
                    </div>
                    <button 
                        onClick={() => removeToast(toast.id)}
                        className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
