'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterState, MaterialCategoryCode } from '@/types/material';
import { MATERIAL_CATEGORIES, CATEGORY_CONTEXTUAL_FILTERS } from '@/lib/materialData';

interface AppliedFiltersProps {
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState | string, subKey?: string) => void;
  onClearAll: () => void;
  className?: string;
}

interface FilterChip {
  id: string;
  label: string;
  value: string;
  removeAction: () => void;
}

export const AppliedFilters: React.FC<AppliedFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  className = '',
}) => {
  const chips: FilterChip[] = [];

  // Search query chip
  if (filters.query.trim()) {
    chips.push({
      id: 'query',
      label: 'Search',
      value: `"${filters.query.trim()}"`,
      removeAction: () => onRemoveFilter('query'),
    });
  }

  // Category chip
  if (filters.category !== 'ALL') {
    const cat = MATERIAL_CATEGORIES.find((c) => c.code === filters.category);
    chips.push({
      id: 'category',
      label: 'Category',
      value: cat ? cat.label : filters.category,
      removeAction: () => onRemoveFilter('category'),
    });
  }

  // Location chip
  if (filters.location && filters.location !== 'All Locations') {
    chips.push({
      id: 'location',
      label: 'Location',
      value: filters.location,
      removeAction: () => onRemoveFilter('location'),
    });
  }

  // Distance radius chip
  if (filters.maxDistanceKm !== null) {
    chips.push({
      id: 'maxDistanceKm',
      label: 'Radius',
      value: `Within ${filters.maxDistanceKm} km`,
      removeAction: () => onRemoveFilter('maxDistanceKm'),
    });
  }

  // Quantity range chip
  if (filters.minQuantity !== null || filters.maxQuantity !== null) {
    let qVal = '';
    if (filters.minQuantity !== null && filters.maxQuantity !== null) {
      qVal = `${filters.minQuantity} - ${filters.maxQuantity} MT`;
    } else if (filters.minQuantity !== null) {
      qVal = `≥ ${filters.minQuantity} MT`;
    } else if (filters.maxQuantity !== null) {
      qVal = `≤ ${filters.maxQuantity} MT`;
    }
    chips.push({
      id: 'quantity',
      label: 'Volume',
      value: qVal,
      removeAction: () => {
        onRemoveFilter('minQuantity');
        onRemoveFilter('maxQuantity');
      },
    });
  }

  // Availability type chip
  if (filters.availabilityType !== 'ALL') {
    const labels: Record<string, string> = {
      recurring_monthly: 'Monthly Recurring',
      recurring_weekly: 'Weekly Recurring',
      one_time_lot: 'Spot Lot',
    };
    chips.push({
      id: 'availabilityType',
      label: 'Cadence',
      value: labels[filters.availabilityType] || filters.availabilityType,
      removeAction: () => onRemoveFilter('availabilityType'),
    });
  }

  // Pricing model chip
  if (filters.pricingModel !== 'ALL') {
    chips.push({
      id: 'pricingModel',
      label: 'Pricing',
      value: filters.pricingModel === 'fixed_price' ? 'Fixed Price Only' : 'Request Quote',
      removeAction: () => onRemoveFilter('pricingModel'),
    });
  }

  // Quality verification chip
  if (filters.verifiedOnly) {
    chips.push({
      id: 'verifiedOnly',
      label: 'Evidence',
      value: 'NABL Lab Certified',
      removeAction: () => onRemoveFilter('verifiedOnly'),
    });
  }

  // Regulatory eligibility chip
  if (filters.regulatoryEligibleOnly) {
    chips.push({
      id: 'regulatoryEligibleOnly',
      label: 'Compliance',
      value: 'CPCB / MPCB Eligible',
      removeAction: () => onRemoveFilter('regulatoryEligibleOnly'),
    });
  }

  // Contextual technical filter chips
  if (filters.category !== 'ALL') {
    const contextualDefs = CATEGORY_CONTEXTUAL_FILTERS[filters.category as MaterialCategoryCode] || [];
    Object.entries(filters.technicalFilters).forEach(([key, val]) => {
      if (val && val !== 'ALL') {
        const filterDef = contextualDefs.find((f) => f.id === key);
        const opt = filterDef?.options.find((o) => o.value === val);
        const valLabel = opt ? opt.label : val;
        chips.push({
          id: `tech-${key}`,
          label: filterDef ? filterDef.name : key,
          value: valLabel,
          removeAction: () => onRemoveFilter('technicalFilters', key),
        });
      }
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-1 pb-2 ${className}`}>
      <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
        Applied filters ({chips.length}):
      </span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-900 transition-all hover:bg-emerald-100/90"
        >
          <span className="text-emerald-700/80 font-normal">{chip.label}:</span>
          <span className="font-semibold">{chip.value}</span>
          <button
            type="button"
            onClick={chip.removeAction}
            aria-label={`Remove filter ${chip.label}: ${chip.value}`}
            className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-200 hover:text-emerald-950 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors ml-1"
      >
        <RotateCcw className="h-3 w-3" />
        <span>Clear all</span>
      </button>
    </div>
  );
};
