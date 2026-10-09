WasteMatch
Software Architecture Document
Version 1.0 · Draft baseline · 9 October 2026
System design
Modular architecture
India · Maharashtra pilot


Purpose: Define the system structure, major components, interactions, security boundaries, and deployment approach that implement the WasteMatch PRD.
1. Architecture overview
Recommendation: start with a modular monolith, not microservices.
WasteMatch needs several distinct capabilities, but the initial pilot does not justify the operational complexity of independently deployed services. Keep a single backend application with clearly separated modules, a shared relational database, and asynchronous workers for expensive or long-running tasks.
This gives you clean boundaries without forcing a small engineering team to operate a miniature distributed-systems laboratory.
Presentation layer
Producer portal · Buyer portal · Admin & compliance portal

HTTPS · authenticated API

Backend application
Identity & access
Users, organizations, roles


Material catalog
Waste listings and batches


Buyer specifications
Requirements and tolerances


Regulatory engine
Eligibility and rule versions


Matching engine
Constraints and ranking


Qualification workflow
Inquiries, samples, approvals


Document management
Evidence and verification


Audit & notifications
History, alerts and events





PostgreSQL
Transactional data, specifications, rule versions and audit metadata


Object storage
Reports, certificates, images and uploaded documents


Background worker
Document processing, notifications and batch rematching


External providers
Geocoding, routing and optional laboratory integrations




2. Architectural decisions
Decision	Recommended approach	Reason
Application structure	Modular monolith	Easier development, testing and deployment
Frontend	React with Next.js and TypeScript	Reusable forms, dashboards and responsive interfaces
Backend	Python with FastAPI	Strong validation, API contracts and suitability for matching/data workflows
Database	PostgreSQL	Relational constraints, transactions, structured queries and geospatial extensions if needed
Geospatial capability	PostGIS, when required	Distance and geographic filtering
Document storage	S3-compatible object storage	Keeps large files outside relational tables
Background work	Worker plus durable job queue	Supports document processing, notifications and rematching
Authentication	Established OIDC/OAuth-compatible identity provider	Avoids implementing authentication protocols from scratch
Deployment	Managed cloud or equivalent container hosting	Reduces operational burden for the pilot
API contract	OpenAPI	Enables frontend integration and API testing
These are proposed defaults, not decisions already validated against your team's skills, hosting budget, or competition requirements.
3. Core modules and responsibilities

3.1 Identity and organization module
Manages users, organizations, roles, facility memberships, and verification status.
Key boundary: a user may act on behalf of an organization only with the appropriate permissions. Buyer and producer roles may coexist within the same organization.




3.2 Material catalog module
Stores material categories, source processes, batches, availability, quantities, units, measured properties, and evidence references.
Key boundary: a material category is not a batch. A category describes a kind of material; a batch represents a particular quantity with specific measurements and provenance.




3.3 Buyer specification module
Defines target applications, mandatory property limits, preferred ranges, prohibited substances, required evidence, and preprocessing capabilities.
Key boundary: specifications belong to a receiving facility and intended use, not globally to the material category.




3.4 Regulatory rules engine
Determines applicable rules, evaluates evidence and authorization conditions, and returns a structured eligibility decision with reasons.
Key boundary: this module must not return a compatibility score in place of a legal decision. An unresolved required condition produces a hold, not an assumed pass.




3.5 Matching engine
Applies eligibility gates, technical constraints, treatment feasibility, and ranking criteria.
Key boundary: ranking operates only on candidates that pass the required gates. Unknown critical properties remain explicitly unknown.




3.6 Qualification and document modules
Manage inquiries, sample requests, supporting documents, review status, and the progression from discovery to buyer qualification.
Key boundary: a platform match is a candidate opportunity, not proof of technical approval or a completed transaction.



