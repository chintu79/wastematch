# WasteMatch — Data Specification (DATA-SPEC.md)

**Version:** 1.0  
**Status:** Draft for implementation  
**Date:** 9 October 2026  
**Product:** WasteMatch  
**Pilot Region:** Pimpri-Chinchwad / Pune, Maharashtra, India

---

# 1. Purpose

This document defines the canonical data structures, material taxonomy, property dictionary, measurement standards, validation rules, provenance requirements, and data quality controls for WasteMatch.

The data model must support reliable industrial material matching without confusing waste categories, actual batch measurements, buyer-specific requirements, and regulatory eligibility.

The primary design principle is:

**Every material match must be based on structured data with traceable sources, explicit units, and clearly defined uncertainty.**

A material category describes a general type of material. A listing describes an offer. A batch represents a particular quantity. A measurement describes a property of that batch at a particular time. These entities must remain distinct.

# 2. Data Architecture Principles

## 2.1 Canonical Taxonomy

Material categories must use controlled identifiers rather than relying on free-text names.

## 2.2 Batch-Level Provenance

Technical properties must be linked to the batch or sample they describe.

## 2.3 Explicit Units

Every numeric property must have a unit or a documented dimensionless basis.

## 2.4 Measurement Basis

Where relevant, record whether a measurement is reported on an as-received, wet, dry, or other defined basis.

## 2.5 Source Traceability

Critical values must record their source, measurement date, and verification status where applicable.

## 2.6 Immutable Evaluation History

Previous matching and regulatory evaluations must remain traceable to the data and rules used at evaluation time.

## 2.7 Unknown Is Not Zero

Unknown, unmeasured, and not-applicable values must not be represented as zero.

## 2.8 Classification Is Evidence-Based

A waste category alone does not determine its legal classification. Source process, composition, applicable law, intended use, and other relevant attributes may change the classification.

# 3. Canonical Entity Model

The principal entities are:

1. User
2. Organization
3. OrganizationMembership
4. Facility
5. MaterialCategory
6. MaterialListing
7. MaterialBatch
8. PropertyDefinition
9. BatchMeasurement
10. EvidenceDocument
11. BuyerSpecification
12. SpecificationConstraint
13. RegulatoryRule
14. RegulatoryEvaluation
15. MatchCandidate
16. MatchEvaluation
17. TreatmentRoute
18. Inquiry
19. SampleRequest
20. AuditEvent

## 3.1 Relationship Overview

- One organization can have multiple facilities.
- One organization can generate multiple material listings.
- One listing can contain multiple batches.
- One batch can have multiple measurements.
- One measurement can reference supporting evidence.
- One buyer can have multiple receiving facilities and specifications.
- One specification can contain multiple constraints.
- One batch and specification can produce multiple historical candidate evaluations.
- Each evaluation references the regulatory and matching rule versions used.
- One candidate can have multiple inquiries and sample requests.
- Important changes generate audit events.

# 4. Material Taxonomy

WasteMatch must maintain a hierarchical material taxonomy.

The following is an initial taxonomy proposal for the Maharashtra pilot. Inclusion in this taxonomy does not automatically mean that a category is legally eligible for exchange.

| Category Code | Category | Example Subcategories |
|---|---|---|
| METAL | Metal scrap and residues | Ferrous scrap, aluminium scrap, copper scrap, metal-bearing residues |
| PLASTIC | Plastic waste | PET, HDPE, LDPE, PP, PVC, mixed polymers |
| PAPER | Paper and cardboard | Corrugated cardboard, mixed paper, paper production rejects |
| GLASS | Glass waste | Container glass, flat glass, glass cullet |
| ORGANIC | Organic waste | Food-processing residues, biodegradable organic residues |
| WOOD | Wood waste | Untreated wood, sawdust, wood-processing residues |
| TEXTILE | Textile waste | Cotton scraps, synthetic textiles, mixed textile waste |
| RUBBER | Rubber waste | Waste tyres, rubber manufacturing residues |
| E_WASTE | Electronic waste | Covered electronic equipment, components, circuit-board waste |
| BATTERY | Battery waste | Lead-acid, lithium-based, other battery chemistries |
| C_AND_D | Construction and demolition waste | Concrete, masonry, recovered aggregates |
| INDUSTRIAL_MINERAL | Mineral industrial residues | Fly ash, slag, foundry sand |
| CHEMICAL | Chemical and process residues | Used solvents, contaminated residues, process sludge |
| USED_OIL | Used oil | Applicable used-oil categories |
| BIOMEDICAL | Biomedical waste | Applicable regulated biomedical categories |

## 4.1 Taxonomy Requirements

Each category must include:

