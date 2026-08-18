/**
 * campaign.mjs — resolve the active campaign and the agency identity.
 *
 * The skill is Trifecta Marketing's; a campaign is one property they are selling.
 * knowledge/agency/ persists across engagements, campaigns/<key>/ swaps per run.
 * With one campaign present it is the default; more than one needs --campaign <key>
 * or CAMPAIGN=<key>, and the error lists what exists rather than guessing.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Load .env once, without a dependency and without overriding a real environment.
 * The file is gitignored and 0600; this repository is public, so a key reaches disk
 * here and nowhere else.
 */
(function loadEnv() {
  const file = resolve(ROOT, ".env");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]]) process.env[m[1]] = value;
  }
})();

export function campaignDir(argv = process.argv) {
  const i = argv.indexOf("--campaign");
  const asked = i !== -1 ? argv[i + 1] : process.env.CAMPAIGN;
  const base = resolve(ROOT, "campaigns");
  const keys = existsSync(base) ? readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name) : [];
  if (asked) {
    if (!keys.includes(asked)) throw new Error(`unknown campaign "${asked}" — have: ${keys.join(", ")}`);
    return { key: asked, dir: resolve(base, asked) };
  }
  if (keys.length === 1) return { key: keys[0], dir: resolve(base, keys[0]) };
  throw new Error(keys.length
    ? `several campaigns exist (${keys.join(", ")}) — pass --campaign <key> or set CAMPAIGN`
    : "no campaigns/ directory — create campaigns/<key>/ per knowledge/agency/trifecta-profile.md");
}

export const agencyDir = () => resolve(ROOT, "knowledge/agency");
export const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
export const sender = () => readJson(resolve(agencyDir(), "sender.json"));
