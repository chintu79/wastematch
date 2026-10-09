# WasteMatch — API Specification

**Document ID:** WM-API-SPEC-007  
**Version:** 1.0  
**Status:** Draft for implementation planning  
**Project:** WasteMatch — Industrial Waste-to-Resource Matching Platform  
**Pilot Region:** Pune / Pimpri-Chinchwad, Maharashtra, India  
**API Prefix:** `/api/v1`

---

## 1. Purpose

This document defines the REST API contract for WasteMatch. It establishes how the frontend, backend, database, compliance evaluator, matching engine, and external integrations communicate.

The API must support:

- Organization and facility management.
- Industrial waste listing and batch management.
- Batch-specific material properties and supporting evidence.
- Buyer specifications and acceptance criteria.
- Regulatory eligibility evaluation.
- Technical compatibility evaluation.
- Commercial ranking of eligible matches.
- Buyer-supplier inquiries and sample qualification.
- Role-based access control and auditability.

**Core engineering principle:** Legal eligibility, technical compatibility, and commercial ranking are separate evaluations. A high commercial score must never override a legal prohibition or a failed hard technical constraint.

This document is a proposed contract. Endpoints and payloads must be validated against the pilot requirements and stakeholder research before they are treated as a frozen production interface.

## 2. Scope and assumptions

### 2.1 Architecture assumptions

- REST API using JSON over HTTPS.
- API prefix: `/api/v1`.
- Backend: Python with FastAPI and Pydantic, subject to final stack approval.
- Database: PostgreSQL.
- Authentication: OIDC/OAuth 2.0-compatible identity provider.
- Authorization: application-enforced role and organization-level access control.
- API documentation: generated OpenAPI specification.
- File uploads: private object storage with time-limited upload/download URLs.
- All timestamps: ISO 8601 in UTC.
- All persisted resource identifiers: UUIDs.
- Quantity values: decimal numbers with explicit units.
- Money values: decimal amounts with explicit currency, normally INR for the pilot.

### 2.2 API design principles

1. Use nouns for resource paths and HTTP methods for actions.
2. Validate requests at the API boundary.
3. Enforce permissions in the backend, not merely in the UI.
4. Never expose another organization's confidential data by default.
5. Treat missing or unverified material properties as unknown.
6. Record the versions of the data and rules used for each evaluation.
7. Make state-changing operations auditable.
8. Use explicit workflow actions for publication, approval, review, and evaluation.
9. Avoid returning internal stack traces or confidential implementation details.
10. Do not present a match as a guaranteed transaction or legally approved end-use.

## 3. Base URL and versioning

Development example:

`http://localhost:8000/api/v1`

Production example:

`https://api.example.com/api/v1`

The production hostname is a placeholder and must be configured during deployment.

The `/v1` contract must remain backward-compatible for existing clients. Breaking changes require a new API version or a documented migration plan.

### 3.1 Standard headers

| Header | Requirement | Purpose |
|---|---|---|
| `Authorization` | Required for protected endpoints | Bearer access token |
| `Content-Type` | Required for JSON request bodies | `application/json` |
| `Accept` | Recommended | `application/json` |
| `Idempotency-Key` | Required for designated retryable creation operations | Prevent duplicate resources |
| `If-Match` | Recommended for concurrent updates where supported | Prevent lost updates |
| `X-Request-ID` | Optional client-provided correlation ID | Troubleshooting |

The server must generate a request ID if the client does not supply one. It must validate any supplied value and avoid using untrusted identifiers as log content without sanitization.

## 4. Authentication and authorization

### 4.1 Authentication

The API accepts access tokens issued by the configured identity provider.

The backend must validate:

- Token signature.
- Issuer and audience.
- Expiration and not-before claims.
- Required scopes or equivalent permissions.
- Identity status where applicable.

The backend must not trust a user ID, organization ID, or role supplied in an unverified request body as proof of authorization.

### 4.2 Roles

| Role | Intended capabilities |
|---|---|
| `platform_admin` | Platform operations and administrative configuration |
| `compliance_reviewer` | Review compliance evaluations and approve regulatory rules within delegated scope |
| `organization_admin` | Manage organization membership, facilities, and organization resources |
| `waste_supplier` | Create and manage authorized waste listings and batches |
| `buyer` | Create buyer specifications and evaluate or review potential matches |
| `operations_user` | Manage assigned inquiries, samples, and operational workflow |
| `read_only` | Read resources explicitly shared with the user's organization |

These roles are a starting point. Production permissions must be refined with the pilot participants and mapped to explicit server-side policies.

A user may have multiple roles, but permissions must always be scoped to the relevant organization, facility, resource, and workflow.

### 4.3 Organization isolation

For organization-owned resources:

- Users may access only resources belonging to organizations in which they hold the required membership and permission.
- Cross-organization access is allowed only through explicit sharing and workflow rules.
- Confidential supplier information must not be exposed to buyers before the relevant disclosure is authorized.
- Listing discovery must return only fields approved for public or marketplace visibility.
- Administrative access must be audited.

For inaccessible resources, the API may return `404 Not Found` rather than disclose that the resource exists.

## 5. Standard response formats

### 5.1 Successful resource response

```json
{
  "data": {
    "id": "6f6d8f57-2c91-4b52-a5e5-3bce1b4d3b21",
    "status": "draft",
    "created_at": "2026-10-09T10:00:00Z",
    "updated_at": "2026-10-09T10:00:00Z"
  },
  "meta": {
    "request_id": "req_01_example"
  }
}
```

