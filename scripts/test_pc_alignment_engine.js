"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Engine = require(path.join(__dirname, "..", "pc_alignment_engine.js"));

const fixturePath = path.join(__dirname, "..", "data", "demo", "pc_review_task3_demo.json");
const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const baseline = fixture.synthetic_baseline;
const project = fixture.seed_project;
const amendments = fixture.amendments;
const originalBaseline = JSON.stringify(baseline);
const checks = [];

function check(name, fn) {
  fn();
  checks.push(name);
}

function amendment(id) {
  return amendments.find((entry) => entry.amendment_id === id);
}

function assess(id, overrides = {}) {
  return Engine.alignAmendment({ ...amendment(id), ...overrides }, baseline, project, amendments);
}

function reconstruct(segments, side) {
  return segments.map((segment) => {
    if (segment.segment_type === "unchanged") return segment.text;
    if (segment.segment_type === "deleted") return side === "before" ? segment.text : "";
    if (segment.segment_type === "added") return side === "after" ? segment.text : "";
    if (segment.segment_type === "replaced") return side === "before" ? segment.original_text : segment.text;
    throw new Error(`Unknown segment type ${segment.segment_type}`);
  }).join("");
}

check("fixture discriminator and baseline isolation", () => {
  assert.equal(fixture.document_type, "pc_task3_demo_fixture");
  assert.equal(fixture.demo_only, true);
  assert.equal(Engine.sourceLayerGate(baseline, { allowDemo: true }).ok, true);
  assert.equal(Engine.sourceLayerGate(baseline).ok, false);
  assert.ok(baseline.clauses.every((clause) => clause.id.startsWith("demo_")));
});

check("Exact Match with harmless heading case and spacing", () => {
  const result = assess("demo_a001");
  assert.equal(result.machine_alignment_status, "Exact Match");
  assert.equal(result.target_occurrence_count, 1);
});

check("number and heading conflict", () => {
  assert.equal(assess("demo_a002").machine_alignment_status, "Number Match / Heading Difference");
});

check("unique target-text match with number conflict", () => {
  const result = assess("demo_a003");
  assert.equal(result.machine_alignment_status, "Target Text Match");
  assert.equal(result.proposed_target_gc_clause_number, "106.1");
});

check("ambiguous repeated exact target", () => {
  const result = assess("demo_a004");
  assert.equal(result.machine_alignment_status, "Ambiguous");
  assert.equal(result.target_occurrence_count, 2);
});

check("new clause and blocking dependency statuses", () => {
  assert.equal(assess("demo_a008").machine_alignment_status, "New Clause");
  assert.equal(assess("demo_a010").machine_alignment_status, "Blocking Dependency");
  assert.equal(assess("demo_a009").machine_alignment_status, "Not Assessed");
});

check("Current Effective Text alignment uses the committed effective version", () => {
  const baselineOnly = assess("demo_a006");
  assert.equal(baselineOnly.machine_alignment_status, "Unmatched");
  const effectiveClauses = [{
    effective_clause_id: "demo_effective_103_1",
    baseline_clause_id: "demo_clause_103_1",
    clause_number: "103.1",
    current_effective_text: "Sequence card: gold. Storage: tray A."
  }];
  const current = Engine.alignAmendment(amendment("demo_a006"), baseline, project, amendments, effectiveClauses);
  assert.equal(current.machine_alignment_status, "Exact Match");
  assert.equal(current.target_occurrence_count, 1);
});

check("changed heading words are not harmless normalization", () => {
  assert.notEqual(Engine.normalizeHeading("Badge List"), Engine.normalizeHeading("Badge Lists"));
  assert.notEqual(Engine.normalizeHeading("Badge List 14"), Engine.normalizeHeading("Badge List 21"));
});

check("ID and number conflict cannot be Exact Match", () => {
  const result = assess("demo_a001", { target_gc_clause_id: "demo_clause_101_2" });
  assert.notEqual(result.machine_alignment_status, "Exact Match");
  assert.ok(result.conflicts.some((conflict) => /ID.*number/i.test(conflict)));
});

