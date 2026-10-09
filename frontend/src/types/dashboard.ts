export type RegulatoryStatus = 'eligible' | 'on_hold' | 'ineligible';
export type ListingStatus = 'draft' | 'pending_review' | 'published' | 'paused' | 'archived';
export type InquiryStatus = 'submitted' | 'accepted' | 'declined' | 'sampling' | 'qualification' | 'completed';

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  helperText?: string;
}

export interface MaterialListingSummary {
  id: string;
  title: string;
  category: string;
  grade: string;
  quantity: number;
  unit: string;
  frequency: string;
  regulatory_status: RegulatoryStatus;
  listing_status: ListingStatus;
  test_report_verified: boolean;
  facility_name: string;
  created_at: string;
  potential_matches_count: number;
}

export interface BuyerSpecificationSummary {
  id: string;
  target_material: string;
  intended_application: string;
  required_volume: number;
  unit: string;
  max_distance_km: number;
  status: 'active' | 'draft' | 'fulfilled';
  matched_listings_count: number;
  updated_at: string;
}

export interface InquirySummary {
  id: string;
  reference_no: string;
  material_name: string;
  counterparty_org: string;
  status: InquiryStatus;
  requested_quantity: number;
  unit: string;
  date: string;
  last_message: string;
}

export interface ComplianceAlert {
  id: string;
  severity: 'high' | 'medium' | 'info';
  title: string;
  description: string;
  due_date?: string;
  action_required: string;
  affected_resource: string;
}

export interface AdminQueueItem {
  id: string;
  type: 'org_verification' | 'listing_approval' | 'compliance_hold';
  entity_name: string;
  submitted_by: string;
  submitted_at: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  notes?: string;
}