4. Matching architecture
This is the most safety-critical business workflow in WasteMatch.
#chatgpt-mermaid-_r_1a7_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1a7_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1a7_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1a7_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1a7_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1a7_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1a7_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1a7_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1a7_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1a7_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1a7_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1a7_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1a7_ p{margin:0;}#chatgpt-mermaid-_r_1a7_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1a7_ .label text,#chatgpt-mermaid-_r_1a7_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ .node rect,#chatgpt-mermaid-_r_1a7_ .node circle,#chatgpt-mermaid-_r_1a7_ .node ellipse,#chatgpt-mermaid-_r_1a7_ .node polygon,#chatgpt-mermaid-_r_1a7_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .rough-node .label text,#chatgpt-mermaid-_r_1a7_ .node .label text,#chatgpt-mermaid-_r_1a7_ .image-shape .label,#chatgpt-mermaid-_r_1a7_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1a7_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .rough-node .label,#chatgpt-mermaid-_r_1a7_ .node .label,#chatgpt-mermaid-_r_1a7_ .image-shape .label,#chatgpt-mermaid-_r_1a7_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1a7_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1a7_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1a7_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1a7_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1a7_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1a7_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1a7_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1a7_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1a7_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1a7_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1a7_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1a7_ .icon-shape,#chatgpt-mermaid-_r_1a7_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1a7_ .icon-shape p,#chatgpt-mermaid-_r_1a7_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1a7_ .icon-shape .label rect,#chatgpt-mermaid-_r_1a7_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1a7_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1a7_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1a7_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1a7_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1a7_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1a7_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1a7_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1a7_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1a7_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1a7_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1a7_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_1a7_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_1a7_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1a7_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1a7_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .node rect,#chatgpt-mermaid-_r_1a7_ .node circle,#chatgpt-mermaid-_r_1a7_ .node ellipse,#chatgpt-mermaid-_r_1a7_ .node polygon,#chatgpt-mermaid-_r_1a7_ .node path{fill:rgb(24, 24, 24);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1a7_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1a7_ .node.mermaid-decision .label-container{fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-dasharray:2px,2px;}#chatgpt-mermaid-_r_1a7_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1a7_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1a7_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Material batchValidate fields andprovenanceReceiver specificationLoad applicablerequirementsRegulatory eligibilityBlock candidateHold for reviewTechnical hard constraintsReject technical matchCalculate compatibilityEvaluate quantity andlogisticsRank and explain candidatesHuman qualificationProhibitedUnknown or conflictingEligibleFails, no validated treatmentMissing critical measurementPasses or treatment is feasible





4.1 Decision output
Every candidate evaluation should produce a structured result similar to:
{
  "candidate_id": "candidate-example",
  "eligibility": "eligible",
  "technical_status": "conditional",
  "ranking_score": 82,
  "missing_evidence": [],
  "required_treatment": ["drying"],
  "decision_reasons": [
    "Regulatory checks passed for the recorded scope",
    "Moisture exceeds the preferred operating range",
    "Drying feasibility requires confirmation"
  ],
  "rule_version": "example-rule-version",
  "review_required": true
}


