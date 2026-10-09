# WasteMatch — Deployment and Operations Specification

**Document ID:** WM-DEPLOYMENT-OPS-009  
**Version:** 1.0  
**Status:** Draft for implementation planning  
**Project:** WasteMatch — Industrial Waste-to-Resource Matching Platform  
**Pilot Region:** Pune / Pimpri-Chinchwad, Maharashtra, India

---

## 1. Purpose

This document defines the deployment architecture, environment configuration, release process, database operations, monitoring, backup, recovery, and incident response procedures for WasteMatch.

The objective is to ensure that WasteMatch can be deployed consistently, operated safely, and recovered when components fail.

The operational design must support:

- Repeatable deployments.
- Separation of development, testing, staging, and production.
- Secure configuration and secrets management.
- Controlled database migrations.
- Reliable background evaluation jobs.
- Private document storage.
- Monitoring and alerting.
- Tested backup and recovery procedures.
- Auditable releases and administrative changes.
- A practical initial pilot without unnecessary infrastructure complexity.

**Architecture principle:** Start with the simplest deployment that meets the pilot's security and reliability requirements. Do not introduce Kubernetes, multiple microservices, or complex infrastructure merely because they sound impressive in a presentation.

## 2. Scope and assumptions

### 2.1 Proposed application stack

The following stack is provisional and must be confirmed before implementation.

| Component | Proposed technology |
|---|---|
| Frontend | React with Next.js and TypeScript |
| Backend API | Python with FastAPI |
| Database | PostgreSQL |
| ORM and migrations | SQLAlchemy and Alembic |
| Background jobs | Durable queue and worker process |
| File storage | Private S3-compatible object storage |
| Authentication | OIDC-compatible identity provider |
| API documentation | OpenAPI |
| Automated testing | Pytest and frontend test tooling |
| Packaging | Containers |
| CI/CD | Repository-integrated build and deployment pipeline |

A managed hosting provider should be preferred for the pilot when it reduces operational burden without compromising security, data ownership, cost control, or portability.

### 2.2 Initial deployment architecture

The recommended initial architecture is a **modular monolith** with independently deployable runtime processes where necessary.

Logical components:

1. Web frontend.
2. Backend API.
3. Background worker.
4. PostgreSQL database.
5. Durable job queue or managed queue service.
6. Private object storage.
7. Identity provider.
8. Monitoring and logging services.

The API and worker may share application code while running as separate processes. This provides operational isolation for background tasks without requiring a microservice architecture.

## 3. Environment strategy

Maintain separate environments with explicit access boundaries.

| Environment | Purpose | Data policy |
|---|---|---|
| Local development | Individual developer work | Synthetic data |
| Automated test | CI and automated tests | Disposable synthetic data |
| Staging | Release verification and UAT | Synthetic or approved anonymized data |
| Production pilot | Real pilot operations | Authorized, access-controlled business data |

### 3.1 Environment isolation

Each environment must have separate:

- Database instances or logically isolated databases with appropriate safeguards.
- Authentication configuration and client credentials.
- Storage buckets or equivalent isolated storage locations.
- Secrets and environment variables.
- Background queues.
- Logging and monitoring configuration.
- Deployment permissions.

Production credentials must never be reused in development or test environments.

Staging must not connect to production storage or execute jobs against production records unless a specific, reviewed operational process requires it.

### 3.2 Local development

Provide a documented setup procedure that enables a new developer to:

1. Clone the repository.
2. Install required dependencies.
3. Configure local environment variables.
4. Start PostgreSQL and required supporting services.
5. Run database migrations.
6. Load synthetic seed data.
7. Start the API, worker, and frontend.
8. Run automated tests.

The setup must not require access to real supplier or buyer data.

## 4. Deployment architecture

### 4.1 Request flow

```text
User
  |
  v
Web Frontend
  |
  v
Backend API
  |--------> PostgreSQL
  |--------> Private Object Storage
  |--------> Durable Job Queue
                    |
                    v
               Background Worker
                    |
                    v
           Evaluation and Processing
```

The identity provider authenticates users and issues tokens. The backend validates those tokens and enforces authorization.

The frontend must not connect directly to the database or receive unrestricted storage credentials.

### 4.2 Runtime responsibilities

