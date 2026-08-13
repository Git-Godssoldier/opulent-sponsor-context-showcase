# Knowledge base

The client's own materials, carried with the skill so every run authors from the same ground truth. Nothing here is verified by us; it is what the client supplied, preserved bit-for-bit, with the claims extracted and cited so prose never has to reach back into a 10MB deck.

## Sources

| File | SHA-256 | Provenance |
| --- | --- | --- |
| `sources/nocturnal-valley-deck-draft-1.pdf` | `ab2b30df…d87160d` | 15 pages, image-based text, PDF author metadata "Joseph Abegg". Bob's August 10 email. |
| `sources/nocturnal-valley-deck-draft-2.pptx` | `f21eb69d…f49ddcb7` | 9 slides, the later and shorter revision. Bob's August 11 resend. |

Checksums match the collection manifest of 2026-08-12. The August 7 calendar invite was collected with these but stays out of the knowledge base: it is scheduling metadata, and nothing in a pitch may imply a meeting history.

## What lives where

- **`deck-facts.md`** — every claim the decks make, each with its slide citation. The only place outreach prose may take a festival fact from, besides the run's own dossier.
- **`voice/voice-profile.md`** — the two registers (the sender's and the deck's), which one the email is written in, and the adaptation rules between them.
- **`voice/banned-phrases.json`** — the machine-checkable half of the voice. `scripts/lint_pitch.mjs` enforces it after every render; `npm run email` will not pass a pitch that violates it.

## The contract

1. A festival fact in outreach traces to `deck-facts.md` or to a dossier field. A fact in neither is not written.
2. Zone and tier names are the deck's, verbatim: Astral, Nocturnal, Forest, VIP Experience, Sampling Activations, Presenting Sponsor, Stage Sponsor, VIP Sponsor, Content Partner, Sampling Partner.
3. The deck's promotional register stays in the deck. The email is written in the sender's register — the profile says exactly where the line is.
4. When the client revises a deck, the new file lands in `sources/`, `deck-facts.md` is re-cited against it, and the diff between the two is itself a finding.