The resource fields shown above are illustrative. Each endpoint must define its actual schema.

### 5.2 Collection response

```json
{
  "data": [],
  "pagination": {
    "limit": 20,
    "next_cursor": null,
    "has_more": false
  },
  "meta": {
    "request_id": "req_01_example"
  }
}
```

### 5.3 Error response

All API errors must use a consistent structure.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {
        "field": "quantity.value",
        "issue": "Must be greater than zero."
      }
    ]
  },
  "meta": {
    "request_id": "req_01_example"
  }
}
```

Do not include stack traces, SQL statements, secrets, raw access tokens, or internal service credentials in error responses.

## 6. HTTP status codes

| Status | Meaning | Typical use |
|---|---|---|
| `200 OK` | Request completed | Reads, updates, evaluations |
| `201 Created` | Resource created | Listings, batches, specifications |
| `202 Accepted` | Work accepted asynchronously | Large evaluations or document processing |
| `204 No Content` | Successful operation without response body | Operations that need no representation |
| `400 Bad Request` | Malformed or unsupported request | Invalid query parameters |
| `401 Unauthorized` | Missing or invalid authentication | Invalid access token |
| `403 Forbidden` | Authenticated but not permitted | Insufficient permission |
| `404 Not Found` | Resource absent or intentionally concealed | Unknown or inaccessible resource |
| `409 Conflict` | State or uniqueness conflict | Duplicate action, invalid workflow transition |
| `412 Precondition Failed` | Update precondition failed | Stale `If-Match` version |
| `413 Content Too Large` | Upload exceeds configured limit | Oversized file |
| `415 Unsupported Media Type` | Unsupported content type | Invalid upload format |
| `422 Unprocessable Entity` | Valid JSON but invalid business data | Invalid material property or workflow input |
| `429 Too Many Requests` | Rate limit exceeded | Excessive API requests |
| `500 Internal Server Error` | Unexpected server failure | Unhandled internal error |
| `503 Service Unavailable` | Dependency unavailable | Temporarily unavailable evaluator |

## 7. Resource and workflow states

### 7.1 Material listing states

- `draft`
- `pending_review`
- `published`
- `paused`
- `closed`
- `archived`

Only authorized users may publish a listing. Publication must validate required fields and any applicable approval requirements.

### 7.2 Batch states

- `draft`
- `available`
- `reserved`
- `in_qualification`
- `committed`
- `dispatched`
- `received`
- `consumed`
- `cancelled`

A batch's state must not imply regulatory authorization. Legal eligibility is tracked separately.

### 7.3 Buyer specification states

- `draft`
- `pending_review`
- `published`
- `paused`
- `archived`

### 7.4 Compliance evaluation states

- `pending`
- `evaluated`
- `requires_review`
- `approved`
- `rejected`
- `superseded`
- `expired`

`approved` means the evaluation has passed the defined review process within its documented scope. It must not be presented as universal legal certification.

### 7.5 Match evaluation states

- `pending`
- `completed`
- `requires_data`
- `blocked`
- `failed`
- `superseded`

A completed evaluation may still conclude that the candidate is ineligible or incompatible.

### 7.6 Inquiry states

- `submitted`
- `accepted`
- `declined`
- `sampling`
- `qualification`
- `negotiation`
- `completed`
- `cancelled`

Allowed state transitions must be validated by the backend. Clients cannot freely set arbitrary workflow states through generic update endpoints.

## 8. Endpoint inventory

All endpoints below are under `/api/v1`. Unless explicitly stated otherwise, authentication and resource-level authorization are required.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/me` | Current user profile and accessible organization memberships |
| `GET` | `/organizations` | List organizations accessible to the caller |
| `POST` | `/organizations` | Create an organization |
| `GET` | `/organizations/{organization_id}` | Read organization |
| `PATCH` | `/organizations/{organization_id}` | Update organization |
| `POST` | `/organizations/{organization_id}/members` | Invite or add a member |
| `GET` | `/organizations/{organization_id}/facilities` | List facilities |
| `POST` | `/organizations/{organization_id}/facilities` | Create facility |
| `GET` | `/facilities/{facility_id}` | Read authorized facility |
| `PATCH` | `/facilities/{facility_id}` | Update facility |
| `POST` | `/materials/listings` | Create a listing |
| `GET` | `/materials/listings` | Discover visible listings |
| `GET` | `/materials/listings/{listing_id}` | Read a visible listing |
| `PATCH` | `/materials/listings/{listing_id}` | Update a listing |
| `POST` | `/materials/listings/{listing_id}/publish` | Validate and publish listing |
| `POST` | `/materials/listings/{listing_id}/batches` | Create a batch |
| `GET` | `/materials/batches/{batch_id}` | Read authorized batch |
| `PATCH` | `/materials/batches/{batch_id}` | Update permitted batch fields |
| `POST` | `/materials/batches/{batch_id}/measurements` | Add property measurements |
| `GET` | `/materials/batches/{batch_id}/measurements` | List authorized measurements |
| `POST` | `/materials/batches/{batch_id}/documents` | Register evidence document |
| `POST` | `/documents/upload-sessions` | Create a secure upload session |
| `GET` | `/documents/{document_id}` | Read document metadata |
| `GET` | `/documents/{document_id}/download-url` | Obtain a short-lived download URL |
| `POST` | `/specifications` | Create a buyer specification |
| `GET` | `/specifications` | List accessible specifications |
| `GET` | `/specifications/{specification_id}` | Read specification |
| `PATCH` | `/specifications/{specification_id}` | Update specification |
| `POST` | `/specifications/{specification_id}/publish` | Validate and publish specification |
| `POST` | `/compliance/evaluate` | Request regulatory evaluation |
| `GET` | `/compliance/evaluations/{evaluation_id}` | Read evaluation |
| `POST` | `/compliance/evaluations/{evaluation_id}/review` | Record authorized review decision |
| `GET` | `/admin/regulatory-rules` | List regulatory rules |
| `POST` | `/admin/regulatory-rules` | Create a draft rule |
| `POST` | `/admin/regulatory-rules/{rule_id}/approve` | Approve a rule version |
| `POST` | `/matches/evaluate` | Evaluate candidate matches |
| `GET` | `/matches` | List authorized match results |
| `GET` | `/matches/{match_id}` | Read match and evaluation details |
| `POST` | `/matches/{match_id}/re-evaluate` | Create a new evaluation |
| `POST` | `/inquiries` | Create an inquiry against a match or listing |
| `GET` | `/inquiries` | List accessible inquiries |
| `GET` | `/inquiries/{inquiry_id}` | Read inquiry |
| `PATCH` | `/inquiries/{inquiry_id}` | Update permitted inquiry fields |
| `POST` | `/inquiries/{inquiry_id}/sample-requests` | Request or record sample workflow |
| `POST` | `/inquiries/{inquiry_id}/documents` | Attach authorized workflow evidence |

