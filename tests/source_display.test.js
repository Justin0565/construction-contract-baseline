"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { resolveSourceDisplayState } = require("../source_display.js");

test("source display resolves non-empty text as loaded", () => {
  assert.deepEqual(resolveSourceDisplayState({ full_text: "Operative text" }), {
    key: "loaded",
    status: "source_text_loaded",
    message: "Text loaded from source layer.",
    childClauseNumbers: []
  });
});

test("source display resolves an explicit container without treating it as missing", () => {
  assert.deepEqual(resolveSourceDisplayState({
    is_container_clause: true,
    full_text: "",
    child_clause_numbers: ["4.4.1", "4.4.2", "4.4.3"]
  }), {
    key: "container",
    status: "container_clause",
    message: "no independent text — see sub-clauses",
    childClauseNumbers: ["4.4.1", "4.4.2", "4.4.3"]
  });
});

test("source display resolves absent and unmarked empty text as missing", () => {
  assert.equal(resolveSourceDisplayState(null).key, "missing");
  assert.equal(resolveSourceDisplayState({ full_text: "" }).status, "source_text_not_loaded");
});

test("controlled source containers expose every approved child link target", () => {
  const source = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "data", "processed", "fidic_2017_red_clauses.json"),
    "utf8"
  ));
  const expected = {
    "4.4": ["4.4.1", "4.4.2", "4.4.3"],
    "4.9": ["4.9.1", "4.9.2", "4.9.3"],
    "5.2": ["5.2.1", "5.2.2", "5.2.3", "5.2.4"]
  };
  const available = new Set(source.clauses.map((clause) => clause.clause_no));

  Object.entries(expected).forEach(([number, children]) => {
    const record = source.clauses.find((clause) => clause.clause_no === number);
    const state = resolveSourceDisplayState(record);
    assert.equal(state.key, "container");
    assert.deepEqual(state.childClauseNumbers, children);
    assert.equal(children.every((child) => available.has(child)), true);
  });
  assert.equal(resolveSourceDisplayState(
    source.clauses.find((clause) => clause.clause_no === "4.4.1")
  ).key, "loaded");
});
