'use client';

import React, { useState } from 'react';
import {
  SpecificationConstraint,
  ConstraintType,
  MissingDataPolicy,
} from '@/types/specification';
import {
  CONSTRAINT_TYPE_DEFINITIONS,
  MISSING_DATA_POLICY_DEFINITIONS,
  validateConstraintBounds,
} from '@/lib/specificationData';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ConstraintBuilderProps {
  constraints: SpecificationConstraint[];
  onChange: (constraints: SpecificationConstraint[]) => void;
}

export const ConstraintBuilder: React.FC<ConstraintBuilderProps> = ({
  constraints,
  onChange,
}) => {
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const handleUpdate = (index: number, updates: Partial<SpecificationConstraint>) => {
    const next = [...constraints];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const handleRemove = (index: number) => {
    const next = constraints.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleAddCustomConstraint = () => {
    const newConstraint: SpecificationConstraint = {
      id: `c-custom-${Date.now().toString().slice(-4)}`,
      property_name: '',
      constraint_type: 'HARD_LIMIT',
      lower_bound: undefined,
      upper_bound: undefined,
      unit: '%',
      required_evidence: true,
      missing_data_policy: 'HOLD',
      tolerance_policy: 'Custom plant acceptance parameter',
    };
    onChange([...constraints, newConstraint]);
  };

  const hardLimitsCount = constraints.filter((c) => c.constraint_type === 'HARD_LIMIT').length;
  const preferredCount = constraints.filter((c) => c.constraint_type === 'PREFERRED_RANGE').length;
  const prohibitedCount = constraints.filter((c) => c.constraint_type === 'PROHIBITED_CONDITION').length;

  return (
    <div className="space-y-6">
      {/* Header bar & Help toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Defined Constraints & Acceptance Matrix
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {constraints.length} Parameters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hardLimitsCount} Hard Limits • {preferredCount} Preferred Ranges • {prohibitedCount} Prohibitions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowHelpGuide(!showHelpGuide)}
            className="text-xs"
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1 text-slate-500" />
            <span>{showHelpGuide ? 'Hide Guidance' : 'Tolerance Guide'}</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAddCustomConstraint}
            className="text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span>Add Property</span>
          </Button>
        </div>
      </div>

      {/* Educational Guide Box (UI-UX § 6.6 plain language explanation) */}
      {showHelpGuide && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4.5 text-xs text-blue-950 space-y-3 transition-all shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-blue-900">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>Plain-Language Constraint Taxonomy & Missing-Data Protocols</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-3 rounded-lg border border-rose-200">
              <span className="font-bold text-rose-700 block text-xs">1. Hard Acceptance Limit</span>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Absolute physical boundary. Batches falling outside these thresholds are strictly blocked unless a pre-approved on-site preprocessing pathway exists.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-700 block text-xs">2. Preferred Operating Range</span>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Ideal quality window for peak furnace/extruder yield. Batches outside this window remain legally & technically eligible, but are ranked lower.
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-purple-200">
              <span className="font-bold text-purple-700 block text-xs">3. Prohibited Condition</span>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Ceiling for hazardous impurities or equipment-damaging toxins (e.g. chlorine, heavy metal leaching). Immediate match veto.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Constraints List */}
      {constraints.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-white">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No Acceptance Constraints Added</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add at least one material parameter to filter qualified byproduct streams.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCustomConstraint}
            className="mt-4"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add First Parameter
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {constraints.map((constraint, idx) => {
            const validation = validateConstraintBounds(constraint);
            const def = CONSTRAINT_TYPE_DEFINITIONS[constraint.constraint_type];

            return (
              <div
                key={constraint.id || idx}
                className={`rounded-xl border p-4.5 bg-white transition-all shadow-2xs ${
                  !validation.isValid
                    ? 'border-rose-400 bg-rose-50/30 ring-1 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Row Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                      {idx + 1}
                    </span>
                    <Input
                      value={constraint.property_name}
                      onChange={(e) => handleUpdate(idx, { property_name: e.target.value })}
                      placeholder="e.g. Silicon Dioxide (SiO2) Purity"
                      className="font-semibold text-sm max-w-md h-8.5"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${def.badgeColor}`}
                    >
                      {def.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Bounds & Policy Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-3.5">
                  {/* Constraint Type Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Constraint Type
                    </label>
                    <Select
                      value={constraint.constraint_type}
                      onChange={(e) =>
                        handleUpdate(idx, {
                          constraint_type: e.target.value as ConstraintType,
                        })
                      }
                      options={[
                        { value: 'HARD_LIMIT', label: 'Hard Acceptance Limit' },
                        { value: 'PREFERRED_RANGE', label: 'Preferred Operating Range' },
                        { value: 'PROHIBITED_CONDITION', label: 'Prohibited Condition' },
                        { value: 'REQUIRED_PROPERTY', label: 'Required Metric Only' },
                      ]}
                      className="text-xs h-9 py-1"
                    />
                  </div>

                  {/* Min Bound */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Min Lower Bound
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        step="any"
                        placeholder="No Min"
                        value={constraint.lower_bound !== undefined ? constraint.lower_bound : ''}
                        onChange={(e) =>
                          handleUpdate(idx, {
                            lower_bound: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        className="text-xs h-9"
                      />
                      <span className="text-xs font-semibold text-slate-500 w-12 text-center truncate">
                        {constraint.unit}
                      </span>
                    </div>
                  </div>

                  {/* Max Bound */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Max Upper Bound
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        step="any"
                        placeholder="No Max"
                        value={constraint.upper_bound !== undefined ? constraint.upper_bound : ''}
                        onChange={(e) =>
                          handleUpdate(idx, {
                            upper_bound: e.target.value === '' ? undefined : Number(e.target.value),
                          })
                        }
                        className="text-xs h-9"
                      />
                      <Input
                        type="text"
                        placeholder="Unit"
                        value={constraint.unit}
                        onChange={(e) => handleUpdate(idx, { unit: e.target.value })}
                        className="text-xs h-9 w-18 font-mono"
                        title="Measurement unit"
                      />
                    </div>
                  </div>

                  {/* Missing Data Policy */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Missing-Data Protocol
                    </label>
                    <Select
                      value={constraint.missing_data_policy}
                      onChange={(e) =>
                        handleUpdate(idx, {
                          missing_data_policy: e.target.value as MissingDataPolicy,
                        })
                      }
                      options={[
                        { value: 'HOLD', label: 'HOLD (Block batch)' },
                        { value: 'MANUAL_REVIEW', label: 'Manual Engineer Review' },
                        { value: 'NOT_APPLICABLE_WITH_EVIDENCE', label: 'N/A with Exemption' },
                      ]}
                      className="text-xs h-9 py-1"
                    />
                  </div>
                </div>

                {/* Additional Settings: Evidence required & Tolerance note */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Testing method / rationale (e.g., NABL test IS 1918 or ASTM C114)"
                      value={constraint.tolerance_policy || ''}
                      onChange={(e) => handleUpdate(idx, { tolerance_policy: e.target.value })}
                      className="text-[11px] h-8 bg-slate-50/50"
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={constraint.required_evidence}
                        onChange={(e) => handleUpdate(idx, { required_evidence: e.target.checked })}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Requires NABL Lab Certificate
                      </span>
                    </label>
                  </div>
                </div>

                {/* Contradictory Bounds Validation Warning */}
                {!validation.isValid && (
                  <div className="mt-2.5 rounded-lg bg-rose-100/80 px-3 py-1.5 text-xs font-semibold text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
                    <span>{validation.error}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
