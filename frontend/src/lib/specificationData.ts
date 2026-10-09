import {
  BuyerSpecification,
  SpecificationConstraint,
  SpecificationFormData,
  ConstraintType,
  MissingDataPolicy,
  SupplyFrequency,
} from '@/types/specification';
import { MaterialCategoryCode, MaterialListing } from '@/types/material';
import { MATERIAL_CATEGORIES, CATEGORY_DEFAULT_PROPERTIES, getStoredListings } from './materialData';

export const PREPROCESSING_OPTIONS: Array<{ id: string; label: string; description: string }> = [
  {
    id: 'prep-mag',
    label: 'Magnetic Iron Separation',
    description: 'Removal of tramp metal and magnetic ferrous particulate via inline cross-belt magnets.',
  },
  {
    id: 'prep-sieve',
    label: 'Sieve Screening & Mechanical Classification',
    description: 'Vibratory screen decks or trommels to achieve target Grain Fineness (AFS) or particle mesh sizing.',
  },
  {
    id: 'prep-wash',
    label: 'Hydro-cyclone & Water Washing',
    description: 'Wash cycle to strip water-soluble salts, active clay binders, or surface silt.',
  },
  {
    id: 'prep-dry',
    label: 'Rotary Thermal Drying',
    description: 'Direct/indirect heat processing to reduce moisture below 0.5% weight basis.',
  },
  {
    id: 'prep-shred',
    label: 'Granulation & Heavy Shredding',
    description: 'Rotary knifing or hammermill pulverizing into uniform regrind flakes/chips.',
  },
  {
    id: 'prep-neut',
    label: 'Chemical Acid/Alkali Neutralization',
    description: 'Inline pH stabilization and flocculant dosing to precipitate heavy metal hydroxides.',
  },
  {
    id: 'prep-degrease',
    label: 'Solvent/Aqueous Degreasing',
    description: 'Centrifugal degreasing to remove hydrocarbon oils and coolant lubricants.',
  },
];

export const RECEIVING_FACILITIES = [
  {
    id: 'fac-rcv-01',
    name: 'Bhosari Induction Casting Unit',
    zone: 'Bhosari MIDC, Pune',
    organization_id: 'org-buyer-001',
    organization_name: 'Mahindra Castings & Foundry Div',
  },
  {
    id: 'fac-rcv-02',
    name: 'Chakan Automotive Polymer Molding Facility',
    zone: 'Chakan Industrial Zone Phase 2, Pune',
    organization_id: 'org-buyer-001',
    organization_name: 'Mahindra Castings & Foundry Div',
  },
  {
    id: 'fac-rcv-03',
    name: 'Talegaon Cement Terminal & Blending Plant',
    zone: 'Talegaon MIDC, Pune',
    organization_id: 'org-buyer-002',
    organization_name: 'UltraTech Eco-Binder Solutions',
  },
  {
    id: 'fac-rcv-04',
    name: 'Ranjangaon Chemical Recovery Plant',
    zone: 'Ranjangaon MIDC, Pune',
    organization_id: 'org-buyer-003',
    organization_name: 'Maharashtra Resource Recovery Ltd',
  },
];

export const CONSTRAINT_TYPE_DEFINITIONS: Record<
  ConstraintType,
  { label: string; description: string; badgeColor: string }
> = {
  HARD_LIMIT: {
    label: 'Hard Acceptance Limit',
    description: 'Mandatory technical threshold. Candidates violating this boundary are strictly disqualified unless preprocessed.',
    badgeColor: 'border-rose-300 bg-rose-50 text-rose-800',
  },
  PREFERRED_RANGE: {
    label: 'Preferred Operating Range',
    description: 'Optimal efficiency window. Deviations remain eligible but lower the compatibility ranking score.',
    badgeColor: 'border-amber-300 bg-amber-50 text-amber-800',
  },
  PROHIBITED_CONDITION: {
    label: 'Prohibited Condition',
    description: 'Strict disqualifier (e.g. hazardous contaminant ceiling or prohibited chemical substance).',
    badgeColor: 'border-purple-300 bg-purple-50 text-purple-800',
  },
  REQUIRED_PROPERTY: {
    label: 'Required Test Metric',
    description: 'Property must have accredited laboratory test evidence provided with no missing data permitted.',
    badgeColor: 'border-blue-300 bg-blue-50 text-blue-800',
  },
};

