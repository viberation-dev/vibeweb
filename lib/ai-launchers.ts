/**
 * Where a copied walkthrough prompt can be pasted (VIB-160).
 *
 * A repo constant, not a `tools` query: these are fixed "open the app" links
 * in Ali's chosen order, several (Qwen, DeepSeek, Kimi, Grok) are not in the
 * directory, and a chat link should land on a new chat rather than a
 * marketing page. Ordered by popularity; `MORE` sits behind a disclosure.
 */

export type AiLauncher = { name: string; url: string };

export const AI_CHATS: readonly AiLauncher[] = [
  { name: "Claude", url: "https://claude.ai/new" },
  { name: "ChatGPT", url: "https://chatgpt.com" },
  { name: "Qwen", url: "https://chat.qwen.ai" },
  { name: "DeepSeek", url: "https://chat.deepseek.com" },
  { name: "Kimi", url: "https://www.kimi.com" },
  { name: "Grok", url: "https://grok.com" },
];

export const AI_BUILDERS: readonly AiLauncher[] = [
  { name: "Lovable", url: "https://lovable.dev" },
  { name: "Replit", url: "https://replit.com" },
  { name: "Base44", url: "https://base44.com" },
  { name: "Google AI Studio", url: "https://aistudio.google.com/apps" },
  { name: "Cursor", url: "https://cursor.com" },
  { name: "VS Code", url: "https://code.visualstudio.com" },
  { name: "Antigravity IDE", url: "https://antigravity.google" },
  { name: "Antigravity 2.0", url: "https://antigravity.google/product/antigravity-2/" },
];
