# WasteMatch — UI/UX Specification

**Version:** 1.0  
**Status:** Draft for implementation  
**Date:** 9 October 2026  
**Product:** WasteMatch  
**Platform:** Responsive web application  
**Pilot Region:** Pimpri-Chinchwad / Pune, Maharashtra, India

---

# 1. Purpose

This document defines the user experience, information architecture, screen requirements, design system, and interaction behavior for WasteMatch.

The objective is to make industrial waste exchange understandable and trustworthy for users who may not have technical expertise in digital platforms.

The interface must help users answer five questions:

1. What material is available?
2. Which industrial facilities might be able to use it?
3. Does the material meet the receiving facility's requirements?
4. What evidence or processing is still needed?
5. What action should the user take next?

The design must prioritize clarity, evidence, and safe decisions over decorative dashboards or unnecessarily complicated workflows.

# 2. UX Principles

## 2.1 Trust Before Convenience

Users must understand whether a material value is measured, reported, estimated, or unknown.

The interface must never present unverified data as confirmed fact.

## 2.2 Progressive Disclosure

Show essential information first. Technical properties, legal evidence, commercial details, and advanced filters should be available through clearly organized sections.

## 2.3 Explainable Matching

Every match must explain:

- Why the material is relevant.
- Which mandatory requirements were checked.
- Which properties are compatible.
- Which properties are outside preferred ranges.
- Which measurements or documents are missing.
- Whether additional treatment is required.
- Whether regulatory review remains pending.

## 2.4 Compliance Is Not a Score

Legal states must use explicit labels and clear actions.

- Eligible
- On hold
- Ineligible

Never use a green compatibility score to imply that a legally blocked material can be transferred.

## 2.5 Actionable Errors

Every validation error should explain what is wrong, why it matters, and how to correct it.

## 2.6 Confidentiality by Design

The interface should disclose only the information necessary for the current workflow. Exact facility details, prices, and sensitive documents must remain restricted where required.

## 2.7 Accessible and Responsive

The interface must work on desktop, tablet, and mobile devices, including users with limited experience using enterprise software.

# 3. Target Users and Interface Needs

## 3.1 Producer

Primary tasks:

- Publish available material.
- Record quantity and technical properties.
- Upload evidence.
- Review candidate buyers.
- Respond to inquiries.
- Update availability.

UX priority: a straightforward listing workflow that minimizes manual data entry.

## 3.2 Buyer

Primary tasks:

- Create material requirements.
- Search available materials.
- Inspect technical compatibility.
- Review evidence.
- Request samples or missing information.
- Track qualification progress.

UX priority: fast filtering and clear explanations of suitability.

## 3.3 Recycler or Processor

Primary tasks:

- Discover feedstock.
- Evaluate processing requirements.
- Compare material availability.
- Inspect relevant compliance evidence.
- Estimate operational feasibility.

UX priority: material composition, batch consistency, and preprocessing requirements.

## 3.4 Administrator

Primary tasks:

- Verify organizations.
- Review listings and documents.
- Investigate flagged records.
- Manage categories and controlled data.
- Review platform activity.

UX priority: efficient queues, auditability, and safe administrative actions.

## 3.5 Compliance Reviewer

Primary tasks:

- Review regulatory classifications.
- Inspect applicable legal requirements.
- Check evidence validity and scope.
- Record decisions and unresolved conditions.
- Identify affected listings after rule changes.

UX priority: evidence traceability and explicit decision records.

# 4. Information Architecture

## 4.1 Public Pages

- Landing page
- How WasteMatch works
- Supported material categories
- How matching and verification work
- Sign in
- Register
- Privacy policy
- Terms of use
- Contact and support

Public pages must not reveal private material listings, confidential specifications, or restricted documents.

## 4.2 Authenticated Application

### Shared Navigation

- Dashboard
- Materials
- Find Matches
- Inquiries
- Documents
- Notifications
- Organization
- Settings

### Producer Navigation

- My Listings
- Material Batches
- Candidate Buyers
- Inquiries
- Documents
- Organization Settings

### Buyer Navigation

