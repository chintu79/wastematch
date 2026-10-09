export type UserRole = 
  | 'waste_supplier'      // Producer / Generator
  | 'buyer'               // Industrial Buyer
  | 'recycler'            // Processor / Recycler
  | 'platform_admin';     // Admin / Compliance Reviewer

export interface OrganizationAddress {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  industrial_zone?: string;
}

export interface Facility {
  id: string;
  name: string;
  facility_code: string;
  location: string;
  consent_number?: string;
  consent_valid_until?: string;
}

export interface Organization {
  id: string;
  name: string;
  organization_type: 'waste_generator' | 'buyer' | 'waste_processor' | 'recycler';
  registration_number?: string;
  verification_status: 'verified' | 'pending' | 'under_review' | 'rejected';
  address: OrganizationAddress;
  facilities: Facility[];
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  phone?: string;
  designation?: string;
  organization: Organization;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
