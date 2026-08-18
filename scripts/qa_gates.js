"use strict";

const MIN_NODE_MAJOR = 18;

function nodeVersionSupported(version) {
  const match = /^v?(\d+)/.exec(String(version || ""));
  return Boolean(match) && Number(match[1]) >= MIN_NODE_MAJOR;
}

if (!nodeVersionSupported(process.version)) {
  process.stderr.write(
    `qa_gates.js requires Node.js ${MIN_NODE_MAJOR} or newer; detected ${process.version || "an unknown version"}.\n`
  );
  process.exit(2);
}

/*
 * qa_gates.js — executable QA gates for the Construction Contract Intelligence Dashboard.
 *
 * USAGE
 *   node scripts/qa_gates.js                 run every gate over the repository
 *   node scripts/qa_gates.js --gate=3        run one gate only (1-5, or "reserved")
 *   node scripts/qa_gates.js --json          machine-readable findings on stdout
 *   node scripts/qa_gates.js --quiet         suppress the passing-check list
 *
 * EXIT CODES
 *   0  every implemented check passed and nothing was blocked
 *   1  one or more findings (FAIL, SCHEMA_GAP or BLOCKED)
 *   2  the runner itself failed (unreadable or unparseable input)
 *
 * WHAT THIS IMPLEMENTS
 *   Gates 1-5 of project-control/03_CATEGORY_EXECUTION_PROTOCOL.md section 10,
 *   and the reserved-field validation block of
 *   project-control/05_AI_ROLE_DIVISION_PROTOCOL.md section 7.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *   It never proposes or applies a correction that requires legal judgement.
 *   A finding states its location and its nature. Where a gate rule turns on a
 *   legal question (is this cross-link genuine, does this wording express the
 *   tagged effect, is this one mechanism or two), the check is reported as
 *   NOT_MECHANICAL rather than guessed at. Run with --json and read the
 *   `notImplemented` block for the full list and the reason for each.
 *
 *   Requires Node 18+. Read-only: this script never writes to the repository.
 */

const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.join(__dirname, "..");

/* ------------------------------------------------------------------ *
 * Approved vocabularies, transcribed from the governing files.
 * These are transcriptions of lawyer-approved lists, not new legal content.
 * ------------------------------------------------------------------ */

// 00_PROJECT_RULES.md section 7 / 03 section 6.
const APPROVED_TAGS = [
  "Claim for EOT",
  "Claim for Cost",
  "Contractor Breach / Default",
  "Employer Breach / Default",
  "Determination",
  "Condition Precedent",
  "Time Bar",
  "Deemed Approval",
  "Deemed Rejection",
  "Deduction",
  "Withholding",
  "Set-off",
  "Indemnity",
  "Remedy",
  "Termination Trigger",
  "Back-to-back",
  "Waiver / Non-Waiver / Discharge",
  "Counterclaim / Countercharge"
];

// 00 section 8 and 03 section 6: withdrawn generic tags.
const DEPRECATED_GENERIC_TAGS = ["Claim", "EOT", "Breach / Default", "Generic Claim", "Generic EOT"];

// 00 section 6 / 03 section 5: the only approved element types.
const APPROVED_ELEMENT_TYPES = [
  "Responsibility / Obligation Allocation",
  "Process Control",
  "Legal Effect / Outcome Control"
];

// 03 section 8.
const LAWYER_REVIEW_STATUSES = ["needs_lawyer_review", "lawyer_approved", "revised", "deferred", "rejected"];
const BENCHMARK_STATUSES = ["not_benchmark_ready", "candidate_benchmark", "benchmark_ready", "remove_from_benchmark"];
const SOURCE_BASIS_STATUSES = [
  "mindmap_supported",
  "fidic_text_supported",
  "user_confirmed",
  "lawyer_note_supported",
  "methodology_inferred",
  "unsupported"
];

// 05 section 7: writable by the Lawyer only.
const RESERVED = [
  { field: "lawyer_review_status", value: "lawyer_approved" },
  { field: "benchmark_status", value: "benchmark_ready" }
];

// The three files that define the reserved vocabulary. Occurrences here are
// definitions, not data writes, and are reported as INFO rather than FAIL.
const VOCABULARY_FILES = [
  "project-control/00_PROJECT_RULES.md",
  "project-control/03_CATEGORY_EXECUTION_PROTOCOL.md",
  "project-control/05_AI_ROLE_DIVISION_PROTOCOL.md"
];

// 00 section 10 / 03 section 9.
const EXECUTION_MATRICES = [
  "10_SCOPE_AND_INTERFACE_EXECUTION_MATRIX.md",
  "11_TIME_EXECUTION_MATRIX.md",
  "12_PAYMENT_AND_PRICE_EXECUTION_MATRIX.md",
  "13_RISK_ALLOCATION_EXECUTION_MATRIX.md",
  "14_LIABILITY_AND_REMEDIES_EXECUTION_MATRIX.md",
  "15_CLAIMS_AND_DISPUTES_EXECUTION_MATRIX.md",
  "16_CONTRACT_MECHANICS_EXECUTION_MATRIX.md"
];

/* ------------------------------------------------------------------ *
 * JSON parser that records a source line for every value.
 * Needed because 05 section 8 requires file path AND line number.
 * ------------------------------------------------------------------ */

