# United States requirements for users under 13

Last reviewed: 2026-07-17

> This document is a product and engineering checklist, not legal advice. Before allowing children under 13 to create accounts or send speech to the service, have qualified U.S. privacy counsel review the actual product, marketing, vendors, school use, and launch states.

## Scope

History2Life is an online speech service intended for students. It receives a user's voice, sends audio to Amazon Bedrock Nova 2 Sonic, receives generated audio and transcripts, and is planned to retain conversation transcripts and inferred per-character memories. If the service is directed to children under 13, or if a general-audience service has actual knowledge that it is collecting personal information from a child under 13, the federal Children's Online Privacy Protection Act and Rule (COPPA) may apply.

Authoritative starting points:

- [FTC COPPA rule page](https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa)
- [Current rule text, 16 CFR Part 312](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312)
- [COPPA statute, 15 U.S.C. §§ 6501–6506](https://uscode.house.gov/view.xhtml?path=/prelim@title15/chapter91&edition=prelim)
- [FTC COPPA compliance FAQ](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)
- [FTC six-step compliance plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business)
- [FTC children's privacy business resources](https://www.ftc.gov/privacy-and-security/children%27s-privacy)

The FTC FAQ notes that the COPPA Rule was amended on April 22, 2025. Use the current rule and current FTC guidance rather than relying on older summaries.

## Why History2Life data is relevant

COPPA personal information includes persistent identifiers and an audio file containing a child's voice. It can also include information about a child or parent collected from the child and combined with an identifier. For this application, potentially covered data includes:

- Firebase account identifiers and contact information.
- Session cookies, IP addresses, device identifiers, and operational logs.
- Live microphone audio while it is transmitted and processed.
- Final user transcripts derived from speech.
- Conversation history associated with an account.
- Inferred memories such as a child's name, preferences, school, location, family details, interests, or emotional context.
- Support, consent, and parent-verification records.

Not retaining raw audio reduces risk, but it does not make the rest of the data outside COPPA. Transcripts and inferred memories remain linked to a persistent account identifier.

## Federal COPPA requirements and product implications

### 1. Determine audience and age before collecting personal information

The operator must determine whether the service is child-directed, mixed-audience, or general-audience with actual knowledge of under-13 users. The FTC explains relevant audience factors in its [six-step compliance plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business#step1).

For a mixed-audience flow, age information must be collected before other personal information so under-13 users can be routed to the protected experience. The age screen must be neutral; it should not encourage a child to lie to gain access.

Required application features:

- A neutral age-screening step before Firebase sign-up, microphone access, analytics, or the conversation WebSocket.
- A server-owned account classification such as `adult`, `teen`, `child_pending_consent`, or `child_consented`; never trust a browser-only flag.
- A hard server-side gate that prevents an under-13 account without valid consent from opening a conversation, generating a transcript, or creating memory.
- A documented process for correcting an incorrectly entered birth date without letting a child bypass the gate.
- A launch decision, approved by counsel, identifying whether History2Life is child-directed, mixed-audience, school-authorized, or parent-authorized.

### 2. Publish a clear COPPA privacy policy

The FTC says a covered operator must publish a clear and comprehensive policy describing its child-data practices and the practices of other operators collecting through the service. See [Step 2 of the FTC plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business#step2).

The policy should identify:

- The operator and contact information.
- Every category of child personal information collected.
- Why each category is collected and how it is used.
- Whether and why information is disclosed to each service provider or third party.
- The purpose-specific retention period and deletion timeframe for each category.
- How a parent reviews or deletes data and stops future collection.

Required application features:

- A versioned child privacy notice linked prominently at account creation and wherever child information is collected.
- A machine-readable privacy-policy version on every consent record.
- A maintained data-flow/vendor register covering at least Firebase/Google, Amazon Bedrock/AWS, hosting, logging, error monitoring, email, and analytics.
- A release check that blocks adding a new child-data collector until the policy, direct notice, and vendor register are updated.

### 3. Send direct notice to the parent

Before collecting a child's personal information, a covered operator generally must send a direct notice to the parent. See [Step 3 of the FTC plan](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business#step3).

The direct notice must clearly explain what will be collected, how it will be used or disclosed, that consent is required, how consent can be provided, and where to read the privacy policy. Material changes require a new notice and, where required, renewed consent.

Required application features:

- Parent invitation and verified parent contact workflow.
- Templated, versioned direct notices listing voice processing, transcripts, memories, vendors, purposes, and retention.
- Expiration and deletion of parent contact information when consent is not completed within the approved period.
- Re-consent workflow when collection, use, disclosure, retention, or vendors materially change.

### 4. Obtain verifiable parental consent before collection

Covered collection generally requires verifiable parental consent, subject to narrow exceptions. FTC guidance on acceptable methods is in [Step 4](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business#step4) and the [COPPA FAQ's parental-consent section](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions#I.%20Verifiable%20Parental%20Consent).

Required application features:

- Integration with a counsel-approved verifiable parental consent method; an unchecked “I am a parent” box is not enough.
- A consent record containing parent identity/verification result, child account, notice and policy versions, allowed purposes and disclosures, method, timestamp, expiration/revocation status, and audit metadata.
- Separate consent choices where required for internal use versus non-integral third-party disclosure.
- Consent enforcement in backend authorization, not just UI.
- No microphone permission request and no Bedrock stream until the backend confirms active consent.

### 5. Give parents ongoing access, deletion, and collection controls

The FTC states that parents must be able to review the personal information collected from their child, revoke consent/refuse further collection or use, and have the child's information deleted. See [Step 5](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business#step5).

This requirement means the product decision that users will not see or manage automatic memories cannot also prevent an authenticated parent from exercising required rights.

Required application features:

- A parent dashboard or supported request workflow showing the child's account data, transcripts, inferred memories, consent records, and relevant metadata.
- Parent identity re-verification before access or deletion.
- Revoke-consent control that immediately blocks further child-data collection and conversation sessions.
- Deletion covering primary records, derived memories, embeddings/vector rows, caches, search indexes, logs where applicable, and downstream processors according to contracts.
- Export capability in a readable form.
- A tracked request workflow with deadlines, completion evidence, and exception handling.

### 6. Minimize collection; do not require unnecessary information

COPPA prohibits conditioning participation on collecting more information than is reasonably necessary. The FTC also instructs operators to minimize collection.

Required application features:

- Do not request a child's full legal name, precise location, school, phone number, or open-ended profile fields unless a reviewed feature genuinely requires it.
- Use a pseudonymous internal user ID in model and database integrations.
- Configure prompts so historical characters do not solicit address, school, contact information, credentials, or other unnecessary sensitive details.
- Add detection and suppression/review rules for highly sensitive candidate memories.
- Keep historical persona knowledge separate from child memory.
- Disable behavioral advertising, cross-context tracking, and unrelated analytics in the child experience unless counsel confirms a lawful design and all required consent.

### 7. Use reasonable security and govern service providers

COPPA requires reasonable procedures to protect confidentiality, security, and integrity, and reasonable steps to release child information only to parties capable of protecting it. The current FTC plan calls for a written information-security program and written assurances from service providers. See [Step 6](https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business#step6) and the current security-program requirements in [16 CFR § 312.8(b)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312/section-312.8).

Required application features and controls:

- Authenticate the conversation WebSocket before any audio is accepted. Derive user and persona scope on the server.
- TLS in transit and encryption at rest for databases, backups, and queues.
- Strict `(user_id, persona_id)` authorization for memory and transcript access.
- Least-privilege AWS, Firebase, database, and administrative roles.
- Separate production, staging, and development data; do not use child production data for development.
- Redact audio/transcripts and child identifiers from routine logs and error reporting.
- Audit access to child records and alert on suspicious or bulk access.
- Written incident-response, vulnerability-management, backup, restoration, and secure-deletion procedures.
- Vendor contracts/data-processing terms that address confidentiality, security, purpose limitations, deletion, incidents, and subcontractors.
- A written child-data security program with one or more designated coordinators accountable for it.
- A documented risk assessment at least annually, and again after material changes, covering internal and external risks to child information.
- Risk-based administrative, technical, and physical safeguards designed to control identified risks.
- Regular testing and monitoring of safeguards, including after material system changes.
- Evaluation and modification of the security program at least annually in light of testing, incidents, operational changes, and newly identified risks.
- Periodic vendor security review and written assurance that each recipient or service provider can maintain required safeguards.

### 8. Define finite, purpose-specific retention and secure deletion

The current FTC six-step plan says the privacy policy must state the purpose, business need, and deletion timeframe, and that child personal information cannot be retained indefinitely. Data should be kept only as long as reasonably necessary for the specific purpose and securely deleted afterward.

Required application features:

- A data-retention table approved by product, security, and counsel for account data, consent evidence, transcripts, memories, operational logs, backups, and deletion audit evidence.
- `expires_at` or equivalent policy metadata on transcripts and memories.
- Automated retention jobs with retry, monitoring, and deletion audit records.
- Account deletion and consent revocation cascades.
- Backup expiration/deletion handling documented and tested.
- A legal-hold mechanism limited to approved cases.

The requested “retain transcripts and memories indefinitely” policy should not ship for under-13 accounts.

## Voice-specific handling

The current COPPA Rule codifies a narrow voice-audio exception at [16 CFR § 312.5(c)(9)](https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312/section-312.5): an operator may collect an audio file containing a child's voice without prior parental consent only when it collects no other personal information, uses the audio solely to respond to the child's specific request, does not disclose it, and deletes it immediately after responding. The FTC's earlier [voice-recording guidance](https://www.ftc.gov/news-events/news/press-releases/2017/10/ftc-provides-additional-guidance-coppa-voice-recordings) provides background but does not broaden the current rule.

History2Life should not assume this narrow policy covers durable transcripts or inferred memory. The architecture should:

- Stream microphone audio only for the current conversation.
- Avoid writing raw input or generated audio to application storage, logs, queues, crash reports, or analytics.
- Confirm and document AWS/Bedrock processing, logging, retention, and model-training settings contractually and technically.
- Close upstream streams and release browser/server buffers promptly after a session.
- Persist only the approved final text fields, with finite retention and consent.
- Provide a visible recording/processing indicator and an immediate stop control.

## School use: COPPA, FERPA, and PPRA

If schools deploy or purchase History2Life, obtain education-privacy counsel. A school may sometimes act as the parent's agent for COPPA consent only in the educational context and only when the operator uses information for the school-authorized educational purpose, not for an unrelated commercial purpose. Consult the [COPPA FAQ section on schools](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions#N.%20COPPA%20AND%20SCHOOLS).

FERPA applies to covered educational agencies and institutions and may govern education records disclosed to a provider. Relevant official sources:

- [U.S. Department of Education FERPA regulations and guidance](https://studentprivacy.ed.gov/ferpa)
- [34 CFR Part 99](https://www.ecfr.gov/current/title-34/subtitle-A/part-99)
- [U.S. Department of Education student privacy resources](https://studentprivacy.ed.gov/)

The Protection of Pupil Rights Amendment may also matter when school-administered activities ask about protected sensitive topics:

- [U.S. Department of Education PPRA page](https://studentprivacy.ed.gov/content/ppra)
- [34 CFR Part 98](https://www.ecfr.gov/current/title-34/subtitle-A/part-98)

Additional school-mode features:

- School/tenant accounts and contracts defining the educational purpose and school/provider responsibilities.
- School-controlled roster provisioning without unnecessary child contact information.
- Tenant isolation and school-scoped administration.
- Configurable retention and deletion at contract termination.
- Records access/amendment/export support for the school.
- Disclosure and subprocessors log.
- Disable commercial profiling, advertising, unrelated model training, and cross-school memory use.
- Teacher controls for approved personas, content, and assignments.
- Review whether open-ended character questions could become a PPRA-covered survey and constrain prompts accordingly.

## State laws

COPPA is a federal baseline, not a complete U.S. launch checklist. State consumer privacy, children's design, biometric/voice, student privacy, breach notification, and AI laws may impose additional or stricter requirements. Requirements also depend on where users and schools are located and can change through legislation and litigation.

Before launch:

- Inventory launch states and school customers.
- Have counsel map applicable state laws and contract clauses.
- Maintain a state-requirements register tied to feature flags, retention, consent, and incident procedures.
- Do not describe COPPA compliance as full U.S. child-privacy compliance.

## History2Life implementation backlog

### P0 — required before under-13 production use

1. Age screen and server-side account classification.
2. Parent account/invitation and verifiable-consent integration.
3. Versioned direct notice, child privacy policy, and consent ledger.
4. Backend consent gate on login/session creation, microphone use, WebSocket audio, transcripts, and memory.
5. Parent review/export/delete/revoke workflow.
6. Finite retention schedule and automated deletion for transcripts, memories, logs, and backups.
7. Authenticated conversation WebSocket and strict user/persona authorization.
8. Written data inventory and § 312.8(b) information-security program with designated coordinator(s), annual risk assessment, risk-based safeguards, regular testing/monitoring, annual evaluation, incident response, and vendor register/assurances.
9. Child-safe memory policy that rejects unnecessary or highly sensitive facts and preserves provenance.
10. No raw-audio persistence and verified buffer/log cleanup.
11. Auditable processor/subprocessor contracts and configuration for Firebase, AWS Bedrock, hosting, logging, and analytics.
12. Legal review of child-directed/mixed-audience positioning, consent method, notices, retention, and launch states.

### P0 for school distribution

1. School-mode contracts and tenant isolation.
2. FERPA/COPPA responsibility mapping and school authorization workflow.
3. School records access, export, correction, deletion, and contract-end purge.
4. PPRA review and controls for sensitive conversational prompts.
5. State student-privacy review for each school/customer jurisdiction.

### P1 — operational maturity

1. Parent self-service dashboard rather than manual-only requests.
2. Automated re-consent on material policy/vendor changes.
3. Consent and deletion service-level monitoring.
4. Periodic access reviews, vendor assessments, and deletion audits.
5. Child-data incident response drills.
6. Privacy-preserving product analytics with child mode disabled by default.

## Release gate

Do not enable under-13 production accounts until the P0 controls are implemented and qualified counsel has approved the audience classification, notices, consent method, vendor disclosures, retention schedule, school model if applicable, and state-law scope. The low-poly avatar can be developed and tested without child data and is not blocked by this gate.
