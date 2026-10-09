# WasteMatch — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Initial product baseline  
**Date:** 9 October 2026  
**Pilot geography:** Pimpri-Chinchwad / Pune industrial region, Maharashtra, India  
**Product:** WasteMatch  
**Document owner:** Product and Engineering Team

---

## 1. Executive Summary

WasteMatch is a B2B industrial waste-to-resource matching platform that helps businesses identify potential uses for waste and industrial by-products by connecting material producers with suitable industrial buyers, recyclers, and authorized processors.

The platform addresses a fundamental problem: waste producers may generate recoverable materials without knowing which industries can use them, while industrial buyers may need alternative feedstocks but lack reliable information about available materials, their composition, consistency, supply volume, and regulatory eligibility.

WasteMatch will structure material information, compare it against receiver-specific acceptance specifications, identify missing information, apply regulatory eligibility checks, and rank qualified opportunities using technical, logistical, and economic factors.

The platform is not intended to replace laboratory testing, environmental approvals, regulatory authorities, or buyer qualification procedures. It supports discovery and preliminary qualification, with evidence and human review where required.

## 2. Problem Statement

Industrial waste exchange is difficult because material availability, quality information, buyer requirements, compliance evidence, and commercial terms are fragmented across organizations.

Key problems to address:

1. Producers may maintain waste information in spreadsheets, registers, invoices, or disconnected systems.
2. Material descriptions may be too broad to establish actual industrial suitability.
3. Buyers may have detailed technical specifications that are not publicly available.
4. Critical properties may be missing, outdated, estimated, or unverified.
5. Legal classifications and permitted utilization routes may vary by material, source, receiver, and jurisdiction.
6. Transport and preprocessing costs can make a technically suitable match commercially unattractive.
7. Neither side may be willing to reveal confidential operational or commercial information before a credible opportunity exists.

WasteMatch must therefore solve more than a search problem. It must support structured data collection, qualification, trust, and transaction discovery.

## 3. Product Vision

Make industrial material recovery more accessible by helping businesses discover technically suitable, legally eligible, and economically plausible opportunities to exchange waste and industrial by-products.

### Product principles

- Compliance before compatibility scoring.
- Evidence before assumptions.
- Receiver-specific specifications rather than universal material-quality thresholds.
- Explainable matching rather than opaque recommendations.
- Explicit uncertainty when information is missing.
- Confidentiality by design.
- Human approval for consequential or unverified decisions.
- Practical feasibility over match quantity.

## 4. Goals and Non-Goals

### 4.1 Goals

- Create structured profiles for waste streams and receiving facilities.
- Enable producers to publish available material with controlled information disclosure.
- Enable buyers to define material requirements and procurement constraints.
- Identify candidate matches using hard eligibility rules and technical compatibility.
- Explain why each candidate matches, fails, or requires additional verification.
- Identify missing fields, supporting documents, and necessary tests.
- Consider supply volume, location, preprocessing, and estimated logistics costs.
- Support inquiries and a traceable qualification workflow.
- Maintain auditable records of regulatory checks and matching decisions.

### 4.2 Non-goals for the initial MVP

- Guaranteeing that a buyer will purchase a listed material.
- Automatically approving a material for industrial use.
- Issuing environmental authorizations or certifying legal compliance.
- Replacing laboratory tests or professional engineering assessments.
- Operating waste collection fleets or payment settlement infrastructure.
- Supporting every waste category and every industrial process at launch.
- Automatically executing legally binding waste-transfer agreements.
- Using AI predictions as substitutes for measured chemical or physical properties.

## 5. Target Users

### 5.1 Waste Producer

Industrial facilities generating potentially recoverable waste or by-products.

**Needs:** Publish available materials, manage quantities, share quality evidence, discover buyers, and reduce disposal or recovery costs.

### 5.2 Industrial Buyer

Manufacturers or industrial facilities seeking secondary raw materials or alternative feedstocks.

**Needs:** Specify technical requirements, find suitable sources, inspect evidence, estimate delivered cost, and qualify suppliers.

### 5.3 Recycler or Authorized Processor

Businesses that process, recover, or prepare materials for reuse.

**Needs:** Discover feedstock, assess preprocessing requirements, verify material classification, and evaluate supply consistency.

### 5.4 Platform Administrator

The team responsible for onboarding, data quality, platform operations, and dispute or abuse handling.

**Needs:** Verify business information, review flagged listings, manage categories, and maintain audit trails.

### 5.5 Compliance Reviewer

An authorized internal reviewer or designated professional responsible for reviewing regulatory evidence and uncertain cases.

**Needs:** Inspect source documents, applicable rules, jurisdiction, authorization status, and the rationale behind an eligibility decision.

Access to this role must be explicitly controlled. A platform reviewer must not be presented as a government authority.

## 6. Core User Journeys

### Journey A: Producer publishes a waste stream

