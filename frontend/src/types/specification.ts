import { MaterialCategoryCode } from './material';

export type ConstraintType =
  | 'HARD_LIMIT'
  | 'PREFERRED_RANGE'
  | 'PROHIBITED_CONDITION'
  | 'REQUIRED_PROPERTY';

export type MissingDataPolicy =
  | 'HOLD'
  | 'MANUAL_REVIEW'
  | 'NOT_APPLICABLE_WITH_EVIDENCE';

export type SpecificationStatus = 'draft' | 'published' | 'archived';

export type SupplyFrequency = 'recurring_monthly' | 'recurring_weekly' | 'recurring_quarterly' | 'one_time_spot';

export interface SpecificationConstraint {
  id: string;
  property_definition_id?: string;
  property_name: string;
  constraint_type: ConstraintType;
  lower_bound?: number;
  upper_bound?: number;
  unit: string;
  required_evidence: boolean;
  missing_data_policy: MissingDataPolicy;
  tolerance_policy?: string;
  notes?: string;
}

export interface BuyerSpecification {
  id: string;
  buyer_organization_id: string;
  buyer_organization_name: string;
  receiving_facility_id: string;
  receiving_facility_name: string;
  receiving_facility_zone: string;
  target_category_code: MaterialCategoryCode;
  target_category_name: string;
  target_material_name: string;
  intended_use: string;
  specification_version: number;
  specification_status: SpecificationStatus;
  minimum_quantity: number;
  maximum_quantity?: number;
  quantity_unit: string;
  frequency: SupplyFrequency;
  max_distance_km: number;
  acceptable_preprocessing: string[];
  prohibited_contaminants_notes?: string;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
  constraints: SpecificationConstraint[];
  matched_listings_count?: number;
}

export interface SpecificationFormData {
  // Step 1: Material & Facility
  target_category_code: MaterialCategoryCode;
  target_material_name: string;
  intended_use: string;
  receiving_facility_id: string;
  receiving_facility_name: string;
  receiving_facility_zone: string;

  // Step 2: Demand & Logistics
  minimum_quantity: number;
  maximum_quantity?: number;
  quantity_unit: string;
  frequency: SupplyFrequency;
  max_distance_km: number;
  effective_from: string;
  effective_until?: string;

  // Step 3: Constraints
  constraints: SpecificationConstraint[];

  // Step 4: Preprocessing & Prohibitions
  acceptable_preprocessing: string[];
  prohibited_contaminants_notes: string;

  // Step 5: Status
  specification_status: SpecificationStatus;
}
