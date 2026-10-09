# WasteMatch — Test Plan

**Document ID:** WM-TEST-PLAN-008  
**Version:** 1.0  
**Status:** Draft for implementation planning  
**Project:** WasteMatch — Industrial Waste-to-Resource Matching Platform  
**Pilot Region:** Pune / Pimpri-Chinchwad, Maharashtra, India

---

## 1. Purpose

This document defines the testing strategy for WasteMatch, including functional correctness, matching-engine behavior, regulatory evaluation, security, data integrity, API contracts, and end-to-end workflows.

The objective is to verify that WasteMatch produces results that are:

- Technically defensible.
- Traceable to their input data.
- Consistent with approved business rules.
- Secure across organizational boundaries.
- Honest about missing or uncertain information.
- Reproducible for auditing and debugging.

Testing must verify not only whether a workflow succeeds, but whether the platform correctly refuses to produce an unsafe, unauthorized, or unsupported result.

**Critical principle:** A successful API response does not necessarily mean a material match is acceptable. Tests must validate the business meaning of each result, not merely its HTTP status code.

## 2. Testing objectives

The test program must establish that:

1. Users can complete the approved MVP workflows.
2. Organization-level permissions prevent unauthorized access.
3. Material properties are validated against controlled definitions and units.
4. Missing, stale, or unverified data is handled explicitly.
5. Regulatory eligibility is evaluated independently of commercial ranking.
6. Hard technical constraints cannot be overridden by soft preferences.
7. Match evaluations retain the exact versions of their input data and rules.
8. Repeated requests do not create unintended duplicate operations.
9. Sensitive documents and business information remain protected.
10. The platform remains stable under expected pilot workloads.
11. Failures are observable and recoverable.
12. The frontend communicates uncertainty without misleading users.

## 3. Scope

### 3.1 In scope

- Authentication and authorization.
- Organization and facility management.
- Material listings and batches.
- Property measurements and evidence documents.
- Buyer specifications.
- Compliance evaluation and reviewer workflows.
- Technical compatibility and commercial ranking.
- Match discovery and visibility.
- Inquiries and sample qualification.
- API validation, pagination, and errors.
- Database integrity and migrations.
- Audit events.
- Logging and operational metrics.
- Deployment smoke tests and recovery checks.

### 3.2 Out of scope for the initial MVP

Unless required by the approved pilot:

- Large-scale performance benchmarking.
- Fully automated legal interpretation.
- Unvalidated AI-based material classification.
- Automatic approval of end-use applications.
- Production integrations with every external laboratory or waste-management system.
- Autonomous contracting, payments, or shipment authorization.
- Predictive pricing models without reliable training and validation data.

Out-of-scope items must not be presented in product demonstrations as capabilities already validated by testing.

## 4. Testing principles

### 4.1 Test risk before convenience

Prioritize failures that could cause:

- An ineligible material to be recommended as usable.
- A hard technical constraint to be ignored.
- Confidential business information to be disclosed.
- A historical evaluation to become irreproducible.
- An unauthorized user to publish, approve, or alter data.
- A duplicate operation to create conflicting business records.

### 4.2 Use deterministic rules

The initial matching engine should be deterministic for a fixed input snapshot, approved rule set, and evaluator version.

Given the same relevant inputs and versions, the engine should return the same substantive result. Timestamps, request IDs, and other operational metadata may differ.

### 4.3 Unknown is not failure, and unknown is not success

The system must distinguish:

- A verified value that passes.
- A verified value that fails.
- A missing value.
- An unverified value.
- An expired or invalid measurement.
- A result requiring human review.

These states must be covered explicitly in automated tests.

### 4.4 Separate test environments

Use separate development, test, staging, and production environments where feasible.

Never run destructive tests against production data. Test accounts, documents, regulatory rules, and material listings must be clearly separated from real pilot records.

## 5. Test levels

| Level | Purpose | Examples |
|---|---|---|
| Unit tests | Verify individual functions | Unit conversion, threshold evaluation |
| Component tests | Verify a service or module | Matching engine, document validation |
| API contract tests | Verify request and response schemas | Required fields, error format |
| Integration tests | Verify interactions between components | API, database, object storage |
| Security tests | Verify access boundaries | Cross-organization resource access |
| End-to-end tests | Verify complete user workflows | Supplier-to-buyer qualification |
| Performance tests | Verify response times and capacity | Search and evaluation workloads |
| Regression tests | Prevent previously fixed failures | Historical edge cases |
| User acceptance tests | Verify operational usefulness | Pilot user tasks and acceptance criteria |

