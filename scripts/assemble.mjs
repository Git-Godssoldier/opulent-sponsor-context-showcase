#!/usr/bin/env node
/**
 * assemble.mjs — receipts + signal brief + festival packet -> artifacts/dossier.json
 * and artifacts/packet.json.
 *
 *   node scripts/assemble.mjs [--target <id>]
 *
 * A mechanical transform. It copies the templates, fills what the receipts actually
 * contain, and leaves everything else in its declared empty state. It makes no judgement:
 * the fit band, the reason to engage, and the package to name are yours to write in
 * afterwards, against the rules in references/sponsor-fit-and-outreach.md.
 *
 * templates/ is never written to.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? d : process.argv[i + 1]; };
const read = async (p) => JSON.parse(await readFile(resolve(p), "utf8"));
const maybe = async (p) => (existsSync(resolve(p)) ? read(p) : null);
const now = new Date().toISOString();

const summary = await maybe("artifacts/calls-summary.json");
if (!summary) { console.error("artifacts/calls-summary.json not found. Run npm run calls first."); process.exit(2); }
const signal = (await maybe("artifacts/signal.json")) ?? {};
const cohort = (await maybe("artifacts/cohort.json")) ?? {};
const festival = await read("fixtures/festival-packet.json");

const receipts = {};
if (existsSync(resolve("artifacts/receipts"))) {
  for (const f of (await readdir(resolve("artifacts/receipts"))).filter((x) => x.endsWith(".json"))) {
    receipts[f.replace(/\.json$/, "")] = await read(`artifacts/receipts/${f}`);
  }
}
const ok = (id) => (receipts[id]?.http_status === 200 ? receipts[id].response : null);

const brand = ok("01-brand")?.brand ?? null;
const person = ok("13-decision-maker")?.person ?? null;

const field = (value, source, url) =>
  value === null || value === undefined || (Array.isArray(value) && !value.length)
    ? { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null, observed_at: null }
    : { value, state: "retrieved", confidence: "Verified", source, source_url: url ?? null, observed_at: now };

// ---- the subject -----------------------------------------------------------
const targetId = arg("target", null);
const targets = cohort.targets ?? [];
const subject = (targetId ? targets.find((t) => t.id === targetId) : targets.find((t) => t.domain === summary.subject?.domain)) ?? targets[0] ?? {};

const dossier = await read("templates/sponsor-dossier.template.json");
dossier.id = subject.id ?? null;
dossier.company = brand?.title ?? subject.company ?? summary.subject?.company ?? null;
dossier.domain = subject.domain ?? summary.subject?.domain ?? null;
dossier.client_list = {
  category: subject.category ?? null,
  region_fit: subject.region_fit ?? null,
  note: subject.note ?? null,
  activation_lead: subject.activation_lead ?? null,
  activation_lead_source: subject.activation_lead_source ?? null,
};
dossier.gates = {
  draft_gate: subject.draft_gate ?? null,
  draft_gate_reason: subject.draft_gate_reason ?? null,
  exclusion_check: subject.exclusion_check ?? null,
  exclusion_check_reason: subject.exclusion_check_reason ?? [],
};

const brandUrl = dossier.domain ? `https://${dossier.domain}` : null;
const R = dossier.required_fields;

R.category_fit = field(subject.category ?? brand?.industries?.eic ?? null, "client_list+brand_retrieve", brandUrl);
R.regional_presence = field(brand?.address ?? null, "brand_retrieve", brandUrl);

// The activation signal is the one field the pitch is allowed to open on, so it only
// counts when the brief marked it eligible: dated, quoted, and read off a real page.
R.activation_history = signal.reason_eligible === true
  ? { value: signal.summary, state: "retrieved", confidence: "Verified", source: signal.signal_type,
      source_url: signal.source_url, observed_at: signal.observed_at }
  : { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null, observed_at: null,
      reason: signal.source_url
        ? "A page was read but the signal was undated, unquoted, or not marked eligible. An undated sponsorship says nothing about a live budget."
        : subject.activation_lead
          ? `No activation page has been read yet. There is a lead to check: ${subject.activation_lead} (${subject.activation_lead_source}). A lead is where to look, never what was found.`
          : "No activation page has been read yet." };

R.decision_maker = person
  ? field(person?.profile?.fullName, "people_retrieve", subject.decision_maker_url ?? null)
  : { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null, observed_at: null,
      reason: "No exact LinkedIn profile URL was supplied. A name and a company is not an identity, and the wrong match here sends a real pitch to the wrong desk." };
R.decision_maker_title = person
  ? field(person?.experience?.[0]?.title, "people_retrieve", subject.decision_maker_url ?? null)
  : { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null, observed_at: null,
      reason: "Depends on decision_maker." };

// No verification provider is wired. Contact stays a state, never a guessed value.
R.contact_route = { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null,
  observed_at: null, reason: "No verification provider is configured; an address would be a pattern guess." };

R.audience_overlap = { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null,
  observed_at: null, reason: "Requires the company's own stated audience, read off their site or a media kit. Inferring it from the product category is how a pitch ends up claiming an overlap the sponsor does not recognise." };

R.budget_signal = { value: null, state: "unknown", confidence: "Unknown", source: null, source_url: null,
  observed_at: null, reason: "Requires a dated activation at a known scale. Absence is unknown, never 'no budget'." };

R.compliance_flags = subject.draft_gate === "blocked_compliance"
  ? { value: [subject.draft_gate_reason], state: "retrieved", confidence: "Verified",
      source: subject.draft_gate_source ?? "exclusions_file", source_url: null, observed_at: now }
  : field(null, null, null);

R.changes_since_last = { value: [], state: "baseline", confidence: "Unknown", source: null, source_url: null,
  observed_at: now, reason: "First observation; a change list needs a prior accepted run." };

dossier.brand = {
  domain: brand?.domain ?? null,
  description: brand?.description ?? null,
  industries_eic: brand?.industries?.eic ?? [],
  naics: ok("02-naics")?.codes ?? [],
  sic: ok("03-sic")?.codes ?? [],
  socials: Object.fromEntries((brand?.socials ?? []).map((s) => [s.type, s.url])),
  hq_address: brand?.address ?? null,
  logo_url: brand?.logos?.[0]?.url ?? null,
  palette: brand?.colors ?? [],
  screenshot_url: ok("07-screenshot")?.screenshot ?? null,
  typography: ok("08-styleguide")?.styleguide?.typography ?? null,
};

dossier.activation_evidence = {
  signals: signal.source_url ? [{
    type: signal.signal_type ?? null, summary: signal.summary ?? null, quote: signal.quote ?? null,
    date: signal.signal_date ?? null, event: signal.event_named ?? null,
    source_url: signal.source_url, eligible: signal.reason_eligible === true,
  }] : [],
  most_recent_dated: signal.signal_date ?? null,
  cadence_note: null,
  spend_band_observed: signal.scale_claim ?? null,
};

dossier.conflict_check = {
  competitor_sponsors_named: signal.competitor_conflicts ?? [],
  category_exclusivity_risk: null,
  already_in_motion_state: subject.exclusion_check ?? "unverified_against_rule",
  checked_against: cohort.exclusions_file ? [cohort.exclusions_file] : [],
};

// ---- the packet ------------------------------------------------------------
const packet = await read("templates/packet.template.json");
Object.assign(packet, {
  stage: "assembled",
  client: "Trifecta Marketing — Nocturnal Valley",
  objective: "Source festival sponsors. One target taken to the limit of public evidence.",
  generated_at: now,
  source_mode: summary.status === "complete" ? "contextdev_live" : summary.status,
  scope: {
    rows_in: cohort.rows ?? null,
    accepted: cohort.accepted ?? null,
    rejected: cohort.rejected ?? null,
    draftable: cohort.draftable ?? null,
    blocked_compliance: cohort.blocked_compliance ?? null,
    unique_companies: 1,
    planned_calls: summary.calls?.length ?? 0,
    credit_budget: summary.planned_credits ?? null,
    credits_spent: summary.credits_spent ?? null,
  },
  excluded: (cohort.blocked ?? []).map((b) => ({ company: b.company, category: b.category, reason: (b.problems ?? []).join("; ") })),
  sponsors: [dossier],
  festival: {
    event_name: festival.event_name,
    dates: `${festival.dates.start} to ${festival.dates.end}`,
    venue: festival.venue.name,
    market: festival.venue.market,
    audience: festival.audience,
    attendance_state: festival.attendance.state,
    attendance_claims: festival.attendance.claims,
    packages_range: festival.packages.range,
    rate_card: festival.packages.rate_card ?? [],
    inventory_state: festival.packages.inventory_state,
    commercial_target: festival.commercial_target,
    window: festival.window,
    source_materials: festival.source_materials,
  },
  context_operations: (summary.calls ?? []).map((c) => ({
    sponsor_id: dossier.id,
    capability: c.capability,
    method: c.method,
    endpoint: `https://api.context.dev/v1${c.endpoint ?? c.path}`,
    status: c.status,
    http_status: c.http_status ?? null,
    credits: c.credits ?? null,
    receipt: c.receipt ?? null,
    write_policy: "artifact_only_no_send",
  })),
  data_health: {
    field_coverage_pct: Math.round(Object.values(R).filter((x) => x.state === "retrieved").length / Object.keys(R).length * 100),
    null_rates: {},
    conflicts: festival.attendance.state === "disputed" ? 1 : 0,
    identity_resolution_pct: brand ? 100 : 0,
    quarantined: cohort.rejected ?? 0,
  },
  open_gates: [
    { gate: "paying_buyer", state: "unresolved", note: "Who pays Opulent was never established." },
    { gate: "budget", state: "unresolved", note: "No project budget or proposed price." },
    { gate: "approval_path", state: "unresolved", note: "No approval or signing path named." },
    { gate: "sponsor_exclusions", state: "unresolved", note: "Category rules and the three sponsors already in motion were never supplied. Every target is unverified against this rule." },
    { gate: "sponsorship_inventory", state: "unresolved", note: "No inventory, so a draft cannot name what a sponsor receives." },
    { gate: "attendance_figure", state: "disputed", note: festival.attendance.reason },
    { gate: "sender_account", state: "unresolved", note: festival.sender.authority_reason },
    { gate: "acceptance_criteria", state: "unresolved", note: "No agreed measure of a successful demonstration." },
  ],
  unknowns: Object.entries(R).filter(([, v]) => v.state === "unknown").map(([k, v]) => `${k}: ${v.reason ?? "not retrieved"}`),
});

await mkdir(resolve("artifacts"), { recursive: true });
await writeFile(resolve("artifacts/dossier.json"), JSON.stringify(dossier, null, 2) + "\n");
await writeFile(resolve("artifacts/packet.json"), JSON.stringify(packet, null, 2) + "\n");

console.log(`artifacts/dossier.json  ${dossier.company ?? "(no subject)"} · coverage ${packet.data_health.field_coverage_pct}%`);
console.log(`artifacts/packet.json   ${packet.context_operations.length} operations · ${packet.unknowns.length} unknowns · ${packet.open_gates.filter((g) => g.state !== "resolved").length} open gates`);
if (dossier.gates.draft_gate === "blocked_compliance") {
  console.log(`\ndraft gate: BLOCKED — ${dossier.gates.draft_gate_reason}`);
}
console.log("Still yours to write: fit.band, fit.rationale, outreach.reason_to_engage, subject, preview_text.");