1. Register and verify the organization.
2. Create a material profile.
3. Enter material category, source process, quantity, unit, location, and availability.
4. Enter known technical properties and their measurement basis.
5. Upload available test reports, photographs, and relevant documentation.
6. Identify missing mandatory information.
7. Complete required regulatory screening.
8. Publish the listing with appropriate disclosure controls.
9. Receive candidate matches and inquiries.
10. Review, negotiate, and qualify potential recipients.

### Journey B: Buyer discovers a feedstock

1. Register and verify the organization.
2. Create a receiving-facility profile.
3. Define required material categories and intended uses.
4. Enter mandatory specifications, tolerances, and prohibited contaminants.
5. Specify minimum and maximum quantities, location constraints, and supply frequency.
6. Define acceptable preprocessing routes.
7. Review candidate materials.
8. Inspect compatibility explanations and evidence.
9. Request samples, missing documents, or technical discussions.
10. Record qualification outcomes and proceed through the buyer's normal approval process.

### Journey C: Platform qualifies a candidate match

1. Retrieve the producer's material profile and the receiver's specification.
2. Establish the applicable regulatory classification and rules.
3. Check whether the proposed transfer and intended use are legally eligible.
4. Block prohibited matches and hold unresolved cases.
5. Check mandatory technical constraints.
6. Determine whether deviations can be corrected through a validated treatment pathway.
7. Estimate logistical and preprocessing feasibility.
8. Rank eligible candidates.
9. Show supporting evidence, limitations, and next steps.
10. Preserve the decision and rule versions used.

## 7. Functional Requirements

### FR-01: Organization and access management

- Users must be able to register and manage organizational profiles.
- The system must support role-based permissions.
- Organization verification status must be visible to authorized users.
- Users must not access another organization's confidential information without permission.

### FR-02: Material listing management

Each listing must support:

- Material category and grade.
- Source process and material description.
- Available quantity and unit.
- Location and availability period.
- Known technical properties.
- Measurement method, date, and evidence source where available.
- Contaminant information where relevant.
- Photographs and supporting documents.
- Intended or known prior uses.
- Listing status and disclosure permissions.

### FR-03: Buyer specification management

Buyers must be able to define:

- Target material and intended industrial process.
- Required chemical, physical, biological, or functional properties.
- Mandatory minimum and maximum limits.
- Preferred operating ranges.
- Prohibited substances or conditions.
- Required evidence and test methods.
- Acceptable preprocessing methods.
- Quantity, frequency, location, and commercial constraints.

The system must distinguish hard constraints from preferences.

### FR-04: Regulatory eligibility

- Rules must be associated with material classification, source, intended use, parties, and relevant jurisdiction.
- The platform must identify applicable registrations, authorizations, consents, documentation, and other conditions.
- Each determination must record its evidence, effective date, and rule version.
- Prohibited transfers must be blocked.
- Missing or conflicting evidence must trigger a hold or review.
- A high compatibility score must never override a legal restriction.
- Rule updates must trigger reassessment of affected listings or candidate matches.

### FR-05: Technical matching

- Compare measured or reported material properties with receiver specifications.
- Respect mandatory limits.
- Allow defined tolerances only where the receiving process permits them.
- Identify missing measurements and conflicting values.
- Distinguish verified, supplier-reported, estimated, and unknown values.
- Support validated treatment pathways for correctable deviations.
- Explain match and rejection reasons.

### FR-06: Match ranking

Eligible candidates may be ranked by:

- Technical compatibility.
- Evidence completeness and freshness.
- Supply quantity and continuity.
- Geographic distance and estimated logistics cost.
- Preprocessing requirements and cost.
- Indicative delivered material cost.
- Buyer preferences.

Ranking weights must be configurable and documented. Legal eligibility is a gate, not a ranking factor.

### FR-07: Inquiry and qualification workflow

- Buyers must be able to contact producers through controlled inquiries.
- Producers must be able to approve or deny requests for additional information.
- The system must record sample requests, document requests, and qualification status.
- Users must be able to record rejection reasons.
- The platform must not imply that a match constitutes a confirmed transaction.

### FR-08: Document management

- Support document uploads and metadata.
- Restrict access by organization and document sensitivity.
- Record document issue dates, expiry dates where applicable, and verification status.
- Maintain version history for important evidence.
- Allow authorized reviewers to flag invalid, expired, or inconsistent documents.

### FR-09: Notifications

Notify users about relevant events, including:

- New candidate matches.
- Inquiries and responses.
- Missing required information.
- Expiring or outdated documents.
- Listing availability changes.
- Qualification status changes.
- Material specification or applicable rule changes.

### FR-10: Administration and audit

- Maintain an audit log of significant profile changes and decisions.
- Allow authorized administrators to suspend listings or accounts.
- Record why a listing or match was blocked.
- Support investigation of conflicting data and reported misuse.
- Preserve historical regulatory decisions and their evidence.

## 8. Data Quality and Trust Requirements

Every critical technical value should have, where applicable:

- Value and unit.
- Measurement basis, such as as-received or dry basis.
- Measurement method.
- Sample or batch identifier.
- Date measured.
- Source organization.
- Evidence reference.
- Confidence or verification status.

