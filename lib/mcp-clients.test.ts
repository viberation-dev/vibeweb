import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

import {
  localMcpClients,
  mcpClientLabel,
  mcpConfigPath,
  mcpConfigSnippet,
  mcpConnectCommand,
  mcpConnectTabs,
  mcpInstallCommand,
  mcpInstallTabs,
  mcpRemoteSnippet,
  remoteMcpClients,
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

test("remote support is stated for every client, including that it differs", () => {
  // The two hosted clients take a remote server through the steps they
  // already carry; every local one either says how or says null.
  for (const client of MCP_CLIENTS) {
    if (client.kind === "hosted") {
      assert.ok(client.steps.length > 0, client.id);
      continue;
    }
    assert.ok("remote" in client, `${client.id} does not say whether it takes a remote server`);
  }
  // Every client in this matrix can take one, which is the headline: a remote
  // server works in places a local one cannot.
  assert.equal(remoteMcpClients().length, MCP_CLIENTS.length);
  assert.ok(remoteMcpClients().some((client) => client.id === "chatgpt"));
});

test("the URL field is spelled three different ways", () => {
  const url = "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true";

  // Cursor: a bare url.
  assert.deepEqual(JSON.parse(mcpRemoteSnippet("cursor", "supabase", url).code), {
    mcpServers: { supabase: { url } },
  });
  // VS Code: a typed entry under its own key.
  assert.deepEqual(JSON.parse(mcpRemoteSnippet("vs-code", "supabase", url).code), {
    servers: { supabase: { type: "http", url } },
  });
  // Antigravity: serverUrl, and its docs say url and httpUrl are not accepted.
  assert.deepEqual(JSON.parse(mcpRemoteSnippet("antigravity", "supabase", url).code), {
    mcpServers: { supabase: { serverUrl: url } },
  });
  // Gemini CLI: httpUrl, because `url` there means SSE.
  assert.deepEqual(JSON.parse(mcpRemoteSnippet("gemini-cli", "supabase", url).code), {
    mcpServers: { supabase: { httpUrl: url } },
  });
  // opencode: its own type, and `remote` rather than `http`.
  assert.deepEqual(JSON.parse(mcpRemoteSnippet("opencode", "supabase", url).code), {
    mcp: { supabase: { type: "remote", url } },
  });

  // A client that takes a remote server by command or settings screen has no
  // config snippet to show, and says so rather than inventing one.
  assert.throws(() => mcpRemoteSnippet("claude-code", "s", url), /no remote config file/);
  assert.throws(() => mcpRemoteSnippet("claude-desktop", "s", url), /no remote config file/);
});

test("remote add commands put the flag where that client wants it", () => {
  const url = "https://mcp.stripe.com";
  assert.equal(
    mcpConnectCommand("claude-code", "stripe", url),
    "claude mcp add --transport http stripe https://mcp.stripe.com",
  );
  // Codex takes the URL as a flag after the name, not a transport before it.
  assert.equal(
    mcpConnectCommand("codex", "stripe", url),
    "codex mcp add stripe --url https://mcp.stripe.com",
  );
  assert.equal(mcpConnectCommand("cursor", "stripe", url), null);
});

test("connect tabs cover every client, and the URL is always copyable", () => {
  const url = "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF";
  const tabs = mcpConnectTabs({ server: "supabase", url });

  assert.equal(tabs.label, "Connect it in");
  assert.deepEqual(
    tabs.tabs.map((tab) => tab.key),
    MCP_CLIENTS.map((client) => client.id),
  );

  for (const tab of tabs.tabs) {
    const code = tab.blocks.filter((block) => block.kind === "code");
    assert.equal(code.length, 1, `${tab.key} should offer exactly one thing to copy`);
    assert.ok(code[0].code.includes(url), `${tab.key} never shows the server's URL`);
  }
});

test("Claude Desktop changes route between a local and a remote server", () => {
  // The finding this field exists for: a config file for one, a settings
  // screen for the other, in the same client.
  const local = mcpInstallTabs({ server: "x", command: "npx x", clients: ["claude-desktop"] });
  assert.ok(local.tabs[0].blocks.some((b) => b.kind === "code" && b.language === "json"));

  const remote = mcpConnectTabs({ server: "x", url: "https://x.example/mcp", clients: ["claude-desktop"] });
  assert.match((remote.tabs[0].blocks[0] as { body: string }).body, /^1\. .*Connectors/);
});

test("every generated install block in a migration names real clients", () => {
  // Where an authoring typo fails: in CI, not in a visitor's page. The
  // renderer drops an unknown id to keep the guide up, so this is the check
  // that it was never unknown in the first place.
  const dir = new URL("../supabase/migrations/", import.meta.url);
  const sql = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .map((name) => readFileSync(new URL(name, dir), "utf8"))
    .join("\n");

  /*
   * Every `clients` list in any migration, in either authoring form —
   * `'clients', jsonb_build_array(...)` or a `"clients": [...]` in a JSON
   * literal. `clients` belongs to mcp_install and mcp_connect and nothing
   * else, so matching the key alone needs no block-shaped regex that would
   * quietly stop matching the day someone authors one differently.
   */
  const lists = [...sql.matchAll(/['"]clients['"],?\s*(?:jsonb_build_array\(|\[)([^)\]]*)/g)];

  for (const [, list] of lists) {
    for (const [, id] of list.matchAll(/'([a-z0-9-]+)'|"([a-z0-9-]+)"/g)) {
      assert.ok(toMcpClient(id), `${id} is in a migration but not in MCP_CLIENTS`);
    }
  }
});
