import assert from "node:assert/strict";
import { test } from "node:test";

import { AI_CHATS, launcherHref } from "./ai-launchers.ts";

test("pre-fills the prompt for sites that read a query parameter", () => {
  const chatgpt = AI_CHATS.find((l) => l.name === "ChatGPT")!;
  const href = launcherHref(chatgpt, "Build me a page & a form?\nThanks");
  assert.equal(new URL(href).searchParams.get("q"), "Build me a page & a form?\nThanks");
});

test("leaves the link alone for sites without pre-fill", () => {
  for (const name of ["Claude", "DeepSeek"]) {
    const launcher = AI_CHATS.find((l) => l.name === name)!;
    assert.equal(launcherHref(launcher, "anything"), launcher.url);
  }
});
