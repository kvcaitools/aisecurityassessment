const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, LevelFormat,
  VerticalAlign, Header, Footer, PageNumber
} = require("docx");

const PAGE_WIDTH = 12240, PAGE_HEIGHT = 15840, MARGIN = 1080;
const USABLE = PAGE_WIDTH - MARGIN * 2;
const NAVY = "1F3864", LIGHT_BLUE = "DCE6F1", GREY = "F2F2F2", MED_GREY = "7F7F7F";
const GREEN = "E2EFDA", YELLOW = "FFF2CC", RED = "FCE4EC";

function sectionHeading(number, title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 },
    border: { bottom: { color: NAVY, size: 6, style: BorderStyle.SINGLE, space: 4 } },
    children: [
      new TextRun({ text: `${number}. `, bold: true, color: NAVY, size: 26 }),
      new TextRun({ text: title, bold: true, color: NAVY, size: 26 }),
    ],
  });
}
function subHeading(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 22 })] });
}
function note(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, italics: true, color: MED_GREY, size: 19 })] });
}
function para(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 21 })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 },
    children: [new TextRun({ text, size: 21 })] });
}
function labelCell(text, w) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: LIGHT_BLUE },
    verticalAlign: VerticalAlign.CENTER, margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: NAVY })] })] });
}
function valueCell(text, w) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 20 })] })] });
}
function fillInTable(rows) {
  const labelW = Math.round(USABLE * 0.32), valueW = USABLE - labelW;
  return new Table({ width: { size: USABLE, type: WidthType.DXA }, columnWidths: [labelW, valueW],
    rows: rows.map(([l, v]) => new TableRow({ children: [labelCell(l, labelW), valueCell(v, valueW)] })) });
}
function headerCell(text, w, align) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: NAVY },
    verticalAlign: VerticalAlign.CENTER, margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: align || AlignmentType.LEFT, children: [new TextRun({ text, bold: true, size: 19, color: "FFFFFF" })] })] });
}
function bodyCell(text, w, opts = {}) {
  return new TableCell({ width: { size: w, type: WidthType.DXA }, shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    verticalAlign: VerticalAlign.CENTER, margins: { top: 70, bottom: 70, left: 120, right: 120 },
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text, size: 19, bold: !!opts.bold, italics: !!opts.italic })] })] });
}
// Question | Response | Evidence
function assessedTable(items) {
  const qW = Math.round(USABLE * 0.44), rW = Math.round(USABLE * 0.13), nW = USABLE - qW - rW;
  const headerRow = new TableRow({ tableHeader: true, children: [
    headerCell("Question", qW), headerCell("Response", rW, AlignmentType.CENTER), headerCell("Evidence / Notes", nW),
  ] });
  const rows = items.map(([q, resp, ev], i) => {
    const fill = resp === "Yes" ? GREEN : resp === "No" ? RED : resp === "Partial" ? YELLOW : (i % 2 === 0 ? "FFFFFF" : GREY);
    return new TableRow({ children: [
      bodyCell(q, qW, { fill: i % 2 === 0 ? "FFFFFF" : GREY }),
      bodyCell(resp, rW, { align: AlignmentType.CENTER, bold: true, fill }),
      bodyCell(ev, nW, { fill: i % 2 === 0 ? "FFFFFF" : GREY }),
    ] });
  });
  return new Table({ width: { size: USABLE, type: WidthType.DXA }, columnWidths: [qW, rW, nW], rows: [headerRow, ...rows] });
}
function riskScoreTable(rows) {
  const catW = Math.round(USABLE * 0.34), scoreW = Math.round(USABLE * 0.12), weightW = Math.round(USABLE * 0.12),
    weightedW = Math.round(USABLE * 0.14), commentW = USABLE - catW - scoreW - weightW - weightedW;
  const headerRow = new TableRow({ tableHeader: true, children: [
    headerCell("Risk Category", catW), headerCell("Score (1-5)", scoreW, AlignmentType.CENTER),
    headerCell("Weight", weightW, AlignmentType.CENTER), headerCell("Weighted", weightedW, AlignmentType.CENTER),
    headerCell("Comments", commentW),
  ] });
  let totalWeighted = 0;
  const dataRows = rows.map(([cat, score, weight, comment], i) => {
    const weighted = (score * weight).toFixed(2);
    totalWeighted += parseFloat(weighted);
    return new TableRow({ children: [
      bodyCell(cat, catW, { fill: i % 2 === 0 ? "FFFFFF" : GREY }),
      bodyCell(String(score), scoreW, { align: AlignmentType.CENTER, fill: i % 2 === 0 ? "FFFFFF" : GREY }),
      bodyCell(`${Math.round(weight * 100)}%`, weightW, { align: AlignmentType.CENTER, fill: i % 2 === 0 ? "FFFFFF" : GREY }),
      bodyCell(weighted, weightedW, { align: AlignmentType.CENTER, fill: i % 2 === 0 ? "FFFFFF" : GREY }),
      bodyCell(comment, commentW, { fill: i % 2 === 0 ? "FFFFFF" : GREY }),
    ] });
  });
  const totalRow = new TableRow({ children: [
    bodyCell("Overall Weighted Risk Score", catW, { bold: true, fill: LIGHT_BLUE }),
    bodyCell("", scoreW, { fill: LIGHT_BLUE }),
    bodyCell("100%", weightW, { align: AlignmentType.CENTER, bold: true, fill: LIGHT_BLUE }),
    bodyCell(totalWeighted.toFixed(2), weightedW, { align: AlignmentType.CENTER, bold: true, fill: LIGHT_BLUE }),
    bodyCell("Low-Moderate Risk", commentW, { bold: true, fill: LIGHT_BLUE }),
  ] });
  return new Table({ width: { size: USABLE, type: WidthType.DXA }, columnWidths: [catW, scoreW, weightW, weightedW, commentW], rows: [headerRow, ...dataRows, totalRow] });
}

