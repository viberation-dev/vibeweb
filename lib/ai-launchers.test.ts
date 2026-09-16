import assert from "node:assert/strict";
import { test } from "node:test";

import { AI_CHATS, launcherHref } from "./ai-launchers.ts";

test("pre-fills the prompt for sites that read a query parameter", () => {
  const claude = AI_CHATS.find((l) => l.name === "Claude")!;
  const href = launcherHref(claude, "Build me a page & a form?\nThanks");
  assert.equal(new URL(href).searchParams.get("q"), "Build me a page & a form?\nThanks");
});

test("leaves the link alone for sites without pre-fill", () => {
  const deepseek = AI_CHATS.find((l) => l.name === "DeepSeek")!;
  assert.equal(launcherHref(deepseek, "anything"), deepseek.url);
});