- Find Materials
- My Specifications
- Candidate Matches
- Inquiries
- Sample Requests
- Documents
- Organization Settings

### Administrator Navigation

- Overview
- Organizations
- Material Listings
- Match Reviews
- Document Reviews
- Regulatory Rules
- Audit Log
- Platform Settings

### Compliance Reviewer Navigation

- Review Queue
- Regulatory Evaluations
- Evidence Documents
- Rule Registry
- Affected Matches
- Decision History

Navigation items must be filtered by permissions. Hiding a navigation item does not replace server-side authorization.

# 5. Core User Flows

## 5.1 Producer Onboarding

1. Open the registration page.
2. Create an account.
3. Register an organization.
4. Add the source facility.
5. Submit required verification information.
6. View verification status.
7. Create the first material listing.

**Success condition:** The user can create a draft listing and understands which steps remain before publication.

## 5.2 Create a Material Listing

1. Select the material category.
2. Describe the source process.
3. Enter available quantity and unit.
4. Enter location and availability.
5. Add known physical and chemical properties.
6. Identify measurement methods and dates where available.
7. Upload test reports or other supporting documents.
8. Review missing fields.
9. Complete the required compliance workflow.
10. Preview the listing.
11. Publish when permitted.

The interface must distinguish between information required to save a draft and information required to publish or qualify the material.

## 5.3 Buyer Specification Creation

1. Select the target material category.
2. Identify the receiving facility and intended use.
3. Define hard acceptance limits.
4. Define preferred operating ranges.
5. Add prohibited conditions.
6. Specify evidence and testing requirements.
7. Define quantity, frequency, and geographic constraints.
8. Identify acceptable preprocessing options.
9. Review and publish the specification.

The UI must prevent contradictory or invalid ranges and explain the distinction between mandatory limits and preferences.

## 5.4 Review a Candidate Match

1. Open the candidate match.
2. Inspect the legal eligibility state.
3. Review the technical compatibility summary.
4. Inspect individual property comparisons.
5. Review evidence quality and freshness.
6. Identify missing information.
7. Inspect treatment requirements and estimated costs.
8. Request further documents or a sample.
9. Record the decision or initiate an inquiry.

**Success condition:** The user can explain why the candidate was recommended, held, or rejected without needing to interpret an unexplained score.

# 6. Screen Specifications

## 6.1 Landing Page

### Purpose

Explain the product and help users enter the correct onboarding flow.

### Components

- Header with logo, navigation, sign-in, and registration.
- Hero section explaining industrial material matching.
- Primary actions: Find Industrial Materials and List Available Materials.
- Three-step process explanation.
- Supported material categories.
- Trust and verification explanation.
- How legal and technical checks work.
- Frequently asked questions.
- Footer with policies and contact information.

### UX requirements

- Avoid unsupported claims about waste diversion, emissions reductions, or guaranteed savings.
- Explain that recommendations require verification.
- Keep the main action visible without overwhelming users with multiple competing calls to action.

## 6.2 Authentication and Onboarding

### Components

- Email or identity-provider authentication.
- Organization registration form.
- Business role selection.
- Facility details.
- Verification status indicator.
- Onboarding progress.
- Validation messages.

### States

- Empty.
- In progress.
- Validation error.
- Submitted.
- Verification pending.
- Verified.
- Rejected or additional information required.

## 6.3 Dashboard

### Producer dashboard

Display:

- Active listings.
- Available quantity by listing.
- Missing information requiring action.
- Candidate buyers.
- Pending inquiries.
- Upcoming document expiry reminders.

### Buyer dashboard

Display:

- Active specifications.
- New candidate matches.
- Matches on hold.
- Pending document requests.
- Sample requests.
- Qualification activity.

### Administrator dashboard

Display:

- Pending organization verification.
- Listings awaiting review.
- Compliance cases on hold.
- Documents awaiting review.
- Failed background jobs.
- Recent privileged actions.

The dashboard should emphasize actions and unresolved tasks rather than displaying vanity metrics.

## 6.4 Material Listing Form

### Sections

**A. Material identity**

- Category.
- Grade.
- Description.
- Source process.
- Known prior use, if applicable.

**B. Quantity and availability**

