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

export interface ContextualFilterOption {
  id: string;
  name: string;
  type: 'select' | 'boolean';
  options: Array<{ label: string; value: string }>;
}

export const CATEGORY_CONTEXTUAL_FILTERS: Record<MaterialCategoryCode, ContextualFilterOption[]> = {
  PLASTIC: [
    {
      id: 'polymer_type',
      name: 'Polymer Type',
      type: 'select',
      options: [
        { label: 'All Polymers', value: 'ALL' },
        { label: 'PP (Polypropylene)', value: 'PP' },
        { label: 'PET (Polyethylene Terephthalate)', value: 'PET' },
        { label: 'HDPE (High-Density Polyethylene)', value: 'HDPE' },
        { label: 'ABS / Styrenics', value: 'ABS' },
        { label: 'Nylon / Polyamide', value: 'NYLON' },
      ],
    },
    {
      id: 'mfi_tier',
      name: 'Melt Flow Index (MFI)',
      type: 'select',
      options: [
        { label: 'Any MFI', value: 'ALL' },
        { label: 'Low (< 5 g/10min)', value: 'LOW' },
        { label: 'Medium (5 - 15 g/10min)', value: 'MEDIUM' },
        { label: 'High (> 15 g/10min)', value: 'HIGH' },
      ],
    },
    {
      id: 'physical_form',
      name: 'Physical Form',
      type: 'select',
      options: [
        { label: 'All Forms', value: 'ALL' },
        { label: 'Regrind Flakes', value: 'REGRIND' },
        { label: 'Baled Scrap', value: 'BALED' },
        { label: 'Pellets / Granules', value: 'PELLETS' },
      ],
    },
  ],
  METAL: [
    {
      id: 'base_metal',
      name: 'Base Metal',
      type: 'select',
      options: [
        { label: 'All Metals', value: 'ALL' },
        { label: 'Copper / Slag', value: 'COPPER' },
        { label: 'Aluminium / Dross', value: 'ALUMINIUM' },
        { label: 'Brass / Bronze', value: 'BRASS' },
        { label: 'Ferrous / Steel Scale', value: 'FERROUS' },
      ],
    },
    {
      id: 'metal_form',
      name: 'Physical Form',
      type: 'select',
      options: [
        { label: 'All Forms', value: 'ALL' },
        { label: 'Slag / Granulated Grit', value: 'SLAG' },
        { label: 'Dross / Skimmings', value: 'DROSS' },
        { label: 'Swarf / Turnings', value: 'SWARF' },
      ],
    },
  ],
  INDUSTRIAL_MINERAL: [
    {
      id: 'mineral_type',
      name: 'Mineral Type',
      type: 'select',
      options: [
        { label: 'All Types', value: 'ALL' },
        { label: 'Silica / Foundry Sand', value: 'SILICA_SAND' },
        { label: 'Fly Ash / Pozzolan', value: 'FLY_ASH' },
        { label: 'Slag / Aggregate', value: 'SLAG' },
      ],
    },
    {
      id: 'purity_tier',
      name: 'SiO2 Purity Level',
      type: 'select',
      options: [
        { label: 'Any Purity', value: 'ALL' },
        { label: '> 95% High Purity', value: 'HIGH_95' },
        { label: '80% - 95% Standard', value: 'STD_80' },
      ],
    },
  ],
  CHEMICAL: [
    {
      id: 'chemical_family',
      name: 'Chemical Class',
      type: 'select',
      options: [
        { label: 'All Classes', value: 'ALL' },
        { label: 'Hydrochloric Acid (Spent HCl)', value: 'HCL' },
        { label: 'Spent Sulfuric Acid', value: 'H2SO4' },
        { label: 'Solvent Wash / Stripper', value: 'SOLVENT' },
      ],
    },
    {
      id: 'concentration',
      name: 'Concentration',
      type: 'select',
      options: [
        { label: 'Any Strength', value: 'ALL' },
        { label: '> 15% Free Acid', value: 'STRONG_15' },
        { label: '5% - 15% Medium', value: 'MED_5' },
      ],
    },
  ],
  SLUDGE: [
    {
      id: 'moisture_tier',
      name: 'Moisture Level',
      type: 'select',
      options: [
        { label: 'Any Moisture', value: 'ALL' },
        { label: '< 25% Dewatered Cake', value: 'LOW_25' },
        { label: '25% - 50% Semi-dry', value: 'MED_50' },
      ],
    },
    {
      id: 'leachate_status',
      name: 'TCLP Leachate Verification',
      type: 'select',
      options: [
        { label: 'Any Status', value: 'ALL' },
        { label: 'TCLP Verified Non-Toxic', value: 'TCLP_PASSED' },
      ],
    },
  ],
  ORGANIC: [
    {
      id: 'biomass_type',
      name: 'Biomass Type',
      type: 'select',
      options: [
        { label: 'All Feedstocks', value: 'ALL' },
        { label: 'Brewery Spent Grain', value: 'SPENT_GRAIN' },
        { label: 'Sugarcane Bagasse', value: 'BAGASSE' },
        { label: 'Agricultural Husks', value: 'HUSK' },
      ],
    },
  ],
  OTHER: [
    {
      id: 'substance_class',
      name: 'Residue Type',
      type: 'select',
      options: [
        { label: 'All Residues', value: 'ALL' },
        { label: 'Controlled Manufacturing Scrap', value: 'MFG_SCRAP' },
      ],
    },
  ],
};

