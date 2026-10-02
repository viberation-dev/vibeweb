import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import {
  localMcpClients,
  mcpClientLabel,
  mcpConfigPath,
  mcpConfigSnippet,
  mcpInstallCommand,
  mcpInstallTabs,
  MCP_CLIENT_IDS,
  MCP_CLIENTS,
  toMcpClient,
} from "./mcp-clients.ts";

test("ids are unique, kebab-case tab keys", () => {
  assert.equal(new Set(MCP_CLIENT_IDS).size, MCP_CLIENT_IDS.length);
  // The tabs block's `key` regex (lib/validation/blocks.ts) — an id that fails
  // it cannot be used as a tab key, which is the whole point of this file.
  for (const id of MCP_CLIENT_IDS) assert.match(id, /^[a-z0-9-]+$/);
});

test("every client points at its vendor's docs over https", () => {
  for (const client of MCP_CLIENTS) assert.match(client.docs, /^https:\/\//, client.id);
});

test("paths are the shape they claim: personal absolute, project relative", () => {
  for (const client of localMcpClients()) {
    if (client.personalPath !== null) {
      assert.ok(
        client.personalPath.startsWith("~/") || client.personalPath.startsWith("%"),
        `${client.id} personal path is neither home-relative nor an env var`,
      );
    }
    if (client.projectPath !== null) {
      assert.ok(
        !client.projectPath.startsWith("/") && !client.projectPath.startsWith("~"),
        `${client.id} project path is not relative to the project root`,
      );
    }
  }
});

test("every local client has at least one documented way in", () => {
  for (const client of localMcpClients()) {
    assert.ok(
      client.addCommand !== null || client.personalPath !== null || client.projectPath !== null,
      `${client.id} has no command and no config file, so the entry says nothing`,
    );
  }
});

test("a missing path or command is explained, never left blank", () => {
  // The failure this guards: a null that reads as "we did not check" when it
  // means "this client genuinely has no project scope".
  for (const client of MCP_CLIENTS) {
    if (client.kind === "hosted") {
      assert.ok(client.steps.length > 0, client.id);
      continue;
    }
    if (client.addCommand === null || client.personalPath === null || client.projectPath === null) {
      assert.ok(client.note, `${client.id} has a null field and no note explaining it`);
    }
  }
});

test("the hosted clients are the ones that cannot run a local server", () => {
  const hosted = MCP_CLIENTS.filter((c) => c.kind === "hosted").map((c) => c.id);
  assert.deepEqual(hosted, ["claude-ai", "chatgpt"]);
  assert.equal(localMcpClients().length, MCP_CLIENTS.length - hosted.length);
});

test("narrowing and labels", () => {
  assert.equal(toMcpClient("cursor"), "cursor");
  assert.equal(toMcpClient("Cursor"), undefined);
  assert.equal(toMcpClient(null), undefined);
  assert.equal(mcpClientLabel("vs-code"), "VS Code");
});

test("config path per scope, with null for a scope the client does not have", () => {
  assert.equal(mcpConfigPath("claude-code", "project"), ".mcp.json");
  assert.equal(mcpConfigPath("cursor", "personal"), "~/.cursor/mcp.json");
  // Claude Desktop has one config for the whole app.
  assert.equal(mcpConfigPath("claude-desktop", "project"), null);
  // VS Code's user profile file is reached by a command, not a path.
  assert.equal(mcpConfigPath("vs-code", "personal"), null);
  // A hosted client has no file at all.
  assert.equal(mcpConfigPath("chatgpt", "project"), null);
});

test("each client's config snippet is in that client's own shape", () => {
  const cmd = "npx @playwright/mcp@latest";

  // The standard JSON shape, and the key that is not mcpServers.
  assert.equal(
    mcpConfigSnippet("cursor", "playwright", cmd).code,
    JSON.stringify(
      { mcpServers: { playwright: { command: "npx", args: ["@playwright/mcp@latest"] } } },
      null,
      2,
    ),
  );
  assert.match(mcpConfigSnippet("vs-code", "playwright", cmd).code, /"servers"/);

  // Codex is TOML, not JSON.
  const codex = mcpConfigSnippet("codex", "playwright", cmd);
  assert.equal(codex.language, "toml");
  assert.equal(
    codex.code,
    '[mcp_servers.playwright]\ncommand = "npx"\nargs = ["@playwright/mcp@latest"]',
  );

  // opencode takes the whole command as one array.
  assert.match(
    mcpConfigSnippet("opencode", "playwright", cmd).code,
    /"command": \[\n\s+"npx",\n\s+"@playwright\/mcp@latest"\n\s+\]/,
  );

  assert.throws(() => mcpConfigSnippet("chatgpt", "playwright", cmd), /takes no local config/);
});

test("add commands fill in the server's name and command", () => {
  const cmd = "npx @playwright/mcp@latest";
  assert.equal(
    mcpInstallCommand("claude-code", "playwright", cmd),
    "claude mcp add playwright -- npx @playwright/mcp@latest",
  );
  // Gemini CLI takes the command as positional arguments, not after a --.
  assert.equal(
    mcpInstallCommand("gemini-cli", "playwright", cmd),
    "gemini mcp add playwright npx @playwright/mcp@latest",
  );
  // VS Code wants one inline JSON object, with the command already split.
  assert.equal(
    mcpInstallCommand("vs-code", "playwright", cmd),
    `code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'`,
  );
  // Null, not a guess, for the four clients that have no add command.
  assert.equal(mcpInstallCommand("cursor", "playwright", cmd), null);
  assert.equal(mcpInstallCommand("claude-ai", "playwright", cmd), null);
});

test("generated install tabs cover every local client, with a command or a config", () => {
  const tabs = mcpInstallTabs({ server: "playwright", command: "npx @playwright/mcp@latest" });

  assert.equal(tabs.kind, "tabs");
  assert.equal(tabs.label, "Install it in");
  // Hosted clients are left out of an install block by default: they cannot
  // run a local server, and a tab saying so is a tab a reader stops trusting.
  assert.deepEqual(
    tabs.tabs.map((tab) => tab.key),
    localMcpClients().map((client) => client.id),
  );

  for (const tab of tabs.tabs) {
    const code = tab.blocks.filter((block) => block.kind === "code");
    assert.equal(code.length, 1, `${tab.key} should offer exactly one thing to copy`);
    assert.ok(code[0].expected, `${tab.key} code block has no expected result`);
    assert.ok(
      tab.blocks.some((block) => block.kind === "text" && /Put it in|no add command/.test(block.body)),
      `${tab.key} never says where the config goes`,
    );
  }
});

test("a named client list is honoured, and an unknown id is dropped not thrown", () => {
  const tabs = mcpInstallTabs({
    server: "supabase",
    command: "npx -y @supabase/mcp-server-supabase@latest",
    label: "Add it to",
    clients: ["cursor", "not-a-client", "claude-code"],
  });

  assert.equal(tabs.label, "Add it to");
  assert.deepEqual(
    tabs.tabs.map((tab) => tab.key),
    ["cursor", "claude-code"],
  );
  // The command keeps its own flags rather than being re-assembled.
  const claude = tabs.tabs.find((tab) => tab.key === "claude-code")!;
  assert.ok(
    claude.blocks.some(
      (block) =>
        block.kind === "code" &&
        block.code === "claude mcp add supabase -- npx -y @supabase/mcp-server-supabase@latest",
    ),
  );
});

test("a hosted client, when one is asked for, says what it can do instead", () => {
  const tabs = mcpInstallTabs({ server: "stripe", command: "n/a", clients: ["chatgpt"] });
  const [tab] = tabs.tabs;

  assert.equal(tab.key, "chatgpt");
  // Numbered steps, and the "remote only" limit as a warning rather than
  // buried in prose.
  assert.match((tab.blocks[0] as { body: string }).body, /^1\. /);
  assert.ok(tab.blocks.some((block) => block.kind === "callout" && block.tone === "warning"));
});

test("every mcp_install block in a migration names real clients", () => {
  // Where an authoring typo fails: in CI, not in a visitor's page. The
  // renderer drops an unknown id to keep the guide up, so this is the check
  // that it was never unknown in the first place.
  const dir = new URL("../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .map((name) => readFileSync(new URL(name, dir), "utf8"))
    .join("\n");

  const blocks = [...sql.matchAll(/"kind":\s*"mcp_install"[\s\S]*?\}/g)];
  for (const [block] of blocks) {
    for (const [, id] of block.matchAll(/"clients":\s*\[([^\]]*)\]/g)) {
      for (const [, one] of id.matchAll(/"([a-z0-9-]+)"/g)) {
        assert.ok(toMcpClient(one), `${one} is in a migration but not in MCP_CLIENTS`);
      }
    }
  }
});

test("the hand-authored install tabs still name clients listed here", () => {
  // The Supabase guide, because it is the one still authoring its own tabs:
  // it connects to a remote HTTP server, which `mcp_install` does not cover.
  // The Playwright guide's tabs are generated from this file as of VIB-217,
  // so there is nothing left there to drift.
  const guide = readFileSync(
    new URL("../supabase/migrations/20260923100000_supabase_mcp_guide.sql", import.meta.url),
    "utf8",
  );
  const label = guide.match(/"label": "Connect it in"[\s\S]*?"tabs": \[([\s\S]*?)\n    \]\}/)![1];
  const keys = [...label.matchAll(/"key": "([a-z0-9-]+)"/g)].map((m) => m[1]);

  assert.ok(keys.length > 0, "no tab keys found — has the guide's block shape changed?");
  for (const key of keys) assert.ok(toMcpClient(key), `${key} is not a client in MCP_CLIENTS`);
});
