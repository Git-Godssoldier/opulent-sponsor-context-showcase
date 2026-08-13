# opulent-sponsor-context-showcase

A skill for Opulent, built for **Trifecta Marketing** — Bob Dittrich's sponsorship sales agency, which sells packages for ten to fifteen independent festivals. It takes one sponsor target from a campaign's list, takes it as far as public evidence allows, and produces a sourced fit dossier, a drafted pitch, and a dashboard showing the whole chain — including what the run could not answer. **Nocturnal Valley is the sample campaign, not the identity**: everything property-specific lives under `campaigns/nocturnal-valley/` and swaps out per engagement.

This repository holds the instructions, the output contract, and the client's own materials: `knowledge/agency/` carries Trifecta's identity and register, and `campaigns/nocturnal-valley/` carries that property's decks bit-for-bit with their claims extracted and cited, because outreach authors from them. It gathers no third-party data at rest — run artifacts stay out of git, and the templates are empty on purpose.

## What it does

Depth over breadth is the point. A stack of shallow rows proves nothing a language model cannot produce in a minute — which is exactly where the client's list came from. One target taken to the limit of the evidence proves a method.

A company name and a bare domain go in. The run validates the entity before spending anything on it, exhausts the provider surface on the company — brand resolution, industry codes, sitemap, bounded crawl, screenshot, styleguide, dated public signals — reads one dated activation page, and drafts one pitch whose every sentence traces back to a field the run produced. The dashboard shows the identity fixed before retrieval, the page each field came from, what the run cost, and the eight commercial questions nobody has answered yet.

## Run it

```bash
npm run targets                                            # gate the client list (+ discovered rows)
npm run discover -- --list                                 # net-new: harvest comparable events' sponsors
npm run calls -- --domain <bare-domain> --company <name>   # the full provider plan
npm run signal -- --url <activation-page>                  # one dated activation, read in a browser
npm run brand                                              # campaign identity from the deck
npm run assemble -- --target <id>                          # dossier + packet; judgement survives re-runs
npm run email                                              # React Email pitch, draft only, voice-linted
npm run validate                                           # the full-gather contract
npm run dashboard && npm run dashboard:serve               # build returns; serve reads the packet live
npm test                                                   # contract tests
```

Retrieval needs `CONTEXT_DEV_API_KEY` server-side. Without it the run still validates, plans, and prices — and reports the retrieval stage as `blocked_missing_credentials` rather than substituting for it.

## Net-new discovery

The client's own process was a ChatGPT brainstorm followed by manual research — names with no evidence. Discovery inverts it: the campaign's `comparable-events.json` holds a tiered universe of comparable 2026 events, and harvesting their sponsor pages yields companies that already bought what this festival sells, each with a dated, quotable activation. Same format and region outrank national properties; Evolution Festival's 2026 pause makes its 2025 St. Louis sponsors the warmest cold list in the market; and any sponsor of a prior event at Astral Valley Art Park itself is the strongest comp that can exist. Discovered rows are emitted in the client list's own column shape and ride the same gates.

## Two gates, and why they are gates

**Compliance.** The client's own email flagged age and compliance limits on the cannabis names. Those targets are admitted for research and refused at the draft step. `npm run email` exits 4 rather than warning, because a drafted pitch is one copy-paste away from a sent one.

**Identity.** A row without an exact bare domain is rejected, never resolved by search. *Anheuser-Busch or its St. Louis distributor* names two companies with two sponsorship desks; the client is the only party who knows which they meant.

A third rule exists and cannot yet be enforced. Three sponsors were described as already in motion and never named, so every target carries `exclusion_check: unverified_against_rule` and the validator refuses to accept `clear` while that gate is open. Pitching a sponsor who is already mid-negotiation with the client is the most expensive mistake available here, and it is invisible from our side.

## What is withheld, and why