- Stable category code.
- Display name.
- Parent category.
- Definition.
- Inclusion criteria.
- Exclusion criteria.
- Relevant property definitions.
- Potential intended uses.
- Applicable regulatory-rule references.
- Required onboarding fields.
- Publication requirements.
- Active status.
- Version history.

## 4.2 Category Qualification

Before enabling a category for live matching, the product team must confirm:

1. Actual producer availability.
2. Actual buyer or processor demand.
3. Required technical measurements.
4. Relevant legal classification and regulatory obligations.
5. Available evidence and testing methods.
6. Feasible preprocessing routes.
7. Commercial viability for the pilot.

Categories without a validated regulatory and technical workflow must remain unavailable for automatic eligibility decisions.

# 5. Property Dictionary

The property dictionary defines which technical values the system can store and how they must be interpreted.

## 5.1 Core Property Groups

### Chemical Composition

Examples:

- Target constituent percentage.
- Polymer composition.
- Carbon content.
- Metal content.
- Mineral composition.
- Chlorine content.
- Sulphur content.
- Heavy-metal concentration.

### Physical Properties

Examples:

- Moisture content.
- Particle-size distribution.
- Bulk density.
- Loose or compacted density.
- Physical form.
- Colour, where relevant.
- Foreign-material fraction.

### Thermal Properties

Examples:

- Net calorific value.
- Ash content.
- Ignition-related properties.
- Thermal stability.

### Chemical and Biological Properties

Examples:

- pH.
- Corrosivity indicators.
- Biodegradability.
- Organic matter content.
- Carbon-to-nitrogen ratio.
- Pathogen indicators where relevant.

### Mechanical and Functional Properties

Examples:

- Compressive strength.
- Tensile strength.
- Abrasion resistance.
- Flowability.
- Setting behavior.
- Other application-specific product performance parameters.

Not every property applies to every material. Property applicability must be configured by category and receiving application.

# 6. Property Definition Schema

Each property definition must contain:

- `id`: UUID
- `code`: unique stable code
- `name`: human-readable name
- `description`: definition and intended interpretation
- `data_type`: numeric, categorical, boolean, or text
- `dimension`: physical dimension or dimensionless
- `canonical_unit`: preferred normalized unit
- `allowed_units`: compatible units
- `measurement_basis_options`: applicable bases
- `allowed_value_range`: validation range, where defensible
- `precision_policy`: accepted precision
- `applicable_categories`: relevant material categories
- `measurement_method_reference`: applicable method or standard
- `definition_version`: version number
- `active`: boolean

Example:

```json
{
  "code": "MOISTURE_CONTENT",
  "name": "Moisture Content",
  "data_type": "NUMERIC",
  "dimension": "DIMENSIONLESS_RATIO",
  "canonical_unit": "%",
  "allowed_units": ["%", "fraction"],
  "measurement_basis_options": [
    "AS_RECEIVED",
    "WET_BASIS",
    "DRY_BASIS"
  ],
  "definition_version": 1,
  "active": true
}
```

The example illustrates the schema. Actual measurement methods and conversion rules must be validated for the relevant property.

# 7. Measurement Data Model

Each batch measurement must preserve both the reported observation and its interpretation.

## 7.1 Required Fields

- Measurement ID.
- Batch ID.
- Property definition ID and version.
- Numeric or categorical value.
- Reported unit.
- Normalized value and unit, where conversion is valid.
- Measurement basis, where relevant.
- Measurement method.
- Sample reference.
- Measurement date.
- Reporting organization.
- Evidence document reference.
- Verification status.
- Reviewer and verification date, if applicable.
- Record creation timestamp.

## 7.2 Verification Status

Allowed statuses:

- `VERIFIED`
- `SUPPLIER_REPORTED`
- `ESTIMATED`
- `UNVERIFIED`
- `DISPUTED`
- `EXPIRED`

Status transitions must be controlled.

A verified measurement should retain the identity of the verifier and the evidence used to support verification.

An uploaded laboratory report is not automatically verified merely because the file exists.

## 7.3 Missing Data

Missing measurements must be represented explicitly.

Recommended states:

- `NOT_MEASURED`
- `NOT_REPORTED`
- `PENDING_TEST`
- `NOT_APPLICABLE`
- `CONFLICTING_RESULTS`

These may be stored as a separate measurement-availability record or an evaluation-level missing-field record rather than as fabricated measurement values.

`NOT_APPLICABLE` must include a reason when the property is mandatory for some materials or uses.

# 8. Unit Normalization

WasteMatch must use a controlled unit system and preserve original values.

## 8.1 Mass

Supported units may include:

- mg
- g
- kg
- metric tonne

## 8.2 Length and Particle Size

Supported units may include:

- µm
- mm
- cm
- m

