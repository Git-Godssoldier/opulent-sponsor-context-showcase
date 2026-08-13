# Voice profile

Two registers live in this repository, and the email is written in exactly one of them.

## The sender's register

The pitch goes out under Robert Dittrich, Trifecta Marketing. His own sample outreach, as collected from the August 11 mailbox thread, sets the register — reconstructed from the collection record rather than quoted, since the verbatim file was not preserved:

It introduces the festival in one plain sentence: a new three-night music, arts, and camping festival at Astral Valley Art Park, about 45 minutes south of St. Louis. It offers to adjust a package to the sponsor's brand goals. It asks for a fifteen-minute call. It signs with his name and company.

That is the whole model. Four moves, no throat-clearing, no enthusiasm performed on the reader's behalf. Thirty years of sponsorship sales sound like someone with nothing to prove, and the draft has to sound like him — he is the signature on it.

**Write in this register:**

- Their name, their activation, their category — the email starts in the recipient's world, and the reason it opens on comes from the dossier with its date.
- One idea per sentence. Facts from `deck-facts.md` or the dossier, nothing else.
- Zone and tier names verbatim from the deck: a Sampling Partner slot at the Forest Stage is checkable; "a great partnership opportunity" is not.
- The offer move is Bob's: fit the package to their goals, not sell them the biggest tier.
- One ask, fifteen minutes, his scheduling link. Sign as a person.

## The deck's register

The decks speak festival-marketing: "immersive" on five of nine slides, "captive, receptive audience," "massive scale," "LET'S BUILD SOMETHING IMMERSIVE." That register is correct **inside the deck** — it is the brochure the prospect will read after replying — and it is the wrong register for the email that gets the reply.

From the deck, outreach takes **nouns and numbers**: zone names, tier names, investment ranges, the six pillars, the audience table. It leaves the adjectives. One deck argument is worth carrying in the sender's own words: early partners get prime positioning and preferred pricing while the festival is new — the one line aimed at the first-edition objection, and honest about it.

Describing the audience: give the recipient the deck's numbers ("24–34, Midwest, $60K–$140K household income") and let them conclude fit. "A captive audience" in an email reads as a threat; the same fact as a number reads as a media kit.

## The machine-checkable half

`banned-phrases.json`, beside this file, holds the phrases that never appear in a pitch, drawn from `references/writing-quality.md` plus the deck-register words that must not leak into email prose. `scripts/lint_pitch.mjs` enforces the list, the no-attendance rule, the em-dash ban, the single ask, and tier-name fidelity against the rate card. `npm run email` runs it after every render; exit 1 is a finding, and editing the pitch to pass is the job.

Word-level swap tables: `references/writing-quality.md` and the two vendored lists beside it.