- Available quantity.
- Unit.
- Batch reference.
- Availability period.
- Expected recurring supply.

**C. Location**

- Facility.
- Industrial area.
- Geographic disclosure level.

**D. Technical properties**

- Property name.
- Value.
- Unit.
- Measurement basis.
- Measurement date.
- Verification status.

**E. Supporting evidence**

- Test reports.
- Photographs.
- Compliance documents.
- Other supporting records.

**F. Publication review**

- Missing required fields.
- Unverified information.
- Compliance status.
- Preview.
- Publish or save draft.

### Interaction requirements

- Use unit-aware numeric inputs.
- Prevent incompatible units.
- Preserve draft data after validation errors.
- Allow users to add only properties relevant to their material category.
- Clearly label estimated and supplier-reported values.
- Warn before removing evidence referenced by an active evaluation.

## 6.5 Material Listing Detail

Display:

- Material name and category.
- Availability and quantity.
- Source process.
- General location.
- Technical property summary.
- Measurement and evidence status.
- Relevant documentation.
- Listing availability status.
- Eligible candidate matches, where appropriate.
- Inquiry action.

Confidential fields must be revealed only to authorized users.

## 6.6 Buyer Specification Builder

### Layout

Use a structured form with a persistent summary of the specification being created.

### Property rows

Each property row should contain:

- Property name.
- Unit.
- Minimum value.
- Maximum value.
- Constraint type.
- Required evidence.
- Missing-data policy.

### Constraint types

- Hard limit.
- Preferred range.
- Prohibited condition.
- Required property.

### UX requirements

- Explain each constraint type in plain language.
- Prevent contradictory bounds.
- Allow properties to be marked not applicable only when the specification supports that choice.
- Show a review summary before publication.
- Preserve prior published versions.

## 6.7 Search and Discovery

### Layout

- Search field.
- Filter panel.
- Sort options.
- Results list.
- Pagination or controlled incremental loading.
- Clear empty state.

### Filters

- Material category.
- Location and radius.
- Available quantity.
- Availability period.
- Technical properties.
- Evidence status.
- Preprocessing options.
- Candidate qualification status.

### Result card

Each result should display:

- Material name and category.
- Approximate or authorized location.
- Available quantity.
- Key relevant properties.
- Evidence completeness.
- Regulatory status, when evaluated.
- Main reason for relevance.
- Action to view details.

Do not show an unverified candidate with the same visual treatment as a fully evaluated eligible candidate.

## 6.8 Candidate Match Detail

This is one of the most important screens in the product.

### Section A: Decision summary

Display separate statuses for:

- Regulatory eligibility.
- Technical compatibility.
- Evidence completeness.
- Commercial assessment.
- Human qualification.

These are independent dimensions and must not be collapsed into one status.

### Section B: Property comparison

Display a table with:

- Property.
- Measured value.
- Buyer requirement.
- Result.
- Evidence source.
- Measurement date.

Possible property results:

- Meets requirement.
- Outside preferred range.
- Fails hard limit.
- Unknown.
- Conflicting evidence.
- Treatment assessment required.

### Section C: Regulatory evidence

Display:

- Applicable rule references.
- Relevant authorization requirements.
- Evidence verification state.
- Unresolved conditions.
- Reviewer notes, where accessible.

### Section D: Treatment and cost

Display:

- Required preprocessing.
- Estimated cost and assumptions.
- Transport estimate.
- Additional testing requirements.
- Uncertainty in estimates.

### Section E: Next steps

Possible actions:

- Request additional information.
- Request a sample.
- Contact the other party.
- Save candidate.
- Record rejection reason.

If the candidate is ineligible, disable ordinary transaction-advancing actions and explain why.

## 6.9 Inquiry and Sample Request

Display:

- Candidate material and batch.
- Requesting organization.
- Request type.
- Requested information or test.
- Quantity and purpose for samples.
- Status and timestamps.
- Message history.
- Required next action.

The interface must make clear that a sample request is not a final technical or legal approval.

## 6.10 Document Center

### Components

- Document list.
- Document type.
- Associated organization, facility, or batch.
- Issue date.
- Expiry date, where applicable.
- Verification status.
- Access permissions.
- Review history.