Unknown values must remain unknown. The system must not silently substitute category averages for actual batch properties.

When critical evidence is absent, the system must return an unverified result rather than treating the material as compliant.

## 9. Non-Functional Requirements

### Security and privacy

- Role-based access control.
- Secure authentication and authorization.
- Encryption in transit and at rest.
- Controlled document access.
- Audit logging for sensitive operations.
- Data retention and deletion policies.
- Protection against unauthorized disclosure of commercial information.

### Reliability and performance

Initial targets to validate during implementation:

- Core listing and specification pages should load within 3 seconds at the 95th percentile under the agreed pilot load.
- Common matching requests should complete within 5 seconds at the 95th percentile, excluding external services and expensive manual-review operations.
- Failed background jobs must be retried safely or surfaced for investigation.
- The system must prevent duplicate submissions from creating duplicate transactions or records.

### Maintainability

- Regulatory rules must be versioned independently of application code where practical.
- Matching decisions must be reproducible from recorded inputs and rule versions.
- APIs and data models must be documented.
- Automated tests must cover legal gates, technical limits, permissions, and boundary cases.

### Accessibility and usability

- Responsive web interface.
- Clear validation errors and units.
- Accessible forms and keyboard navigation.
- Explicit explanations of blocked, unverified, and eligible states.

## 10. MVP Scope

The MVP should concentrate on a small set of validated material categories and industrial use cases in the Maharashtra pilot region.

### Included

- Organization registration and basic verification.
- Producer and buyer profiles.
- Structured material listings.
- Receiver-specific material specifications.
- Supporting document uploads.
- Regulatory eligibility screening for selected categories.
- Rule-based technical matching.
- Explainable match results.
- Inquiry and qualification workflows.
- Administrative review and audit records.

### Deferred

- Nationwide regulatory coverage.
- Automated legal interpretation without review.
- Fully automated purchasing and payments.
- Advanced machine-learning optimization.
- Real-time integrations with industrial ERP systems.
- Automated transport procurement.
- Broad support for unvalidated material categories.

## 11. Success Metrics

Establish baseline values during the pilot before setting aggressive targets.

### Data quality

- Percentage of listings with required fields completed.
- Percentage of critical properties supported by current evidence.
- Percentage of listings with traceable batch information.
- Percentage of buyer specifications containing explicit acceptance limits.

### Matching performance

- Percentage of suggested matches accepted for technical review.
- Percentage of candidates rejected due to technical incompatibility.
- Percentage of matches held for missing regulatory or technical evidence.
- Percentage of candidate matches progressing to sample testing or supplier qualification.

### Commercial outcomes

- Number of qualified producer-buyer connections.
- Number of completed material evaluations.
- Number of successful pilot transactions.
- Estimated preprocessing and logistics cost per viable match.

### Trust and safety

- Number of prohibited matches incorrectly shown as eligible.
- Number of eligibility decisions lacking required evidence.
- Number of unresolved document or classification conflicts.
- Time required to review flagged matches.

**Critical safety target:** Zero known cases where the system knowingly recommends a prohibited transfer as eligible. This must be supported by testing, audit, and human review; a target alone is not proof of safety.

## 12. Dependencies and Risks

### Dependencies

- Access to actual producer and buyer records.
- Validated receiver specifications.
- Verified regulatory sources and amendments.
- Availability of suitable laboratory testing.
- Participation of qualified industrial partners.
- Reliable location, transport, and cost information.

### Risks

- Incomplete or inaccurate supplier data.
- Reluctance to disclose specifications or prices.
- Ambiguous waste classification.
- Outdated permits and regulatory changes.
- Incorrect assumptions about preprocessing feasibility.
- Weak buyer adoption if recommendations lack evidence.
- False confidence from automated compatibility scores.

Mitigations include explicit data provenance, conservative eligibility decisions, controlled disclosure, validated pilot categories, and auditable human review.

## 13. Open Decisions

The following decisions must be confirmed before implementation is finalized:

1. Which two or three material categories are included in the first pilot?
2. Which specific receiving industries and facilities will participate?
3. Will the initial product support only discovery and qualification, or also transaction documentation?
4. Which organization-verification and document-review procedures will be used?
5. Who owns and approves regulatory rule updates?
6. Which mapping, routing, and cost-estimation services will be used?
7. What is the expected pilot user count and listing volume?
8. Which technical stack and hosting environment will be adopted?
9. What data can be shared publicly, after verification, or only under explicit permission?
10. What evidence is required before a match can be shown as eligible?

These are unresolved decisions, not assumptions to bury in code.

## 14. Acceptance Criteria for PRD Sign-Off

The product requirements are ready for implementation planning when:

- The MVP material categories and participating industrial use cases are named.
- Producer and buyer workflows are agreed.
- Required material fields and receiver specification fields are defined.
- Legal eligibility states and review ownership are defined.
- Match ranking criteria are documented.
- Missing and conflicting data behavior is specified.
- Security and disclosure boundaries are agreed.
- Success metrics and pilot acceptance thresholds are approved.

---

**End of PRD v1.0**