export const MISSING_DATA_POLICY_DEFINITIONS: Record<
  MissingDataPolicy,
  { label: string; description: string }
> = {
  HOLD: {
    label: 'HOLD (Block until tested)',
    description: 'If this measurement is missing in candidate batch, place candidate match on safety hold until lab test is submitted.',
  },
  MANUAL_REVIEW: {
    label: 'Manual Engineering Review',
    description: 'Allow plant metallurgist / process engineer to review supplier declaration before decision.',
  },
  NOT_APPLICABLE_WITH_EVIDENCE: {
    label: 'N/A with Exemption Evidence',
    description: 'Allow absence only if accompanied by formal declaration or supplier process MSDS demonstrating absence.',
  },
};

const SEED_SPECIFICATIONS: BuyerSpecification[] = [
  {
    id: 'spec-01',
    buyer_organization_id: 'org-buyer-001',
    buyer_organization_name: 'Mahindra Castings & Foundry Div',
    receiving_facility_id: 'fac-rcv-01',
    receiving_facility_name: 'Bhosari Induction Casting Unit',
    receiving_facility_zone: 'Bhosari MIDC, Pune',
    target_category_code: 'INDUSTRIAL_MINERAL',
    target_category_name: 'Industrial Minerals & Foundry Byproducts',
    target_material_name: 'Secondary Foundry Silica Sand',
    intended_use: 'Core Making & Green Sand Mold Replenishment',
    specification_version: 1,
    specification_status: 'published',
    minimum_quantity: 80,
    maximum_quantity: 150,
    quantity_unit: 'MT',
    frequency: 'recurring_monthly',
    max_distance_km: 50,
    acceptable_preprocessing: [
      'Magnetic Iron Separation',
      'Sieve Screening & Mechanical Classification',
      'Rotary Thermal Drying',
    ],
    prohibited_contaminants_notes: 'Free metallic iron > 0.2% prohibited; Phenolic resin binder residue > 2.0% strictly prohibited.',
    effective_from: '2026-10-01',
    effective_until: '2027-03-31',
    created_at: '2026-10-04T09:00:00Z',
    updated_at: '2026-10-04T09:00:00Z',
    matched_listings_count: 3,
    constraints: [
      {
        id: 'c-01',
        property_name: 'Silicon Dioxide (SiO2) Purity',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 95.0,
        upper_bound: 100.0,
        unit: '%',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'Assayed via XRF or wet chemical IS 1918. Must be >= 95.0% dry weight.',
      },
      {
        id: 'c-02',
        property_name: 'Loss on Ignition (LOI @ 950°C)',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 2.5,
        unit: '%',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'ASTM C114 test method. Excessive combustible resin causes gas porosity defects.',
      },
      {
        id: 'c-03',
        property_name: 'Grain Fineness Number (AFS)',
        constraint_type: 'PREFERRED_RANGE',
        lower_bound: 50.0,
        upper_bound: 60.0,
        unit: 'AFS',
        required_evidence: true,
        missing_data_policy: 'MANUAL_REVIEW',
        tolerance_policy: 'AFS 1105-00-S standard sieve shaker test. Fines outside 48-65 will be rejected.',
      },
      {
        id: 'c-04',
        property_name: 'Moisture Content',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 1.0,
        unit: '%',
        required_evidence: false,
        missing_data_policy: 'NOT_APPLICABLE_WITH_EVIDENCE',
        tolerance_policy: 'Max 1.0% as-received. If higher, thermal rotary drying must be accepted by supplier.',
      },
      {
        id: 'c-05',
        property_name: 'Clay & Active Binder Substance',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 0.8,
        unit: '%',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'Active bentonite clay determined by methylene blue titration.',
      },
    ],
  },
  {
    id: 'spec-02',
    buyer_organization_id: 'org-buyer-001',
    buyer_organization_name: 'Mahindra Castings & Foundry Div',
    receiving_facility_id: 'fac-rcv-02',
    receiving_facility_name: 'Chakan Automotive Polymer Molding Facility',
    receiving_facility_zone: 'Chakan Industrial Zone Phase 2, Pune',
    target_category_code: 'PLASTIC',
    target_category_name: 'Thermoplastics & Industrial Polymers',
    target_material_name: 'Recycled Polypropylene (PP Flakes)',
    intended_use: 'Automotive HVAC Duct Housing Injection',
    specification_version: 2,
    specification_status: 'published',
    minimum_quantity: 30,
    maximum_quantity: 60,
    quantity_unit: 'MT',
    frequency: 'recurring_monthly',
    max_distance_km: 75,
    acceptable_preprocessing: [
      'Granulation & Heavy Shredding',
      'Hydro-cyclone & Water Washing',
      'Rotary Thermal Drying',
    ],
    prohibited_contaminants_notes: 'Zero PVC contamination (< 50 ppm). No cross-linked silicone or paint flake inclusions.',
    effective_from: '2026-10-01',
    effective_until: '2027-09-30',
    created_at: '2026-10-06T11:20:00Z',
    updated_at: '2026-10-06T11:20:00Z',
    matched_listings_count: 5,
    constraints: [
      {
        id: 'c-06',
        property_name: 'Melt Flow Index (MFI @ 230°C/2.16kg)',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 10.0,
        upper_bound: 25.0,
        unit: 'g/10min',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'ASTM D1238 standard condition. Essential for thin-wall mold filling without flashing.',
      },
      {
        id: 'c-07',
        property_name: 'Moisture Content',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 0.2,
        unit: '%',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'Karl Fischer titration or moisture balance @ 105°C.',
      },
      {
        id: 'c-08',
        property_name: 'Density',
        constraint_type: 'PREFERRED_RANGE',
        lower_bound: 0.90,
        upper_bound: 0.92,
        unit: 'g/cm³',
        required_evidence: false,
        missing_data_policy: 'MANUAL_REVIEW',
        tolerance_policy: 'Target pure unreinforced homopolymer PP density.',
      },
      {
        id: 'c-09',
        property_name: 'Filler / Ash Content',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 1.5,
        unit: '%',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'Talc/calcium carbonate inorganic residue after 600°C muffle calcination.',
      },
    ],
  },
  {
    id: 'spec-03',
    buyer_organization_id: 'org-buyer-002',
    buyer_organization_name: 'UltraTech Eco-Binder Solutions',
    receiving_facility_id: 'fac-rcv-03',
    receiving_facility_name: 'Talegaon Cement Terminal & Blending Plant',
    receiving_facility_zone: 'Talegaon MIDC, Pune',
    target_category_code: 'INDUSTRIAL_MINERAL',
    target_category_name: 'Industrial Minerals & Foundry Byproducts',
    target_material_name: 'Blast Furnace Granulated Slag (GGBS)',
    intended_use: 'Composite Pozzolanic Binder Replacement',
    specification_version: 1,
    specification_status: 'published',
    minimum_quantity: 200,
    maximum_quantity: 350,
    quantity_unit: 'MT',
    frequency: 'recurring_quarterly',
    max_distance_km: 120,
    acceptable_preprocessing: [
      'Magnetic Iron Separation',
      'Rotary Thermal Drying',
    ],
    prohibited_contaminants_notes: 'Free lime (CaO uncombined) < 1.0%; Glass content must exceed 85% by optical microscopy.',
    effective_from: '2026-09-15',
    effective_until: '2027-09-15',
    created_at: '2026-09-22T08:15:00Z',
    updated_at: '2026-09-22T08:15:00Z',
    matched_listings_count: 2,
    constraints: [
      {
        id: 'c-10',
        property_name: 'Loss on Ignition (LOI @ 950°C)',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 3.0,
        unit: '%',
        required_evidence: true,
        missing_data_policy: 'HOLD',
        tolerance_policy: 'IS 12089 cement additive specifications.',
      },
      {
        id: 'c-11',
        property_name: 'Moisture Content',
        constraint_type: 'HARD_LIMIT',
        lower_bound: 0.0,
        upper_bound: 8.0,
        unit: '%',
        required_evidence: false,
        missing_data_policy: 'NOT_APPLICABLE_WITH_EVIDENCE',
        tolerance_policy: 'Terminal has on-site fluid bed drying if moisture is under 8%.',
      },
    ],
  },
];

