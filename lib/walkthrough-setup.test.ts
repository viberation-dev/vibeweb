import assert from "node:assert/strict";
import { test } from "node:test";

import {
  applySetup,
  clampSetup,
  DEFAULT_SETUP,
  matchesSetup,
  parseSetup,
  serializeSetup,
  setupOptions,
  stepIndexAfterChange,
  type When,
} from "./walkthrough-setup.ts";

const block = (id: string, when?: When) => ({ id, when });
const step = (key: string, blocks: ReturnType<typeof block>[], when?: When) => ({ key, blocks, when });

const steps = [
  step("brief", [block("intro"), block("brief-basic", { depth: ["basic"] }), block("brief-standard", { depth: ["standard"] })]),
  step("behaviour", [block("spec")], { depth: ["standard"] }),
  step("build", [block("build"), block("sign-off", { team: ["team"] })]),
];

const ids = (setup: Parameters<typeof applySetup>[1]) =>
  applySetup(steps, setup).map((s) => `${s.key}:${s.blocks.map((b) => b.id).join(",")}`);

test("untagged content is for everyone", () => {
  assert.equal(matchesSetup(undefined, DEFAULT_SETUP), true);
  assert.equal(matchesSetup({}, { depth: "basic", team: "team", owner: "mine" }), true);
});

test("both keys must match when both are set", () => {
  const when: When = { depth: ["basic"], team: ["team"] };
  assert.equal(matchesSetup(when, { depth: "basic", team: "team", owner: "mine" }), true);
  assert.equal(matchesSetup(when, { depth: "basic", team: "solo", owner: "mine" }), false);
  assert.equal(matchesSetup(when, { depth: "standard", team: "team", owner: "mine" }), false);
});

test("the default setup sees what the walkthrough was before it had settings", () => {
  assert.deepEqual(ids(DEFAULT_SETUP), ["brief:intro,brief-standard", "behaviour:spec", "build:build"]);
});

test("basic drops the tagged step and swaps the tagged block", () => {
  assert.deepEqual(ids({ depth: "basic", team: "solo", owner: "mine" }), ["brief:intro,brief-basic", "build:build"]);
});

test("a team sees its extra blocks", () => {
  assert.deepEqual(ids({ depth: "standard", team: "team", owner: "mine" }).at(-1), "build:build,sign-off");
});

test("a step left with no blocks is dropped", () => {
  const only = [step("research", [block("a", { depth: ["full"] })])];
  assert.deepEqual(applySetup(only, DEFAULT_SETUP), []);
});

test("options are read from the content, and include the defaults", () => {
  assert.deepEqual(setupOptions(steps), { depths: ["basic", "standard"], teams: ["solo", "team"], owners: [] });
  assert.deepEqual(setupOptions([step("a", [block("x")])]), { depths: [], teams: [], owners: [] });
});

test("a setup round-trips through its cookie, and junk falls back", () => {
  const setup = { depth: "basic", team: "team", owner: "mine" } as const;
  assert.deepEqual(parseSetup(serializeSetup(setup)), setup);
  assert.deepEqual(parseSetup(undefined), DEFAULT_SETUP);
  assert.deepEqual(parseSetup("premium.everyone"), DEFAULT_SETUP);
  assert.deepEqual(parseSetup("basic"), { depth: "basic", team: "solo", owner: "mine" });
});

test("a setup the walkthrough does not offer is clamped to the default", () => {
  const options = setupOptions(steps);
  assert.deepEqual(clampSetup({ depth: "full", team: "team", owner: "mine" }, options), { depth: "standard", team: "team", owner: "mine" });
  assert.deepEqual(clampSetup({ depth: "basic", team: "team", owner: "mine" }, { depths: [], teams: [], owners: [] }), DEFAULT_SETUP);
});

test("changing setup keeps the reader on their step, or the nearest one before it", () => {
  const all = ["brief", "behaviour", "build"];
  const basic = ["brief", "build"];
  assert.equal(stepIndexAfterChange(all, basic, "build"), 1);
  assert.equal(stepIndexAfterChange(all, basic, "behaviour"), 0);
  assert.equal(stepIndexAfterChange(all, basic, "gone"), 0);
});

test("an owner tag hides the other owner's blocks, and offers the question", () => {
  const owned = [
    step("brief", [
      block("shared"),
      block("for-me", { owner: ["mine"] }),
      block("for-client", { owner: ["client"] }),
    ]),
  ];
  assert.deepEqual(setupOptions(owned).owners, ["mine", "client"]);
  assert.deepEqual(
    applySetup(owned, DEFAULT_SETUP)[0].blocks.map((b) => b.id),
    ["shared", "for-me"],
  );
  assert.deepEqual(
    applySetup(owned, { ...DEFAULT_SETUP, owner: "client" })[0].blocks.map((b) => b.id),
    ["shared", "for-client"],
  );
});

test("a cookie from before the owner question still parses", () => {
  assert.deepEqual(parseSetup("basic.team"), { depth: "basic", team: "team", owner: "mine" });
  assert.deepEqual(parseSetup("full.solo.client"), { depth: "full", team: "solo", owner: "client" });
});
