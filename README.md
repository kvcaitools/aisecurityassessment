# AI Vendor Risk Assessment Skill

A Claude skill that produces a structured, evidence-backed risk assessment report for any AI tool or vendor before you adopt, renew, or expand its use — so due diligence doesn't get skipped just because sign-up took five minutes.

## What it does

Given the name of an AI tool or vendor, this skill researches it and generates a filled-in Word (`.docx`) report covering:

- **General Information** — who the vendor is, what they offer
- **Use Case** — fit for the intended deployment (consumer, enterprise, or API/embedded)
- **Architecture Review** — deployment model, subprocessors, underlying foundation model(s)
- **Security Controls** — encryption, access control, tenant isolation
- **Governance & Compliance** — SOC 2, ISO 27001/42001, HIPAA, GDPR, and other relevant standards
- **Monitoring & Incident Response** — breach history, disclosed vulnerabilities, response process
- **Ethical & Responsible Use** — how the vendor handles model behavior and misuse
- **Weighted Risk Scoring Summary** — a single defensible score (Low → Critical) across six weighted categories
- **Findings & Recommendations** — concrete strengths, gaps, and required mitigations

Every checklist answer is scored **Yes / No / Partial / Unknown** with a cited note — nothing is left blank, and anything not publicly verifiable is flagged as such rather than guessed.

## How it works

1. **Scope check** — confirms which deployment tier is being assessed (consumer, enterprise, or API), since this changes the data-handling and contract answers.
2. **Research** — pulls from the vendor's public trust/security center, privacy policy, subprocessor list, published certifications, recent news, and known incident history.
3. **Scoring** — rates each checklist item, then rolls categories up into a weighted risk score.
4. **Report generation** — fills in the bundled Word template and outputs a ready-to-share `.docx`.

If the user just wants the blank template with no vendor named, the skill returns that directly instead of running research.

## Requirements

- Works within [Claude](https://claude.ai) as a skill (place the skill folder where your Claude environment loads skills from).
- Uses web search/browsing tools when available for live research; without them, it falls back to model knowledge and clearly flags the report as needing verification.
- Depends on the `docx` skill conventions for report formatting (page size, table widths, shading).

## Usage

Once installed, just ask Claude something like:

> "Do an AI vendor risk assessment on [tool name]"
> "Is [tool] safe to use for our enterprise team?"
> "Give me a blank AI vendor risk assessment template"

Claude will ask a quick clarifying question if the deployment tier isn't clear, then research and produce the report.

## Output

A `.docx` risk assessment report, saved and delivered directly in the conversation. Reports are dated and include a sources note — always verify current details against the vendor's live trust center before a final approval decision.

## Disclaimer

This tool assembles publicly available information into a structured format to support (not replace) your organization's own procurement, legal, and security review process. It does not constitute legal, compliance, or security certification advice.

## License

Add your preferred license here (e.g. MIT).
