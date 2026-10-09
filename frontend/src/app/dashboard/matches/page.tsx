'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(
  () => import('@/components/dashboard/InteractiveMap'),
  { ssr: false, loading: () => <div className="h-[600px] w-full animate-pulse bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">Loading map...</div> }
);

import { useAuth } from '@/context/AuthContext';
import {
  getStoredMatches,
  getBatchLabel,
  getSpecLabel,
  addStoredInquiry,
  shortenId,
} from '@/lib/matchData';
import { MatchEvaluation, TechnicalStatus } from '@/types/match';
import {
  Sparkles,
  Search,
  GitCompare,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  FileText,
  Send,
  WifiOff,
  RefreshCw,
  MapPin,
  Map,
  List,
} from 'lucide-react';

import { StatusBadge } from '@/components/marketplace/StatusBadge';
import { EmptyState } from '@/components/marketplace/EmptyState';
import { Skeleton } from '@/components/marketplace/Skeleton';

const PRODUCER_ORGS = [
  { id: 'org-prod-001', name: 'Tata AutoComp Systems Ltd' },
  { id: 'org-rec-003', name: 'EcoRecycle Solutions Maharashtra' },
];

interface Toast {
  kind: 'success' | 'error';
  message: string;
}

function renderDetailMap(title: string, data: Record<string, unknown> | null | undefined) {
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div>
      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
        {title}
      </h5>
      <ul className="space-y-1">
        {Object.entries(data).map(([key, value]) => (
          <li key={key} className="text-xs text-slate-700 flex gap-2">
            <span className="font-semibold text-slate-800 shrink-0">{key}:</span>
            <span className="text-slate-600">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | TechnicalStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inquiryFor, setInquiryFor] = useState<string | null>(null);
  const [producerOrgId, setProducerOrgId] = useState(PRODUCER_ORGS[0].id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const notify = (kind: Toast['kind'], message: string) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Pure loader with no setState; safe to call from effects and handlers.
  const fetchMatchesData = async (): Promise<{
    data: MatchEvaluation[];
    offline: boolean;
  }> => {
    try {
      const data = await apiRequest<MatchEvaluation[]>('/matches/');
      return { data, offline: false };
    } catch {
      // Backend unreachable or not seeded: fall back to the bundled sample
      // dataset so the UI stays demonstrable.
      return { data: getStoredMatches(), offline: true };
    }
  };

  const applyMatches = (data: MatchEvaluation[], offline: boolean) => {
    setMatches(data);
    setIsOffline(offline);
    setIsLoading(false);
  };

  const loadMatches = () => {
    fetchMatchesData().then(({ data, offline }) => applyMatches(data, offline));
  };

  useEffect(() => {
    let mounted = true;
    fetchMatchesData().then(({ data, offline }) => {
      if (!mounted) return;
      setMatches(data);
      setIsOffline(offline);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSendInquiry = async (match: MatchEvaluation) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await apiRequest('/inquiries/', {
        method: 'POST',
        body: JSON.stringify({
          match_id: match.id,
          buyer_organization_id: user.organization.id,
          producer_organization_id: producerOrgId,
        }),
      });
      notify('success', `Inquiry sent for match ${shortenId(match.id)}.`);
    } catch {
      addStoredInquiry({
        match_id: match.id,
        buyer_organization_id: user.organization.id,
        producer_organization_id: producerOrgId,
        rejection_reason: null,
      });
      notify(
        'success',
        `Inquiry recorded locally for match ${shortenId(match.id)} (backend offline).`
      );
    } finally {
      setIsSubmitting(false);
      setInquiryFor(null);
    }
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const matchesStatus = statusFilter === 'ALL' || m.technical_status === statusFilter;
      const batch = getBatchLabel(m.material_batch_id);
      const spec = getSpecLabel(m.buyer_specification_id);
      const haystack =
        `${batch.title} ${batch.counterparty} ${spec.target_material} ${spec.organization} ${m.id}`.toLowerCase();
      const matchesSearch = haystack.includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [matches, statusFilter, searchQuery]);

  const compatibleCount = matches.filter((m) => m.technical_status === 'COMPATIBLE').length;
  const scored = matches.filter((m) => m.compatibility_score != null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, m) => sum + (m.compatibility_score ?? 0), 0) / scored.length)
    : 0;
  const actionRequired = matches.filter(
    (m) => m.technical_status === 'NEEDS_TREATMENT' || m.technical_status === 'MISSING_DATA'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Recommended Matches
            </h1>
            <span className="text-xs font-semibold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
              {matches.length} Evaluations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compatibility evaluations between material batches and buyer specifications, with
            full explanations for every verdict.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              Map
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              loadMatches();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Offline / demo-data notice */}
      {isOffline && !isLoading && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-amber-950 flex items-center gap-2 shadow-2xs">
          <WifiOff className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-xs font-medium">
            Backend API is unreachable - showing bundled sample evaluations. Start the API with{' '}
            <code className="font-mono bg-amber-100 px-1 rounded">docker compose up api</code> to
            load live matches.
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

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Compatible Matches
              </p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {compatibleCount}{' '}
                <span className="text-xs font-medium text-slate-500">Ready to Engage</span>
              </p>
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
                Avg. Compatibility
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {avgScore}
                <span className="text-xs font-medium text-slate-500">%</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <GitCompare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Need Attention
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {actionRequired}{' '}
                <span className="text-xs font-medium text-slate-500">Treatment / Data Gaps</span>
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <AlertCircle className="h-5 w-5" />
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
                placeholder="Search by material, buyer specification, organization, or match ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
              />
            </div>
            <div className="w-full md:w-52">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | TechnicalStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
              >
                <option value="ALL">All Verdicts</option>
                <option value="COMPATIBLE">Compatible</option>
                <option value="NEEDS_TREATMENT">Needs Treatment</option>
                <option value="INCOMPATIBLE">Incompatible</option>
                <option value="MISSING_DATA">Missing Data</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches view */}
      {viewMode === 'map' ? (
        <InteractiveMap
          matches={filteredMatches}
          getBatchLabel={getBatchLabel}
          getSpecLabel={getSpecLabel}
          onSendInquiry={(match) => { setInquiryFor(match.id); setViewMode('list'); }}
        />
      ) : (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Match Evaluations ({filteredMatches.length})</CardTitle>
            <CardDescription>
              Expand a row to read the full evaluation explanation, constraints, and required
              treatments
            </CardDescription>
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : filteredMatches.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No matching evaluations found"
            description="Try adjusting the verdict filter or search query. New evaluations appear here once the matching engine runs against published listings."
            actionLabel="Clear Filters"
            actionOnClick={() => { setStatusFilter('ALL'); setSearchQuery(''); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Material -&gt; Buyer Requirement</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Compatibility</th>
                  <th className="px-4 py-3">Evaluated</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatches.map((match) => {
                  const batch = getBatchLabel(match.material_batch_id);
                  const spec = getSpecLabel(match.buyer_specification_id);
                  
                  const isExpanded = expandedId === match.id;
                  const hasInquiryForm = inquiryFor === match.id;

                  return (
                    <React.Fragment key={match.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{batch.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {batch.volume} - offered by{' '}
                            <span className="font-medium text-slate-700">{batch.counterparty}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{batch.location}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            <span className="font-medium text-slate-700">
                              {spec.target_material}
                            </span>{' '}
                            for {spec.organization}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge type="technical" status={match.technical_status} />
                        </td>
                        <td className="px-4 py-4">
                          {match.compatibility_score != null ? (
                            <div className="w-28">
                              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                                <span>{match.compatibility_score}%</span>
                                {match.ranking_score != null && (
                                  <span className="text-slate-400">
                                    rank {match.ranking_score}
                                  </span>
                                )}
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    match.compatibility_score >= 80
                                      ? 'bg-emerald-500'
                                      : match.compatibility_score >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${match.compatibility_score}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Not scored yet</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-[11px] text-slate-500">
                          {new Date(match.evaluated_at).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                          <div className="text-slate-400 mt-0.5">
                            algo v{match.matching_algorithm_version}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-[11px] px-2.5 py-1"
                              onClick={() => {
                                setExpandedId(isExpanded ? null : match.id);
                                setInquiryFor(null);
                              }}
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Explanation
                              <ChevronDown
                                className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-[11px] px-2.5 py-1"
                              onClick={() => {
                                setInquiryFor(hasInquiryForm ? null : match.id);
                                setExpandedId(null);
                              }}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Request info
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Inline inquiry form */}
                      {hasInquiryForm && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="rounded-lg border border-slate-200 bg-white p-4 max-w-2xl">
                              <h4 className="text-xs font-bold text-slate-900 mb-3">
                                Request information
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Buyer organization (you)
                                  </label>
                                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                                    {user?.organization?.name ?? '—'}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Producer organization
                                  </label>
                                  <select
                                    value={producerOrgId}
                                    onChange={(e) => setProducerOrgId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                                  >
                                    {PRODUCER_ORGS.map((org) => (
                                      <option key={org.id} value={org.id}>
                                        {org.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  isLoading={isSubmitting}
                                  onClick={() => handleSendInquiry(match)}
                                >
                                  <Send className="h-3 w-3" />
                                  Request info
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setInquiryFor(null)}
                                  disabled={isSubmitting}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expandable explanation panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
                              <div>
                                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                                  Explanation
                                </h5>
                                {match.explanation?.reason ? (
                                  <p className="text-xs font-semibold text-slate-800">
                                    {String(match.explanation.reason)}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">
                                    No explanation provided by the matching engine.
                                  </p>
                                )}
                                {match.explanation?.summary ? (
                                  <p className="text-xs text-slate-600 mt-1">
                                    {String(match.explanation.summary)}
                                  </p>
                                ) : null}
                                {Array.isArray(match.explanation?.matched_constraints) && (
                                  <ul className="mt-2 space-y-1">
                                    {(match.explanation.matched_constraints as string[]).map(
                                      (c, i) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-1.5 text-xs text-slate-700"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                          <span>{c}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                                {match.explanation?.notes ? (
                                  <p className="text-[11px] text-slate-500 mt-2">
                                    {String(match.explanation.notes)}
                                  </p>
                                ) : null}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderDetailMap('Missing Fields', match.missing_fields)}
                                {renderDetailMap('Failed Constraints', match.failed_constraints)}
                                {renderDetailMap(
                                  'Treatment Requirements',
                                  match.treatment_requirements
                                )}
                              </div>

                              <div className="text-[11px] text-slate-400 font-mono border-t border-slate-100 pt-2">
                                match_id: {match.id} | candidate: {match.candidate_id} | batch:{' '}
                                {shortenId(match.material_batch_id)} | spec:{' '}
                                {shortenId(match.buyer_specification_id)}
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
      )}
    </div>
  );
}
