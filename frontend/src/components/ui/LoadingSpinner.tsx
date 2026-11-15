import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center p-6 gap-3', className)}>
      <Loader2 className={clsx('animate-spin text-blue-500', sizeMap[size])} />
      {message && <p className="text-xs text-gray-400 font-medium tracking-wide animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
