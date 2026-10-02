import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  localMcpClients,
  mcpClientLabel,
  mcpConfigPath,
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

test("the shipped guides' install tabs are all clients listed here", () => {
  // Drift check in the direction that matters: the guides are the surface this
  // file exists to feed, so a tab key naming a client we do not list means one
  // of the two is wrong.
  const guide = readFileSync(
    new URL("../supabase/migrations/20260922110000_playwright_mcp_guide.sql", import.meta.url),
    "utf8",
  );
  const label = guide.match(/"label": "Install it in"[\s\S]*?"tabs": \[([\s\S]*?)\n    \]\}/)![1];
  const keys = [...label.matchAll(/"key": "([a-z0-9-]+)"/g)].map((m) => m[1]);

  assert.ok(keys.length > 0, "no tab keys found — has the guide's block shape changed?");
  for (const key of keys) assert.ok(toMcpClient(key), `${key} is not a client in MCP_CLIENTS`);
});