check("eligibility rechecks controlled ID, number, heading and parent metadata", () => {
  const falseClaim = {
    ...amendment("demo_a001"),
    target_gc_clause_id: "demo_clause_101_1",
    target_gc_clause_number: "999.1",
    target_gc_heading: "Wrong Heading",
    parent_clause: "999",
    alignment_status: "Exact Match"
  };
  const eligibility = Engine.getEligibility(falseClaim, baseline, null, amendments, { allowDemo: true });
  assert.equal(eligibility.eligible, false);
  assert.ok(eligibility.reasons.some((reason) => /does not exist|does not match/i.test(reason)));
});

check("whole-clause operations validate supplied quoted target wording", () => {
  const mismatch = assess("demo_a002", { target_text: "quoted wording that is absent" });
  assert.equal(mismatch.machine_alignment_status, "Unmatched");
  const match = assess("demo_a002", { target_text: "Marker log: green marker after lunch." });
  assert.equal(match.target_occurrence_count, 1);
});

check("duplicate harmless-normalised headings are ambiguous", () => {
  const duplicateBaseline = JSON.parse(JSON.stringify(baseline));
  duplicateBaseline.clauses.push({ id: "demo_clause_106_4", parent_clause_no: "106", clause_no: "106.4", clause_title: "Anchor Note", full_text: "Second synthetic anchor note.", original_order: 11 });
  const result = Engine.alignAmendment({
    ...amendment("demo_a013"),
    target_gc_clause_number: null,
    target_gc_heading: "anchor note",
    parent_clause: "106"
  }, duplicateBaseline, project, amendments);
  assert.equal(result.machine_alignment_status, "Ambiguous");
});

check("unavailable baseline fails closed", () => {
  assert.equal(Engine.alignAmendment(amendment("demo_a001"), null, project, amendments).machine_alignment_status, "Blocking Dependency");
});

check("partial or malformed production source layers fail closed", () => {
  const malformed = {
    book: "FIDIC Red Book 2017",
    edition: "2017",
    source_status: "source_text_loaded",
    main_clause_count: 1,
    sub_clause_count: 1,
    main_clauses: [{ clause_no: "1" }],
    clauses: [{ id: "", parent_clause_no: "1", clause_no: "1.1", clause_title: "Incomplete", full_text: "Text" }]
  };
  assert.equal(Engine.sourceLayerGate(malformed).ok, false);
  const countMismatch = {
    ...malformed,
    clauses: [{ id: "x", parent_clause_no: "1", clause_no: "1.1", clause_title: "Complete", full_text: "Text" }],
    sub_clause_count: 2
  };
  assert.equal(Engine.sourceLayerGate(countMismatch).ok, false);
});

check("explicit empty container clauses pass the source gate but stay outside the alignment text index", () => {
  const withContainer = JSON.parse(JSON.stringify(baseline));
  withContainer.clauses.push({
    id: "demo_clause_101_9",
    parent_clause_no: "101",
    clause_no: "101.9",
    clause_title: "DEMO Container",
    full_text: "",
    is_container_clause: true,
    child_clause_numbers: ["101.9.1"],
    original_order: 11
  }, {
    id: "demo_clause_101_9_1",
    parent_clause_no: "101",
    clause_no: "101.9.1",
    clause_title: "DEMO Container Child",
    full_text: "Synthetic child text.",
    original_order: 12
  });
  const gate = Engine.sourceLayerGate(withContainer, { allowDemo: true });
  assert.equal(gate.ok, true);
  assert.equal(gate.index.byNumber.get("101.9").is_container_clause, true);
  assert.equal(gate.index.clauses.some((clause) => clause.clause_no === "101.9"), false);
});