const doc = new Document({
  numbering: { config: [{ reference: "bullets", levels: [
    { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } },
  ] }] },
  sections: [{
    properties: { page: { size: { width: PAGE_WIDTH, height: PAGE_HEIGHT }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    headers: { default: new Header({ children: [new Paragraph({
      border: { bottom: { color: "BFBFBF", size: 4, style: BorderStyle.SINGLE, space: 2 } },
      children: [new TextRun({ text: "AI Tool Risk Assessment — Claude (Anthropic)  |  ", size: 16, color: MED_GREY }),
        new TextRun({ text: "Confidential", size: 16, color: MED_GREY, italics: true })],
    })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Page ", size: 16, color: MED_GREY }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MED_GREY }),
      new TextRun({ text: " of ", size: 16, color: MED_GREY }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: MED_GREY }),
    ] })] }) },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
        children: [new TextRun({ text: "AI TOOL RISK ASSESSMENT", bold: true, size: 40, color: NAVY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 20 },
        children: [new TextRun({ text: "Sample Completed Assessment — Claude (Anthropic)", size: 22, color: MED_GREY })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 },
        children: [new TextRun({ text: "Based on publicly available Anthropic documentation as of August 2026 — verify against current Trust Center contents before relying on this for a real approval decision.", size: 17, color: MED_GREY, italics: true })] }),

      sectionHeading(1, "General Information"),
      fillInTable([
        ["Tool Name", "Claude (Claude.ai, Claude Developer Platform / API, Claude Enterprise, Claude Team)"],
        ["Vendor / Provider", "Anthropic PBC (Anthropic Ireland, Limited for EEA/UK/Switzerland users)"],
        ["Description", "Family of large language model (LLM) assistants (Claude Sonnet 5, Opus 4.8, Haiku 4.5, and Mythos-tier models) accessed via chat UI, API, or first-party apps (Claude Code, Claude for Excel/PowerPoint/Chrome, Claude Cowork)."],
        ["Use Case", "General-purpose generative AI assistant: drafting, coding, analysis, research, and agentic task execution, potentially with access to internal documents and connected systems."],
        ["Date of Assessment", "19 August 2026"],
        ["Assessment Completed By", "[Insert Name / Title]"],
        ["Assessment Status", "Draft — sample/demo output for template validation"],
      ]),

      sectionHeading(2, "Use Case Description"),
      fillInTable([
        ["Purpose", "Augment employee productivity (writing, coding, research, document creation) and/or power customer-facing or internal automations via the API."],
        ["Business Impact", "Potentially broad — depends on deployment scope. Could touch employee workflows org-wide (Enterprise/Team) or be embedded in a product (API)."],
        ["Data Types Involved", "Depends on use: may include internal business documents, source code, and — if integrated with connectors/third-party services — customer PII. Org should classify data types before enabling any integration."],
        ["End Users / Stakeholders", "Employees (Enterprise/Team seats) and/or end customers of a product built on the API."],
        ["Risk Tier", "Medium (default) — re-score High if regulated data (health, financial, PII at scale) or customer-facing automated decisions are involved."],
      ]),

      sectionHeading(3, "Architecture Review"),
      note("Anthropic publishes an infrastructure diagram and subprocessor list in its Trust Center; summarized below."),
      fillInTable([
        ["Deployment Model", "Cloud (SaaS) via Claude.ai / API; also available through partner-hosted environments (Amazon Bedrock, Google Vertex AI, Microsoft Foundry) and Claude for Government (FedRAMP High)."],
        ["Cloud / Hosting Provider", "AWS, Google Cloud Platform, and Microsoft Azure are listed subprocessors (cloud infrastructure, worldwide); Cloudflare is used for traffic routing/CDN."],
        ["Underlying Model / Foundation Provider", "Proprietary Anthropic models (Claude Sonnet/Opus/Haiku/Mythos families)."],
        ["Integration Points", "REST API (api.anthropic.com), Model Context Protocol (MCP) connectors/apps, browser extension (Claude in Chrome), Office integrations (Excel/PowerPoint), Slack (Claude Tag)."],
        ["Data Flow Summary", "Consumer inputs/outputs may be used for model training unless the user opts out (Claude.ai); business/API data under commercial terms is governed by separate customer agreements and, per Anthropic's stated commercial terms, is not used to train models by default."],
      ]),
      subHeading("Threat Model"),
      assessedTable([
        ["Key threat actors and attack surfaces have been identified (e.g., prompt injection, data exfiltration, model inversion, supply chain).", "Partial", "Anthropic publishes a security advisory list (e.g., CVE-2026-22561, DLL search-order hijacking in the Windows installer) and runs annual third-party penetration testing, but org-specific threat modeling for your integration is still your responsibility."],
        ["Trust boundaries between the tool, integrated systems, and third parties are mapped.", "Partial", "Subprocessor list and infrastructure diagram are published; org must map its own connectors/integrations (MCP apps, Chrome, Excel/PowerPoint) as those cross additional trust boundaries."],
        ["Abuse cases (jailbreaking, adversarial inputs, data poisoning) have been considered.", "Yes", "Anthropic's Responsible Scaling Policy and model documentation forms (per-model) describe red-teaming and safety evaluations."],
        ["Failure modes and their business impact have been assessed.", "Partial", "Depends on your deployment; Anthropic documents model limitations per model card but org-specific business-impact analysis is required."],
      ]),

      sectionHeading(4, "Security Controls"),
      subHeading("Data Security Controls"),
      assessedTable([
        ["Data is encrypted in transit (TLS 1.2+) and at rest (AES-256 or equivalent).", "Yes", "Standard practice for Anthropic's cloud-hosted offerings; confirm current specifics via the CMEK cryptographic design whitepaper on the Trust Center."],
        ["Key management follows industry standard practices (e.g., KMS/HSM).", "Yes", "Customer-managed encryption key (CMEK) whitepaper published on Trust Center."],
        ["Vendor confirms whether customer data is used to train or fine-tune shared models.", "Partial", "Claude.ai consumer conversations may be used for training unless the user opts out; commercial/API and Enterprise/Team data governed by separate customer agreements — Anthropic's Trust Center FAQ directly addresses 'Will you use our Claude for Work conversations to train your generative models?' — verify the current answer before approval."],
        ["Data retention and secure deletion policies are documented and acceptable.", "Yes", "Privacy Policy states deleted conversations are removed from history immediately and purged from backend within 30 days; retention periods for business tiers set by contract."],
      ]),
      subHeading("Tenant Isolation"),
      assessedTable([
        ["Multi-tenant architecture enforces logical/physical separation between customers.", "Yes", "Standard for Claude Enterprise/Team/API; request architecture diagram from Trust Center for validation."],
        ["Tenant-specific data cannot leak into another tenant's context or model outputs.", "Yes", "No evidence of cross-tenant data leakage in public record as of assessment date; re-verify via security advisories page periodically."],
        ["Dedicated / single-tenant deployment option is available if required.", "Yes", "Available via partner-hosted routes (AWS GovCloud, Google Assured Workloads) for higher-assurance requirements."],
      ]),
      subHeading("Access Control Model"),
      assessedTable([
        ["Role-based or attribute-based access control (RBAC/ABAC) is enforced.", "Yes", "Standard for Claude Enterprise/Team admin console."],
        ["Multi-factor authentication (MFA) and SSO/SAML integration are supported.", "Yes", "Supported on Enterprise/Team tiers; confirm current SSO options with account team."],
        ["Principle of least privilege is applied to internal vendor staff access.", "Partial", "Not independently verifiable from public documents; request internal access control attestation (e.g., via SOC 2 report) during procurement."],
        ["Access logs and audit trails are available for review.", "Yes", "Enterprise tier includes admin/audit logging; confirm log retention and export options."],
      ]),
      subHeading("Security & Third-Party Risk"),
      assessedTable([
        ["Vendor holds relevant certifications (e.g., SOC 2 Type II, ISO 27001, ISO 27701/42001).", "Yes", "SOC 2 Type II, ISO 27001:2022, ISO/IEC 42001:2023 (AI management system), CSA STAR, HIPAA (Type 1) reports listed for Claude API / Enterprise / Team on the Trust Center as of Aug 2026."],
        ["Vendor has a documented vulnerability disclosure and patch management process.", "Yes", "Public security advisories page and bug-bounty/vulnerability disclosure process referenced in Trust Center FAQ ('I found a security bug, how can I let you know?')."],
        ["Recent third-party penetration test results are available for review.", "Yes", "'2025 Annual Penetration Testing Reports' listed under Trust Center resources — request access."],
        ["Subprocessors / fourth parties are disclosed and contractually bound to equivalent security terms.", "Yes", "Subprocessor list published (AWS, GCP, Azure, Cloudflare, TurboPuffer for web search, and others) with product scope and region."],
        ["Vendor has a documented business continuity / disaster recovery plan.", "Partial", "Not separately published; request BC/DR attestation as part of due diligence (often included in SOC 2 report scope)."],
      ]),

      sectionHeading(5, "Governance & Compliance"),
      assessedTable([
        ["Solution's risk classification under applicable AI regulation (e.g., EU AI Act) is identified.", "Partial", "Anthropic maintains a Frontier AI/Responsible Scaling framework; org must still classify its own use case risk tier under EU AI Act or local AI regulation — general-purpose AI model obligations may apply."],
        ["Vendor complies with relevant data protection laws (e.g., GDPR, CCPA, HIPAA).", "Yes", "GDPR-aligned Privacy Policy (SCCs / adequacy decisions for transfers); Data Processing Addendum published; HIPAA Type 1 reports available and BAA offered on eligible tiers."],
        ["Contract includes liability allocation for AI errors, bias, or harmful outputs.", "Partial", "Governed by commercial/customer agreement terms, not public Privacy Policy — review your specific contract/Order Form."],
        ["Intellectual property ownership of inputs/outputs is clearly defined.", "Partial", "Addressed in commercial Terms of Service, not the consumer Privacy Policy reviewed here — confirm current IP terms in your agreement."],
        ["Vendor provides audit rights or compliance evidence on request.", "Yes", "Trust Center supports document requests and a query-enabled AI feature after access approval; SIG Lite, CAIQ, VSA Core, and HECVAT questionnaires pre-published (June 2026)."],
        ["Internal AI governance / model risk committee has reviewed and signed off.", "No", "Organization action item — not a vendor-side control."],
      ]),

      sectionHeading(6, "Monitoring & Incident Response"),
      assessedTable([
        ["Model performance is monitored for drift, degradation, or anomalous behavior.", "Partial", "Anthropic publishes model documentation forms and training data summaries per model version, but customer-facing drift monitoring for your specific use case is your responsibility."],
        ["Security monitoring and logging cover access, usage, and API activity.", "Yes", "API usage logs and Enterprise admin logs available; retention/export depends on tier."],
        ["Vendor has a documented incident response plan with defined notification timelines.", "Partial", "Security advisories are published publicly (e.g., CVE-2026-22561) but customer-specific breach notification SLAs should be confirmed in contract."],
        ["Breach / incident notification terms are defined in the contract (e.g., within 72 hours).", "Partial", "Contract-dependent — verify Data Processing Addendum and Order Form terms."],
        ["SLA defines uptime, support response times, and escalation paths.", "Partial", "Available on Enterprise/Team/API commercial tiers — confirm current SLA terms with account team; status page available for uptime transparency."],
      ]),

      sectionHeading(7, "Ethical & Responsible Use"),
      assessedTable([
        ["Vendor has conducted bias/fairness testing across relevant demographic groups.", "Partial", "Anthropic publishes model cards and safety evaluations (including for bias) per major model release, but org should request specifics for the model version in use."],
        ["Outputs can be explained or traced back to contributing factors (explainability).", "Partial", "LLMs are inherently limited in explainability; Anthropic publishes interpretability research but outputs are not fully traceable/explainable in the way a rules-based system is."],
        ["Human review/override is available for high-stakes or consequential decisions.", "Yes", "Anthropic's Usage Policy prohibits or restricts fully-automated high-stakes decisions without human oversight in several domains (e.g., legal, medical, financial); org must still design its own human-in-the-loop control for its use case."],
        ["End users are informed when they are interacting with or affected by AI-generated content.", "Partial", "Org-level responsibility for end-user disclosure in the deployed product; Anthropic's own consumer products identify themselves as AI."],
        ["Vendor publishes a responsible-AI or ethical-use policy.", "Yes", "Usage Policy, Responsible Scaling Policy, and published Model/Training Data documentation."],
        ["Guardrails exist against generating harmful, discriminatory, or unlawful content.", "Yes", "Documented safety training, classifiers, and enforcement of Usage Policy; not infallible — periodic misuse/jailbreak advisories are published."],
      ]),

      sectionHeading(8, "Risk Scoring Summary"),
      note("Illustrative scoring based on public documentation only — recalibrate weights/scores to your organization's risk appetite and your specific deployment (Claude.ai vs. Enterprise vs. API vs. partner-hosted)."),
      riskScoreTable([
        ["Architecture & Threat Exposure", 2, 0.15, "Well-documented infra; org-specific integration threat modeling still required."],
        ["Data Security & Tenant Isolation", 2, 0.20, "Strong published controls (encryption, CMEK, SOC 2/ISO); verify data-use terms for your specific tier."],
        ["Access Control & Third-Party Risk", 2, 0.15, "RBAC/SSO available; subprocessors disclosed; internal staff access not independently verifiable publicly."],
        ["Governance & Regulatory Compliance", 2, 0.20, "Broad certification coverage (SOC2, ISO 27001/42001, HIPAA); contract-specific liability/IP terms need legal review."],
        ["Monitoring & Incident Response", 3, 0.15, "Public advisories exist; customer-specific SLA/breach-notification terms must be confirmed contractually."],
        ["Ethical & Responsible Use", 2, 0.15, "Usage Policy and safety documentation are mature; explainability remains an inherent LLM limitation to manage on your side."],
      ]),
      new Paragraph({ spacing: { before: 200 }, children: [] }),
      subHeading("Risk Rating Scale"),
      bullet("1–1.5: Low Risk — proceed with standard contract terms."),
      bullet("1.6–2.5: Low-Moderate Risk — proceed with minor conditions/monitoring."),
      bullet("2.6–3.5: Moderate Risk — mitigations required before approval."),
      bullet("3.6–4.5: High Risk — senior/governance committee approval required."),
      bullet("4.6–5.0: Critical Risk — recommend rejection or major redesign."),

      sectionHeading(9, "Findings & Recommendations"),
      subHeading("Key Strengths"),
      bullet("Extensive third-party attestations published and kept current: SOC 2 Type II, ISO 27001:2022, ISO/IEC 42001:2023 (AI management system), CSA STAR, HIPAA Type 1 reports, NIST 800-171r3 attestation, and FedRAMP High for government offerings."),
      bullet("Subprocessor list, infrastructure diagram, penetration test summaries, and security advisories are proactively published in a self-service Trust Center."),
      bullet("Clear opt-out for consumer model training use; separate, more restrictive terms for commercial/API and Enterprise data by default."),
      bullet("Mature responsible-AI documentation: Usage Policy, Responsible Scaling Policy, and per-model documentation/training-data summaries."),
      subHeading("Key Risks / Gaps Identified"),
      bullet("Public documentation cannot confirm org-specific contract terms (liability allocation, IP ownership, breach notification SLA, BC/DR) — these require direct legal/procurement review of the Order Form and DPA."),
      bullet("Explainability is an inherent limitation of large language models generally, not something the vendor can fully close — human review controls must be built by the deploying organization for high-stakes use."),
      bullet("If using MCP connectors, browser (Claude in Chrome), or Office integrations, each connected third-party service introduces its own trust boundary and data-handling policy that this assessment does not cover — assess each connector separately."),
      bullet("EU AI Act / local AI-regulation risk classification for your specific use case is an organizational responsibility, not something Anthropic's certifications resolve on your behalf."),
      subHeading("Required Mitigations / Conditions of Approval"),
      bullet("Legal/procurement to confirm current Data Processing Addendum, liability, IP, and breach-notification terms in the actual contract before go-live."),
      bullet("Data classification exercise to confirm what data types will be shared with Claude and restrict connectors/integrations accordingly."),
      bullet("Define human-in-the-loop review for any consequential or high-stakes decision the tool contributes to."),
      bullet("Re-run this assessment (or an abbreviated refresh) at each contract renewal or major model version change, and whenever new connectors/integrations are enabled."),

      sectionHeading(10, "Approval & Sign-off"),
      fillInTable([
        ["Final Recommendation", "Approve with Conditions (pending legal/contract review and data classification exercise)"],
        ["Reviewed By (Security)", "[Name, Date]"],
        ["Reviewed By (Privacy/Legal)", "[Name, Date]"],
        ["Reviewed By (Business Owner)", "[Name, Date]"],
        ["Final Approver", "[Name, Title, Date]"],
        ["Next Review Date", "[Contract renewal date, or on major model/tier change]"],
      ]),

      new Paragraph({ spacing: { before: 300 }, children: [
        new TextRun({ text: "Sources: Anthropic Trust Center (trust.anthropic.com) and Anthropic Privacy Policy (anthropic.com/legal/privacy), reviewed 19 August 2026. This is a sample output for template demonstration — always re-verify current certifications, subprocessors, and contract terms directly with Anthropic before relying on this for a real approval decision.", italics: true, size: 16, color: MED_GREY }),
      ] }),
    ],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  require("fs").writeFileSync("/home/claude/vendor_ai/Sample_Assessment_Report_Claude.docx", buf);
  console.log("done");
});