function parseJsonWithPositions(text) {
  let i = 0;
  let line = 1;
  const positions = new Map();

  function fail(message) {
    const error = new Error(`${message} at line ${line}`);
    error.qaParseFailure = true;
    throw error;
  }

  function advance(count) {
    for (let n = 0; n < count; n += 1) {
      if (text[i] === "\n") line += 1;
      i += 1;
    }
  }

  function skipWhitespace() {
    while (i < text.length && /\s/.test(text[i])) advance(1);
  }

  function parseString() {
    if (text[i] !== "\"") fail("expected a string");
    advance(1);
    let out = "";
    while (i < text.length && text[i] !== "\"") {
      if (text[i] === "\\") {
        const escape = text[i + 1];
        if (escape === "u") {
          out += String.fromCharCode(parseInt(text.slice(i + 2, i + 6), 16));
          advance(6);
        } else {
          const map = { n: "\n", t: "\t", r: "\r", b: "\b", f: "\f", "\"": "\"", "\\": "\\", "/": "/" };
          out += Object.prototype.hasOwnProperty.call(map, escape) ? map[escape] : escape;
          advance(2);
        }
      } else {
        out += text[i];
        advance(1);
      }
    }
    if (text[i] !== "\"") fail("unterminated string");
    advance(1);
    return out;
  }

  function parseValue(pointer) {
    skipWhitespace();
    positions.set(pointer, line);
    const char = text[i];

    if (char === "{") {
      advance(1);
      const object = {};
      skipWhitespace();
      if (text[i] === "}") { advance(1); return object; }
      for (;;) {
        skipWhitespace();
        const key = parseString();
        skipWhitespace();
        if (text[i] !== ":") fail("expected ':'");
        advance(1);
        object[key] = parseValue(`${pointer}/${key.replace(/~/g, "~0").replace(/\//g, "~1")}`);
        skipWhitespace();
        if (text[i] === ",") { advance(1); continue; }
        if (text[i] === "}") { advance(1); return object; }
        fail("expected ',' or '}'");
      }
    }

    if (char === "[") {
      advance(1);
      const array = [];
      skipWhitespace();
      if (text[i] === "]") { advance(1); return array; }
      for (;;) {
        array.push(parseValue(`${pointer}/${array.length}`));
        skipWhitespace();
        if (text[i] === ",") { advance(1); continue; }
        if (text[i] === "]") { advance(1); return array; }
        fail("expected ',' or ']'");
      }
    }

    if (char === "\"") return parseString();

    const literal = text.slice(i);
    if (literal.startsWith("true")) { advance(4); return true; }
    if (literal.startsWith("false")) { advance(5); return false; }
    if (literal.startsWith("null")) { advance(4); return null; }

    const number = /^-?\d+(\.\d+)?([eE][+-]?\d+)?/.exec(literal);
    if (number) { advance(number[0].length); return Number(number[0]); }

    return fail(`unexpected character ${JSON.stringify(char)}`);
  }

  const value = parseValue("");
  skipWhitespace();
  if (i < text.length) fail("trailing content after the root value");
  return { value, positions };
}

/* ------------------------------------------------------------------ *
 * Findings
 * ------------------------------------------------------------------ */

const SEVERITY = {
  FAIL: "FAIL",              // a gate rule is violated by present data
  SCHEMA_GAP: "SCHEMA_GAP",  // the field the rule tests is absent from the dataset
  BLOCKED: "BLOCKED",        // the check could not run (missing input)
  INFO: "INFO"               // observed, not a gate failure
};

class Report {
  constructor() {
    this.findings = [];
    this.passed = [];
    this.notImplemented = [];
  }

  add(severity, gate, rule, file, lineNumber, nature, extra) {
    this.findings.push(Object.assign({
      severity,
      gate,
      rule,
      file: file ? toRepoPath(file) : null,
      line: lineNumber === null || lineNumber === undefined ? null : lineNumber,
      nature
    }, extra || {}));
    if (severity !== SEVERITY.INFO) {
      this.passed = this.passed.filter((entry) => entry.gate !== gate);
    }
  }

  hasFailures(gate) {
    return this.findings.some((finding) =>
      finding.gate === gate && finding.severity !== SEVERITY.INFO);
  }

  pass(gate, rule, note) {
    if (this.hasFailures(gate)) return false;
    if (this.passed.some((entry) => entry.gate === gate && entry.rule === rule)) return true;
    this.passed.push({ gate, rule, note });
    return true;
  }

  skip(gate, rule, reason) {
    this.notImplemented.push({ gate, rule, reason });
  }

  get blocking() {
    return this.findings.filter((f) => f.severity !== SEVERITY.INFO);
  }
}