**Frontend**
- Renders user interfaces.
- Sends requests to the backend API.
- Displays loading, incomplete, blocked, and failed states accurately.
- Does not make authoritative compliance decisions.

**Backend API**
- Authenticates requests.
- Enforces resource-level permissions.
- Validates input.
- Applies workflow rules.
- Creates evaluation requests.
- Returns authorized resource projections.

**Background worker**
- Processes long-running evaluations and document-processing tasks.
- Uses retry-safe job handlers.
- Records execution status and failures.
- Does not bypass application authorization or validation rules.

**Database**
- Stores application records and versioned evaluation results.
- Enforces relational integrity.
- Supports controlled migrations and recovery.

**Object storage**
- Stores documents privately.
- Uses short-lived, scoped upload and download URLs.
- Supports configured retention and deletion policies.

## 5. Configuration management

All environment-specific configuration must be external to application source code.

Examples include:

- Database connection string.
- Identity provider issuer and audience.
- Object storage endpoint and bucket.
- Queue connection details.
- Logging level.
- Allowed frontend origins.
- Request and upload size limits.
- Rate-limit settings.
- Evaluation worker concurrency.
- Timeout settings.
- Backup retention configuration.

Configuration must be validated at application startup. Missing required production configuration should cause a clear startup failure rather than an application that runs in a partially secure state.

### 5.1 Configuration rules

- Do not commit `.env` files containing real secrets.
- Provide a `.env.example` containing placeholders only.
- Use distinct settings for each environment.
- Validate URLs, ports, required identifiers, and numeric limits.
- Avoid storing secrets in frontend build-time variables.
- Treat any frontend-exposed environment variable as public.
- Document which configuration values require a restart or redeployment.
- Keep configuration changes auditable.

## 6. Secrets and credentials

Secrets include:

- Database passwords.
- Identity provider client secrets.
- Object storage credentials.
- Queue credentials.
- Signing keys.
- External service credentials.

Production secrets must be stored in an approved secrets manager or protected platform secret store.

### 6.1 Secret lifecycle

1. Create secrets through the approved administrative process.
2. Grant access only to the runtime or deployment identity that needs them.
3. Rotate secrets according to the risk and provider capabilities.
4. Revoke compromised or obsolete credentials.
5. Verify that secret values are not included in logs, error messages, build artifacts, or repository history.

Developers must not use shared production credentials for local debugging.

If a secret is accidentally committed, removing it from the latest commit is insufficient. The credential must be treated as exposed and rotated.

## 7. Continuous integration and delivery

### 7.1 Pull-request pipeline

Every pull request should run:

1. Formatting and lint checks.
2. Static type checks where configured.
3. Backend unit tests.
4. Frontend tests.
5. API schema validation.
6. Database migration checks.
7. Authorization and security-focused tests.
8. Matching-engine invariant tests.
9. Dependency vulnerability checks.
10. Container or deployment artifact validation.

The pipeline must fail when required checks fail.

### 7.2 Build pipeline

After an approved merge:

1. Build the frontend and backend artifacts.
2. Build immutable container images where containers are used.
3. Generate a build identifier.
4. Associate the artifact with the source revision.
5. Run required automated tests.
6. Publish artifacts to a controlled registry.
7. Retain sufficient build metadata to reproduce the release.

Do not rebuild an untracked or materially different artifact during production deployment and assume it is identical to the tested artifact.

### 7.3 Deployment pipeline

Recommended release flow:

```text
Pull Request
    |
    v
Automated Checks
    |
    v
Merge Approved
    |
    v
Build Immutable Artifacts
    |
    v
Deploy to Staging
    |
    v
Smoke Tests + UAT
    |
    v
Release Approval
    |
    v
Deploy to Production
    |
    v
Post-Deployment Verification
```

Production deployment should require an authorized release action. For the early pilot, manual approval is acceptable if the process is documented and repeatable.

### 7.4 Release metadata

Record:

- Release identifier.
- Source commit or equivalent immutable revision.
- Build timestamp.
- Deployment timestamp.
- Deployed application version.
- Database migration version.
- Approver.
- Deployment outcome.
- Rollback or remediation details, if applicable.

## 8. Database operations

### 8.1 Database migrations

