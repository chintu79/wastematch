'use client';

import React, { useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Scale,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { FilterState, MaterialCategoryCode, MaterialListing } from '@/types/material';
import {
  MATERIAL_CATEGORIES,
  CATEGORY_CONTEXTUAL_FILTERS,
  POPULAR_LOCATIONS,
} from '@/lib/materialData';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  listings: MaterialListing[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
  listings,
  isMobileOpen = false,
  onCloseMobile,
  className = '',
}) => {
  // Advanced technical filters are collapsed by default per acceptance criteria
  const [isTechnicalExpanded, setIsTechnicalExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);
  const [isQuantityExpanded, setIsQuantityExpanded] = useState(true);
  const [isPricingExpanded, setIsPricingExpanded] = useState(true);
  const [isComplianceExpanded, setIsComplianceExpanded] = useState(true);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const map: Record<string, number> = { ALL: listings.length };
    listings.forEach((item) => {
      map[item.category_code] = (map[item.category_code] || 0) + 1;
    });
    return map;
  }, [listings]);

  // Count active technical filters
  const activeTechFilterCount = Object.values(filters.technicalFilters).filter(
    (v) => v && v !== 'ALL'
  ).length;

  const handleCategoryChange = (categoryCode: string) => {
    // When changing category, reset technical filters so stale category filters are never applied
    onChange({
      category: categoryCode,
      technicalFilters: {},
    });
  };

  const handleTechnicalFilterChange = (filterId: string, val: string) => {
    onChange({
      technicalFilters: {
        ...filters.technicalFilters,
        [filterId]: val,
      },
    });
  };

  const content = (
    <div className="space-y-6 text-xs text-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-emerald-700 shrink-0" />
          <span className="text-sm font-bold text-slate-900">Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* 1. Category Filter */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-slate-500" />
            Material Category
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {filters.category === 'ALL' ? 'All' : '1 selected'}
          </span>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() => handleCategoryChange('ALL')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left font-medium ${
              filters.category === 'ALL'
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>All Categories</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-200/70 text-slate-600 font-semibold">
              {categoryCounts['ALL'] || 0}
            </span>
          </button>

          {MATERIAL_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.code] || 0;
            const isSelected = filters.category === cat.code;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() => handleCategoryChange(cat.code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left font-medium ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate pr-2">{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full shrink-0 font-semibold ${
                    isSelected
                      ? 'bg-emerald-200/80 text-emerald-950'
                      : 'bg-slate-200/60 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Contextual Technical Properties (Category Specific - Collapsed by default) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2.5">
        <button
          type="button"
          onClick={() => setIsTechnicalExpanded(!isTechnicalExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900 hover:text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Category Technical Filters</span>
            {activeTechFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-emerald-600 text-white px-1.5 py-0.2 text-[10px] font-bold">
                {activeTechFilterCount}
              </span>
            )}
          </div>
          {isTechnicalExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {isTechnicalExpanded && (
          <div className="pt-2 border-t border-slate-200/70 space-y-3">
            {filters.category === 'ALL' ? (
              <div className="text-[11px] text-slate-500 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80">
                <p className="font-semibold text-slate-700 mb-0.5">Contextual filters</p>
                Select a specific material category above (e.g. Plastics, Metals, Minerals) to unlock precise technical filters like Polymer grade, MFI, Assay purity, or Moisture content.
              </div>
            ) : (
              <>
                <p className="text-[11px] text-slate-500 font-medium">
                  Showing filters contextual to{' '}
                  <span className="font-bold text-slate-800">
                    {MATERIAL_CATEGORIES.find((c) => c.code === filters.category)?.label}
                  </span>
                </p>

                {(CATEGORY_CONTEXTUAL_FILTERS[filters.category as MaterialCategoryCode] || []).map(
                  (techFilter) => {
                    const currentVal = filters.technicalFilters[techFilter.id] || 'ALL';
                    return (
                      <div key={techFilter.id} className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700 block">
                          {techFilter.name}
                        </label>
                        <select
                          value={currentVal}
                          onChange={(e) =>
                            handleTechnicalFilterChange(techFilter.id, e.target.value)
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          {techFilter.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Location & Radius */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setIsLocationExpanded(!isLocationExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900"
        >
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            Location & Radius
          </span>
          {isLocationExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {isLocationExpanded && (
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Industrial Hub / Zone
              </label>
              <select
                value={filters.location}
                onChange={(e) => onChange({ location: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {POPULAR_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1.5">
                Maximum Distance
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: 'Any', value: null },
                  { label: '25 km', value: 25 },
                  { label: '50 km', value: 50 },
                  { label: '100 km', value: 100 },
                ].map((rad) => {
                  const isSelected = filters.maxDistanceKm === rad.value;
                  return (
                    <button
                      key={rad.label}
                      type="button"
                      onClick={() => onChange({ maxDistanceKm: rad.value })}
                      className={`rounded-md py-1 px-1.5 text-[11px] font-medium transition-colors text-center ${
                        isSelected
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {rad.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Available Quantity */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setIsQuantityExpanded(!isQuantityExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900"
        >
          <span className="flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-slate-500" />
            Quantity & Supply Cadence
          </span>
          {isQuantityExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {isQuantityExpanded && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Quantity Presets
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Any', min: null, max: null },
                  { label: '< 20 MT', min: null, max: 20 },
                  { label: '20-100 MT', min: 20, max: 100 },
                  { label: '> 100 MT', min: 100, max: null },
                ].map((tier) => {
                  const isSelected =
                    filters.minQuantity === tier.min && filters.maxQuantity === tier.max;
                  return (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => onChange({ minQuantity: tier.min, maxQuantity: tier.max })}
                      className={`rounded-md py-1 px-1.5 text-[11px] font-medium transition-colors text-center ${
                        isSelected
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tier.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-500">Min Quantity (MT)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minQuantity ?? ''}
                  onChange={(e) =>
                    onChange({
                      minQuantity: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-500">Max Quantity (MT)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  value={filters.maxQuantity ?? ''}
                  onChange={(e) =>
                    onChange({
                      maxQuantity: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">
                Supply Cadence
              </label>
              <select
                value={filters.availabilityType}
                onChange={(e) =>
                  onChange({
                    availabilityType: e.target.value as FilterState['availabilityType'],
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">All Supply Types</option>
                <option value="recurring_monthly">Monthly Recurring Stream</option>
                <option value="recurring_weekly">Weekly Recurring Stream</option>
                <option value="one_time_lot">One-Time Spot Lot</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 5. Pricing & Commercial Structure */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setIsPricingExpanded(!isPricingExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900"
        >
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-slate-500" />
            Pricing & Commercial
          </span>
          {isPricingExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {isPricingExpanded && (
          <div className="space-y-1.5">
            {[
              { id: 'ALL', label: 'All Pricing Formats' },
              { id: 'fixed_price', label: 'Fixed Price Published Only' },
              { id: 'quote_only', label: 'Request Quote / Negotiable Only' },
            ].map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 cursor-pointer py-1 px-1 rounded-md hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="pricingModel"
                  value={p.id}
                  checked={filters.pricingModel === p.id}
                  onChange={() =>
                    onChange({ pricingModel: p.id as FilterState['pricingModel'] })
                  }
                  className="h-3.5 w-3.5 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs text-slate-700">{p.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 6. Verification & Statutory Compliance */}
      <div className="space-y-2.5 pt-2 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setIsComplianceExpanded(!isComplianceExpanded)}
          className="w-full flex items-center justify-between text-left font-bold text-slate-900"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            Evidence & Compliance
          </span>
          {isComplianceExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </button>

        {isComplianceExpanded && (
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 cursor-pointer py-1 px-1 rounded-md hover:bg-slate-50">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => onChange({ verifiedOnly: e.target.checked })}
                className="h-4 w-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  NABL Lab Certified
                </span>
                <span className="text-[10px] text-slate-500 leading-tight block">
                  Includes accredited certificate or lab test report attached
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2 cursor-pointer py-1 px-1 rounded-md hover:bg-slate-50">
              <input
                type="checkbox"
                checked={filters.regulatoryEligibleOnly}
                onChange={(e) => onChange({ regulatoryEligibleOnly: e.target.checked })}
                className="h-4 w-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="font-semibold text-slate-800 block text-xs">
                  CPCB / MPCB Eligible
                </span>
                <span className="text-[10px] text-slate-500 leading-tight block">
                  Cleared for industrial byproduct reuse & secondary exchange
                </span>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block w-72 shrink-0 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto ${className}`}
      >
        {content}
      </aside>

      {/* Mobile Slide-Over Panel */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in-50"
            onClick={onCloseMobile}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">Search & Filter</h3>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">{content}</div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-2/3 py-2.5 px-3 rounded-xl bg-emerald-700 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
