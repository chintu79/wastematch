// Sample dataset for the Matches & Inquiries UI (Issue #12).
// Used as a fallback when the backend API is unreachable so the pages
// remain demonstrable; when the API responds, live data takes priority.

import { MatchEvaluation, Inquiry } from '@/types/match';

export interface BatchLabel {
  title: string;
  counterparty: string;
  location: string;
  volume: string;
}

export interface SpecLabel {
  target_material: string;
  organization: string;
  application: string;
}

const DEMO_MATCHES: MatchEvaluation[] = [
  {
    id: '8f14e45f-ceea-467f-a1d6-1c8f9dd2b1a1',
    candidate_id: 'cnd-801',
    material_batch_id: 'bat-silica-001',
    buyer_specification_id: 'spec-foundry-silica',
    technical_status: 'COMPATIBLE',
    compatibility_score: 94,
    ranking_score: 91,
    missing_fields: null,
    failed_constraints: null,
    treatment_requirements: null,
    explanation: {
      reason: 'Batch meets all 4 hard constraints of the buyer specification.',
      summary:
        'SiO2 purity, LOI and grain fineness are inside the required ranges; distance from the Bhosari plant is within the 50 km limit.',
      matched_constraints: [
        'SiO2 purity 96.4% (min 95%)',
        'Loss on Ignition 1.8% (max 2.5%)',
        'Grain fineness 52 AFS (range 48-58 AFS)',
        'Distance 18 km (max 50 km)',
      ],
      notes: 'MPCB consent to operate is valid until 2027-03-31.',
    },
    matching_algorithm_version: '1.0',
    evaluated_at: '2026-10-08T09:15:00Z',
  },
  {
    id: 'a3bb1b2c-6d4e-4c1a-9b7e-2d5f8e0c4a72',
    candidate_id: 'cnd-802',
    material_batch_id: 'bat-pp-regrind-014',
    buyer_specification_id: 'spec-pp-regrind',
    technical_status: 'COMPATIBLE',
    compatibility_score: 88,
    ranking_score: 86,
    missing_fields: null,
    failed_constraints: null,
    treatment_requirements: {
      drying: 'Pre-dry to <0.1% moisture before injection molding.',
    },
    explanation: {
      reason: 'Hard constraints satisfied; MFI sits inside the preferred operating range.',
      summary:
        'Recycled PP flakes from Chakan match the melt-flow and moisture requirements for HVAC duct housing injection.',
      matched_constraints: [
        'Melt Flow Index 12 g/10min (range 10-14)',
        'Moisture 0.04% (max 0.1%)',
      ],
      notes: 'A single drying step is recommended before processing.',
    },
    matching_algorithm_version: '1.0',
    evaluated_at: '2026-10-08T11:42:00Z',
  },
  {
    id: 'b7d2c9a4-1e58-4f3b-8a26-70c1d9e5f338',
    candidate_id: 'cnd-803',
    material_batch_id: 'bat-slag-ggbs-007',
    buyer_specification_id: 'spec-ggbs-binder',
    technical_status: 'NEEDS_TREATMENT',
    compatibility_score: 71,
    ranking_score: 68,
    missing_fields: null,
    failed_constraints: {
      'Free moisture': 'Measured 1.4%, maximum allowed 1.0%',
    },
    treatment_requirements: {
      drying: 'Wind-row drying or thermal drying required to bring moisture under 1%.',
      grinding: 'Granule size must be reduced below 5 mm after drying.',
    },
    explanation: {
      reason: 'Chemical composition qualifies, but moisture exceeds the hard limit.',
      summary:
        'Slag chemistry (Blaine fineness, C3A equivalence) is suitable; mechanical drying and grinding would make the batch fully compliant.',
      notes: 'Re-evaluate after treatment to upgrade the match to COMPATIBLE.',
    },
    matching_algorithm_version: '1.0',
    evaluated_at: '2026-10-08T14:05:00Z',
  },
  {
    id: 'c4e8f0d2-9a6b-4c7d-8e1f-3b5a2c9d7e64',
    candidate_id: 'cnd-804',
    material_batch_id: 'bat-etp-cake-003',
    buyer_specification_id: 'spec-cement-kiln-fuel',
    technical_status: 'MISSING_DATA',
    compatibility_score: null,
    ranking_score: null,
    missing_fields: {
      calorific_value: 'Higher heating value (HHV) required by the buyer specification.',
      heavy_metals: 'Leachate test (TCLP) for Cd, Pb, Cr is not available for this batch.',
    },
    failed_constraints: null,
    treatment_requirements: null,
    explanation: {
      reason: 'Evaluation paused: required laboratory evidence is missing.',
      summary:
        'The buyer specification for co-processing requires HHV and TCLP heavy-metal results before a compatibility verdict can be issued.',
    },
    matching_algorithm_version: '1.0',
    evaluated_at: '2026-10-09T08:20:00Z',
  },
];