function toRepoPath(absoluteOrRelative) {
  const relative = path.isAbsolute(absoluteOrRelative)
    ? path.relative(REPO_ROOT, absoluteOrRelative)
    : absoluteOrRelative;
  return relative.split(path.sep).join("/");
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

function loadJson(report, relativePath, { required = true } = {}) {
  const absolute = path.join(REPO_ROOT, relativePath);
  if (!fs.existsSync(absolute)) {
    if (required) {
      report.add(SEVERITY.BLOCKED, "input", "file present", relativePath, null,
        "Required input file is absent; every check that depends on it could not run.");
    }
    return null;
  }
  let text;
  try {
    text = fs.readFileSync(absolute, "utf8");
  } catch (error) {
    report.add(SEVERITY.BLOCKED, "input", "file readable", relativePath, null,
      `File could not be read: ${error.message}`);
    return null;
  }
  try {
    const parsed = parseJsonWithPositions(text);
    return { file: relativePath, value: parsed.value, positions: parsed.positions, text };
  } catch (error) {
    // Fail closed: an unparseable file is a finding, never a silent skip.
    report.add(SEVERITY.BLOCKED, "input", "file parseable", relativePath, null,
      `File is not valid JSON: ${error.message}`);
    return null;
  }
}

function lineOf(doc, pointer) {
  if (!doc) return null;
  return doc.positions.has(pointer) ? doc.positions.get(pointer) : null;
}

/* ------------------------------------------------------------------ *
 * Normalisation helpers
 * ------------------------------------------------------------------ */

function normaliseTag(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const APPROVED_TAG_KEYS = new Set(APPROVED_TAGS.map(normaliseTag));
const DEPRECATED_TAG_KEYS = new Set(DEPRECATED_GENERIC_TAGS.map(normaliseTag));

// 00 section 13: an anchor must be exactly one concrete clause number.
const CONCRETE_CLAUSE_NO = /^\d+(\.\d+)*$/;
const CONCRETE_CLAUSE_ID = /^fidic_(1999|2017)_red_\d+(_\d+)*$/;
const COMBINED_ANCHOR_HINT = /[–—,/&]|\s-\s|\bto\b|\band\b/i;

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

/* ------------------------------------------------------------------ *
 * Gate 1 — Source Gate
 * ------------------------------------------------------------------ */

function collectAnchors(datasets) {
  const anchors = [];
  const push = (doc, pointer, raw, kind, fieldName = kind) => {
    // Definition numbers are secondary metadata under Clause 1.1, not clause anchors.
    if (fieldName === "definition_ref") return;
    if (isBlank(raw)) return;
    anchors.push({ file: doc.file, line: lineOf(doc, pointer), value: String(raw), kind });
  };

  const elements = datasets.clauseElements;
  if (elements) {
    elements.value.forEach((record, index) => {
      (record.source_clause_refs || []).forEach((ref, refIndex) => {
        push(elements, `/${index}/source_clause_refs/${refIndex}`, ref, "clause_id");
      });
    });
  }

  const nodeMap = datasets.nodeClauseMap;
  if (nodeMap) {
    nodeMap.value.forEach((record, index) => {
      push(nodeMap, `/${index}/fidic_clause_id`, record.fidic_clause_id, "clause_id");
    });
  }

  const tagIndex = datasets.tagClauseIndex;
  if (tagIndex) {
    tagIndex.value.forEach((record, index) => {
      push(tagIndex, `/${index}/clause_id`, record.clause_id, "clause_id");
      push(tagIndex, `/${index}/clause_no`, record.clause_no, "clause_no");
    });
  }

  const scope = datasets.scopeWorks;
  if (scope) {
    (scope.value.performance_nodes || []).forEach((node, nodeIndex) => {
      (node.primary_clauses || []).forEach((pair, pairIndex) => {
        push(scope, `/performance_nodes/${nodeIndex}/primary_clauses/${pairIndex}/0`, pair && pair[0], "clause_no");
        push(scope, `/performance_nodes/${nodeIndex}/primary_clauses/${pairIndex}/2/definition_ref`,
          pair && pair[2]?.definition_ref, "clause_no", "definition_ref");
      });
    });
    (scope.value.clause_mappings || []).forEach((mapping, mappingIndex) => {
      push(scope, `/clause_mappings/${mappingIndex}/clause_no`, mapping.clause_no, "clause_no");
      push(scope, `/clause_mappings/${mappingIndex}/definition_ref`, mapping.definition_ref,
        "clause_no", "definition_ref");
    });
    Object.keys(scope.value.tag_index || {}).forEach((tag) => {
      (scope.value.tag_index[tag] || []).forEach((pair, pairIndex) => {
        const key = tag.replace(/~/g, "~0").replace(/\//g, "~1");
        push(scope, `/tag_index/${key}/${pairIndex}/0`, pair && pair[0], "clause_no");
      });
    });
  }

  return anchors;
}

function isValidSourceClauseRecord(record, availableNumbers) {
  if (!record || typeof record.full_text !== "string") return false;
  if (record.full_text.length > 0) return true;
  const clauseNumber = String(record.clause_no || "");
  const children = record.child_clause_numbers;
  return record.is_container_clause === true
    && record.full_text === ""
    && CONCRETE_CLAUSE_NO.test(clauseNumber)
    && Array.isArray(children)
    && children.length > 0
    && new Set(children).size === children.length
    && children.every((number) => CONCRETE_CLAUSE_NO.test(String(number))
      && String(number).startsWith(`${clauseNumber}.`)
      && availableNumbers.has(String(number)));
}

function loadSourceLayer(report) {
  // Prefer the extracted layer; fall back to the tracked stub. Never assume.
  const processed = path.join(REPO_ROOT, "data/processed/fidic_2017_red_clauses.json");
  if (fs.existsSync(processed)) {
    const doc = loadJson(report, "data/processed/fidic_2017_red_clauses.json");
    if (doc) {
      const numbers = new Set();
      const ids = new Set();
      const clauseNumbers = new Set((doc.value.clauses || [])
        .map((clause) => String(clause?.clause_no || ""))
        .filter(Boolean));
      (doc.value.main_clauses || []).forEach((c) => { if (c.clause_no) numbers.add(String(c.clause_no)); });
      (doc.value.clauses || []).forEach((c, index) => {
        if (!isValidSourceClauseRecord(c, clauseNumbers)) {
          report.add(SEVERITY.FAIL, "Gate 1 — Source Gate", "1.2 source record has text or valid container",
            doc.file, lineOf(doc, `/clauses/${index}/full_text`),
            `Source record "${c?.clause_no || c?.id || index}" has no independent text and is not a valid container clause.`);
          return;
        }
        if (c.clause_no) numbers.add(String(c.clause_no));
        if (c.id) ids.add(String(c.id));
      });
      return { origin: "data/processed/fidic_2017_red_clauses.json", numbers, ids };
    }
  }
  const stub = loadJson(report, "data/fidic_2017_red_clauses.json", { required: false });
  if (stub) {
    const numbers = new Set();
    const ids = new Set();
    stub.value.forEach((c) => {
      if (c.clause_no) numbers.add(String(c.clause_no));
      if (c.id) ids.add(String(c.id));
    });
    return { origin: "data/fidic_2017_red_clauses.json", numbers, ids };
  }
  return null;
}

function gate1(report, datasets) {
  const gate = "Gate 1 — Source Gate";

  // 1.1 Every practice category and node has source basis.
  const sourceBasisTargets = [
    { doc: datasets.practiceCategories, kind: "practice category", pointer: (i) => `/${i}` },
    { doc: datasets.performanceNodes, kind: "performance node", pointer: (i) => `/${i}` }
  ];
  let sawSourceBasisField = false;
  sourceBasisTargets.forEach((target) => {
    if (!target.doc) return;
    const missing = target.doc.value.filter((r) => isBlank(r.source_basis));
    const present = target.doc.value.length - missing.length;
    if (present > 0) sawSourceBasisField = true;
    if (missing.length === target.doc.value.length && target.doc.value.length > 0) {
      report.add(SEVERITY.SCHEMA_GAP, gate, "1.1 source basis recorded", target.doc.file,
        lineOf(target.doc, "/0"),
        `The field source_basis required by 03 section 5 is absent from all ${target.doc.value.length} ${target.kind} records in this file.`,
        { affectedRecords: target.doc.value.length });
    } else if (missing.length > 0) {
      missing.forEach((record) => {
        const index = target.doc.value.indexOf(record);
        report.add(SEVERITY.FAIL, gate, "1.1 source basis recorded", target.doc.file,
          lineOf(target.doc, `/${index}`),
          `${target.kind} "${record.id}" has no source_basis.`);
      });
    }
  });
  if (sawSourceBasisField) report.pass(gate, "1.1 source basis recorded", "checked as a presence test only");

  // 1.2 Every clause anchor exists in the FIDIC source layer.
  // 1.3 No range or combined anchor remains.
  const anchors = collectAnchors(datasets);
  const sourceLayer = loadSourceLayer(report);

  let malformed = 0;
  anchors.forEach((anchor) => {
    const pattern = anchor.kind === "clause_id" ? CONCRETE_CLAUSE_ID : CONCRETE_CLAUSE_NO;
    if (!pattern.test(anchor.value)) {
      malformed += 1;
      const combined = COMBINED_ANCHOR_HINT.test(anchor.value);
      report.add(SEVERITY.FAIL, gate, "1.3 no range or combined anchor", anchor.file, anchor.line,
        combined
          ? `Anchor "${anchor.value}" is a range or combined reference; 00 section 13 requires exactly one concrete clause number per anchor.`
          : `Anchor "${anchor.value}" is not a single concrete clause number.`);
    }
  });
  if (malformed === 0 && anchors.length > 0) {
    report.pass(gate, "1.3 no range or combined anchor", `${anchors.length} anchors, all concrete`);
  }

  if (!sourceLayer) {
    report.add(SEVERITY.BLOCKED, gate, "1.2 anchor exists in source layer", null, null,
      "No FIDIC source layer is available, so anchor existence could not be verified.");
  } else {
    let unknown = 0;
    anchors.forEach((anchor) => {
      const known = anchor.kind === "clause_id"
        ? sourceLayer.ids.has(anchor.value)
        : sourceLayer.numbers.has(anchor.value);
      if (!known) {
        unknown += 1;
        report.add(SEVERITY.FAIL, gate, "1.2 anchor exists in source layer", anchor.file, anchor.line,
          `Anchor "${anchor.value}" does not exist in the FIDIC source layer (${sourceLayer.origin}).`);
      }
    });
    if (unknown === 0) {
      report.pass(gate, "1.2 anchor exists in source layer",
        `${anchors.length} anchors resolved against ${sourceLayer.origin}`);
    }
  }

  // 1.4 Any inferred item is clearly marked.
  let inferredSeen = 0;
  eachRecord(datasets, (doc, record, pointer) => {
    if (!Object.prototype.hasOwnProperty.call(record, "source_basis_status")) return;
    const status = record.source_basis_status;
    if (!SOURCE_BASIS_STATUSES.includes(status)) {
      report.add(SEVERITY.FAIL, gate, "1.4 inferred item marked", doc.file, lineOf(doc, pointer),
        `source_basis_status "${status}" is not one of the values listed in 03 section 8.`);
      return;
    }
    if (status !== "methodology_inferred") return;
    inferredSeen += 1;
    const review = reviewStatusOf(record);
    if (review !== "needs_lawyer_review") {
      report.add(SEVERITY.FAIL, gate, "1.4 inferred item marked", doc.file, lineOf(doc, pointer),
        "Item is marked methodology_inferred but its lawyer review status is not needs_lawyer_review, contrary to 03 section 4 Tier 4.");
    }
    if (record.benchmark_status !== "not_benchmark_ready") {
      report.add(SEVERITY.FAIL, gate, "1.4 inferred item marked", doc.file, lineOf(doc, pointer),
        "Item is marked methodology_inferred but its benchmark status is not not_benchmark_ready, contrary to 03 section 4 Tier 4.");
    }
  });
  if (inferredSeen > 0) report.pass(gate, "1.4 inferred item marked", `${inferredSeen} inferred items checked`);

  report.skip(gate, "1.1 source basis adequacy",
    "Whether a recorded source basis actually supports the item is a legal judgement (05 section 3). Only presence is testable.");
  report.skip(gate, "1.4 inferred-item detection",
    "Whether an unmarked item is in fact inferred cannot be determined mechanically; only the consistency of an existing mark is checked.");
}

/* ------------------------------------------------------------------ *
 * Gate 2 — Element Gate
 * ------------------------------------------------------------------ */

function gate2(report, datasets) {
  const gate = "Gate 2 — Element Gate";
  const structured = [];
  const freeText = [];

  const scope = datasets.scopeWorks;
  if (scope) {
    (scope.value.performance_nodes || []).forEach((node, nodeIndex) => {
      (node.elements || []).forEach((element, elementIndex) => {
        const pointer = `/performance_nodes/${nodeIndex}/elements/${elementIndex}`;
        (typeof element === "object" && element !== null ? structured : freeText)
          .push({ doc: scope, pointer, element });
      });
    });
    (scope.value.clause_mappings || []).forEach((mapping, mappingIndex) => {
      (mapping.elements || []).forEach((element, elementIndex) => {
        const pointer = `/clause_mappings/${mappingIndex}/elements/${elementIndex}`;
        (typeof element === "object" && element !== null ? structured : freeText)
          .push({ doc: scope, pointer, element });
      });
    });
  }

  const clauseElements = datasets.clauseElements;
  if (clauseElements) {
    clauseElements.value.forEach((record, index) => {
      structured.push({ doc: clauseElements, pointer: `/${index}`, element: record });
    });
  }

  if (freeText.length > 0) {
    const first = freeText[0];
    report.add(SEVERITY.SCHEMA_GAP, gate, "2.1-2.4 structured element record", first.doc.file,
      lineOf(first.doc, first.pointer),
      `${freeText.length} elements are stored as free-text strings. Gate 2 requires element records carrying element_type, core_mechanism, source_text_basis and primary_checklist_question (03 section 5 Step 5).`,
      { affectedRecords: freeText.length });
  }

  const checks = [
    { rule: "2.1 approved element type", field: "element_type" },
    { rule: "2.2 one core mechanism", field: "core_mechanism" },
    { rule: "2.3 source text basis", field: "source_text_basis" },
    { rule: "2.4 one primary checklist question", field: "primary_checklist_question" }
  ];

  checks.forEach((check) => {
    const withField = structured.filter((entry) =>
      Object.prototype.hasOwnProperty.call(entry.element, check.field));
    if (structured.length > 0 && withField.length === 0) {
      const first = structured[0];
      report.add(SEVERITY.SCHEMA_GAP, gate, check.rule, first.doc.file, lineOf(first.doc, first.pointer),
        `The field ${check.field} required by Gate 2 is absent from all ${structured.length} element records reachable from the data files.`,
        { affectedRecords: structured.length });
      return;
    }
    withField.forEach((entry) => {
      const value = entry.element[check.field];
      const line = lineOf(entry.doc, entry.pointer);
      if (check.field === "element_type") {
        if (!APPROVED_ELEMENT_TYPES.includes(value)) {
          report.add(SEVERITY.FAIL, gate, check.rule, entry.doc.file, line,
            `element_type "${value}" is not one of the three approved types in 00 section 6.`);
        }
        return;
      }
      if (check.field === "primary_checklist_question") {
        if (Array.isArray(value) && value.length !== 1) {
          report.add(SEVERITY.FAIL, gate, check.rule, entry.doc.file, line,
            `Element carries ${value.length} primary checklist questions; Gate 2.4 requires exactly one.`);
          return;
        }
      }
      if (isBlank(value) && !(Array.isArray(value) && value.length === 1)) {
        // 2.3 tolerates an absent basis only where the item is expressly inferred.
        if (check.field === "source_text_basis" && entry.element.source_basis_status === "methodology_inferred") return;
        report.add(SEVERITY.FAIL, gate, check.rule, entry.doc.file, line,
          `Element field ${check.field} is empty.`);
      }
    });
    if (withField.length > 0) report.pass(gate, check.rule, `${withField.length} element records checked`);
  });

  report.skip(gate, "2.2 singularity of the core mechanism",
    "Whether a stated mechanism is one mechanism or several is the judgement that drives the 03 section 7 split rule. Only presence is testable.");
  report.skip(gate, "2.5 supplementary questions tied to a qualifier",
    "Whether a supplementary checklist question is genuinely tied to a qualifier, limitation, evidence or comparison use is a legal judgement and is not mechanically decidable.");
  report.skip(gate, "2.3 adequacy of the source text basis",
    "Whether quoted source wording actually supports the element requires reading the clause against the element. Only presence is testable.");
}

/* ------------------------------------------------------------------ *
 * Gate 3 — Tag Gate
 * ------------------------------------------------------------------ */

function gate3(report, datasets) {
  const gate = "Gate 3 — Tag Gate";
  const seen = [];

  const clauseElements = datasets.clauseElements;
  if (clauseElements) {
    clauseElements.value.forEach((record, index) => {
      (record.legal_effect_tag_ids || []).forEach((tagId, tagIndex) => {
        seen.push({ doc: clauseElements, pointer: `/${index}/legal_effect_tag_ids/${tagIndex}`, label: tagId, id: tagId });
        const reason = record.tag_reason && record.tag_reason[tagId];
        if (isBlank(reason)) {
          report.add(SEVERITY.FAIL, gate, "3.4 tag reason recorded", clauseElements.file,
            lineOf(clauseElements, `/${index}`),
            `Tag "${tagId}" on clause element "${record.id}" has no tag_reason.`);
        }
      });
    });
  }

  const tagClauseIndex = datasets.tagClauseIndex;
  if (tagClauseIndex) {
    tagClauseIndex.value.forEach((record, index) => {
      seen.push({ doc: tagClauseIndex, pointer: `/${index}/tag_id`, label: record.tag_id, id: record.tag_id });
      if (isBlank(record.tag_reason)) {
        report.add(SEVERITY.FAIL, gate, "3.4 tag reason recorded", tagClauseIndex.file,
          lineOf(tagClauseIndex, `/${index}`),
          `Tag "${record.tag_id}" on clause ${record.clause_no} has no tag_reason.`);
      }
    });
  }

  const scope = datasets.scopeWorks;
  if (scope) {
    Object.keys(scope.value.tag_index || {}).forEach((tag) => {
      const key = tag.replace(/~/g, "~0").replace(/\//g, "~1");
      seen.push({ doc: scope, pointer: `/tag_index/${key}`, label: tag, id: tag });
    });
  }

  let unapproved = 0;
  let deprecated = 0;
  seen.forEach((entry) => {
    const key = normaliseTag(entry.label);
    const line = lineOf(entry.doc, entry.pointer);
    if (DEPRECATED_TAG_KEYS.has(key)) {
      deprecated += 1;
      report.add(SEVERITY.FAIL, gate, "3.3 no deprecated generic tag", entry.doc.file, line,
        `Tag "${entry.label}" is a withdrawn generic tag. 00 section 8 withdraws generic Claim, generic EOT and generic Breach / Default.`);
      return;
    }
    if (!APPROVED_TAG_KEYS.has(key)) {
      unapproved += 1;
      report.add(SEVERITY.FAIL, gate, "3.1 tag in approved dictionary", entry.doc.file, line,
        `Tag "${entry.label}" is not in the approved dictionary of 00 section 7.`);
    }
  });

  if (seen.length > 0 && unapproved === 0) {
    report.pass(gate, "3.1 tag in approved dictionary", `${seen.length} tag references checked`);
  }
  if (seen.length > 0 && deprecated === 0) {
    report.pass(gate, "3.3 no deprecated generic tag", `${seen.length} tag references checked`);
  }

  report.skip(gate, "3.2 express source wording supports the tag",
    "Whether clause wording expressly satisfies a tag definition is the core tagging judgement reserved to the Lawyer and Advisory Agent by 05 section 4. Only the presence of a recorded reason is testable.");
}

/* ------------------------------------------------------------------ *
 * Gate 4 — Mapping Gate
 * ------------------------------------------------------------------ */

function gate4(report, datasets) {
  const gate = "Gate 4 — Mapping Gate";

  // 4.1 One primary path per clause element.
  const nodeMap = datasets.nodeClauseMap;
  if (nodeMap) {
    const primaryByElement = new Map();
    nodeMap.value.forEach((record, index) => {
      if (record.mapping_type !== "primary") return;
      const key = record.clause_element_id;
      if (!primaryByElement.has(key)) primaryByElement.set(key, []);
      primaryByElement.get(key).push({ record, index });
    });
    let duplicates = 0;
    primaryByElement.forEach((entries, elementId) => {
      if (entries.length > 1) {
        duplicates += 1;
        entries.forEach((entry) => {
          report.add(SEVERITY.FAIL, gate, "4.1 one primary path", nodeMap.file,
            lineOf(nodeMap, `/${entry.index}`),
            `Clause element "${elementId}" has ${entries.length} primary mappings; Gate 4.1 expects one.`);
        });
      }
    });
    const elements = datasets.clauseElements;
    if (elements) {
      elements.value.forEach((record, index) => {
        if (!primaryByElement.has(record.id)) {
          report.add(SEVERITY.FAIL, gate, "4.1 one primary path", elements.file,
            lineOf(elements, `/${index}`),
            `Clause element "${record.id}" has no primary mapping in data/node_clause_map.json.`);
        }
      });
    }
    if (duplicates === 0 && primaryByElement.size > 0) {
      report.pass(gate, "4.1 one primary path", `${primaryByElement.size} clause elements checked`);
    }
  }

  // 4.3 Cross-link reason recorded for every secondary path.
  const scope = datasets.scopeWorks;
  if (scope) {
    let structuredSecondary = 0;
    let bareSecondary = 0;
    let firstBare = null;
    const visit = (list, pointer) => {
      (list || []).forEach((entry, index) => {
        if (typeof entry === "object" && entry !== null) {
          structuredSecondary += 1;
          if (isBlank(entry.cross_link_reason) && isBlank(entry.reason)) {
            report.add(SEVERITY.FAIL, gate, "4.3 cross-link reason recorded", scope.file,
              lineOf(scope, `${pointer}/${index}`),
              "Secondary path carries no cross-link reason.");
          }
        } else {
          bareSecondary += 1;
          if (!firstBare) firstBare = `${pointer}/${index}`;
        }
      });
    };
    (scope.value.performance_nodes || []).forEach((node, i) => visit(node.secondary_paths, `/performance_nodes/${i}/secondary_paths`));
    (scope.value.clause_mappings || []).forEach((m, i) => visit(m.secondary_paths, `/clause_mappings/${i}/secondary_paths`));

    if (bareSecondary > 0) {
      report.add(SEVERITY.SCHEMA_GAP, gate, "4.3 cross-link reason recorded", scope.file,
        lineOf(scope, firstBare),
        `${bareSecondary} secondary paths are stored as plain strings with no discrete cross-link reason field, so Gate 4.3 cannot be evaluated for them.`,
        { affectedRecords: bareSecondary });
    }
    if (structuredSecondary > 0) {
      report.pass(gate, "4.3 cross-link reason recorded", `${structuredSecondary} structured secondary paths checked`);
    }
  }

  report.skip(gate, "4.1 the \"where possible\" qualifier",
    "Gate 4.1 says one primary path \"where possible\". Whether a missing or duplicated primary path is justified is a legal judgement; the check reports the count and stops.");
  report.skip(gate, "4.2 genuineness of a cross-functional effect",
    "Whether a secondary path reflects a genuine cross-category effect rather than general relevance is a legal judgement (03 section 5 Step 4 rule 3).");
}

/* ------------------------------------------------------------------ *
 * Gate 5 — Review Gate
 * ------------------------------------------------------------------ */

function reviewStatusOf(record) {
  const candidates = [record.lawyer_review_status, record.verification_status, record.mapping_status];
  return candidates.find((value) => LAWYER_REVIEW_STATUSES.includes(value)) || null;
}

function gate5(report, datasets) {
  const gate = "Gate 5 — Review Gate";

  // 5.1 Every item carries a lawyer review status.
  let withStatus = 0;
  eachRecord(datasets, (doc, record, pointer) => {
    if (reviewStatusOf(record)) { withStatus += 1; return; }
    report.add(SEVERITY.FAIL, gate, "5.1 lawyer review status present", doc.file, lineOf(doc, pointer),
      `Record "${record.id || record.tag_id || pointer}" carries no lawyer review status from the 03 section 8 list.`);
  });
  if (withStatus > 0) report.pass(gate, "5.1 lawyer review status present", `${withStatus} records carry a review status`);

  // 5.2 No item is benchmark_ready unless lawyer_approved.
  let benchmarkFields = 0;
  eachRecord(datasets, (doc, record, pointer) => {
    if (!Object.prototype.hasOwnProperty.call(record, "benchmark_status")) return;
    benchmarkFields += 1;
    const value = record.benchmark_status;
    if (!BENCHMARK_STATUSES.includes(value)) {
      report.add(SEVERITY.FAIL, gate, "5.2 benchmark status valid", doc.file, lineOf(doc, pointer),
        `benchmark_status "${value}" is not one of the values listed in 03 section 8.`);
      return;
    }
    if (value === "benchmark_ready" && reviewStatusOf(record) !== "lawyer_approved") {
      report.add(SEVERITY.FAIL, gate, "5.2 benchmark_ready requires lawyer_approved", doc.file, lineOf(doc, pointer),
        "Item is benchmark_ready without lawyer_approved, which 03 section 8 prohibits outright.");
    }
  });
  if (benchmarkFields === 0) {
    report.add(SEVERITY.SCHEMA_GAP, gate, "5.2 benchmark status present", null, null,
      "No benchmark_status field exists in any data file, so the benchmark rule has nothing to evaluate.");
  } else {
    report.pass(gate, "5.2 benchmark_ready requires lawyer_approved", `${benchmarkFields} records carry benchmark_status`);
  }

  // 5.3 Change log present.
  const controlDir = path.join(REPO_ROOT, "project-control");
  if (fs.existsSync(controlDir)) {
    fs.readdirSync(controlDir)
      .filter((name) => name.endsWith(".md"))
      .forEach((name) => {
        const relative = `project-control/${name}`;
        const lines = fs.readFileSync(path.join(controlDir, name), "utf8").split(/\r?\n/);
        const found = lines.findIndex((line) => /change log/i.test(line));
        if (found === -1) {
          report.add(SEVERITY.FAIL, gate, "5.3 change log present", relative, 1,
            "File has no change log section.");
        }
      });
    report.pass(gate, "5.3 change log present", "project-control markdown files checked for a change log section");
  }

  // 00 section 10: the execution matrices the gates are written to govern.
  const executionDir = path.join(REPO_ROOT, "project-control/category-execution");
  const present = EXECUTION_MATRICES.filter((name) => fs.existsSync(path.join(executionDir, name)));
  if (present.length < EXECUTION_MATRICES.length) {
    report.add(SEVERITY.BLOCKED, gate, "execution matrix present", "project-control/category-execution", null,
      `${EXECUTION_MATRICES.length - present.length} of ${EXECUTION_MATRICES.length} category execution matrices required by 00 section 10 do not exist. Gates 1-5 govern those matrices; over the data files they can only be applied by analogy.`);
  }

  report.skip(gate, "5.3 currency of the change log",
    "Whether a change log is up to date with the latest substantive change cannot be determined mechanically; only the presence of the section is testable.");
}

/* ------------------------------------------------------------------ *
 * Reserved-field validation block — 05 section 7
 * ------------------------------------------------------------------ */

const SCAN_DIRECTORIES = ["data", "project-control", "reports", "scripts", "tests", "docs"];
const SCAN_EXTENSIONS = new Set([".json", ".md", ".js", ".html", ".txt", ".csv"]);
const SCAN_EXCLUDE = new Set([".git", "__pycache__", "node_modules", "source"]);
const RESERVED_SCAN_EXCLUDE_FILES = new Set([
  "data/elements.json",
  "data/sub_issues.json",
  "data/fidic_2017_red_map.json",
  "data/tags.json",
  "scripts/qa_gates.js"
]);

function walk(directory, out) {
  if (!fs.existsSync(directory)) return out;
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (SCAN_EXCLUDE.has(entry.name)) return;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  });
  return out;
}

function scanReservedText(report, relative, text) {
  if (RESERVED_SCAN_EXCLUDE_FILES.has(relative)) return 0;

  const gate = "Reserved fields — 05 section 7";
  const isVocabulary = VOCABULARY_FILES.includes(relative);
  const lines = text.split(/\r?\n/);
  let violations = 0;

  RESERVED.forEach((reserved) => {
    // Structured form: the field actually set to the reserved value.
    const structured = new RegExp(
      `["']?${reserved.field}["']?\\s*[:=|]\\s*["']?${reserved.value}\\b`, "g");
    // Bare form: the reserved value appearing on its own, e.g. a matrix cell.
    const bare = new RegExp(`\\b${reserved.value}\\b`, "g");

    lines.forEach((lineText, index) => {
      const lineNumber = index + 1;
      const hasStructured = structured.test(lineText);
      structured.lastIndex = 0;
      const hasBare = bare.test(lineText);
      bare.lastIndex = 0;
      if (!hasStructured && !hasBare) return;

      if (isVocabulary) {
        report.add(SEVERITY.INFO, gate, `${reserved.field} = ${reserved.value}`, relative, lineNumber,
          "Reserved value appears in a governing protocol file that defines the vocabulary; treated as a definition, not a data write.");
        return;
      }
      violations += 1;
      report.add(SEVERITY.FAIL, gate, `${reserved.field} = ${reserved.value}`, relative, lineNumber,
        hasStructured
          ? `Reserved value ${reserved.value} is assigned to ${reserved.field}. 05 section 7 permits this only when written manually by the Lawyer.`
          : `Reserved value ${reserved.value} appears here. 05 section 7 permits this only when written manually by the Lawyer.`);
    });
  });

  return violations;
}

function scanReservedFields(report) {
  const gate = "Reserved fields — 05 section 7";
  const files = [];
  SCAN_DIRECTORIES.forEach((dir) => walk(path.join(REPO_ROOT, dir), files));
  ["README.md", "CLAUDE.md", "index.html", "app.js", "pc_alignment_engine.js"].forEach((name) => {
    const full = path.join(REPO_ROOT, name);
    if (fs.existsSync(full)) files.push(full);
  });

  let violations = 0;
  let scannedFiles = 0;

  files.forEach((absolute) => {
    const relative = toRepoPath(absolute);
    if (RESERVED_SCAN_EXCLUDE_FILES.has(relative)) return;
    let text;
    try {
      text = fs.readFileSync(absolute, "utf8");
    } catch (error) {
      report.add(SEVERITY.BLOCKED, gate, "file readable", relative, null,
        `File could not be read, so it could not be cleared: ${error.message}`);
      return;
    }
    scannedFiles += 1;
    violations += scanReservedText(report, relative, text);
  });

  if (violations === 0) {
    report.pass(gate, "no reserved value written", `${scannedFiles} files scanned`);
  }

  report.skip(gate, "authorship of a reserved value",
    "05 section 7 blocks a reserved value \"that was not made by the Lawyer\". A content scan cannot establish authorship, and the attribution mechanism (git author identity, signed commits, or a lawyer-maintained allowlist) has not been decided. This check therefore reports every occurrence and cannot distinguish a lawyer-authored one.");
}

/* ------------------------------------------------------------------ *
 * Shared record iteration
 * ------------------------------------------------------------------ */

function eachRecord(datasets, visit) {
  const flatLists = ["practiceCategories", "performanceNodes", "clauseElements", "nodeClauseMap", "tagClauseIndex"];
  flatLists.forEach((key) => {
    const doc = datasets[key];
    if (!doc || !Array.isArray(doc.value)) return;
    doc.value.forEach((record, index) => {
      if (record && typeof record === "object") visit(doc, record, `/${index}`);
    });
  });
  const scope = datasets.scopeWorks;
  if (scope) {
    (scope.value.clause_mappings || []).forEach((record, index) => {
      if (record && typeof record === "object") visit(scope, record, `/clause_mappings/${index}`);
    });
  }
}

/* ------------------------------------------------------------------ *
 * Runner
 * ------------------------------------------------------------------ */

function loadDatasets(report) {
  return {
    practiceCategories: loadJson(report, "data/practice_categories.json"),
    performanceNodes: loadJson(report, "data/performance_nodes.json"),
    clauseElements: loadJson(report, "data/clause_elements.json"),
    nodeClauseMap: loadJson(report, "data/node_clause_map.json"),
    tagClauseIndex: loadJson(report, "data/tag_clause_index.json"),
    scopeWorks: loadJson(report, "data/scope_works_v1.json")
  };
}

function run(selected) {
  const report = new Report();
  const datasets = loadDatasets(report);
  const wanted = (name) => !selected || selected === name;

  if (wanted("1")) gate1(report, datasets);
  if (wanted("2")) gate2(report, datasets);
  if (wanted("3")) gate3(report, datasets);
  if (wanted("4")) gate4(report, datasets);
  if (wanted("5")) gate5(report, datasets);
  if (wanted("reserved")) scanReservedFields(report);

  return report;
}

const SEVERITY_ORDER = [SEVERITY.FAIL, SEVERITY.SCHEMA_GAP, SEVERITY.BLOCKED, SEVERITY.INFO];

function formatText(report, options) {
  const out = [];
  out.push("QA GATES — 03 section 10 and 05 section 7");
  out.push("=".repeat(72));

  SEVERITY_ORDER.forEach((severity) => {
    const group = report.findings.filter((f) => f.severity === severity);
    if (group.length === 0) return;
    out.push("");
    out.push(`${severity} (${group.length})`);
    out.push("-".repeat(72));
    group.forEach((finding) => {
      const location = finding.file
        ? `${finding.file}${finding.line ? `:${finding.line}` : ""}`
        : "(repository)";
      out.push(`  ${location}`);
      out.push(`    ${finding.gate} / ${finding.rule}`);
      out.push(`    ${finding.nature}`);
    });
  });

  if (!options.quiet && report.passed.length > 0) {
    out.push("");
    out.push(`PASSED (${report.passed.length})`);
    out.push("-".repeat(72));
    report.passed.forEach((entry) => {
      out.push(`  ${entry.gate} / ${entry.rule}${entry.note ? ` — ${entry.note}` : ""}`);
    });
  }

  out.push("");
  out.push(`NOT MECHANICALLY CHECKABLE (${report.notImplemented.length})`);
  out.push("-".repeat(72));
  report.notImplemented.forEach((entry) => {
    out.push(`  ${entry.gate} / ${entry.rule}`);
    out.push(`    ${entry.reason}`);
  });

  const counts = SEVERITY_ORDER
    .map((severity) => `${severity}=${report.findings.filter((f) => f.severity === severity).length}`)
    .join("  ");
  out.push("");
  out.push("=".repeat(72));
  out.push(`SUMMARY  ${counts}  PASSED=${report.passed.length}  NOT_MECHANICAL=${report.notImplemented.length}`);
  out.push(report.blocking.length === 0
    ? "RESULT   pass"
    : `RESULT   fail — ${report.blocking.length} findings require attention`);
  out.push("");
  out.push("No correction is proposed for any finding that turns on legal judgement.");
  out.push("Report only; escalate under 05 section 9.");

  return out.join("\n");
}

function main(argv) {
  const options = {
    json: argv.includes("--json"),
    quiet: argv.includes("--quiet"),
    gate: (argv.find((a) => a.startsWith("--gate=")) || "").split("=")[1] || null
  };

  let report;
  try {
    report = run(options.gate);
  } catch (error) {
    process.stderr.write(`qa_gates.js failed to run: ${error.stack}\n`);
    return 2;
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify({
      findings: report.findings,
      passed: report.passed,
      notImplemented: report.notImplemented,
      result: report.blocking.length === 0 ? "pass" : "fail"
    }, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatText(report, options)}\n`);
  }

  return report.blocking.length === 0 ? 0 : 1;
}

module.exports = {
  nodeVersionSupported,
  parseJsonWithPositions,
  normaliseTag,
  reviewStatusOf,
  isBlank,
  collectAnchors,
  isValidSourceClauseRecord,
  scanReservedText,
  scanReservedFields,
  run,
  main,
  Report,
  SEVERITY,
  APPROVED_TAGS,
  APPROVED_ELEMENT_TYPES,
  DEPRECATED_GENERIC_TAGS,
  LAWYER_REVIEW_STATUSES,
  BENCHMARK_STATUSES,
  CONCRETE_CLAUSE_NO,
  CONCRETE_CLAUSE_ID
};

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
