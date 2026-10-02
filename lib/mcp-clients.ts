/*
 * MCP clients and how a server gets into each.
 *
 * The MCP half of what lib/skill-taxonomy.ts already does for skills. Before
 * this, every guide hand-copied its own install tabs — the Playwright and
 * Supabase guides each carry their own copy of the same three commands, which
 * is two places to fix when a vendor moves a path and one of them gets missed.
 *
 * Pure and alias-free so it runs under plain `node --test`, like
 * lib/skill-taxonomy.ts and lib/ai-launchers.ts.
 *
 * Every path, key and command below was checked against the vendor's own docs
 * on 2026-10-02 (links in `docs`). Re-check before editing: this file is the
 * reason guide rows no longer carry install facts of their own, so a stale
 * entry here is stale everywhere at once.
 */

/**
 * How a server gets in.
 *
 * `local` clients run the server on your machine, so they have config files
 * and sometimes a command that writes them for you. `hosted` clients take
 * remote servers through their own settings screen and cannot run a local one
 * at all — the same split as `folder` vs `upload` in SKILL_AGENTS, and it
 * exists for the same reason: pretending the clients are symmetric is what
 * makes a guide tell a ChatGPT user to run npx.
 */
export type McpClient =
  | {
      id: string;
      label: string;
      kind: "local";
      /**
       * The command that adds a server for you, as a template. Null when the
       * only route is editing the file by hand — four of these clients have no
       * add command, and inventing one is worse than saying so.
       */
      addCommand: string | null;
      /**
       * Config file covering every project, exactly as the vendor writes it.
       * Null when the client has no documented path and routes you through a
       * menu command instead (VS Code).
       */
      personalPath: string | null;
      /** Same file on Windows, only where it differs from `personalPath`. */
      personalPathWindows?: string;
      /**
       * Config file for one project, relative to its root. Null when the
       * client has no project scope — which is a real answer, not a gap.
       */
      projectPath: string | null;
      /** Top-level key inside that file. Four clients, four spellings. */
      configKey: "mcpServers" | "servers" | "mcp" | "mcp_servers";
      note?: string;
      docs: string;
    }
  | {
      id: string;
      label: string;
      kind: "hosted";
      steps: readonly string[];
      note?: string;
      docs: string;
    };