export const POPULAR_LOCATIONS = [
  'All Locations',
  'Bhosari MIDC, Pune',
  'Chakan Industrial Area, Pune',
  'Talegaon Dabhade, Pune',
  'Pimpri-Chinchwad, Pune',
  'Hadapsar Industrial Estate, Pune',
  'Ranjangaon MIDC, Pune',
];

export const SYNONYM_MAP: Record<string, string[]> = {
  pet: ['polyethylene terephthalate', 'pet', 'rpet', 'bottle', 'bottles', 'polyester', 'synthetic'],
  pp: ['polypropylene', 'pp', 'polymer', 'injection', 'regrind', 'flakes'],
  hdpe: ['high density polyethylene', 'hdpe', 'pe', 'polyethylene', 'blow mold'],
  plastic: ['polymer', 'thermoplastic', 'regrind', 'pet', 'pp', 'hdpe', 'resin', 'flakes', 'bottles'],
  sand: ['silica', 'foundry', 'quartz', 'silicon dioxide', 'casting', 'molding sand', 'mineral'],
  silica: ['sand', 'quartz', 'foundry', 'sio2', 'silicon dioxide'],
  copper: ['cu', 'slag', 'smelter', 'copper slag', 'abrasive', 'grit', 'metals'],
  metal: ['copper', 'aluminium', 'aluminum', 'brass', 'steel', 'iron', 'dross', 'slag', 'swarf', 'scrap', 'grit'],
  aluminium: ['aluminum', 'al', 'dross', 'swarf', 'turnings', 'scrap', 'metal'],
  sludge: ['etp', 'filter cake', 'clarifier', 'dewatered', 'neutralized cake', 'solids'],
  acid: ['hcl', 'hydrochloric', 'spent liquor', 'pickling', 'chemical'],
  chemical: ['acid', 'hcl', 'hydrochloric', 'spent liquor', 'pickling', 'solvent'],
  organic: ['biomass', 'spent grain', 'brewery', 'bagasse', 'agro', 'feedstock', 'residue'],
  ash: ['fly ash', 'calcined', 'pozzolan', 'thermal', 'boiler ash', 'mineral'],
  slag: ['copper slag', 'foundry', 'abrasive', 'grit', 'smelter', 'metal'],
};

