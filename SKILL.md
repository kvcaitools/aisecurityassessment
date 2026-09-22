---
name: ai-vendor-risk-assessment
description: "Use this skill whenever the user wants to assess, review, vet, or produce a risk report for an AI tool, AI vendor, or AI-powered product before adoption or renewal — triggers include 'AI vendor assessment', 'AI risk assessment', 'vet this AI tool', 'AI vendor review', 'is [tool] safe to use', or requests for an 'AI vendor questionnaire/scorecard/template'. Also use it when the user names a specific AI product/company and asks for due diligence, security review, or a go/no-go recommendation on it. Produces a filled-in Word (.docx) report covering General Information, Use Case, Architecture Review, Security Controls, Governance & Compliance, Monitoring & Incident Response, Ethical & Responsible Use, a weighted Risk Scoring Summary, and Findings & Recommendations — researched from public vendor documentation, trust/security centers, news coverage, and known incidents. Always use this skill instead of building an assessment from scratch when one of these triggers is present."
---

# AI Vendor / Tool Risk Assessment

Produces a structured, evidence-backed risk assessment report (.docx) for any named AI tool or vendor, using the bundled template and a repeatable research workflow. Also usable to hand the user a **blank template** if they just want the format without a filled report.

## When to use this

- User names an AI tool/vendor and wants it assessed, reviewed, vetted, or scored before purchase/renewal/deployment.
- User asks for "an AI vendor assessment template" (give the blank template — see Step 0).
- User asks to re-run or refresh a prior assessment (e.g., new contract term, new model version, new connector enabled).

## Step 0 — Blank template only

If the user just wants the template/format (no specific tool to assess), copy `assets/AI_Tool_Risk_Assessment_Template.docx` to `/mnt/user-data/outputs/`, present it, and stop. Don't run research for a blank-template request.

## Step 1 — Clarify scope (skip if already answered)

If not already clear from the conversation, ask (via `ask_user_input_v0`, one question, 2-4 options) what deployment/tier is being assessed — e.g., "consumer/browser use", "enterprise/team seats", "API/developer platform embedded in our product". This materially changes data-handling and contract answers. If the user has already given enough detail, don't ask — proceed with a stated assumption.

## Step 2 — Research (do this before writing anything)

Gather information from these categories. Use web search / browsing tools if available; if none are available, use your own knowledge and clearly flag it as such with a recommendation to verify. Do not skip categories — an assessment built only from training-data memory should say so explicitly in the report's source note.

1. **Vendor's own public documentation** — trust center / security center (look for `trust.<vendor>.com` or "security" / "trust" pages), privacy policy, terms of service, subprocessor list, published certifications (SOC 2, ISO 27001, ISO 42001, HIPAA, FedRAMP, CSA STAR), penetration test summaries, security advisories, responsible-AI / usage policy, data processing addendum.
2. **Architecture & integration facts** — deployment model(s) offered (SaaS/on-prem/hybrid), cloud providers/subprocessors, underlying foundation model(s), available integrations/connectors/APIs.
3. **Reputation & news** — recent news coverage, funding/ownership changes, litigation, regulatory actions, customer complaints, analyst commentary.
4. **Threat intelligence / incident history** — known CVEs or security advisories, publicly reported breaches or incidents, jailbreak/misuse reports, any disclosed vulnerabilities and how they were handled.
5. **Regulatory posture** — relevant law/regulation exposure for the *use case* (GDPR, HIPAA, CCPA, EU AI Act risk tier, sector-specific rules) — this is partly the deploying org's responsibility, not just the vendor's, and the report should say so where applicable.

Keep a running list of source URLs/names — the report ends with a Sources note (see template).

## Step 3 — Score each response

For every checklist-style question in the template sections (Architecture Threat Model, Security Controls subsections, Governance & Compliance, Monitoring & Incident Response, Ethical & Responsible Use), assign one of: **Yes**, **No**, **Partial**, or **Unknown** — plus a one-to-two sentence evidence/note citing what you found (or noting the gap). Don't leave rows blank in a filled report — "Unknown, not publicly disclosed — request during procurement" is a valid, honest answer.

## Step 4 — Risk Scoring Summary

Score each of the 6 risk categories 1 (low risk) – 5 (high risk) based on the density of "No"/"Unknown" answers versus "Yes" in that category. Default weights (adjust if the user gives different priorities):
- Architecture & Threat Exposure: 15%
- Data Security & Tenant Isolation: 20%
- Access Control & Third-Party Risk: 15%
- Governance & Regulatory Compliance: 20%
- Monitoring & Incident Response: 15%
- Ethical & Responsible Use: 15%

Compute the weighted score and map it to the rating scale already in the template (1–1.5 Low ... 4.6–5.0 Critical).

## Step 5 — Findings & Recommendations

Write these from the actual research, not generic boilerplate:
- **Key Strengths** — genuine, specific strengths found (named certifications, specific published controls).
- **Key Risks / Gaps** — genuine gaps, including anything not publicly verifiable and anything that is the deploying org's own responsibility (e.g., AI Act classification, human-in-the-loop design, per-connector risk).
- **Required Mitigations / Conditions of Approval** — concrete next actions (e.g., "confirm current DPA breach-notification terms with legal").

## Step 6 — Generate the report

Adapt `scripts/generate_report_template.js` (a working docx-js example already scored/colored — Yes=green, No=red, Partial=yellow) for the new tool: replace the tool-specific text, table rows, and scoring while keeping the structure, styling constants, and helper functions identical. Follow the `docx` skill's gotchas (`/mnt/skills/public/docx/SKILL.md`) for page size, table widths, shading, etc. Render to PDF and visually check at least the first page and the risk-scoring page before delivering, exactly as in that skill's "Verify the output" step.

Save the final .docx to `/mnt/user-data/outputs/`, and call `present_files`. In your chat reply, do not restate the whole report — summarize the overall risk rating and top 2-3 findings in a few lines, and note the report is based on public information as of today's date and should be verified against the vendor's current trust center before a real approval decision.

## Notes

- If the user wants to compare multiple tools, run Steps 2-5 for each and add a short comparison summary before generating one report per tool (or one combined report with a section per tool, if they'd prefer that — ask if ambiguous).
- If asked to re-assess a previously reviewed tool, focus research on what's changed since the last assessment date rather than repeating everything from scratch.
