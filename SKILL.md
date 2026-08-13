---
name: opulent-sponsor-context-showcase
description: Use when sourcing festival or event sponsors, qualifying a client target list, or drafting sponsorship outreach. Fixed Context.dev plan, one dated activation verified, pitch drafted. Never sends.
license: MIT
---

# Opulent Sponsor Context Showcase

The skill is **Trifecta Marketing's** — Bob Dittrich's agency, selling sponsorship packages for ten to fifteen independent festivals. A campaign is one property being sold, held as data under `campaigns/<key>/`; Nocturnal Valley is the sample campaign, not the identity. One campaign present runs by default; several need `--campaign <key>`.

Two commands and one judgement pass between them.

```bash
npm run research -- --target <id> [--linkedin-url <url>]   # gate, call, brand, assemble
#   read the activation page · fill artifacts/signal.json · write judgement into artifacts/dossier.json
npm run deliver                                            # assemble, draft, lint, validate
```

`research` installs the render dependencies on a fresh clone, then runs the target gate, the twelve provider calls, and the deck read concurrently, and assembles a first dossier. `deliver` folds in your judgement, renders the draft, lints it, attaches it, and checks the whole packet. Neither exceeds a few seconds of local work; the provider calls are the only real wait.

Off the critical path: `npm run discover` finds net-new sponsors before you have a target, and `npm run deliver -- --dashboard` builds the review page. Every stage also runs alone — `targets`, `calls`, `signal`, `brand`, `assemble`, `email`, `validate` — for debugging one step without re-running the rest.

## Invariants