### Actions

- Upload.
- Preview.
- Download, when authorized.
- Replace with a new version.
- Request verification.
- Flag a problem.

Do not silently replace the historical document used for a prior decision.

## 6.11 Regulatory Review Dashboard

### Components

- Review queue.
- Material and proposed use.
- Applicable rule versions.
- Source and destination jurisdiction.
- Missing or conflicting evidence.
- Document inspection.
- Decision rationale.
- Review history.

### Actions

- Mark evidence verified.
- Request additional evidence.
- Escalate for legal interpretation.
- Approve the evaluation within the reviewer's authority.
- Mark ineligible with an explicit reason.

All privileged actions must be permission-checked and audited.

# 7. Design System

## 7.1 Visual Direction

WasteMatch should feel like a professional industrial platform rather than a consumer recycling app.

Use a restrained, clean interface with:

- Neutral backgrounds.
- Strong typography.
- Clear information hierarchy.
- Subtle borders.
- Consistent spacing.
- Limited decorative imagery.
- Explicit status labels.
- Data tables for technical comparisons.

Suggested visual direction: light neutral surfaces, deep green as a restrained brand accent, and high-contrast text.

## 7.2 Color Semantics

Color must never be the only indicator of state.

| Meaning | Suggested treatment |
|---|---|
| Eligible | Green accent plus explicit text label |
| On hold | Amber accent plus explicit text label |
| Ineligible | Red accent plus explicit text label |
| Informational | Neutral blue or gray |
| Draft | Neutral gray |
| Verified evidence | Green indicator plus verification label |
| Unverified evidence | Neutral or amber indicator plus label |

A compatibility score must not use the same visual component as regulatory eligibility.

## 7.3 Typography

Use a readable sans-serif typeface.

Recommended hierarchy:

- Page title: 28–32 px desktop.
- Section heading: 20–24 px.
- Subsection heading: 16–18 px.
- Body text: 14–16 px.
- Metadata: 12–14 px.
- Technical values: consistent alignment and clear units.

Use tabular numerals for technical values and cost comparisons where supported.

## 7.4 Spacing and Layout

Use a consistent spacing scale based on 4 px increments.

Recommended layout:

- Desktop content maximum width: approximately 1280 px.
- Desktop side navigation: persistent where appropriate.
- Main content: responsive grid.
- Forms: clear sections with visible validation.
- Tables: horizontally scrollable or adapted for small screens.

Avoid excessively dense dashboards that force users to interpret dozens of metrics at once.

## 7.5 Components

Reusable components should include:

- Buttons.
- Inputs.
- Selects.
- Numeric inputs with units.
- Date inputs.
- File upload controls.
- Status badges.
- Evidence indicators.
- Property comparison rows.
- Match cards.
- Specification constraint editors.
- Confirmation dialogs.
- Empty states.
- Loading skeletons.
- Error banners.
- Review panels.
- Audit timeline.

Components must support keyboard navigation, focus visibility, and consistent validation behavior.

# 8. Interaction States

Every data-driven screen must define the following states.

## Loading

Show a loading indicator or skeleton that preserves the page layout.

## Empty

Explain why no results or records are present and provide an appropriate next action.

## Validation Error

Identify the invalid field, explain the error, and preserve valid user input.

## Network or Server Error

Display a recoverable error message and allow a safe retry where appropriate.

## Partial Data

Show available values and explicitly identify missing or unverified information.

## Unauthorized

Prevent access and show an appropriate permission message without exposing protected content.

## Pending Review

Explain what is under review and which action, if any, the user can take.

## Stale Data

Display the relevant measurement or document date and indicate when a new measurement or review may be required.

## Destructive Action

Require confirmation before deleting a draft, withdrawing a listing, or performing another consequential action.

# 9. Accessibility Requirements

The interface should target WCAG 2.2 Level AA where applicable.

Requirements:

- Keyboard-accessible navigation and forms.
- Visible focus indicators.
- Sufficient text and control contrast.
- Programmatic labels for inputs.
- Accessible validation messages.
- Status information that does not depend solely on color.
- Logical heading hierarchy.
- Accessible dialog behavior.
- Appropriate text alternatives for meaningful images.
- Support for browser zoom and responsive layouts.

