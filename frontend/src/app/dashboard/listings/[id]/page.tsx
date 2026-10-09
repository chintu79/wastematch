'use client';

import React, { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStoredListings, publishListingById } from '@/lib/materialData';
import { MaterialListing } from '@/types/material';
import {
  ArrowLeft,
  FileCheck2,
  FileWarning,
  MapPin,
  Sparkles,
  CheckCircle2,
  Download,
  Share2,
} from 'lucide-react';

function ListingDetailContent() {
  const params = useParams();
  const listingId = params?.id as string;
  const [listing, setListing] = useState<MaterialListing | null>(() => {
    const listings = getStoredListings();
    return listings.find((l) => l.id === listingId) || null;
  });
  const [notification, setNotification] = useState<string | null>(null);

  if (!listing) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <h2 className="text-base font-bold text-slate-800">Material Listing Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The requested material listing ID &ldquo;{listingId}&rdquo; could not be retrieved from the active inventory.
        </p>
        <Link href="/dashboard/listings">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Return to Listings
          </Button>
        </Link>
      </div>
    );
  }

  const handlePublish = () => {
    const updated = publishListingById(listing.id);
    if (updated) {
      setListing(updated);
      setNotification('Listing has been successfully validated and published to the marketplace.');
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const primaryBatch = listing.batches[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/listings"
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-1.5"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Material Listings
          </Link>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {listing.title}
            </h1>
            <Badge variant={listing.regulatory_status}>
              {listing.regulatory_status === 'eligible'
                ? 'Legal: Eligible'
                : listing.regulatory_status === 'on_hold'
                ? 'Legal: On Hold'
                : 'Legal: Ineligible'}
            </Badge>
            <Badge variant={listing.listing_status === 'published' ? 'published' : 'draft'}>
              {listing.listing_status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Batch Reference: <span className="font-mono font-semibold text-slate-700">{primaryBatch?.batch_reference || 'N/A'}</span> • Created {new Date(listing.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {listing.listing_status === 'draft' && (
            <Button variant="primary" size="sm" onClick={handlePublish}>
              Publish Listing
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert(`Direct share link copied: ${window.location.href}`)}
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>
        </div>
      </div>

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

      {/* Main Grid: Identity & Logistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Properties */}
        <div className="md:col-span-2 space-y-6">
          {/* Identity & Process Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Material Identity & Origin</CardTitle>
              <CardDescription>
                Generation process and material parameters from the producing facility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[11px]">
                  Description
                </span>
                <p className="text-slate-800 mt-1 leading-relaxed">{listing.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[11px]">
                    Quality Grade / Purity
                  </span>
                  <p className="font-mono text-slate-900 font-semibold mt-0.5">{listing.grade}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[11px]">
                    Material Category
                  </span>
                  <p className="text-slate-900 font-semibold mt-0.5">{listing.category_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[11px]">
                    Source Process
                  </span>
                  <p className="text-slate-800 mt-0.5">{listing.source_process}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block text-[11px]">
                    Known Prior Contaminants
                  </span>
                  <p className="text-slate-800 mt-0.5">{listing.prior_contaminants || 'None disclosed'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Properties Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle>Technical Properties & Assay Matrix</CardTitle>
                  <CardDescription>
                    Measurements verified against batch sample records
                  </CardDescription>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {primaryBatch?.measurements?.length || 0} Parameters Tested
                </span>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Property</th>
                    <th className="px-4 py-3">Measured Value</th>
                    <th className="px-4 py-3">Measurement Basis</th>
                    <th className="px-4 py-3">Laboratory / Method</th>
                    <th className="px-4 py-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {primaryBatch?.measurements?.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {m.property_name}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {m.value} {m.unit}
                      </td>
                      <td className="px-4 py-3 capitalize text-slate-600">
                        {m.basis.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.laboratory_name || 'In-House'}
                        {m.test_method && <span className="block text-[10px] text-slate-400 font-mono">{m.test_method}</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {m.nabl_accredited ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> NABL Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Self-Reported</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Supporting Evidence Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Evidence & Certificates</CardTitle>
              <CardDescription>
                NABL lab test reports, MSDS, and state pollution control consents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {primaryBatch?.documents?.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <FileWarning className="h-6 w-6 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">No lab documents attached</p>
                  <p className="text-[11px] text-slate-500">
                    Buyers cannot issue dispatch orders without certified laboratory records.
                  </p>
                </div>
              ) : (
                primaryBatch?.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                          <Badge variant="verified" size="sm">NABL Accredited</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.file_name} • Issued: {doc.issue_date} • {doc.issuing_authority}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert(`Downloading verified document: ${doc.file_name}`)}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      Download
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Logistics & Action Sidebar */}
        <div className="space-y-6">
          {/* Volume & Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle>Volume & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Available Supply
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {listing.total_volume} {listing.unit}
                </span>
                <span className="inline-block mt-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {listing.availability_type.replace('_', ' ')}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Origin Facility
                </span>
                <p className="font-semibold text-slate-900 mt-0.5">{listing.facility_name}</p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{listing.facility_zone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Holding Organization
                </span>
                <p className="font-semibold text-slate-900 mt-0.5">{listing.organization_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Regulatory Clearance Card */}
          <Card className={listing.regulatory_status === 'eligible' ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant={listing.regulatory_status}>
                  {listing.regulatory_status.toUpperCase()}
                </Badge>
                <CardTitle className="text-sm">Compliance Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p className="text-slate-700 leading-relaxed">
                {listing.regulatory_notes || 'Regulatory status evaluated according to Maharashtra Pollution Control Board guidelines.'}
              </p>
              <div className="pt-2 text-[11px] text-slate-500">
                Jurisdiction: <span className="font-semibold text-slate-800">PCMC / MPCB Pune</span>
              </div>
            </CardContent>
          </Card>

          {/* Potential Matches Lead Card */}
          <Card className="border-purple-200 bg-purple-50/40">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-sm flex items-center gap-1.5 text-purple-950">
                  <Sparkles className="h-4 w-4 text-purple-700" />
                  Candidate Buyers
                </CardTitle>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  {listing.candidate_buyers_count} Leads
                </span>
              </div>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <p className="text-purple-900 leading-snug">
                The matching engine found {listing.candidate_buyers_count} industrial buyers in Pune with active specifications compatible with this stream.
              </p>
              <Link href="/dashboard/matches" className="block w-full">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full bg-purple-700 hover:bg-purple-800"
                >
                  Inspect Buyer Matches
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MaterialListingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading material listing details...
        </div>
      }
    >
      <ListingDetailContent />
    </Suspense>
  );
}