check("empty ordinary clauses and malformed containers fail the source gate", () => {
  const emptyOrdinary = JSON.parse(JSON.stringify(baseline));
  emptyOrdinary.clauses[0].full_text = "";
  assert.equal(Engine.sourceLayerGate(emptyOrdinary, { allowDemo: true }).ok, false);

  const malformedContainer = JSON.parse(JSON.stringify(baseline));
  malformedContainer.clauses.push({
    id: "demo_clause_101_9",
    parent_clause_no: "101",
    clause_no: "101.9",
    clause_title: "DEMO Container",
    full_text: "",
    is_container_clause: true,
    child_clause_numbers: ["101.99"],
    original_order: 11
  });
  assert.equal(Engine.sourceLayerGate(malformedContainer, { allowDemo: true }).ok, false);
});

check("new clause requires an existing parent", () => {
  const result = assess("demo_a008", { parent_clause: "999", target_gc_clause_number: "999.1" });
  assert.equal(result.machine_alignment_status, "New Clause");
  assert.match(result.blocking_issue, /does not exist/i);
});

check("overlapping literal occurrences are counted safely", () => {
  assert.equal(Engine.countExactOccurrences("aaa", "aa"), 2);
});

check("Delete Exact Text and segment reconstruction", () => {
  const input = "Badge list: blue; amber; green.";
  const result = Engine.applyOperation("Delete Exact Text", input, "amber; ", null, null);
  assert.equal(result.ok, true);
  assert.equal(result.outputText, "Badge list: blue; green.");
  assert.equal(reconstruct(result.segments, "before"), input);
  assert.equal(reconstruct(result.segments, "after"), result.outputText);
});

check("Replace Exact Text and zero/duplicate target failures are atomic", () => {
  const input = "Sequence card: silver. Storage: tray A.";
  const replaced = Engine.applyOperation("Replace Exact Text", input, "Sequence card: silver.", "Sequence card: gold.", null);
  assert.equal(replaced.outputText, "Sequence card: gold. Storage: tray A.");
  assert.equal(reconstruct(replaced.segments, "before"), input);
  assert.equal(reconstruct(replaced.segments, "after"), replaced.outputText);
  const zero = Engine.applyOperation("Replace Exact Text", input, "missing", "replacement", null);
  assert.equal(zero.ok, false);
  assert.equal(zero.outputText, input);
  const duplicateInput = "alpha token and alpha token";
  const duplicate = Engine.applyOperation("Delete Exact Text", duplicateInput, "alpha token", null, null);
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.occurrenceCount, 2);
  assert.equal(duplicate.outputText, duplicateInput);
});

check("Insert Before and Insert After preserve supplied whitespace", () => {
  const beforeInput = "Before note: final marker.";
  const before = Engine.applyOperation("Insert Before", beforeInput, beforeInput, "Preface: exact. ", "Before Exact Anchor");
  assert.equal(before.outputText, "Preface: exact. Before note: final marker.");
  const afterInput = "Anchor note: square.";
  const after = Engine.applyOperation("Insert After", afterInput, afterInput, " Synthetic suffix: circle.", "After Exact Anchor");
  assert.equal(after.outputText, "Anchor note: square. Synthetic suffix: circle.");
  const missing = Engine.applyOperation("Insert After", afterInput, "missing anchor", " must not append", "After Exact Anchor");
  assert.equal(missing.ok, false);
  assert.equal(missing.outputText, afterInput);
});

check("Add Paragraph uses only the explicitly supplied separator", () => {
  const input = "Paragraph one: north.\nParagraph two: south.";
  const added = Engine.applyOperation("Add Paragraph", input, "Paragraph one: north.", "\nParagraph inserted: centre.", "After Exact Anchor");
  assert.equal(added.outputText, "Paragraph one: north.\nParagraph inserted: centre.\nParagraph two: south.");
  const unclear = Engine.applyOperation("Add Paragraph", input, "Paragraph one: north.", "\nParagraph inserted: centre.", "Somewhere appropriate");
  assert.equal(unclear.ok, false);
  assert.equal(unclear.outputText, input);
});

