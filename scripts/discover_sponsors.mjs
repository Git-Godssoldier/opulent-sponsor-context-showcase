#!/usr/bin/env node
/**
 * discover_sponsors.mjs — net-new sponsor discovery from comparable events.
 *
 *   node scripts/discover_sponsors.mjs --list                 # the universe, by tier
 *   node scripts/discover_sponsors.mjs --event <key>          # open a harvest brief
 *   node scripts/discover_sponsors.mjs --check <key>          # validate what you filled in
 *   node scripts/discover_sponsors.mjs --emit <key>           # append clean rows to artifacts/discovered.csv
 *
 * The inversion this step exists for: brainstorming categories produces names with no
 * evidence (the client's own ChatGPT list is the baseline), while a comparable event's
 * sponsor list produces companies that already bought exactly what this festival sells,
 * each arriving with a dated, quotable activation by construction. The universe lives in
 * fixtures/comparable-events.json, tiered by how much a sponsorship there says about fit
 * here; harvest tier 1 and the same-market tier before touching national lists.
 *
 * The read itself is yours: sponsor pages often render client-side, so a browser session
 * does the looking. This script fixes the shape, refuses a harvest whose claims lack a
 * quote, a date, or a page, and emits rows in the exact column shape the target loader
 * takes — so discovered companies pass through the same gates as the client's own list,
 * with no separate class of citizen.
 *
 * Domains: a discovered company's domain enters only as `domain_confirmed: true` with a
 * `confirmation_url` on the company's own site, checked in this run. The ambiguous case
 * — several entities sharing a name — stays blank with the ambiguity noted, and the
 * identity gate holds it until a person resolves it. Confirming an unambiguous brand's
 * own site is mechanical; choosing between two entities is not, and only the second is
 * the client's job.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const universe = JSON.parse(readFileSync(resolve(here, "../fixtures/comparable-events.json"), "utf8"));
const argv = process.argv.slice(2);
const has = (f) => argv.includes(`--${f}`);
const val = (f) => { const i = argv.indexOf(`--${f}`); return i === -1 ? null : argv[i + 1]; };

const DIR = resolve("artifacts/discovery");
const OUT = resolve("artifacts/discovered.csv");
const HEADER = "company,category,domain,region_fit,activation_lead,activation_lead_source,note";

// ---- list ---------------------------------------------------------------------
if (has("list")) {
  console.log(`ICP: ${universe.icp.audience} · ${universe.icp.format} · ${universe.icp.market}`);
  console.log(`Window: ${universe.icp.window}\n`);
  for (const [tier, why] of Object.entries(universe.tiers)) {
    console.log(`${tier} — ${why}`);
    for (const e of universe.events.filter((e) => e.tier === tier)) {
      console.log(`  ${e.key.padEnd(28)} ${e.name} · ${e.edition} · ${e.location}`);
      console.log(`  ${"".padEnd(28)} ${e.sponsor_source}`);
      console.log(`  ${"".padEnd(28)} ${e.verification}${e.note ? `\n  ${"".padEnd(28)} ${e.note}` : ""}`);
    }
    console.log();
  }
  process.exit(0);
}

const key = val("event") ?? val("check") ?? val("emit");
const event = universe.events.find((e) => e.key === key);
if (!event) {
  console.error("usage: discover_sponsors --list | --event <key> | --check <key> | --emit <key>");
  if (key) console.error(`unknown event key: ${key} — run --list for the universe`);
  process.exit(2);
}
const briefPath = resolve(DIR, `${key}.json`);

// ---- open a harvest brief -------------------------------------------------------
if (has("event")) {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(briefPath, JSON.stringify({
    event: { key: event.key, name: event.name, edition: event.edition, location: event.location, tier: event.tier },
    sponsor_source: event.sponsor_source,
    verification_note: event.verification,
    edition_confirmed: null,
    list_dated: null,
    observed_at: null,
    read_only: true,
    sponsors_observed: [{
      company: null,
      category_guess: null,
      evidence_quote: null,
      evidence_date: null,
      source_url: event.sponsor_source,
      domain: null,
      domain_confirmed: false,
      confirmation_url: null,
      ambiguity_note: null,
      already_on_list: false,
    }],
  }, null, 2) + "\n");
  console.log(`${briefPath} opened for ${event.name}.`);
  console.log("Read the sponsor page in a browser session, fill sponsors_observed (one entry per");
  console.log("sponsor), confirm domains on each company's own site, then: --check " + key);
  process.exit(0);
}

// ---- validate --------------------------------------------------------------------
if (!existsSync(briefPath)) { console.error(`${briefPath} not found. Run --event ${key} first.`); process.exit(2); }
const brief = JSON.parse(readFileSync(briefPath, "utf8"));
const problems = [];
if (brief.edition_confirmed !== true) problems.push("edition_confirmed is not true — pin which edition the sponsor list describes (the Ultra page shows 2027 dates over what reads as an older list)");
if (!brief.list_dated) problems.push("list_dated is empty — the date the list evidences (an edition date or a page date)");
if (!brief.observed_at) problems.push("observed_at is empty");
const rows = (brief.sponsors_observed ?? []).filter((s) => s.company);
if (!rows.length) problems.push("sponsors_observed is empty — a harvest with nothing observed is a finding about the source, not a brief to emit");
for (const s of rows) {
  const who = s.company;
  if (!s.evidence_quote) problems.push(`${who}: no evidence_quote — the page's own words, verbatim`);
  if (!s.evidence_date || !/^\d{4}(-\d{2}){0,2}$/.test(String(s.evidence_date))) problems.push(`${who}: evidence_date missing or not ISO`);
  if (!s.source_url) problems.push(`${who}: no source_url`);
  if (s.domain && s.domain_confirmed !== true) problems.push(`${who}: domain set but domain_confirmed is false — confirm on the company's own site or blank it`);
  if (s.domain_confirmed === true && !s.confirmation_url) problems.push(`${who}: domain_confirmed without a confirmation_url`);
  if (s.domain && /^https?:|^www\./.test(s.domain)) problems.push(`${who}: domain must be bare — got ${s.domain}`);
  if (!s.domain && !s.ambiguity_note) problems.push(`${who}: no domain and no ambiguity_note — say why it could not be confirmed`);
}

if (has("check")) {
  if (problems.length) { for (const p of problems) console.error(`  ${p}`); process.exit(1); }
  console.log(`harvest OK · ${event.name} · ${rows.length} sponsor(s) observed · edition ${brief.list_dated}`);
  process.exit(0);
}

// ---- emit --------------------------------------------------------------------------
if (has("emit")) {
  if (problems.length) { console.error("refusing to emit an invalid harvest:"); for (const p of problems) console.error(`  ${p}`); process.exit(1); }
  const csv = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  if (!existsSync(OUT)) { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, HEADER + "\n"); }
  const existing = readFileSync(OUT, "utf8");
  let added = 0, skipped = 0;
  for (const s of rows) {
    if (s.already_on_list) { skipped++; continue; }
    if (existing.toLowerCase().includes(`\n${csv(s.company).toLowerCase()},`)) { skipped++; continue; }
    const lead = `Listed sponsor, ${event.name} ${brief.list_dated}`;
    const note = `DISCOVERED via ${event.key} (tier ${event.tier}). Quote: ${s.evidence_quote}` +
      (s.domain ? ` Domain confirmed at ${s.confirmation_url}.` : ` No confirmed domain: ${s.ambiguity_note}`);
    appendFileSync(OUT, [csv(s.company), csv(s.category_guess ?? ""), csv(s.domain ?? ""), csv(""),
      csv(lead), csv(s.source_url), csv(note)].join(",") + "\n");
    added++;
  }
  console.log(`artifacts/discovered.csv · +${added} row(s), ${skipped} skipped (duplicates or already on the client list)`);
  console.log("The loader folds this file in automatically: npm run targets");
  process.exit(0);
}