## 6. Test environment and tooling

Proposed tools, subject to stack approval:

- Backend: `pytest`.
- API testing: FastAPI test client or equivalent HTTP test client.
- Database: isolated PostgreSQL test database.
- Frontend: approved component and browser testing framework.
- API contract validation: OpenAPI schema checks.
- Security checks: static analysis, dependency scanning, and targeted authorization tests.
- Load testing: a suitable HTTP load-testing tool.
- CI/CD: automated test execution on pull requests and releases.

Tests must not depend on live external services unless the test is specifically designed as a controlled integration test.

Use mocks or local test doubles for identity providers, external document services, and other dependencies when testing core application logic.

## 7. Test data strategy

### 7.1 Synthetic data

Create synthetic organizations, facilities, listings, batches, measurements, specifications, users, and documents.

Synthetic records must be labeled clearly so they cannot be confused with real suppliers, real waste streams, or actual regulatory approvals.

Example test organizations:

- `TEST-SUPPLIER-A`
- `TEST-BUYER-B`
- `TEST-RECYCLER-C`
- `TEST-LAB-D`

These are test identifiers, not real businesses.

### 7.2 Data categories

The test dataset must include:

1. Complete and verified material records.
2. Missing critical measurements.
3. Self-reported and unverified measurements.
4. Expired laboratory reports.
5. Contradictory measurements.
6. Invalid or incompatible units.
7. Material batches from different dates and sources.
8. Buyer specifications with hard and soft constraints.
9. Eligible, held, and ineligible regulatory scenarios.
10. Duplicate references and concurrent updates.
11. Unauthorized cross-organization access attempts.
12. Published and unpublished resources.

### 7.3 No invented production thresholds

Thresholds in tests must come from approved specification fixtures or explicitly labeled synthetic scenarios.

A synthetic threshold is suitable for verifying code behavior. It is not evidence that a real industrial process accepts that threshold.

For example, a test may define a hypothetical maximum moisture content of 5% to verify boundary logic. That does not establish a valid moisture limit for any real material or buyer.

## 8. Unit test plan

### 8.1 Property validation

Verify that:

- Valid values are accepted.
- Invalid numeric formats are rejected.
- Incompatible units are rejected.
- Supported unit conversions produce correct values.
- Unsupported units do not silently pass.
- Numeric values respect configured bounds.
- Categorical values belong to their controlled enumeration.
- Missing optional values remain missing.
- Missing required values produce the correct incomplete-data state.
- Measurement provenance is retained.
- Decimal precision is handled consistently.

### 8.2 Boundary testing

For a hypothetical hard constraint:

`moisture_content <= 5 percent`

Test:

| Input | Expected result |
|---|---|
| `4.99` | Pass |
| `5.00` | Pass |
| `5.01` | Fail |
| Missing value | Requires data |
| Unverified value | Requires verification or review according to policy |
| Invalid unit | Validation failure |
| Expired evidence | Requires review or updated evidence according to policy |

These values are test fixtures only, not real-world acceptance guidance.

Boundary tests must be generated for every supported comparison operator.

### 8.3 Unit conversion

Verify:

- Conversion between approved compatible units.
- Correct conversion precision.
- Rejection of incompatible dimensions.
- Consistent comparison after conversion.
- No accidental comparison of different unit systems without conversion.

Example: a mass quantity expressed in kilograms must not be compared directly with a quantity expressed in tonnes before normalization.

### 8.4 Rule evaluation

Verify that:

- Only applicable approved rules are used.
- Rule versions are recorded.
- Effective dates are respected.
- Expired rules are handled according to the configured policy.
- Missing applicable rule data produces a hold or review state.
- Explicit prohibitions produce an ineligible result.
- Human review requirements are preserved.
- Rule evaluation failures do not become approval.

### 8.5 Ranking calculations

Verify that:

- Hard failures exclude candidates from acceptable technical ranking.
- Held candidates are not displayed as fully eligible.
- Soft preferences affect ranking only as configured.
- Missing ranking inputs are handled explicitly.
- Scores remain within the documented range, if a bounded scale is selected.
- Equal inputs and configuration versions yield deterministic scores.
- Rounding does not change hard-constraint outcomes.
- Changing the ranking configuration creates a distinguishable evaluation version.