The endpoint inventory is a baseline. Do not implement every endpoint simply because it exists in a document. Prioritize endpoints needed for the validated MVP workflows.

---

## 9. Identity and organization endpoints

### 9.1 Get current user

`GET /me`

Returns the authenticated user's profile and organization memberships.

Example response:

```json
{
  "data": {
    "id": "7bde9f38-1b90-4d76-ae3f-5f52bcf0b301",
    "display_name": "Example User",
    "email": "user@example.com",
    "memberships": [
      {
        "organization_id": "6f6d8f57-2c91-4b52-a5e5-3bce1b4d3b21",
        "role": "organization_admin",
        "status": "active"
      }
    ]
  },
  "meta": {
    "request_id": "req_01_example"
  }
}
```

The email and organization values are illustrative.

### 9.2 Create organization

`POST /organizations`

Permission: authenticated user with permission to create an organization.

Request:

```json
{
  "name": "Example Manufacturing Pvt Ltd",
  "organization_type": "waste_generator",
  "registered_address": {
    "line1": "Industrial Area",
    "city": "Pimpri-Chinchwad",
    "state": "Maharashtra",
    "postal_code": "411000",
    "country": "IN"
  }
}
```

Supported `organization_type` values must be defined in a controlled enumeration, initially including:

- `waste_generator`
- `waste_processor`
- `recycler`
- `buyer`
- `logistics_provider`
- `laboratory`
- `other`

Organizations may perform multiple business functions. The data model should not assume that an organization can belong to only one category.

Response: `201 Created`.

### 9.3 Add organization member

`POST /organizations/{organization_id}/members`

Permission: `organization_admin` for the target organization or authorized platform administrator.

Request:

```json
{
  "email": "colleague@example.com",
  "role": "buyer"
}
```

The implementation must define whether this endpoint sends an invitation, adds an already registered user, or supports both. Invitation status and acceptance must be represented explicitly. Email alone must not grant immediate access.

---

## 10. Material listing endpoints

### 10.1 Create listing

`POST /materials/listings`

Permission: authorized supplier or organization administrator.

Request:

```json
{
  "organization_id": "6f6d8f57-2c91-4b52-a5e5-3bce1b4d3b21",
  "facility_id": "7f6d8f57-2c91-4b52-a5e5-3bce1b4d3b22",
  "material_category": "metal_scrap",
  "material_name": "Mixed steel scrap",
  "description": "Illustrative steel scrap stream",
  "source_process": "Manufacturing offcuts",
  "visibility": "marketplace",
  "availability_type": "recurring"
}
```

The category is illustrative. The actual taxonomy must be agreed with pilot stakeholders.

Response: `201 Created`.

The backend must validate that the caller can create resources for the specified organization and facility.

### 10.2 Discover listings

`GET /materials/listings`

Supported query parameters:

- `material_category`
- `facility_id`
- `organization_id`, subject to permission
- `status`
- `visibility`
- `limit`
- `cursor`
- `sort`
- `q`

Example:

`GET /api/v1/materials/listings?material_category=metal_scrap&limit=20`

Rules:

- Default to `published` listings visible to the caller.
- Do not expose unpublished listings to unauthorized users.
- Apply organization and field-level visibility rules before returning results.
- Do not include private contact details or sensitive documents in discovery responses.
- Avoid accepting arbitrary database field names as sort parameters.

### 10.3 Publish listing

`POST /materials/listings/{listing_id}/publish`

Permission: authorized listing owner or reviewer where approval is required.

Request:

```json
{
  "confirm_required_fields": true
}
```

The server must independently validate all publication requirements. The client confirmation is not evidence that validation has passed.

The operation must fail with `422 Unprocessable Entity` if required fields, evidence, or applicable workflow approvals are missing.

### 10.4 Create batch

`POST /materials/listings/{listing_id}/batches`

Request:

