# opulent-sponsor-context-showcase

A skill for Opulent. It takes one sponsor target from a client's list, takes it as far as public evidence allows, and produces a sourced fit dossier, a drafted pitch, and a dashboard showing the whole chain — including what the run could not answer.

This repository holds the **instructions and the output contract**. It performs no extraction and ships no gathered data. The templates are empty on purpose.

## What it does

Depth over breadth is the point. Thirty shallow rows prove nothing a language model cannot produce in a minute — which is exactly where the client's list came from. One target taken to the limit of the evidence proves a method.

A company name and a bare domain go in. The run validates the entity before spending anything on it, exhausts the provider surface on the company — brand resolution, industry codes, sitemap, bounded crawl, screenshot, styleguide, dated public signals — reads one dated activation page, and drafts one pitch whose every sentence traces back to a field the run produced. The dashboard shows the identity fixed before retrieval, the page each field came from, what the run cost, and the eight commercial questions nobody has answered yet.

## Run it

```bash
npm run targets                                            # validate the client list, apply both gates
npm run calls -- --domain <bare-domain> --company "<name>" # the full provider plan
npm run signal -- --url <activation-page>                  # one dated activation, read in a browser
npm run assemble                                           # dossier + packet
npm run email                                              # React Email pitch, draft only
npm run validate                                           # check the packet against the contract
npm run dashboard                                          # build and serve
npm test                                                   # contract tests
```

Retrieval needs `CONTEXT_DEV_API_KEY` server-side. Without it the run still validates, plans, and prices — and reports the retrieval stage as `blocked_missing_credentials` rather than substituting for it.

## Two gates, and why they are gates

**Compliance.** The client's own email flagged age and compliance limits on the cannabis names. Those targets are admitted for research and refused at the draft step. `npm run email` exits 4 rather than warning, because a drafted pitch is one copy-paste away from a sent one.

**Identity.** A row without an exact bare domain is rejected, never resolved by search. *Anheuser-Busch or its St. Louis distributor* names two companies with two sponsorship desks; the client is the only party who knows which they meant.

A third rule exists and cannot yet be enforced. Three sponsors were described as already in motion and never named, so every target carries `exclusion_check: unverified_against_rule` and the validator refuses to accept `clear` while that gate is open. Pitching a sponsor who is already mid-negotiation with the client is the most expensive mistake available here, and it is invisible from our side.

## What is withheld, and why

**Attendance.** The client supplied two figures four days apart — "more than 20,000 across three days" and "about 7,500 per day" — which do not reconcile and do not measure the same thing. The field is `disputed`, carries both claims with their dates, and no attendance number appears in any draft. The email template has no attendance prop at all, so there is nowhere for one to go. A number a sponsor can puncture in one question costs more than the number was worth.

**Package availability.** The decks supply a full rate card — five tiers from Presenting Sponsor at $100K+ down to Sampling Partner at $10K–$25K, extracted with slide citations into `knowledge/deck-facts.md` — so a pitch may name a tier and its published range. What was never supplied is availability: which tiers remain open and what the three in-motion sponsors hold. A pitch therefore never implies a tier is available, and the validator fails any message naming a package that is not a rate-card tier.

**Sending.** `send_state` is `draft_only_not_sent` and `sender_authority` is `unconfirmed`. Every draft goes out under the client's own name to a real decision maker, so the send button belongs to the client — the reasoning is in `references/sponsor-fit-and-outreach.md`.

## The ten required fields

Every sponsor carries all ten, whatever the outcome: category fit, activation history, audience overlap, regional presence, budget signal, decision maker, decision maker title, contact route, compliance flags, and changes since last. Each ships with its own state, so a gap always says which kind of gap it is — the envelope rules are in `references/sponsor-dossier-contract.md`.

## Layout

```
SKILL.md                          the seven-command procedure the agent follows
knowledge/
  sources/                        the client's decks, bit-for-bit, checksummed
  deck-facts.md                   every deck claim with its slide citation
  voice/voice-profile.md          the sender's register, the deck's, and the line between
  voice/banned-phrases.json       the machine-checkable half, enforced by lint_pitch
targets/
  nocturnal-valley-targets.csv    the client's list plus researched vodka and tequila rows
  exclusions.csv                  the rule gate, including the rules nobody has supplied
fixtures/
  festival-packet.json            the property being sold; client-supplied, not verified
templates/
  sponsor-dossier.template.json   one target: ten required fields + six extension blocks
  packet.template.json            the run: scope, festival, ledger, health, open gates
  sponsor-pitch.mjs               React Email, zero-build ESM: node renders it directly
references/
  contextdev-capabilities.md      every provider call, its credit cost, when to reach for it
  sponsor-dossier-contract.md     the field envelope and the rules the validator enforces
  sponsor-fit-and-outreach.md     fit bands, reason ranking, message build, house voice
  writing-quality.md              word-level rules, with the full swap tables
  dashboard-brief.md              layers, rules, visual direction, licensing
  evidence-policy.md              what may be claimed, from what, and where a claim stops
scripts/
  load_targets.mjs                both gates; rejects anything without an exact domain
  run_calls.mjs                   the fixed provider plan, one receipt per call
  scrape_signal.mjs               the activation brief, and its check
  assemble.mjs                    receipts + signal + packet -> dossier and packet
  render_email.mjs                the pitch, behind two refusing gates
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

The festival facts, the target list, the exclusion flag, and the open commercial questions come from the client's own materials and the August 10 call: a 15-page sponsorship deck, a 9-slide revision, a 25-company list, a sample outreach email, and the meeting note. Each field in `fixtures/festival-packet.json` names which one it came from.

Client-supplied is not verified. It carries the same envelope as anything else.
