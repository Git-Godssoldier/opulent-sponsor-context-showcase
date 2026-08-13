---
name: opulent-sponsor-context-showcase
description: Use when sourcing festival or event sponsors, qualifying a client target list, or drafting sponsorship outreach. Fixed Context.dev plan, one dated activation verified, pitch drafted. Never sends.
license: MIT
---

# Opulent Sponsor Context Showcase

The skill is **Trifecta Marketing's** — Bob Dittrich's agency, selling sponsorship packages for ten to fifteen independent festivals. A campaign is one property being sold, held as data under `campaigns/<key>/`; Nocturnal Valley is the sample campaign, not the identity. One campaign present runs by default; several need `--campaign <key>`.

Eight commands, in order.

```bash
npm run targets                                            # 1
npm run discover -- --list                                 # 1b, net-new sponsors
npm run calls -- --domain <bare-domain> --company <name>   # 2
npm run signal -- --url <activation-page-url>              # 3
npm run signal -- --check                                  # 3, after filling the brief
npm run brand                                              # 4
npm run assemble -- --target <id>                          # 5, then write the judgement
npm run email                                              # 6
npm run validate                                           # 7
npm run dashboard && npm run dashboard:serve               # 8
```

## Invariants

- `templates/`, `knowledge/`, and `campaigns/` are read-only during a run. Output goes to `artifacts/`.
- `executed` requires an HTTP response **and** a stored receipt. Otherwise `blocked_missing_credentials`, `blocked_endpoint_access`, or `failed`.
- Absence is `unknown`. Only dated evidence sets `false`.
- Read `artifacts/calls-summary.json`, not the receipts.
- Pages are read. No clicks that change state.
- **No attendance figure appears in any draft.** The client's two figures do not reconcile, and neither deck states one.
- **A blocked target never reaches a draft**, whichever gate blocked it.
- **A greeting name comes only from a retrieved profile.** Without one the draft opens to the company's sponsorship team. A name is never invented, borrowed, or guessed.
- Outreach prose starts from the knowledge base: read `knowledge/agency/trifecta-profile.md` (the sender's register) and the campaign's `deck-facts.md` before writing any reason, subject, preview, or body. A property fact outside the campaign's `deck-facts.md` or the dossier is not written.
- The pitch is a draft. Sender authority is unconfirmed.

## 1 · Targets

Loads the campaign's `targets.csv` — for Nocturnal Valley, the promoter's original 25 plus the researched spirits rows — and applies three gates.

Compliance first: cannabis rows are admitted for research and marked undraftable, per the client's own email. Client-decision holds second: a row the client must resolve before any pitch (NUTRL, held until the Anheuser-Busch entry point is picked) is admitted and marked the same way. Identity last: a row without an exact bare domain is rejected, never resolved by search. Two rows ship as rejected on purpose — Volcán X.A and Cîroc are leads awaiting a client-confirmed domain, and their notes say so.

Every accepted row carries `unverified_against_rule`, because the three sponsors already in motion were never named. That flag stays until the client names them.

The loader folds `artifacts/discovered.csv` in automatically when step 1b has produced one, tagging each row's `origin` — a discovered target rides exactly the same gates.

Pick one accepted, `draft_gate: open` row.

*Done: subject chosen; row, draftable, discovered, and lead counts echoed; the `unverified_against_rule` flag named in the report.*

## 1b · Discover net-new

The client's list came from a category brainstorm, which produces names with no evidence. Discovery inverts that: harvest the sponsor lists of comparable events, where every company arrives having already bought what this festival sells, with a dated, quotable activation attached by construction.

The universe lives in the campaign's `comparable-events.json`, tiered by the deck's own ICP — same format and region first (Electric Forest, North Coast, ARC, Summer Camp), then the same market (Evolution's 2026 pause left every 2025 St. Louis sponsor with a freed budget; Music at the Intersection), then national EDM properties dated inside 2026 (EDC in May, Coachella's spirits row in April, Ultra, Lollapalooza), and above all of them any prior event at Astral Valley Art Park itself.

```bash
npm run discover -- --list                  # the universe, by tier
npm run discover -- --event <key>           # open a harvest brief
npm run discover -- --check <key>           # validate it
npm run discover -- --emit <key>            # append clean rows to artifacts/discovered.csv
```

Read the sponsor page in a browser session and fill the brief: one entry per sponsor, with the page's verbatim wording, the edition date, and the URL. Confirm each company's domain on its own site and record the confirmation URL; an ambiguous name stays domainless with the ambiguity noted, and the identity gate holds it. `--emit` refuses an invalid harvest and skips duplicates against the client list.

Work tiers in order and stop when the draftable pool covers the ask — the client needs roughly seven net-new sponsors, not a census.

*Done: harvests checked and emitted; `npm run targets` re-run showing the discovered count.*

## 2 · Calls

Runs the full plan, writes `artifacts/calls-summary.json` and one receipt per call. Multi-word company names are safe through npm: `--company Sun Cruiser` arrives as one name.

Parameter shapes differ per endpoint and are already correct in `scripts/run_calls.mjs`. Do not hand-build requests.

- `/web/naics`, `/web/sic` → `input`
- `/web/styleguide`, `/web/fonts`, `/web/screenshot` → `domain` XOR `directUrl`
- `/utility/prefetch` → paid plan only, 403 otherwise, excluded from the plan

Pass `--linkedin-url` only when the client supplied an exact profile URL. Without it the decision-maker call is omitted rather than guessed, and the draft will greet the company's team instead of a person.

No API key → every call is recorded `blocked_missing_credentials` and the command **exits 0**; that record is the report, and the run continues. Non-200 on a live call is a finding; record and move on.

The plan costs 90 credits per target, 110 with the decision-maker call. The budget is stated in the summary before the run and reconciled against `credits_spent` after.

*Done: summary written, every call terminal, spend reconciled against the 90/110 plan.*

## 3 · Signal

Find one page showing this company sponsoring, activating at, or sampling into an event. A newsroom post, a festival's sponsor page, a case study. Some sponsor pages render their lists client-side — read them in a browser session, not a raw fetch.

Capture type, summary, a verbatim quote, the date, the event named, the activation form, any scale claim, and any competitor conflict visible on the page. Set `reason_eligible` only when the signal is dated **and** quoted. Then `npm run signal -- --check`.

Undated is not a signal. A sponsorship with no date cannot tell you whether the budget is live now or was live in 2019, and that difference is the entire reason to open on it.

*Done: `artifacts/signal.json` filled and `--check` passes.*

## 4 · Brand

Extracts the campaign's visual identity into `artifacts/brand-tokens.json`: palette and type from the deck in the campaign's `sources/`, ranked from slide-XML evidence counts that travel with the tokens. With a key, `-- --domain <event-domain>` merges the event site's styleguide; the deck stays primary.

The template is the sender's stationery and carries no event brand of its own. A new campaign is a new deck plus a re-run of this step, never a template edit.

*Done: tokens written; accent and display face match the deck by eye.*

## 5 · Assemble, then write the judgement

`npm run assemble -- --target <id>` builds `artifacts/dossier.json` and derives `artifacts/packet.json` from it.

Every field: `value`, `state`, `confidence`, `source`, `source_url`, `observed_at`. All ten required fields appear regardless of outcome. Client-supplied facts assemble as `Estimated`, never `Verified` — `Verified` is reserved for retrieved records. No verification provider is wired, so `contact_route` is `unknown` with that reason.

**Re-running assemble is safe**: the authored `fit` and `outreach` blocks in an existing dossier survive, and the packet is re-derived from the merged result. `--fresh` discards them deliberately.

Then write the judgement into `artifacts/dossier.json` — read `knowledge/agency/trifecta-profile.md` and the campaign's `deck-facts.md` first — and re-run assemble so the packet carries it:

- `fit.band` and `fit.rationale`, with `fit.counter_evidence`. The validator enforces the band's evidence rules from `references/sponsor-fit-and-outreach.md`: claim only what the fields support.
- `outreach.reason_to_engage` with `reason_source_url` — one dated reason, at the evidence's strength.
- `outreach.personal_note` — the sender's register; the reason is its floor.
- `outreach.package_named` — a rate-card tier verbatim, or empty. Availability is never implied.
- `outreach.subject` and `preview_text`, written last, together.

*Done: ten fields present, judgement written, re-assemble run, packet's sponsor carries the fit band.*

## 6 · Email

Renders `templates/sponsor-pitch.mjs` to `artifacts/pitch.html` and `.txt` — React Email as zero-build ESM, so `node` renders it with no compile step. The sender block comes from `knowledge/agency/sender.json`; the property block from the campaign packet.

Refuses before rendering: any `blocked_*` target, a reason without a dated activation, an unwritten subject. Greeting: the retrieved decision-maker's first name, or `<Company> team` when none was retrieved.

Props come from the dossier and the festival packet. A prop without evidence is omitted; its section does not render. Body order: personal note → event block → the offer sheet (the deck's rate card, the named tier highlighted) → one action, signed Robert Dittrich. `outreach.hero_image_url` adds hosted campaign art when the operator supplies it.

After rendering, the draft paths are written into the dossier and the packet is re-derived, so the draft is part of the run's record. `npm run email` then lints the pitch; exit 1 is a finding — rewrite the pitch, never the linter.

*Done: both files render, lint exits 0, packet's `messages[]` carries the draft.*

## 7 · Validate

The full-gather contract. Exits non-zero on: missing required field, `Verified` without a source URL, a negative without dated evidence, `executed` without a receipt, a draft or subject on any blocked target, a package that is not a rate-card tier, a disputed attendance figure inside a message, a secret in the packet — **and, for an open target: unwritten fit band or rationale, a `strong`/`plausible` band without its required evidence or counter-evidence, missing reason/subject/preview, or no rendered draft on disk.**

`--partial` checks structure only, for mid-run use. Step 7 runs the full contract.

*Done: exit 0 in full mode.*

## 8 · Dashboard

`npm run dashboard` builds and returns. `npm run dashboard:serve` serves it; the page reads `artifacts/packet.json` **per request**, so a later run shows up on refresh without a rebuild.

Confirm the sponsor card with its fit band, refused rows, open gates, withheld attendance claims, drafted outreach, and the operation ledger render. Capture the view.

Decision layer first, audit layer beneath it. `proposed`, `blocked`, and `failed` are never styled as verified. The open gates are shown, not hidden — they are the honest half of the demo.

*Done: build clean, served view captured with the draft visible.*

## Report

Capabilities run, capabilities skipped with reasons, credits planned against spent, unknowns, the open commercial gates, and the review scorecard — the meeting note's own dimensions (target quality, decision-maker coverage, warm paths, message quality, time saved, pipeline), filled where measurable and blocked-with-reason where not.

## References

Open on trigger.

| Trigger | File |
| --- | --- |
| Hunting net-new sponsors | the campaign's `comparable-events.json` via `npm run discover -- --list` |
| Any outreach prose | `knowledge/agency/trifecta-profile.md` |
| The deck's vocabulary and register line | the campaign's `deck-register.md` |
| Citing a property fact, naming a tier | the campaign's `deck-facts.md` |
| Writing prose | `references/writing-quality.md` |
| Building the pitch | `references/sponsor-fit-and-outreach.md` |
| Field shape unclear | `references/sponsor-dossier-contract.md` |
| Adding a provider call | `references/contextdev-capabilities.md` |
| Changing the dashboard | `references/dashboard-brief.md` |
| Claim boundary unclear | `references/evidence-policy.md` |

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| Step 6 exits 4 on a good target | No dated activation read, or a gate | Run step 3 against a real page; a gate clears only when the client answers it |
| Draft greets "team" instead of a name | No decision-maker URL supplied | Ask the client for the exact profile URL; never invent a name |
| Every target rejected at step 1 | Domain column empty | The client supplies domains; the skill never resolves them |
| Validate fails on unwritten judgement | Step 5's authoring half skipped | Write fit and outreach into the dossier, re-run assemble |
| Validator flags a package | Named something outside the rate card | Name a tier verbatim from the campaign's `deck-facts.md`, or nothing |
| `lint_pitch` exits 1 | Deck register or an unsourced number leaked into the email | Rewrite in the sender's register; facts from the campaign's `deck-facts.md` only |
| Pitch renders in the neutral scheme | No campaign tokens | `npm run brand`, then check the evidence counts in `artifacts/brand-tokens.json` |
| Dashboard shows an old run | Serving a stale process | The page reads per request; refresh, or restart `dashboard:serve` |
