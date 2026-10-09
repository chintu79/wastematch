import { User, UserRole } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    request_id?: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; issue: string }>;
  };
}

export const DEMO_USERS: Record<UserRole, User> = {
  waste_supplier: {
    id: 'usr-prod-001',
    email: 'producer@tatacomponents.in',
    display_name: 'Rajesh Kulkarni',
    role: 'waste_supplier',
    designation: 'EHS & Sustainability Manager',
    phone: '+91 98220 12345',
    created_at: '2026-08-15T09:30:00Z',
    organization: {
      id: 'org-prod-001',
      name: 'Tata AutoComp Systems Ltd',
      organization_type: 'waste_generator',
      registration_number: 'CIN-L28920PN1995PLC089201',
      verification_status: 'verified',
      address: {
        line1: 'Plot No. 24, MIDC Bhosari Industrial Area',
        city: 'Pimpri-Chinchwad, Pune',
        state: 'Maharashtra',
        postal_code: '411026',
        country: 'India',
        industrial_zone: 'Bhosari MIDC',
      },
      facilities: [
        {
          id: 'fac-001',
          name: 'Plant 2 - Metal Casting & Stamping',
          facility_code: 'TAC-PCMC-02',
          location: 'Bhosari MIDC, Pune',
          consent_number: 'MPCB/RO-PUNE/CONSENT-2025/1109',
          consent_valid_until: '2027-03-31',
        },
        {
          id: 'fac-002',
          name: 'Plant 4 - Polymer Molding Unit',
          facility_code: 'TAC-CHAKAN-04',
          location: 'Chakan Phase II, Pune',
          consent_number: 'MPCB/RO-PUNE/CONSENT-2024/0988',
          consent_valid_until: '2026-12-31',
        },
      ],
    },
  },
  buyer: {
    id: 'usr-buy-002',
    email: 'buyer@bharatforge.com',
    display_name: 'Anjali Deshmukh',
    role: 'buyer',
    designation: 'Procurement Lead - Circular Feedstock',
    phone: '+91 97640 54321',
    created_at: '2026-07-20T11:00:00Z',
    organization: {
      id: 'org-buy-002',
      name: 'Bharat Forge Industrial Materials',
      organization_type: 'buyer',
      registration_number: 'CIN-L25209PN1961PLC012004',
      verification_status: 'verified',
      address: {
        line1: 'Mundhwa Industrial Estate',
        city: 'Pune',
        state: 'Maharashtra',
        postal_code: '411036',
        country: 'India',
        industrial_zone: 'Hadapsar / Mundhwa',
      },
      facilities: [
        {
          id: 'fac-101',
          name: 'Central Smelting & Secondary Foundry',
          facility_code: 'BF-FOUNDRY-01',
          location: 'Mundhwa, Pune',
          consent_number: 'MPCB/RO-PUNE/CONSENT-2025/4412',
          consent_valid_until: '2027-06-30',
        },
      ],
    },
  },
  recycler: {
    id: 'usr-rec-003',
    email: 'operations@ecorecycle.in',
    display_name: 'Suresh Patil',
    role: 'recycler',
    designation: 'Technical Operations Director',
    phone: '+91 98901 88776',
    created_at: '2026-06-10T08:15:00Z',
    organization: {
      id: 'org-rec-003',
      name: 'EcoRecycle Solutions Maharashtra',
      organization_type: 'recycler',
      registration_number: 'CIN-U38210PN2018PTC178922',
      verification_status: 'verified',
      address: {
        line1: 'Plot G-12, Chakan Industrial Area Phase 3',
        city: 'Chakan, Pune',
        state: 'Maharashtra',
        postal_code: '410501',
        country: 'India',
        industrial_zone: 'Chakan Phase III',
      },
      facilities: [
        {
          id: 'fac-201',
          name: 'Resource Recovery & Preprocessing Facility',
          facility_code: 'ERS-RECOVERY-01',
          location: 'Chakan Phase III, Pune',
          consent_number: 'MPCB/RO-PUNE/HW-AUTH-2025/3301',
          consent_valid_until: '2028-01-31',
        },
      ],
    },
  },
  platform_admin: {
    id: 'usr-adm-004',
    email: 'admin@mpcb-audit.gov.in',
    display_name: 'Dr. Vivek Sharma',
    role: 'platform_admin',
    designation: 'Lead Regulatory Review Officer',
    phone: '+91 94220 99887',
    created_at: '2026-01-05T10:00:00Z',
    organization: {
      id: 'org-adm-000',
      name: 'WasteMatch PCMC Regulatory Council',
      organization_type: 'waste_processor',
      registration_number: 'GOV-MH-ENV-2026',
      verification_status: 'verified',
      address: {
        line1: 'Environment & Industrial Safety Wing, PCMC HQ',
        city: 'Pimpri-Chinchwad, Pune',
        state: 'Maharashtra',
        postal_code: '411018',
        country: 'India',
        industrial_zone: 'PCMC Administrative Complex',
      },
      facilities: [
        {
          id: 'fac-999',
          name: 'State Environmental Audit & Testing Cell',
          facility_code: 'MPCB-PUNE-CENTRAL',
          location: 'Pimpri-Chinchwad, Pune',
        },
      ],
    },
  },
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('wm_auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw {
        status: res.status,
        error: errorJson.error || {
          code: 'REQUEST_FAILED',
          message: `Request failed with status ${res.status}`,
        },
      };
    }

    const json = await res.json();
    return json.data ?? json;
  } catch (err: unknown) {
    throw err;
  }
}

export const specificationsApi = {
  list: async () => apiRequest<any[]>('/specifications/'),
  getById: async (id: string) => apiRequest<any>(`/specifications/${id}`),
  create: async (payload: any) =>
    apiRequest<any>('/specifications/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createConstraint: async (specId: string, payload: any) =>
    apiRequest<any>(`/specifications/${specId}/constraints`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

