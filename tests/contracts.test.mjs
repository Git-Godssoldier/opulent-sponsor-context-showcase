import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import test from "node:test";

const dossierTemplate = JSON.parse(await readFile(resolve("templates/sponsor-dossier.template.json"), "utf8"));
const packetTemplate = JSON.parse(await readFile(resolve("templates/packet.template.json"), "utf8"));
const festival = JSON.parse(await readFile(resolve("fixtures/festival-packet.json"), "utf8"));

const REQUIRED_FIELDS = [
  "category_fit", "activation_history", "audience_overlap", "regional_presence",
  "budget_signal", "decision_maker", "decision_maker_title", "contact_route",
  "compliance_flags", "changes_since_last",
];

const run = (script, args, opts = {}) =>
  execFileSync("node", [script, ...args], { encoding: "utf8", ...opts });

/* ---------------- templates ---------------- */

test("the dossier template declares all ten required fields", () => {
  for (const name of REQUIRED_FIELDS) {
    assert.ok(dossierTemplate.required_fields[name], `missing ${name}`);
    assert.equal(dossierTemplate.required_fields[name].state, "pending_retrieval");
  }
  assert.equal(Object.keys(dossierTemplate.required_fields).length, REQUIRED_FIELDS.length);
});

test("every template field carries the six-key envelope", () => {
  for (const [name, f] of Object.entries(dossierTemplate.required_fields)) {
    for (const key of ["value", "state", "confidence", "source", "source_url", "observed_at"]) {
      assert.ok(key in f, `${name} is missing ${key}`);
    }
  }
});

test("the template ships nothing sendable", () => {
  assert.equal(dossierTemplate.outreach.send_state, "draft_only_not_sent");
  assert.equal(dossierTemplate.outreach.sender_authority, "unconfirmed");
  assert.equal(dossierTemplate.outreach.subject, null);
  assert.equal(dossierTemplate.operation.write_policy, "artifact_only_no_send");
});

test("the packet template is empty and carries an open_gates slot", () => {
  assert.equal(packetTemplate.sponsors.length, 0);
  assert.equal(packetTemplate.messages.length, 0);
  assert.ok(Array.isArray(packetTemplate.open_gates));
});

/* ---------------- the festival packet ---------------- */

test("attendance is disputed and carries both client claims", () => {
  assert.equal(festival.attendance.state, "disputed");
  assert.equal(festival.attendance.value, null);
  assert.ok(festival.attendance.claims.length >= 2);
  for (const c of festival.attendance.claims) assert.ok(c.source && c.source_date);
});

test("the sponsorship inventory is unsupplied, so no package can be named", () => {
  assert.equal(festival.packages.inventory, null);
  assert.equal(festival.packages.inventory_state, "unsupplied");
});

test("sender authority is unconfirmed", () => {
  assert.equal(festival.sender.authority_state, "unconfirmed");
});

/* ---------------- the target loader ---------------- */

function cohortFrom(targetsCsv, exclusionsCsv) {
  const dir = mkdtempSync(join(tmpdir(), "sponsor-"));
  const t = join(dir, "t.csv");
  const x = join(dir, "x.csv");
  const out = join(dir, "cohort.json");
  writeFileSync(t, targetsCsv);
  writeFileSync(x, exclusionsCsv);
  run("scripts/load_targets.mjs", [t, "--exclusions", x, "--out", out]);
  return JSON.parse(readFileSync(out, "utf8"));
}

const EXCLUSIONS = [
  "pattern,scope,reason,supplied_by,dated",
  ',already_in_motion,"Names never supplied.",unsupplied,',
  'cannabis,compliance,"Age and compliance limits.",client_email,2026-08-11',
].join("\n");

test("a rule row beginning with an empty cell still parses", () => {
  // The regex parser this replaced returned five empty strings here, which silently
  // disabled every unsupplied rule. A gate that fails open is worse than no gate.
  const cohort = cohortFrom(
    "company,category,domain,region_fit,note\nAcme,beer,acme.com,midwest,\n",
    EXCLUSIONS,
  );
  assert.equal(cohort.unverified_against_rule, 1);
  assert.equal(cohort.targets[0].exclusion_check, "unverified_against_rule");
});

test("a row without a bare domain is rejected, never resolved", () => {
  const cohort = cohortFrom(
    "company,category,domain,region_fit,note\nAcme,beer,,midwest,\nBeta,beer,https://beta.com,midwest,\n",
    EXCLUSIONS,
  );
  assert.equal(cohort.accepted, 0);
  assert.equal(cohort.rejected, 2);
  assert.match(cohort.blocked[1].problems[0], /not bare/);
});

test("a banned category is admitted for research and blocked from drafting", () => {
  const cohort = cohortFrom(
    "company,category,domain,region_fit,note\nGreen,cannabis,,missouri,\n",
    EXCLUSIONS,
  );
  // Compliance settles the row without a domain, so it is not sent back for one.
  assert.equal(cohort.accepted, 1);
  assert.equal(cohort.blocked_compliance, 1);
  assert.equal(cohort.targets[0].draft_gate, "blocked_compliance");
});

/* ---------------- the call plan ---------------- */

test("the plan omits the decision-maker call when no profile URL is supplied", () => {
  // Run from a scratch cwd: the script writes its dry-run summary beside itself.
  const out = run(resolve("scripts/run_calls.mjs"),
    ["--domain", "acme.com", "--company", "Acme", "--dry-run"],
    { cwd: mkdtempSync(join(tmpdir(), "calls-")) });
  assert.ok(!out.includes("/people/retrieve"));
  assert.match(out, /decision maker call omitted, not guessed/);
});

test("the plan includes the decision-maker call when one is supplied", () => {
  const out = run(resolve("scripts/run_calls.mjs"),
    ["--domain", "acme.com", "--company", "Acme",
     "--linkedin-url", "https://www.linkedin.com/in/example-person", "--dry-run"],
    { cwd: mkdtempSync(join(tmpdir(), "calls-")) });
  assert.match(out, /\/people\/retrieve/);
});

test("naics and sic take input, while styleguide takes domain", async () => {
  const src = await readFile(resolve("scripts/run_calls.mjs"), "utf8");
  assert.match(src, /path: "\/web\/naics",\s*\n\s*query: \{ input:/);
  assert.match(src, /path: "\/web\/sic",\s*\n\s*query: \{ input:/);
  assert.match(src, /path: "\/web\/styleguide",\s*\n\s*query: \{ domain \}/);
});

test("a non-bare domain is refused before any call is planned", () => {
  assert.throws(() => run(resolve("scripts/run_calls.mjs"),
    ["--domain", "https://acme.com", "--company", "Acme", "--dry-run"],
    { cwd: mkdtempSync(join(tmpdir(), "calls-")), stdio: "pipe" }));
});

test("a decision-maker URL that is not an exact profile is refused", () => {
  assert.throws(() => run(resolve("scripts/run_calls.mjs"),
    ["--domain", "acme.com", "--company", "Acme",
     "--linkedin-url", "https://linkedin.com/company/acme", "--dry-run"],
    { cwd: mkdtempSync(join(tmpdir(), "calls-")), stdio: "pipe" }));
});
