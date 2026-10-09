import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MaterialListingSummary, ComplianceAlert, InquirySummary } from '@/types/dashboard';
import { getStoredListings } from '@/lib/materialData';
import {
  Boxes,
  PlusCircle,
  FileCheck2,
  FileWarning,
  MessageSquare,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

const INITIAL_LISTINGS: MaterialListingSummary[] = [
  {
    id: 'mat-001',
    title: 'Foundry Waste Silica Sand (Phenolic Resin Bound)',
    category: 'Foundry & Metallurgical',
    grade: 'Grade-A Secondary Casting Sand',
    quantity: 120,
    unit: 'MT/month',
    frequency: 'Recurring Monthly',
    regulatory_status: 'eligible',
    listing_status: 'published',
    test_report_verified: true,
    facility_name: 'Bhosari MIDC Foundry Unit',
    created_at: '2026-09-28',
    potential_matches_count: 5,
  },
  {
    id: 'mat-002',
    title: 'Neutralized ETP Sludge (Non-Hazardous Dewatered Cake)',
    category: 'Industrial Sludge / Solids',
    grade: 'Moisture < 25%, pH 7.2',
    quantity: 85,
    unit: 'MT/month',
    frequency: 'Bi-weekly batch',
    regulatory_status: 'on_hold',
    listing_status: 'pending_review',
    test_report_verified: false,
    facility_name: 'Chakan Polymer Unit',
    created_at: '2026-10-02',
    potential_matches_count: 2,
  },
  {
    id: 'mat-003',
    title: 'Post-Industrial Polypropylene (PP) Regrind Flakes',
    category: 'Thermoplastics & Polymers',
    grade: 'Unfilled Natural White, MFI 12',
    quantity: 35,
    unit: 'MT',
    frequency: 'One-time lot',
    regulatory_status: 'eligible',
    listing_status: 'published',
    test_report_verified: true,
    facility_name: 'Bhosari MIDC Unit 2',
    created_at: '2026-10-05',
    potential_matches_count: 7,
  },
];

const COMPLIANCE_ALERTS: ComplianceAlert[] = [
  {
    id: 'alert-1',
    severity: 'medium',
    title: 'TCLP Leaching Test Report Missing',
    description: 'ETP Sludge lot #mat-002 requires TCLP heavy metal leaching certification before match clearance.',
    action_required: 'Upload certified NABL lab report',
    affected_resource: 'ETP Sludge (Chakan Plant)',
    due_date: 'Oct 15, 2026',
  },
  {
    id: 'alert-2',
    severity: 'info',
    title: 'Annual MPCB Hazardous Waste Form 4 Return',
    description: 'Upcoming annual manifestation filing due for Pune industrial division.',
    action_required: 'Review drafted record',
    affected_resource: 'Bhosari MIDC Plant 2',
    due_date: 'Nov 30, 2026',
  },
];

const RECENT_INQUIRIES: InquirySummary[] = [
  {
    id: 'inq-101',
    reference_no: 'INQ-PCMC-2026-44',
    material_name: 'Foundry Waste Silica Sand',
    counterparty_org: 'Bharat Forge Secondary Metallurgy',
    status: 'sampling',
    requested_quantity: 50,
    unit: 'MT',
    date: '2026-10-08',
    last_message: 'Sample request dispatched via BlueDart. Awaiting laboratory sieve analysis.',
  },
  {
    id: 'inq-102',
    reference_no: 'INQ-PCMC-2026-39',
    material_name: 'Polypropylene Regrind Flakes',
    counterparty_org: 'EcoRecycle Solutions',
    status: 'qualification',
    requested_quantity: 35,
    unit: 'MT',
    date: '2026-10-06',
    last_message: 'Technical specifications approved. Finalizing commercial dispatch terms.',
  },
];

export const ProducerDashboard: React.FC = () => {
  const [listings] = useState<MaterialListingSummary[]>(() => {
    const stored = getStoredListings();
    if (stored && stored.length > 0) {
      return stored.map((s) => ({
        id: s.id,
        title: s.title,
        category: s.category_name,
        grade: s.grade,
        quantity: s.total_volume,
        unit: s.unit,
        frequency: s.availability_type.replace('_', ' '),
        regulatory_status: s.regulatory_status,
        listing_status: s.listing_status,
        test_report_verified: s.batches.some((b) => b.documents.some((d) => d.is_verified)),
        facility_name: s.facility_name,
        created_at: s.created_at.split('T')[0],
        potential_matches_count: s.candidate_buyers_count,
      }));
    }
    return INITIAL_LISTINGS;
  });
  const [filter, setFilter] = useState<'all' | 'eligible' | 'on_hold' | 'pending_review'>('all');

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true;
    if (filter === 'eligible') return l.regulatory_status === 'eligible';
    if (filter === 'on_hold') return l.regulatory_status === 'on_hold';
    if (filter === 'pending_review') return l.listing_status === 'pending_review';
    return true;
  });

  const totalMonthlyVolume = listings.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Fast Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Producer Command Center</h1>
            <Badge variant="verified">Facility Verified</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage secondary industrial byproducts, track lab qualifications, and review buyer matches across PCMC clusters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm">
              <Boxes className="h-4 w-4 mr-1" />
              <span>Catalog Inventory</span>
            </Button>
          </Link>
          <Link href="/dashboard/listings/new">
            <Button variant="primary" size="sm">
              <PlusCircle className="h-4 w-4 mr-1" />
              <span>Post Material Listing</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Listings
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <Boxes className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{listings.length}</span>
              <span className="text-xs text-slate-500 font-medium">lots published</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-emerald-700 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>100% compliant with MPCB norms</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monthly Available Volume
              </span>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalMonthlyVolume}</span>
              <span className="text-xs text-slate-500 font-medium">MT / month</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Across Foundry & Polymer lines
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Candidate Buyer Matches
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">14</span>
              <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                +4 this week
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Foundry sand & PP buyers in 40km radius
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Inquiries
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <MessageSquare className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">2</span>
              <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              1 sample dispatched, 1 under qualification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance & Action Required Banner */}
      <Card className="border-amber-200 bg-amber-50/40">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Action Required — Regulatory Verification & Lab Evidence
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Per UI-UX specification, compliance is treated as a strict legal condition rather than a score. Two items require attention:
              </p>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMPLIANCE_ALERTS.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg bg-white p-3 border border-amber-200/90 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Due: {alert.due_date}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {alert.description}
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-emerald-700">
                        {alert.action_required}
                      </span>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
                        Resolve Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Material Listings Section */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>My Waste Material Listings & Batches</CardTitle>
            <CardDescription>
              Inventory published from your authorized Bhosari and Chakan facilities
            </CardDescription>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({listings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('eligible')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'eligible' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eligible
            </button>
            <button
              type="button"
              onClick={() => setFilter('on_hold')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filter === 'on_hold' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              On Hold
            </button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Material & Grade</th>
                <th className="px-4 py-3">Available Volume</th>
                <th className="px-4 py-3">Regulatory Status</th>
                <th className="px-4 py-3">Lab Evidence</th>
                <th className="px-4 py-3">Potential Buyers</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredListings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">{item.grade}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{item.facility_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-900 text-sm">
                      {item.quantity} {item.unit}
                    </span>
                    <p className="text-[11px] text-slate-500">{item.frequency}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={item.regulatory_status}>
                      {item.regulatory_status === 'eligible'
                        ? 'Eligible'
                        : item.regulatory_status === 'on_hold'
                        ? 'On Hold'
                        : 'Ineligible'}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    {item.test_report_verified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                        NABL Certified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <FileWarning className="h-3.5 w-3.5 text-amber-600" />
                        Report Missing
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                      <Sparkles className="h-3 w-3" />
                      {item.potential_matches_count} Buyers Found
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/listings/${item.id}`}>
                        <Button variant="outline" size="sm">
                          Inspect
                        </Button>
                      </Link>
                      <Link href="/dashboard/matches">
                        <Button variant="secondary" size="sm">
                          Matches
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Secondary Row: Inquiries Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deal Inquiries & Sample Dispatches</CardTitle>
          <CardDescription>
            Live interaction stream with verified buyers in Pune secondary feedstock market
          </CardDescription>
        </CardHeader>
        <div className="p-6 divide-y divide-slate-100">
          {RECENT_INQUIRIES.map((inq) => (
            <div key={inq.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800">{inq.reference_no}</span>
                  <Badge variant={inq.status === 'qualification' ? 'verified' : 'pending'}>
                    {inq.status.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {inq.date}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-900 mt-1">
                  {inq.counterparty_org} • {inq.requested_quantity} {inq.unit} {inq.material_name}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5 bg-slate-50 p-2 rounded border border-slate-100">
                  &ldquo;{inq.last_message}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm">
                  View Thread
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
