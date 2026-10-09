// Types mirroring the backend API contract (backend/app/schemas.py).
// Kept separate from the UI-level demo types in types/dashboard.ts.

export type TechnicalStatus =
  | 'COMPATIBLE'
  | 'INCOMPATIBLE'
  | 'NEEDS_TREATMENT'
  | 'MISSING_DATA';

export type ApiInquiryStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'QUALIFIED'
  | 'REJECTED'
  | 'CLOSED';

export type SampleRequestStatus =
  | 'REQUESTED'
  | 'SHIPPED'
  | 'RECEIVED'
  | 'TESTING'
  | 'COMPLETED';

/**
 * Match evaluation record returned by GET /api/v1/matches.
 * `explanation`, `missing_fields`, `failed_constraints` and
 * `treatment_requirements` are free-form JSON on the backend.
 */
export interface MatchEvaluation {
  id: string;
  candidate_id: string;
  material_batch_id: string;
  buyer_specification_id: string;
  regulatory_evaluation_id?: string | null;
  technical_status: TechnicalStatus;
  compatibility_score?: number | null;
  ranking_score?: number | null;
  missing_fields?: Record<string, unknown> | null;
  failed_constraints?: Record<string, unknown> | null;
  treatment_requirements?: Record<string, unknown> | null;
  explanation?: Record<string, unknown> | null;
  matching_algorithm_version: string;
  evaluated_at: string;
}

/** Inquiry record returned by GET /api/v1/inquiries. */
export interface Inquiry {
  id: string;
  match_id: string;
  buyer_organization_id: string;
  producer_organization_id: string;
  inquiry_status: ApiInquiryStatus;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for POST /api/v1/inquiries. */
export interface InquiryCreate {
  match_id: string;
  buyer_organization_id: string;
  producer_organization_id: string;
}

/** Payload for POST /api/v1/inquiries/{id}/sample-requests. */
export interface SampleRequestCreate {
  inquiry_id: string;
  quantity_requested: number;
  quantity_unit: string;
  shipping_address: Record<string, unknown>;
}
