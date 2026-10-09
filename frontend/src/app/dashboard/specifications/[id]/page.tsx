'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getSpecificationById,
  publishSpecificationById,
  archiveSpecificationById,
  duplicateSpecification,
  evaluateListingMatch,
  CONSTRAINT_TYPE_DEFINITIONS,
  MISSING_DATA_POLICY_DEFINITIONS,
} from '@/lib/specificationData';
import { getStoredListings } from '@/lib/materialData';
import { BuyerSpecification } from '@/types/specification';
import {
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Copy,
  Archive,
  ArrowRight,
  HelpCircle,
  FileText,
  Calendar,
} from 'lucide-react';

function SpecificationDetailContent() {
  const params = useParams();
  const router = useRouter();
  const specId = params?.id as string;

  const [spec, setSpec] = useState<BuyerSpecification | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (specId) {
      const found = getSpecificationById(specId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpec(found);
    }
  }, [specId]);

  if (!spec) {
    return (
      <div className="py-20 text-center">
        <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Specification Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">
          The specification reference &quot;{specId}&quot; could not be located.
        </p>
        <Link href="/dashboard/specifications" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Return to Specifications
          </Button>
        </Link>
      </div>
    );
  }

  const handlePublish = () => {
    const updated = publishSpecificationById(spec.id);
    if (updated) {
      setSpec(updated);
      setNotification(`Specification activated for automated matching.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleArchive = () => {
    const updated = archiveSpecificationById(spec.id);
    if (updated) {
      setSpec(updated);
      setNotification(`Specification archived.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDuplicate = () => {
    const dup = duplicateSpecification(spec.id);
    if (dup) {
      router.push(`/dashboard/specifications/${dup.id}`);
    }
  };

  // Evaluate candidate listings against this specification
  const allListings = getStoredListings();
  const candidateMatches = allListings.map((listing) => ({
    listing,
    evaluation: evaluateListingMatch(spec, listing),
  }));

  const qualifiedMatches = candidateMatches.filter((m) => m.evaluation.isCompatible);

  const hardLimits = spec.constraints.filter((c) => c.constraint_type === 'HARD_LIMIT');
  const preferred = spec.constraints.filter((c) => c.constraint_type === 'PREFERRED_RANGE');

  return (
    <div className="space-y-6">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/dashboard/specifications"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Specifications</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {spec.target_material_name}
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              v{spec.specification_version}
            </span>
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
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{spec.target_category_name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building className="h-3 w-3 text-slate-400" />
              {spec.receiving_facility_name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400" />
              {spec.receiving_facility_zone}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            <span>Duplicate</span>
          </Button>

          {spec.specification_status === 'draft' ? (
            <Button variant="primary" size="sm" onClick={handlePublish}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              <span>Publish & Activate</span>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleArchive}>
              <Archive className="h-3.5 w-3.5 mr-1.5 text-rose-500" />
              <span>Archive</span>
            </Button>
          )}
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
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Intended Process
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
            {spec.intended_use}
          </p>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Demand Cadence
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {spec.minimum_quantity}
            {spec.maximum_quantity ? ` - ${spec.maximum_quantity}` : ''} {spec.quantity_unit}
          </p>
          <span className="text-[11px] text-slate-500 capitalize">
            {spec.frequency.replace('recurring_', '').replace('_', ' ')}
          </span>
        </Card>

        <Card className="p-4 border-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Haul Radius
          </span>
          <p className="text-sm font-bold text-slate-900 mt-1">
            &lt; {spec.max_distance_km} km
          </p>
          <span className="text-[11px] text-slate-500">
            From {spec.receiving_facility_zone}
          </span>
        </Card>

        <Card className="p-4 border-slate-200 bg-emerald-50/40 border-emerald-200">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Qualified Stream Matches
          </span>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {qualifiedMatches.length} Compatible Batches
          </p>
          <span className="text-[11px] text-emerald-600">
            Automated matching engine running
          </span>
        </Card>
      </div>

      {/* Technical Acceptance Matrix (UI-UX Spec § 6.6) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Technical Acceptance Constraints Matrix</CardTitle>
            <CardDescription>
              {hardLimits.length} Hard Limits, {preferred.length} Preferred Ranges, and{' '}
              {spec.constraints.length - hardLimits.length - preferred.length} Other Metrics
            </CardDescription>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {spec.constraints.length} Parameters Evaluated
          </span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-y border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Property Name</th>
                <th className="px-4 py-3.5">Constraint Classification</th>
                <th className="px-4 py-3.5">Acceptance Range</th>
                <th className="px-4 py-3.5">Missing-Data Protocol</th>
                <th className="px-4 py-3.5">Lab Evidence</th>
                <th className="px-6 py-3.5">Testing Method / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {spec.constraints.map((c) => {
                const def = CONSTRAINT_TYPE_DEFINITIONS[c.constraint_type];
                const policy = MISSING_DATA_POLICY_DEFINITIONS[c.missing_data_policy];

                let rangeStr = '';
                if (c.lower_bound !== undefined && c.upper_bound !== undefined) {
                  rangeStr = `${c.lower_bound} – ${c.upper_bound} ${c.unit}`;
                } else if (c.lower_bound !== undefined) {
                  rangeStr = `≥ ${c.lower_bound} ${c.unit}`;
                } else if (c.upper_bound !== undefined) {
                  rangeStr = `≤ ${c.upper_bound} ${c.unit}`;
                } else {
                  rangeStr = `Reported (${c.unit})`;
                }

                return (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {c.property_name}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${def.badgeColor}`}
                      >
                        {def.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-800">
                      {rangeStr}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {policy.label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {c.required_evidence ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          Mandatory
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Optional</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-[11px]">
                      {c.tolerance_policy || 'Standard plant quality criteria'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preprocessing & Prohibitions Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Validated Preprocessing Capabilities
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Treatments permitted to bring candidate streams into technical compliance:
          </p>
          <div className="flex flex-wrap gap-2">
            {spec.acceptable_preprocessing.map((prep, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                ✓ {prep}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Contaminant Prohibitions & Veto Rules
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Immediate exclusion criteria for candidate streams:
          </p>
          <div className="rounded-lg bg-purple-50 p-3 border border-purple-200 text-xs text-purple-950 font-medium leading-relaxed">
            {spec.prohibited_contaminants_notes ||
              'Standard hazardous substance exclusions apply.'}
          </div>
        </Card>
      </div>

      {/* Explainable Matches Feed (UI-UX Spec § 2.3 & 5.4) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Live Marketplace Matches (Explainable Criteria)</CardTitle>
              <CardDescription>
                Real-time evaluation against producer batch listings in the Maharashtra catalog
              </CardDescription>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              {qualifiedMatches.length} Qualified Candidates
            </span>
          </div>
        </CardHeader>

        <div className="p-6 space-y-4">
          {candidateMatches.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No material listings currently published in the catalog.
            </p>
          ) : (
            candidateMatches.map(({ listing, evaluation }) => (
              <div
                key={listing.id}
                className={`rounded-xl border p-5 transition-all shadow-2xs ${
                  evaluation.isCompatible
                    ? 'border-emerald-200 bg-white hover:border-emerald-300'
                    : 'border-slate-200 bg-slate-50/40 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{listing.title}</h4>
                      <Badge variant={listing.regulatory_status}>
                        {listing.regulatory_status === 'eligible'
                          ? 'Legal: Eligible'
                          : 'Legal: On Hold'}
                      </Badge>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          evaluation.isCompatible
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {evaluation.isCompatible ? 'Technically Qualified' : 'Hard Limit Violation'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {listing.organization_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {listing.facility_zone}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        Available: {listing.total_volume} {listing.unit}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Compatibility Fit</span>
                      <span className="text-lg font-bold text-emerald-700">
                        {evaluation.scorePercentage}%
                      </span>
                    </div>
                    <Button
                      variant={evaluation.isCompatible ? 'primary' : 'secondary'}
                      size="sm"
                      disabled={!evaluation.isCompatible}
                      onClick={() => alert(`Initiate inquiry for ${listing.title}`)}
                    >
                      <span>
                        {evaluation.isCompatible ? 'Request Sample' : 'Incompatible Stream'}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Constraint Breakdown Grid */}
                {evaluation.evaluatedProperties.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Individual Property Evaluation:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {evaluation.evaluatedProperties.map((prop, idx) => (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            prop.pass
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                              : 'bg-rose-50/50 border-rose-200 text-rose-950'
                          }`}
                        >
                          <div>
                            <span className="font-semibold block">{prop.name}</span>
                            <span className="text-[11px] text-slate-500">
                              Target: {prop.requiredRange}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold block">{prop.measuredValue}</span>
                            <span className="text-[10px] font-bold flex items-center gap-0.5 justify-end">
                              {prop.pass ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Pass
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 text-rose-600" /> Fail
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

export default function SpecificationDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading specification criteria...
        </div>
      }
    >
      <SpecificationDetailContent />
    </Suspense>
  );
}
