# WasteMatch — Technical Specification (TECH-SPEC)

**Version:** 1.0  
**Status:** Draft for implementation  
**Date:** 9 October 2026  
**Pilot Region:** Pimpri-Chinchwad / Pune, Maharashtra, India  
**Product:** WasteMatch  
**Document Owner:** Engineering Team

---

## 1. Purpose

This document defines the technical behavior, data validation rules, API requirements, matching logic, regulatory screening, and system-level acceptance criteria for WasteMatch.

The objective is to provide sufficient implementation detail for frontend and backend engineers to build a consistent, secure, and testable MVP.

The specification builds on the Product Requirements Document (PRD) and Software Architecture Document (SAD).

## 2. Technical Scope

### 2.1 Included in the MVP

- User authentication and organization management.
- Producer, buyer, recycler, and facility profiles.
- Waste material listings and batch-level records.
- Technical property measurements and supporting evidence.
- Buyer specifications and acceptance criteria.
- Regulatory eligibility evaluation for validated pilot categories.
- Rule-based material matching and candidate ranking.
- Document upload and verification.
- Buyer-producer inquiry workflows.
- Administrative review and audit logging.

### 2.2 Excluded from the MVP

- Automatic legal certification.
- Autonomous approval of regulated waste transfers.
- Fully automated payments and logistics procurement.
- Nationwide coverage of all waste categories.
- Unvalidated AI-based chemical composition prediction.
- Automated approval of material based solely on images.
- Automatic execution of legally binding contracts.

## 3. Proposed Technology Stack

The following is the initial implementation proposal and must be confirmed by the engineering team.

| Layer | Proposed Technology |
|---|---|
| Frontend | React, Next.js, TypeScript |
| UI styling | Tailwind CSS or an equivalent component system |
| Backend | Python, FastAPI |
| Data validation | Pydantic |
| Database | PostgreSQL |
| Geospatial queries | PostGIS, if required |
| ORM and migrations | SQLAlchemy and Alembic |
| File storage | Private S3-compatible object storage |
| Authentication | OIDC-compatible identity provider |
| Background processing | Durable job queue and worker |
| API documentation | OpenAPI |
| Testing | Pytest and frontend testing framework |
| Deployment | Containerized application with CI/CD |

## 4. System Modules

The backend must be divided into the following logical modules.

### 4.1 Identity Module

Responsibilities:

- User registration and authentication integration.
- Organization creation and management.
- Organization membership and role assignment.
- Facility-level permissions.
- Organization verification status.

Roles:

- PRODUCER
- BUYER
- RECYCLER
- ADMIN
- COMPLIANCE_REVIEWER

A user may hold more than one business role. Privileged roles must be explicitly assigned and audited.

### 4.2 Material Catalog Module

Responsibilities:

- Material category management.
- Waste listing creation and updates.
- Batch creation and availability management.
- Quantity and unit validation.
- Technical measurement storage.
- Supporting document association.
- Listing publication and archival.

### 4.3 Buyer Specification Module

Responsibilities:

- Creation of receiver-specific requirements.
- Hard minimum and maximum limits.
- Preferred operating ranges.
- Prohibited material conditions.
- Required evidence and test methods.
- Preprocessing capabilities.
- Quantity, frequency, and location requirements.

### 4.4 Regulatory Module

Responsibilities:

- Versioned rule management.
- Applicability evaluation.
- Required evidence validation.
- Authorization and registration checks.
- Eligibility decisions.
- Human-review workflow.
- Audit trail of rule evaluations.

### 4.5 Matching Module

Responsibilities:

- Candidate discovery.
- Legal eligibility filtering.
- Technical constraint evaluation.
- Treatment feasibility assessment.
- Logistics and commercial ranking.
- Explanation generation.
- Match evaluation versioning.

### 4.6 Qualification Module

Responsibilities:

- Buyer inquiries.
- Requests for additional information.
- Sample requests.
- Technical evaluation status.
- Supplier qualification tracking.
- Rejection reasons and closure.

## 5. Core Data Model

The following entities are required.

### 5.1 User

Fields:

- id: UUID, primary key
- email: unique, normalized email
- full_name: string
- identity_provider_id: string
- account_status: enum
- created_at: timestamp
- updated_at: timestamp

Authentication credentials should not be stored directly if an external identity provider is used.

### 5.2 Organization

Fields:

- id: UUID, primary key
- legal_name: string
- organization_type: enum
- verification_status: enum
- registered_address: structured address
- contact_details: restricted fields
- created_at: timestamp
- updated_at: timestamp

### 5.3 Facility

Fields:

- id: UUID, primary key
- organization_id: UUID, foreign key
- name: string
- address: structured address
- latitude: decimal, optional
- longitude: decimal, optional
- jurisdiction: string
- industrial_estate: optional string
- facility_status: enum

