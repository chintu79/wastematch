import { MaterialListing, MaterialCategoryCode, PropertyDefinition, ListingFormData } from '@/types/material';

export const MATERIAL_CATEGORIES: Array<{ code: MaterialCategoryCode; label: string; description: string }> = [
  {
    code: 'INDUSTRIAL_MINERAL',
    label: 'Industrial Minerals & Foundry Byproducts',
    description: 'Foundry waste silica sand, fly ash, slag, refractory offcuts',
  },
  {
    code: 'PLASTIC',
    label: 'Thermoplastics & Industrial Polymers',
    description: 'Post-industrial regrind, runners, rejected moldings (PP, PE, ABS, Nylon)',
  },
  {
    code: 'SLUDGE',
    label: 'Industrial Sludge & Neutralized Solids',
    description: 'Dewatered ETP cake, phosphating sludge, biological clarifier solids',
  },
  {
    code: 'CHEMICAL',
    label: 'Spent Chemicals & Process Liquors',
    description: 'Pickling spent hydrochloric acid, solvent wash, stripper solutions',
  },
  {
    code: 'METAL',
    label: 'Non-Ferrous & Ferrous Metal Residues',
    description: 'Aluminium dross, brass swarf, mill scale, machining turnings',
  },
  {
    code: 'ORGANIC',
    label: 'Agro & Biomass Residues',
    description: 'Spent grain, bagasse, agricultural processing rejects',
  },
  {
    code: 'OTHER',
    label: 'Other Controlled Industrial Residues',
    description: 'Speciality manufacturing byproducts and composite scraps',
  },
];