check("whole-clause delete, replace and new-clause operations", () => {
  const deleted = Engine.applyOperation("Delete Entire Sub-Clause", "Removable card: orange.", null, null, null, { targetExists: true });
  assert.equal(deleted.ok, true);
  assert.equal(deleted.outputText, "");
  assert.equal(deleted.clauseStatus, "Deleted");
  assert.equal(Engine.applyOperation("Delete Entire Sub-Clause", "", null, null, null, { targetExists: false }).ok, false);
  const replaced = Engine.applyOperation("Replace Entire Sub-Clause", "Replaceable card: old pattern.", null, "Replaceable card: new pattern.", null);
  assert.equal(replaced.outputText, "Replaceable card: new pattern.");
  const newClause = Engine.applyOperation("Add New Sub-Clause", "", null, "Daily badge note: record one colour.", "Numerical Position", { targetOccupied: false });
  assert.equal(newClause.ok, true);
  assert.equal(newClause.clauseStatus, "New");
  assert.equal(Engine.applyOperation("Add New Sub-Clause", "", null, "conflict", "Numerical Position", { targetOccupied: true }).ok, false);
});

check("unsupported operation is never converted or applied", () => {
  const result = Engine.applyOperation("Delete Paragraph", "Synthetic paragraph.", "Synthetic paragraph.", null, null);
  assert.equal(result.ok, false);
  assert.equal(result.failureReason, "Not Yet Supported / Human Review Required");
});

check("eligibility blocks Unclear target basis and sequence ties", () => {
  const aligned = { ...amendment("demo_a001"), alignment_status: "Exact Match", target_gc_clause_id: "demo_clause_101_1" };
  assert.equal(Engine.getEligibility({ ...aligned, target_basis: "Unclear" }, baseline, null, amendments, { allowDemo: true }).eligible, false);
  const tie = { ...aligned, amendment_id: "demo_tie", sequence_number: aligned.sequence_number };
  assert.equal(Engine.getEligibility(aligned, baseline, null, [...amendments, tie], { allowDemo: true }).eligible, false);
});

check("sequential application, failed third step and rollback replay", () => {
  const baseText = baseline.clauses.find((clause) => clause.clause_no === "103.1").full_text;
  const first = Engine.applyOperation("Replace Exact Text", baseText, amendment("demo_a005").target_text, amendment("demo_a005").replacement_or_added_text, null);
  assert.equal(first.outputText, fixture.expected_state.demo_103_1_after_rollback_second_step);
  const second = Engine.applyOperation("Insert After", first.outputText, amendment("demo_a006").target_text, amendment("demo_a006").replacement_or_added_text, amendment("demo_a006").target_location);
  assert.equal(second.outputText, fixture.expected_state.demo_103_1_after_two_steps);
  const third = Engine.applyOperation("Delete Exact Text", second.outputText, amendment("demo_a007").target_text, null, null);
  assert.equal(third.ok, false);
  assert.equal(third.occurrenceCount, 0);
  assert.equal(third.outputText, fixture.expected_state.demo_103_1_after_failed_third_step);
  const replayWithoutSecond = Engine.applyOperation("Replace Exact Text", baseText, amendment("demo_a005").target_text, amendment("demo_a005").replacement_or_added_text, null);
  assert.equal(replayWithoutSecond.outputText, fixture.expected_state.demo_103_1_after_rollback_second_step);
});

check("baseline remains byte-for-byte unchanged in memory", () => {
  assert.equal(JSON.stringify(baseline), originalBaseline);
});

process.stdout.write(JSON.stringify({
  fixture: path.relative(path.join(__dirname, ".."), fixturePath),
  checks_passed: checks.length,
  checks,
  baseline_unchanged: JSON.stringify(baseline) === originalBaseline,
  production_baseline_used: false
}, null, 2) + "\n");