Use version-controlled migrations for schema changes.

Every migration must be reviewed for:

- Data integrity.
- Locking and downtime implications.
- Backward compatibility.
- Index creation and performance.
- Data transformation requirements.
- Rollback or forward-recovery options.

### 8.2 Migration policy

Prefer an expand-and-contract approach for changes that affect live data:

1. Add compatible schema elements.
2. Deploy application code that supports the transition.
3. Backfill data in a controlled and observable way.
4. Verify the transformed data.
5. Switch application behavior.
6. Remove obsolete schema elements in a later release.

Do not combine a destructive schema change with an application release unless the impact and recovery plan have been reviewed.

### 8.3 Migration safety

Before production migrations:

- Confirm a recent successful backup.
- Test the migration against representative staging data.
- Estimate execution time and locking behavior.
- Confirm the maintenance or deployment window if required.
- Define recovery steps.
- Record the resulting schema version.

Application rollback does not automatically reverse a database migration safely.

### 8.4 Connection management

Configure database connection pooling and limits appropriate to the hosting environment.

The total connection capacity across API instances, worker processes, migration tools, and administrative access must remain within the database's limits.

Monitor connection saturation, slow queries, lock waits, storage capacity, and failed transactions.

## 9. Background jobs and evaluations

Long-running tasks should use a durable queue or equivalent reliable job mechanism.

Examples:

- Large match evaluations.
- Bulk imports.
- Document scanning.
- Evidence processing.
- Notifications.
- Reconciliation jobs.

### 9.1 Job reliability

Each job handler must:

- Validate the referenced resource.
- Check that the resource still exists and is in an appropriate state.
- Be safe to retry.
- Record a stable job or evaluation identifier.
- Record success, failure, and retry metadata.
- Avoid duplicate side effects.
- Use bounded retries with backoff.
- Send permanently failing jobs to a reviewable dead-letter mechanism where supported.

### 9.2 Evaluation consistency

An evaluation must use a defined input snapshot or immutable version references.

If a batch, buyer specification, or regulatory rule changes while an evaluation is running, the result must clearly identify the versions used. It must not silently mix inconsistent versions of input data.

### 9.3 Queue monitoring

Monitor:

- Queue depth.
- Oldest pending job age.
- Job execution duration.
- Retry count.
- Failure rate.
- Dead-letter count.
- Worker availability.

A queue that accepts jobs but never processes them is a failure, even if the API continues returning successful responses.

## 10. File and document storage

Store evidence documents in private object storage.

### 10.1 Upload lifecycle

1. User requests an upload session.
2. API verifies permission and allowed file constraints.
3. API issues a short-lived upload authorization.
4. Client uploads the file.
5. Server validates the uploaded object.
6. Malware scanning or equivalent checks run where available.
7. Document metadata is stored.
8. Document becomes available for permitted workflows only after required processing and review.

### 10.2 Storage controls

- Keep buckets private.
- Restrict access by application identity.
- Use encryption in transit and at rest where supported.
- Avoid embedding permanent object URLs in public API responses.
- Enforce upload limits.
- Validate actual file type, not just filename extension.
- Track document ownership, purpose, and verification status.
- Apply retention and deletion policies.
- Audit sensitive document access where required.

Document upload success must not be interpreted as evidence acceptance or regulatory approval.

## 11. Monitoring and observability

The application must provide enough operational information to detect failures, understand their impact, and recover safely.

### 11.1 Application metrics

Monitor:

- Request count.
- Response latency.
- Error rate.
- Authentication failures.
- Authorization failures.
- Match evaluation duration.
- Evaluation failure rate.
- Background queue depth.
- Database connection saturation.
- Document-processing failures.
- Storage capacity.
- Deployment health.

### 11.2 Logging

Use structured logs where possible.

Each request should include a request or correlation ID. Evaluation jobs should have a stable identifier that can be traced across API, worker, and database logs.

Logs must not contain:

- Passwords or access tokens.
- Database credentials.
- Full confidential documents.
- Unnecessary personal data.
- Sensitive request payloads by default.

### 11.3 Health checks

Provide distinct checks for:

- **Liveness:** the process is running.
- **Readiness:** the process can safely accept its intended workload.
- **Dependency health:** database, queue, storage, and other required dependencies are available.