Facility jurisdiction must be determined from validated location information, not inferred solely from a city name.

### 5.4 MaterialCategory

Fields:

- id: UUID, primary key
- code: unique string
- name: string
- parent_category_id: optional UUID
- description: string
- category_status: enum

Categories must be controlled and versioned. Free-text descriptions may supplement but must not replace the canonical category.

### 5.5 MaterialListing

Fields:

- id: UUID, primary key
- producer_organization_id: UUID, foreign key
- source_facility_id: UUID, foreign key
- material_category_id: UUID, foreign key
- material_description: string
- source_process: string
- available_quantity: decimal
- quantity_unit: controlled unit
- availability_start: timestamp, optional
- availability_end: timestamp, optional
- location_visibility: enum
- listing_status: enum
- created_at: timestamp
- updated_at: timestamp

Listing statuses:

- DRAFT
- PENDING_REVIEW
- PUBLISHED
- PAUSED
- CLOSED
- REJECTED

A published listing must meet the required data and review conditions defined for its category.

### 5.6 MaterialBatch

Fields:

- id: UUID, primary key
- listing_id: UUID, foreign key
- batch_reference: string
- quantity: decimal
- quantity_unit: controlled unit
- generated_at: timestamp, optional
- sampled_at: timestamp, optional
- batch_status: enum
- created_at: timestamp

Each batch represents a specific material quantity. Measurements from one batch must not silently be reused as measured values for another batch.

### 5.7 PropertyDefinition

Fields:

- id: UUID, primary key
- code: unique string
- name: string
- data_type: enum
- canonical_unit: string
- measurement_basis_options: array or related table
- validation_schema: structured JSON
- definition_version: integer
- active: boolean

Examples include moisture content, target constituent percentage, ash content, particle size, pH, and calorific value.

Not all properties apply to all materials.

### 5.8 BatchMeasurement

Fields:

- id: UUID, primary key
- batch_id: UUID, foreign key
- property_definition_id: UUID, foreign key
- numeric_value: decimal, nullable
- text_value: string, nullable
- unit: string
- measurement_basis: string, optional
- measurement_method: string, optional
- sample_reference: string, optional
- measured_at: timestamp, optional
- reported_by_organization_id: UUID, optional
- evidence_document_id: UUID, optional
- verification_status: enum
- created_at: timestamp

Verification statuses:

- VERIFIED
- SUPPLIER_REPORTED
- ESTIMATED
- UNVERIFIED
- DISPUTED
- EXPIRED

The schema must prevent invalid combinations of numeric and text values. Numeric measurements must use valid units and compatible conversions.

### 5.9 BuyerSpecification

Fields:

- id: UUID, primary key
- buyer_organization_id: UUID, foreign key
- receiving_facility_id: UUID, foreign key
- target_category_id: UUID, foreign key
- intended_use: string
- specification_version: integer
- minimum_quantity: decimal, optional
- maximum_quantity: decimal, optional
- quantity_unit: string, optional
- specification_status: enum
- effective_from: timestamp
- effective_until: timestamp, optional
- created_at: timestamp

### 5.10 SpecificationConstraint

Fields:

- id: UUID, primary key
- specification_id: UUID, foreign key
- property_definition_id: UUID, foreign key
- constraint_type: enum
- lower_bound: decimal, optional
- upper_bound: decimal, optional
- unit: string
- required_evidence: boolean
- missing_data_policy: enum
- tolerance_policy: structured JSON, optional

Constraint types:

- HARD_LIMIT
- PREFERRED_RANGE
- PROHIBITED_CONDITION
- REQUIRED_PROPERTY

Missing-data policies:

- HOLD
- MANUAL_REVIEW
- NOT_APPLICABLE_WITH_EVIDENCE

The system must not treat missing data as passing a hard constraint.

### 5.11 RegulatoryRule

Fields:

- id: UUID, primary key
- rule_code: unique string
- title: string
- legal_instrument: string
- legal_clause_reference: string
- jurisdiction_level: enum
- applicability_definition: structured JSON
- required_conditions: structured JSON
- effective_from: date
- effective_until: date, optional
- review_status: enum
- source_reference: string
- reviewed_by: optional UUID
- reviewed_at: optional timestamp
- rule_version: integer

Legal rules must have identifiable authoritative sources. Unreviewed draft rules must not be used to produce a final eligible decision.

### 5.12 RegulatoryEvaluation

Fields:

- id: UUID, primary key
- candidate_id: UUID, foreign key
- rule_set_version: string
- eligibility_status: enum
- decision_reasons: structured JSON
- evidence_references: structured JSON
- unresolved_conditions: structured JSON
- evaluated_at: timestamp
- reviewer_id: optional UUID
- review_status: enum

