# Context.dev capability catalog

What the provider can do, what each call costs, and which one to reach for at each stage of this run. Credits are the published figures; treat them as the planning unit, because the budget is set before the run and reported after it.

Base `https://api.context.dev/v1` · `Authorization: Bearer $CONTEXT_DEV_API_KEY` · server-side only, never logged.

## Identity: company first, person second

| Call | Method | Credits | Use for |
| --- | --- | --- | --- |
| `/brand/retrieve` | POST | 10 | The core of this run. Resolves a **known** bare domain into a structured company: title, description, industries, address, socials, logos, colours. Everything downstream keys off it. |
| `/people/retrieve` | POST | per plan | The decision maker, and only when the client supplied an exact LinkedIn URL. Returns full name, headline, location, summary, experience, education, skills. Private alpha — confirm access before planning around it. Omitted rather than guessed. |

`identifiers.linkedinUrl` is the only input. It resolves an identity you already have; it does not search for one.

## Company and brand

| Call | Method | Credits | Use for |
| --- | --- | --- | --- |
| `/brand/retrieve` | POST | 10 | Resolve the firm by domain, name, email, ticker, or ISIN. Returns domain, title, description, colors, logos, socials, address, industries (EIC), links, phone, language. One call per canonical domain, reused across everyone at that firm. |
| `/brand/retrieve-simplified` | GET | 10 | Logos and colors only, when the dossier needs a mark and nothing else. |
| `/utility/prefetch` | POST | **0** | Warm the cache the moment a domain is known. Free, fire-and-forget, never blocked on. Paid plans only. |
| `/web/naics`, `/web/sic` | GET | 10 | Normalized industry codes from a name or description. This is what turns a firm into a segment. |

## Public web evidence

| Call | Method | Credits | Use for |
| --- | --- | --- | --- |
| `/web/search` | POST | 1/result | Dated public signals — a new fund, a financing, a hire, a talk. `freshness` narrows to the recency window; `includeDomains` keeps it to sources worth trusting. Results are leads until extraction verifies them. |
| `/web/extract` | POST | 10 | The evidence workhorse. A caller-supplied JSON Schema across up to 50 pages, with `factCheck: true` returning **null for anything it cannot support**. This is the only call that yields a `Verified` field with a citable source. |
| `/web/scrape/markdown` | GET | 1 | Read one known page cleanly. `maxAgeMs: 0` forces a fresh read. |
| `/web/scrape/html` | GET | 1–2 | When the markup itself matters. |
| `/web/crawl` | POST | 1/page | A firm's team or portfolio section as a bounded corpus. Cap it. |
| `/web/scrape/sitemap` | GET | 1 | Find the team, portfolio, and news paths before crawling blind. |

## Presentation and proof

| Call | Method | Credits | Use for |
| --- | --- | --- | --- |
| `/web/screenshot` | GET | 5 | A rendered image of the firm's site for the dossier. `fullScreenshot`, `handleCookiePopup`, and a `page` enum including `careers` and `pricing`. |
| `/web/styleguide` | GET | 10 | The firm's palette, typography, spacing, shadows, and component CSS. Lets a dossier carry the subject's own visual identity rather than a generic template. |
| `/web/fonts` | GET | 5 | Typography alone, when the full styleguide is more than the page needs. |
| `/web/scrape/images` | GET | 1–5 | Image inventory with optional resolution and classification enrichment. |

## Product and market

| Call | Method | Credits | Use for |
| --- | --- | --- | --- |
| `/brand/ai/product` | POST | 10 | One product page into structured fields. |
| `/brand/ai/products` | POST | 10 | A firm's product line, up to 12. Beta. |

## Rules that apply to every call

- **`maxAgeMs`** governs cache tolerance, roughly 1 day to 1 year, default ~90 days. Pass `0` when the answer must be current — a stale hit is the quiet failure mode here.
- **Bare domains only.** `stripe.com`, never `https://stripe.com` or `www.stripe.com`.
- **XOR inputs.** Styleguide, fonts, screenshot, and `/brand/ai/products` take exactly one of `domain` or `directUrl`.
- **Nullable fields.** Logos, colors, stock, and phone come back null routinely. Filter logos by `mode` and `type` rather than taking `logos[0]`, and key colors off `hex` — the `name` is model-generated.
- **Errors carry meaning.** `400 NOT_FOUND` is free and is a finding, not a failure. `408` means cold or under-timed — prefetch or raise `timeoutMS`. `422` on an email endpoint means a free or disposable address; skip it. `429` backs off exponentially.
- **Latency.** Cache hits return sub-second; cold crawls run about 7 seconds at p50 and up to a minute at p99. Plan the wave around the cold case.

## Where Context stops

Context resolves and extracts from the public web. It does not hold the community's own record, it does not verify email deliverability, and it does not sit behind a login. Those are the runtime's own capabilities: the platform export for the baseline, a verification provider for deliverability, and an authenticated browser session for anything rendered or gated. Reach for the browser last — a session spent reading a static page is a slot spent on nothing.
