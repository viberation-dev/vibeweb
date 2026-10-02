import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import {
  agentsMdLine,
  codingCliLabel,
  CODING_CLI_IDS,
  CODING_CLIS,
  instructionFilesFor,
  toCodingCli,
} from "./coding-clis.ts";
import { MCP_CLIENTS } from "./mcp-clients.ts";

test("ids are unique, kebab-case tab keys", () => {
  assert.equal(new Set(CODING_CLI_IDS).size, CODING_CLI_IDS.length);
  for (const id of CODING_CLI_IDS) assert.match(id, /^[a-z0-9-]+$/);
});

test("every CLI points at its vendor's docs over https", () => {
  for (const cli of CODING_CLIS) assert.match(cli.docs, /^https:\/\//, cli.id);
});

test("global config is home-relative, project instructions are a bare filename", () => {
  for (const cli of CODING_CLIS) {
    assert.ok(cli.globalConfig.startsWith("~/"), `${cli.id} global config is not home-relative`);
    if (cli.projectInstructions !== null) {
      // A path, not a filename, would mean it is not read from the repo root.
      assert.ok(!cli.projectInstructions.includes("/"), `${cli.id} project instructions`);
    }
    if (cli.personalInstructions !== null) {
      assert.ok(
        cli.personalInstructions.startsWith(cli.globalConfig),
        `${cli.id} personal instructions sit outside its own config directory`,
      );
    }
  }
});

test("anything other than plain AGENTS.md support is explained", () => {
  // "reads" needs no note. Every other state is a surprise to the reader, and
  // an unexplained one sends them to the vendor's docs, which is the thing
  // this file exists to save them.
  for (const cli of CODING_CLIS) {
    if (cli.agentsMd !== "reads") {
      assert.ok(cli.note, `${cli.id} is ${cli.agentsMd} on AGENTS.md with no note`);
    }
  }
});

test("the AGENTS.md line names the competing file", () => {
  assert.equal(agentsMdLine("codex"), "Reads it.");
  assert.equal(agentsMdLine("claude-code"), "Reads it only where there is no CLAUDE.md.");
  assert.equal(
    agentsMdLine("gemini-cli"),
    "Reads GEMINI.md instead, unless you name AGENTS.md in its config.",
  );
  assert.equal(agentsMdLine("aider"), "Does not read it.");
});

test("how many instruction files a repo actually needs", () => {
  // The three AGENTS.md readers collapse into one file.
  assert.deepEqual(instructionFilesFor(["codex", "opencode", "qwen-code"]), ["AGENTS.md"]);
  // Claude Code does not, because its own file wins where both exist.
  assert.deepEqual(instructionFilesFor(["codex", "claude-code"]), ["AGENTS.md", "CLAUDE.md"]);
  assert.deepEqual(instructionFilesFor([]), []);
});

test("narrowing and labels", () => {
  assert.equal(toCodingCli("opencode"), "opencode");
  assert.equal(toCodingCli("OpenCode"), undefined);
  assert.equal(toCodingCli(null), undefined);
  assert.equal(codingCliLabel("gemini-cli"), "Gemini CLI");
});

test("ids shared with MCP_CLIENTS agree on the client", () => {
  // Four of these take MCP servers and appear in both files. The same id
  // meaning two different tools across the matrices is the drift that would
  // put the wrong config path in a guide.
  const shared = MCP_CLIENTS.filter((client) => toCodingCli(client.id));
  assert.deepEqual(
    shared.map((client) => client.id).sort(),
    ["claude-code", "codex", "gemini-cli", "opencode"],
  );
  for (const client of shared) {
    assert.equal(client.label, codingCliLabel(client.id as never), client.id);
  }
});

test("every CLI listed here is a tool in the directory", () => {
  // The ids are directory slugs. One that nothing inserts is a CLI we
  // document and do not list, which is a guide linking to a 404. The early
  // rows come from seed.sql and the later ones from their own migration, so
  // both are searched.
  const migrations = new URL("../supabase/migrations/", import.meta.url);
  const sql = [
    readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8"),
    ...readdirSync(migrations)
      .filter((name) => name.endsWith(".sql"))
      .map((name) => readFileSync(new URL(name, migrations), "utf8")),
  ].join("\n");

  for (const id of CODING_CLI_IDS) {
    assert.ok(sql.includes(`'${id}'`), `${id} is not inserted by seed.sql or any migration`);
  }
});