const STORAGE_KEY = 'wm_buyer_specifications_v1';

export function getStoredSpecifications(): BuyerSpecification[] {
  if (typeof window === 'undefined') {
    return SEED_SPECIFICATIONS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SPECIFICATIONS));
      return SEED_SPECIFICATIONS;
    }
    return JSON.parse(raw) as BuyerSpecification[];
  } catch (err) {
    console.error('Failed to read specifications from localStorage:', err);
    return SEED_SPECIFICATIONS;
  }
}

export function saveStoredSpecifications(specs: BuyerSpecification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
  } catch (err) {
    console.error('Failed to save specifications to localStorage:', err);
  }
}

export function getSpecificationById(id: string): BuyerSpecification | null {
  const specs = getStoredSpecifications();
  return specs.find((s) => s.id === id) || null;
}

export function getDefaultConstraintsForCategory(categoryCode: MaterialCategoryCode): SpecificationConstraint[] {
  const propertyDefs = CATEGORY_DEFAULT_PROPERTIES[categoryCode] || [];

  return propertyDefs.map((p, idx) => {
    let lower: number | undefined;
    let upper: number | undefined;
    let constraintType: ConstraintType = p.is_mandatory ? 'HARD_LIMIT' : 'PREFERRED_RANGE';
    let missingPolicy: MissingDataPolicy = p.is_mandatory ? 'HOLD' : 'MANUAL_REVIEW';

    // Smart default bounds based on property name
    if (p.name.includes('Purity') || p.name.includes('SiO2') || p.name.includes('Assay')) {
      lower = 90.0;
      upper = 100.0;
      constraintType = 'HARD_LIMIT';
    } else if (p.name.includes('Loss on Ignition') || p.name.includes('LOI')) {
      lower = 0.0;
      upper = 3.0;
      constraintType = 'HARD_LIMIT';
    } else if (p.name.includes('Moisture')) {
      lower = 0.0;
      upper = 2.0;
      constraintType = 'HARD_LIMIT';
    } else if (p.name.includes('Grain Fineness') || p.name.includes('AFS')) {
      lower = 50.0;
      upper = 60.0;
      constraintType = 'PREFERRED_RANGE';
    } else if (p.name.includes('Melt Flow Index') || p.name.includes('MFI')) {
      lower = 10.0;
      upper = 25.0;
      constraintType = 'HARD_LIMIT';
    } else if (p.name.includes('pH')) {
      lower = 6.5;
      upper = 8.5;
      constraintType = 'HARD_LIMIT';
    } else if (p.name.includes('Density')) {
      lower = 0.90;
      upper = 0.95;
      constraintType = 'PREFERRED_RANGE';
    } else if (p.name.includes('Leaching') || p.name.includes('TCLP')) {
      lower = 0.0;
      upper = 5.0;
      constraintType = 'PROHIBITED_CONDITION';
    }

    return {
      id: `c-init-${categoryCode.toLowerCase()}-${idx + 1}`,
      property_definition_id: p.id,
      property_name: p.name,
      constraint_type: constraintType,
      lower_bound: lower,
      upper_bound: upper,
      unit: p.unit,
      required_evidence: p.is_mandatory ?? false,
      missing_data_policy: missingPolicy,
      tolerance_policy: `${constraintType === 'HARD_LIMIT' ? 'Mandatory boundary' : 'Target range'} for ${p.name}.`,
    };
  });
}

