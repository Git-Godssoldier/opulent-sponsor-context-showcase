---
name: opulent-sponsor-context-showcase
description: Sponsor discovery and outreach for festival campaigns. Use when mapping sponsors across highly similar events, identifying sponsor people from public titles and exact profiles, following departed people to current employers, qualifying target lists, or building a sourced sponsor dossier and draft.
license: MIT
---

# Opulent sponsor context

Run this skill from the repository root. A campaign is one property under `campaigns/<key>/`. Nocturnal Valley is the sample campaign. When several campaigns exist, pass `--campaign <key>`.

## 1. Discover sponsors and people

```bash
npm run discover -- --mass [--similarity high|exact] [--include-national]
```

The route must complete these checks in order:

1. Extract every cited sponsor activation from all selected comparable events.
2. Keep activations whose category matches the campaign profile and whose month or date falls inside the rolling past year.
3. Search the public web with the sponsor company and cited employee title. Treat exact LinkedIn profile URLs as candidates.
4. Retrieve up to three ranked profiles. Resolve a person only when the retrieved name, employer, and title function match.
5. When the name matches but the person left, resolve the current employer by name and add that institution instead. Keep the source sponsorship as route provenance. Stop after one employer hop.

The destination needs a canonical bare domain before it enters `artifacts/discovered.csv`. The source activation never becomes activation evidence for the destination employer.

Done means `artifacts/discovery/mass-results.json` records every checked state and `artifacts/discovered.csv` contains only rows that can enter the ordinary domain, compliance, and exclusion gates. A missing Context.dev key is done only as `blocked_missing_credentials` with a written plan.

Use `--event`, `--check`, and `--emit` for one difficult sponsor page.

## 2. Research one accepted target

```bash
npm run research -- --target <id> [--linkedin-url <exact-profile-url>]
```

Research runs the target gates, company calls, brand extraction, and first dossier assembly. A decision-maker call receives an exact profile URL only. General search results remain candidates until retrieval succeeds.

Done means the cohort counts are printed, every call has a terminal state, brand tokens exist, and the first dossier is assembled.

## 3. Write the judgement

Read `artifacts/signal.json` and `artifacts/dossier.json`.

- Fill the signal from one dated activation page with a quote and source URL.
- Write `fit.band`, `rationale`, and `counter_evidence` from retrieved evidence.
- Write one dated `outreach.reason_to_engage` with its source URL.
- Write the personal note in Trifecta's register.
- Name a rate-card tier verbatim or leave it empty. Treat availability as unknown.
- Write the subject and preview text last.

Done means the signal is eligible and the judgement fields are complete at the strength of the evidence.

## 4. Deliver the review artifact

```bash
npm run deliver
# add --dashboard when the review page is needed
```

Delivery assembles the dossier, renders the draft, lints the prose, attaches the draft to the packet, and validates the full contract.

Done means lint exits 0, full validation exits 0, and the rendered draft appears in `packet.messages[]`. The send state remains `draft_only_not_sent`.

## Invariants

- Write run output under `artifacts/`. Keep `templates/`, `knowledge/`, and `campaigns/` unchanged during a run.
- Record an HTTP response and receipt before setting `executed`.
- Use `unknown` for absence. Use `false` only after dated evidence supports it.
- A blocked target has no draft.
- A greeting name comes from a retrieved and matched profile.
- Attendance stays out of every draft because the supplied figures conflict.
- Property claims come from the dossier, the campaign facts, or Trifecta's source material.
- The rendered template is the deliverable. Fix a failed render instead of replacing it with handwritten output.
- Everything remains a draft. Sender authority is unconfirmed.

## References

Open only the branch needed for the current step. Paths are relative to this skill file.

| Trigger | Reference |
| --- | --- |
| Write outreach prose | `../../../knowledge/agency/trifecta-profile.md` and `../../../references/writing-quality.md` |
| Cite a property fact or rate-card tier | `../../../campaigns/<key>/deck-facts.md` |
| Change a provider call | `../../../references/contextdev-capabilities.md` |
| Use Monid for discovery or gap filling | `../../../references/monid-capabilities.md` |
| Change field shape or validation | `../../../references/sponsor-dossier-contract.md` |
| Judge fit or build the pitch | `../../../references/sponsor-fit-and-outreach.md` |
| Check a claim boundary | `../../../references/evidence-policy.md` |
| Change the dashboard | `../../../references/dashboard-brief.md` |