```json
{
  "batch_reference": "BATCH-2026-001",
  "quantity": {
    "value": "12.500",
    "unit": "tonne"
  },
  "available_from": "2026-10-15T00:00:00Z",
  "available_until": "2026-11-15T00:00:00Z",
  "location": {
    "city": "Pimpri-Chinchwad",
    "state": "Maharashtra",
    "country": "IN"
  }
}
```

The example quantity and dates are placeholders, not a real material offer.

Rules:

- Quantity must be positive.
- Units must belong to a controlled unit registry.
- Availability dates must be internally consistent.
- Duplicate batch references within the defined scope must be rejected or explicitly handled.
- A batch must be traceable to its parent listing.
- A new batch must not automatically inherit a previous batch's measurements without explicit evidence that the values apply.

Response: `201 Created`.

---

## 11. Material measurements and evidence

### 11.1 Add measurement

`POST /materials/batches/{batch_id}/measurements`

Request:

```json
{
  "measurements": [
    {
      "property_code": "moisture_content",
      "value": "4.2",
      "unit": "percent",
      "method": "Illustrative test method",
      "measured_at": "2026-10-08T09:00:00Z",
      "source_type": "laboratory_report",
      "confidence": "verified",
      "document_id": "8f6d8f57-2c91-4b52-a5e5-3bce1b4d3b23"
    }
  ]
}
```

All example identifiers, property values, and test details are illustrative.

The API must validate:

- The property code exists in the material property registry.
- The unit is compatible with the property.
- The value is valid for the property's declared data type and bounds.
- The method and evidence fields meet the requirements for that property.
- The caller has permission to update the batch.
- The referenced document is accessible and authorized for this batch.

The measurement model should support:

- Numeric, categorical, Boolean, and textual values where appropriate.
- Unit and measurement method.
- Sampling and measurement timestamps.
- Laboratory or self-reported origin.
- Evidence document references.
- Verification status.
- Validity period, where relevant.
- Version history and supersession.

### 11.2 Unknown and unverified values

The API must distinguish:

- `unknown`: no usable value is available.
- `reported`: supplied by a source but not independently verified.
- `verified`: validated according to the property's verification policy.
- `rejected`: evidence or measurement failed review.
- `expired`: previously valid evidence is no longer accepted for the current evaluation.

A missing value must not be silently converted to zero, a default value, or a pass.

### 11.3 Documents

`POST /documents/upload-sessions`

Request:

```json
{
  "file_name": "material-analysis.pdf",
  "content_type": "application/pdf",
  "file_size_bytes": 245760,
  "purpose": "material_evidence"
}
```

The server returns a controlled upload URL or upload-session identifier, required headers, and expiration timestamp.

Upload controls must include:

- File size and content-type restrictions.
- Private object storage.
- Short-lived upload URLs.
- Malware scanning where available.
- File-type validation independent of the supplied filename.
- Access checks before issuing download URLs.
- Audit events for sensitive document access.
- Retention and deletion policies appropriate to the document type.

A successful upload does not mean the document has been reviewed or accepted.

---

## 12. Buyer specifications

### 12.1 Create specification

`POST /specifications`

Permission: authorized buyer or organization administrator.

Request:

```json
{
  "organization_id": "9f6d8f57-2c91-4b52-a5e5-3bce1b4d3b24",
  "facility_id": "af6d8f57-2c91-4b52-a5e5-3bce1b4d3b25",
  "title": "Steel scrap procurement specification",
  "material_categories": [
    "metal_scrap"
  ],
  "intended_use": "Steelmaking feedstock",
  "acceptance_criteria": [
    {
      "property_code": "moisture_content",
      "operator": "less_than_or_equal",
      "value": "5",
      "unit": "percent",
      "constraint_type": "hard",
      "required_evidence": true
    }
  ],
  "commercial_preferences": {
    "preferred_delivery_region": "Pune",
    "target_quantity": {
      "value": "10",
      "unit": "tonne"
    },
    "currency": "INR"
  }
}
```

This is an illustrative payload, not a validated acceptance specification. Actual material thresholds must come from the receiving facility's documented requirements and, where necessary, qualified technical review.

### 12.2 Acceptance criteria

Each criterion must contain:

- `property_code`
- `operator`
- `value` or an appropriate range
- `unit`, where applicable
- `constraint_type`
- `required_evidence`, where applicable

Initial operators may include:

- `equal`
- `not_equal`
- `less_than`
- `less_than_or_equal`
- `greater_than`
- `greater_than_or_equal`
- `between`
- `in`
- `not_in`

The API must validate operator compatibility with the property's type.

Supported `constraint_type` values:

- `hard`: failure blocks technical compatibility.
- `soft`: deviation can affect the ranking or require review.
- `informational`: displayed but does not independently affect eligibility.

A missing hard-constraint property must not be treated as a pass. Depending on the property's policy, the result must be `requires_data` or `requires_review`.

### 12.3 Publish specification

`POST /specifications/{specification_id}/publish`

The backend must verify required fields, criteria, units, and permission. A published specification must have a version identifier or equivalent immutable revision reference.

Changing a published specification must create a new revision or otherwise preserve the original version used in previous evaluations.

---

## 13. Compliance evaluation

### 13.1 Evaluate compliance

`POST /compliance/evaluate`

Purpose: evaluate regulatory applicability and eligibility for a specific material batch, intended use, location, and relevant facility context.

Request:

