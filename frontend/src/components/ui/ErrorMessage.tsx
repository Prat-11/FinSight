import React from 'react';
import { clsx } from 'clsx';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'An unexpected error occurred while processing data.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={clsx(
        'p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 flex items-start gap-3 shadow-lg',
        className
      )}
    >
      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h5 className="text-sm font-semibold text-rose-200">Unable to load data</h5>
        <p className="text-xs text-rose-300/80 mt-0.5">{message}</p>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="mt-3 text-xs text-rose-200 hover:text-white hover:bg-rose-900/40 border border-rose-500/30"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Request
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
