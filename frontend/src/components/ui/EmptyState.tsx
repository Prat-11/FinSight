import React from 'react';
import { clsx } from 'clsx';
import { Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-gray-800 bg-[#0f172a]/40',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-gray-400 mb-3 shadow-inner">
        {icon || <Inbox className="w-6 h-6 text-gray-400" />}
      </div>
      <h4 className="text-base font-semibold text-gray-200 mb-1">{title}</h4>
      {description && <p className="text-xs text-gray-400 max-w-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
