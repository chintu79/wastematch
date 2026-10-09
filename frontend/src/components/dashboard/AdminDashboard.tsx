'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminQueueItem } from '@/types/dashboard';
import {
  ShieldAlert,
  Building,
  FileCheck2,
  Check,
  X,
  History,
  AlertTriangle,
  Scale,
} from 'lucide-react';

const QUEUE_ITEMS: AdminQueueItem[] = [
  {
    id: 'queue-1',
    type: 'org_verification',
    entity_name: 'Mahindra Sona Precision Ltd',
    submitted_by: 'Kiran Shinde (Director of Plant Operations)',
    submitted_at: '2026-10-08 14:22',
    status: 'pending',
    notes: 'Submitted MPCB Consent to Operate (Red Category) for Chakan MIDC facility.',
  },
  {
    id: 'queue-2',
    type: 'listing_approval',
    entity_name: 'Spent Hydrochloric Acid (Pickling Liquor)',
    submitted_by: 'Tata AutoComp Systems Ltd',
    submitted_at: '2026-10-09 08:45',
    status: 'pending',
    notes: 'Requires Schedule-IV hazardous waste recycling authorization check.',
  },
  {
    id: 'queue-3',
    type: 'compliance_hold',
    entity_name: 'ETP Sludge Lot #mat-002',
    submitted_by: 'System Regulatory Engine',
    submitted_at: '2026-10-07 18:00',
    status: 'in_review',
    notes: 'Flagged: NABL Leachate report is > 180 days old. Renewal required.',
  },
];

const AUDIT_LOGS = [
  {
    id: 'aud-1',
    actor: 'Dr. Vivek Sharma (Admin)',
    action: 'Approved Organization Registration',
    target: 'Bharat Forge Industrial Materials',
    timestamp: '2026-10-08 11:30 UTC',
  },
  {
    id: 'aud-2',
    actor: 'System Compliance Daemon',
    action: 'Enforced Compliance Hold (Missing TCLP)',
    target: 'Listing #mat-002 (ETP Sludge)',
    timestamp: '2026-10-07 18:00 UTC',
  },
  {
    id: 'aud-3',
    actor: 'Dr. Vivek Sharma (Admin)',
    action: 'Updated MPCB Rule Definition #WM-REG-2026-09',
    target: 'CPCB Foundry Sand Reuse Guidelines 2024',
    timestamp: '2026-10-05 16:15 UTC',
  },
];

export const AdminDashboard: React.FC = () => {
  const [queue, setQueue] = useState<AdminQueueItem[]>(QUEUE_ITEMS);

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );
  };

  const pendingCount = queue.filter((i) => i.status === 'pending' || i.status === 'in_review').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Regulatory Oversight & Audit</h1>
            <Badge variant="verified">MPCB Compliance Reviewer</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validate enterprise participants, examine hazardous waste authorizations, and enforce environmental law.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => alert('Download regulatory audit package')}>
            <Scale className="h-4 w-4" />
            <span>Generate Pilot Audit Report</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Reviews
              </span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{pendingCount}</span>
              <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Organizations & Listings in queue
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Verified Facilities
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <Building className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">42</span>
              <span className="text-xs text-slate-500 font-medium">units</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Across Bhosari, Chakan & Talegaon
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Regulatory Rules
              </span>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-lg">
                <FileCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">18</span>
              <span className="text-xs text-slate-500 font-medium">rules</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              CPCB Hazardous Waste Rules 2016
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                System Audit Health
              </span>
              <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                <ShieldAlert className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">100%</span>
              <span className="text-xs text-slate-500 font-medium">traceable</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Zero unverified match disclosures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Verification & Regulatory Clearance Queue</CardTitle>
              <CardDescription>
                Authorizations requiring explicit human compliance review before public platform exposure
              </CardDescription>
            </div>
            <Badge variant="on_hold">{pendingCount} Pending Decisions</Badge>
          </div>
        </CardHeader>

        <div className="divide-y divide-slate-100">
          {queue.map((item) => (
            <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{item.entity_name}</span>
                  <Badge
                    variant={
                      item.type === 'org_verification'
                        ? 'info'
                        : item.type === 'compliance_hold'
                        ? 'on_hold'
                        : 'pending'
                    }
                  >
                    {item.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <span className="text-[11px] text-slate-400">Submitted: {item.submitted_at}</span>
                </div>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Submitter:</span> {item.submitted_by}
                </p>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  {item.notes}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === 'pending' || item.status === 'in_review' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      onClick={() => handleAction(item.id, 'rejected')}
                    >
                      <X className="h-4 w-4 mr-1 text-rose-500" />
                      Reject / Hold
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAction(item.id, 'approved')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve & Verify
                    </Button>
                  </>
                ) : (
                  <Badge variant={item.status === 'approved' ? 'eligible' : 'ineligible'}>
                    DECISION: {item.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Audit Log Stream */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Platform Audit Trail (Immutable Log)</CardTitle>
              <CardDescription>
                Every privileged state transition, compliance override, and legal authorization is logged
              </CardDescription>
            </div>
            <History className="h-4 w-4 text-slate-400" />
          </div>
        </CardHeader>
        <div className="p-6">
          <div className="space-y-3">
            {AUDIT_LOGS.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Target: <span className="font-medium text-slate-800">{log.target}</span> • Actor: {log.actor}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
