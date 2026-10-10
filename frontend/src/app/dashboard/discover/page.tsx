'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  RotateCcw,
  Truck,
  Building2,
  Package,
} from 'lucide-react';
import { FilterPanel } from '@/components/search/FilterPanel';
import { AppliedFilters } from '@/components/search/AppliedFilters';
import { SortDropdown } from '@/components/search/SortDropdown';
import {
  FilterState,
  SortOption,
  MaterialListing,
  MaterialCategoryCode,
} from '@/types/material';
import {
  getStoredListings,
  MATERIAL_CATEGORIES,
  matchesSearchQuery,
} from '@/lib/materialData';

const DEFAULT_FILTERS: FilterState = {
  query: '',
  category: 'ALL',
  location: 'All Locations',
  maxDistanceKm: null,
  minQuantity: null,
  maxQuantity: null,
  availabilityType: 'ALL',
  pricingModel: 'ALL',
  verifiedOnly: false,
  regulatoryEligibleOnly: false,
  technicalFilters: {},
};

const SUGGESTED_QUERIES = [
  'Clean PET Bottles',
  'Foundry Sand',
  'Copper Slag',
  'PP Regrind Flakes',
  'Spent Hydrochloric Acid',
  'Aluminium Dross',
  'Fly Ash',
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const [allListings] = useState<MaterialListing[]>(getStoredListings);
  const [filters, setFilters] = useState<FilterState>(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('category') || 'ALL';
    return {
      ...DEFAULT_FILTERS,
      query: q,
      category: cat,
    };
  });

  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync with searchParams if navigated with new URL
  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    if (qParam !== null || catParam !== null) {
      setFilters((prev) => ({
        ...prev,
        query: qParam ?? prev.query,
        category: catParam ?? prev.category,
      }));
    }
  }, [searchParams]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleRemoveFilter = (key: keyof FilterState | string, subKey?: string) => {
    setFilters((prev) => {
      if (key === 'technicalFilters' && subKey) {
        const nextTech = { ...prev.technicalFilters };
        delete nextTech[subKey];
        return { ...prev, technicalFilters: nextTech };
      }
      if (key === 'query') return { ...prev, query: '' };
      if (key === 'category') return { ...prev, category: 'ALL', technicalFilters: {} };
      if (key === 'location') return { ...prev, location: 'All Locations' };
      if (key === 'maxDistanceKm') return { ...prev, maxDistanceKm: null };
      if (key === 'minQuantity') return { ...prev, minQuantity: null };
      if (key === 'maxQuantity') return { ...prev, maxQuantity: null };
      if (key === 'availabilityType') return { ...prev, availabilityType: 'ALL' };
      if (key === 'pricingModel') return { ...prev, pricingModel: 'ALL' };
      if (key === 'verifiedOnly') return { ...prev, verifiedOnly: false };
      if (key === 'regulatoryEligibleOnly') return { ...prev, regulatoryEligibleOnly: false };
      return prev;
    });
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    const filtered = allListings.filter((item) => {
      // 1. Text & Synonym search
      if (filters.query && !matchesSearchQuery(item, filters.query)) {
        return false;
      }

      // 2. Category
      if (filters.category !== 'ALL' && item.category_code !== filters.category) {
        return false;
      }

      // 3. Location
      if (
        filters.location &&
        filters.location !== 'All Locations' &&
        !item.facility_zone.toLowerCase().includes(filters.location.toLowerCase().split(',')[0])
      ) {
        return false;
      }

      // 4. Distance Radius
      if (filters.maxDistanceKm !== null) {
        if (item.distance_km === undefined || item.distance_km > filters.maxDistanceKm) {
          return false;
        }
      }

      // 5. Quantity range
      if (filters.minQuantity !== null && item.total_volume < filters.minQuantity) {
        return false;
      }
      if (filters.maxQuantity !== null && item.total_volume > filters.maxQuantity) {
        return false;
      }

      // 6. Availability Cadence
      if (
        filters.availabilityType !== 'ALL' &&
        item.availability_type !== filters.availabilityType
      ) {
        return false;
      }

      // 7. Pricing model
      if (filters.pricingModel === 'fixed_price' && !item.price_per_unit) {
        return false;
      }
      if (filters.pricingModel === 'quote_only' && item.price_per_unit) {
        return false;
      }

      // 8. Quality verification
      if (filters.verifiedOnly) {
        const hasVerifiedBatch = item.batches.some(
          (b) =>
            b.measurements.some((m) => m.nabl_accredited || m.is_verified) ||
            b.documents.some((d) => d.is_verified)
        );
        if (!hasVerifiedBatch) return false;
      }

      // 9. Regulatory compliance
      if (filters.regulatoryEligibleOnly && item.regulatory_status !== 'eligible') {
        return false;
      }

      // 10. Contextual Category Technical Filters
      if (filters.category !== 'ALL') {
        for (const [key, val] of Object.entries(filters.technicalFilters)) {
          if (!val || val === 'ALL') continue;

          // Technical matching helper
          const combinedText = [
            item.title,
            item.grade,
            item.description,
            ...(item.tags || []),
          ]
            .join(' ')
            .toLowerCase();

          // Match specific keys
          if (key === 'polymer_type') {
            if (!combinedText.includes(val.toLowerCase())) return false;
          } else if (key === 'mfi_tier') {
            const mfiMeasure = item.batches
              .flatMap((b) => b.measurements)
              .find((m) => m.property_name.toLowerCase().includes('melt flow'));
            if (mfiMeasure) {
              const valNum = Number(mfiMeasure.value);
              if (val === 'LOW' && valNum >= 5) return false;
              if (val === 'MEDIUM' && (valNum < 5 || valNum > 15)) return false;
              if (val === 'HIGH' && valNum <= 15) return false;
            }
          } else if (key === 'base_metal') {
            if (!combinedText.includes(val.toLowerCase())) return false;
          } else if (key === 'mineral_type') {
            if (val === 'SILICA_SAND' && !combinedText.includes('sand')) return false;
            if (val === 'FLY_ASH' && !combinedText.includes('fly ash')) return false;
          } else if (key === 'purity_tier') {
            if (val === 'HIGH_95') {
              const sio2 = item.batches
                .flatMap((b) => b.measurements)
                .find((m) => m.property_name.toLowerCase().includes('sio2'));
              if (sio2 && Number(sio2.value) < 95) return false;
            }
          } else {
            // General fallback tag match
            if (!combinedText.includes(val.toLowerCase())) return false;
          }
        }
      }

      return true;
    });

    // Realistic Sorting (no invented data)
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent': {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        case 'quantity_desc': {
          return b.total_volume - a.total_volume;
        }
        case 'quantity_asc': {
          return a.total_volume - b.total_volume;
        }
        case 'distance': {
          const distA = a.distance_km ?? 9999;
          const distB = b.distance_km ?? 9999;
          return distA - distB;
        }
        case 'price_asc': {
          // Items with published prices sorted low to high; unpriced/quotes remain at end
          const pA = a.price_per_unit ?? 99999999;
          const pB = b.price_per_unit ?? 99999999;
          return pA - pB;
        }
        case 'price_desc': {
          const pA = a.price_per_unit ?? -1;
          const pB = b.price_per_unit ?? -1;
          return pB - pA;
        }
        case 'relevance':
        default: {
          // Text match priority + verified lots bonus + candidates count
          let scoreA = a.candidate_buyers_count;
          let scoreB = b.candidate_buyers_count;

          if (a.regulatory_status === 'eligible') scoreA += 5;
          if (b.regulatory_status === 'eligible') scoreB += 5;

          if (a.batches.some((batch) => batch.measurements.some((m) => m.nabl_accredited))) {
            scoreA += 4;
          }
          if (b.batches.some((batch) => batch.measurements.some((m) => m.nabl_accredited))) {
            scoreB += 4;
          }

          if (filters.query) {
            const qLower = filters.query.toLowerCase();
            if (a.title.toLowerCase().includes(qLower)) scoreA += 10;
            if (b.title.toLowerCase().includes(qLower)) scoreB += 10;
          }

          return scoreB - scoreA;
        }
      }
    });
  }, [allListings, filters, sortBy]);

  // Total active filter count for mobile badge
  const totalActiveFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query.trim()) count++;
    if (filters.category !== 'ALL') count++;
    if (filters.location !== 'All Locations') count++;
    if (filters.maxDistanceKm !== null) count++;
    if (filters.minQuantity !== null || filters.maxQuantity !== null) count++;
    if (filters.availabilityType !== 'ALL') count++;
    if (filters.pricingModel !== 'ALL') count++;
    if (filters.verifiedOnly) count++;
    if (filters.regulatoryEligibleOnly) count++;
    count += Object.values(filters.technicalFilters).filter((v) => v && v !== 'ALL').length;
    return count;
  }, [filters]);

  const getCategoryBadgeClass = (code: MaterialCategoryCode) => {
    switch (code) {
      case 'PLASTIC':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'METAL':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'INDUSTRIAL_MINERAL':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'CHEMICAL':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'SLUDGE':
        return 'bg-stone-50 text-stone-800 border-stone-200';
      case 'ORGANIC':
        return 'bg-lime-50 text-lime-800 border-lime-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Quick Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-2xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Marketplace Discovery
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Secondary Raw Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified industrial waste streams, compare technical lab assays, and connect with compliant generators.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="mt-5 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange({ query: e.target.value })}
              placeholder="Search by material name, category, location, or synonym (e.g., PET, Copper Slag, Silica, Regrind)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-11 pr-24 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => handleFilterChange({ query: '' })}
                className="absolute right-3 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-200/60 px-2 py-1 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Synonym / Search Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-0.5 text-xs text-slate-500 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Popular:</span>
            {SUGGESTED_QUERIES.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => handleFilterChange({ query: sq })}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Search Workspace: Sidebar + Results Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Filter Sidebar (Desktop & Mobile Panel) */}
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          listings={allListings}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Results Area */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Controls Bar: Results Count, Mobile Filter Trigger, View Toggle, Sort Dropdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-700" />
                <span>Filters</span>
                {totalActiveFilterCount > 0 && (
                  <span className="rounded-full bg-emerald-700 text-white px-1.5 py-0.2 text-[10px] font-extrabold">
                    {totalActiveFilterCount}
                  </span>
                )}
              </button>

              <div className="text-xs text-slate-600">
                Showing{' '}
                <span className="font-bold text-slate-900">
                  {filteredAndSortedListings.length}
                </span>{' '}
                of {allListings.length} materials
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Grid / List View Toggle */}
              <div className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Applied Filter Chips Bar */}
          <AppliedFilters
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleResetFilters}
          />

          {/* Listings List / Grid */}
          {filteredAndSortedListings.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">
                  No materials match your current criteria
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  We could not find any active listings matching your exact combination of keywords, filters, or technical limits.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All Filters</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange({ query: '', category: 'ALL' })}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Browse All Categories
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* 3-Column Responsive Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAndSortedListings.map((listing) => {
                const primaryMeasurement = listing.batches[0]?.measurements[0];
                const hasNabl = listing.batches.some((b) =>
                  b.measurements.some((m) => m.nabl_accredited)
                );

                return (
                  <div
                    key={listing.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all group"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                            listing.category_code
                          )}`}
                        >
                          {listing.category_name.split('&')[0].trim()}
                        </span>

                        {hasNabl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>NABL Lab Verified</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Grade */}
                      <Link
                        href={`/dashboard/listings/${listing.id}`}
                        className="block focus:outline-none"
                      >
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                          {listing.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                          {listing.grade}
                        </p>
                      </Link>

                      {/* Location & Generator */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1 truncate pr-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{listing.facility_zone}</span>
                        </div>
                        {listing.distance_km !== undefined && (
                          <span className="shrink-0 text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {listing.distance_km} km
                          </span>
                        )}
                      </div>

                      {/* Generator Org */}
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{listing.organization_name}</span>
                      </div>

                      {/* Key Technical Highlight */}
                      {primaryMeasurement && (
                        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200/80 p-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Key Assay
                          </span>
                          <div className="flex items-center justify-between font-semibold text-slate-800 mt-0.5">
                            <span className="truncate pr-1">
                              {primaryMeasurement.property_name}
                            </span>
                            <span className="text-emerald-800 font-bold shrink-0">
                              {primaryMeasurement.value} {primaryMeasurement.unit}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Pricing & CTA */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Available Vol
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">
                          {listing.total_volume} {listing.unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Price
                        </div>
                        <div className="text-xs font-bold text-emerald-800">
                          {listing.price_display || 'Quote on Request'}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/listings/${listing.id}`}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800 transition-colors inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Streamlined Dense List View */
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs divide-y divide-slate-100">
              {filteredAndSortedListings.map((listing) => {
                const primaryMeasurement = listing.batches[0]?.measurements[0];
                const hasNabl = listing.batches.some((b) =>
                  b.measurements.some((m) => m.nabl_accredited)
                );

                return (
                  <div
                    key={listing.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(
                            listing.category_code
                          )}`}
                        >
                          {listing.category_name}
                        </span>
                        {hasNabl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="h-3 w-3 text-emerald-600" />
                            <span>NABL Lab Certified</span>
                          </span>
                        )}
                        {listing.distance_km !== undefined && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {listing.distance_km} km away
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/dashboard/listings/${listing.id}`}
                        className="block focus:outline-none"
                      >
                        <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-800 transition-colors">
                          {listing.title}
                        </h3>
                      </Link>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                        <span>
                          <strong className="text-slate-700">Grade:</strong> {listing.grade}
                        </span>
                        <span>
                          <strong className="text-slate-700">Zone:</strong> {listing.facility_zone}
                        </span>
                        <span>
                          <strong className="text-slate-700">Generator:</strong>{' '}
                          {listing.organization_name}
                        </span>
                        {primaryMeasurement && (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {primaryMeasurement.property_name}: {primaryMeasurement.value}{' '}
                            {primaryMeasurement.unit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">
                          Available Vol
                        </div>
                        <div className="text-xs font-bold text-slate-900">
                          {listing.total_volume} {listing.unit}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium uppercase">
                          Price
                        </div>
                        <div className="text-xs font-bold text-emerald-800">
                          {listing.price_display || 'Quote on Request'}
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/listings/${listing.id}`}
                        className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800 transition-colors inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
          Loading marketplace discovery...
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
