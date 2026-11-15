import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  hoverEffect?: boolean;
  headerBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  hoverEffect = false,
  headerBorder = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-panel rounded-xl overflow-hidden border border-gray-800 bg-[#111827]/80 backdrop-blur-md shadow-xl transition-all duration-200',
          hoverEffect && 'glass-panel-hover hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-950/20',
          className
        )
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          className={clsx(
            'px-5 py-4 flex items-center justify-between gap-4',
            headerBorder && 'border-b border-gray-800/80'
          )}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Card;
