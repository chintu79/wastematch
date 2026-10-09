import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  actionOnClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 border-dashed bg-slate-50 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4 ring-4 ring-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      
      {actionLabel && actionHref && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button variant="primary" size="sm">{actionLabel}</Button>
          </Link>
        </div>
      )}
      
      {actionLabel && actionOnClick && !actionHref && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={actionOnClick}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
};