This is an illustrative schema, not a claim that these values or this treatment have been validated. In production, an eligible legal status must mean all required legal conditions were actually satisfied for the specific transaction scope.
Important distinction: legal eligibility, technical compatibility, treatment feasibility, and commercial ranking should be stored separately. One status must never conceal another.
5. Data architecture
The relational data model should include the following principal entities:
Entity	Purpose
users	Individual accounts
organizations	Producer, buyer, recycler or service-provider organizations
facilities	Physical industrial sites and jurisdictions
organization_memberships	User roles and permissions
material_categories	Controlled material taxonomy
material_listings	Offers, quantities and availability
material_batches	Specific batches and source provenance
property_definitions	Property names, units and validation rules
batch_measurements	Measured, reported or estimated values
buyer_specifications	Receiving requirements and intended uses
specification_limits	Hard constraints, preferred ranges and prohibited conditions
regulatory_rules	Versioned rule definitions and applicability
regulatory_evaluations	Decisions, evidence references and reasons
match_candidates	Candidate pairs and evaluation status
match_evaluations	Technical checks, score breakdown and evaluation version
documents	File metadata, classification and verification status
inquiries	Buyer-producer communication workflow
audit_events	Important changes and access or decision history
Data integrity requirements
- Store units explicitly and validate compatible unit conversions.
- Preserve raw reported values alongside normalized values.
- Store measurement basis, date, source, and batch association.
- Never overwrite historical evidence without retaining version history.
- Use foreign keys and transactions for important relationships.
- Store large documents in object storage and keep access-controlled metadata in PostgreSQL.
- Avoid exposing confidential supplier or buyer fields through public listing APIs.
- Retain the inputs and rule versions used for each important match decision.
6. Security architecture
WasteMatch will contain potentially sensitive information: industrial waste quantities, production processes, pricing, buyer specifications, compliance documents, and supplier relationships.
The initial security model should include:
1. Authentication: Use a maintained identity provider or established authentication library.
2. Authorization: Enforce organization- and facility-level permissions in the backend.
3. Document access: Use private object storage and short-lived signed URLs where appropriate.
4. Data minimization: Reveal only the fields necessary for discovery and qualification.
5. Auditability: Log sensitive access, document verification, regulatory decisions, and material listing changes.
6. Input validation: Validate uploaded files, units, numerical ranges, and all API inputs.
7. Secret management: Keep credentials and signing keys out of source control.
8. Recovery: Maintain backups and test restoration procedures.
9. Privacy: Define retention, deletion, access, and incident-response processes.
A hidden frontend button is not an authorization mechanism. Every sensitive operation must be checked on the server.
7. Regulatory rules architecture
Do not implement Indian waste regulations as a long series of unversioned if statements scattered across the application.
Use a versioned rules registry with fields such as:
- Material and source applicability.
- Jurisdiction and intended-use conditions.
- Applicable legal instrument and exact clause.
- Effective date and supersession date.
- Required registrations, consents, authorizations, or documents.
- Conditions and exceptions.
- Verification evidence.
- Reviewer and review timestamp.
- Rule status and last legal review.
For the Maharashtra pilot, applicable central rules, Maharashtra-specific requirements, local-authority obligations, and facility-specific conditions must be considered together.
The rules engine should support three fundamental outcomes:
- ELIGIBLE: all required conditions for the assessed scope have been verified.
- HOLD: required evidence or interpretation is missing or conflicting.
- INELIGIBLE: a confirmed legal restriction or unmet mandatory condition prevents the proposed route.
A separate review status should indicate whether a human reviewer must approve the case.
8. Deployment architecture
For the pilot, deploy a small number of components:
#chatgpt-mermaid-_r_1an_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_1an_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1an_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_1an_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_1an_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_1an_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_1an_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_1an_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_1an_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_1an_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1an_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1an_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_1an_ p{margin:0;}#chatgpt-mermaid-_r_1an_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_1an_ .label text,#chatgpt-mermaid-_r_1an_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ .node rect,#chatgpt-mermaid-_r_1an_ .node circle,#chatgpt-mermaid-_r_1an_ .node ellipse,#chatgpt-mermaid-_r_1an_ .node polygon,#chatgpt-mermaid-_r_1an_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .rough-node .label text,#chatgpt-mermaid-_r_1an_ .node .label text,#chatgpt-mermaid-_r_1an_ .image-shape .label,#chatgpt-mermaid-_r_1an_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_1an_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .rough-node .label,#chatgpt-mermaid-_r_1an_ .node .label,#chatgpt-mermaid-_r_1an_ .image-shape .label,#chatgpt-mermaid-_r_1an_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_1an_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_1an_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1an_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1an_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_1an_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1an_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1an_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1an_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_1an_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_1an_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_1an_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_1an_ .icon-shape,#chatgpt-mermaid-_r_1an_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_1an_ .icon-shape p,#chatgpt-mermaid-_r_1an_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_1an_ .icon-shape .label rect,#chatgpt-mermaid-_r_1an_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_1an_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_1an_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_1an_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_1an_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_1an_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_1an_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_1an_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1an_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_1an_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_1an_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_1an_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1an_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_1an_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_1an_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1an_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_1an_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_1an_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1an_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_1an_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_1an_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_1an_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(232, 232, 232);}#chatgpt-mermaid-_r_1an_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_1an_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_1an_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .node rect,#chatgpt-mermaid-_r_1an_ .node circle,#chatgpt-mermaid-_r_1an_ .node ellipse,#chatgpt-mermaid-_r_1an_ .node polygon,#chatgpt-mermaid-_r_1an_ .node path{fill:rgb(24, 24, 24);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_1an_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_1an_ .node.mermaid-decision .label-container{fill:rgb(19, 19, 19);stroke:rgb(47, 47, 47);stroke-dasharray:2px,2px;}#chatgpt-mermaid-_r_1an_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_1an_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_1an_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI","Helvetica","Apple Color Emoji","Arial",sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}UsersHTTPS ingressWeb frontendBackend APIPostgreSQLPrivate object storageDurable job queueBackground workerEmail or notification providerMonitoring and audit