## 9. Matching-engine test matrix

The matching engine is a high-risk component and requires dedicated automated tests.

| ID | Scenario | Expected behavior |
|---|---|---|
| MAT-001 | All required measurements pass all hard constraints | Technical evaluation may return compatible |
| MAT-002 | One hard constraint fails | Incompatible; no acceptable commercial ranking |
| MAT-003 | A required measurement is missing | Requires data; not treated as pass |
| MAT-004 | A measurement is unverified | Follow the configured verification policy |
| MAT-005 | A soft preference fails | Candidate may remain compatible with a ranking penalty |
| MAT-006 | Regulatory result is `HOLD` | Candidate cannot be represented as eligible |
| MAT-007 | Regulatory result is `INELIGIBLE` | Candidate is blocked for the proposed route |
| MAT-008 | No approved applicable rule set can be resolved | Hold or review required |
| MAT-009 | Batch data changes after evaluation | New evaluation uses a new input snapshot |
| MAT-010 | Buyer specification changes | Previous result remains reproducible |
| MAT-011 | Rule version changes | New evaluation records the new applicable rule version |
| MAT-012 | Two candidates have identical relevant inputs | Substantive results are consistent |
| MAT-013 | High commercial score but failed hard constraint | Hard failure wins |
| MAT-014 | High commercial score but regulatory hold | Hold wins |
| MAT-015 | Invalid unit conversion | Evaluation fails safely with an explicit reason |
| MAT-016 | Evidence expires | Apply the configured freshness and review policy |
| MAT-017 | Candidate quantity is insufficient | Apply quantity feasibility rules without bypassing hard gates |
| MAT-018 | Candidate location is unavailable | Logistics ranking handles missing location explicitly |
| MAT-019 | Measurement belongs to another batch | Reject unauthorized or invalid association |
| MAT-020 | Evaluation is retried | No unintended duplicate side effects |

### 9.1 Required invariants

The following invariants must hold for every test fixture:

**Invariant A: Regulatory gate**

If eligibility is `INELIGIBLE`, the candidate cannot be presented as acceptable for that intended route.

**Invariant B: Uncertainty gate**

If required regulatory information is incomplete, the candidate cannot be represented as unconditionally eligible.

**Invariant C: Hard technical gate**

If any applicable hard technical constraint fails, a high commercial score cannot restore compatibility.

**Invariant D: Missing data**

Missing data cannot silently be interpreted as zero, a default, or a passing value.

**Invariant E: Reproducibility**

A historical evaluation must retain enough information to identify the relevant batch version, specification version, approved rule versions, and evaluation-engine version.

**Invariant F: Permission boundaries**

A user cannot access a resource merely by knowing its UUID.

These invariants should be implemented as automated tests and included in continuous integration.

## 10. Compliance evaluation tests

### 10.1 Applicability tests

Verify that rule selection considers the relevant documented attributes, such as:

- Material and source process.
- Composition and hazard-related properties where applicable.
- Proposed intended use.
- Origin and destination jurisdiction.
- Facility permissions and operating context.
- Effective date.
- Evidence requirements.

The implementation must not infer complete legal eligibility from a broad material category alone.

### 10.2 Review workflow tests

Verify that:

- Only authorized reviewers can approve or reject an evaluation.
- A review decision records its actor and timestamp.
- A reviewer cannot silently rewrite an approved rule through an evaluation review.
- Missing evidence can trigger a request for information.
- Rejected evaluations remain traceable.
- Superseded evaluations remain available to authorized auditors.
- Rule updates do not erase previous evaluation history.

### 10.3 Failure handling

Simulate:

- Regulatory data unavailable.
- Rule version missing.
- Document storage unavailable.
- Reviewer action submitted twice.
- Evaluation interrupted during processing.
- Conflicting updates from two reviewers.

The system must fail safely and provide a recoverable state. An infrastructure error must never be interpreted as a positive compliance decision.

## 11. API contract tests

For every implemented endpoint, verify:

- Valid request returns the documented status.
- Response matches the OpenAPI schema.
- Required fields are enforced.
- Invalid enum values are rejected.
- Unsupported content types are rejected.
- Malformed JSON returns a controlled error.
- Unknown query parameters are handled according to documented policy.
- Pagination works across multiple pages.
- Sorting accepts only approved fields.
- Error responses use the standard structure.
- Request IDs are present.
- Internal stack traces and secrets are not exposed.

### 11.1 Idempotency tests

For endpoints supporting idempotency:

1. Send a valid request with an idempotency key.
2. Repeat the identical request with the same key.
3. Verify that duplicate side effects do not occur.
4. Reuse the key with a different payload.
5. Verify that the request is rejected with the documented conflict response.

### 11.2 Concurrency tests

Verify that:

- Updates with a current resource version succeed.
- Updates with a stale version fail safely.
- Concurrent edits do not silently overwrite changes.
- Duplicate batch references are handled consistently.
- Two simultaneous review decisions cannot produce an invalid final state.

## 12. Security and authorization tests

### 12.1 Organization isolation

Create two unrelated test organizations and verify that:

- Supplier A cannot edit Supplier B's listings.
- Buyer A cannot read Buyer B's private specifications.
- A user cannot access another organization's documents using a guessed document ID.
- A user cannot approve a compliance evaluation without the required role.
- A user cannot change their own role by modifying a request payload.
- Listing search does not expose unpublished records.
- Match discovery respects both resource visibility and organization permissions.
- Inquiry details are visible only to authorized participants and administrators.

### 12.2 Authentication tests

Verify:

- Missing token returns `401`.
- Invalid signature returns `401`.
- Expired token returns `401`.
- Incorrect audience or issuer is rejected.
- Insufficient permission returns `403` or a documented concealed-resource response.
- Disabled or revoked user access is handled according to the identity provider's supported revocation model.

### 12.3 File security tests

Verify:

- Unsupported file types are rejected.
- Oversized uploads are rejected.
- Spoofed extensions do not bypass file validation.
- Expired upload URLs cannot be reused beyond their configured validity.
- Download URLs are issued only after authorization.
- Sensitive documents are not publicly accessible by default.
- Malware detection failures prevent documents from being treated as approved evidence.
- Filenames and metadata cannot inject executable content into the interface.

### 12.4 Additional security testing

Before production, perform targeted checks for:

- Injection vulnerabilities.
- Cross-site scripting in displayed user content.
- Cross-site request forgery where applicable to the authentication design.
- Broken object-level authorization.
- Rate-limit bypass.
- Sensitive information leakage.
- Insecure direct object references.
- Dependency vulnerabilities.
- Secret leakage in logs and error responses.

Security testing should be repeated after major authentication, authorization, document, or data-sharing changes.

## 13. Data integrity and database tests

Verify:

- Foreign-key relationships are enforced.
- Required uniqueness constraints exist.
- Measurements cannot reference nonexistent batches.
- Documents cannot be attached to unauthorized resources.
- Invalid state transitions are rejected.
- Database transactions preserve consistency when an operation fails midway.
- Migrations apply cleanly to an empty database.
- Migrations apply cleanly to a representative previous schema.
- Rollback or forward-recovery procedures are documented.
- Deleted or archived resources behave consistently with retention rules.

### 13.1 Historical evaluation integrity

For each stored match evaluation, verify that the system can identify:

- Batch ID and version.
- Specification ID and version.
- Measurement versions used.
- Evidence references and relevant verification state.
- Applicable regulatory rule versions.
- Technical evaluator version.
- Ranking configuration version.
- Evaluation timestamp.
- Final result and blocking reasons.

If the implementation uses immutable snapshots rather than versioned source records, test that those snapshots preserve equivalent information.

## 14. End-to-end acceptance tests

### Workflow A: Supplier publishes material

1. Supplier signs in.
2. Supplier creates an organization or accesses an authorized one.
3. Supplier creates a facility.
4. Supplier creates a material listing.
5. Supplier creates a batch.
6. Supplier adds measurements and supporting documents.
7. System validates required fields.
8. Supplier publishes the listing.
9. An authorized buyer can discover the visible listing.
10. An unauthorized user cannot access restricted information.

**Acceptance:** The listing becomes discoverable only after the required validations and permissions are satisfied.

### Workflow B: Buyer evaluates material