A dependency failure should be reported accurately. Do not make a failing database appear healthy merely because the web server still responds to HTTP requests.

### 11.4 Alerting

Configure alerts for:

- Sustained API error-rate increases.
- Repeated authentication or authorization failures.
- Database unavailability.
- Queue backlog beyond the agreed threshold.
- Repeated evaluation failures.
- Storage exhaustion risk.
- Failed backups.
- Deployment health-check failures.
- Suspected unauthorized access.

Alerts must have an assigned owner and a documented response procedure. An alert nobody owns is just a machine generating noise.

## 12. Backup and recovery

### 12.1 Backup scope

The backup plan must cover:

- PostgreSQL data.
- Object storage documents and metadata.
- Critical configuration that can be safely backed up.
- Regulatory rule versions and approval history.
- Application release metadata.
- Required audit records.

Secrets should be recoverable through the approved secrets-management process rather than copied into ordinary backup archives.

### 12.2 Backup strategy

Use provider-supported automated database backups or another approved backup mechanism.

Where required by the agreed recovery objectives, configure point-in-time recovery.

Object storage protection should include versioning, replication, backups, or another mechanism appropriate to the provider and data risk.

Database backups alone are insufficient if the associated evidence documents cannot be recovered.

### 12.3 Initial recovery targets

The following are provisional planning targets for the pilot and must be agreed with stakeholders:

- **Recovery Point Objective (RPO):** no more than 24 hours of data loss.
- **Recovery Time Objective (RTO):** restore critical pilot workflows within 8 hours.

These targets are not guarantees. The selected infrastructure and recovery procedures must be tested against them. If the business requires stricter targets, the architecture and operating cost must reflect that.

### 12.4 Recovery testing

Perform a controlled restore test before the production pilot and repeat it at an agreed cadence.

Verify that:

- The database can be restored.
- Documents remain accessible through authorized workflows.
- Schema migrations are consistent.
- Application versions can connect to the restored schema.
- Critical evaluation history is intact.
- Authentication and secrets can be reconfigured safely.
- The restored system passes smoke tests.

A backup that has never been restored is a hopeful file, not a verified recovery plan.

## 13. Deployment and rollback

### 13.1 Pre-deployment checklist

- [ ] Required automated tests pass.
- [ ] Security checks pass.
- [ ] Staging deployment succeeds.
- [ ] Critical user workflows pass smoke tests.
- [ ] Database migration has been reviewed.
- [ ] Backup status is verified where required.
- [ ] Release artifact and source revision are recorded.
- [ ] Monitoring and alerting are operational.
- [ ] Release approver is identified.
- [ ] Recovery steps are documented.

### 13.2 Post-deployment verification

After deployment:

1. Verify application health.
2. Verify authentication.
3. Verify database connectivity.
4. Verify queue and worker operation.
5. Verify private document access.
6. Execute a controlled test workflow.
7. Check error rates and logs.
8. Confirm the deployed version.
9. Record release outcome.

### 13.3 Rollback policy

Rollback may be required when:

- Critical workflows fail.
- Authorization behavior regresses.
- Data integrity is threatened.
- Evaluation results become inconsistent.
- A deployment causes sustained operational failure.

Preferred response:

1. Stop or limit affected workflows if necessary.
2. Assess whether data corruption or unauthorized access occurred.
3. Revert to a known-good application artifact where safe.
4. Preserve relevant logs and evidence.
5. Evaluate database migration compatibility before rollback.
6. Restore or repair data only under an approved recovery procedure.
7. Verify critical workflows.
8. Record the incident and corrective actions.

Do not automatically reverse a database migration merely because the application is rolled back. Schema and data recovery require an explicit plan.

## 14. Incident response

### 14.1 Incident categories

| Severity | Example | Initial response |
|---|---|---|
| Critical | Confidential data breach or incorrect eligibility decisions affecting active workflows | Contain immediately and notify the designated incident owner |
| High | Core application unavailable or widespread evaluation failures | Investigate and restore service promptly |
| Medium | Major feature unavailable with a workaround | Assign and resolve according to agreed priority |
| Low | Minor defect without significant operational impact | Track for planned correction |

### 14.2 Response process

