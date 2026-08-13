# Sponsor dossier contract

The field envelope, the ten required fields, and the rules `scripts/validate_packet.mjs` enforces.

## The envelope

Every field in `required_fields` carries the same six keys:

```json
{
  "value": null,
  "state": "pending_retrieval",
  "confidence": "Unknown",
  "source": null,
  "source_url": null,
  "observed_at": null
}
```

`state` is one of `pending_retrieval`, `retrieved`, `unknown`, `baseline`. A field that ended `unknown` carries a `reason` alongside, saying what would have to be true for it to resolve.

`confidence` is `Verified`, `Estimated`, or `Unknown`. `Verified` without a `source_url` fails validation.

## The ten

| Field | Filled from | Resolves when |
| --- | --- | --- |
| `category_fit` | Client list + `/brand/retrieve` | Always; the client list supplies a floor |
| `activation_history` | The signal brief, only when `reason_eligible` | A dated, quoted activation page is read |
| `audience_overlap` | The company's own stated audience | Their site or media kit names an audience |
| `regional_presence` | `/brand/retrieve` address, `/web/search` | An address or named market is retrieved |
| `budget_signal` | Dated activation at a known scale | A page states or implies a spend band |
| `decision_maker` | `/people/retrieve` | The client supplies an exact profile URL |
| `decision_maker_title` | `/people/retrieve` | Depends on `decision_maker` |
| `contact_route` | A verification provider | Never, in showcase mode. Stays `null` |
| `compliance_flags` | `targets/exclusions.csv` | Always; empty is a real answer |
| `changes_since_last` | A prior accepted run | Second run onward |

All ten appear whatever the outcome. A field missing from the packet is worse than one present and `unknown`: the reader cannot tell "we looked and found nothing" from "we never looked."

## Gates

`gates.draft_gate` is `open` or `blocked_compliance`. Blocked targets may be researched and may appear in the packet. They may not carry a subject line or a draft path, and step 5 refuses them.

`gates.exclusion_check` is `clear` or `unverified_against_rule`. It is `unverified_against_rule` for every target while the client's exclusion list and the three sponsors already in motion remain unsupplied. The validator will not accept any other value.

This is the field most likely to be quietly flipped to `clear` to make a run look finished. Pitching a sponsor already mid-negotiation with the client is the most expensive mistake available here, and it is invisible from our side.

## Fit

`fit.band` is `strong`, `plausible`, `category_only`, or `blocked`. `fit.rationale` states the case. `fit.counter_evidence` states the case against, and a band with an empty counter-evidence field has not been examined.

Bands and their requirements are in `sponsor-fit-and-outreach.md`.

## Outreach

`outreach.reason_to_engage` needs `reason_source_url`. `outreach.send_state` is always `draft_only_not_sent`. `outreach.sender_authority` is `unconfirmed` until the client names the sending account.

`outreach.package_named` stays null while `festival.packages.inventory_state` is `unsupplied`. The validator checks the pair.

## What the validator refuses

- A required field missing, or present with no `state`.
- `confidence: Verified` with no `source_url`.
- A negative value on an activity field without `state: retrieved`.
- `contact_route` with a non-null value.
- A draft path or subject line on a compliance-blocked target.
- `already_in_motion_state` set to anything but `clear` or `unverified_against_rule`.
- `send_state` other than `draft_only_not_sent`.
- An `executed` operation with no receipt.
- A package named while inventory is unsupplied.
- A disputed attendance figure inside a drafted message.
- A bearer token or API key anywhere in the packet.