export const CATEGORY_DEFAULT_PROPERTIES: Record<MaterialCategoryCode, PropertyDefinition[]> = {
  INDUSTRIAL_MINERAL: [
    { id: 'p1', name: 'Silicon Dioxide (SiO2) Purity', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p2', name: 'Loss on Ignition (LOI @ 950°C)', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p3', name: 'Grain Fineness Number (AFS)', unit: 'AFS', datatype: 'number', is_mandatory: true },
    { id: 'p4', name: 'Moisture Content', unit: '%', datatype: 'number', is_mandatory: false },
    { id: 'p5', name: 'Clay & Active Binder Substance', unit: '%', datatype: 'number', is_mandatory: false },
  ],
  PLASTIC: [
    { id: 'p6', name: 'Melt Flow Index (MFI @ 230°C/2.16kg)', unit: 'g/10min', datatype: 'number', is_mandatory: true },
    { id: 'p7', name: 'Moisture Content', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p8', name: 'Density', unit: 'g/cm³', datatype: 'number', is_mandatory: false },
    { id: 'p9', name: 'Filler / Ash Content', unit: '%', datatype: 'number', is_mandatory: false },
  ],
  SLUDGE: [
    { id: 'p10', name: 'Moisture Content (Dewatered Cake)', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p11', name: 'pH of 10% Aqueous Slurry', unit: 'pH', datatype: 'number', is_mandatory: true },
    { id: 'p12', name: 'TCLP Heavy Metals Leaching (Cr/Ni/Pb)', unit: 'mg/L', datatype: 'number', is_mandatory: true },
    { id: 'p13', name: 'Calorific Value (if organo-chemical)', unit: 'kcal/kg', datatype: 'number', is_mandatory: false },
  ],
  CHEMICAL: [
    { id: 'p14', name: 'Free Acid Concentration (HCl / H2SO4)', unit: '% w/w', datatype: 'number', is_mandatory: true },
    { id: 'p15', name: 'Dissolved Ferrous Iron (Fe²⁺) Content', unit: 'g/L', datatype: 'number', is_mandatory: true },
    { id: 'p16', name: 'Specific Gravity @ 25°C', unit: 'g/mL', datatype: 'number', is_mandatory: false },
    { id: 'p17', name: 'Suspended Solids / Heavy Residues', unit: 'ppm', datatype: 'number', is_mandatory: false },
  ],
  METAL: [
    { id: 'p18', name: 'Primary Metal Purity (Assay)', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p19', name: 'Oil & Coolant Contamination', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p20', name: 'Oxide / Dross Skin Content', unit: '%', datatype: 'number', is_mandatory: false },
  ],
  ORGANIC: [
    { id: 'p21', name: 'Moisture Content', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p22', name: 'Organic Carbon / Volatile Solids', unit: '%', datatype: 'number', is_mandatory: true },
  ],
  OTHER: [
    { id: 'p23', name: 'Primary Assay / Active Substance', unit: '%', datatype: 'number', is_mandatory: true },
    { id: 'p24', name: 'Moisture / Water Content', unit: '%', datatype: 'number', is_mandatory: false },
  ],
};

const SEED_LISTINGS: MaterialListing[] = [
  {
    id: 'mat-001',
    organization_id: 'org-prod-001',
    organization_name: 'Tata AutoComp Systems Ltd',
    facility_id: 'fac-001',
    facility_name: 'Plant 2 - Metal Casting & Stamping',
    facility_zone: 'Bhosari MIDC, Pune',
    category_code: 'INDUSTRIAL_MINERAL',
    category_name: 'Industrial Minerals & Foundry Byproducts',
    title: 'Foundry Waste Silica Sand (Phenolic Resin Bound)',
    grade: 'Grade-A Secondary Casting Sand',
    description: 'Uniformly graded quartz silica sand discharged from green sand / phenolic resin mold shakeout after magnetic iron separation.',
    source_process: 'Automotive Engine Casting Shakeout & Magnetic Separation',
    prior_contaminants: 'Phenolic binder trace < 1.2%, free iron < 0.1%',
    availability_type: 'recurring_monthly',
    total_volume: 120,
    unit: 'MT/month',
    regulatory_status: 'eligible',
    regulatory_notes: 'Compliant with CPCB Foundry Sand Reutilization Guidelines 2024 and MPCB authorization.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-09-28T10:00:00Z',
    updated_at: '2026-10-08T14:30:00Z',
    candidate_buyers_count: 5,
    batches: [
      {
        id: 'batch-tac-01',
        batch_reference: 'TAC-FS-2026-OCT',
        quantity: 120,
        unit: 'MT',
        available_from: '2026-10-01',
        available_until: '2026-10-31',
        status: 'available',
        measurements: [
          {
            id: 'm1',
            property_name: 'Silicon Dioxide (SiO2) Purity',
            value: 96.4,
            unit: '%',
            basis: 'dry_weight',
            measurement_date: '2026-09-25',
            laboratory_name: 'Choksi NABL Laboratories Pune',
            nabl_accredited: true,
            test_method: 'IS 1918 / XRF',
            is_verified: true,
          },
          {
            id: 'm2',
            property_name: 'Loss on Ignition (LOI @ 950°C)',
            value: 1.8,
            unit: '%',
            basis: 'dry_weight',
            measurement_date: '2026-09-25',
            laboratory_name: 'Choksi NABL Laboratories Pune',
            nabl_accredited: true,
            test_method: 'ASTM C114',
            is_verified: true,
          },
          {
            id: 'm3',
            property_name: 'Grain Fineness Number (AFS)',
            value: 52,
            unit: 'AFS',
            basis: 'as_received',
            measurement_date: '2026-09-25',
            laboratory_name: 'Choksi NABL Laboratories Pune',
            nabl_accredited: true,
            test_method: 'AFS 1105-00-S',
            is_verified: true,
          },
          {
            id: 'm4',
            property_name: 'Moisture Content',
            value: 0.6,
            unit: '%',
            basis: 'as_received',
            measurement_date: '2026-09-25',
            laboratory_name: 'Plant QC Lab',
            nabl_accredited: false,
            test_method: 'Gravimetric oven drying',
            is_verified: true,
          },
        ],
        documents: [
          {
            id: 'doc-001',
            title: 'NABL Certified Chemical & Sieve Analysis Report',
            document_type: 'lab_test_report',
            file_name: 'TAC_FoundrySand_NABL_Sep2026.pdf',
            file_size: '1.4 MB',
            issue_date: '2026-09-25',
            expiry_date: '2027-03-25',
            issuing_authority: 'Choksi Laboratories Ltd (NABL TC-5542)',
            nabl_accreditation_no: 'TC-5542',
            is_verified: true,
          },
        ],
      },
    ],
  },
  {
    id: 'mat-002',
    organization_id: 'org-prod-001',
    organization_name: 'Tata AutoComp Systems Ltd',
    facility_id: 'fac-002',
    facility_name: 'Plant 4 - Polymer Molding Unit',
    facility_zone: 'Chakan Phase II, Pune',
    category_code: 'SLUDGE',
    category_name: 'Industrial Sludge & Neutralized Solids',
    title: 'Neutralized ETP Sludge (Dewatered Cake)',
    grade: 'Moisture < 25%, pH 7.2',
    description: 'Chemically neutralized and filter-press dewatered sludge originating from phosphating and surface pretreatment effluent.',
    source_process: 'Chemical Precipitation & Membrane Chamber Filter Press',
    prior_contaminants: 'Trace zinc and phosphate salts',
    availability_type: 'recurring_monthly',
    total_volume: 85,
    unit: 'MT/month',
    regulatory_status: 'on_hold',
    regulatory_notes: 'CPCB Schedule-I Cat 35.3 requires mandatory 6-month TCLP toxicity leachate verification report.',
    listing_status: 'pending_review',
    visibility: 'restricted',
    created_at: '2026-10-02T11:00:00Z',
    updated_at: '2026-10-07T16:00:00Z',
    candidate_buyers_count: 2,
    batches: [
      {
        id: 'batch-tac-02',
        batch_reference: 'TAC-ETP-2026-B10',
        quantity: 85,
        unit: 'MT',
        available_from: '2026-10-10',
        available_until: '2026-11-10',
        status: 'available',
        measurements: [
          {
            id: 'm10',
            property_name: 'Moisture Content (Dewatered Cake)',
            value: 22.4,
            unit: '%',
            basis: 'as_received',
            measurement_date: '2026-10-02',
            laboratory_name: 'Plant In-House Lab',
            nabl_accredited: false,
            is_verified: true,
          },
          {
            id: 'm11',
            property_name: 'pH of 10% Aqueous Slurry',
            value: 7.2,
            unit: 'pH',
            basis: 'as_received',
            measurement_date: '2026-10-02',
            laboratory_name: 'Plant In-House Lab',
            nabl_accredited: false,
            is_verified: true,
          },
        ],
        documents: [],
      },
    ],
  },
  {
    id: 'mat-003',
    organization_id: 'org-prod-001',
    organization_name: 'Tata AutoComp Systems Ltd',
    facility_id: 'fac-001',
    facility_name: 'Plant 2 - Metal Casting & Stamping',
    facility_zone: 'Bhosari MIDC, Pune',
    category_code: 'PLASTIC',
    category_name: 'Thermoplastics & Industrial Polymers',
    title: 'Post-Industrial Polypropylene (PP) Regrind Flakes',
    grade: 'Unfilled Natural White, MFI 12',
    description: 'Clean post-industrial polypropylene sprues, runners, and trim scrap granulate. Washed, dust-separated, and stored in bulk bags.',
    source_process: 'Automotive Injection Molding Trim & Quality Rejects',
    prior_contaminants: 'Zero foreign resin blend; non-pigmented natural',
    availability_type: 'one_time_lot',
    total_volume: 35,
    unit: 'MT',
    regulatory_status: 'eligible',
    regulatory_notes: 'Plastic Waste Management Rules 2016 Compliant; secondary raw material classification approved.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-05T08:30:00Z',
    updated_at: '2026-10-06T12:00:00Z',
    candidate_buyers_count: 7,
    batches: [
      {
        id: 'batch-tac-03',
        batch_reference: 'TAC-PP-LOT-04',
        quantity: 35,
        unit: 'MT',
        available_from: '2026-10-05',
        status: 'available',
        measurements: [
          {
            id: 'm20',
            property_name: 'Melt Flow Index (MFI @ 230°C/2.16kg)',
            value: 12.3,
            unit: 'g/10min',
            basis: 'as_received',
            measurement_date: '2026-10-04',
            laboratory_name: 'CIPET Aurangabad Testing Cell',
            nabl_accredited: true,
            test_method: 'ISO 1133 / ASTM D1238',
            is_verified: true,
          },
          {
            id: 'm21',
            property_name: 'Moisture Content',
            value: 0.04,
            unit: '%',
            basis: 'dry_weight',
            measurement_date: '2026-10-04',
            laboratory_name: 'CIPET Aurangabad Testing Cell',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [
          {
            id: 'doc-003',
            title: 'CIPET Polymer Characterization Certificate',
            document_type: 'lab_test_report',
            file_name: 'CIPET_PP_Regrind_Report.pdf',
            file_size: '890 KB',
            issue_date: '2026-10-04',
            issuing_authority: 'Central Institute of Petrochemicals Engineering & Tech',
            nabl_accreditation_no: 'NABL-CIPET-MH-09',
            is_verified: true,
          },
        ],
      },
    ],
  },
];

const STORAGE_KEY_LISTINGS = 'wm_material_listings';

export function getStoredListings(): MaterialListing[] {
  if (typeof window === 'undefined') {
    return SEED_LISTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LISTINGS);
    if (raw) {
      return JSON.parse(raw) as MaterialListing[];
    }
  } catch {
    // fallback
  }
  return SEED_LISTINGS;
}

export function saveStoredListings(listings: MaterialListing[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(listings));
  }
}

export function createNewListing(
  data: ListingFormData,
  orgId: string,
  orgName: string
): MaterialListing {
  const currentListings = getStoredListings();
  const catObj = MATERIAL_CATEGORIES.find((c) => c.code === data.category_code);

  const newListing: MaterialListing = {
    id: `mat-${Date.now().toString().slice(-4)}`,
    organization_id: orgId,
    organization_name: orgName,
    facility_id: data.facility_id || 'fac-001',
    facility_name: data.facility_name,
    facility_zone: data.facility_zone,
    category_code: data.category_code,
    category_name: catObj?.label || 'Controlled Material',
    title: data.title,
    grade: data.grade,
    description: data.description,
    source_process: data.source_process,
    prior_contaminants: data.prior_contaminants,
    availability_type: data.availability_type,
    total_volume: data.quantity,
    unit: data.unit,
    regulatory_status: data.documents.some((d) => d.is_verified) ? 'eligible' : 'on_hold',
    regulatory_notes: data.documents.some((d) => d.is_verified)
      ? 'Preliminary NABL testing documentation verified for pilot exchange.'
      : 'Hold: Requires verified NABL lab report before match clearance.',
    listing_status: data.status,
    visibility: data.visibility,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    candidate_buyers_count: Math.floor(Math.random() * 5) + 2,
    batches: [
      {
        id: `batch-${Date.now().toString().slice(-4)}`,
        batch_reference: data.batch_reference || `BATCH-${new Date().getFullYear()}-01`,
        quantity: data.quantity,
        unit: data.unit,
        available_from: data.available_from || new Date().toISOString().split('T')[0],
        available_until: data.available_until,
        status: 'available',
        measurements: data.measurements,
        documents: data.documents,
      },
    ],
  };

  const updated = [newListing, ...currentListings];
  saveStoredListings(updated);
  return newListing;
}

export function publishListingById(id: string): MaterialListing | null {
  const currentListings = getStoredListings();
  const idx = currentListings.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  const updatedListing: MaterialListing = {
    ...currentListings[idx],
    listing_status: 'published',
    updated_at: new Date().toISOString(),
  };

  currentListings[idx] = updatedListing;
  saveStoredListings(currentListings);
  return updatedListing;
}
