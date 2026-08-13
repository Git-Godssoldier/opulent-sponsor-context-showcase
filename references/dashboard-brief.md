# Dashboard brief

The dashboard is the argument. It has to make the method legible — that identities were fixed before retrieval, that every field carries a source, and that nothing unproven is styled as proven.

Adapted from the Nim-derived report app in `opulent-gtm-intelligence/assets/report-app`. Same two-layer structure, same chart contract, scoped to a known-person cohort.

## Two layers, in this order

**Decision layer.** What a reader acts on, in plain language.

1. **Masthead** — client, objective, source mode, generated date. Source mode is a badge: `Context receipts` when calls executed, `Public baseline` when they did not. It never reads as live when it is not.
2. **Run scope strip** — rows in, cohort accepted, rejected, unique firms, calls executed, credits spent.
3. **Cohort grid** — one card per person: name, title, firm, location, identity confidence, field coverage. Cards link to the dossier.
4. **Analytics** — the charts below.
5. **Excluded rows** — every rejected row with its reason, shown, not hidden. This section is the credibility of the rest.

**Audit layer.** One region, collapsed by default, forced open in print:

- Context operation ledger — natural-language job, method, endpoint, body, status, receipt
- Data health — coverage, null rates, conflicts, identity resolution
- Field-level provenance appendix — every value with its source URL and observation date
- Unknowns

Technical chips — credits, cache age, receipt IDs — live small or inside a card's collapsed details. They never crowd the decision layer.

## Charts

Use the committed Dither Kit components. Hand-built bars, faux CSS charts, and decorative chart-shaped markup are prohibited — a fake chart in a demo about evidence discipline is the one thing that cannot be allowed.

| Surface | Component | Data |
| --- | --- | --- |
| Field coverage per person | bar | Retrieved fields out of the ten required |
| Evidence composition | radar | Identity · role · firm · activity · contact · recency, cohort average |
| Confidence distribution | pie | `Verified` / `Estimated` / `Unknown` across all fields |
| Cohort geography | pie | People per city |
| Retrieval pipeline | matrix | One row per person, one column per stage: validated → prepared → executed → extracted |
| Credit spend by stage | area or bar | Planned against actual, per capability |
| Identity confidence | bar | `high` / `medium` / `low` counts, with the low ones nameable |

A chart with no data renders its empty state rather than an axis with nothing on it.

## Dossier route

One static route per person. It repeats the complete record — every field with value, state, confidence, source URL, and observation date — then career shape, firm intelligence, investment signal, public activity, relationship context, and the person's own unknowns.

Where the firm's palette and logo were retrieved, the dossier header may carry them. That is the demonstration: the page looks researched because the research produced its visual identity too.

## Rules that hold everywhere

- **Never style `proposed`, `blocked`, or `failed` as active or verified.** Distinct treatment, not a softer shade of green.
- **A `blocked` source shows its blocked read verbatim.** Never imply a source was ingested when it was not.
- **Confidence, source URLs, status, and receipts stay visible** in the audit layer at all times.
- **Roster variance is shown, not reconciled.** Where the supplied list and the public record disagree, both appear.
- **Zero states are honest.** No interactions renders as no interactions.
- Responsive to 390px without horizontal overflow, keyboard accessible, light and dark, and printable with the audit layer expanded.

## What the demo is proving

In order: a client list became resolved entities, entities became evidence, evidence became structure, and structure became a page — with every step attributable and every gap named. The open gates belong on that page too: a demonstration that hides what it could not answer reads as finished work rather than as the bounded pass it is.
