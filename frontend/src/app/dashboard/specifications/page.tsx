'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getStoredSpecifications,
  publishSpecificationById,
  archiveSpecificationById,
  duplicateSpecification,
} from '@/lib/specificationData';
import { MATERIAL_CATEGORIES } from '@/lib/materialData';
import { BuyerSpecification, SpecificationStatus } from '@/types/specification';
import {
  SlidersHorizontal,
  PlusCircle,
  Search,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Copy,
  Archive,
  ArrowRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export default function BuyerSpecificationsPage() {
  const [specifications, setSpecifications] = useState<BuyerSpecification[]>(getStoredSpecifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SpecificationStatus>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const refreshData = () => {
    setSpecifications(getStoredSpecifications());
  };

  const handleQuickPublish = (id: string, title: string) => {
    const updated = publishSpecificationById(id);
    if (updated) {
      refreshData();
      setNotification(`Specification "${title}" published and activated for automated matching.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleArchive = (id: string, title: string) => {
    const updated = archiveSpecificationById(id);
    if (updated) {
      refreshData();
      setNotification(`Specification "${title}" archived.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateSpecification(id);
    if (duplicated) {
      refreshData();
      setNotification(`Created draft duplicate "${duplicated.target_material_name}".`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredSpecs = specifications.filter((spec) => {
    const matchesSearch =
      spec.target_material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.intended_use.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.receiving_facility_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.receiving_facility_zone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || spec.target_category_code === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || spec.specification_status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Aggregated platform stats
  const activeCount = specifications.filter((s) => s.specification_status === 'published').length;
  const totalConstraintsCount = specifications.reduce(
    (acc, curr) => acc + curr.constraints.filter((c) => c.constraint_type === 'HARD_LIMIT').length,
    0
  );
  const totalMatchesCount = specifications.reduce(
    (acc, curr) => acc + (curr.matched_listings_count || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Buyer Specifications & Feedstock Acceptance
            </h1>
            <Badge variant="verified">v1.2 Active</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Define material acceptance limits, preferred chemical tolerances, and automated matching criteria for your receiving plants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/specifications/new">
            <Button variant="primary" size="md">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              <span>Create Specification</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-950 flex items-center justify-between shadow-xs transition-all">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="text-xs font-semibold">{notification}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Specifications
            </span>
            <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{activeCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {specifications.length} total defined across facilities
          </span>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hard Limits Enforced
            </span>
            <ShieldCheck className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalConstraintsCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Mandatory chemical & physical gates
          </span>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Live Matched Streams
            </span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{totalMatchesCount}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Compatible supplier batches in network
          </span>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Receiving Facilities
            </span>
            <Building className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {new Set(specifications.map((s) => s.receiving_facility_id)).size}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Bhosari, Chakan & Talegaon hubs
          </span>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search specifications by material, process, or plant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="ALL">All Material Categories</option>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as unknown)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="published">Active / Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Configured Feedstock Acceptance Specifications</CardTitle>
            <CardDescription>
              Showing {filteredSpecs.length} of {specifications.length} specifications
            </CardDescription>
          </div>
        </CardHeader>

        {filteredSpecs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">No specifications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No buyer specifications matched your filters. Adjust the filters or create a new specification.
            </p>
            <div className="mt-4">
              <Link href="/dashboard/specifications/new">
                <Button variant="primary" size="sm">
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Create First Specification
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Material & Intended Application</th>
                  <th className="px-4 py-3.5">Receiving Facility</th>
                  <th className="px-4 py-3.5">Demand Volume</th>
                  <th className="px-4 py-3.5">Key Constraints</th>
                  <th className="px-4 py-3.5">Live Matches</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSpecs.map((spec) => {
                  const hardLimits = spec.constraints.filter((c) => c.constraint_type === 'HARD_LIMIT');
                  const preferred = spec.constraints.filter((c) => c.constraint_type === 'PREFERRED_RANGE');

                  return (
                    <tr key={spec.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Material Title & Intended Use */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {spec.target_material_name}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            v{spec.specification_version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {spec.intended_use}
                        </p>
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-100">
                          {spec.target_category_name}
                        </span>
                      </td>

                      {/* Facility & Zone */}
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-800">{spec.receiving_facility_name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{spec.receiving_facility_zone}</span>
                        </p>
                      </td>

                      {/* Demand Volume & Frequency */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900">
                          {spec.minimum_quantity}
                          {spec.maximum_quantity ? ` - ${spec.maximum_quantity}` : ''}{' '}
                          {spec.quantity_unit}
                        </span>
                        <p className="text-[11px] text-slate-500 capitalize mt-0.5">
                          {spec.frequency.replace('recurring_', '').replace('_', ' ')} • &lt; {spec.max_distance_km} km
                        </p>
                      </td>

                      {/* Constraints Summary */}
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-800">
                            {hardLimits.length} Hard Limits
                          </span>
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">
                            {preferred.length} Preferred
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {spec.constraints.length} total parameters
                        </p>
                      </td>

                      {/* Live Matches Pill */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          {spec.matched_listings_count || 0} Qualified
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge
                          variant={
                            spec.specification_status === 'published'
                              ? 'published'
                              : spec.specification_status === 'draft'
                              ? 'draft'
                              : 'neutral'
                          }
                        >
                          {spec.specification_status === 'published'
                            ? 'Active Monitoring'
                            : spec.specification_status === 'draft'
                            ? 'Draft Specification'
                            : 'Archived'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link href={`/dashboard/specifications/${spec.id}`}>
                          <Button variant="outline" size="sm">
                            Inspect Criteria
                          </Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(spec.id)}
                          title="Duplicate specification"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        {spec.specification_status === 'draft' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickPublish(spec.id, spec.target_material_name)}
                            title="Publish specification"
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        ) : spec.specification_status === 'published' ? (
                          <button
                            type="button"
                            onClick={() => handleArchive(spec.id, spec.target_material_name)}
                            title="Archive specification"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