```json
{
  "batch_id": "bf6d8f57-2c91-4b52-a5e5-3bce1b4d3b26",
  "intended_use": "steelmaking_feedstock",
  "origin_facility_id": "cf6d8f57-2c91-4b52-a5e5-3bce1b4d3b27",
  "destination_facility_id": "df6d8f57-2c91-4b52-a5e5-3bce1b4d3b28",
  "destination_jurisdiction": {
    "country": "IN",
    "state": "Maharashtra",
    "district": "Pune"
  }
}
```

Response:

```json
{
  "data": {
    "evaluation_id": "ef6d8f57-2c91-4b52-a5e5-3bce1b4d3b29",
    "status": "requires_review",
    "eligibility": "HOLD",
    "reasons": [
      {
        "code": "REGULATORY_DATA_INCOMPLETE",
        "message": "Required information or authoritative rule mapping is incomplete."
      }
    ],
    "rule_set_version": "illustrative-version",
    "evaluated_at": "2026-10-09T10:15:00Z",
    "review_required": true
  },
  "meta": {
    "request_id": "req_02_example"
  }
}
```

The evaluation result and version in this example are illustrative.

### 13.2 Eligibility values

The API uses the following values:

- `ELIGIBLE`: applicable rules have been evaluated and the candidate is eligible within the recorded scope and evidence.
- `HOLD`: required information, interpretation, evidence, or human review is outstanding.
- `INELIGIBLE`: a validated applicable rule or required condition blocks the proposed route.

Important distinctions:

- `HOLD` is not approval.
- `ELIGIBLE` is not a universal legal certification.
- A missing regulatory rule must not automatically produce `ELIGIBLE`.
- A category label alone is not sufficient to determine regulatory status.
- Eligibility depends on relevant material properties, source, intended use, origin and destination, facility permissions, and applicable rules.

The API must preserve the reasons, evidence references, rule versions, jurisdiction, and review decisions used in the evaluation.

### 13.3 Compliance review

`POST /compliance/evaluations/{evaluation_id}/review`

Permission: authorized compliance reviewer.

Request:

```json
{
  "decision": "approved",
  "review_notes": "Reviewed against the cited rule set and supplied evidence.",
  "evidence_document_ids": [
    "8f6d8f57-2c91-4b52-a5e5-3bce1b4d3b23"
  ]
}
```

Allowed decisions must be explicitly enumerated, initially:

- `approved`
- `rejected`
- `request_information`

The backend must record the reviewer, timestamp, decision, notes, evidence, and evaluation version.

A review decision must not silently modify the underlying regulatory rule. Rule changes and evaluation decisions are separate auditable actions.

### 13.4 Regulatory rule administration

`GET /admin/regulatory-rules`

Returns authorized users a filtered list of rule metadata and versions.

`POST /admin/regulatory-rules`

Creates a draft rule version. Only users with delegated administrative permissions may perform this action.

`POST /admin/regulatory-rules/{rule_id}/approve`

Approves a rule version after the required review process.

Every rule must have, where applicable:

- Unique rule identifier.
- Title and source authority.
- Citation or authoritative source reference.
- Jurisdiction and scope.
- Effective date and expiry or review date.
- Material and process applicability.
- Required conditions or prohibitions.
- Evidence requirements.
- Version and approval history.
- Reviewer and approval timestamp.

Rules must be maintained through a controlled workflow. Unreviewed or expired rules must not be silently treated as authoritative.

---

## 14. Match evaluation

### 14.1 Evaluate candidate matches

`POST /matches/evaluate`

Purpose: compare eligible material batches with published buyer specifications.

Request:

```json
{
  "batch_id": "bf6d8f57-2c91-4b52-a5e5-3bce1b4d3b26",
  "specification_id": "0f6d8f57-2c91-4b52-a5e5-3bce1b4d3b30"
}
```

The backend must independently verify that the caller may access both resources and that both resource versions are suitable for evaluation.

### 14.2 Evaluation sequence

The matching engine must execute the following conceptual sequence:

1. Validate resource ownership, visibility, and workflow state.
2. Snapshot the batch and specification versions.
3. Resolve applicable regulatory rules and eligibility.
4. Stop or hold the candidate when regulatory evaluation blocks further progression.
5. Evaluate hard technical constraints.
6. Identify missing, stale, or unverified measurements.
7. Evaluate soft constraints and calculate technical compatibility.
8. Calculate commercial ranking only for candidates that have passed required gates.
9. Store the result, reasons, input versions, and evaluator version.
10. Return the evaluation result and next actions.

The implementation may use internal services or a modular monolith, but the externally visible semantics must remain consistent.

### 14.3 Match result schema

Example response:

```json
{
  "data": {
    "match_id": "1f6d8f57-2c91-4b52-a5e5-3bce1b4d3b31",
    "status": "completed",
    "batch_id": "bf6d8f57-2c91-4b52-a5e5-3bce1b4d3b26",
    "specification_id": "0f6d8f57-2c91-4b52-a5e5-3bce1b4d3b30",
    "eligibility": {
      "status": "HOLD",
      "evaluation_id": "ef6d8f57-2c91-4b52-a5e5-3bce1b4d3b29"
    },
    "technical_compatibility": {
      "status": "not_evaluated",
      "score": null
    },
    "commercial_ranking": {
      "status": "not_evaluated",
      "score": null
    },
    "blocking_reasons": [
      {
        "code": "COMPLIANCE_REVIEW_REQUIRED",
        "message": "Regulatory review must be completed before the candidate can proceed."
      }
    ],
    "missing_data": [],
    "evaluation_version": "illustrative-engine-version",
    "evaluated_at": "2026-10-09T10:20:00Z"
  },
  "meta": {
    "request_id": "req_03_example"
  }
}
```

