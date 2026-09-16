/**
 * Where a copied walkthrough prompt can be pasted (VIB-160).
 *
 * A repo constant, not a `tools` query: these are fixed "open the app" links
 * in Ali's chosen order, several (Qwen, DeepSeek, Kimi, Grok) are not in the
 * directory, and a chat link should land on a new chat rather than a
 * marketing page. Ordered by popularity.
 *
 * Alias-free so it runs under plain `node --test`.
 */

export type AiLauncher = {
  name: string;
  url: string;
  /**
   * Query parameter the site reads to pre-fill a new chat. Only set where
   * the site actually honours it; the rest get the prompt on the clipboard.
   */
  prefillParam?: string;
};

export type DesktopLauncher = {
  name: string;
  /** URL scheme the installed app registers, e.g. `vscode://`. */
  appUrl: string;
  /** Where to get it when it is not installed. */
  downloadUrl: string;
};

export const AI_CHATS: readonly AiLauncher[] = [
  { name: "Claude", url: "https://claude.ai/new", prefillParam: "q" },
  { name: "ChatGPT", url: "https://chatgpt.com/", prefillParam: "q" },
  { name: "Qwen", url: "https://chat.qwen.ai" },
  { name: "DeepSeek", url: "https://chat.deepseek.com" },
  { name: "Kimi", url: "https://www.kimi.com" },
  { name: "Grok", url: "https://grok.com/", prefillParam: "q" },
];

export const AI_BUILDERS: readonly AiLauncher[] = [
  { name: "Lovable", url: "https://lovable.dev" },
  { name: "Replit", url: "https://replit.com" },
  { name: "Base44", url: "https://base44.com" },
  { name: "Google AI Studio", url: "https://aistudio.google.com/apps" },
];

/**
 * Editors installed on the visitor's computer, opened through the URL scheme
 * each one registers. A browser cannot tell whether the app is installed, so
 * every entry keeps a download link beside it.
 */
export const DESKTOP_EDITORS: readonly DesktopLauncher[] = [
  { name: "Cursor", appUrl: "cursor://", downloadUrl: "https://cursor.com/download" },
  { name: "VS Code", appUrl: "vscode://", downloadUrl: "https://code.visualstudio.com/download" },
  { name: "Antigravity IDE", appUrl: "antigravity-ide://", downloadUrl: "https://antigravity.google/download" },
  { name: "Antigravity 2.0", appUrl: "antigravity://", downloadUrl: "https://antigravity.google/download" },
];

/** The link a launcher opens, with the prompt pre-filled where supported. */
export function launcherHref(launcher: AiLauncher, prompt: string): string {
  if (!launcher.prefillParam) return launcher.url;
  const url = new URL(launcher.url);
  url.searchParams.set(launcher.prefillParam, prompt);
  return url.toString();
}