const DEMO_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-501',
    match_id: '8f14e45f-ceea-467f-a1d6-1c8f9dd2b1a1',
    buyer_organization_id: 'org-buy-002',
    producer_organization_id: 'org-prod-001',
    inquiry_status: 'IN_PROGRESS',
    rejection_reason: null,
    created_at: '2026-10-08T12:10:00Z',
    updated_at: '2026-10-09T06:30:00Z',
  },
  {
    id: 'inq-502',
    match_id: 'a3bb1b2c-6d4e-4c1a-9b7e-2d5f8e0c4a72',
    buyer_organization_id: 'org-buy-002',
    producer_organization_id: 'org-rec-003',
    inquiry_status: 'QUALIFIED',
    rejection_reason: null,
    created_at: '2026-10-07T09:45:00Z',
    updated_at: '2026-10-08T17:05:00Z',
  },
  {
    id: 'inq-503',
    match_id: 'b7d2c9a4-1e58-4f3b-8a26-70c1d9e5f338',
    buyer_organization_id: 'org-buy-002',
    producer_organization_id: 'org-prod-001',
    inquiry_status: 'OPEN',
    rejection_reason: null,
    created_at: '2026-10-09T07:55:00Z',
    updated_at: '2026-10-09T07:55:00Z',
  },
  {
    id: 'inq-504',
    match_id: 'c4e8f0d2-9a6b-4c7d-8e1f-3b5a2c9d7e64',
    buyer_organization_id: 'org-buy-002',
    producer_organization_id: 'org-prod-001',
    inquiry_status: 'REJECTED',
    rejection_reason: 'Leachate test reports unavailable for the requested quantity.',
    created_at: '2026-10-06T15:30:00Z',
    updated_at: '2026-10-07T10:12:00Z',
  },
];

// Human-readable labels for demo entities; live API records fall back to
// shortened UUIDs in the UI.
const DEMO_BATCH_LABELS: Record<string, BatchLabel> = {
  'bat-silica-001': {
    title: 'Foundry Waste Silica Sand (Phenolic Resin Bound)',
    counterparty: 'Tata AutoComp Systems Ltd',
    location: 'Bhosari MIDC, Pune',
    volume: '120 MT/month',
  },
  'bat-pp-regrind-014': {
    title: 'PP Industrial Regrind White Pellets',
    counterparty: 'EcoRecycle Solutions Maharashtra',
    location: 'Chakan Phase III, Pune',
    volume: '35 MT',
  },
  'bat-slag-ggbs-007': {
    title: 'Blast Furnace Granulated Slag',
    counterparty: 'Tata AutoComp Systems Ltd',
    location: 'Bhosari MIDC, Pune',
    volume: '250 MT/quarter',
  },
  'bat-etp-cake-003': {
    title: 'Neutralized Dewatered ETP Cake',
    counterparty: 'Tata AutoComp Systems Ltd',
    location: 'Bhosari MIDC, Pune',
    volume: '18 MT',
  },
};

const DEMO_SPEC_LABELS: Record<string, SpecLabel> = {
  'spec-foundry-silica': {
    target_material: 'Secondary Foundry Silica Sand',
    organization: 'Bharat Forge Industrial Materials',
    application: 'Core Making & Green Sand Mold Replenishment',
  },
  'spec-pp-regrind': {
    target_material: 'Recycled Polypropylene (PP Flakes)',
    organization: 'Bharat Forge Industrial Materials',
    application: 'Automotive HVAC Duct Housing Injection',
  },
  'spec-ggbs-binder': {
    target_material: 'Granulated Blast Furnace Slag (GGBS)',
    organization: 'Bharat Forge Industrial Materials',
    application: 'Composite Pozzolanic Binder Replacement',
  },
  'spec-cement-kiln-fuel': {
    target_material: 'Alternative Kiln Fuel (RDF precursor)',
    organization: 'Maharashtra Cement Works',
    application: 'Clinker kiln co-processing',
  },
};

const DEMO_ORG_NAMES: Record<string, string> = {
  'org-prod-001': 'Tata AutoComp Systems Ltd',
  'org-buy-002': 'Bharat Forge Industrial Materials',
  'org-rec-003': 'EcoRecycle Solutions Maharashtra',
  'org-adm-000': 'WasteMatch PCMC Regulatory Council',
};

let inMemoryInquiries: Inquiry[] | null = null;

export function getStoredMatches(): MatchEvaluation[] {
  return [...DEMO_MATCHES];
}

export function getStoredInquiries(): Inquiry[] {
  if (!inMemoryInquiries) {
    inMemoryInquiries = [...DEMO_INQUIRIES];
  }
  return [...inMemoryInquiries];
}

/** Record a newly created inquiry in the local demo dataset. */
export function addStoredInquiry(
  inquiry: Omit<Inquiry, 'id' | 'inquiry_status' | 'created_at' | 'updated_at'>
): Inquiry {
  if (!inMemoryInquiries) {
    inMemoryInquiries = [...DEMO_INQUIRIES];
  }
  const created: Inquiry = {
    ...inquiry,
    id: `inq-${Math.random().toString(36).slice(2, 8)}`,
    inquiry_status: 'OPEN',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryInquiries = [created, ...inMemoryInquiries];
  return created;
}

export function shortenId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

export function getBatchLabel(id: string): BatchLabel {
  return (
    DEMO_BATCH_LABELS[id] ?? {
      title: `Material batch ${shortenId(id)}`,
      counterparty: 'Unknown producer',
      location: '—',
      volume: '—',
    }
  );
}

export function getSpecLabel(id: string): SpecLabel {
  return (
    DEMO_SPEC_LABELS[id] ?? {
      target_material: `Buyer specification ${shortenId(id)}`,
      organization: 'Unknown buyer',
      application: '—',
    }
  );
}

export function getOrgName(id: string): string {
  return DEMO_ORG_NAMES[id] ?? shortenId(id);
}
