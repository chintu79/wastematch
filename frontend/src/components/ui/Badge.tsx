import React from 'react';

export type BadgeVariant =
  | 'eligible'
  | 'on_hold'
  | 'ineligible'
  | 'draft'
  | 'published'
  | 'pending'
  | 'verified'
  | 'info'
  | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    eligible: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    on_hold: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    ineligible: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    published: 'bg-teal-50 text-teal-800 border border-teal-200/80',
    pending: 'bg-blue-50 text-blue-800 border border-blue-200/80',
    verified: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    info: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const dotColors: Record<BadgeVariant, string> = {
    eligible: 'bg-emerald-500',
    on_hold: 'bg-amber-500',
    ineligible: 'bg-rose-500',
    draft: 'bg-slate-400',
    published: 'bg-teal-500',
    pending: 'bg-blue-500',
    verified: 'bg-emerald-600',
    info: 'bg-indigo-500',
    neutral: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      <span>{children}</span>
    </span>
  );
};
