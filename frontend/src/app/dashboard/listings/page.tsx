'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStoredListings, publishListingById, MATERIAL_CATEGORIES } from '@/lib/materialData';
import { MaterialListing } from '@/types/material';
import { RegulatoryStatus, ListingStatus } from '@/types/dashboard';
import {
  Boxes,
  PlusCircle,
  Search,
  FileCheck2,
  FileWarning,
  Sparkles,
  MapPin,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function MaterialListingsPage() {
  const [listings, setListings] = useState<MaterialListing[]>(getStoredListings);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [regulatoryFilter, setRegulatoryFilter] = useState<'ALL' | RegulatoryStatus>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ListingStatus>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  const handleQuickPublish = (id: string, title: string) => {
    const updated = publishListingById(id);
    if (updated) {
      setListings(getStoredListings());
      setNotification(`Listing "${title}" has been successfully published to the marketplace.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const filteredListings = listings.filter((item) => {
    // Search query
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source_process.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facility_name.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory = categoryFilter === 'ALL' || item.category_code === categoryFilter;

    // Regulatory filter
    const matchesReg = regulatoryFilter === 'ALL' || item.regulatory_status === regulatoryFilter;

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || item.listing_status === statusFilter;

    return matchesSearch && matchesCategory && matchesReg && matchesStatus;
  });

  const totalVolume = listings.reduce((sum, item) => sum + item.total_volume, 0);
  const eligibleCount = listings.filter((i) => i.regulatory_status === 'eligible').length;
  const onHoldCount = listings.filter((i) => i.regulatory_status === 'on_hold').length;

  return (
    <div className="space-y-6">
      {/* Header and Call to Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Material Listings Inventory
            </h1>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
              {listings.length} Lots
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish and manage industrial waste streams, batch technical properties, and MPCB lab test certifications.
          </p>
        </div>

        <Link href="/dashboard/listings/new">
          <Button variant="primary" size="md">
            <PlusCircle className="h-4 w-4 mr-1.5" />
            <span>Post Waste Material</span>
          </Button>
        </Link>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-emerald-950 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Listed Volume
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalVolume}{' '}
                <span className="text-xs font-medium text-slate-500">MT / month</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Boxes className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Regulatory Clearance: Eligible
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {eligibleCount}{' '}
                <span className="text-xs font-medium text-slate-500">Active Streams</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                On Hold (Missing Lab Tests)
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {onHoldCount}{' '}
                <span className="text-xs font-medium text-slate-500">Action Required</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search by material title, grade, source process, or plant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-56">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
              >
                <option value="ALL">All Material Categories</option>
                {MATERIAL_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Regulatory Status Filter */}
            <div className="w-full md:w-36">
              <select
                value={regulatoryFilter}
                onChange={(e) => setRegulatoryFilter(e.target.value as 'ALL' | RegulatoryStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
              >
                <option value="ALL">All Legal Status</option>
                <option value="eligible">Eligible Only</option>
                <option value="on_hold">On Hold Only</option>
                <option value="ineligible">Ineligible Only</option>
              </select>
            </div>

            {/* Listing State Filter */}
            <div className="w-full md:w-36">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ListingStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
              >
                <option value="ALL">All States</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Listings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Catalog Listings ({filteredListings.length})</CardTitle>
              <CardDescription>
                Detailed register of published lots with verifiable batch laboratory records
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {filteredListings.length === 0 ? (
          <div className="p-12 text-center">
            <Boxes className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No matching material listings found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or create a new waste material listing using the post button.
            </p>
            <div className="mt-4">
              <Link href="/dashboard/listings/new">
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-3.5 w-3.5 mr-1" />
                  Post Material Now
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Material Identity & Facility</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Volume & Supply</th>
                  <th className="px-4 py-3">Regulatory State</th>
                  <th className="px-4 py-3">Lab Evidence</th>
                  <th className="px-4 py-3">Buyer Matches</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((item) => {
                  const hasVerifiedDoc = item.batches.some((b) =>
                    b.documents.some((d) => d.is_verified)
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Identity & Facility */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/listings/${item.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          {item.title}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Grade: <span className="font-mono text-slate-700">{item.grade}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{item.facility_name} ({item.facility_zone})</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {item.category_name.split('&')[0].trim()}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">
                          {item.source_process}
                        </p>
                      </td>

                      {/* Volume */}
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900 text-sm">
                          {item.total_volume} {item.unit}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {item.availability_type.replace('_', ' ')}
                        </p>
                      </td>

                      {/* Regulatory Status */}
                      <td className="px-4 py-4">
                        <Badge variant={item.regulatory_status}>
                          {item.regulatory_status === 'eligible'
                            ? 'Eligible'
                            : item.regulatory_status === 'on_hold'
                            ? 'On Hold'
                            : 'Ineligible'}
                        </Badge>
                        {item.listing_status === 'draft' && (
                          <span className="block mt-1">
                            <Badge variant="draft" size="sm">Draft</Badge>
                          </span>
                        )}
                      </td>

                      {/* Lab Evidence */}
                      <td className="px-4 py-4">
                        {hasVerifiedDoc ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                            <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                            NABL Certified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                            <FileWarning className="h-3.5 w-3.5 text-amber-600" />
                            Report Required
                          </span>
                        )}
                      </td>

                      {/* Buyer Matches */}
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                          <Sparkles className="h-3 w-3" />
                          {item.candidate_buyers_count} Potential
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.listing_status === 'draft' && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[11px] px-2.5 py-1"
                              onClick={() => handleQuickPublish(item.id, item.title)}
                            >
                              Publish
                            </Button>
                          )}
                          <Link href={`/dashboard/listings/${item.id}`}>
                            <Button variant="outline" size="sm" className="text-[11px] px-2.5 py-1">
                              <Eye className="h-3 w-3 mr-1" />
                              Inspect
                            </Button>
                          </Link>
                        </div>
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