Environments
Maintain separate development, staging, and production environments.
- Development uses synthetic or appropriately anonymized data.
- Staging validates migrations, permissions, matching logic, and deployment procedures.
- Production contains real organization records and requires restricted access, backups, and operational monitoring.
Use automated builds, database migrations, health checks, structured logs, and rollback procedures.
9. Performance and scalability
Do not prematurely introduce microservices or a complex search infrastructure.
For the initial pilot:
- Use PostgreSQL indexes for category, availability, facility, and relevant structured fields.
- Apply hard filters before ranking candidate matches.
- Use background jobs for expensive document processing and bulk reevaluation.
- Cache only data whose freshness and authorization rules permit caching.
- Introduce dedicated search infrastructure only when measured query patterns justify it.
- Partition or archive high-volume audit data only when operational evidence warrants it.
The system should be designed to scale through clear module boundaries, not through infrastructure added merely because it looks impressive in a diagram.
10. Architecture risks and mitigations
Risk	Mitigation
Incorrect legal eligibility	Versioned rules, conservative holds, evidence traceability, independent review
False technical matches	Explicit hard constraints, units, measurement basis, missing-data handling
Confidential information leakage	Organization-scoped authorization and private document storage
Outdated specifications	Effective dates, version history, expiry or review reminders
Slow matching	Indexed filtering, bounded candidate sets and asynchronous bulk work
Inconsistent property data	Controlled taxonomy, validation, normalized units and provenance
AI-generated unsupported claims	Treat AI outputs as suggestions requiring validation against evidence
Premature complexity	Modular monolith and incremental infrastructure investment
11. Architecture decision records
The following decisions should be recorded and revisited as the pilot provides evidence.
ADR	Decision	Status
ADR-001	Modular monolith for MVP	Proposed
ADR-002	PostgreSQL as primary database	Proposed
ADR-003	Regulatory eligibility separated from ranking	Required design invariant
ADR-004	Batch-level property provenance	Required data invariant
ADR-005	Private object storage for documents	Proposed
ADR-006	Human review for unresolved regulatory cases	Required safety invariant
ADR-007	Versioned, reproducible matching evaluations	Required audit invariant
12. Architecture sign-off criteria
The SAD is ready for implementation when:
- Module responsibilities and API boundaries are agreed.
- The primary entities and relationships are defined.
- Regulatory and technical decision states are formalized.
- Organization-level and document-level permissions are designed.
- The deployment environment and hosting constraints are confirmed.
- The matching workflow can be tested independently of the UI.
- Logging, backups, migration, and recovery strategies are documented.
- The engineering team has reviewed the proposed stack against its skills and available resources.