The example demonstrates the shape of a held candidate. It is not a real match.

### 14.4 Result statuses

Technical compatibility may use:

- `compatible`
- `conditionally_compatible`
- `incompatible`
- `requires_data`
- `not_evaluated`

Commercial ranking may use:

- `ranked`
- `not_ranked`
- `not_evaluated`

A score must be `null` when it has not been computed. Never substitute zero for a score that is not applicable or not evaluated.

### 14.5 Match scoring

The API must not hardcode universal material thresholds or a single fixed scoring formula.

Scoring configuration must be versioned and must distinguish:

- Hard technical constraints.
- Soft technical preferences.
- Data confidence and evidence quality.
- Quantity and availability.
- Distance or logistics feasibility.
- Price and commercial preferences.
- Other pilot-approved factors.

Hard constraints are gates, not ordinary weighted factors. A high score on distance, quantity, or price cannot compensate for a failed hard technical constraint.

The match record must store the scoring configuration or version used for reproducibility.

### 14.6 Re-evaluate match

`POST /matches/{match_id}/re-evaluate`

Purpose: create a new evaluation using the latest authorized data and current approved rules.

The system must preserve the previous evaluation. It must not overwrite historical results in a way that removes the basis of earlier decisions.

If evaluation runs asynchronously, return `202 Accepted` with an evaluation or job identifier and a way to retrieve its status.

---

## 15. Match discovery and visibility

### 15.1 List matches

`GET /matches`

Supported query parameters:

- `batch_id`
- `specification_id`
- `eligibility`
- `technical_status`
- `status`
- `limit`
- `cursor`
- `sort`

Results must be limited to matches the caller is authorized to see.

The API must avoid revealing private supplier or buyer information through:

- Match counts.
- Error messages.
- Filters.
- Sorting.
- Unrestricted identifiers.
- Detailed blocking reasons that contain confidential information.

Use separate response projections for internal reviewers and external participants where their permissions differ.

### 15.2 Read match details

`GET /matches/{match_id}`

The response may include:

- Batch and specification identifiers.
- Authorized material summary.
- Eligibility status and permitted explanation.
- Technical compatibility status.
- Commercial ranking, where appropriate.
- Missing data and qualification requirements.
- Evidence summaries.
- Evaluation timestamp and version.
- Next permitted actions.

Do not return raw internal rules, confidential documents, private contact details, or another organization's sensitive acceptance criteria unless disclosure is authorized.

---

## 16. Inquiry and sample qualification

### 16.1 Create inquiry

`POST /inquiries`

Request:

```json
{
  "match_id": "1f6d8f57-2c91-4b52-a5e5-3bce1b4d3b31",
  "message": "Requesting further information and sample qualification.",
  "requested_quantity": {
    "value": "5",
    "unit": "tonne"
  }
}
```

An inquiry must reference a visible match or another explicitly supported listing reference. The backend must verify that the caller is authorized to initiate contact.

Response: `201 Created`.

### 16.2 List inquiries

`GET /inquiries`

Supported query parameters:

- `status`
- `organization_id`, subject to permission
- `match_id`
- `limit`
- `cursor`

Only participants and authorized administrators may view inquiry records.

### 16.3 Update inquiry

`PATCH /inquiries/{inquiry_id}`

Only mutable fields should be accepted. Workflow transitions must be validated against the current state.

Example request:

```json
{
  "message": "The buyer has requested a sample and updated test results."
}
```

A message update must not implicitly accept, decline, or complete an inquiry.

### 16.4 Sample request

`POST /inquiries/{inquiry_id}/sample-requests`

Request:

```json
{
  "sample_quantity": {
    "value": "2",
    "unit": "kilogram"
  },
  "requested_tests": [
    "moisture_content",
    "composition"
  ],
  "notes": "Illustrative qualification request."
}
```

The sample workflow should record:

- Requesting and supplying parties.
- Sample identifier.
- Material batch and batch version.
- Collection and dispatch details, where relevant.
- Requested tests.
- Chain-of-custody evidence where required.
- Results and supporting documents.
- Qualification outcome.
- Timestamps and responsible users.

Sample approval must not automatically authorize commercial shipment or override applicable legal requirements.

---

## 17. Pagination, filtering, and sorting

### 17.1 Cursor pagination

Collection endpoints should use cursor pagination.

Parameters:

- `limit`: integer from 1 to 100; default 20.
- `cursor`: opaque continuation token.

Example:

`GET /materials/listings?limit=20&cursor=eyJwYWdlIjoyfQ`

The example cursor is illustrative.

The API must validate limits and treat cursors as opaque. A cursor must not grant access to resources the caller could not otherwise read.

### 17.2 Sorting

Only documented sort keys are accepted.

Example:

`GET /materials/listings?sort=created_at_desc`

Unsupported sort fields must return a validation error.

### 17.3 Filtering

Filters must have documented types and allowed values. User input must be parameterized and validated before database queries.

Free-text search must not be treated as a permission boundary. Visibility filters must be enforced independently of search.

---

## 18. Validation and error codes