export function validateConstraintBounds(constraint: SpecificationConstraint): { isValid: boolean; error?: string } {
  if (
    constraint.lower_bound !== undefined &&
    constraint.upper_bound !== undefined &&
    constraint.lower_bound > constraint.upper_bound
  ) {
    return {
      isValid: false,
      error: `Lower bound (${constraint.lower_bound} ${constraint.unit}) cannot exceed upper bound (${constraint.upper_bound} ${constraint.unit}).`,
    };
  }
  return { isValid: true };
}

export function createBuyerSpecification(data: SpecificationFormData): BuyerSpecification {
  const currentSpecs = getStoredSpecifications();
  const catObj = MATERIAL_CATEGORIES.find((c) => c.code === data.target_category_code);

  const newSpec: BuyerSpecification = {
    id: `spec-${Date.now().toString().slice(-4)}`,
    buyer_organization_id: 'org-buyer-001',
    buyer_organization_name: 'Mahindra Castings & Foundry Div',
    receiving_facility_id: data.receiving_facility_id,
    receiving_facility_name: data.receiving_facility_name,
    receiving_facility_zone: data.receiving_facility_zone,
    target_category_code: data.target_category_code,
    target_category_name: catObj?.label || 'Industrial Material',
    target_material_name: data.target_material_name,
    intended_use: data.intended_use,
    specification_version: 1,
    specification_status: data.specification_status,
    minimum_quantity: Number(data.minimum_quantity),
    maximum_quantity: data.maximum_quantity ? Number(data.maximum_quantity) : undefined,
    quantity_unit: data.quantity_unit,
    frequency: data.frequency,
    max_distance_km: Number(data.max_distance_km),
    acceptable_preprocessing: data.acceptable_preprocessing,
    prohibited_contaminants_notes: data.prohibited_contaminants_notes,
    effective_from: data.effective_from,
    effective_until: data.effective_until,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    constraints: data.constraints,
    matched_listings_count: 0,
  };

  // Calculate live matching count against available listings
  const allListings = getStoredListings();
  const matched = allListings.filter((listing) => {
    return evaluateListingMatch(newSpec, listing).isCompatible;
  });
  newSpec.matched_listings_count = matched.length;

  const updated = [newSpec, ...currentSpecs];
  saveStoredSpecifications(updated);
  return newSpec;
}