## 8.3 Ratios and Concentrations

Supported representations may include:

- Percentage by mass.
- Percentage by volume, where applicable.
- mg/kg.
- g/kg.
- mg/L.
- Dimensionless fractions.

Conversions must preserve the measurement basis and applicable density or composition assumptions.

## 8.4 Energy

Supported units may include:

- kJ/kg
- MJ/kg
- kWh/kg, where applicable

## 8.5 Volume and Density

Supported units may include:

- L
- m³
- kg/m³
- g/cm³

## 8.6 Conversion Rules

- Store the original value and unit.
- Normalize values only when the conversion is mathematically and physically valid.
- Do not convert between wet-basis and dry-basis values without sufficient information.
- Do not infer volume from mass without a justified density value.
- Do not compare incompatible units.
- Record the conversion method or version when it affects the result.

# 9. Batch Data Requirements

A batch represents a specific material quantity and must have a stable identifier.

Required or conditionally required fields:

- Batch ID.
- Listing ID.
- Batch reference.
- Material category.
- Quantity and unit.
- Source facility.
- Generation or collection date, where available.
- Sample date, where applicable.
- Availability period.
- Measurement references.
- Evidence documents.
- Batch status.

## 9.1 Batch Statuses

- `DRAFT`
- `AVAILABLE`
- `RESERVED`
- `PARTIALLY_ALLOCATED`
- `DEPLETED`
- `WITHDRAWN`
- `EXPIRED`

Batch quantity changes must be recorded.

If multiple buyers reserve or allocate material, quantity updates must be transaction-safe to prevent overselling the available quantity.

# 10. Buyer Specification Data Model

A buyer specification defines the acceptable material properties for a particular receiving facility and intended use.

## 10.1 Specification Fields

- Specification ID.
- Buyer organization ID.
- Receiving facility ID.
- Target material category.
- Intended use.
- Specification version.
- Effective start and end dates.
- Required property constraints.
- Prohibited conditions.
- Required evidence.
- Minimum and maximum quantity.
- Quantity unit.
- Supply frequency.
- Preprocessing capabilities.
- Approval status.

## 10.2 Constraint Types

### HARD_LIMIT

The property must satisfy the defined boundary for direct acceptance.

### PREFERRED_RANGE

The property is preferred within a specified range but may be acceptable outside it.

### PROHIBITED_CONDITION

A condition that makes the proposed use impermissible or unacceptable under the applicable specification or rules.

### REQUIRED_PROPERTY

The property must be provided or verified according to the specification's missing-data policy.

## 10.3 Constraint Fields

- Constraint ID.
- Specification ID.
- Property definition ID.
- Constraint type.
- Lower bound, if applicable.
- Upper bound, if applicable.
- Unit.
- Required evidence flag.
- Missing-data policy.
- Optional validated treatment pathway.
- Effective dates.

The system must validate contradictory bounds and incompatible units before publication.

# 11. Regulatory Data Model

Regulatory requirements must be represented independently of the material's compatibility score.

## 11.1 Regulatory Rule

Fields:

- Rule ID.
- Stable rule code.
- Legal instrument title.
- Exact clause or schedule reference.
- Jurisdiction.
- Applicability conditions.
- Effective date.
- Supersession date, where applicable.
- Required registrations or authorizations.
- Required evidence.
- Exceptions and conditions.
- Official source reference.
- Rule version.
- Review status.
- Reviewer identity.
- Last review date.

## 11.2 Regulatory Evaluation

Fields:

- Evaluation ID.
- Candidate ID.
- Material batch.
- Producer and source facility.
- Receiving organization and facility.
- Intended use.
- Applicable rule versions.
- Evidence references.
- Eligibility status.
- Unresolved conditions.
- Decision reasons.
- Evaluation timestamp.
- Reviewer status.

## 11.3 Eligibility Statuses

- `ELIGIBLE`
- `HOLD`
- `INELIGIBLE`

Rules must not be activated for production decisions without the required review and source validation.

An eligibility determination applies only to its documented scope. It must not be generalized to every batch, destination, or intended use of the same category.

# 12. Match Evaluation Data Model

Each candidate evaluation must preserve:

- Material batch.
- Buyer specification and version.
- Regulatory evaluation.
- Technical evaluation status.
- Failed mandatory constraints.
- Missing measurements.
- Conflicting evidence.
- Required preprocessing.
- Estimated transport and processing costs.
- Technical compatibility score.
- Ranking score.
- Explanation.
- Matching algorithm version.
- Evaluation timestamp.

## 12.1 Technical Statuses

- `PASS`
- `CONDITIONAL`
- `FAIL`
- `UNKNOWN`
- `REQUIRES_REVIEW`