**Attendance.** The client supplied two figures four days apart — "more than 20,000 across three days" and "about 7,500 per day" — which do not reconcile and do not measure the same thing. The field is `disputed`, carries both claims with their dates, and no attendance number appears in any draft. The email template has no attendance prop at all, so there is nowhere for one to go. A number a sponsor can puncture in one question costs more than the number was worth.

**Package availability.** The decks supply a full rate card — five tiers from Presenting Sponsor at $100K+ down to Sampling Partner at $10K–$25K, extracted with slide citations into the campaign's `deck-facts.md` — so a pitch may name a tier and its published range. What was never supplied is availability: which tiers remain open and what the three in-motion sponsors hold. A pitch therefore never implies a tier is available, and the validator fails any message naming a package that is not a rate-card tier.

**Sending.** `send_state` is `draft_only_not_sent` and `sender_authority` is `unconfirmed`. Every draft goes out under the client's own name to a real decision maker, so the send button belongs to the client — the reasoning is in `references/sponsor-fit-and-outreach.md`.

## The ten required fields

Every sponsor carries all ten, whatever the outcome: category fit, activation history, audience overlap, regional presence, budget signal, decision maker, decision maker title, contact route, compliance flags, and changes since last. Each ships with its own state, so a gap always says which kind of gap it is — the envelope rules are in `references/sponsor-dossier-contract.md`.

## Layout

```
SKILL.md                          the eight-command procedure the agent follows
knowledge/agency/                 Trifecta Marketing: profile, register, sender.json, house bans
campaigns/nocturnal-valley/       the sample campaign, swappable per engagement
  sources/                        the property's decks, bit-for-bit, checksummed
  deck-facts.md                   every deck claim with its slide citation
  deck-register.md                what outreach takes from this deck, and what stays in it
  festival-packet.json            the property being sold; client-supplied, not verified
  targets.csv + exclusions.csv    the campaign's list and rule gates
  comparable-events.json          the discovery universe, tiered by the deck's own ICP
  banned-phrases.json             this deck's register words, banned in email prose
templates/
  sponsor-dossier.template.json   one target: ten required fields + six extension blocks
  packet.template.json            the run: scope, festival, ledger, health, open gates
  sponsor-pitch.mjs               React Email, zero-build ESM, brand-token driven
references/
  contextdev-capabilities.md      every provider call, its credit cost, when to reach for it
  sponsor-dossier-contract.md     the field envelope and the rules the validator enforces
  sponsor-fit-and-outreach.md     fit bands, reason ranking, message build, house voice
  writing-quality.md              word-level rules, with the full swap tables
  dashboard-brief.md              layers, rules, visual direction, licensing
  evidence-policy.md              what may be claimed, from what, and where a claim stops
scripts/
  lib/campaign.mjs                 resolves the active campaign and the agency identity
  load_targets.mjs                both gates; rejects anything without an exact domain
  run_calls.mjs                   the fixed provider plan, one receipt per call
  scrape_signal.mjs               the activation brief, and its check
  assemble.mjs                    receipts + signal + packet -> dossier and packet
  discover_sponsors.mjs           net-new harvest from comparable events' sponsor pages
  render_email.mjs                the pitch, behind two refusing gates
  extract_brand.mjs               deck (+ optional site styleguide) -> brand tokens
  lint_pitch.mjs                  voice lint; npm run email chains it
  validate_packet.mjs             enforces the dossier contract
dashboard/                        Next.js app; reads the packet, renders its empty states
```

## What it will not do

- Resolve a company name to a domain, or a person's name to a profile.
- Put a disputed number, an unsupplied package, or an undated claim in a message.
- Mark a target clear of a rule whose contents nobody has.
- Send anything.

## Sources

The festival facts, the target list, the exclusion flag, and the open commercial questions come from the client's own materials and the August 10 call: a 15-page sponsorship deck, a 9-slide revision, a 25-company list, a sample outreach email, and the meeting note. Each field in the campaign's `festival-packet.json` names which one it came from.

Client-supplied is not verified. It carries the same envelope as anything else.