Eligibility statuses:

- ELIGIBLE
- HOLD
- INELIGIBLE

### 5.13 MatchEvaluation

Fields:

- id: UUID, primary key
- candidate_id: UUID, foreign key
- material_batch_id: UUID, foreign key
- buyer_specification_id: UUID, foreign key
- regulatory_evaluation_id: UUID, foreign key
- technical_status: enum
- compatibility_score: decimal, nullable
- ranking_score: decimal, nullable
- missing_fields: structured JSON
- failed_constraints: structured JSON
- treatment_requirements: structured JSON
- explanation: structured JSON
- matching_algorithm_version: string
- evaluated_at: timestamp

The score must be nullable for blocked or unverified candidates. A missing or blocked evaluation must not be represented as a score of zero without a distinct status.

## 6. API Specification

All endpoints must require authentication unless explicitly marked public.

Base path:

`/api/v1`

All request and response bodies use JSON except file uploads, which use multipart requests or authorized object-storage upload URLs.

### 6.1 Organization APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/organizations` | Create an organization |
| GET | `/organizations/{organization_id}` | Retrieve an authorized organization |
| PATCH | `/organizations/{organization_id}` | Update permitted fields |
| POST | `/organizations/{organization_id}/members` | Invite or add a member |
| GET | `/organizations/{organization_id}/facilities` | List authorized facilities |

### 6.2 Material APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/materials/listings` | Create a listing |
| GET | `/materials/listings` | Search published listings |
| GET | `/materials/listings/{listing_id}` | Retrieve an authorized listing |
| PATCH | `/materials/listings/{listing_id}` | Update a listing |
| POST | `/materials/listings/{listing_id}/publish` | Request publication |
| POST | `/materials/listings/{listing_id}/batches` | Create a batch |
| POST | `/materials/batches/{batch_id}/measurements` | Record measurements |
| POST | `/materials/batches/{batch_id}/documents` | Associate evidence |

### 6.3 Buyer Specification APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/specifications` | Create a specification |
| GET | `/specifications` | List authorized specifications |
| GET | `/specifications/{specification_id}` | Retrieve a specification |
| PATCH | `/specifications/{specification_id}` | Update a draft specification |
| POST | `/specifications/{specification_id}/publish` | Publish a specification |

Published specifications must be versioned. Updating a published specification must create a new version or an equivalent immutable revision record.

### 6.4 Matching APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/matches/evaluate` | Evaluate a candidate pair |
| GET | `/matches` | Retrieve authorized candidate matches |
| GET | `/matches/{match_id}` | Retrieve match explanation and evidence |
| POST | `/matches/{match_id}/re-evaluate` | Re-evaluate using current approved inputs |

Every evaluation must record the versions of the relevant specifications, regulatory rules, and matching algorithm.

### 6.5 Regulatory APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/compliance/evaluate` | Evaluate regulatory eligibility |
| GET | `/compliance/evaluations/{evaluation_id}` | Retrieve an evaluation |
| POST | `/compliance/evaluations/{evaluation_id}/review` | Submit an authorized review decision |
| GET | `/admin/regulatory-rules` | List rules for authorized reviewers |
| POST | `/admin/regulatory-rules` | Create a draft rule |
| POST | `/admin/regulatory-rules/{rule_id}/approve` | Approve a reviewed rule version |

Only authorized roles may create, approve, or activate legal rules. Rule activation must be auditable.

### 6.6 Qualification APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/inquiries` | Create an inquiry |
| GET | `/inquiries` | List authorized inquiries |
| GET | `/inquiries/{inquiry_id}` | Retrieve an inquiry |
| PATCH | `/inquiries/{inquiry_id}` | Update an allowed workflow state |
| POST | `/inquiries/{inquiry_id}/sample-requests` | Request a sample |
| POST | `/inquiries/{inquiry_id}/documents` | Request or submit documents |

### 6.7 API Response Conventions

Successful requests return the appropriate HTTP status and a JSON response.

Common status codes:

- 200: Successful retrieval or update.
- 201: Resource created.
- 202: Request accepted for asynchronous processing.
- 400: Invalid request structure.
- 401: Authentication required.
- 403: Permission denied.
- 404: Resource not found or intentionally concealed.
- 409: State conflict or duplicate operation.
- 413: File too large.
- 422: Semantic validation failure.
- 429: Rate limit exceeded.
- 500: Unexpected server error.

Error responses must include a stable error code, a readable message, and field-level details where appropriate. They must not expose stack traces, secrets, or confidential data.

## 7. Matching Algorithm

### 7.1 Inputs

- Material batch.
- Producer and source facility.
- Buyer specification and receiving facility.
- Required material properties.
- Regulatory rule set and evidence.