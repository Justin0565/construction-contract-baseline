"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  nodeVersionSupported,
  parseJsonWithPositions,
  normaliseTag,
  scanReservedText,
  scanReservedFields,
  Report,
  SEVERITY
} = require("../scripts/qa_gates.js");

const RESERVED_REVIEW_VALUE = ["lawyer", "approved"].join("_");
const RESERVED_BENCHMARK_VALUE = ["benchmark", "ready"].join("_");

test("JSON position parser records nested values and escaped JSON pointers", () => {
  const source = [
    "{",
    "  \"alpha\": 1,",
    "  \"nested\": {",
    "    \"a/b~c\": [true,",
    "      null]",
    "  }",
    "}"
  ].join("\n");

  const parsed = parseJsonWithPositions(source);

  assert.deepEqual(parsed.value, {
    alpha: 1,
    nested: { "a/b~c": [true, null] }
  });
  assert.equal(parsed.positions.get(""), 1);
  assert.equal(parsed.positions.get("/alpha"), 2);
  assert.equal(parsed.positions.get("/nested"), 3);
  assert.equal(parsed.positions.get("/nested/a~1b~0c"), 4);
  assert.equal(parsed.positions.get("/nested/a~1b~0c/0"), 4);
  assert.equal(parsed.positions.get("/nested/a~1b~0c/1"), 5);
});

test("JSON position parser reports malformed trailing content with a line", () => {
  assert.throws(
    () => parseJsonWithPositions("{}\nfalse"),
    (error) => error.qaParseFailure === true && /trailing content after the root value at line 2/.test(error.message)
  );
});

test("tag normalisation is stable across case, punctuation and empty values", () => {
  assert.equal(normaliseTag("Claim for EOT"), "claim_for_eot");
  assert.equal(normaliseTag("Waiver / Non-Waiver / Discharge"), "waiver_non_waiver_discharge");
  assert.equal(normaliseTag("  --Deemed   Approval--  "), "deemed_approval");
  assert.equal(normaliseTag(null), "");
  assert.equal(normaliseTag(undefined), "");
});

test("reserved-field text scanner flags structured and bare reserved values", () => {
  const report = new Report();
  const text = [
    `\"lawyer_review_status\": \"${RESERVED_REVIEW_VALUE}\"`,
    `status note: ${RESERVED_BENCHMARK_VALUE}`
  ].join("\n");

  const violations = scanReservedText(report, "data/example.json", text);

  assert.equal(violations, 2);
  assert.equal(report.findings.length, 2);
  assert.ok(report.findings.every((finding) => finding.severity === SEVERITY.FAIL));
  assert.deepEqual(report.findings.map((finding) => finding.line), [1, 2]);
});

test("reserved-field text scanner permits safe initial values", () => {
  const report = new Report();
  const text = [
    "lawyer_review_status: needs_lawyer_review",
    "benchmark_status: not_benchmark_ready"
  ].join("\n");

  assert.equal(scanReservedText(report, "data/example.json", text), 0);
  assert.equal(report.findings.length, 0);
});

test("reserved-field text scanner treats governing definitions as information", () => {
  const report = new Report();
  const text = `lawyer_review_status: ${RESERVED_REVIEW_VALUE}`;

  assert.equal(scanReservedText(report, "project-control/05_AI_ROLE_DIVISION_PROTOCOL.md", text), 0);
  assert.equal(report.findings.length, 1);
  assert.equal(report.findings[0].severity, SEVERITY.INFO);
});

test("reserved-field scanner excludes its source and all deprecated datasets", () => {
  const excluded = [
    "scripts/qa_gates.js",
    "data/elements.json",
    "data/sub_issues.json",
    "data/fidic_2017_red_map.json",
    "data/tags.json"
  ];

  excluded.forEach((file) => {
    const report = new Report();
    const text = `benchmark_status: ${RESERVED_BENCHMARK_VALUE}`;
    assert.equal(scanReservedText(report, file, text), 0);
    assert.equal(report.findings.length, 0);
  });

  const repositoryReport = new Report();
  scanReservedFields(repositoryReport);
  assert.equal(repositoryReport.findings.some((finding) => excluded.includes(finding.file)), false);
});

test("Report never records a pass for a gate that has a failure", () => {
  const report = new Report();

  assert.equal(report.pass("Gate A", "rule 1", "initially clear"), true);
  report.add(SEVERITY.FAIL, "Gate A", "rule 2", "data/example.json", 1, "failure");
  assert.equal(report.passed.some((entry) => entry.gate === "Gate A"), false);
  assert.equal(report.pass("Gate A", "rule 3", "must remain suppressed"), false);

  report.add(SEVERITY.INFO, "Gate B", "definition", null, null, "information only");
  assert.equal(report.pass("Gate B", "rule 1", "clear"), true);
});

test("documented Node.js requirement accepts only version 18 or newer", () => {
  assert.equal(nodeVersionSupported("v6.14.0"), false);
  assert.equal(nodeVersionSupported("17.9.1"), false);
  assert.equal(nodeVersionSupported("v18.0.0"), true);
  assert.equal(nodeVersionSupported("24.19.0"), true);
  assert.equal(nodeVersionSupported("unknown"), false);
});
