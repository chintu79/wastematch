import { RegulatoryStatus, ListingStatus } from './dashboard';

export type MaterialCategoryCode =
  | 'INDUSTRIAL_MINERAL'
  | 'PLASTIC'
  | 'METAL'
  | 'CHEMICAL'
  | 'SLUDGE'
  | 'ORGANIC'
  | 'OTHER';

export interface PropertyDefinition {
  id: string;
  name: string;
  unit: string;
  datatype: 'number' | 'text' | 'boolean';
  description?: string;
  is_mandatory?: boolean;
}

export interface MaterialMeasurement {
  id: string;
  property_name: string;
  value: string | number;
  unit: string;
  basis: 'as_received' | 'dry_weight' | 'normalized';
  measurement_date: string;
  laboratory_name?: string;
  nabl_accredited: boolean;
  test_method?: string;
  is_verified: boolean;
}

export interface EvidenceDocument {
  id: string;
  title: string;
  document_type: 'lab_test_report' | 'msds' | 'mpcb_consent' | 'manifest_form' | 'photograph';
  file_name: string;
  file_size?: string;
  issue_date: string;
  expiry_date?: string;
  issuing_authority: string;
  nabl_accreditation_no?: string;
  is_verified: boolean;
  download_url?: string;
}

export interface MaterialBatch {
  id: string;
  batch_reference: string;
  quantity: number;
  unit: string;
  available_from: string;
  available_until?: string;
  status: 'available' | 'reserved' | 'in_qualification' | 'dispatched';
  measurements: MaterialMeasurement[];
  documents: EvidenceDocument[];
}

export interface MaterialListing {
  id: string;
  organization_id: string;
  organization_name: string;
  facility_id: string;
  facility_name: string;
  facility_zone: string;
  category_code: MaterialCategoryCode;
  category_name: string;
  title: string;
  grade: string;
  description: string;
  source_process: string;
  prior_contaminants?: string;
  availability_type: 'recurring_monthly' | 'recurring_weekly' | 'one_time_lot';
  total_volume: number;
  unit: string;
  regulatory_status: RegulatoryStatus;
  regulatory_notes?: string;
  listing_status: ListingStatus;
  visibility: 'marketplace' | 'restricted' | 'private';
  created_at: string;
  updated_at: string;
  batches: MaterialBatch[];
  candidate_buyers_count: number;
  price_per_unit?: number;
  price_display?: string;
  distance_km?: number;
  tags?: string[];
}

export type SortOption =
  | 'relevance'
  | 'recent'
  | 'quantity_desc'
  | 'quantity_asc'
  | 'distance'
  | 'price_asc'
  | 'price_desc';

export interface FilterState {
  query: string;
  category: string;
  location: string;
  maxDistanceKm: number | null;
  minQuantity: number | null;
  maxQuantity: number | null;
  availabilityType: 'ALL' | 'recurring_monthly' | 'recurring_weekly' | 'one_time_lot';
  pricingModel: 'ALL' | 'fixed_price' | 'quote_only';
  verifiedOnly: boolean;
  regulatoryEligibleOnly: boolean;
  technicalFilters: Record<string, string>;
}

export interface ListingFormData {
  // Step 1: Identity
  category_code: MaterialCategoryCode;
  title: string;
  grade: string;
  description: string;
  source_process: string;
  prior_contaminants: string;

  // Step 2: Quantity & Facility
  facility_id: string;
  facility_name: string;
  facility_zone: string;
  availability_type: 'recurring_monthly' | 'recurring_weekly' | 'one_time_lot';
  quantity: number;
  unit: string;
  batch_reference: string;
  available_from: string;
  available_until: string;

  // Step 3: Properties
  measurements: MaterialMeasurement[];

  // Step 4: Documents
  documents: EvidenceDocument[];

  // Step 5: Visibility & Status
  visibility: 'marketplace' | 'restricted' | 'private';
  status: ListingStatus;
}