Recommended application error codes include:

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Request schema or field validation failed |
| `AUTHENTICATION_REQUIRED` | Valid authentication is required |
| `PERMISSION_DENIED` | Action not permitted |
| `RESOURCE_NOT_FOUND` | Resource missing or not visible |
| `RESOURCE_STATE_CONFLICT` | Operation invalid for current state |
| `VERSION_CONFLICT` | Resource has changed since it was read |
| `DUPLICATE_RESOURCE` | Uniqueness constraint violated |
| `MISSING_REQUIRED_DATA` | Required material or workflow information is missing |
| `EVIDENCE_INVALID` | Evidence is invalid, inaccessible, or rejected |
| `COMPLIANCE_REVIEW_REQUIRED` | Required compliance review remains incomplete |
| `REGULATORY_RULE_UNAVAILABLE` | Applicable rule data is missing or cannot be resolved |
| `TECHNICAL_CONSTRAINT_FAILED` | A hard technical constraint failed |
| `IDEMPOTENCY_CONFLICT` | Reused idempotency key has a different request payload |
| `RATE_LIMIT_EXCEEDED` | Request limit exceeded |
| `DEPENDENCY_UNAVAILABLE` | Required internal or external dependency is unavailable |

Error codes should remain stable even when the human-readable message changes.

Business validation errors should identify the field or rule involved without disclosing confidential information.

---

## 19. Idempotency and concurrency

### 19.1 Idempotency

Use the `Idempotency-Key` header for designated creation and command endpoints, including:

- Creating inquiries.
- Starting asynchronous evaluations.
- Creating upload sessions where retries could create duplicate sessions.
- Other operations identified during implementation.

Example:

`Idempotency-Key: 8b8a8a20-4e8d-4d2c-9b7e-7f0f3f6a1234`

The backend must store the key, authenticated scope, operation, request fingerprint, and result for a defined retention period.

If the same key is reused with the same request, return the original result where appropriate. If reused with a different request, return `409 Conflict` with `IDEMPOTENCY_CONFLICT`.

Idempotency does not replace database uniqueness constraints or transaction safety.

### 19.2 Optimistic concurrency

Resources that may be edited concurrently should expose a revision number or ETag.

For example:

`ETag: "revision-7"`

An update may require:

`If-Match: "revision-7"`

If the resource has changed, return `412 Precondition Failed` or the documented version-conflict response.

This prevents two users from unknowingly overwriting each other's changes.

---

## 20. Asynchronous processing

Some operations may require long-running evaluation or document processing.

Examples include:

- Complex compliance evaluation.
- Matching many candidate batches.
- Document malware scanning.
- Laboratory evidence processing.
- Bulk import.

For asynchronous operations, return `202 Accepted`.

Example:

```json
{
  "data": {
    "job_id": "2f6d8f57-2c91-4b52-a5e5-3bce1b4d3b32",
    "status": "pending",
    "status_url": "/api/v1/jobs/2f6d8f57-2c91-4b52-a5e5-3bce1b4d3b32"
  },
  "meta": {
    "request_id": "req_04_example"
  }
}
```

If a general jobs endpoint is implemented, it must have explicit authorization and documented retention. Otherwise, the API may expose operation-specific evaluation status endpoints.

Background jobs must be retry-safe and must not create duplicate evaluations or notifications when retried.

The system must distinguish:

- A request accepted for processing.
- A job completed successfully.
- A completed evaluation that returned `HOLD` or `INELIGIBLE`.
- A technical execution failure.

These are different states. Human interfaces should not collapse them into a single green checkmark.

---

## 21. Audit events

The backend must record audit events for significant actions, including:

- Organization membership and role changes.
- Listing publication and status changes.
- Batch measurements and evidence updates.
- Buyer specification changes and publication.
- Compliance evaluations and review decisions.
- Regulatory rule creation, modification, and approval.
- Match evaluation and re-evaluation.
- Inquiry and sample workflow transitions.
- Access to sensitive documents where required.
- Administrative overrides.

An audit event should include:

- Event identifier.
- Actor identifier.
- Actor organization, where relevant.
- Action.
- Resource type and identifier.
- Timestamp.
- Request ID.
- Relevant before-and-after state or a safe change summary.
- Reason for sensitive or privileged actions.

Audit records must not contain access tokens, passwords, unnecessary personal information, or entire confidential documents. Audit retention and access policies must be defined before production.

---

## 22. Security requirements

The API must implement:

1. HTTPS for all non-local environments.
2. Token validation and server-side authorization.
3. Organization-level data isolation.
4. Input validation and parameterized database access.
5. Rate limiting for authentication, search, and expensive evaluations.
6. File upload validation and private object storage.
7. Short-lived, scoped download links.
8. Protection against unauthorized resource enumeration.
9. Secret management outside source code.
10. Structured logging with sensitive-field redaction.
11. Dependency and container vulnerability checks.
12. Audit logging for privileged actions.
13. Configurable retention and deletion workflows.
14. Explicit consent and permission checks before disclosing business contact information.
15. Appropriate backup, recovery, and incident-response procedures.

The API must not rely on a frontend-hidden button or route as the only enforcement of a permission.

---

## 23. Observability and operational requirements

Each request should produce structured operational telemetry, including:

- Request ID.
- Endpoint and method.
- HTTP status.
- Duration.
- Authenticated actor identifier where appropriate.
- Error code for failed operations.
- Dependency timing for expensive operations.

Do not log confidential request bodies by default.

Recommended metrics:

- Request count and latency by endpoint.
- Error rate by endpoint and error code.
- Evaluation duration and failure rate.
- Number of evaluations in `pending` or `requires_review`.
- Document-processing failures.
- Queue depth and job retries.
- Database connection and query performance.
- Rate-limit events.

