'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownUp, Check, ChevronDown } from 'lucide-react';
import { SortOption } from '@/types/material';

export interface SortItem {
  id: SortOption;
  label: string;
  description: string;
}

export const SORT_OPTIONS: SortItem[] = [
  {
    id: 'relevance',
    label: 'Most Relevant',
    description: 'Matches, verification status, and data completeness',
  },
  {
    id: 'recent',
    label: 'Recently Listed',
    description: 'Newest lots and updated batches first',
  },
  {
    id: 'quantity_desc',
    label: 'Quantity: High to Low',
    description: 'Largest bulk tonnage and recurring lots',
  },
  {
    id: 'quantity_asc',
    label: 'Quantity: Low to High',
    description: 'Smallest trial batches and spot lots',
  },
  {
    id: 'distance',
    label: 'Distance: Nearest First',
    description: 'Proximity to active facility hub (Pune region)',
  },
  {
    id: 'price_asc',
    label: 'Price: Low to High',
    description: 'Lowest verified fixed prices first',
  },
  {
    id: 'price_desc',
    label: 'Price: High to Low',
    description: 'Highest verified fixed prices first',
  },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption = SORT_OPTIONS.find((opt) => opt.id === value) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <ArrowDownUp className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-slate-500 font-normal">Sort:</span>
          <span className="text-slate-900 font-medium">{activeOption.label}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 z-30 mt-1.5 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Sort marketplace listings
          </div>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((option) => {
              const isSelected = option.id === value;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 font-normal'
                  }`}
                >
                  <div className="pr-2">
                    <div className="leading-snug">{option.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5 font-normal">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
