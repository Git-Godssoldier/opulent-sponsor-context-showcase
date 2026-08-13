#!/usr/bin/env node
/**
 * validate_packet.mjs — enforce the packet contract.
 *
 *   node scripts/validate_packet.mjs [artifacts/packet.json]
 *
 * Exits non-zero on anything a reader could mistake for a stronger claim than the run
 * actually made. The checks are deliberately blunt: a validator that warns gets ignored.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const target = resolve(process.cwd(), process.argv[2] ?? "artifacts/packet.json");
const packet = JSON.parse(await readFile(target, "utf8"));
const failures = [];

const check = (condition, message) => { if (!condition) failures.push(message); };

// ---- shape -----------------------------------------------------------------
check(packet.schema_version === "1.0.0", "schema_version must be 1.0.0");
check(["contextdev_live", "dry_run", "blocked_missing_credentials"].includes(packet.source_mode),
  `invalid source_mode: ${packet.source_mode}`);
check((packet.sponsors?.length ?? 0) > 0, "the packet must carry at least one sponsor");
check((packet.context_operations?.length ?? 0) > 0, "the packet must carry an operation ledger");
check(Array.isArray(packet.open_gates), "open_gates must be present, even when empty");

// The ten fields a sponsor pass must return. A field absent from the packet is worse
// than one present and unknown: the reader cannot tell "we looked and found nothing"
// from "we never looked".
const REQUIRED_FIELDS = [
  "category_fit", "activation_history", "audience_overlap", "regional_presence",
  "budget_signal", "decision_maker", "decision_maker_title", "contact_route",
  "compliance_flags", "changes_since_last",
];

const exclusionGateResolved = (packet.open_gates ?? [])
  .some((g) => g.gate === "sponsor_exclusions" && g.state === "resolved");

const domains = new Set();
for (const s of packet.sponsors ?? []) {
  const id = s.id ?? "(unnamed)";
  check(Boolean(s.domain), `${id}: no domain`);
  check(!/^https?:|^www\./.test(s.domain ?? ""), `${id}: domain must be bare — got ${s.domain}`);
  check(!domains.has(s.domain), `${id}: duplicate domain`);
  domains.add(s.domain);

  const fields = s.required_fields ?? {};
  for (const name of REQUIRED_FIELDS) {
    check(Boolean(fields[name]), `${id}: missing required field "${name}"`);
    check(typeof fields[name]?.state === "string", `${id}: field "${name}" has no state`);
  }

  // Showcase mode publishes the contact state machine, never a real route.
  check(fields.contact_route?.value === null, `${id}: contact_route must stay null in showcase mode`);

  // Verified always carries the page it came from.
  for (const [name, f] of Object.entries(fields)) {
    check(f?.confidence !== "Verified" || Boolean(f?.source_url) || name === "compliance_flags",
      `${id}: field "${name}" is Verified with no source_url`);
  }

  // Absence never implies a negative. Only dated evidence sets one.
  for (const name of ["activation_history", "budget_signal", "audience_overlap"]) {
    check(fields[name]?.value !== false || fields[name]?.state === "retrieved",
      `${id}: ${name} may only be false with retrieved evidence`);
  }

  // A compliance-blocked target never carries a draft.
  if (s.gates?.draft_gate === "blocked_compliance") {
    check(!s.outreach?.draft_html_path && !s.outreach?.draft_text_path,
      `${id}: blocked on compliance but carries a draft path`);
    check(!s.outreach?.subject, `${id}: blocked on compliance but carries a subject line`);
  }

  // Clearance is only available once the gate that supplies it is resolved. While the
  // client's exclusion list is outstanding, `clear` is a claim nobody is in a position to
  // make, and it is the field most likely to be flipped to make a run look finished.
  const state = s.conflict_check?.already_in_motion_state ?? "";
  check(["clear", "unverified_against_rule"].includes(state),
    `${id}: already_in_motion_state must be clear or unverified_against_rule`);
  if (state === "clear") {
    check(exclusionGateResolved,
      `${id}: already_in_motion_state is "clear" while the sponsor_exclusions gate is unresolved — nobody has the list to clear it against`);
  }

  // Nothing leaves as sent.
  check((s.outreach?.send_state ?? "draft_only_not_sent") === "draft_only_not_sent",
    `${id}: send_state must be draft_only_not_sent`);
}

// ---- operation ledger ------------------------------------------------------
for (const op of packet.context_operations ?? []) {
  check(/^https:\/\/api\.context\.dev\/v1\//.test(op.endpoint ?? ""), `${op.capability}: endpoint is not a Context.dev v1 path`);
  check(op.write_policy === "artifact_only_no_send", `${op.capability}: unsafe write policy`);
  check(op.status !== "executed" || Boolean(op.receipt), `${op.capability}: executed operation has no receipt`);
  check(["executed", "failed", "proposed", "dry_run", "blocked_missing_credentials", "blocked_endpoint_access"].includes(op.status),
    `${op.capability}: unknown status "${op.status}"`);
}

// ---- the festival ----------------------------------------------------------
const fest = packet.festival ?? {};
check(Boolean(fest.event_name), "festival.event_name missing");
if (fest.attendance_state === "disputed") {
  check((fest.attendance_claims?.length ?? 0) >= 2,
    "attendance is disputed but fewer than two claims are recorded");
  const serializedMessages = JSON.stringify(packet.messages ?? []);
  check(!/\b(20,?000|7,?500|22,?500)\b/.test(serializedMessages),
    "a disputed attendance figure appears in a drafted message");
}
const tierNames = (fest.rate_card ?? []).map((t) => String(t.tier).toLowerCase());
for (const m of packet.messages ?? []) {
  if (m.package_named) {
    check(tierNames.some((n) => String(m.package_named).toLowerCase().includes(n)),
      `message names a package that is not a rate-card tier: ${m.package_named}`);
  }
}

// ---- secrets ---------------------------------------------------------------
const serialized = JSON.stringify(packet).toLowerCase();
for (const forbidden of ["bearer ctxt_", "context_dev_api_key", "authorization\":\"bearer"]) {
  check(!serialized.includes(forbidden), `forbidden token marker in packet: ${forbidden}`);
}

if (failures.length) {
  process.stderr.write(`${JSON.stringify({ status: "failed", target, failures }, null, 2)}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`${JSON.stringify({
    status: "valid", target,
    sponsors: packet.sponsors.length,
    operations: packet.context_operations.length,
    open_gates: (packet.open_gates ?? []).filter((g) => g.state !== "resolved").length,
  }, null, 2)}\n`);
}