Operational alerts should be defined for elevated error rates, stalled jobs, unavailable dependencies, and repeated evaluation failures.

---

## 24. API testing requirements

### 24.1 Contract tests

Every endpoint must have tests for:

- Valid request and response schema.
- Missing required fields.
- Invalid types and units.
- Invalid enum values.
- Unknown resources.
- Unauthorized access.
- Cross-organization access attempts.
- Invalid workflow transitions.
- Duplicate requests.
- Concurrent updates.
- Error response format.
- Pagination behavior.

### 24.2 Matching and compliance tests

The following scenarios are mandatory:

| Scenario | Expected behavior |
|---|---|
| All required data present and applicable rules satisfied | Evaluation may proceed to technical compatibility |
| Regulatory status unknown | `HOLD`; no unconditional eligible result |
| Explicit applicable prohibition | `INELIGIBLE` |
| Required evidence missing | `HOLD` or `requires_data`, according to the defined policy |
| Hard technical threshold failed | `incompatible` |
| Soft preference missed | Candidate may remain compatible with a ranking impact |
| Unknown measurement | Must not be treated as zero or a pass |
| Measurement belongs to a different batch | Must not be silently reused |
| Evidence expired | Re-evaluation or review required where the property policy demands it |
| Published specification changes | Previous evaluation remains reproducible |
| Approved rule changes | New evaluations use the applicable approved rule version |
| Duplicate evaluation request retried | No unintended duplicate side effects |
| Unauthorized user requests another organization's data | Access denied or resource concealed |
| Commercial score is high but eligibility is `HOLD` | Candidate must not be represented as fully eligible |
| Commercial score is high but a hard constraint fails | Candidate must not be ranked as technically acceptable |

### 24.3 Integration tests

Test the full workflow:

1. Create organization and facility.
2. Create and publish material listing.
3. Create batch.
4. Add measurements and evidence.
5. Create and publish buyer specification.
6. Evaluate regulatory eligibility.
7. Evaluate match.
8. Resolve missing evidence or required review.
9. Re-evaluate after a controlled data change.
10. Create inquiry.
11. Request a sample.
12. Record qualification results.
13. Verify that each action is auditable and permission-scoped.

Use synthetic test data. Do not seed production with invented claims about real companies, regulatory approvals, or material properties.

---

## 25. MVP implementation priorities

### Phase 1: Essential workflows

Implement first:

- Authentication and `/me`.
- Organizations and facilities.
- Material listings and batches.
- Property measurements and document metadata.
- Buyer specifications.
- Regulatory evaluation interface with explicit `HOLD` behavior.
- Deterministic match evaluation.
- Match discovery with field-level visibility.
- Inquiry creation.
- Audit events.
- Core validation and authorization tests.

### Phase 2: Operational maturity

Add when justified by pilot evidence:

- Asynchronous bulk matching.
- Advanced search and geospatial filtering.
- Sample logistics and chain-of-custody.
- Laboratory integration.
- Notifications.
- Advanced analytics.
- External system integrations.
- More sophisticated commercial ranking.

Do not start with advanced optimization or a large microservice architecture before proving that users can supply the necessary data and trust the resulting recommendations.

---

## 26. Open decisions before API freeze

The engineering team must resolve these decisions before treating the specification as production-ready:

1. Which material categories are in the first pilot?
2. Which material properties and units are required per category?
3. Who owns and approves each buyer acceptance specification?
4. Which regulatory rules and authoritative sources are included in the initial scope?
5. Who is authorized to make compliance review decisions?
6. Which listing fields are public, organization-only, or shared only after inquiry?
7. Which evidence types are mandatory for each property and material category?
8. Which evaluation operations must run asynchronously?
9. What are the retention periods for measurements, documents, audit events, and evaluation records?
10. What are the exact rules for listing publication and workflow state transitions?
11. Which currencies, quantity units, and conversion rules are supported?
12. How will evaluation versions and historic results be reproduced?
13. What identity provider and invitation workflow will be used?
14. Which endpoint contracts need to be validated with frontend developers and pilot users?

These are product and governance decisions as much as engineering decisions. Coding around them without answers merely turns uncertainty into expensive code.

---

## 27. Definition of done

The API is ready for the MVP when:

- All agreed endpoints are documented in OpenAPI.
- Request and response schemas are implemented and validated.
- Authentication and organization-level authorization are tested.
- Sensitive fields are protected by explicit visibility rules.
- Listing, batch, and specification workflows operate end to end.
- Material properties retain their units, evidence, and verification state.
- Compliance and technical evaluation results are separate and versioned.
- Unknown data never silently becomes a pass.
- Failed hard constraints cannot be overridden by commercial ranking.
- Evaluation retries are safe.
- State transitions and sensitive actions are auditable.
- Error responses are consistent and do not leak internal details.
- Automated unit, integration, and authorization tests pass.
- Deployment configuration, logs, metrics, and operational alerts are documented.
- Unresolved regulatory or pilot assumptions are clearly marked rather than presented as validated facts.

**Final engineering rule:** WasteMatch's API is not just a CRUD interface for waste listings. It is the contract governing how uncertain industrial material data becomes a qualified business opportunity. Data provenance, permission boundaries, evaluation versioning, and explicit uncertainty are first-class requirements, not cleanup work for later.

---

**End of API-SPEC.md — Version 1.0**