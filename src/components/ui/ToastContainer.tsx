import { useToast } from '../../contexts/ToastContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const COLORS = {
  success: 'bg-surface-container-lowest border-l-4 border-green-600',
  error: 'bg-surface-container-lowest border-l-4 border-error',
  info: 'bg-surface-container-lowest border-l-4 border-secondary',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-20 right-4 z-[70] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id} className={`${COLORS[toast.type]} shadow-lg rounded-lg p-4 flex items-start gap-3 toast-enter`}>
            <Icon size={20} className={toast.type === 'success' ? 'text-green-600' : toast.type === 'error' ? 'text-error' : 'text-secondary'} />
            <p className="font-body-md text-on-surface flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-on-surface-variant hover:text-on-surface">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