export function matchesSearchQuery(listing: MaterialListing, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  // Direct keyword matching across key text fields
  const directFields = [
    listing.title,
    listing.grade,
    listing.description,
    listing.source_process,
    listing.category_name,
    listing.facility_name,
    listing.facility_zone,
    listing.organization_name,
    ...(listing.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  if (directFields.includes(query)) return true;

  // Word-by-word matching with synonym expansion
  const queryTokens = query.split(/\s+/).filter(Boolean);
  return queryTokens.every((token) => {
    if (directFields.includes(token)) return true;

    // Check synonyms
    const synonyms = SYNONYM_MAP[token] || [];
    for (const syn of synonyms) {
      if (directFields.includes(syn)) return true;
    }

    // Check measurement properties
    const inMeasurements = listing.batches.some((b) =>
      b.measurements.some(
        (m) =>
          m.property_name.toLowerCase().includes(token) ||
          String(m.value).toLowerCase().includes(token)
      )
    );
    if (inMeasurements) return true;

    return false;
  });
}

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
    price_per_unit: 1400,
    price_display: '₹1,400 / MT',
    distance_km: 12,
    tags: ['Foundry Sand', 'Silica', 'Resin Bound', 'NABL Verified', 'SiO2 > 96%'],
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
    price_display: 'Quote on Request',
    distance_km: 28,
    tags: ['ETP Sludge', 'Filter Cake', 'Neutralized', 'Dewatered'],
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
    price_per_unit: 48000,
    price_display: '₹48,000 / MT',
    distance_km: 14,
    tags: ['PP Regrind', 'Polypropylene', 'CIPET Tested', 'MFI 12', 'Natural White'],
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
  {
    id: 'mat-004',
    organization_id: 'org-prod-002',
    organization_name: 'Industrial Metals Corp',
    facility_id: 'fac-003',
    facility_name: 'Smelter Operations Unit 1',
    facility_zone: 'Bhosari MIDC, Pune',
    category_code: 'METAL',
    category_name: 'Non-Ferrous & Ferrous Metal Residues',
    title: 'High-Purity Copper Slag (Water Quenched)',
    grade: 'Granular Abrasive Grade, Cu 1.1%',
    description: 'High-density by-product of flash copper smelting. Mechanically granulated and water-quenched. Ideal for abrasive grit blasting, roofing granules, and Portland cement additive.',
    source_process: 'Flash Smelting of Copper Concentrates & Water Quenching',
    prior_contaminants: 'Free of heavy volatile organics',
    availability_type: 'recurring_monthly',
    total_volume: 200,
    unit: 'MT/month',
    price_per_unit: 2500,
    price_display: '₹2,500 / MT',
    distance_km: 8,
    tags: ['Copper Slag', 'Abrasive Grit', 'Smelter Byproduct', 'NABL Verified', 'XRF Tested'],
    regulatory_status: 'eligible',
    regulatory_notes: 'Hazardous Waste Authorization Form IV compliant for secondary raw material use.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-01T09:00:00Z',
    updated_at: '2026-10-08T11:00:00Z',
    candidate_buyers_count: 9,
    batches: [
      {
        id: 'batch-imc-01',
        batch_reference: 'IMC-CS-2026-10',
        quantity: 200,
        unit: 'MT',
        available_from: '2026-10-01',
        status: 'available',
        measurements: [
          {
            id: 'm30',
            property_name: 'Primary Metal Purity (Assay)',
            value: 1.1,
            unit: '%',
            basis: 'dry_weight',
            measurement_date: '2026-09-29',
            laboratory_name: 'National Metallurgical Lab',
            nabl_accredited: true,
            is_verified: true,
          },
          {
            id: 'm31',
            property_name: 'Specific Gravity @ 25°C',
            value: 3.5,
            unit: 'g/mL',
            basis: 'as_received',
            measurement_date: '2026-09-29',
            laboratory_name: 'National Metallurgical Lab',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [
          {
            id: 'doc-004',
            title: 'NABL Metallurgical Composition Certificate',
            document_type: 'lab_test_report',
            file_name: 'Copper_Slag_Assay_NABL.pdf',
            issue_date: '2026-09-29',
            issuing_authority: 'National Metallurgical Laboratory',
            is_verified: true,
          },
        ],
      },
    ],
  },
  {
    id: 'mat-005',
    organization_id: 'org-prod-003',
    organization_name: 'Sahyadri Beverage Bottling Ltd',
    facility_id: 'fac-004',
    facility_name: 'Bottling & Packaging Hub',
    facility_zone: 'Chakan Industrial Area, Pune',
    category_code: 'PLASTIC',
    category_name: 'Thermoplastics & Industrial Polymers',
    title: 'Clean PET Bottles & Preform Rejects (Baled)',
    grade: 'Post-Industrial Clear Transparent',
    description: 'Baled food-grade clear PET bottle rejects and injection molding preforms. Zero PVC contamination, de-labeled and compacted for fiber and rPET bottle-to-bottle pelletizing.',
    source_process: 'Beverage Bottling Line Inspection & Neck Trim Separation',
    prior_contaminants: 'Trace water residue; zero oil',
    availability_type: 'recurring_monthly',
    total_volume: 50,
    unit: 'MT/month',
    price_display: 'Quote on Request',
    distance_km: 22,
    tags: ['PET Bottles', 'rPET', 'Baled Scrap', 'Food Grade', 'Clear Plastic'],
    regulatory_status: 'eligible',
    regulatory_notes: 'Plastic Waste Management EPR secondary raw material credit compliant.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-06T14:00:00Z',
    updated_at: '2026-10-07T09:30:00Z',
    candidate_buyers_count: 11,
    batches: [
      {
        id: 'batch-pet-01',
        batch_reference: 'SBB-PET-BALED-09',
        quantity: 50,
        unit: 'MT',
        available_from: '2026-10-06',
        status: 'available',
        measurements: [
          {
            id: 'm40',
            property_name: 'Intrinsic Viscosity (IV)',
            value: 0.78,
            unit: 'dL/g',
            basis: 'as_received',
            measurement_date: '2026-10-05',
            laboratory_name: 'CIPET Testing Lab',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [],
      },
    ],
  },
  {
    id: 'mat-006',
    organization_id: 'org-prod-004',
    organization_name: 'Maharashtra Galvanizers Ltd',
    facility_id: 'fac-005',
    facility_name: 'Continuous Strip Pickling Line',
    facility_zone: 'Talegaon Dabhade, Pune',
    category_code: 'CHEMICAL',
    category_name: 'Spent Chemicals & Process Liquors',
    title: 'Spent Hydrochloric Acid (Pickling Liquor)',
    grade: '18% Free HCl, Ferrous Chloride 120 g/L',
    description: 'Spent pickling solution from carbon steel surface rust removal. Suitable for ferric chloride coagulant synthesis or zinc chloride manufacturing.',
    source_process: 'Hot Rolled Steel Continuous Chemical Pickling Tanks',
    prior_contaminants: 'Dissolved iron salts (FeCl2)',
    availability_type: 'recurring_monthly',
    total_volume: 80,
    unit: 'MT/month',
    price_per_unit: 1200,
    price_display: '₹1,200 / MT',
    distance_km: 35,
    tags: ['Spent Acid', 'Hydrochloric Acid', 'HCl', 'Pickling Liquor', 'Ferrous Chloride'],
    regulatory_status: 'eligible',
    regulatory_notes: 'MPCB Hazardous Waste Transport Manifest Form 10 pre-authorized.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-03T15:00:00Z',
    updated_at: '2026-10-06T10:00:00Z',
    candidate_buyers_count: 4,
    batches: [
      {
        id: 'batch-mgl-01',
        batch_reference: 'MGL-HCL-2026-OCT',
        quantity: 80,
        unit: 'MT',
        available_from: '2026-10-03',
        status: 'available',
        measurements: [
          {
            id: 'm50',
            property_name: 'Free Acid Concentration (HCl / H2SO4)',
            value: 18.2,
            unit: '% w/w',
            basis: 'as_received',
            measurement_date: '2026-10-02',
            laboratory_name: 'Plant Chemical Assay Lab',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [],
      },
    ],
  },
  {
    id: 'mat-007',
    organization_id: 'org-prod-005',
    organization_name: 'Western Die-Castings Ltd',
    facility_id: 'fac-006',
    facility_name: 'Aluminium Foundry & Machining Unit',
    facility_zone: 'Pimpri-Chinchwad, Pune',
    category_code: 'METAL',
    category_name: 'Non-Ferrous & Ferrous Metal Residues',
    title: 'Aluminium Skimmings & Dross (72% Metallic Al)',
    grade: 'Secondary Ingot Feedstock, Dry Skimmed',
    description: 'Hot skimmed aluminium dross from secondary smelting furnaces. High metallic content with low salt flux contamination, packed in heavy-duty steel totes.',
    source_process: 'Secondary Aluminium Reverberatory Furnace De-drossing',
    prior_contaminants: 'Alumina oxide skin < 25%',
    availability_type: 'one_time_lot',
    total_volume: 45,
    unit: 'MT',
    price_per_unit: 18500,
    price_display: '₹18,500 / MT',
    distance_km: 16,
    tags: ['Aluminium Dross', 'Metallic Al', 'Foundry Scrap', 'Secondary Smelting'],
    regulatory_status: 'eligible',
    regulatory_notes: 'Eligible for recycling by authorized secondary aluminium smelting units.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-07T08:00:00Z',
    updated_at: '2026-10-08T12:00:00Z',
    candidate_buyers_count: 8,
    batches: [
      {
        id: 'batch-wdc-01',
        batch_reference: 'WDC-AL-DROSS-01',
        quantity: 45,
        unit: 'MT',
        available_from: '2026-10-07',
        status: 'available',
        measurements: [
          {
            id: 'm60',
            property_name: 'Primary Metal Purity (Assay)',
            value: 72.5,
            unit: '%',
            basis: 'dry_weight',
            measurement_date: '2026-10-06',
            laboratory_name: 'SGS India Minerals Lab',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [],
      },
    ],
  },
  {
    id: 'mat-008',
    organization_id: 'org-prod-006',
    organization_name: 'Deccan Craft Breweries Ltd',
    facility_id: 'fac-007',
    facility_name: 'Brewing & Fermentation Facility',
    facility_zone: 'Hadapsar Industrial Estate, Pune',
    category_code: 'ORGANIC',
    category_name: 'Agro & Biomass Residues',
    title: 'Brewery Spent Grain (BSG) - Wet Organic Biomass',
    grade: 'Barley Malt Mash Solids, Protein 24%',
    description: 'Fresh residual malt solids from beer lautering. High crude fiber and protein content, suitable for cattle feed blending, mushroom cultivation, or biogas co-digestion.',
    source_process: 'Mash Separation & Lauter Tun Discharge',
    prior_contaminants: 'Zero synthetic additives; food processing origin',
    availability_type: 'recurring_weekly',
    total_volume: 110,
    unit: 'MT/month',
    price_display: 'Quote on Request',
    distance_km: 19,
    tags: ['Spent Grain', 'BSG', 'Brewery Residue', 'Biomass', 'Organic Feedstock'],
    regulatory_status: 'eligible',
    regulatory_notes: 'Non-hazardous agro byproduct; approved for livestock feed supplement reuse.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-04T12:00:00Z',
    updated_at: '2026-10-07T14:00:00Z',
    candidate_buyers_count: 6,
    batches: [
      {
        id: 'batch-dcb-01',
        batch_reference: 'DCB-BSG-W40',
        quantity: 110,
        unit: 'MT',
        available_from: '2026-10-04',
        status: 'available',
        measurements: [
          {
            id: 'm70',
            property_name: 'Moisture Content',
            value: 64.0,
            unit: '%',
            basis: 'as_received',
            measurement_date: '2026-10-03',
            laboratory_name: 'AgriFood NABL Testing Lab',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [],
      },
    ],
  },
  {
    id: 'mat-009',
    organization_id: 'org-prod-007',
    organization_name: 'Precision Blow-Molders Pvt Ltd',
    facility_id: 'fac-008',
    facility_name: 'Industrial Drum & Container Plant',
    facility_zone: 'Ranjangaon MIDC, Pune',
    category_code: 'PLASTIC',
    category_name: 'Thermoplastics & Industrial Polymers',
    title: 'High-Density Polyethylene (HDPE) Regrind Granules',
    grade: 'Blow Molding Grade, Blue & Natural, MFI 0.8',
    description: 'Post-industrial regrind from 200-liter chemical drum trimming and deflashing. High ESCR (Environmental Stress Crack Resistance), filtered and dedusted.',
    source_process: 'Extrusion Blow Molding Trimming & Deflashing',
    prior_contaminants: 'Virgin resin purge; zero post-consumer contamination',
    availability_type: 'recurring_monthly',
    total_volume: 60,
    unit: 'MT/month',
    price_per_unit: 52000,
    price_display: '₹52,000 / MT',
    distance_km: 48,
    tags: ['HDPE', 'Blow Molding', 'Regrind', 'MFI 0.8', 'Virgin Purge'],
    regulatory_status: 'eligible',
    regulatory_notes: 'Certified industrial clean post-manufacturing scrap.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-10-06T10:00:00Z',
    updated_at: '2026-10-08T09:00:00Z',
    candidate_buyers_count: 10,
    batches: [
      {
        id: 'batch-pbm-01',
        batch_reference: 'PBM-HDPE-2026-OCT',
        quantity: 60,
        unit: 'MT',
        available_from: '2026-10-06',
        status: 'available',
        measurements: [
          {
            id: 'm80',
            property_name: 'Melt Flow Index (MFI @ 230°C/2.16kg)',
            value: 0.82,
            unit: 'g/10min',
            basis: 'as_received',
            measurement_date: '2026-10-05',
            laboratory_name: 'CIPET Testing Cell',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [],
      },
    ],
  },
  {
    id: 'mat-010',
    organization_id: 'org-prod-008',
    organization_name: 'Daund Thermal Energy Utilities',
    facility_id: 'fac-009',
    facility_name: 'Electrostatic Precipitator Silo Unit',
    facility_zone: 'Talegaon Dabhade, Pune',
    category_code: 'INDUSTRIAL_MINERAL',
    category_name: 'Industrial Minerals & Foundry Byproducts',
    title: 'Dry Electrostatic Fly Ash (Class F / Pozzolanic)',
    grade: 'IS 3812 Part-1 Cement Grade, Fineness 340 m²/kg',
    description: 'Dry pulverized coal combustion fly ash pneumatically extracted from ESP hoppers. High pozzolanic reactivity, ideal for ready-mix concrete, Portland pozzolana cement, and AAC blocks.',
    source_process: 'Pulverized Coal Combustion & Electrostatic Precipitator Capture',
    prior_contaminants: 'Loss on Ignition < 2.5%',
    availability_type: 'recurring_monthly',
    total_volume: 350,
    unit: 'MT/month',
    price_per_unit: 950,
    price_display: '₹950 / MT',
    distance_km: 32,
    tags: ['Fly Ash', 'Class F', 'Pozzolan', 'Cement Grade', 'ASTM C618'],
    regulatory_status: 'eligible',
    regulatory_notes: '100% Fly Ash Utilization Notification 2021 compliant.',
    listing_status: 'published',
    visibility: 'marketplace',
    created_at: '2026-09-30T11:00:00Z',
    updated_at: '2026-10-07T11:00:00Z',
    candidate_buyers_count: 14,
    batches: [
      {
        id: 'batch-dte-01',
        batch_reference: 'DTE-FA-SILO-04',
        quantity: 350,
        unit: 'MT',
        available_from: '2026-09-30',
        status: 'available',
        measurements: [
          {
            id: 'm90',
            property_name: 'Silicon Dioxide (SiO2) Purity',
            value: 58.4,
            unit: '%',
            basis: 'dry_weight',
            measurement_date: '2026-09-29',
            laboratory_name: 'National Test House Mumbai',
            nabl_accredited: true,
            is_verified: true,
          },
        ],
        documents: [],
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