1. Buyer signs in.
2. Buyer creates a specification.
3. Buyer defines hard and soft criteria.
4. Buyer publishes the specification.
5. Buyer evaluates a candidate batch.
6. System evaluates regulatory eligibility.
7. System evaluates hard technical constraints.
8. System identifies missing or unverified data.
9. System computes commercial ranking only when the required gates permit it.
10. Buyer receives the result and its explanation.

**Acceptance:** Every result is traceable and does not overstate legal or technical certainty.

### Workflow C: Compliance review

1. A candidate requires regulatory review.
2. The system records the reason for review.
3. An authorized reviewer accesses the evaluation.
4. Reviewer records a decision or requests information.
5. The system records the reviewer and decision.
6. A new evaluation is triggered when required.
7. The previous evaluation remains available for audit.

**Acceptance:** No unauthorized user can approve the evaluation, and the system does not silently convert an incomplete evaluation into approval.

### Workflow D: Inquiry and sample qualification

1. Buyer opens an authorized match.
2. Buyer creates an inquiry.
3. Supplier receives access through the defined workflow.
4. Authorized parties request or coordinate a sample.
5. Supporting evidence and results are recorded.
6. The qualification outcome is stored.
7. All significant state transitions are audited.

**Acceptance:** Only authorized participants can access the inquiry and its confidential evidence.

## 15. Frontend usability and result-display tests

The interface must be tested to ensure that:

- `ELIGIBLE`, `HOLD`, and `INELIGIBLE` are visibly distinct.
- Missing data is not displayed as a passing value.
- A score is not displayed when it has not been calculated.
- A match is not described as guaranteed legal approval.
- Hard constraint failures are easy to identify.
- Data freshness and verification status are visible where relevant.
- Users can identify why a candidate is blocked.
- Restricted information is not present in hidden client-side payloads.
- Errors provide a useful corrective action without revealing sensitive details.
- Loading, empty, partial, and failed states are handled explicitly.

Usability testing should include real pilot users when available. Internal engineering approval alone is not evidence that users understand the meaning of the results.

## 16. Performance and reliability testing

Performance targets must be established from expected pilot volume and user workflows. Until the targets are validated, use the following as provisional planning targets rather than production commitments.

| Operation | Provisional target |
|---|---|
| Simple resource read | p95 under 500 ms |
| Simple resource update | p95 under 800 ms |
| Listing discovery | p95 under 1 second |
| Single deterministic match evaluation | p95 under 2 seconds |
| Complex or bulk evaluation | Asynchronous where necessary |
| Document upload | Depends on file size and storage; measure separately |

These figures exclude unusually slow external dependencies unless the final service-level objective explicitly includes them.

### 16.1 Load tests

Test:

- Expected concurrent pilot users.
- Search with common and uncommon filters.
- Repeated match evaluations.
- Concurrent measurement submissions.
- Document upload and metadata creation.
- Pagination over growing datasets.
- Database behavior under read-heavy and write-heavy workloads.

### 16.2 Reliability tests

Simulate:

- Database connection loss.
- Object storage outage.
- Background worker interruption.
- Expired credentials.
- Partial failure during evaluation.
- Job retry after worker restart.

Verify that retries are safe, failures are observable, and data does not become inconsistent.

Do not optimize for speculative millions-of-records workloads before measuring the actual pilot workload.

## 17. Regression testing

Every fixed defect must produce a regression test when feasible.

Regression categories should include:

- Incorrect material threshold comparison.
- Incorrect unit conversion.
- Missing data treated as a pass.
- Rule version not recorded.
- Unauthorized cross-organization access.
- Duplicate inquiry creation.
- Stale updates overwriting newer values.
- Incorrect match ranking.
- Inconsistent API error responses.
- Failed document authorization.
- Historical result overwritten during re-evaluation.

Run relevant regression tests on every pull request and the full agreed suite before release.

## 18. User acceptance testing

UAT must be conducted with representative users from the pilot where feasible, including:

- Waste generators.
- Potential buyers.
- Recyclers or processors.
- Laboratory or quality personnel.
- Compliance reviewers or qualified regulatory advisers.

Test scenarios should be based on observed operational workflows and real, authorized requirements. Confidential records should be anonymized or used under appropriate access controls.

### UAT tasks

Participants should be able to:

1. Create a listing using their actual operational terminology.
2. Enter available material properties and identify unavailable ones.
3. Upload or reference supporting evidence.
4. Define or review buyer acceptance criteria.
5. Interpret a held or incompatible match.
6. Understand the evidence required to proceed.
7. Initiate an inquiry.
8. Explain what the platform's result does and does not establish.

### UAT acceptance

UAT is complete when:

- Critical workflows can be completed without engineering intervention.
- Participants correctly understand eligibility and uncertainty labels.
- No unresolved critical security or data-integrity defects remain.
- Blocking usability issues are addressed or explicitly accepted.
- Known limitations are documented.
- A named product owner approves the pilot release.

A demo that works only when an engineer manually fixes the data between steps is not a successful UAT.

## 19. Defect severity and release gates

### Severity definitions

| Severity | Description | Release policy |
|---|---|---|
| P0 Critical | Incorrect eligibility decision, severe data breach, or unrecoverable integrity failure | Release blocked |
| P1 High | Major workflow failure or significant authorization weakness | Release blocked unless formally resolved or exceptionally accepted with documented mitigation |
| P2 Medium | Partial functionality failure with a reasonable workaround | Release requires owner review |
| P3 Low | Minor usability or non-critical defect | May be deferred with a tracked issue |

Any defect that causes a prohibited or technically unacceptable candidate to be presented as an acceptable match must be treated as a release-blocking defect.

### Release checklist

Before a release:

- [ ] Required unit tests pass.
- [ ] API contract tests pass.
- [ ] Integration tests pass.
- [ ] Authorization tests pass.
- [ ] Matching-engine invariants pass.
- [ ] Database migration tests pass.
- [ ] No unresolved P0 defects exist.
- [ ] P1 defects are resolved or have a documented, formally accepted exception.
- [ ] Logs and metrics are available.
- [ ] Deployment and recovery procedures are documented.
- [ ] Known limitations are communicated.
- [ ] Product owner approves the release.

## 20. Continuous integration

Recommended pull-request pipeline:

1. Formatting and lint checks.
2. Static type checks where configured.
3. Backend unit tests.
4. Frontend unit tests.
5. API schema validation.
6. Authorization and security-focused tests.
7. Database integration tests.
8. Matching-engine invariants.
9. Dependency vulnerability checks.
10. Build and deployment artifact checks.

The release pipeline should run the full required suite, including end-to-end tests against a controlled environment.

Test failures must be visible to the team and must not be silently ignored to obtain a green build.

## 21. Test ownership

| Area | Primary owner | Supporting roles |
|---|---|---|
| API contracts | Backend engineer | Frontend engineer |
| Frontend behavior | Frontend engineer | Product owner |
| Matching engine | Backend or matching engineer | Domain specialist |
| Regulatory evaluation | Compliance/domain owner | Backend engineer |
| Authorization | Backend/security owner | QA engineer |
| Database integrity | Backend engineer | QA engineer |
| End-to-end workflows | QA or product engineer | Pilot users |
| UAT | Product owner | Pilot participants |
| Release decision | Designated release owner | Engineering and domain reviewers |

Where staffing is limited, one person may hold multiple roles, but critical decisions should still receive independent review whenever practical.

## 22. Risks and unresolved questions

The test plan must be updated after resolving:

1. Final MVP material categories.
2. Approved material property definitions and units.
3. Authoritative acceptance criteria for each buyer specification.
4. Regulatory sources, review ownership, and update process.
5. Required evidence and verification policy per property.
6. Expected pilot user count and workload.
7. Required response-time targets.
8. Identity and organization membership design.
9. Document retention and access policies.
10. Production monitoring and recovery expectations.
11. Availability of representative pilot data.
12. UAT participants and sign-off process.

Testing can verify the implementation of a rule. It cannot independently establish that the rule is legally or industrially correct. That requires validated requirements and appropriate domain review.

## 23. Definition of done

The test program is ready for MVP release when:

- Every critical business workflow has automated coverage.
- Regulatory and technical gates are tested independently.
- Missing and unverified data cases are covered.
- Cross-organization authorization tests pass.
- Historical evaluations remain reproducible.
- Document access controls are verified.
- API contracts and error handling are consistent.
- Database migrations and recovery procedures are tested.
- Performance is measured against agreed pilot targets.
- Critical defects are resolved.
- UAT is completed with documented acceptance.
- Remaining risks and limitations have named owners.

---

**End of TEST-PLAN.md — Version 1.0**