export function updateBuyerSpecification(id: string, updates: Partial<BuyerSpecification>): BuyerSpecification | null {
  const specs = getStoredSpecifications();
  const idx = specs.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const current = specs[idx];
  const updatedSpec: BuyerSpecification = {
    ...current,
    ...updates,
    specification_version: updates.constraints ? current.specification_version + 1 : current.specification_version,
    updated_at: new Date().toISOString(),
  };

  specs[idx] = updatedSpec;
  saveStoredSpecifications(specs);
  return updatedSpec;
}

export function publishSpecificationById(id: string): BuyerSpecification | null {
  return updateBuyerSpecification(id, { specification_status: 'published' });
}

export function archiveSpecificationById(id: string): BuyerSpecification | null {
  return updateBuyerSpecification(id, { specification_status: 'archived' });
}

export function duplicateSpecification(id: string): BuyerSpecification | null {
  const spec = getSpecificationById(id);
  if (!spec) return null;

  const currentSpecs = getStoredSpecifications();
  const newSpec: BuyerSpecification = {
    ...spec,
    id: `spec-${Date.now().toString().slice(-4)}`,
    target_material_name: `${spec.target_material_name} (Copy)`,
    specification_version: 1,
    specification_status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveStoredSpecifications([newSpec, ...currentSpecs]);
  return newSpec;
}

export interface MatchEvaluationResult {
  isCompatible: boolean;
  scorePercentage: number;
  evaluatedProperties: Array<{
    name: string;
    constraintType: ConstraintType;
    requiredRange: string;
    measuredValue: string | number;
    pass: boolean;
    reason?: string;
  }>;
  hardLimitsPassed: boolean;
  preferredMatchesCount: number;
  untestedCount: number;
}

export function evaluateListingMatch(
  spec: BuyerSpecification,
  listing: MaterialListing
): MatchEvaluationResult {
  // Category must match or be closely related
  if (spec.target_category_code !== listing.category_code) {
    return {
      isCompatible: false,
      scorePercentage: 0,
      evaluatedProperties: [],
      hardLimitsPassed: false,
      preferredMatchesCount: 0,
      untestedCount: 0,
    };
  }

  const measurements = listing.batches?.[0]?.measurements || [];
  const evaluatedProperties: MatchEvaluationResult['evaluatedProperties'] = [];
  let hardLimitsPassed = true;
  let preferredMatchesCount = 0;
  let untestedCount = 0;
  let passedCount = 0;
  const totalConstraints = spec.constraints.length || 1;

  for (const c of spec.constraints) {
    const matchMeasurement = measurements.find((m) =>
      m.property_name.toLowerCase().includes(c.property_name.toLowerCase()) ||
      c.property_name.toLowerCase().includes(m.property_name.toLowerCase())
    );

    let requiredRangeStr = '';
    if (c.lower_bound !== undefined && c.upper_bound !== undefined) {
      requiredRangeStr = `${c.lower_bound} - ${c.upper_bound} ${c.unit}`;
    } else if (c.lower_bound !== undefined) {
      requiredRangeStr = `≥ ${c.lower_bound} ${c.unit}`;
    } else if (c.upper_bound !== undefined) {
      requiredRangeStr = `≤ ${c.upper_bound} ${c.unit}`;
    } else {
      requiredRangeStr = `Must be tested (${c.unit})`;
    }

    if (!matchMeasurement || matchMeasurement.value === undefined || matchMeasurement.value === '') {
      untestedCount++;
      if (c.constraint_type === 'HARD_LIMIT' || c.constraint_type === 'REQUIRED_PROPERTY') {
        if (c.missing_data_policy === 'HOLD') {
          hardLimitsPassed = false;
        }
      }
      evaluatedProperties.push({
        name: c.property_name,
        constraintType: c.constraint_type,
        requiredRange: requiredRangeStr,
        measuredValue: 'Not Provided / Missing',
        pass: false,
        reason: `Missing test data (Policy: ${c.missing_data_policy})`,
      });
      continue;
    }

    const valNum = Number(matchMeasurement.value);
    let passes = true;
    let failReason = '';

    if (!isNaN(valNum)) {
      if (c.lower_bound !== undefined && valNum < c.lower_bound) {
        passes = false;
        failReason = `Below lower threshold ${c.lower_bound} ${c.unit}`;
      }
      if (c.upper_bound !== undefined && valNum > c.upper_bound) {
        passes = false;
        failReason = `Exceeds upper threshold ${c.upper_bound} ${c.unit}`;
      }
    }

    if (c.constraint_type === 'HARD_LIMIT' && !passes) {
      hardLimitsPassed = false;
    } else if (c.constraint_type === 'PREFERRED_RANGE' && passes) {
      preferredMatchesCount++;
    }

    if (passes) passedCount++;

    evaluatedProperties.push({
      name: c.property_name,
      constraintType: c.constraint_type,
      requiredRange: requiredRangeStr,
      measuredValue: `${matchMeasurement.value} ${matchMeasurement.unit}`,
      pass: passes,
      reason: passes ? 'Meets acceptance tolerance' : failReason,
    });
  }

  const scorePercentage = Math.round((passedCount / totalConstraints) * 100);
  const isCompatible = hardLimitsPassed && scorePercentage >= 60;

  return {
    isCompatible,
    scorePercentage,
    evaluatedProperties,
    hardLimitsPassed,
    preferredMatchesCount,
    untestedCount,
  };
}