export const MCP_CLIENTS = [
  {
    id: "claude-code",
    label: "Claude Code",
    kind: "local",
    addCommand: "claude mcp add <name> -- <command> [args...]",
    personalPath: "~/.claude.json",
    projectPath: ".mcp.json",
    configKey: "mcpServers",
    note: "Three scopes: --scope local (the default, this project and only you), --scope project (writes .mcp.json for you to commit), --scope user (every project on your machine).",
    docs: "https://code.claude.com/docs/en/mcp",
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    kind: "local",
    addCommand: null,
    personalPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
    personalPathWindows: "%APPDATA%\\Claude\\claude_desktop_config.json",
    // One config for the whole app: a desktop app has no open project, so
    // there is nothing for a project scope to be scoped to.
    projectPath: null,
    configKey: "mcpServers",
    note: "Settings > Developer > Edit Config opens this file. Many servers also ship as a one-click Desktop Extension under Settings > Extensions, which is the easier route when one exists. Restart the app fully after editing.",
    docs: "https://modelcontextprotocol.io/docs/develop/connect-local-servers",
  },
  {
    id: "claude-ai",
    label: "Claude.ai",
    kind: "hosted",
    steps: [
      "Open Settings > Connectors.",
      "Add a remote server by its https:// URL, then authorise it.",
    ],
    note: "The browser cannot run a server on your machine. A local server needs Claude Desktop or Claude Code.",
    docs: "https://support.claude.com/en/articles/11175166-about-custom-connectors-remote-mcp",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    kind: "hosted",
    steps: [
      "Enable developer mode in Settings, then add a connector by its https:// URL.",
    ],
    note: "Remote servers only. For a local one, use Codex.",
    docs: "https://learn.chatgpt.com/docs/extend/mcp",
  },
  {
    id: "codex",
    label: "Codex",
    kind: "local",
    addCommand: "codex mcp add <name> -- <command> [args...]",
    personalPath: "~/.codex/config.toml",
    projectPath: ".codex/config.toml",
    configKey: "mcp_servers",
    note: "TOML, not JSON: servers are [mcp_servers.<name>] tables. Project config applies in trusted projects. Pass secrets with --env KEY=VALUE rather than writing them into the file.",
    docs: "https://learn.chatgpt.com/docs/extend/mcp?surface=cli",
  },
  {
    id: "cursor",
    label: "Cursor",
    kind: "local",
    addCommand: null,
    personalPath: "~/.cursor/mcp.json",
    projectPath: ".cursor/mcp.json",
    configKey: "mcpServers",
    note: "Added through Settings > MCP, or by writing the file yourself. The panel writes the same JSON either way.",
    docs: "https://cursor.com/docs/context/mcp",
  },
  {
    /*
     * `vs-code`, not `github-copilot` as in SKILL_AGENTS. Skills live in
     * `.github/skills` and belong to Copilot; MCP config is VS Code's own
     * `.vscode/mcp.json`, and `vs-code` is already the tab key both existing
     * guides use.
     */
    id: "vs-code",
    label: "VS Code",
    kind: "local",
    addCommand: 'code --add-mcp \'{"name":"<name>","command":"<command>","args":["<arg>"]}\'',
    // No documented user-profile path — the vendor routes you through the
    // command palette, so naming a path here would be a guess.
    personalPath: null,
    projectPath: ".vscode/mcp.json",
    configKey: "servers",
    note: "`servers`, not `mcpServers`, in .vscode/mcp.json. `code --add-mcp` writes your user profile instead; for the profile file, run MCP: Open User Configuration from the command palette. A root .mcp.json is also read, and that one uses mcpServers.",
    docs: "https://code.visualstudio.com/docs/copilot/customization/mcp-servers",
  },
  {
    id: "antigravity",
    label: "Antigravity",
    kind: "local",
    addCommand: null,
    personalPath: "~/.gemini/config/mcp_config.json",
    projectPath: ".agents/mcp_config.json",
    configKey: "mcpServers",
    note: "Type /mcp in the prompt panel to open the MCP manager, reload config and read connection logs.",
    docs: "https://antigravity.google/docs/mcp",
  },
  {
    id: "gemini-cli",
    label: "Gemini CLI",
    kind: "local",
    addCommand: "gemini mcp add <name> <commandOrUrl> [args...]",
    personalPath: "~/.gemini/settings.json",
    projectPath: ".gemini/settings.json",
    configKey: "mcpServers",
    note: "Takes -s/--scope to choose which settings file it writes. The MCP block shares the file with every other Gemini CLI setting, so edit it rather than replacing it.",
    docs: "https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html",
  },
  {
    id: "opencode",
    label: "opencode",
    kind: "local",
    addCommand: null,
    personalPath: "~/.config/opencode/opencode.json",
    projectPath: "opencode.json",
    configKey: "mcp",
    note: 'Its own shape, not the mcpServers one: `"mcp": { "<name>": { "type": "local", "command": ["npx", "-y", "<package>"] } }`, with the command as an array. Project config is found by walking up to the nearest git root.',
    docs: "https://opencode.ai/docs/mcp-servers/",
  },
] as const satisfies readonly McpClient[];

export type McpClientId = (typeof MCP_CLIENTS)[number]["id"];

export const MCP_CLIENT_IDS: readonly McpClientId[] = MCP_CLIENTS.map((client) => client.id);

/** Narrows an untrusted string — a tab key, a `?client=` — to a real client. */
export function toMcpClient(value: string | null | undefined): McpClientId | undefined {
  return MCP_CLIENT_IDS.find((id) => id === value);
}

export function mcpClientLabel(id: McpClientId): string {
  return MCP_CLIENTS.find((client) => client.id === id)!.label;
}

/**
 * The clients that can run a server on your machine.
 *
 * What an install guide for a local (stdio) server should tab over: listing
 * Claude.ai beside Cursor and then explaining it does not apply is the kind of
 * tab a reader opens once and distrusts afterwards.
 */
export function localMcpClients(): readonly Extract<McpClient, { kind: "local" }>[] {
  return MCP_CLIENTS.filter((client) => client.kind === "local");
}

/**
 * Where a server goes, in one line, for the given scope.
 *
 * `project` means committed and shared with whoever clones the repo;
 * `personal` means every project but only this machine. Returns null when the
 * client has no such scope, which the caller renders as the real answer
 * ("Claude Desktop has one config for the whole app") rather than hiding.
 */
export function mcpConfigPath(
  id: McpClientId,
  scope: "project" | "personal",
): string | null {
  const client = MCP_CLIENTS.find((c) => c.id === id)!;
  if (client.kind !== "local") return null;
  return scope === "project" ? client.projectPath : client.personalPath;
}
