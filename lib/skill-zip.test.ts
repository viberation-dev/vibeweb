import assert from "node:assert/strict";
import { test } from "node:test";

import { strFromU8, unzipSync } from "fflate";

import { parseSkillFiles } from "./skill-facts.ts";
import { buildSkillZip, safeZipPath, SKILL_ZIP_MAX_BYTES } from "./skill-zip.ts";

test("zip paths cannot leave the skill folder", () => {
  assert.equal(safeZipPath("SKILL.md"), "SKILL.md");
  assert.equal(safeZipPath("scripts/run.py"), "scripts/run.py");
  assert.equal(safeZipPath("scripts\\run.py"), "scripts/run.py");
  for (const bad of ["", "../evil", "a/../../evil", "/etc/passwd", "C:/x", "a//b", "./x", "a/<b>"]) {
    assert.equal(safeZipPath(bad), null, `expected ${bad} to be rejected`);
  }
});

test("the zip holds the skill under one folder, skipping unsafe paths", () => {
  const result = buildSkillZip("frontend-design", [
    { path: "SKILL.md", contents: "---\nname: frontend-design\n---" },
    { path: "LICENSE.txt", contents: "Apache" },
    { path: "../escape.sh", contents: "rm -rf" },
  ]);
  assert.ok(result.ok);
  assert.equal(result.files, 2);
  const entries = unzipSync(result.bytes);
  assert.deepEqual(Object.keys(entries).sort(), ["frontend-design/LICENSE.txt", "frontend-design/SKILL.md"]);
  assert.equal(strFromU8(entries["frontend-design/LICENSE.txt"]), "Apache");
});

test("no SKILL.md, a bad folder name, or too many bytes is refused", () => {
  assert.deepEqual(buildSkillZip("x", [{ path: "README.md", contents: "hi" }]), { ok: false, reason: "empty" });
  assert.deepEqual(buildSkillZip("../x", [{ path: "SKILL.md", contents: "hi" }]), { ok: false, reason: "empty" });
  assert.deepEqual(
    buildSkillZip("x", [
      { path: "SKILL.md", contents: "hi" },
      { path: "big.txt", contents: "a".repeat(SKILL_ZIP_MAX_BYTES) },
    ]),
    { ok: false, reason: "too_large" },
  );
});

test("skill files are made relative to the SKILL.md folder, neighbours dropped", () => {
  const files = parseSkillFiles({
    files: [
      { path: "skills/frontend-design/SKILL.md", contents: "a" },
      { path: "skills/frontend-design/refs/x.md", contents: "b" },
      { path: "skills/other/SKILL.md", contents: "c" },
      { path: "README.md", contents: "d" },
    ],
  });
  // Both SKILL.md files are equally deep; the first listed wins and the other skill is excluded.
  assert.deepEqual(files, [
    { path: "SKILL.md", contents: "a" },
    { path: "refs/x.md", contents: "b" },
  ]);
  assert.deepEqual(
    parseSkillFiles({ files: [{ path: "SKILL.md", contents: "a" }, { path: "LICENSE.txt", contents: "b" }] }).map(
      (f) => f.path,
    ),
    ["SKILL.md", "LICENSE.txt"],
  );
  assert.deepEqual(parseSkillFiles({ files: [{ path: "README.md", contents: "d" }] }), []);
  assert.deepEqual(parseSkillFiles({ error: "authentication_required" }), []);
});
