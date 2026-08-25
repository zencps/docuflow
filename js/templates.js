export const templates = {
  sop: `# SOP-101: Production Deployment & Verification Procedure

> **Objective:** Establish a standardized, zero-downtime operational procedure for deploying code releases, executing database migrations, and validating service health.

---

## 1. Document Control & Scope
* **Document Owner:** DevOps & Platform Engineering
* **Audience:** Site Reliability Engineers, QA Leads, Systems Administrators
* **Review Frequency:** Quarterly
* **Classification:** Internal Confidential

| Version | Effective Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| **v1.0.0** | 2026-11-01 | Lead Platform Engineer | Initial baseline SOP release |
| **v1.1.0** | 2026-11-02 | Lead SRE | Added canary health verification steps |

---

## 2. Prerequisites & Pre-Flight Checklist
Prior to commencing deployment, ensure all verification items below are fulfilled:

- [x] Staging release candidate signed off by QA
- [x] Automated unit and regression test suites passing (100% green)
- [ ] Database backup snapshot triggered and confirmed healthy
- [ ] Active maintenance notification dispatched to customer success team
- [ ] Rollback strategy and artifacts verified in staging environment

---

## 3. Step-by-Step Procedure

### 3.1 Step 1: Pre-Deployment Backup & Snapshot
Execute the automated database and state snapshot:
\`\`\`bash
# Trigger database backup snapshot
db-admin snapshot create --environment production --tag pre-deploy-v1.1.0
\`\`\`

### 3.2 Step 2: Canary Container Deployment
Deploy the new application image to 10% of traffic nodes:
\`\`\`bash
# Deploy canary rollout
kubectl set image deployment/app-gateway gateway=registry.internal/app:v1.1.0 --record
\`\`\`

### 3.3 Step 3: Canary Traffic Health Validation
Monitor telemetry for five minutes:
1. Verify 5xx HTTP response rates remain below **0.05%**.
2. Confirm p99 latency does not exceed **120ms**.
3. Inspect APM traces for unhandled exceptions or connection leaks.

### 3.4 Step 4: Full Traffic Rollout
Promote the rollout to 100% of production traffic nodes:
\`\`\`bash
# Promote to full deployment
kubectl rollout status deployment/app-gateway
\`\`\`

---

## 4. Troubleshooting & Rollback Escalation

> **Critical Note:** If error rates exceed 0.5% during any phase of rollout, halt progression immediately and initiate the emergency rollback procedure.

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **Spike in 502/504 Bad Gateway** | New pod startup failure or failed health check | Run \`kubectl logs\` and immediately rollback deployment |
| **Elevated DB Connection Count** | Connection pool misconfiguration | Scale connection proxy and verify pool limits |
| **Stale Cache Returns** | CDN purge webhook failure | Trigger manual CDN invalidation via API gateway |

### Rollback Execution Command:
\`\`\`bash
# Emergency rollback to previous stable release
kubectl rollout undo deployment/app-gateway
\`\`\`

---

## 5. Post-Deployment Verification Checklist
- [ ] Automated smoke tests executed and verified against production domain
- [ ] APM and CloudWatch alerts cleared
- [ ] Maintenance window closed and status page updated to Operational
- [ ] Final sign-off recorded in deployment tracking log
`,

  'blank-sop': '',

  onboarding: `# Guide: Enterprise Client Onboarding & Platform Setup

> **Overview:** Welcome to the enterprise platform. This onboarding guide walks your technical and administrative teams through account provisioning, role delegation, API integration, and standard support channels.

---

## 1. Onboarding Timeline & Milestones

| Phase | Milestone | Estimated Duration | Target Completion |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Tenant Provisioning & SSO Integration | Days 1–3 | Day 3 |
| **Phase 2** | Role-Based Access Control (RBAC) Setup | Days 4–5 | Day 5 |
| **Phase 3** | API Credential Generation & Sandbox Test | Days 6–8 | Day 8 |
| **Phase 4** | Production Go-Live & Customer Review | Days 9–10 | Day 10 |

---

## 2. Account Provisioning & Single Sign-On (SSO)

### 2.1 Identity Provider (IdP) Setup
Our platform supports SAML 2.0 and OpenID Connect (OIDC) through Okta, Microsoft Azure AD, and Google Workspace.

1. Navigate to **Enterprise Settings > Authentication > Add SAML Connection**.
2. Copy your Organization Entity ID and Single Sign-On ACS URL:
   * **ACS URL:** \`https://auth.platform.io/saml/v2/sso/callback\`
   * **Audience URI:** \`urn:auth:platform.io:sp\`
3. Upload your Identity Provider Metadata XML or input your Single Sign-On Service URL.

> **Note:** Enforce Multi-Factor Authentication (MFA) across all administrative roles before inviting team members.

---

## 3. Pre-Flight Setup Checklist
Complete the following operational prerequisites prior to scheduled sandbox testing:

- [ ] Corporate domain verified via DNS TXT record
- [ ] SSO Identity Provider federation tested with pilot admin account
- [ ] User directory groups mapped to Platform Roles (Admin, Editor, Viewer)
- [ ] IP allowlist configured for restricted API endpoints
- [ ] Webhook notification receiver endpoint initialized

---

## 4. API Authentication & Quickstart
All programmatic requests require an authenticated Bearer token passed in the \`Authorization\` header:

\`\`\`bash
# Generate temporary session token
curl -X POST https://api.platform.io/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{"client_id": "CLIENT_ID", "client_secret": "CLIENT_SECRET"}'
\`\`\`

---

## 5. Frequently Asked Questions (FAQ)

### Q: How do we invite external contractors with limited access?
Assign the **External Collaborator** role. This role restricts access to designated projects and suppresses tenant-level configuration panels.

### Q: What are the default API rate limits for enterprise tiers?
Enterprise tiers include **5,000 requests per minute** per workspace, with burst elasticity up to **10,000 RPM**.

---

## 6. Support Contacts & Escalation Matrix

| Tier | Contact Method | Response SLA | Availability |
| :--- | :--- | :--- | :--- |
| **Level 1 (Standard Helpdesk)** | \`support@platform.io\` | < 4 Business Hours | 24/5 (Mon–Fri) |
| **Level 2 (Technical Escalation)** | Slack Connect Shared Channel | < 1 Hour | 24/7 |
| **Level 3 (Sev-1 Outage)** | PagerDuty Incident Hotline | < 15 Minutes | 24/7/365 |
`,

  runbook: `# Incident Runbook & Technical Bug Report: INC-4029

> **Status:** Active Investigation  
> **Severity:** Severity 2 (Major Service Degradation)  
> **Incident Lead:** On-Call Systems Engineer  
> **Date / Time:** 2026-11-02 14:22 UTC  

---

## 1. Incident Overview & Impact
At 14:22 UTC, automated synthetic monitors detected an elevated error rate (HTTP 500) on the order processing pipeline. Client webhook dispatches are queueing up, with an estimated delay of 14 minutes.

* **Impacted Service:** Order Ingestion API & Webhook Dispatcher
* **Customer Impact:** Orders submitted via mobile checkout return intermittent timeouts.
* **Data Integrity:** No data corruption detected; requests buffered in fallback message queue.

---

## 2. Environment & System Attributes

| Parameter | Value |
| :--- | :--- |
| **Environment** | Production (Cluster US-East-1) |
| **Release Version** | v2.14.3 (commit \`#a8b3f91\`) |
| **Affected Pods** | \`order-ingest-worker-7d9f6-*\` |
| **Database Cluster** | PostgreSQL 16.2 (Primary + 2 Read Replicas) |
| **Queue Engine** | RabbitMQ 3.12 (High-Availability Mirror) |

---

## 3. Steps to Reproduce
1. Dispatch an authenticated POST payload to \`/v1/orders/checkout\`:
\`\`\`bash
curl -X POST https://api.production.internal/v1/orders/checkout \\
  -H "Authorization: Bearer test_token" \\
  -H "Content-Type: application/json" \\
  -d '{"order_id": "ORD-99120", "items": [{"sku": "SKU-4", "qty": 1}]}'
\`\`\`
2. Observe HTTP 500 status returned after a 15,000ms socket timeout.

---

## 4. Expected vs. Actual Output

### Expected Behavior:
* Returns **HTTP 201 Created** within 85ms.
* Dispatches asynchronous confirmation webhook to client URL.

### Actual Behavior:
* Gateway logs **HTTP 504 Gateway Timeout**.
* Database connection pool reports \`FATAL: remaining connection slots reserved\`.

---

## 5. Diagnostic Runbook & Recovery Procedure

### 5.1 Step 1: Inspect Database Connection Pool
\`\`\`bash
# Check current connection state and active locks
psql -h db-primary.internal -U postgres -d orders \\
  -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
\`\`\`

### 5.2 Step 2: Terminate Idle Inactive Locks
\`\`\`bash
# Terminate idle transactions older than 5 minutes
psql -h db-primary.internal -U postgres -d orders \\
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < now() - INTERVAL '5 minutes';"
\`\`\`

### 5.3 Step 3: Restart Worker Pods Gracefully
\`\`\`bash
# Graceful restart of worker pool
kubectl rollout restart deployment/order-ingest-worker
\`\`\`

---

## 6. Incident Resolution Checklist
- [ ] Connection pool exhaustion root-cause identified and patched
- [ ] Backlogged message queue drained to zero
- [ ] Synthetic checkout transactions executing under 90ms
- [ ] Incident timeline document drafted for post-mortem review
- [ ] Retrospective scheduled with Platform and Database engineering leads
`
};

templates['blank'] = templates['blank-sop'];
templates['blank_sop'] = templates['blank-sop'];
templates['default'] = templates['blank-sop'];
templates['bug-report'] = templates.runbook;

/**
 * Returns a template by key. If the key exists in templates (including empty blank templates),
 * returns its content string; otherwise returns an empty string.
 * 
 * @param {string} key 
 * @returns {string} Markdown template content
 */
export function getTemplate(key) {
  if (key && Object.prototype.hasOwnProperty.call(templates, key)) {
    return templates[key];
  }
  return '';
}
