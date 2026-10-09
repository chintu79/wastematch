'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  MATERIAL_CATEGORIES,
  getStoredListings,
} from '@/lib/materialData';
import {
  RECEIVING_FACILITIES,
  PREPROCESSING_OPTIONS,
  getDefaultConstraintsForCategory,
  createBuyerSpecification,
  evaluateListingMatch,
  validateConstraintBounds,
} from '@/lib/specificationData';
import { ConstraintBuilder } from '@/components/specifications/ConstraintBuilder';
import {
  MaterialCategoryCode,
} from '@/types/material';
import {
  SpecificationConstraint,
  SupplyFrequency,
  BuyerSpecification,
} from '@/types/specification';
import {
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Check,
  Flame,
  FileCheck2,
} from 'lucide-react';

import { Suspense } from 'react';

const TODAY_DATE = '2026-10-09';

function NewSpecificationFormContent() {
  const router = useRouter();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Material & Facility
  const [categoryCode, setCategoryCode] = useState<MaterialCategoryCode>('INDUSTRIAL_MINERAL');
  const [targetMaterialName, setTargetMaterialName] = useState('Secondary Foundry Silica Sand');
  const [intendedUse, setIntendedUse] = useState('Core Making & Green Sand Mold Replenishment');
  const [facilityId, setFacilityId] = useState(RECEIVING_FACILITIES[0].id);

  // Step 2: Demand & Logistics
  const [minQuantity, setMinQuantity] = useState<number>(100);
  const [maxQuantity, setMaxQuantity] = useState<number | undefined>(200);
  const [quantityUnit, setQuantityUnit] = useState('MT');
  const [frequency, setFrequency] = useState<SupplyFrequency>('recurring_monthly');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(60);
  const [effectiveFrom, setEffectiveFrom] = useState(TODAY_DATE);
  const [effectiveUntil, setEffectiveUntil] = useState('2027-03-31');

  // Step 3: Technical Constraints
  const [constraints, setConstraints] = useState<SpecificationConstraint[]>(() =>
    getDefaultConstraintsForCategory('INDUSTRIAL_MINERAL')
  );

  // Step 4: Preprocessing & Prohibitions
  const [selectedPreprocessing, setSelectedPreprocessing] = useState<string[]>([
    'Magnetic Iron Separation',
    'Sieve Screening & Mechanical Classification',
  ]);
  const [prohibitedNotes, setProhibitedNotes] = useState(
    'Free iron > 0.2% prohibited; Phenolic resin binder residue > 2.0% strictly prohibited.'
  );

  // Update default constraints when category changes (if user confirms or on initial load)
  const handleCategoryChange = (newCode: MaterialCategoryCode) => {
    setCategoryCode(newCode);
    const defaults = getDefaultConstraintsForCategory(newCode);
    setConstraints(defaults);

    // Provide helpful initial title suggestions
    const catObj = MATERIAL_CATEGORIES.find((c) => c.code === newCode);
    if (newCode === 'PLASTIC') {
      setTargetMaterialName('Recycled Polypropylene (PP Flakes)');
      setIntendedUse('Automotive HVAC Duct Housing Injection');
      setFacilityId(RECEIVING_FACILITIES[1].id);
    } else if (newCode === 'SLUDGE') {
      setTargetMaterialName('Neutralized Dewatered Lime Sludge');
      setIntendedUse('Agricultural Soil Conditioner & Pozzolanic Filler');
      setFacilityId(RECEIVING_FACILITIES[2].id);
    } else if (newCode === 'CHEMICAL') {
      setTargetMaterialName('Spent Hydrochloric Acid (Pickling Liquor)');
      setIntendedUse('Ferric Chloride Coagulant Synthesis');
      setFacilityId(RECEIVING_FACILITIES[3].id);
    } else if (newCode === 'METAL') {
      setTargetMaterialName('Secondary Aluminium Dross Offcuts');
      setIntendedUse('Deoxidizing Secondary Billet Remelt');
      setFacilityId(RECEIVING_FACILITIES[0].id);
    } else {
      setTargetMaterialName(catObj ? `Industrial ${catObj.label.split(' ')[0]}` : 'Feedstock Stream');
    }
  };

  const selectedFacility =
    RECEIVING_FACILITIES.find((f) => f.id === facilityId) || RECEIVING_FACILITIES[0];

  // Validation checks
  const invalidConstraints = constraints.filter((c) => !validateConstraintBounds(c).isValid);
  const hasInvalidBounds = invalidConstraints.length > 0;
  const isTitleEmpty = !targetMaterialName.trim();
  const isIntendedUseEmpty = !intendedUse.trim();

  const togglePreprocessing = (label: string) => {
    if (selectedPreprocessing.includes(label)) {
      setSelectedPreprocessing(selectedPreprocessing.filter((p) => p !== label));
    } else {
      setSelectedPreprocessing([...selectedPreprocessing, label]);
    }
  };

  // Preview matches against real marketplace listings
  const previewSpec: BuyerSpecification = {
    id: 'spec-preview',
    buyer_organization_id: 'org-buyer-001',
    buyer_organization_name: 'Mahindra Castings & Foundry Div',
    receiving_facility_id: selectedFacility.id,
    receiving_facility_name: selectedFacility.name,
    receiving_facility_zone: selectedFacility.zone,
    target_category_code: categoryCode,
    target_category_name: MATERIAL_CATEGORIES.find((c) => c.code === categoryCode)?.label || '',
    target_material_name: targetMaterialName,
    intended_use: intendedUse,
    specification_version: 1,
    specification_status: 'published',
    minimum_quantity: minQuantity,
    maximum_quantity: maxQuantity,
    quantity_unit: quantityUnit,
    frequency: frequency,
    max_distance_km: maxDistanceKm,
    acceptable_preprocessing: selectedPreprocessing,
    prohibited_contaminants_notes: prohibitedNotes,
    effective_from: effectiveFrom,
    effective_until: effectiveUntil,
    created_at: effectiveFrom || TODAY_DATE,
    updated_at: effectiveFrom || TODAY_DATE,
    constraints: constraints,
  };

  const allListings = getStoredListings();
  const evaluatedMatches = allListings.map((listing) => ({
    listing,
    result: evaluateListingMatch(previewSpec, listing),
  }));
  const qualifiedMatches = evaluatedMatches.filter((m) => m.result.isCompatible);

  const handleSave = (publish: boolean) => {
    if (hasInvalidBounds || isTitleEmpty || isIntendedUseEmpty) {
      alert('Please correct the validation errors before saving.');
      return;
    }

    const created = createBuyerSpecification({
      target_category_code: categoryCode,
      target_material_name: targetMaterialName,
      intended_use: intendedUse,
      receiving_facility_id: selectedFacility.id,
      receiving_facility_name: selectedFacility.name,
      receiving_facility_zone: selectedFacility.zone,
      minimum_quantity: minQuantity,
      maximum_quantity: maxQuantity,
      quantity_unit: quantityUnit,
      frequency: frequency,
      max_distance_km: maxDistanceKm,
      effective_from: effectiveFrom,
      effective_until: effectiveUntil,
      constraints: constraints,
      acceptable_preprocessing: selectedPreprocessing,
      prohibited_contaminants_notes: prohibitedNotes,
      specification_status: publish ? 'published' : 'draft',
    });

    router.push(`/dashboard/specifications/${created.id}`);
  };

  const steps = [
    { num: 1, label: 'Feedstock & Facility' },
    { num: 2, label: 'Demand & Logistics' },
    { num: 3, label: 'Constraint Matrix' },
    { num: 4, label: 'Preprocessing & Prohibitions' },
    { num: 5, label: 'Review & Publish' },
  ];

  return (
    <div className="space-y-6">
      {/* Back and Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/specifications"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Specifications</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create Buyer Specification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Define mandatory tolerances, preferred chemical envelopes, and automated matching criteria for receiving plants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={hasInvalidBounds || isTitleEmpty}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={hasInvalidBounds || isTitleEmpty}
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            <span>Publish Specification</span>
          </Button>
        </div>
      </div>

      {/* Progress Step Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((s, idx) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;

            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.num as any)}
                  className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] font-semibold hidden md:block ${
                      isActive ? 'text-emerald-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout (Form + Sticky Summary Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Container (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Feedstock & Facility */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>1. Feedstock Classification & Receiving Facility</CardTitle>
                <CardDescription>
                  Identify the material category, target byproduct stream, and specific plant location.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Material Category Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Target Material Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {MATERIAL_CATEGORIES.map((cat) => {
                      const isSelected = categoryCode === cat.code;
                      return (
                        <div
                          key={cat.code}
                          onClick={() => handleCategoryChange(cat.code)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{cat.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {cat.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Target Material Name */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Feedstock Stream Title / Name *
                  </label>
                  <Input
                    value={targetMaterialName}
                    onChange={(e) => setTargetMaterialName(e.target.value)}
                    placeholder="e.g. Secondary Foundry Silica Sand"
                    className="text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Name of the raw material byproduct stream you seek to substitute.
                  </p>
                </div>

                {/* Intended Process / Application */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Intended Process Application *
                  </label>
                  <Input
                    value={intendedUse}
                    onChange={(e) => setIntendedUse(e.target.value)}
                    placeholder="e.g. Core Making & Green Sand Mold Replenishment"
                    className="text-xs"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Crucial for legal evaluation: MPCB/CPCB rules assess co-processing suitability based on final use.
                  </p>
                </div>

                {/* Receiving Facility */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Receiving Plant / Facility
                  </label>
                  <Select
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    options={RECEIVING_FACILITIES.map((fac) => ({
                      value: fac.id,
                      label: `${fac.name} (${fac.zone})`,
                    }))}
                    className="text-xs h-9 py-1"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Must possess an active MPCB Consent to Operate (CTO) for receiving the target material.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">Step 1 of 5</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentStep(2)}
                  disabled={!targetMaterialName.trim() || !intendedUse.trim()}
                >
                  <span>Continue to Demand & Logistics</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 2: Demand & Logistics */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>2. Demand Volume & Logistics Constraints</CardTitle>
                <CardDescription>
                  Define volume consumption rates, delivery cadence, and maximum hauling distance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Min Volume Required *
                    </label>
                    <Input
                      type="number"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(Number(e.target.value))}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Max Capacity (Optional)
                    </label>
                    <Input
                      type="number"
                      value={maxQuantity !== undefined ? maxQuantity : ''}
                      onChange={(e) =>
                        setMaxQuantity(e.target.value ? Number(e.target.value) : undefined)
                      }
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Unit
                    </label>
                    <Select
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value)}
                      options={[
                        { value: 'MT', label: 'Metric Tonnes (MT)' },
                        { value: 'KL', label: 'Kilolitres (KL)' },
                        { value: 'KG', label: 'Kilograms (KG)' },
                        { value: 'Barrels', label: 'Standard Barrels' },
                      ]}
                      className="text-xs h-9 py-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Delivery Frequency
                    </label>
                    <Select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as SupplyFrequency)}
                      options={[
                        { value: 'recurring_monthly', label: 'Recurring Monthly Delivery' },
                        { value: 'recurring_weekly', label: 'Recurring Weekly Delivery' },
                        { value: 'recurring_quarterly', label: 'Recurring Quarterly Supply' },
                        { value: 'one_time_spot', label: 'One-Time Spot Consignment' },
                      ]}
                      className="text-xs h-9 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Max Commercial Haul Radius (km)
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={maxDistanceKm}
                        onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                        className="text-xs"
                      />
                      <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                        km from facility
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Effective Start Date
                    </label>
                    <Input
                      type="date"
                      value={effectiveFrom}
                      onChange={(e) => setEffectiveFrom(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Effective Until (Optional)
                    </label>
                    <Input
                      type="date"
                      value={effectiveUntil}
                      onChange={(e) => setEffectiveUntil(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Previous</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => setCurrentStep(3)}>
                  <span>Continue to Technical Constraints</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 3: Technical Constraints Matrix */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>3. Technical Constraints & Acceptance Matrix</CardTitle>
                <CardDescription>
                  Define hard acceptance boundaries, preferred operating ranges, and missing-data safety protocols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConstraintBuilder constraints={constraints} onChange={setConstraints} />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentStep(4)}
                  disabled={hasInvalidBounds}
                >
                  <span>Continue to Preprocessing & Prohibitions</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 4: Preprocessing & Prohibitions */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>4. Acceptable Preprocessing & Prohibited Impurities</CardTitle>
                <CardDescription>
                  Specify on-site treatment pathways you accept from suppliers, and explicit exclusion criteria.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Preprocessing Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Acceptable Preprocessing Pathways (Supplier or Partner Facility)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    If an off-spec batch can be brought into tolerance via one of these validated treatments, the candidate match will remain qualified with treatment requirements attached.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PREPROCESSING_OPTIONS.map((prep) => {
                      const isChecked = selectedPreprocessing.includes(prep.label);
                      return (
                        <div
                          key={prep.id}
                          onClick={() => togglePreprocessing(prep.label)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-200'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{prep.label}</span>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                            {prep.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prohibited Contaminants Notes */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Strict Contaminant Prohibitions & Exclusion Criteria
                  </label>
                  <textarea
                    rows={3}
                    value={prohibitedNotes}
                    onChange={(e) => setProhibitedNotes(e.target.value)}
                    placeholder="e.g. Free metallic iron > 0.2% prohibited; Phenolic resin binder residue > 2.0% strictly prohibited."
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Explicit contaminants that lead to immediate rejection regardless of technical compatibility.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Previous</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => setCurrentStep(5)}>
                  <span>Review & Match Simulation</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* STEP 5: Review & Publish */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>5. Review Specification & Live Match Simulation</CardTitle>
                <CardDescription>
                  Verify your defined criteria before activating automated matching across the Maharashtra network.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Live Match Engine Preview */}
                <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-700" />
                      <h4 className="text-sm font-bold text-emerald-950">
                        Live Matching Engine Simulation
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                      {qualifiedMatches.length} Compatible Batches Found
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Based on your {constraints.length} configured constraints and maximum radius of {maxDistanceKm} km, {qualifiedMatches.length} live material batch listings in the catalog meet all hard limits.
                  </p>

                  {/* Qualified Matches Snippet */}
                  {qualifiedMatches.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {qualifiedMatches.map(({ listing, result }) => (
                        <div
                          key={listing.id}
                          className="bg-white p-3 rounded-lg border border-emerald-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{listing.title}</span>
                            <span className="text-[11px] text-slate-500">
                              {listing.organization_name} • {listing.facility_zone} • Available: {listing.total_volume} {listing.unit}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-700 block">
                              {result.scorePercentage}% Fit
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {result.evaluatedProperties.filter((p) => p.pass).length}/{result.evaluatedProperties.length} criteria met
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specification Summary Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Defined Acceptance Summary
                  </h4>
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                    <div className="grid grid-cols-2 p-3 bg-slate-50 border-b border-slate-200">
                      <span className="text-slate-500">Feedstock Target:</span>
                      <span className="font-bold text-slate-900">{targetMaterialName}</span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-white border-b border-slate-200">
                      <span className="text-slate-500">Intended Application:</span>
                      <span className="font-semibold text-slate-800">{intendedUse}</span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-slate-50 border-b border-slate-200">
                      <span className="text-slate-500">Receiving Plant:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedFacility.name} ({selectedFacility.zone})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-white border-b border-slate-200">
                      <span className="text-slate-500">Demand Rate:</span>
                      <span className="font-semibold text-slate-800">
                        {minQuantity} {maxQuantity ? `- ${maxQuantity}` : ''} {quantityUnit} (
                        {frequency.replace('recurring_', '')})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-slate-50 border-b border-slate-200">
                      <span className="text-slate-500">Max Sourcing Radius:</span>
                      <span className="font-semibold text-slate-800">&lt; {maxDistanceKm} km</span>
                    </div>
                    <div className="grid grid-cols-2 p-3 bg-white">
                      <span className="text-slate-500">Accepted Preprocessing:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedPreprocessing.join(', ') || 'Direct feed only'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-slate-100 pt-4">
                <Button variant="outline" size="sm" onClick={() => setCurrentStep(4)}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Previous</span>
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(false)}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSave(true)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    <span>Publish & Activate</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Persistent Sticky Summary Panel (4 Cols, UI-UX § 6.6) */}
        <div className="lg:col-span-4 sticky top-6 space-y-4">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Specification Live Summary</CardTitle>
                <Badge variant="verified">Drafting v1</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-xs">
              {/* Material & Facility */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Feedstock
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {targetMaterialName || 'Untitled Stream'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{intendedUse || 'No application'}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Receiving Facility
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedFacility.name}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {selectedFacility.zone}
                </p>
              </div>

              {/* Volume & Cadence */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Demand & Distance
                </span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {minQuantity} {quantityUnit} / {frequency.replace('recurring_', '')}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">&lt; {maxDistanceKm} km delivery radius</p>
              </div>

              {/* Constraints Breakdown */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Configured Constraints ({constraints.length})
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Hard Limits:
                    </span>
                    <span className="font-bold text-slate-900">
                      {constraints.filter((c) => c.constraint_type === 'HARD_LIMIT').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Preferred Ranges:
                    </span>
                    <span className="font-bold text-slate-900">
                      {constraints.filter((c) => c.constraint_type === 'PREFERRED_RANGE').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-purple-500" />
                      Prohibited Conditions:
                    </span>
                    <span className="font-bold text-slate-900">
                      {constraints.filter((c) => c.constraint_type === 'PROHIBITED_CONDITION').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validation Warning in Sidebar if any */}
              {hasInvalidBounds ? (
                <div className="pt-2 border-t border-rose-200">
                  <div className="rounded-lg bg-rose-50 p-2 text-[11px] font-semibold text-rose-800 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>Contradictory bounds detected in constraints</span>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100">
                  <div className="rounded-lg bg-emerald-50 p-2 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>All constraint boundaries valid</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewSpecificationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading specification builder...
        </div>
      }
    >
      <NewSpecificationFormContent />
    </Suspense>
  );
}

