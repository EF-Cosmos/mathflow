/**
 * Toast Provider
 *
 * Manages toast notifications state and provides toast API
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { Toast, type ToastProps, type ToastVariant } from '../components/ui/Toast';

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

let toastId = 0;

function generateId(): string {
  return `toast-${++toastId}`;
}

interface ToastData extends Omit<ToastProps, 'onClose'> {
  id: string;
}

interface ToastContextValue {
  toast: (props: Omit<ToastData, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (props: Omit<ToastData, 'id'>) => {
      const id = generateId();
      const newToast: ToastData = {
        id,
        duration: DEFAULT_DURATION,
        ...props,
      };

      setToasts((prev) => [...prev, newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => {
    return toast({ message, title, variant: 'success' });
  }, [toast]);

  const error = useCallback((message: string, title?: string) => {
    return toast({ message, title, variant: 'error', duration: ERROR_DURATION });
  }, [toast]);

  const warning = useCallback((message: string, title?: string) => {
    return toast({ message, title, variant: 'warning' });
  }, [toast]);

  const info = useCallback((message: string, title?: string) => {
    return toast({ message, title, variant: 'info' });
  }, [toast]);

  const confirm = useCallback((message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmId = generateId();
      const cancelId = generateId();

      const handleConfirm = function() {
        resolve(true);
        removeToast(confirmId);
        removeToast(cancelId);
      };

      const handleCancel = function() {
        resolve(false);
        removeToast(confirmId);
        removeToast(cancelId);
      };

      const confirmToast: ToastData = {
        id: confirmId,
        message,
        title,
        variant: 'info',
        duration: 0,
        action: {
          label: '确认',
          onClick: handleConfirm,
        },
      };

      const cancelToast: ToastData = {
        id: cancelId,
        message: '取消',
        variant: 'info',
        duration: 0,
        action: {
          label: '取消',
          onClick: handleCancel,
        },
      };

      setToasts((prev) => [...prev, confirmToast]);

      setTimeout(() => {
        setToasts((prev) => [...prev, cancelToast]);
      }, 50);
    });
  }, [removeToast]);

  const value: ToastContextValue = {
    toast,
    success,
    error,
    warning,
    info,
    confirm,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[2000] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              {...t}
              onClose={() => removeToast(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