Accessibility must be verified through automated checks and manual keyboard and screen-reader testing.

# 10. Responsive Behavior

## Desktop

- Persistent sidebar where useful.
- Multi-column dashboards.
- Detailed property comparison tables.
- Split-screen review layouts.

## Tablet

- Collapsible navigation.
- Reduced dashboard columns.
- Responsive forms.
- Compact technical tables.

## Mobile

- Single-column content.
- Stacked property comparisons where tables become unreadable.
- Large touch targets.
- Collapsible advanced filters.
- Simplified document review.
- Persistent primary actions only when they do not obscure content.

Core tasks such as creating a listing, inspecting a match, and responding to an inquiry must remain usable on mobile.

# 11. Content and Microcopy Rules

Use precise language.

Preferred examples:

- "Regulatory eligibility not verified."
- "Moisture exceeds the preferred range."
- "Laboratory report required before evaluation can continue."
- "Potential match; buyer qualification pending."
- "Estimated transport cost; route and quotation not confirmed."

Avoid:

- "100% compatible" without a defined, validated meaning.
- "Legally approved" when the platform has only checked uploaded documents.
- "Guaranteed savings."
- "Zero environmental impact."
- "Certified material" without a valid certification basis.

All user-facing legal and technical explanations must be consistent with the actual evaluation results.

# 12. Privacy and Information Disclosure

Define disclosure rules for each field.

### Public or discovery-level information

May include material category, approximate availability, generalized location, and selected verified properties, subject to the organization's permissions.

### Restricted information

May include exact facility addresses, detailed process descriptions, laboratory reports, prices, and commercial terms.

### Highly restricted information

May include confidential process parameters, sensitive commercial agreements, privileged compliance records, and internal reviewer notes.

The exact classification must be agreed with participating organizations.

Users must be able to understand what information becomes visible when they publish a listing or initiate an inquiry.

# 13. UX Analytics

Track meaningful user actions without unnecessarily collecting personal information.

Suggested events:

- `organization_registration_started`
- `organization_registration_completed`
- `material_listing_created`
- `material_listing_published`
- `buyer_specification_created`
- `match_results_viewed`
- `match_details_opened`
- `missing_evidence_requested`
- `sample_request_created`
- `inquiry_created`
- `inquiry_responded`
- `match_rejected`
- `qualification_completed`

Analytics must respect applicable privacy requirements and access restrictions.

# 14. UX Acceptance Criteria

The UI/UX implementation is acceptable when:

1. Producers can create and edit draft listings.
2. Buyers can create specifications with explicit constraints.
3. Users can distinguish mandatory limits from preferred ranges.
4. Candidate results clearly distinguish eligible, held, and ineligible cases.
5. Every candidate evaluation provides understandable reasons.
6. Missing evidence and unverified properties are visible.
7. Confidential documents are accessible only to authorized users.
8. Forms preserve user input after validation errors.
9. All important screens define loading, empty, error, and unauthorized states.
10. Core flows work on desktop and mobile.
11. Keyboard navigation and accessibility requirements are tested.
12. Legal and technical status labels accurately reflect backend decisions.

# 15. Implementation Sequence

### UI Phase 1: Foundation

- Authentication screens.
- Organization onboarding.
- Shared navigation.
- Design tokens and reusable components.
- Dashboard skeletons.

### UI Phase 2: Material and Specification Management

- Material listing form.
- Batch measurement editor.
- Document center.
- Buyer specification builder.

### UI Phase 3: Matching

- Search and filtering.
- Match cards.
- Candidate detail page.
- Property comparison.
- Evidence and regulatory status panels.

### UI Phase 4: Qualification and Administration

- Inquiry workflow.
- Sample requests.
- Administrative review dashboard.
- Regulatory review dashboard.
- Audit timeline.

### UI Phase 5: Validation

- Responsive testing.
- Accessibility review.
- Error-state testing.
- Permission testing.
- User testing with actual producers and buyers.

---

**End of UI-UX.md v1.0**