- `templates/`, `knowledge/`, and `campaigns/` are read-only during a run. Output goes to `artifacts/`.
- `executed` requires an HTTP response **and** a stored receipt. Otherwise `blocked_missing_credentials`, `blocked_endpoint_access`, or `failed`.
- Absence is `unknown`. Only dated evidence sets `false`.
- Read `artifacts/calls-summary.json`, not the receipts.
- Pages are read. No clicks that change state.
- **No attendance figure appears in any draft.** The client's two figures do not reconcile, and neither deck states one.
- **A blocked target never reaches a draft**, whichever gate blocked it.
- **A greeting name comes only from a retrieved profile.** Without one the draft opens to the company's sponsorship team. A name is never invented, borrowed, or guessed.
- Outreach prose starts from `knowledge/agency/trifecta-profile.md` (the sender's register) and the campaign's `deck-facts.md`. A property fact outside those or the dossier is not written.
- The pitch is a draft. Sender authority is unconfirmed.
- **The rendered template is the output.** `artifacts/pitch.html` and `.txt` come from `templates/sponsor-pitch.mjs` and nowhere else. If the render fails, fix the render — a hand-written email carries none of the campaign's brand, rate card, or signature, and is not this workflow's deliverable.

## 1 · Research

```bash
npm run research -- --target <id>
```

**The gate.** Three rules, in order: compliance (cannabis rows are admitted for research and marked undraftable, per the client's own email), client-decision holds (NUTRL, until the Anheuser-Busch entry point is picked), then identity (no exact bare domain, no entry). Volcán X.A and Cîroc ship rejected on purpose — they are leads awaiting a client-confirmed domain. `artifacts/discovered.csv` folds in automatically when step 1b has produced one. Every accepted row carries `unverified_against_rule` until the client names the three sponsors already in motion.

**The calls.** Twelve, concurrent, six at a time. Parameter shapes are fixed in `scripts/run_calls.mjs` — `/web/naics` and `/web/sic` take `input`, the three brand-asset endpoints take `domain` XOR `directUrl`, and `/utility/prefetch` is paid-plan only and excluded. Pass `--linkedin-url` only when the client supplied an exact profile URL; without it the decision-maker call is omitted rather than guessed. No API key records every call `blocked_missing_credentials` and **exits 0**, because that record is the report. The plan is 90 credits, 110 with the decision maker; the summary states the budget and reconciles it against spend.

**The brand.** The campaign deck's palette and type, ranked from slide evidence that travels with the tokens. Runs alongside the calls, since neither waits on the other.

*Done: cohort counts echoed, every call terminal, tokens written, first dossier assembled.*

## 2 · The judgement pass

One pass over two files, then straight to `deliver`.

**`artifacts/signal.json`** — read one page showing this company sponsoring, activating at, or sampling into an event, and fill the brief. Some sponsor lists render client-side, so read them in a browser session rather than a raw fetch. `reason_eligible` needs a date **and** a verbatim quote. Undated is not a signal: it cannot tell you whether the budget is live now or was live in 2019, which is the entire reason to open on it.

**`artifacts/dossier.json`** — read `knowledge/agency/trifecta-profile.md` and the campaign's `deck-facts.md` first, then write:

- `fit.band` with `rationale` and `counter_evidence`. The validator enforces the band's evidence rules; claim only what the fields support.
- `outreach.reason_to_engage` with `reason_source_url` — one dated reason, at the evidence's strength.
- `outreach.personal_note` — the sender's register; the reason is its floor.
- `outreach.package_named` — a rate-card tier verbatim, or empty. Availability is never implied.
- `outreach.subject` and `preview_text`, written last, together.

Re-running `research` or `deliver` preserves both blocks; `--fresh` on assemble discards them deliberately.

*Done: signal eligible, judgement written.*

## 3 · Deliver

```bash
npm run deliver
```

Assembles the filled signal, renders `templates/sponsor-pitch.mjs` (React Email as zero-build ESM, no compile step), lints the prose, attaches the draft to the packet, and runs the full contract.

The draft refuses on any `blocked_*` target, a reason without a dated activation, or an unwritten subject — exit 4, and nothing downstream runs. Body order: personal note → event block → the deck's rate card with the named tier highlighted → one action, signed from `knowledge/agency/sender.json`. The lint checks banned phrases, em dashes, attendance-shaped numbers, tier fidelity, and the single ask; exit 1 is a finding, so rewrite the pitch, never the linter.

Validation is the full gather: every required field present, `Verified` carrying a source URL, no negative without dated evidence, no draft on a blocked target, no package outside the rate card, no disputed attendance figure in a message, no secret in the packet — and, for an open target, written judgement with its evidence and a rendered draft on disk. `--partial` checks structure only, mid-run.

*Done: lint 0, validate 0 in full mode, draft in `packet.messages[]`.*

## Discover net-new

```bash
npm run discover -- --list | --event <key> | --check <key> | --emit <key>
```

The client's list came from a category brainstorm, which produces names with no evidence. Discovery inverts that: harvest the sponsor lists of comparable events, where every company arrives having already bought what this festival sells, with a dated activation attached by construction. The universe is the campaign's `comparable-events.json`, tiered by the deck's own ICP — same format and region first, then the same market, then national properties dated inside 2026, and above all of them any prior event at the venue itself. `--emit` refuses an invalid harvest, skips duplicates, and writes rows the target gate then treats exactly like the client's own.

Monid is the second surface when the browser harvest runs dry (`references/monid-capabilities.md`).

## References

Open on trigger.

| Trigger | File |
| --- | --- |
| Any outreach prose | `knowledge/agency/trifecta-profile.md` |
| The deck's vocabulary and register line | the campaign's `deck-register.md` |
| Citing a property fact, naming a tier | the campaign's `deck-facts.md` |
| Writing prose | `references/writing-quality.md` |
| Building the pitch | `references/sponsor-fit-and-outreach.md` |
| Field shape unclear | `references/sponsor-dossier-contract.md` |
| Adding a provider call | `references/contextdev-capabilities.md` |
| Monid discovery or gap-fill | `references/monid-capabilities.md` |
| Changing the dashboard | `references/dashboard-brief.md` |
| Claim boundary unclear | `references/evidence-policy.md` |

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `deliver` exits 4 | No dated activation, or a gate | Fill the signal against a real page; a gate clears only when the client answers it |
| Draft greets "team" | No decision-maker URL supplied | Ask the client for the exact profile URL; never invent a name |
| `research` exits 2 on the target | Id not draftable | It prints the draftable ids; pick one |
| Validate fails on unwritten judgement | The judgement pass was skipped | Write fit and outreach into the dossier, re-run `deliver` |
| `lint_pitch` exits 1 | Deck register or an unsourced number in the email | Rewrite in the sender's register; facts from `deck-facts.md` only |
| Pitch renders neutral | No campaign tokens | `npm run brand`, then check the evidence counts in the tokens |
| Calls slow to a crawl | Provider rate limits | Lower `CALL_CONCURRENCY` (default 6); the retry path absorbs one 429 per call |
| `deliver` exits 3 | Render packages absent | `npm install` in the repo root, then re-run. Never substitute a typed email |
