'use client';

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  MATERIAL_CATEGORIES,
  CATEGORY_DEFAULT_PROPERTIES,
  createNewListing,
} from '@/lib/materialData';
import {
  MaterialCategoryCode,
  MaterialMeasurement,
  EvidenceDocument,
  ListingFormData,
} from '@/types/material';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FileWarning,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';

const TODAY_DATE = '2026-10-09';

function NewListingFormContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [category, setCategory] = useState<MaterialCategoryCode>('INDUSTRIAL_MINERAL');
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [sourceProcess, setSourceProcess] = useState('');
  const [priorContaminants, setPriorContaminants] = useState('');

  // Step 2: Quantity & Facility
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('MT/month');
  const [availabilityType, setAvailabilityType] = useState<'recurring_monthly' | 'recurring_weekly' | 'one_time_lot'>('recurring_monthly');
  const [batchRef, setBatchRef] = useState('LOT-2026-B01');
  const [availableFrom, setAvailableFrom] = useState(TODAY_DATE);
  const [availableUntil, setAvailableUntil] = useState('');
  const [facilityId] = useState(user?.organization?.facilities?.[0]?.id || 'fac-001');
  const [facilityName, setFacilityName] = useState(user?.organization?.facilities?.[0]?.name || 'Primary Production Plant');
  const [facilityZone, setFacilityZone] = useState(user?.organization?.address?.industrial_zone || 'Bhosari MIDC, Pune');

  // Step 3: Technical Properties
  const [measurements, setMeasurements] = useState<MaterialMeasurement[]>(() => {
    const defaults = CATEGORY_DEFAULT_PROPERTIES['INDUSTRIAL_MINERAL'] || [];
    return defaults.map((d, idx) => ({
      id: `m-${idx}`,
      property_name: d.name,
      value: '',
      unit: d.unit,
      basis: 'as_received',
      measurement_date: TODAY_DATE,
      laboratory_name: 'In-House Quality Cell',
      nabl_accredited: false,
      is_verified: true,
    }));
  });

  // Step 4: Documents
  const [documents, setDocuments] = useState<EvidenceDocument[]>([
    {
      id: 'doc-initial',
      title: 'Preliminary NABL Laboratory Analysis Report',
      document_type: 'lab_test_report',
      file_name: 'Chemical_Analysis_Report_2026.pdf',
      file_size: '1.2 MB',
      issue_date: TODAY_DATE,
      issuing_authority: 'Choksi NABL Laboratories Ltd Pune',
      nabl_accreditation_no: 'TC-5542',
      is_verified: true,
    },
  ]);

  // Handle Category Change & update default property templates
  const handleCategoryChange = (newCat: MaterialCategoryCode) => {
    setCategory(newCat);
    const defaults = CATEGORY_DEFAULT_PROPERTIES[newCat] || [];
    setMeasurements(
      defaults.map((d, idx) => ({
        id: `m-${idx}`,
        property_name: d.name,
        value: '',
        unit: d.unit,
        basis: 'as_received',
        measurement_date: TODAY_DATE,
        laboratory_name: 'In-House Quality Cell',
        nabl_accredited: false,
        is_verified: true,
      }))
    );
  };

  // Add custom property row
  const addPropertyRow = () => {
    setMeasurements((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        property_name: '',
        value: '',
        unit: '%',
        basis: 'as_received',
        measurement_date: TODAY_DATE,
        nabl_accredited: false,
        is_verified: false,
      },
    ]);
  };

  const removePropertyRow = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMeasurementField = (id: string, field: keyof MaterialMeasurement, value: string | number | boolean) => {
    setMeasurements((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Add Document
  const addDocument = () => {
    const newDoc: EvidenceDocument = {
      id: `doc-${Date.now()}`,
      title: 'Certified NABL Test Certificate',
      document_type: 'lab_test_report',
      file_name: `NABL_Report_${Date.now().toString().slice(-4)}.pdf`,
      file_size: '950 KB',
      issue_date: TODAY_DATE,
      issuing_authority: 'Accredited Environmental Testing Lab',
      nabl_accreditation_no: 'TC-9912',
      is_verified: true,
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Pre-flight checks
  const isIdentityComplete = title.trim() !== '' && grade.trim() !== '' && sourceProcess.trim() !== '';
  const isQuantityValid = quantity > 0;
  const hasVerifiedDocument = documents.some((d) => d.is_verified);
  const calculatedRegulatoryStatus = hasVerifiedDocument ? 'eligible' : 'on_hold';

  // Submission handler
  const handleFinalSubmit = (listingStatus: 'published' | 'draft') => {
    const formData: ListingFormData = {
      category_code: category,
      title: title || 'Industrial Byproduct Listing',
      grade: grade || 'Standard Commercial Grade',
      description: description || 'Secondary industrial material available for circular reuse in compliance with MPCB norms.',
      source_process: sourceProcess || 'Manufacturing and machining process',
      prior_contaminants: priorContaminants || 'None reported',
      facility_id: facilityId,
      facility_name: facilityName,
      facility_zone: facilityZone,
      availability_type: availabilityType,
      quantity,
      unit,
      batch_reference: batchRef,
      available_from: availableFrom,
      available_until: availableUntil,
      measurements,
      documents,
      visibility: 'marketplace',
      status: listingStatus,
    };

    const orgId = user?.organization?.id || 'org-prod-001';
    const orgName = user?.organization?.name || 'Tata AutoComp Systems Ltd';

    const created = createNewListing(formData, orgId, orgName);
    router.push(`/dashboard/listings/${created.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/listings"
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="h-3 w-3" /> Back to Listings
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Post Waste Material Listing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step industrial waste listing with verifiable technical properties & NABL evidence
          </p>
        </div>
      </div>

      {/* Wizard Step Progression Bar */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
        {[
          { step: 1, label: '1. Identity' },
          { step: 2, label: '2. Volume & Site' },
          { step: 3, label: '3. Technical Specs' },
          { step: 4, label: '4. Lab Evidence' },
          { step: 5, label: '5. Review' },
        ].map((item) => (
          <button
            key={item.step}
            type="button"
            onClick={() => setCurrentStep(item.step as 1 | 2 | 3 | 4 | 5)}
            className={`py-2 px-1 rounded-lg border text-[11px] sm:text-xs transition-all cursor-pointer ${
              currentStep === item.step
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : currentStep > item.step
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Step 1: Material Identity */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Section A: Material Identity & Generation Process</CardTitle>
            <CardDescription>
              Select the controlled material category and describe how the byproduct is produced.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Material Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MATERIAL_CATEGORIES.map((cat) => (
                  <div
                    key={cat.code}
                    onClick={() => handleCategoryChange(cat.code)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                      category === cat.code
                        ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{cat.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Listing Title / Material Name"
                placeholder="e.g. Spent Silica Casting Sand"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="Specific commercial designation of the waste stream."
                required
              />
              <Input
                label="Quality Grade / Mesh Specification"
                placeholder="e.g. Grade-A 50-60 AFS Uncalcined"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                helperText="Particle size, resin system, or purity class."
                required
              />
            </div>

            <Input
              label="Source Process / Industrial Origin"
              placeholder="e.g. Secondary mold shakeout & magnetic iron separator line"
              value={sourceProcess}
              onChange={(e) => setSourceProcess(e.target.value)}
              helperText="Explain the manufacturing operation that generates this material."
              required
            />

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Material Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide physical consistency, packaging (e.g. bulk bags, loose tippers), handling requirements..."
                  className="w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600"
                />
              </div>

              <Input
                label="Known Prior Contaminants or Foreign Matter"
                placeholder="e.g. Phenolic resin trace < 1.5%, zero free metallic iron"
                value={priorContaminants}
                onChange={(e) => setPriorContaminants(e.target.value)}
                helperText="Disclose trace oils, chemicals, or binders for regulatory safety."
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              variant="primary"
              onClick={() => setCurrentStep(2)}
              disabled={!isIdentityComplete}
            >
              <span>Next: Volume & Site Details</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Quantity & Facility */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Section B & C: Quantity, Batch Schedule & Facility Location</CardTitle>
            <CardDescription>
              Specify production volumes, recurring cadence, and the originating facility in Pune/PCMC.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Available Volume / Quantity"
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                required
              />
              <Select
                label="Measurement Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                options={[
                  { value: 'MT/month', label: 'Metric Tonnes per month (MT/month)' },
                  { value: 'MT', label: 'Metric Tonnes (One-time lot)' },
                  { value: 'kg/day', label: 'Kilograms per day (kg/day)' },
                  { value: 'KL/month', label: 'Kilolitres per month (KL/month)' },
                ]}
              />
              <Select
                label="Supply Frequency"
                value={availabilityType}
                onChange={(e) => setAvailabilityType(e.target.value as 'recurring_monthly' | 'recurring_weekly' | 'one_time_lot')}
                options={[
                  { value: 'recurring_monthly', label: 'Continuous Recurring Supply (Monthly)' },
                  { value: 'recurring_weekly', label: 'Continuous Recurring Supply (Weekly)' },
                  { value: 'one_time_lot', label: 'One-Time Spot Lot' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Batch / Manifest Reference"
                value={batchRef}
                onChange={(e) => setBatchRef(e.target.value)}
                helperText="Internal batch identifier for traceability."
                required
              />
              <Input
                label="Available From Date"
                type="date"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                required
              />
              <Input
                label="Available Until (Optional)"
                type="date"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                helperText="Leave empty for continuous recurring stream."
              />
            </div>

            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Originating Facility & Industrial Zone
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Plant / Facility Name"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  required
                />
                <Select
                  label="Industrial Cluster Zone"
                  value={facilityZone}
                  onChange={(e) => setFacilityZone(e.target.value)}
                  options={[
                    { value: 'Bhosari MIDC, Pune', label: 'Bhosari MIDC (Pimpri-Chinchwad)' },
                    { value: 'Chakan MIDC Phase 1-4, Pune', label: 'Chakan MIDC (Automotive Hub)' },
                    { value: 'Talegaon MIDC, Pune', label: 'Talegaon Industrial Estate' },
                    { value: 'Hinjawadi Biotech/Clean Zone', label: 'Hinjawadi Industrial Area' },
                    { value: 'Hadapsar / Mundhwa', label: 'Hadapsar / Mundhwa Estate' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back: Identity</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setCurrentStep(3)}
              disabled={!isQuantityValid}
            >
              <span>Next: Technical Properties</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Technical Properties Matrix */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Section D: Technical Properties & Chemical Assay</CardTitle>
                <CardDescription>
                  Enter measured parameters for {category.replace('_', ' ')}. Matches will evaluate hard limits against these values.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addPropertyRow}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Custom Property
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Property Name</th>
                    <th className="px-3 py-2.5">Measured Value</th>
                    <th className="px-3 py-2.5">Unit</th>
                    <th className="px-3 py-2.5">Measurement Basis</th>
                    <th className="px-3 py-2.5">Testing Lab / Method</th>
                    <th className="px-2 py-2.5 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="p-2 w-1/3">
                        <input
                          type="text"
                          value={m.property_name}
                          onChange={(e) => updateMeasurementField(m.id, 'property_name', e.target.value)}
                          placeholder="Property name"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2 w-28">
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => updateMeasurementField(m.id, 'value', e.target.value)}
                          placeholder="e.g. 96.4"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2 w-24">
                        <input
                          type="text"
                          value={m.unit}
                          onChange={(e) => updateMeasurementField(m.id, 'unit', e.target.value)}
                          placeholder="%"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-2 w-32">
                        <select
                          value={m.basis}
                          onChange={(e) => updateMeasurementField(m.id, 'basis', e.target.value as 'as_received' | 'dry_weight' | 'normalized')}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 bg-white"
                        >
                          <option value="as_received">As Received</option>
                          <option value="dry_weight">Dry Basis</option>
                          <option value="normalized">Normalized</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={m.laboratory_name || ''}
                          onChange={(e) => updateMeasurementField(m.id, 'laboratory_name', e.target.value)}
                          placeholder="e.g. NABL Choksi Lab"
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => removePropertyRow(m.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded"
                          title="Remove row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-[11px] text-blue-800 border border-blue-200">
              <span className="font-bold">Explainable Matching Tip:</span> High-precision assays with verified testing methods ensure immediate algorithmic compatibility with automotive and foundry buyers.
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back: Volume & Site</span>
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(4)}>
              <span>Next: Supporting Lab Documents</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Supporting Evidence & NABL Documents */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <CardTitle>Section E: Supporting Evidence & Laboratory Certificates</CardTitle>
                <CardDescription>
                  Upload certified test reports, MSDS, or MPCB authorization letters.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addDocument}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Attach Document
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <FileWarning className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No lab certificates attached</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Without NABL-accredited test reports, this listing will be marked <strong>On Hold</strong> and cannot be transferred.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={addDocument}>
                  Attach NABL Report
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            NABL Certified
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.file_name} • {doc.file_size} • Authority: {doc.issuing_authority} (Accr: {doc.nabl_accreditation_no})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Remove document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200">
              <span className="font-bold">UI-UX Principle 2.1 (Trust Before Convenience):</span> Test certificates are cross-verified against NABL registry TC identifiers. Unverified self-declarations cannot be published as confirmed fact.
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back: Technical Specs</span>
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(5)}>
              <span>Next: Pre-Flight Review</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 5: Publication Review & Pre-Flight Checks */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Section F: Pre-Flight Publication Review</CardTitle>
            <CardDescription>
              Validate all mandatory criteria before releasing this industrial material stream to the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pre-Flight Checklist */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pre-Flight Validation Checklist
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Material Category & Grade Specified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Facility Location: {facilityZone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Available Volume: {quantity} {unit}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasVerifiedDocument ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <FileWarning className="h-4 w-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {hasVerifiedDocument
                      ? 'Certified NABL Test Report Attached'
                      : 'Missing NABL Lab Report (Will place on Hold)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Regulatory State */}
            <div className={`p-4 rounded-xl border ${
              calculatedRegulatoryStatus === 'eligible'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-2">
                <Badge variant={calculatedRegulatoryStatus}>
                  {calculatedRegulatoryStatus === 'eligible' ? 'Legal Eligibility: Eligible' : 'Legal Eligibility: On Hold'}
                </Badge>
                <span className="text-xs font-bold">
                  {calculatedRegulatoryStatus === 'eligible'
                    ? 'Material Meets Pilot Regulatory Pre-Clearance'
                    : 'Evidence Review Pending'}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed">
                {calculatedRegulatoryStatus === 'eligible'
                  ? 'Your stream will be immediately visible to authorized buyers and matching algorithms across the PCMC cluster.'
                  : 'Due to missing NABL laboratory certificates, this stream will be created with status "On Hold". It cannot be dispatched until evidence is uploaded.'}
              </p>
            </div>

            {/* Summary Preview Box */}
            <div className="rounded-xl border border-slate-200 p-4 bg-white text-xs space-y-2">
              <h5 className="font-bold text-slate-900 text-sm">{title || 'Untitled Material'}</h5>
              <div className="text-slate-600 grid grid-cols-2 gap-2 text-[11px]">
                <p><strong>Grade:</strong> {grade}</p>
                <p><strong>Origin:</strong> {sourceProcess}</p>
                <p><strong>Volume:</strong> {quantity} {unit} ({availabilityType.replace('_', ' ')})</p>
                <p><strong>Facility:</strong> {facilityName} ({facilityZone})</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-700">Specified Properties ({measurements.length}):</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {measurements.map((m) => (
                    <span key={m.id} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                      {m.property_name}: {m.value || 'N/A'} {m.unit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back: Evidence</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => handleFinalSubmit('draft')}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                onClick={() => handleFinalSubmit('published')}
              >
                <Check className="h-4 w-4 mr-1" />
                <span>Validate & Publish Listing</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default function NewMaterialListingPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-500">
          Loading material listing form...
        </div>
      }
    >
      <NewListingFormContent />
    </Suspense>
  );
}
