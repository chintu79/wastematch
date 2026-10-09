'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BuyerSpecificationSummary } from '@/types/dashboard';
import {
  SlidersHorizontal,
  GitCompare,
  PlusCircle,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';

const SPECIFICATIONS: BuyerSpecificationSummary[] = [
  {
    id: 'spec-01',
    target_material: 'Secondary Foundry Silica Sand',
    intended_application: 'Core Making & Green Sand Mold Replenishment',
    required_volume: 100,
    unit: 'MT/month',
    max_distance_km: 50,
    status: 'active',
    matched_listings_count: 3,
    updated_at: '2026-10-04',
  },
  {
    id: 'spec-02',
    target_material: 'Recycled Polypropylene (PP Flakes)',
    intended_application: 'Automotive HVAC Duct Housing Injection',
    required_volume: 40,
    unit: 'MT/month',
    max_distance_km: 75,
    status: 'active',
    matched_listings_count: 5,
    updated_at: '2026-10-06',
  },
  {
    id: 'spec-03',
    target_material: 'Blast Furnace Granulated Slag (GGBS)',
    intended_application: 'Composite Pozzolanic Binder Replacement',
    required_volume: 250,
    unit: 'MT/quarter',
    max_distance_km: 120,
    status: 'active',
    matched_listings_count: 2,
    updated_at: '2026-09-22',
  },
];

const CANDIDATE_MATCHES = [
  {
    id: 'match-801',
    listing_title: 'Foundry Waste Silica Sand (Phenolic Resin Bound)',
    supplier_org: 'Tata AutoComp Systems Ltd',
    distance_km: 18,
    location: 'Bhosari MIDC, Pune',
    volume_offered: '120 MT/month',
    regulatory_status: 'eligible' as const,
    compatibility_score: '94%',
    technical_verdict: 'Meets 4 of 4 hard constraints',
    key_properties: [
      { name: 'SiO2 Purity', measured: '96.4%', req: 'Min 95%', pass: true },
      { name: 'Loss on Ignition (LOI)', measured: '1.8%', req: 'Max 2.5%', pass: true },
      { name: 'Grain Fineness (AFS)', measured: '52 AFS', req: '48-58 AFS', pass: true },
    ],
    sample_status: 'Sample Dispatched',
  },
  {
    id: 'match-802',
    listing_title: 'PP Industrial Regrind White Pellets',
    supplier_org: 'EcoRecycle Solutions Maharashtra',
    distance_km: 26,
    location: 'Chakan Phase III, Pune',
    volume_offered: '35 MT',
    regulatory_status: 'eligible' as const,
    compatibility_score: '88%',
    technical_verdict: 'Meets hard constraints, MFI within preferred range',
    key_properties: [
      { name: 'Melt Flow Index (MFI)', measured: '12 g/10min', req: '10-14 g/10min', pass: true },
      { name: 'Moisture', measured: '0.04%', req: 'Max 0.1%', pass: true },
    ],
    sample_status: 'Lab Qualified',
  },
  {
    id: 'match-803',
    listing_title: 'Neutralized Dewatered ETP Cake',
    supplier_org: 'Chakan Automotive Metal Finishers',
    distance_km: 31,
    location: 'Chakan MIDC',
    volume_offered: '85 MT/month',
    regulatory_status: 'on_hold' as const,
    compatibility_score: '71%',
    technical_verdict: 'Regulatory review required: TCLP leaching report missing',
    key_properties: [
      { name: 'Moisture Content', measured: '22%', req: 'Max 25%', pass: true },
      { name: 'Heavy Metal Leaching', measured: 'Pending NABL', req: 'Below MoEF Limit', pass: false },
    ],
    sample_status: 'Blocked on Evidence',
  },
];

export const BuyerDashboard: React.FC = () => {
  const [showSpecNotice, setShowSpecNotice] = useState(false);

  return (
    <div className="space-y-6">
      {/* Welcome & Fast Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buyer Procurement Hub</h1>
            <Badge variant="verified">Authorized Recipient Facility</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Specify secondary feedstock requirements, inspect explainable matching results, and track material samples.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Search catalog opens in marketplace discovery mode.')}
          >
            <Search className="h-4 w-4" />
            <span>Search Feedstocks</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSpecNotice(true)}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Create Buyer Spec</span>
          </Button>
        </div>
      </div>

      {showSpecNotice && (
        <div className="rounded-xl border border-blue-300 bg-blue-50/90 p-4 text-blue-950 flex items-start justify-between shadow-xs">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-blue-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-900">Next Step: Issue #11 Buyer Specification Builder</p>
              <p className="text-xs text-blue-800 mt-0.5">
                The constraint builder (Hard limits vs. Preferred tolerances, Prohibited contaminants, and geographic radii) is scheduled under <strong>#11 [Frontend] Build Buyer Specification UI</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSpecNotice(false)}
            className="text-xs font-semibold text-blue-800 hover:text-blue-950 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Specifications
              </span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{SPECIFICATIONS.length}</span>
              <span className="text-xs text-slate-500 font-medium">specs active</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Total demand: ~390 MT / month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compatible Matches
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <GitCompare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">12</span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                High Compatibility
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Within 45 km radius in Pune/PCMC
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Matches On Hold
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">1</span>
              <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                Missing Evidence
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Legally blocked until NABL test report
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sample Lab Qualification
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">2</span>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">
                In Testing
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              1 sieve analysis, 1 polymer MFI test
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Buyer Specifications Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Feedstock Specifications</CardTitle>
            <CardDescription>
              Your defined material tolerances and automated matching criteria
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSpecNotice(true)}>
            <PlusCircle className="h-4 w-4" />
            <span>Add Spec</span>
          </Button>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Material Target & Application</th>
                <th className="px-4 py-3">Demand Volume</th>
                <th className="px-4 py-3">Max Radius</th>
                <th className="px-4 py-3">Live Matches</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SPECIFICATIONS.map((spec) => (
                <tr key={spec.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{spec.target_material}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{spec.intended_application}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-900">
                      {spec.required_volume} {spec.unit}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      &lt; {spec.max_distance_km} km
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                      <Sparkles className="h-3 w-3" />
                      {spec.matched_listings_count} Qualified Matches
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="eligible">Active Monitoring</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm">
                      Inspect Criteria
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Explainable Matches Feed (UI-UX Spec § 2.3 & 6.8) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Top Matching Opportunities (Explainable Criteria)</CardTitle>
              <CardDescription>
                Matches are evaluated on three distinct axes: Legal Eligibility, Technical Constraints, and Commercial Distance
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Matching Engine Active
            </span>
          </div>
        </CardHeader>

        <div className="p-6 space-y-4">
          {CANDIDATE_MATCHES.map((match) => (
            <div
              key={match.id}
              className="rounded-xl border border-slate-200 p-5 bg-white hover:border-emerald-300 transition-all shadow-2xs"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{match.listing_title}</h4>
                    <Badge variant={match.regulatory_status}>
                      {match.regulatory_status === 'eligible' ? 'Legal: Eligible' : 'Legal: On Hold'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                    <span className="font-medium text-slate-800">{match.supplier_org}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {match.location} ({match.distance_km} km away)
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">Available: {match.volume_offered}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Compatibility</span>
                    <span className="text-lg font-bold text-emerald-700">{match.compatibility_score}</span>
                  </div>
                  <Button
                    variant={match.regulatory_status === 'eligible' ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={match.regulatory_status !== 'eligible'}
                    onClick={() => alert(`Initiate inquiry for ${match.listing_title}`)}
                  >
                    <span>{match.regulatory_status === 'eligible' ? 'Request Sample' : 'Legally Blocked'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Explainable Parameter Matrix */}
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Technical Constraint Evaluation:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {match.key_properties.map((prop, idx) => (
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
                        <span className="text-[11px] text-slate-500">Target: {prop.req}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">{prop.measured}</span>
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
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
