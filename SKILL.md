---
name: opulent-sponsor-context-showcase
description: Run one sponsor target end to end — validate the entity, exhaust the Context.dev surface on the company, read one dated activation, build a sourced fit dossier, render a React Email pitch, and show it in a Dither dashboard. Use for festival or event sponsor sourcing from a client target list. Drafts, never sends.
license: MIT
---

# Opulent Sponsor Context Showcase

Seven commands, in order.

```bash
npm run targets                                          # 1
npm run calls -- --domain <bare-domain> --company "<name>" # 2
npm run signal -- --url <activation-page-url>            # 3
npm run assemble                                         # 4
npm run email                                            # 5
npm run validate                                         # 6
npm run dashboard                                        # 7
```

## Invariants

- `templates/` and `fixtures/` are read-only. Output goes to `artifacts/`.
- `executed` requires an HTTP response **and** a stored receipt. Otherwise `blocked_missing_credentials`, `blocked_endpoint_access`, or `failed`.
- Absence is `unknown`. Only dated evidence sets `false`.
- Read `artifacts/calls-summary.json`, not the receipts.
- Pages are read. No clicks that change state.
- **No attendance figure appears in any draft.** The client's two figures do not reconcile.
- **A compliance-blocked target never reaches a draft.**
- The pitch is a draft. Sender authority is unconfirmed.

## 1 · Targets

Loads the client's 25-company list and applies two gates.

Rejects rows without an exact bare domain. `Anheuser-Busch or its St. Louis distributor` is two companies with two sponsorship desks; picking one is the client's step.

Rejection is the expected case here, not a failure — the command exits 0 and reports. Read the counts.

Every target comes back `unverified_against_rule` because the three sponsors already in motion were never named. That flag stays on the record until they are.

Pick one accepted, `draft_gate: open` row. Note its `company` and bare `domain`.

*Done: subject chosen, counts read, exclusion state understood.*

## 2 · Calls

Runs the full plan, writes `artifacts/calls-summary.json` and one receipt per call.

Parameter shapes differ per endpoint and are already correct in `scripts/run_calls.mjs`. Do not hand-build requests.

- `/web/naics`, `/web/sic` → `input`
- `/web/styleguide`, `/web/fonts`, `/web/screenshot` → `domain` XOR `directUrl`
- `/utility/prefetch` → paid plan only, 403 otherwise, excluded from the plan

Pass `--linkedin-url` only when the client supplied an exact profile URL. Without it the decision-maker call is omitted rather than guessed, and the pitch will stop at step 5 for want of a name.

`--dry-run` prints the plan. No API key → `blocked_missing_credentials`; continue to step 3 and report it. Non-200 is a finding; record and move on.

*Done: summary written, every call terminal.*

## 3 · Signal

Find one page showing this company sponsoring, activating at, or sampling into an event. A newsroom post, a festival's sponsor page, a case study.

Capture type, summary, a verbatim quote, the date, the event named, the activation form, and any competitor conflict visible on the page. Set `reason_eligible` only when the signal is dated **and** quoted.

Undated is not a signal. A sponsorship with no date cannot tell you whether the budget is live now or was live in 2019, and that difference is the entire reason to open on it.

*Done: `artifacts/signal.json` written and `--check` passes.*

## 4 · Assemble

Builds `artifacts/dossier.json` and `artifacts/packet.json`.

Every field: `value`, `state`, `confidence`, `source`, `source_url`, `observed_at`. All ten required fields appear regardless of outcome — category_fit, activation_history, audience_overlap, regional_presence, budget_signal, decision_maker, decision_maker_title, contact_route, compliance_flags, changes_since_last.

No verification provider is wired, so `contact_route` is `unknown` with that reason.

Then write the judgement the script deliberately leaves empty:

- `fit.band` and `fit.rationale`, carrying the argument against as well as for.
- `outreach.reason_to_engage` — one dated reason, at the evidence's strength. Rank: dated activation at a comparable event → dated activation anywhere → regional expansion into the market → category fit alone.
- `outreach.subject` and `preview_text`, written last, together.

*Done: ten fields present, every `Verified` field has a source URL, fit band written.*

## 5 · Email

Renders `templates/sponsor-pitch.tsx` (React Email, Dither theme) to `artifacts/pitch.html` and `.txt`.

Load `references/writing-quality.md` and the house-voice section of `references/sponsor-fit-and-outreach.md` first.

Two gates refuse before rendering: a compliance-blocked target, and a reason with no dated activation behind it. Both exit 4.

Props come from the dossier and the festival packet. A prop without evidence is omitted; its section does not render. Body order: their activation → the festival → who is on site → one action. There is no attendance prop and no package line until the client supplies inventory.

*Done: both files render, every claim maps to a dossier field, `review_state: hold`.*

## 6 · Validate

Exits non-zero on: missing required field, `Verified` without a source URL, a negative without dated evidence, `executed` without a receipt, a draft on a compliance-blocked target, a package named while inventory is unsupplied, a disputed attendance figure inside a message, or a secret in the packet.

*Done: exit 0.*

## 7 · Dashboard

Builds against `artifacts/packet.json` and serves it. Confirm the sponsor card, fit band, rejected rows, open gates, and operation ledger render. Capture the view.

Decision layer first, audit layer collapsed. `proposed`, `blocked`, and `failed` are never styled as verified. The open gates are shown, not hidden — they are the honest half of the demo.

*Done: build clean, view captured.*

## Report

Capabilities run, capabilities skipped with reasons, credits spent, unknowns, and the open commercial gates.

## References

Open on trigger.

| Trigger | File |
| --- | --- |
| Writing prose | `references/writing-quality.md` |
| Building the pitch | `references/sponsor-fit-and-outreach.md` |
| Field shape unclear | `references/sponsor-dossier-contract.md` |
| Adding a provider call | `references/contextdev-capabilities.md` |
| Changing the dashboard | `references/dashboard-brief.md` |
| Claim boundary unclear | `references/evidence-policy.md` |

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Step 5 exits 4 on a good target | No dated activation read | Run step 3 against a real page, or drop the target |
| Step 5 exits 2 on `recipientFirstName` | No decision maker URL supplied | Ask the client for the exact profile URL |
| Every target rejected at step 1 | Domain column empty | The client supplies domains; the skill never resolves them |
| Validator flags a package line | Inventory still unsupplied | Remove the claim, or get the inventory |
| Fit band looks arbitrary | Rationale written without counter-evidence | Rewrite carrying the argument against |
