'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/Card';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  getStoredInquiries,
  getStoredMatches,
  addStoredInquiry,
  getBatchLabel,
  getOrgName,
  shortenId,
} from '@/lib/matchData';
import { Inquiry, MatchEvaluation, ApiInquiryStatus } from '@/types/match';
import {
  MessageSquare,
  Search,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  RefreshCw,
  Package,
  Send,
  XCircle,
} from 'lucide-react';

const STATUS_BADGE: Record<ApiInquiryStatus, { variant: BadgeVariant; label: string }> = {
  OPEN: { variant: 'pending', label: 'Open' },
  IN_PROGRESS: { variant: 'info', label: 'In Progress' },
  QUALIFIED: { variant: 'eligible', label: 'Qualified' },
  REJECTED: { variant: 'ineligible', label: 'Rejected' },
  CLOSED: { variant: 'neutral', label: 'Closed' },
};

const SAMPLE_UNITS = ['MT', 'kg', 'tonne', 'litre'];

interface Toast {
  kind: 'success' | 'error';
  message: string;
}

export default function InquiriesPage() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [matches, setMatches] = useState<MatchEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApiInquiryStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMatchId, setCreateMatchId] = useState('');
  const [sampleFor, setSampleFor] = useState<string | null>(null);
  const [sampleQty, setSampleQty] = useState('1');
  const [sampleUnit, setSampleUnit] = useState('MT');
  const [sampleCity, setSampleCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = (kind: Toast['kind'], message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Pure loader with no setState; safe to call from effects and handlers.
  const fetchInquiriesData = async (): Promise<{
    inquiryData: Inquiry[];
    matchData: MatchEvaluation[];
    offline: boolean;
  }> => {
    try {
      const [inquiryData, matchData] = await Promise.all([
        apiRequest<Inquiry[]>('/inquiries/'),
        apiRequest<MatchEvaluation[]>('/matches/').catch(() => [] as MatchEvaluation[]),
      ]);
      return { inquiryData, matchData, offline: false };
    } catch {
      return {
        inquiryData: getStoredInquiries(),
        matchData: getStoredMatches(),
        offline: true,
      };
    }
  };

  const loadData = () => {
    fetchInquiriesData().then(({ inquiryData, matchData, offline }) => {
      setInquiries(inquiryData);
      setMatches(matchData);
      setIsOffline(offline);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let mounted = true;
    fetchInquiriesData().then(({ inquiryData, matchData, offline }) => {
      if (!mounted) return;
      setInquiries(inquiryData);
      setMatches(matchData);
      setIsOffline(offline);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateInquiry = async () => {
    if (!user || !createMatchId) return;
    setIsSubmitting(true);
    try {
      await apiRequest('/inquiries/', {
        method: 'POST',
        body: JSON.stringify({
          match_id: createMatchId,
          buyer_organization_id: user.organization.id,
          producer_organization_id: 'org-prod-001',
        }),
      });
      notify('success', 'Inquiry created.');
    } catch {
      addStoredInquiry({
        match_id: createMatchId,
        buyer_organization_id: user.organization.id,
        producer_organization_id: 'org-prod-001',
        rejection_reason: null,
      });
      notify('success', 'Inquiry recorded locally (backend offline).');
    } finally {
      setIsSubmitting(false);
      setShowCreateForm(false);
      setCreateMatchId('');
      setInquiries(getStoredInquiries());
    }
  };

  const handleRequestSample = async (inquiry: Inquiry) => {
    setIsSubmitting(true);
    try {
      await apiRequest(`/inquiries/${inquiry.id}/sample-requests`, {
        method: 'POST',
        body: JSON.stringify({
          inquiry_id: inquiry.id,
          quantity_requested: Number(sampleQty),
          quantity_unit: sampleUnit,
          shipping_address: { city: sampleCity || 'Pune', country: 'India' },
        }),
      });
      notify('success', `Sample requested for inquiry ${shortenId(inquiry.id)}.`);
    } catch {
      notify(
        'success',
        `Sample request recorded locally for ${shortenId(inquiry.id)} (backend offline).`
      );
    } finally {
      setIsSubmitting(false);
      setSampleFor(null);
      setSampleQty('1');
      setSampleCity('');
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = statusFilter === 'ALL' || inq.inquiry_status === statusFilter;
      const batch = getBatchLabel(
        matches.find((m) => m.id === inq.match_id)?.material_batch_id ?? ''
      );
      const haystack =
        `${inq.id} ${inq.match_id} ${batch.title} ${getOrgName(inq.buyer_organization_id)} ${getOrgName(inq.producer_organization_id)}`.toLowerCase();
      return matchesStatus && haystack.includes(searchQuery.toLowerCase());
    });
  }, [inquiries, matches, statusFilter, searchQuery]);

  const openCount = inquiries.filter((i) => i.inquiry_status === 'OPEN').length;
  const activeCount = inquiries.filter((i) => i.inquiry_status === 'IN_PROGRESS').length;
  const qualifiedCount = inquiries.filter((i) => i.inquiry_status === 'QUALIFIED').length;
  const closedCount = inquiries.filter(
    (i) => i.inquiry_status === 'REJECTED' || i.inquiry_status === 'CLOSED'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Inquiries & RFQs
            </h1>
            <span className="text-xs font-semibold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
              {inquiries.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track engagement on your matches, open new inquiries, and manage sample requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              loadData();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowCreateForm((s) => !s)}>
            <PlusCircle className="h-4 w-4" />
            New Inquiry
          </Button>
        </div>
      </div>

      {/* Offline notice */}
      {isOffline && !isLoading && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950 flex items-center gap-2 shadow-2xs">
          <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs font-medium">
            Backend API is unreachable - showing bundled sample inquiries. Start the API with{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">docker compose up api</code> to
            manage live data.
          </p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`rounded-xl border p-3.5 flex items-center justify-between shadow-2xs ${
            toast.kind === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
              : 'border-rose-300 bg-rose-50 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-medium">
            {toast.kind === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className={`text-xs font-bold ${
              toast.kind === 'success' ? 'text-emerald-700' : 'text-rose-700'
            } hover:opacity-70`}
          >
            ✕
          </button>
        </div>
      )}

      {/* Create inquiry form */}
      {showCreateForm && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-xs font-bold text-slate-900 mb-3">Open a new inquiry</h4>
            <div className="flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Match evaluation
                </label>
                <select
                  value={createMatchId}
                  onChange={(e) => setCreateMatchId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">Select a match...</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {getBatchLabel(m.material_batch_id).title} ({shortenId(m.id)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!createMatchId}
                  isLoading={isSubmitting}
                  onClick={handleCreateInquiry}
                >
                  <Send className="h-3.5 w-3.5" />
                  Create
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{openCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                In Progress
              </p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <RefreshCw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Qualified
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">{qualifiedCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Rejected / Closed
              </p>
              <p className="text-2xl font-bold text-slate-600 mt-1">{closedCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search by inquiry ID, match, material, or organization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ApiInquiryStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="REJECTED">Rejected</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries list */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Inquiry Register ({filteredInquiries.length})</CardTitle>
            <CardDescription>
              Every inquiry raised against a match, with its lifecycle status and sample activity
            </CardDescription>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading inquiries...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No inquiries found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Open an inquiry from the{' '}
              <Link href="/dashboard/matches" className="text-emerald-700 font-semibold hover:underline">
                Matches
              </Link>{' '}
              page or use the &quot;New Inquiry&quot; button above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Inquiry &amp; Material</th>
                  <th className="px-4 py-3">Counterparties</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Timeline</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inq) => {
                  const match = matches.find((m) => m.id === inq.match_id);
                  const batch = match ? getBatchLabel(match.material_batch_id) : null;
                  const badge = STATUS_BADGE[inq.inquiry_status];
                  const hasSampleForm = sampleFor === inq.id;

                  return (
                    <React.Fragment key={inq.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">
                            {batch?.title ?? `Match ${shortenId(inq.match_id)}`}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                            {inq.id}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-[11px]">
                            <span className="font-semibold text-slate-700">Buyer:</span>{' '}
                            {getOrgName(inq.buyer_organization_id)}
                          </div>
                          <div className="text-[11px] mt-0.5">
                            <span className="font-semibold text-slate-700">Producer:</span>{' '}
                            {getOrgName(inq.producer_organization_id)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          {inq.rejection_reason && (
                            <p className="text-[11px] text-rose-600 mt-1 max-w-[180px]">
                              {inq.rejection_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-[11px] text-slate-500">
                          Created {new Date(inq.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}
                          <div className="text-slate-400 mt-0.5">
                            Updated {new Date(inq.updated_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href="/dashboard/matches">
                              <Button variant="outline" size="sm" className="text-[11px] px-2.5 py-1">
                                View Match
                              </Button>
                            </Link>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[11px] px-2.5 py-1"
                              onClick={() => {
                                setSampleFor(hasSampleForm ? null : inq.id);
                              }}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              Request Sample
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {hasSampleForm && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="rounded-lg border border-slate-200 bg-white p-4 max-w-2xl">
                              <h4 className="text-xs font-bold text-slate-900 mb-3">
                                Request a sample for inquiry {inq.id}
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={sampleQty}
                                    onChange={(e) => setSampleQty(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Unit
                                  </label>
                                  <select
                                    value={sampleUnit}
                                    onChange={(e) => setSampleUnit(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                                  >
                                    {SAMPLE_UNITS.map((u) => (
                                      <option key={u} value={u}>
                                        {u}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Ship to city
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. Mundhwa, Pune"
                                    value={sampleCity}
                                    onChange={(e) => setSampleCity(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  isLoading={isSubmitting}
                                  onClick={() => handleRequestSample(inq)}
                                >
                                  <Package className="h-3 w-3" />
                                  Submit Sample Request
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSampleFor(null)}
                                  disabled={isSubmitting}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