1. Detect and record the incident.
2. Assess scope and severity.
3. Assign an incident owner.
4. Contain the impact.
5. Preserve relevant evidence and logs.
6. Restore safe service.
7. Validate affected data and evaluations.
8. Communicate status to affected stakeholders.
9. Complete root-cause analysis.
10. Track corrective and preventive actions.

For incidents involving confidential data or possible regulatory impact, follow applicable legal obligations and the organization's approved incident-notification process.

### 14.3 Incorrect match or eligibility result

If a serious evaluation defect is discovered:

- Stop presenting affected results as reliable.
- Identify evaluations produced by the affected rule or engine version.
- Determine whether any users acted on the results.
- Preserve the affected evaluation history.
- Correct the underlying defect or rule.
- Re-evaluate affected candidates where appropriate.
- Notify authorized stakeholders.
- Document the remediation and review requirements.

Do not delete historical results merely to hide an incorrect result. Preserve traceability while clearly marking results as superseded or under review.

## 15. Data lifecycle and operational governance

Operational policies must define:

- Document retention periods.
- User account deactivation.
- Organization closure.
- Data export and deletion requests.
- Audit record retention.
- Regulatory rule review schedules.
- Evaluation expiry and re-evaluation triggers.
- Data ownership and access revocation.
- Backup retention and secure disposal.

Deletion must account for references between batches, measurements, documents, inquiries, and evaluations. Where records must be retained for legitimate legal or audit reasons, restrict access and document the retention basis.

The pilot must not promise permanent deletion from all backups unless the backup architecture can actually guarantee it.

## 16. Cost management

Track the major operating cost categories:

- Frontend hosting.
- API and worker compute.
- Managed PostgreSQL.
- Object storage.
- Data transfer.
- Identity provider.
- Logging and monitoring.
- Backup and recovery.
- External APIs or integrations.

### Cost controls

- Set budget alerts.
- Limit log retention to approved periods.
- Configure file size limits.
- Remove abandoned test environments.
- Scale workers according to measured workload.
- Monitor expensive database queries.
- Avoid unnecessary external service calls.
- Review costs after the first pilot users begin using the system.

Do not optimize solely for the lowest monthly bill. A slightly more expensive managed database may be cheaper than an unreliable self-managed database that consumes engineering time and threatens the pilot.

## 17. Operational runbooks

Before production pilot launch, document procedures for:

1. Application deployment.
2. Application rollback.
3. Database migration.
4. Database backup and restore.
5. Failed background jobs.
6. Queue backlog.
7. Object storage outage.
8. Authentication failure.
9. Suspected unauthorized access.
10. Incorrect compliance or match evaluation.
11. Expired credentials.
12. Failed health checks.
13. Storage capacity exhaustion.
14. User or organization access revocation.

Each runbook must include symptoms, diagnostic steps, safe remediation, escalation owner, verification steps, and required incident records.

## 18. Open decisions

Resolve these before production deployment:

1. Which cloud or hosting provider will be used?
2. Will the database and queue be managed services?
3. Which identity provider will be configured?
4. What data-residency and contractual requirements apply?
5. What are the approved RPO and RTO?
6. Which documents require enhanced retention or access restrictions?
7. What are the expected pilot traffic and evaluation volumes?
8. Which alerts require immediate notification?
9. Who owns production access and release approval?
10. How will regulatory rules be reviewed and updated?
11. Which costs require budget approval?
12. Who is responsible for incident communications?

These decisions must be made using the actual pilot risk profile and hosting options, not guessed from a generic deployment diagram.

## 19. Definition of done

Deployment operations are ready for the MVP when:

- Developers can reproduce the local setup.
- Environments are separated.
- Secrets are stored safely.
- CI checks are automated.
- A tested artifact can be deployed to staging and production.
- Database migrations are controlled.
- Background jobs are retry-safe and observable.
- Evidence documents remain private.
- Monitoring and actionable alerts are configured.
- Database and document recovery procedures have been tested.
- Rollback steps are documented.
- Incident response ownership is assigned.
- Operational costs are visible.
- Production access is limited and auditable.
- The initial pilot meets its agreed recovery targets or explicitly documents the accepted gap.

---

**End of DEPLOYMENT-OPS.md — Version 1.0**