## 12.2 Ranking Rules

- Regulatory eligibility is evaluated first.
- Hard technical constraints are evaluated before ranking.
- Unknown mandatory values cannot be treated as passing.
- A failed constraint cannot be offset by a high weighted score.
- Treatment-based compatibility must identify the treatment assumptions and evidence.
- Blocked or unresolved candidates must not appear as fully qualified matches.

# 13. Data Quality Rules

## 13.1 Completeness

Track whether required fields are populated for each category and workflow.

## 13.2 Validity

Validate data types, allowed ranges, units, timestamps, and relationships.

## 13.3 Consistency

Detect contradictions such as:

- Moisture values expressed on incompatible bases.
- Quantity units inconsistent with associated measurements.
- Expired evidence used for a current evaluation.
- Conflicting values for the same batch and property.
- A listing referencing a batch belonging to another listing.

## 13.4 Timeliness

Record measurement dates and document validity periods.

Property freshness requirements must be configured by property, material category, intended use, and applicable rules. Do not assume one universal expiry period.

## 13.5 Provenance

Critical values must be traceable to a source, measurement, report, or documented estimation method.

## 13.6 Verification

Distinguish supplier-reported information from independently verified evidence.

Verification must not be inferred from completeness alone.

# 14. Data Access and Confidentiality

Classify data into access categories.

### Discovery Data

Potentially visible to authorized discovery users:

- Material category.
- General description.
- Approximate location.
- Availability range.
- Selected technical properties.

### Restricted Business Data

Accessible only to approved users or through a controlled inquiry:

- Exact facility location.
- Detailed source-process information.
- Specific quantity commitments.
- Detailed quality reports.
- Commercial terms.

### Highly Restricted Data

Accessible only to specifically authorized roles:

- Confidential process parameters.
- Sensitive commercial agreements.
- Internal compliance-review notes.
- Restricted legal or business records.

Actual access rules must be agreed with participating organizations.

All access restrictions must be enforced by the backend, not merely by hiding fields in the interface.

# 15. Data Retention and Versioning

- Material category definitions must be versioned.
- Property definitions must be versioned.
- Published buyer specifications must retain historical versions.
- Regulatory rules must preserve effective dates and supersession history.
- Measurements must not be silently overwritten.
- Match evaluations must retain their input and rule references.
- Documents must preserve relevant historical versions.
- Audit events must follow the approved retention policy.

Retention and deletion requirements must be reviewed against applicable law, contractual obligations, and operational needs.

# 16. Recommended Database Constraints

The relational database should enforce:

- Primary keys and foreign keys.
- Unique stable identifiers.
- Valid enum values or reference-table constraints.
- Positive quantities.
- Valid lower and upper bounds.
- Valid measurement types.
- Consistent organization and facility relationships.
- Referential integrity for evidence and evaluation records.
- Uniqueness for idempotency keys where needed.
- Transactional quantity allocation.
- Appropriate timestamps and concurrency controls.

Complex regulatory applicability and matching behavior must also be tested in application logic; database constraints alone are insufficient.

# 17. Data Import and Onboarding

Support structured CSV import for approved material categories.

The import process should:

1. Validate the file structure.
2. Identify the material category and property mapping.
3. Validate units and required fields.
4. Flag unknown categories and unsupported units.
5. Detect duplicate records.
6. Identify missing mandatory properties.
7. Preview the proposed changes.
8. Require confirmation before committing.
9. Record import source and timestamp.
10. Produce an error report for rejected rows.

Imports must not silently convert unverified source data into verified records.

# 18. Data Quality Metrics

Track:

- Percentage of listings with complete required fields.
- Percentage of batches with current critical measurements.
- Percentage of measurements linked to supporting evidence.
- Percentage of measurements with explicit units and basis.
- Percentage of specifications with valid constraints.
- Percentage of candidate evaluations with reproducible inputs.
- Number of conflicting measurements.
- Number of expired or unverified documents.
- Number of records requiring manual classification.

Metrics must distinguish missing information from confirmed noncompliance.

# 19. Acceptance Criteria

The data architecture is ready for implementation when:

1. The initial material taxonomy is approved.
2. Properties and units are defined for the pilot categories.
3. Batch-level provenance is supported.
4. Measurement verification states are implemented.
5. Buyer specifications support hard limits and preferred ranges.
6. Regulatory rules and evaluations are independently versioned.
7. Match evaluations preserve their input and rule references.
8. Unknown values remain distinct from zero and not-applicable values.
9. Confidential fields have documented access rules.
10. Data import validation is defined.
11. Historical evidence and decisions remain traceable.
12. Critical data-quality constraints have automated tests.

---

**End of DATA-SPEC.md v1.0**