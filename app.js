const MAIN_CATEGORIES_PATH = "data/modules.json";
const SYSTEM_PRESENTATION_SLOTS = [
  {
    panel: { x: 940, y: 4, side: "right" }, approved: true,
    categories: [
      "Main Performance Obligations / 主要义务",
      "Ancillary Management Obligations / 附带义务，即管理",
      "Employer Enabling Obligations / 业主 / 对方使能义务",
      "Scope Variables and Variations / 变量，即变更"
    ]
  },
  {
    panel: { x: 940, y: 116, side: "right" },
    categories: ["Commencement", "Programme", "Progress Control", "EOT", "Completion"]
  },
  {
    panel: { x: 940, y: 228, side: "right" },
    categories: ["Price Basis", "Payment Process", "Certification", "Deductions and Final Account"]
  },
  {
    panel: { x: 940, y: 356, side: "right" },
    categories: ["Risk Allocation", "Insurance", "Indemnities", "Securities"]
  },
  {
    panel: { x: 10, y: 344, side: "left" },
    categories: ["Delay Consequences", "Defects Consequences", "Termination Rights", "Post-Termination Effects"]
  },
  {
    panel: { x: 10, y: 184, side: "left" },
    categories: ["Claims Procedure", "Determination", "Dispute Escalation", "Arbitration"]
  },
  {
    panel: { x: 10, y: 24, side: "left" },
    categories: [
      "Definitions & Interpretation",
      "Notices & Communications",
      "Contract Administration",
      "Document Hierarchy"
    ]
  }
];
let contractSystems = [];
let mainCategoryLoadError = null;

const fidicClauses = [
  { number: 1, title: "General Provisions", color: "#8793a0" },
  { number: 2, title: "The Employer", color: "#5da965" },
  { number: 3, title: "The Engineer", color: "#519f67" },
  { number: 4, title: "The Contractor", color: "#438d5c" },
  { number: 5, title: "Subcontracting", color: "#81b980" },
  { number: 6, title: "Staff and Labour", color: "#9caf8b" },
  { number: 7, title: "Plant, Materials and Workmanship", color: "#a9b99c" },
  { number: 8, title: "Commencement, Delays and Suspension", color: "#d88745" },
  { number: 9, title: "Tests on Completion", color: "#d5a843" },
  { number: 10, title: "Employer’s Taking Over", color: "#c99638" },
  { number: 11, title: "Defects after Taking Over", color: "#b98a3a" },
  { number: 12, title: "Measurement and Valuation", color: "#4f8fd8" },
  { number: 13, title: "Variations and Adjustments", color: "#32a787" },
  { number: 14, title: "Contract Price and Payment", color: "#38acc1" },
  { number: 15, title: "Termination by Employer", color: "#cf5b5e" },
  { number: 16, title: "Suspension and Termination by Contractor", color: "#b94d55" },
  { number: 17, title: "Care of the Works and Indemnities", color: "#8468c4" },
  { number: 18, title: "Exceptional Events", color: "#9a83c9" },
  { number: 19, title: "Insurance", color: "#a75f9d" },
  { number: 20, title: "Employer’s and Contractor’s Claims", color: "#c64f89" },
  { number: 21, title: "Disputes and Arbitration", color: "#ad3e7b" }
];

const tagGroupsData = [
  {
    title: "Entitlement & Procedure",
    chineseTitle: "权利主张与程序门槛",
    tags: ["Claim for EOT", "Claim for Cost", "Condition Precedent", "Counterclaim / Countercharge", "Time Bar", "Waiver / Non-Waiver / Discharge"]
  },
  {
    title: "Determination & Deemed Effects",
    chineseTitle: "决定机制与拟制效果",
    tags: ["Deemed Approval", "Deemed Rejection", "Determination"]
  },
  {
    title: "Remedies, Risk & Payment Controls",
    chineseTitle: "救济、风险与付款控制",
    tags: ["Back-to-back", "Contractor Breach / Default", "Employer Breach / Default", "Deduction", "Indemnity", "Remedy", "Set-off", "Termination Trigger", "Withholding"]
  }
];

const tagClauseMappings = {
  "Back-to-back": [],
  "Claim for EOT": [],
  "Claim for Cost": [],
  "Contractor Breach / Default": [],
  "Employer Breach / Default": [],
  Determination: [],
  "Condition Precedent": [],
  "Time Bar": [],
  "Deemed Approval": [],
  "Deemed Rejection": [],
  Deduction: [],
  Withholding: [],
  "Set-off": [],
  Indemnity: [],
  Remedy: [],
  "Termination Trigger": [],
  "Waiver / Non-Waiver / Discharge": [],
  "Counterclaim / Countercharge": []
};

const RING_CENTER = { x: 610, y: 280 };
const RING_RADIUS = 270;
const PANEL_WIDTH = 270;
const PANEL_LINK_Y = 43;

const architecture = document.getElementById("architecture");
const selectionCount = document.getElementById("selectionCount");
const clearSelection = document.getElementById("clearSelection");
const emptyHint = document.getElementById("emptyHint");
const openScopeWorkspace = document.getElementById("openScopeWorkspace");
const clauseSpine = document.getElementById("clauseSpine");
const clauseDetail = document.getElementById("clauseDetail");
const clauseDirectoryCount = document.getElementById("clauseDirectoryCount");
const scopeWorkspace = document.getElementById("scopeWorkspace");
const scopeCategories = document.getElementById("scopeCategories");
const scopeNodes = document.getElementById("scopeNodes");
const scopeDetail = document.getElementById("scopeDetail");
const tagGroups = document.getElementById("tagGroups");
const tagResultsPanel = document.getElementById("tagResultsPanel");
const tagResultsTitle = document.getElementById("tag-results-title");
const tagResultCount = document.getElementById("tagResultCount");
const tagResults = document.getElementById("tagResults");
const tagClauseDetail = document.getElementById("tagClauseDetail");
const viewOptions = [...document.querySelectorAll("[data-view-target]")];
const appViews = [...document.querySelectorAll("#baselineWorkspace > .app-view")];
const workspaceOptions = [...document.querySelectorAll("[data-workspace-target]")];
const baselineWorkspace = document.getElementById("baselineWorkspace");
const pcWorkspace = document.getElementById("pcWorkspace");
const baselineViewSelector = document.getElementById("baselineViewSelector");
const pcViewSelector = document.getElementById("pcViewSelector");
const pcViewOptions = [...document.querySelectorAll("[data-pc-view-target]")];
const pcViews = [...document.querySelectorAll(".pc-view")];
const pcProjectName = document.getElementById("pcProjectName");
const pcContractReference = document.getElementById("pcContractReference");
const pcNotes = document.getElementById("pcNotes");
const pcSourceFile = document.getElementById("pcSourceFile");
const pcDropZone = document.getElementById("pcDropZone");
const pcIntakeMessage = document.getElementById("pcIntakeMessage");
const PC_REVIEW_SCHEMA_VERSION = "pc-review-project-1.1";
const PC_REVIEW_LEGACY_SCHEMA_VERSION = "pc-review-project-1.0";
const PC_STRUCTURED_INPUT_SCHEMA_VERSION = "pc-amendment-input-1.0";
const PC_ALIGNMENT_STATUSES = PCAlignmentEngine.ALIGNMENT_STATUSES;
const PC_TARGET_BASES = PCAlignmentEngine.TARGET_BASES;
const PC_SUPPORTED_OPERATIONS = PCAlignmentEngine.SUPPORTED_OPERATIONS;
const PC_PROJECT_STATUSES = [
  "Source Loaded", "Requires Preprocessing", "Amendments Not Yet Identified", "Amendments Identified",
  "Clause Alignment Not Started", "Clause Alignment Review", "Clause-specific Consolidation"
];
const PC_APPLICATION_STATUSES = [
  "Not Assessed", "Identified – Deferred", "Blocking Dependency", "Not Yet Supported / Human Review Required",
  "Previewed", "Applied", "Failed", "Rejected", "Rolled Back"
];
const PC_AMENDMENT_CATEGORIES = [
  "Clause-specific Amendment", "Contract Data", "Defined-term Amendment",
  "Global Amendment", "New Clause", "Unclassified Instruction"
];
const PC_AMENDMENT_OPERATIONS = [
  "Delete Exact Text", "Delete Paragraph", "Delete Entire Sub-Clause", "Replace Exact Text",
  "Replace Paragraph", "Replace Entire Sub-Clause", "Insert Before", "Insert After", "Add Paragraph",
  "Add New Sub-Clause", "Amend Clause Heading", "Complete Contract Data", "Renumber",
  "Amend Cross-reference", "Amend Defined Term", "Global Amendment", "Unclassified Instruction"
];
let pcReviewData = createPcReviewPackage();
let pcPendingJsonImport = null;
let pcActiveSourceDocumentId = null;
let pcExportObjectUrl = null;
let pcWorkbenchAmendmentId = null;
let pcWorkbenchTab = "effective";
const pcSelectedAmendmentIds = new Set();
const pcApplicationPreviews = new Map();
const selectedSystems = new Set();
let selectedClauseNumber = null;
let selectedTag = null;
let selectedTagClause = null;
let fidicSourceLayer = null;
let clauseLoadError = null;
let clauseSearchQuery = "";
let scopeData = null;
let selectedScopeCategory = null;
let selectedScopeNode = null;
let clauseNavigationOrigin = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const CONCRETE_CLAUSE_REFERENCE = /^\d+(?:\.\d+)*$/;

function expandClauseAnchor(reference) {
  const value = String(reference ?? "").trim();
  const separateReferences = value.split(/\s*\/\s*/).filter(Boolean);
  if (separateReferences.length > 1) {
    return separateReferences.flatMap(expandClauseAnchor);
  }

  const range = value.replace(/\s+to\s+/gi, "–").replaceAll("—", "–").split(/\s*–\s*/);
  if (range.length === 1) return [value];
  if (range.length !== 2) return [];

  const startParts = range[0].split(".");
  const endParts = range[1].split(".");
  const normalizedEndParts = endParts.length === 1 && startParts.length > 1
    ? [...startParts.slice(0, -1), endParts[0]]
    : endParts;
  const sameParent = startParts.length === normalizedEndParts.length
    && startParts.slice(0, -1).every((part, index) => part === normalizedEndParts[index]);
  const start = Number(startParts.at(-1));
  const end = Number(normalizedEndParts.at(-1));
  if (!sameParent || !Number.isInteger(start) || !Number.isInteger(end) || end < start) return [];

  const parent = startParts.slice(0, -1);
  return Array.from({ length: end - start + 1 }, (_, index) => [...parent, start + index].join("."));
}

function normalizeClauseAnchorTuples(tuples, context) {
  if (!Array.isArray(tuples)) throw new Error(`${context} must be an array`);
  const normalized = tuples.flatMap(([reference, title, metadata]) => {
    const clauseNumbers = expandClauseAnchor(reference);
    if (!clauseNumbers.length || clauseNumbers.some((number) => !CONCRETE_CLAUSE_REFERENCE.test(number))) {
      throw new Error(`${context} contains an invalid clause anchor: ${reference}`);
    }
    const definitionRef = metadata?.definition_ref ? String(metadata.definition_ref).trim() : null;
    if (definitionRef && (!CONCRETE_CLAUSE_REFERENCE.test(definitionRef)
      || !clauseNumbers.every((number) => definitionRef.startsWith(`${number}.`)))) {
      throw new Error(`${context} contains an invalid definition_ref: ${definitionRef}`);
    }
    return clauseNumbers.map((number) => definitionRef
      ? [number, title, { definition_ref: definitionRef }]
      : [number, title]);
  });
  return normalized.filter(([number, , metadata], index) => {
    const key = `${number}|${metadata?.definition_ref || ""}`;
    return normalized.findIndex(([candidate, , candidateMetadata]) => (
      `${candidate}|${candidateMetadata?.definition_ref || ""}` === key
    )) === index;
  });
}

function enforceProjectClauseAnchorRule(data) {
  data.performance_nodes.forEach((node) => {
    node.primary_clauses = normalizeClauseAnchorTuples(
      node.primary_clauses,
      `performance_nodes.${node.id}.primary_clauses`
    );
  });
  Object.entries(data.tag_index).forEach(([tag, clauses]) => {
    data.tag_index[tag] = normalizeClauseAnchorTuples(clauses, `tag_index.${tag}`);
  });
  return data;
}

function validateScopeDataShape(data) {
  if (!data || typeof data !== "object") throw new Error("Scope v1 root must be an object");
  if (!Array.isArray(data.practice_categories)) throw new Error("Scope v1 practice_categories must be an array");
  if (!Array.isArray(data.performance_nodes)) throw new Error("Scope v1 performance_nodes must be an array");
  if (!data.tag_index || typeof data.tag_index !== "object" || Array.isArray(data.tag_index)) {
    throw new Error("Scope v1 tag_index must be an object");
  }
  data.performance_nodes.forEach((node) => {
    if (!node.id || !node.practice_category_id || !node.primary_path) {
      throw new Error("Scope v1 performance node is missing id, practice_category_id or primary_path");
    }
    if (!Array.isArray(node.primary_clauses)) throw new Error(`performance_nodes.${node.id}.primary_clauses must be an array`);
    node.primary_clauses.forEach((tuple, index) => {
      if (!Array.isArray(tuple) || tuple.length < 2 || tuple.length > 3 || !tuple[0] || !tuple[1]) {
        throw new Error(`performance_nodes.${node.id}.primary_clauses[${index}] must be [clause_no, clause_title, optional metadata]`);
      }
      if (tuple.length === 3 && (!tuple[2] || typeof tuple[2] !== "object" || Array.isArray(tuple[2]) || !tuple[2].definition_ref)) {
        throw new Error(`performance_nodes.${node.id}.primary_clauses[${index}] metadata must contain definition_ref`);
      }
    });
    if (!Array.isArray(node.secondary_paths)) throw new Error(`performance_nodes.${node.id}.secondary_paths must be an array`);
    if (!Array.isArray(node.elements)) throw new Error(`performance_nodes.${node.id}.elements must be an array`);
  });
  Object.entries(data.tag_index).forEach(([tag, clauses]) => {
    if (!Array.isArray(clauses)) throw new Error(`tag_index.${tag} must be an array`);
    clauses.forEach((tuple, index) => {
      if (!Array.isArray(tuple) || tuple.length !== 2 || !tuple[0] || !tuple[1]) {
        throw new Error(`tag_index.${tag}[${index}] must be [clause_no, clause_title]`);
      }
    });
  });
  return data;
}

const FIDIC_SOURCE_LAYER_PATH = "data/processed/fidic_2017_red_clauses.json";
const FIDIC_SOURCE_LAYER_FILE_SHA256 = "7c90835b50988e4fd7429a8be952904adc2c0f40406b9f38e99e60868f8d3497";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

async function sha256Utf8Text(value) {
  if (!globalThis.crypto?.subtle || typeof TextEncoder !== "function") throw new Error("browser SHA-256 support is unavailable");
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function fetchLocalJsonWithRetry(path, attempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const separator = path.includes("?") ? "&" : "?";
      const response = await fetch(`${path}${separator}load_attempt=${attempt}&ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
      const raw = await response.text();
      if (!raw.trim()) throw new Error("empty response body");
      try {
        const parsed = JSON.parse(raw);
        Object.defineProperty(parsed, "runtime_source_layer_sha256", { value: await sha256Utf8Text(raw), enumerable: false });
        return parsed;
      } catch (error) {
        throw new Error(`invalid JSON response: ${error.message}`);
      }
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => window.setTimeout(resolve, 250 * attempt));
    }
  }
  throw new Error(`${FIDIC_SOURCE_LAYER_PATH} failed after ${attempts} attempts: ${lastError?.message || "unknown error"}`);
}

async function loadClauseSourceLayer() {
  clauseDirectoryCount.textContent = "21 main clauses · loading source layer";
  try {
    const sourceLayer = await fetchLocalJsonWithRetry(FIDIC_SOURCE_LAYER_PATH);
    if (!Array.isArray(sourceLayer.main_clauses) || !Array.isArray(sourceLayer.clauses)) {
      throw new Error("invalid source-layer structure");
    }
    const sourceGate = PCAlignmentEngine.sourceLayerGate(sourceLayer);
    if (!sourceGate.ok) throw new Error(sourceGate.reason);
    if (sourceLayer.runtime_source_layer_sha256 !== FIDIC_SOURCE_LAYER_FILE_SHA256) throw new Error("controlled source-layer file SHA-256 mismatch");
    fidicSourceLayer = deepFreeze(sourceLayer);
    clauseLoadError = null;
    if (pcReviewData.project) {
      pcReviewData.project.baseline_source_sha256 = pcReviewData.project.baseline_source_sha256 || sourceLayer.source_sha256 || null;
      pcReviewData.project.baseline_source_layer_sha256 = pcReviewData.project.baseline_source_layer_sha256 || sourceLayer.runtime_source_layer_sha256 || null;
      pcReviewData.project.baseline_verification_status = "Not Verified";
      pcReviewData.project.consolidation_mode = "Preview / Unverified Baseline";
      pcReviewData.project.publication_eligible = false;
    }
    clauseDirectoryCount.textContent = `${sourceLayer.main_clause_count} main clauses · ${sourceLayer.sub_clause_count} sub-clauses`;
    renderClauseSpine();
    selectClause(selectedClauseNumber || 1);
    if (pcReviewData.amendments.length) pcEvaluateAllAlignments({ recordHistory: false });
    updatePcProjectSummary();
  } catch (error) {
    clauseLoadError = error;
    clauseDirectoryCount.textContent = "21 main clauses · source layer unavailable";
    renderClauseSpine();
    renderClauseLoadError();
    if (pcReviewData.amendments.length) pcEvaluateAllAlignments({ recordHistory: false });
    updatePcProjectSummary();
    console.error("Could not load the local FIDIC source layer", error);
  }
}

async function loadScopeData() {
  try {
    const response = await fetch("data/scope_works_v1.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    scopeData = enforceProjectClauseAnchorRule(validateScopeDataShape(await response.json()));
    scopeData.clause_mappings = buildScopeClauseMappings(scopeData);
    Object.keys(tagClauseMappings).forEach((tag) => { tagClauseMappings[tag] = []; });
    Object.entries(scopeData.tag_index).forEach(([tag, clauses]) => {
      tagClauseMappings[tag] = clauses;
    });
    renderScopeWorkspace();
    renderClauseSpine();
    if (selectedClauseNumber) selectClause(selectedClauseNumber);
  } catch (error) {
    scopeWorkspace.hidden = false;
    scopeNodes.innerHTML = `<div class="scope-empty">Scope v1 data could not be loaded.</div>`;
    console.error("Failed to load Scope v1 data:", error);
  }
}

function buildScopeClauseMappings(data) {
  const clauseIndex = new Map();
  data.performance_nodes.forEach((node) => {
    node.primary_clauses.forEach(([clauseNo, clauseTitle, metadata]) => {
      const definitionRef = metadata?.definition_ref || null;
      const mappingKey = `${clauseNo}|${definitionRef || ""}`;
      const existing = clauseIndex.get(mappingKey);
      if (!existing) {
        const category = data.practice_categories.find((item) => item.id === node.practice_category_id);
        clauseIndex.set(mappingKey, {
          id: `scope_${(definitionRef || clauseNo).replaceAll(".", "_")}`,
          main_system: data.main_system,
          practice_category: category?.name || node.practice_category_id,
          performance_node: node.name,
          performance_node_id: node.id,
          clause_no: clauseNo,
          clause_title: clauseTitle,
          ...(definitionRef ? { definition_ref: definitionRef } : {}),
          primary_path: node.primary_path,
          secondary_paths: [...node.secondary_paths],
          elements: [...node.elements],
          legal_effect_tags: [],
          tag_reasons: {},
          source_status: data.source_status,
          qc_status: data.qc_status,
          lawyer_review_status: data.lawyer_review_status
        });
      } else if (node.primary_path !== existing.primary_path && !existing.secondary_paths.includes(node.primary_path)) {
        existing.secondary_paths.push(node.primary_path);
      }
    });
  });
  Object.entries(data.tag_index).forEach(([tag, clauses]) => {
    clauses.forEach(([clauseNo, clauseTitle]) => {
      const mappingKey = `${clauseNo}|`;
      let mapping = clauseIndex.get(mappingKey);
      if (!mapping) {
        const node = findScopeNodesForClause(clauseNo, data)[0];
        const category = data.practice_categories.find((item) => item.id === node?.practice_category_id);
        mapping = {
          id: `scope_${clauseNo.replaceAll(".", "_")}`,
          main_system: data.main_system,
          practice_category: category?.name || "Scope cross-link",
          performance_node: node?.name || "Scope cross-link",
          performance_node_id: node?.id || null,
          clause_no: clauseNo,
          clause_title: clauseTitle,
          primary_path: node?.primary_path || `${data.main_system || "Main Category"} > Approved tag mapping`,
          secondary_paths: node ? [...node.secondary_paths] : [],
          elements: node ? [...node.elements] : [],
          legal_effect_tags: [], tag_reasons: {},
          source_status: data.source_status, qc_status: data.qc_status,
          lawyer_review_status: data.lawyer_review_status
        };
        clauseIndex.set(mappingKey, mapping);
      }
      mapping.clause_title = clauseTitle;
      if (!mapping.legal_effect_tags.includes(tag)) mapping.legal_effect_tags.push(tag);
      mapping.tag_reasons[tag] = data.tag_reason_templates[tag];
    });
  });
  return [...clauseIndex.values()];
}

function findScopeNodesForClause(clauseNo, data = scopeData) {
  if (!data) return [];
  return data.performance_nodes.filter((node) =>
    node.primary_clauses.some(([anchor]) => scopeAnchorMatches(anchor, clauseNo))
  );
}

function scopeAnchorMatches(anchor, clauseNo) {
  const cleanAnchor = String(anchor).replaceAll(" to ", "–");
  if (cleanAnchor.includes("–")) {
    const [start, end] = cleanAnchor.split("–");
    const prefix = start.includes(".") ? start.split(".")[0] : start;
    const endNo = end.includes(".") ? end : `${prefix}.${end}`;
    return compareClauseNumbers(clauseNo, start) >= 0 && compareClauseNumbers(clauseNo, endNo) <= 0;
  }
  return clauseNo === cleanAnchor || clauseNo.startsWith(`${cleanAnchor}.`);
}

function compareClauseNumbers(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const difference = (a[index] || 0) - (b[index] || 0);
    if (difference) return difference;
  }
  return 0;
}

function getScopeMapping(clauseNo) {
  return scopeData?.clause_mappings.find((item) => item.clause_no === clauseNo) || null;
}

function darkenHexColour(hex, factor = 0.78) {
  const value = String(hex).replace("#", "");
  const channels = [0, 2, 4].map((offset) => Math.max(0, Math.min(255, Math.round(parseInt(value.slice(offset, offset + 2), 16) * factor))));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function buildContractSystem(moduleRecord, index) {
  const presentation = SYSTEM_PRESENTATION_SLOTS[index];
  if (!presentation) throw new Error(`No presentation slot exists for Main Category ${index + 1}`);
  return {
    ...moduleRecord,
    number: String(index + 1).padStart(2, "0"),
    color: moduleRecord.accent,
    colorDeep: darkenHexColour(moduleRecord.accent),
    textColor: "#ffffff",
    panel: { ...presentation.panel },
    approved: presentation.approved === true,
    categories: [...presentation.categories]
  };
}

function mainCategoryDisplayText(value) {
  if (!contractSystems.length) {
    return mainCategoryLoadError ? "Main Category label unavailable" : "Loading Main Category label…";
  }
  return globalThis.MainCategories
    ? globalThis.MainCategories.displayText(contractSystems, value)
    : String(value ?? "");
}

function scopeMainCategory() {
  return contractSystems[0] || null;
}

function applyMainCategoryLabels() {
  const scopeCategory = scopeMainCategory();
  const english = scopeCategory?.name || (mainCategoryLoadError ? "Category unavailable" : "Loading category…");
  const chinese = scopeCategory?.nameZh || "";
  document.querySelectorAll("[data-main-category-role='scope']").forEach((node) => {
    node.textContent = english;
  });
  document.querySelectorAll("[data-main-category-role-zh='scope']").forEach((node) => {
    node.textContent = chinese;
  });
  scopeCategories.setAttribute("aria-label", `${english} practice categories`);
}

function rerenderMainCategoryConsumers() {
  if (!scopeData) return;
  renderScopeWorkspace();
  renderClauseSpine();
  if (selectedClauseNumber) selectClause(selectedClauseNumber);
  if (selectedTag) {
    renderTagResults();
    const selectedClause = (tagClauseMappings[selectedTag] || []).find(([number]) => number === selectedTagClause);
    if (selectedClause) renderTagClauseDetail(selectedClause);
  }
}

async function loadMainCategories() {
  mainCategoryLoadError = null;
  openScopeWorkspace.disabled = true;
  renderArchitecture();
  updateArchitecture();
  try {
    if (!globalThis.MainCategories) throw new Error("Main Category display module is unavailable");
    const separator = MAIN_CATEGORIES_PATH.includes("?") ? "&" : "?";
    const response = await fetch(`${MAIN_CATEGORIES_PATH}${separator}ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    const nextModules = globalThis.MainCategories.validate(await response.json());
    if (nextModules.length !== SYSTEM_PRESENTATION_SLOTS.length) throw new Error("Main Category data and presentation slots do not align");
    const nextSystems = nextModules.map(buildContractSystem);
    const validIds = new Set(nextSystems.map((system) => system.id));
    [...selectedSystems].forEach((id) => { if (!validIds.has(id)) selectedSystems.delete(id); });
    contractSystems = nextSystems;
    openScopeWorkspace.disabled = false;
  } catch (error) {
    contractSystems = [];
    mainCategoryLoadError = error;
    console.error("Failed to load Main Category data:", error);
  }
  applyMainCategoryLabels();
  renderArchitecture();
  updateArchitecture();
  rerenderMainCategoryConsumers();
}

function renderArchitecture() {
  if (!contractSystems.length) {
    architecture.innerHTML = `<div class="architecture-load-state ${mainCategoryLoadError ? "is-error" : "is-loading"}" role="status">
      <strong>${mainCategoryLoadError ? "Main Category data could not be loaded." : "Loading approved Main Categories…"}</strong>
      ${mainCategoryLoadError ? `<span>${escapeHtml(mainCategoryLoadError.message)}</span><button type="button" data-main-categories-retry>Retry category loading</button>` : ""}
    </div>`;
    architecture.querySelector("[data-main-categories-retry]")?.addEventListener("click", () => loadMainCategories());
    return;
  }
  architecture.innerHTML = `
    <div class="ring-track" aria-hidden="true"></div>
    ${contractSystems.map((system, index) => renderSystem(system, index)).join("")}
    <div class="central-core" aria-hidden="true">
      <span class="core-orbit"></span>
      <div><strong>FIDIC Red Book 2017</strong></div>
    </div>
  `;

  architecture.querySelectorAll(".ring-segment").forEach((button) => {
    button.addEventListener("click", () => toggleSystem(button.closest(".ring-system")));
  });
}

function renderSystem(system, index) {
  const rotation = (360 / contractSystems.length) * index;
  const polarAngle = -90 + rotation;
  const connector = getConnector(system, polarAngle);
  const style = [
    `--angle:${rotation}deg`,
    `--counter-angle:${-rotation}deg`,
    `--module:${system.color}`,
    `--module-deep:${system.colorDeep}`,
    `--segment-text:${system.textColor}`,
    `--panel-x:${system.panel.x}px`,
    `--panel-y:${system.panel.y}px`,
    `--link-x:${connector.x}px`,
    `--link-y:${connector.y}px`,
    `--link-length:${connector.length}px`,
    `--link-angle:${connector.angle}deg`
  ].join(";");

  return `
    <article class="ring-system panel-${system.panel.side}" data-system-id="${system.id}" data-module-index="${index}" style="${style}">
      <button
        class="ring-segment"
        type="button"
        aria-expanded="false"
        aria-controls="categories-${system.id}"
        aria-label="${system.number} ${escapeHtml(system.name)} ${escapeHtml(system.nameZh)}"
      >
        <span class="segment-label">
          <span class="segment-number">${system.number}</span>
          <span class="segment-copy">
            <strong>${escapeHtml(system.name)}</strong>
            <span lang="zh-Hans">${escapeHtml(system.nameZh)}</span>
          </span>
        </span>
      </button>
      <i class="panel-link" aria-hidden="true"></i>
      <section
        id="categories-${system.id}"
        class="category-panel"
        aria-label="${escapeHtml(system.name)} practice categories"
        aria-hidden="true"
      >
        <div class="panel-heading">
          <span>Level 2 / Practice Categories</span>
          <small>${system.approved ? "Approved" : "Temporary"}</small>
        </div>
        <ol>
          ${system.categories.map((category, categoryIndex) => `
            <li><span>${String(categoryIndex + 1).padStart(2, "0")}</span><b>${category}</b></li>
          `).join("")}
        </ol>
      </section>
    </article>
  `;
}

function getConnector(system, angle) {
  const radians = angle * (Math.PI / 180);
  const x = RING_CENTER.x + (Math.cos(radians) * RING_RADIUS);
  const y = RING_CENTER.y + (Math.sin(radians) * RING_RADIUS);
  const endX = system.panel.side === "right" ? system.panel.x : system.panel.x + PANEL_WIDTH;
  const endY = system.panel.y + PANEL_LINK_Y;
  const deltaX = endX - x;
  const deltaY = endY - y;

  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
    length: Math.round(Math.hypot(deltaX, deltaY) * 100) / 100,
    angle: Math.round((Math.atan2(deltaY, deltaX) * 180 / Math.PI) * 100) / 100
  };
}

function toggleSystem(node) {
  const id = node.dataset.systemId;
  const scopeCategoryId = scopeMainCategory()?.id;
  selectedSystems.has(id) ? selectedSystems.delete(id) : selectedSystems.add(id);
  updateArchitecture();
  if (id === scopeCategoryId && selectedSystems.has(id) && scopeData) {
    scopeWorkspace.hidden = false;
    scopeWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (id === scopeCategoryId && !selectedSystems.has(id)) {
    scopeWorkspace.hidden = true;
  }
}

function renderScopeWorkspace() {
  if (!scopeData) return;
  selectedScopeCategory ||= scopeData.practice_categories[0].id;
  scopeCategories.innerHTML = scopeData.practice_categories.map((category) => {
    const count = scopeData.performance_nodes.filter((node) => node.practice_category_id === category.id).length;
    return `<button type="button" data-scope-category="${category.id}" aria-pressed="${category.id === selectedScopeCategory}">
      <span>0${category.order}</span><strong>${escapeHtml(category.name)}</strong><small lang="zh-Hans">${escapeHtml(category.chinese_name)}</small><b>${count} nodes</b>
    </button>`;
  }).join("");
  scopeCategories.querySelectorAll("[data-scope-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedScopeCategory = button.dataset.scopeCategory;
      selectedScopeNode = null;
      renderScopeWorkspace();
    });
  });
  renderScopeNodes();
}

function renderScopeNodes() {
  const category = scopeData.practice_categories.find((item) => item.id === selectedScopeCategory);
  const nodes = scopeData.performance_nodes.filter((node) => node.practice_category_id === selectedScopeCategory);
  scopeNodes.innerHTML = `
    <header><p>Level 3 / Performance nodes</p><h3>${escapeHtml(category.name)} <span lang="zh-Hans">${escapeHtml(category.chinese_name)}</span></h3></header>
    <div class="scope-node-list">${nodes.map((node) => `
      <article class="scope-node-card ${node.id === selectedScopeNode ? "is-selected" : ""}">
        <button type="button" class="scope-node-select" data-scope-node="${node.id}">
          <span class="scope-node-order">${String(node.order).padStart(2, "0")}</span>
          <span><strong>${escapeHtml(node.name)}</strong><small lang="zh-Hans">${escapeHtml(node.chinese_name)}</small></span>
        </button>
        <p>${escapeHtml(node.logic)}</p>
        <div class="scope-clause-chips">${node.primary_clauses.map(([number, title]) => `
          <button type="button" data-scope-clause="${escapeHtml(number)}" title="${escapeHtml(title)}">${escapeHtml(number)}</button>
        `).join("")}</div>
        <div class="scope-node-status"><span>source_text_loaded</span><span>needs_lawyer_review</span></div>
      </article>`).join("")}</div>`;
  scopeNodes.querySelectorAll("[data-scope-node]").forEach((button) => {
    button.addEventListener("click", () => showScopeNode(button.dataset.scopeNode));
  });
  scopeNodes.querySelectorAll("[data-scope-clause]").forEach((button) => {
    button.addEventListener("click", () => openClauseInSpine(button.dataset.scopeClause, "Functional Skeleton"));
  });
  if (!selectedScopeNode) {
    scopeDetail.innerHTML = `<div class="scope-detail-empty"><span>03</span><h3>Select a performance node</h3><p>Approved logic, paths, clause anchors, elements and tags will appear here.</p></div>`;
  }
}

function showScopeNode(nodeId) {
  selectedScopeNode = nodeId;
  const node = scopeData.performance_nodes.find((item) => item.id === nodeId);
  const category = scopeData.practice_categories.find((item) => item.id === node.practice_category_id);
  const tags = [...new Set(node.primary_clauses.flatMap(([number]) => getScopeMapping(number)?.legal_effect_tags || []))];
  renderScopeNodes();
  scopeDetail.innerHTML = `
    <div class="scope-detail-kicker">Performance node</div><h3>${escapeHtml(node.name)}</h3><p class="scope-detail-cn" lang="zh-Hans">${escapeHtml(node.chinese_name)}</p>
    <section><span>Core logic</span><p>${escapeHtml(node.logic)}</p></section>
    <section><span>Primary path</span><p class="scope-path">${escapeHtml(mainCategoryDisplayText(node.primary_path))}</p></section>
    <section><span>Secondary paths / cross-links</span><ul>${node.secondary_paths.map((path) => `<li>${escapeHtml(mainCategoryDisplayText(path))}</li>`).join("")}</ul></section>
    <section><span>Clause anchors</span><div class="scope-clause-chips">${node.primary_clauses.map(([number, title]) => `<button type="button" data-detail-clause="${escapeHtml(number)}">${escapeHtml(number)} ${escapeHtml(title)}</button>`).join("")}</div></section>
    <section><span>Approved legal-effect tags</span><div class="scope-tag-row">${tags.length ? tags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join("") : "<em>No approved tag by default.</em>"}</div></section>
    <footer><b>${escapeHtml(category.name)}</b><span>source_text_loaded</span><span>needs_lawyer_review</span></footer>`;
  scopeDetail.querySelectorAll("[data-detail-clause]").forEach((button) => button.addEventListener("click", () => openClauseInSpine(button.dataset.detailClause, "Functional Skeleton")));
}

function openClauseInSpine(clauseNo, origin = "Dashboard") {
  const normalizedClauseNo = String(clauseNo).trim();
  const topLevel = Number(normalizedClauseNo.split(".")[0]);
  clauseNavigationOrigin = origin;
  clauseSearchQuery = "";
  switchView("clauseSpineView");
  selectClause(topLevel);

  if (!normalizedClauseNo.includes(".")) {
    document.querySelector(`.clause-module[data-clause-number="${topLevel}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const target = clauseSpineViewTarget(normalizedClauseNo);
  if (target) {
    target.open = true;
    target.classList.add("is-crossview-target");
    target.querySelector(".subclause-body")?.insertAdjacentHTML("afterbegin", renderCrossViewStatus(normalizedClauseNo));
    requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "center" }));
    return;
  }

  renderMissingClauseFallback(normalizedClauseNo, origin);
}

function clauseSpineViewTarget(clauseNo) {
  const sourceClause = findSourceClause(clauseNo);
  return sourceClause
    ? clauseDetail.querySelector(`[data-subclause-number="${CSS.escape(sourceClause.clause_no)}"]`)
    : null;
}

function renderCrossViewStatus(clauseNo) {
  const sourceClause = findSourceClause(clauseNo);
  const sourceState = getSourceDisplayState(sourceClause);
  const verification = getPdfVerificationDisplay(sourceClause);
  const resolvedNote = sourceClause && sourceClause.clause_no !== String(clauseNo)
    ? `Requested ${escapeHtml(clauseNo)} is displayed within source record ${escapeHtml(sourceClause.clause_no)}.`
    : "";
  return `<div class="crossview-status-card">
    <strong>Opened from ${escapeHtml(clauseNavigationOrigin || "Dashboard")}</strong>
    <span>${escapeHtml(sourceState.message)}</span>
    ${resolvedNote ? `<span>${resolvedNote}</span>` : ""}
    <div><b>${escapeHtml(sourceState.status)}</b>${verification ? `<b>${escapeHtml(verification.label)}</b>` : ""}<b>needs_lawyer_review</b></div>
  </div>`;
}

function renderMissingClauseFallback(clauseNo, origin) {
  const mapping = getScopeMapping(clauseNo);
  const title = mapping?.clause_title || `${clauseNo} [Title to be verified]`;
  const register = clauseDetail.querySelector(".subclause-register");
  if (!register) return;
  register.insertAdjacentHTML("afterbegin", `<article class="missing-clause-card is-crossview-target">
    <span class="subclause-number">${escapeHtml(clauseNo)}</span><h4>${escapeHtml(title)}</h4>
    ${renderCrossViewStatus(clauseNo)}
    ${mapping ? renderScopeMappingDetail({ ...mapping, source_status: "source_text_not_loaded" }, "Approved Scope mapping") : ""}
  </article>`);
  requestAnimationFrame(() => register.querySelector(".missing-clause-card")?.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function showScopeClause(clauseNo) {
  const nodes = findScopeNodesForClause(clauseNo);
  const mapping = getScopeMapping(clauseNo) || (nodes[0] ? {
    clause_no: clauseNo,
    clause_title: nodes[0].primary_clauses.find(([number]) => number === clauseNo)?.[1] || "Scope clause anchor",
    primary_path: nodes[0].primary_path, secondary_paths: nodes[0].secondary_paths,
    elements: nodes[0].elements, legal_effect_tags: [], tag_reasons: {},
    source_status: scopeData.source_status, qc_status: scopeData.qc_status,
    lawyer_review_status: scopeData.lawyer_review_status,
    performance_node: nodes[0].name,
    practice_category: scopeData.practice_categories.find((item) => item.id === nodes[0].practice_category_id)?.name
  } : null);
  if (!mapping) return;
  scopeDetail.innerHTML = renderScopeMappingDetail(mapping, "Scope clause detail");
}

function renderScopeMappingDetail(mapping, label) {
  const visibleStatuses = [mapping.source_status, mapping.qc_status, mapping.lawyer_review_status]
    .filter((status) => status && status !== "needs_pdf_verification");
  return `<div class="scope-detail-kicker">${escapeHtml(label)}</div>
    <h3>${escapeHtml(mapping.clause_no)} ${escapeHtml(mapping.clause_title)}</h3>
    <section><span>Practice category / performance node</span><p>${escapeHtml(mapping.practice_category || scopeMainCategory()?.name || "Main Category")}<br><strong>${escapeHtml(mapping.performance_node || "Approved Scope mapping")}</strong></p></section>
    <section><span>Primary path</span><p class="scope-path">${escapeHtml(mainCategoryDisplayText(mapping.primary_path))}</p></section>
    <section><span>Secondary paths / cross-links</span><ul>${mapping.secondary_paths.map((path) => `<li>${escapeHtml(mainCategoryDisplayText(path))}</li>`).join("") || "<li>None approved.</li>"}</ul></section>
    <section><span>Relevant elements</span><ul>${mapping.elements.map((element) => `<li>${escapeHtml(element)}</li>`).join("")}</ul></section>
    <section><span>Approved legal-effect tags</span><div class="scope-tag-row">${mapping.legal_effect_tags.length ? mapping.legal_effect_tags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join("") : "<em>No approved tag by default.</em>"}</div>${Object.entries(mapping.tag_reasons).map(([tag, reason]) => `<p class="scope-tag-reason"><strong>${escapeHtml(tag)}:</strong> ${escapeHtml(reason)}</p>`).join("")}</section>
    <footer>${visibleStatuses.map((status) => `<span>${escapeHtml(status)}</span>`).join("")}</footer>`;
}

function findSourceClause(clauseNo) {
  if (!fidicSourceLayer) return null;
  const requested = String(clauseNo);
  const exact = fidicSourceLayer.clauses.find((item) => item.clause_no === requested);
  if (exact) return exact;
  const parts = requested.split(".");
  while (parts.length > 1) {
    parts.pop();
    const parentNo = parts.join(".");
    const parent = fidicSourceLayer.clauses.find((item) => item.clause_no === parentNo);
    if (parent) return parent;
  }
  return fidicSourceLayer.clauses.find((item) => item.clause_no.startsWith(`${requested}.`)) || null;
}

function getSourceDisplayState(clause) {
  return SourceDisplay.resolveSourceDisplayState(clause);
}

function getPdfVerificationDisplay(clause) {
  if (getSourceDisplayState(clause).key !== "loaded") return null;
  const status = clause?.pdf_verification_status || clause?.verification_status;
  if (status === "pdf_verified" || status === "pdf_text_matched") {
    return { key: "verified", label: "PDF verified" };
  }
  if (status === "text_discrepancy_found") {
    return { key: "discrepancy", label: "Text discrepancy found" };
  }
  return { key: "pending", label: "Manual PDF review pending" };
}

function updateArchitecture() {
  if (!contractSystems.length) {
    architecture.dataset.openCount = "0";
    architecture.classList.remove("all-open");
    emptyHint.classList.add("is-hidden");
    clearSelection.disabled = true;
    selectionCount.textContent = "0 categories open";
    return;
  }
  architecture.querySelectorAll(".ring-system").forEach((node) => {
    const isSelected = selectedSystems.has(node.dataset.systemId);
    node.classList.toggle("is-active", isSelected);
    node.querySelector(".ring-segment").setAttribute("aria-expanded", String(isSelected));
    node.querySelector(".category-panel").setAttribute("aria-hidden", String(!isSelected));
  });

  const count = selectedSystems.size;
  architecture.dataset.openCount = String(count);
  architecture.classList.toggle("all-open", count === contractSystems.length);
  emptyHint.classList.toggle("is-hidden", count > 0);
  clearSelection.disabled = count === 0;
  selectionCount.textContent = `${count} ${count === 1 ? "category" : "categories"} open`;
}

function renderClauseSpine() {
  clauseSpine.innerHTML = fidicClauses.map((clause) => `
    <div class="clause-row" style="--clause-color:${clause.color}">
      <button
        class="clause-module"
        type="button"
        data-clause-number="${clause.number}"
        aria-pressed="false"
      >
        <span class="clause-number">${String(clause.number).padStart(2, "0")}</span>
        <span class="clause-title">${escapeHtml(clause.title)}${renderMainClauseCount(clause.number)}</span>
        <span class="clause-action" aria-hidden="true">+</span>
      </button>
    </div>
  `).join("");

  clauseSpine.querySelectorAll(".clause-module").forEach((button) => {
    button.addEventListener("click", () => {
      clauseSearchQuery = "";
      selectClause(Number(button.dataset.clauseNumber));
    });
  });
}

function renderMainClauseCount(number) {
  if (!fidicSourceLayer) return "";
  const mainClause = fidicSourceLayer.main_clauses.find((item) => item.clause_no === String(number));
  const count = mainClause?.sub_clause_count ?? 0;
  const isScopeMapped = scopeData?.performance_nodes.some((node) => node.primary_clauses.some(([anchor]) => {
    const first = String(anchor).match(/^\d+/)?.[0];
    return first === String(number);
  }));
  return `<small>${count} sub-clause${count === 1 ? "" : "s"}${isScopeMapped ? " · Scope mapped" : ""}</small>`;
}

function selectClause(number) {
  selectedClauseNumber = number;
  const clause = fidicClauses.find((item) => item.number === number);

  clauseSpine.querySelectorAll(".clause-module").forEach((button) => {
    const isSelected = Number(button.dataset.clauseNumber) === number;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  if (!fidicSourceLayer) {
    if (clauseLoadError) renderClauseLoadError();
    return;
  }

  const childClauses = fidicSourceLayer.clauses.filter(
    (item) => item.parent_clause_no === String(number)
  );
  const normalizedQuery = clauseSearchQuery.trim().toLowerCase();
  const visibleClauses = normalizedQuery
    ? childClauses.filter((item) => `${item.clause_no} ${item.clause_title} ${item.full_text}`.toLowerCase().includes(normalizedQuery))
    : childClauses;
  const matchedCount = childClauses.filter((item) => getPdfVerificationDisplay(item)?.key === "verified").length;
  const scopeMappedCount = childClauses.filter((item) => findScopeNodesForClause(item.clause_no).length).length;

  clauseDetail.classList.remove("is-populated");
  clauseDetail.innerHTML = `
    <div class="clause-detail-header">
      <span class="detail-state">Clause ${String(clause.number).padStart(2, "0")}</span>
      <span class="clause-source-state">${scopeMappedCount} Scope mapped · ${matchedCount} PDF verified</span>
    </div>
    ${clauseNavigationOrigin ? `<div class="clause-origin-indicator">Opened from ${escapeHtml(clauseNavigationOrigin)}</div>` : ""}
    <p class="detail-eyebrow">Imported source-layer directory</p>
    <h3>${escapeHtml(clause.title)}</h3>
    <p class="detail-note">${childClauses.length} imported sub-clauses · Corrected Word source layer with separate PDF verification status.</p>
    <label class="clause-search">
      <span>Search within Clause ${escapeHtml(number)}</span>
      <input id="clauseSearchInput" type="search" value="${escapeHtml(clauseSearchQuery)}" placeholder="Number, title or wording…" autocomplete="off">
    </label>
    <div class="subclause-summary" role="status">${visibleClauses.length} of ${childClauses.length} records shown</div>
    <div class="subclause-register">
      ${visibleClauses.length ? visibleClauses.map(renderSubClause).join("") : `
        <div class="subclause-empty">No imported clauses match this search.</div>
      `}
    </div>
  `;
  document.getElementById("clauseSearchInput")?.addEventListener("input", (event) => {
    clauseSearchQuery = event.target.value;
    selectClause(selectedClauseNumber);
    const nextInput = document.getElementById("clauseSearchInput");
    nextInput?.focus();
    nextInput?.setSelectionRange(clauseSearchQuery.length, clauseSearchQuery.length);
  });
  clauseDetail.querySelectorAll("[data-source-child]").forEach((button) => {
    button.addEventListener("click", () => openClauseInSpine(button.dataset.sourceChild, "Container clause"));
  });
  requestAnimationFrame(() => clauseDetail.classList.add("is-populated"));
}

function renderSourceRecordContent(clause, childLinkAttribute = "data-source-child") {
  const sourceState = getSourceDisplayState(clause);
  if (sourceState.key === "loaded") {
    return `<div class="clause-full-text">${escapeHtml(clause.full_text)}</div>`;
  }
  if (sourceState.key === "container") {
    const attribute = childLinkAttribute === "data-open-spine" ? "data-open-spine" : "data-source-child";
    return `<div class="source-text-state is-container" role="group" aria-label="Container clause source state">
      <strong>${escapeHtml(sourceState.message)}</strong>
      <div class="source-child-links">
        ${sourceState.childClauseNumbers.map((number) => {
          const child = findSourceClause(number);
          return `<button class="source-child-link" type="button" ${attribute}="${escapeHtml(number)}">
            <span>${escapeHtml(number)}</span>${child?.clause_title ? `<small>${escapeHtml(child.clause_title)}</small>` : ""}
          </button>`;
        }).join("")}
      </div>
    </div>`;
  }
  return `<div class="source-text-state is-missing" role="status">
    <strong>${escapeHtml(sourceState.status)}</strong>
    <p>${escapeHtml(sourceState.message)}</p>
  </div>`;
}

function renderSubClause(clause) {
  const sourceState = getSourceDisplayState(clause);
  const verification = getPdfVerificationDisplay(clause);
  const isMatched = verification?.key === "verified";
  const scopeNodesForClause = findScopeNodesForClause(clause.clause_no);
  const scopeMapping = getScopeMapping(clause.clause_no);
  const statusText = sourceState.key === "loaded"
    ? (verification?.label || sourceState.status)
    : sourceState.message;
  const stateClass = sourceState.key === "container"
    ? "is-container"
    : (sourceState.key === "missing" ? "is-missing" : (isMatched ? "is-matched" : "is-pending"));
  const paragraphs = Array.isArray(clause.paragraphs) ? clause.paragraphs.length : 0;
  const references = Array.isArray(clause.literal_cross_references)
    ? clause.literal_cross_references
    : [];
  return `
    <details data-subclause-number="${escapeHtml(clause.clause_no)}" class="subclause-card ${stateClass} ${scopeNodesForClause.length ? "has-scope-map" : ""}">
      <summary>
        <span class="subclause-number">${escapeHtml(clause.clause_no)}</span>
        <span class="subclause-heading">${escapeHtml(clause.clause_title)}</span>
        <span class="verification-badge">${scopeNodesForClause.length ? "Scope mapped · " : ""}${statusText}</span>
      </summary>
      <div class="subclause-body">
        <div class="subclause-metadata">
          <span>${sourceState.key === "container" ? "Container clause" : `${paragraphs} paragraph${paragraphs === 1 ? "" : "s"}`}</span>
          <span>Source: ${escapeHtml(clause.source_text_origin)}</span>
          ${references.length ? `<span>References: ${references.map(escapeHtml).join(", ")}</span>` : ""}
        </div>
        ${renderSourceRecordContent(clause)}
        ${scopeNodesForClause.length ? `<div class="subclause-scope-map">
          <strong>${escapeHtml(scopeMainCategory()?.name || "Main Category")} mapping</strong>
          ${renderScopeMappingDetail(scopeMapping || {
            clause_no: clause.clause_no, clause_title: clause.clause_title,
            practice_category: scopeData.practice_categories.find((item) => item.id === scopeNodesForClause[0].practice_category_id)?.name,
            performance_node: scopeNodesForClause[0].name, primary_path: scopeNodesForClause[0].primary_path,
            secondary_paths: scopeNodesForClause[0].secondary_paths, elements: scopeNodesForClause[0].elements,
            legal_effect_tags: [], tag_reasons: {}, source_status: scopeData.source_status,
            qc_status: scopeData.qc_status, lawyer_review_status: scopeData.lawyer_review_status
          }, "Approved Scope mapping")}
        </div>` : ""}
        ${clause.qc_notes?.length ? `
          <div class="clause-qc-note"><strong>Review notes</strong>${clause.qc_notes.map((note) => `<p>${escapeHtml(note)}</p>`).join("")}</div>
        ` : ""}
      </div>
    </details>
  `;
}

function renderClauseLoadError() {
  clauseDetail.classList.remove("is-populated");
  clauseDetail.innerHTML = `
    <span class="detail-state">Source unavailable</span>
    <p class="detail-eyebrow">Local data connection</p>
    <h3>Imported clauses could not be loaded</h3>
    <p class="detail-note">The source file remains separate and has not been deleted. The browser could not read <code>${escapeHtml(FIDIC_SOURCE_LAYER_PATH)}</code>.</p>
    <p class="clause-source-error">${escapeHtml(clauseLoadError?.message || "Unknown loading error")}</p>
    <button class="clause-source-retry" type="button" data-clause-source-retry>Retry source-layer loading</button>
  `;
  clauseDetail.querySelector("[data-clause-source-retry]")?.addEventListener("click", () => loadClauseSourceLayer());
}

function renderTagGroups() {
  tagGroups.innerHTML = tagGroupsData.map((group, groupIndex) => `
    <article class="tag-group-card">
      <header class="tag-group-heading">
        <span>${String(groupIndex + 1).padStart(2, "0")}</span>
        <div>
          <h4>${group.title}</h4>
          <p lang="zh-Hans">${group.chineseTitle}</p>
        </div>
      </header>
      <div class="tag-chip-list">
        ${group.tags.map((tag) => `
          <button class="tag-chip" type="button" data-tag-name="${tag}" aria-pressed="false">
            <span>${tag}</span><i aria-hidden="true"></i>
          </button>
        `).join("")}
      </div>
    </article>
  `).join("");

  tagGroups.querySelectorAll(".tag-chip").forEach((button) => {
    button.addEventListener("click", () => selectTag(button.dataset.tagName));
  });
}

function selectTag(tagName) {
  selectedTag = tagName;
  selectedTagClause = null;

  tagGroups.querySelectorAll(".tag-chip").forEach((button) => {
    const isSelected = button.dataset.tagName === tagName;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  tagClauseDetail.hidden = true;
  tagClauseDetail.innerHTML = "";
  renderTagResults();
  scrollTagSectionIntoView(tagResultsPanel);
}

function renderTagResults() {
  const clauses = tagClauseMappings[selectedTag] || [];
  tagResultsTitle.textContent = `Selected Tag: ${selectedTag}`;
  tagResultCount.textContent = clauses.length === 1 ? "1 related clause" : `${clauses.length} related clauses`;

  if (clauses.length === 0) {
    tagResults.innerHTML = `
      <div class="tag-empty-state tag-empty-mapping">
        <span aria-hidden="true">0</span>
        <div>
          <p>No mapped Scope clauses loaded yet.</p>
          <small>Scope v1 contains no approved mapping for this tag.</small>
        </div>
      </div>
    `;
    return;
  }

  tagResults.innerHTML = `
    <p class="tag-related-label">Related Clauses</p>
    <div class="tag-review-columns" aria-hidden="true"><span>Clause</span><span>Clause Spine source text / Tag wording</span><span>Source link</span></div>
    <div class="tag-clause-list">
      ${clauses.map(([number, title]) => {
        const sourceClause = findSourceClause(number);
        const taggedText = renderTaggedClauseText(sourceClause, selectedTag);
        const anchorStateLabel = taggedText.sourceState === "container"
          ? "Container clause · see sub-clauses"
          : (taggedText.sourceState === "missing"
            ? "Source text not loaded"
            : (taggedText.anchored ? "Dictionary wording anchor highlighted" : "Tag wording not yet anchored"));
        const anchorStateClass = taggedText.sourceState === "container"
          ? "is-container"
          : (taggedText.sourceState === "missing"
            ? "is-missing"
            : (taggedText.anchored ? "is-anchored" : "is-unanchored"));
        return `
        <article class="tag-clause-result-row" data-tag-clause-row="${escapeHtml(number)}">
          <button
            class="tag-clause-result"
            type="button"
            data-clause-number="${escapeHtml(number)}"
            aria-pressed="false"
          >
            <span class="tag-result-clause-no">${number}</span>
            <span class="tag-result-copy">
              <strong>${escapeHtml(sourceClause?.clause_title || title)}</strong>
              <small>FIDIC Red Book 2017</small>
            </span>
            <span class="mapping-status">Scope mapped</span>
          </button>
          <div class="tag-clause-source-text">
            <div class="tag-anchor-state ${anchorStateClass}">
              ${anchorStateLabel}
            </div>
            ${taggedText.html}
          </div>
          <div class="tag-clause-source-link">
            <button class="tag-spine-link" type="button" data-open-spine="${escapeHtml(number)}">View in Clause Spine <span aria-hidden="true">↗</span></button>
            <small>Corrected Word source layer</small>
          </div>
        </article>`;
      }).join("")}
    </div>
  `;

  tagResults.querySelectorAll(".tag-clause-result").forEach((button) => {
    button.addEventListener("click", () => selectTagClause(button.dataset.clauseNumber));
  });
  tagResults.querySelectorAll("[data-open-spine]").forEach((button) => {
    button.addEventListener("click", () => openClauseInSpine(button.dataset.openSpine, "Tag View"));
  });
}

function renderTaggedClauseText(sourceClause, tag) {
  const sourceState = getSourceDisplayState(sourceClause);
  if (sourceState.key !== "loaded") {
    return {
      anchored: false,
      sourceState: sourceState.key,
      html: renderSourceRecordContent(sourceClause, "data-open-spine")
    };
  }
  const dictionaryTerms = {
    "Claim for EOT": ["EOT", "extension of time", "extension of the Time for Completion", "extended time for completion"],
    "Claim for Cost": ["Cost Plus Profit", "additional payment", "additional costs", "loss and expense", "Cost"],
    "Contractor Breach / Default": ["failure by the Contractor", "Contractor’s failure", "Contractor's failure", "default of the Contractor"],
    "Employer Breach / Default": ["failure by the Employer", "Employer’s failure", "Employer's failure", "default of the Employer"],
    "Waiver / Non-Waiver / Discharge": ["waiver", "non-waiver", "discharge", "release", "final settlement"]
  };
  const terms = dictionaryTerms[tag] || String(tag).split(/\s*\/\s*/).map((term) => term.trim()).filter(Boolean);
  const matcher = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  let matchCount = 0;
  const paragraphs = Array.isArray(sourceClause.paragraphs) && sourceClause.paragraphs.length
    ? sourceClause.paragraphs.map((paragraph) => paragraph.text || "")
    : sourceClause.full_text.split(/\n\s*\n/);
  const html = paragraphs.map((paragraph) => {
    const parts = String(paragraph).split(matcher);
    const rendered = parts.map((part, index) => {
      if (index % 2 === 1) {
        matchCount += 1;
        return `<mark class="tag-wording-highlight">${escapeHtml(part)}</mark>`;
      }
      return escapeHtml(part);
    }).join("");
    return `<p>${rendered}</p>`;
  }).join("");
  return { anchored: matchCount > 0, sourceState: sourceState.key, html };
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function selectTagClause(clauseNumber) {
  const clause = (tagClauseMappings[selectedTag] || []).find(([number]) => number === clauseNumber);
  if (!clause) return;

  selectedTagClause = clauseNumber;
  tagResults.querySelectorAll(".tag-clause-result").forEach((button) => {
    const isSelected = button.dataset.clauseNumber === clauseNumber;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  renderTagClauseDetail(clause);
  scrollTagSectionIntoView(tagClauseDetail);
}

function renderTagClauseDetail([number, title]) {
  const mapping = getScopeMapping(number);
  const reason = mapping?.tag_reasons?.[selectedTag] || scopeData?.tag_reason_templates?.[selectedTag] || "No additional mapping rationale recorded.";
  const sourceClause = findSourceClause(number);
  const sourceState = getSourceDisplayState(sourceClause);
  const verification = getPdfVerificationDisplay(sourceClause);

  tagClauseDetail.innerHTML = `
    <div class="tag-section-heading tag-detail-heading">
      <div>
        <span class="tag-stage-number">03</span>
        <div>
          <p>Clause detail</p>
          <h3 id="tag-detail-title">${number} ${title}</h3>
        </div>
      </div>
      <span class="tag-detail-selected">Selected tag: ${selectedTag}</span>
    </div>

    <div class="tag-detail-grid">
      <div class="tag-detail-main">
        <section>
          <span class="tag-detail-label">Why this clause is mapped to this tag</span>
          <p>${escapeHtml(reason)}</p>
        </section>
        <section>
          <span class="tag-detail-label">Functional path</span>
          <p class="functional-path">${escapeHtml(mainCategoryDisplayText(mapping?.primary_path || `${scopeData?.main_system || "Main Category"} > Approved tag mapping`))}</p>
          <span class="tag-detail-label">Performance node</span>
          <p>${escapeHtml(mapping?.performance_node || "Scope cross-link")}</p>
        </section>
      </div>

      <aside class="tag-elements-card">
        <span class="tag-detail-label">Related clause elements</span>
        <ul>
          ${(mapping?.elements || []).map((element) => `<li>${escapeHtml(element)}</li>`).join("") || "<li>No additional element loaded.</li>"}
        </ul>
      </aside>
    </div>

    <footer class="tag-verification">
      <span>Verification status</span>
      <div>
        <b>${escapeHtml(sourceState.status)}</b>
        ${sourceState.key === "container" ? `<b>${escapeHtml(sourceState.message)}</b>` : ""}
        ${verification ? `<b>${escapeHtml(verification.label)}</b>` : ""}
        <b>needs_lawyer_review</b>
      </div>
    </footer>
  `;
  tagClauseDetail.hidden = false;
}

function scrollTagSectionIntoView(section) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() => section.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }));
}

function switchView(targetId) {
  appViews.forEach((view) => {
    const isActive = view.id === targetId;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });

  viewOptions.forEach((button) => {
    const isSelected = button.dataset.viewTarget === targetId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });

  window.setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, 0);
}

function switchWorkspace(targetId) {
  const showBaseline = targetId === "baselineWorkspace";
  baselineWorkspace.hidden = !showBaseline;
  pcWorkspace.hidden = showBaseline;
  baselineViewSelector.hidden = !showBaseline;
  pcViewSelector.hidden = showBaseline;
  workspaceOptions.forEach((button) => {
    const isSelected = button.dataset.workspaceTarget === targetId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function switchPcView(targetId) {
  pcViews.forEach((view) => {
    const isActive = view.id === targetId;
    view.hidden = !isActive;
    view.classList.toggle("is-active", isActive);
  });
  pcViewOptions.forEach((button) => {
    const isSelected = button.dataset.pcViewTarget === targetId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

let pcLastAuditTimestampMs = 0;

function pcNow() {
  const nextTimestamp = Math.max(Date.now(), pcLastAuditTimestampMs + 1);
  pcLastAuditTimestampMs = nextTimestamp;
  return new Date(nextTimestamp).toISOString();
}

function pcSeedAuditClock(data) {
  const timestampValues = [
    data?.export_timestamp,
    data?.project?.created_at,
    data?.project?.updated_at,
    ...(data?.source_documents || []).map((item) => item?.selected_at),
    ...(data?.alignment_assessments || []).map((item) => item?.assessed_at),
    ...(data?.alignment_decisions || []).map((item) => item?.decided_at),
    ...(data?.effective_clauses || []).flatMap((item) => [
      item?.created_at,
      item?.updated_at,
      ...(item?.version_history || []).map((version) => version?.created_at),
      ...(item?.unresolved_issues || []).map((issue) => issue?.recorded_at)
    ]),
    ...(data?.application_log || []).flatMap((item) => [item?.attempted_at, item?.applied_at, item?.rolled_back_at]),
    ...(data?.processing_history || []).map((item) => item?.timestamp)
  ];
  timestampValues.forEach((value) => {
    const parsed = pcTimestampMillis(value);
    if (parsed !== null) pcLastAuditTimestampMs = Math.max(pcLastAuditTimestampMs, parsed);
  });
}

function createPcId(prefix) {
  const token = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${token}`;
}

function createPcReviewPackage() {
  return {
    schema_version: PC_REVIEW_SCHEMA_VERSION,
    document_type: "pc_review_project",
    export_timestamp: null,
    project: null,
    source_documents: [],
    amendments: [],
    alignment_assessments: [],
    alignment_decisions: [],
    effective_clauses: [],
    application_log: [],
    processing_history: []
  };
}

function pcNullable(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function pcExactNullable(value) {
  const original = String(value ?? "");
  return original.trim() ? original : null;
}

function pcRecordHistory({ sourceDocumentId = null, amendmentId = null, previousStatus = null, newStatus, action, actor = "Browser prototype", notes = null }) {
  if (!pcReviewData.project) return null;
  const event = {
    event_id: createPcId("event"),
    project_id: pcReviewData.project.project_id,
    source_document_id: sourceDocumentId,
    amendment_id: amendmentId,
    timestamp: pcNow(),
    previous_status: previousStatus,
    new_status: newStatus,
    action,
    actor,
    notes
  };
  pcReviewData.processing_history.push(event);
  pcReviewData.project.updated_at = pcNow();
  return event;
}

function pcFormatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

async function pcHashFile(file) {
  if (!globalThis.crypto?.subtle || typeof file.arrayBuffer !== "function") return null;
  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  } catch {
    return null;
  }
}

function pcReadFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("Local file read failed.")));
    reader.readAsText(file);
  });
}

function setPcStage(stage, status, stateClass = "") {
  const item = document.querySelector(`[data-pc-stage="${stage}"]`);
  if (!item) return;
  item.querySelector("em").textContent = status;
  item.classList.remove("is-loaded", "is-warning", "is-failed");
  if (stateClass) item.classList.add(stateClass);
}

function pcActiveSourceDocument() {
  return pcReviewData.source_documents.find((item) => item.source_document_id === pcActiveSourceDocumentId)
    || pcReviewData.source_documents.at(-1)
    || null;
}

function updatePcProjectSummary() {
  const project = pcReviewData.project;
  const activeSource = pcActiveSourceDocument();
  document.getElementById("pcOverviewProjectName").textContent = project?.project_name || "No project registered";
  document.getElementById("pcOverviewReference").textContent = project?.contract_reference || "—";
  document.getElementById("pcOverviewProjectId").textContent = project?.project_id || "Not created";
  document.getElementById("pcOverviewSource").textContent = `${pcReviewData.source_documents.length} registered`;
  document.getElementById("pcOverviewAmendments").textContent = `${pcReviewData.amendments.length} recorded`;
  document.getElementById("pcOverviewVerification").textContent = project?.baseline_verification_status || "Not Verified";
  document.getElementById("pcOverallStatus").textContent = project?.project_status || "Not started";
  document.getElementById("pcContinueRegister").disabled = !project || pcReviewData.source_documents.length === 0;

  setPcStage("source", pcReviewData.source_documents.length ? "Source Loaded" : "Not started", pcReviewData.source_documents.length ? "is-loaded" : "");
  setPcStage("preprocessing", activeSource?.preprocessing_status || "Not Assessed", activeSource?.preprocessing_status === "Requires Preprocessing" ? "is-warning" : "");
  setPcStage("text", activeSource?.extraction_status || "Not Extracted", activeSource?.extraction_status === "Text Extracted" ? "is-loaded" : "");
  setPcStage("amendments", pcReviewData.amendments.length ? "Amendments Identified" : "Amendments Not Yet Identified", pcReviewData.amendments.length ? "is-loaded" : "");
  const assessedCount = pcReviewData.amendments.filter((entry) => entry.alignment_evaluated_at).length;
  const appliedCount = pcReviewData.amendments.filter((entry) => entry.application_status === "Applied").length;
  setPcStage("alignment", assessedCount ? `${assessedCount} assessed · ${appliedCount} applied` : "Clause Alignment Not Started", assessedCount ? "is-warning" : "");
  setPcStage("verification", "Not Verified");
  pcRenderSourceStatus(activeSource);
  pcPopulateAmendmentSourceOptions();
  pcRenderAmendmentRegister();
  pcRenderAlignmentReview();
  pcRenderWorkbench();
}

function pcSyncProjectForm() {
  pcProjectName.value = pcReviewData.project?.project_name || "";
  pcContractReference.value = pcReviewData.project?.contract_reference || "";
  pcNotes.value = pcReviewData.project?.notes || "";
}

function pcRenderSourceStatus(source) {
  document.getElementById("pcFileName").textContent = source?.file_name || "Not selected";
  document.getElementById("pcFileType").textContent = source?.file_type?.toUpperCase() || "—";
  document.getElementById("pcUploadDate").textContent = source?.selected_at ? new Date(source.selected_at).toLocaleString() : "—";
  document.getElementById("pcFileSize").textContent = source ? pcFormatBytes(source.file_size) : "—";
  document.getElementById("pcExtractionStatus").textContent = source?.extraction_status || "Not Extracted";
  document.getElementById("pcPreprocessingStatus").textContent = source?.preprocessing_status || "Not Assessed";
  document.getElementById("pcProcessingStatus").textContent = source?.processing_status || "Not started";
  document.getElementById("pcVerificationStatus").textContent = source?.verification_status || "Not Verified";

  const preview = document.getElementById("pcTextPreview");
  const text = source?.extracted_text;
  preview.hidden = typeof text !== "string";
  if (typeof text === "string") {
    document.getElementById("pcTextPreviewContent").textContent = text.slice(0, 4000);
    document.getElementById("pcTextPreviewCount").textContent = `${text.length.toLocaleString()} characters${text.length > 4000 ? " · preview truncated" : ""}`;
  }
}

function pcSetMessage(message, stateClass = "") {
  pcIntakeMessage.textContent = message;
  pcIntakeMessage.className = `pc-intake-message ${stateClass}`.trim();
}

function pcCreateOrUpdateProject() {
  const projectName = pcProjectName.value.trim();
  const formMessage = document.getElementById("pcProjectFormMessage");
  if (!projectName) {
    formMessage.textContent = "Project or contract name is required.";
    formMessage.className = "is-error";
    pcProjectName.focus();
    return;
  }
  const timestamp = pcNow();
  if (!pcReviewData.project) {
    pcReviewData.project = {
      project_id: createPcId("pc_project"),
      project_name: projectName,
      contract_reference: pcNullable(pcContractReference.value),
      fidic_form: "Red Book",
      fidic_edition: "2017",
      baseline_id: "fidic_red_2017",
      baseline_verification_status: "Not Verified",
      consolidation_mode: "Preview / Unverified Baseline",
      publication_eligible: false,
      baseline_source_sha256: fidicSourceLayer?.source_sha256 || null,
      baseline_source_layer_sha256: fidicSourceLayer?.runtime_source_layer_sha256 || null,
      created_at: timestamp,
      updated_at: timestamp,
      project_status: "Amendments Not Yet Identified",
      source_document_ids: [],
      amendment_ids: [],
      alignment_assessment_ids: [],
      alignment_decision_ids: [],
      effective_clause_ids: [],
      application_ids: [],
      notes: pcNullable(pcNotes.value)
    };
    pcRecordHistory({ newStatus: "Amendments Not Yet Identified", action: "Review project created", actor: "User" });
    formMessage.textContent = "Review project created in browser memory.";
  } else {
    pcReviewData.project.project_name = projectName;
    pcReviewData.project.contract_reference = pcNullable(pcContractReference.value);
    pcReviewData.project.notes = pcNullable(pcNotes.value);
    pcRecordHistory({ previousStatus: pcReviewData.project.project_status, newStatus: pcReviewData.project.project_status, action: "Project metadata updated", actor: "User" });
    formMessage.textContent = "Project metadata updated.";
  }
  formMessage.className = "is-success";
  updatePcProjectSummary();
}

function pcRegisterSourceDocument(source, action) {
  pcReviewData.source_documents.push(source);
  pcReviewData.project.source_document_ids.push(source.source_document_id);
  pcReviewData.project.project_status = source.processing_status;
  pcActiveSourceDocumentId = source.source_document_id;
  pcRecordHistory({ sourceDocumentId: source.source_document_id, newStatus: source.processing_status, action, notes: source.file_name });
  updatePcProjectSummary();
}

function pcBaseSourceDocument(file, extension, sourceHash) {
  return {
    source_document_id: createPcId("pc_source"),
    project_id: pcReviewData.project.project_id,
    file_name: file.name,
    file_type: extension,
    file_size: file.size,
    selected_at: pcNow(),
    document_role: "Particular Conditions",
    extraction_status: "Not Extracted",
    preprocessing_status: "Not Assessed",
    processing_status: "Source Loaded",
    verification_status: "Not Verified",
    extracted_text: null,
    extraction_method: null,
    extraction_error: null,
    source_hash: sourceHash,
    notes: null
  };
}

function pcUnknownKeys(object, allowed) {
  return Object.keys(object || {}).filter((key) => !allowed.includes(key));
}

function pcRequireOwnFields(object, fields, label) {
  if (!object || typeof object !== "object" || Array.isArray(object)) throw new Error(`${label} must be an object.`);
  const missing = fields.find((field) => !Object.hasOwn(object, field));
  if (missing) throw new Error(`${label}.${missing} is required.`);
}

function pcAssertSafeJson(value, path = "$") {
  if (!value || typeof value !== "object") return;
  Object.keys(value).forEach((key) => {
    if (["__proto__", "prototype", "constructor"].includes(key)) throw new Error(`${path}.${key} is not allowed.`);
    pcAssertSafeJson(value[key], `${path}.${key}`);
  });
}

function pcTimestampMillis(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pcReplayAppliedSnapshots(record, appliedLogs) {
  const activeLogs = appliedLogs
    .filter((log) => log.effective_clause_id === record.effective_clause_id && log.application_result === "Applied")
    .sort((a, b) => Number(a.sequence_number || Infinity) - Number(b.sequence_number || Infinity) || String(a.applied_at).localeCompare(String(b.applied_at)));
  const sequences = activeLogs.map((log) => Number(log.sequence_number));
  if (sequences.some((sequence) => !Number.isInteger(sequence) || sequence < 1) || new Set(sequences).size !== sequences.length) {
    return { ok: false, reason: "Active application sequence values must be unique positive integers." };
  }
  let currentText = record.baseline_text ?? "";
  const appliedIds = [];
  let finalStatus = record.baseline_clause_id ? "Unchanged" : "Deleted";
  for (const log of activeLogs) {
    const targetMismatch = (log.target_clause_id ?? null) !== (record.baseline_clause_id ?? null)
      || String(log.target_clause_number ?? "") !== record.clause_number;
    if (targetMismatch || !PC_SUPPORTED_OPERATIONS.includes(log.operation) || !PC_TARGET_BASES.includes(log.target_basis) || log.target_basis === "Unclear") {
      return { ok: false, reason: `Applied log ${log.application_id} has an invalid immutable target or operation snapshot.` };
    }
    const validatesTarget = PCAlignmentEngine.EXACT_TARGET_OPERATIONS.includes(log.operation)
      || (PCAlignmentEngine.WHOLE_CLAUSE_OPERATIONS.includes(log.operation) && Boolean(log.target_text));
    const basisText = log.target_basis === "Current Effective Text" ? currentText : (record.baseline_text ?? "");
    if (validatesTarget) {
      const basisCount = PCAlignmentEngine.countExactOccurrences(basisText, log.target_text);
      const currentCount = PCAlignmentEngine.countExactOccurrences(currentText, log.target_text);
      if (basisCount !== 1 || (log.target_basis === "Original Baseline Text" && currentCount !== 1)) {
        return { ok: false, reason: `Applied log ${log.application_id} cannot be replayed exactly against its recorded target basis.` };
      }
    }
    const result = PCAlignmentEngine.applyOperation(log.operation, currentText, log.target_text, log.replacement_or_added_text, log.target_location, {
      targetOccupied: log.operation === "Add New Sub-Clause" && Boolean(currentText),
      targetExists: Boolean(record.baseline_clause_id || currentText)
    });
    if (!result.ok) return { ok: false, reason: `Applied log ${log.application_id} failed deterministic replay: ${result.failureReason}` };
    if (log.target_occurrence_count !== result.occurrenceCount) {
      return { ok: false, reason: `Applied log ${log.application_id} has an occurrence count inconsistent with deterministic replay.` };
    }
    currentText = result.outputText;
    appliedIds.push(log.amendment_id);
    finalStatus = result.clauseStatus;
  }
  return { ok: true, currentText, appliedIds, activeLogs, finalStatus };
}

function pcReplayImmutableLogs(record, logs) {
  return pcReplayAppliedSnapshots(record, logs.filter((log) => !log.rolled_back_at));
}

function pcReconstructSegmentSide(segments, side) {
  return (segments || []).map((segment) => {
    if (segment.segment_type === "unchanged") return segment.text || "";
    if (segment.segment_type === "deleted") return side === "before" ? segment.text || "" : "";
    if (segment.segment_type === "added") return side === "after" ? segment.text || "" : "";
    if (segment.segment_type === "replaced") return side === "before" ? segment.original_text || "" : segment.text || "";
    return null;
  }).join("");
}

function pcValidateChangeSegments(segments, label, expected = {}) {
  if (!Array.isArray(segments)) throw new Error(`${label} must be an array.`);
  const segmentIds = new Set();
  segments.forEach((segment, index) => {
    if (!segment || typeof segment !== "object" || Array.isArray(segment)) throw new Error(`${label}[${index}] must be an object.`);
    const required = ["segment_id", "order", "segment_type", "source_amendment_id", "source_application_id", "version_number"];
    const missing = required.find((field) => !Object.hasOwn(segment, field));
    if (missing) throw new Error(`${label}[${index}].${missing} is required.`);
    if (!String(segment.segment_id ?? "").trim() || segmentIds.has(segment.segment_id)) throw new Error(`${label}[${index}].segment_id is missing or duplicated.`);
    segmentIds.add(segment.segment_id);
    if (segment.order !== index) throw new Error(`${label}[${index}].order must equal its array position.`);
    if (!["unchanged", "deleted", "added", "replaced"].includes(segment.segment_type)) throw new Error(`${label}[${index}].segment_type is invalid.`);
    if (typeof segment.text !== "string" || (segment.segment_type === "replaced" && typeof segment.original_text !== "string")) {
      throw new Error(`${label}[${index}] lacks the text required for ${segment.segment_type}.`);
    }
    if (!String(segment.source_amendment_id ?? "").trim() || !String(segment.source_application_id ?? "").trim()
      || !Number.isInteger(segment.version_number) || segment.version_number < 0) {
      throw new Error(`${label}[${index}] has invalid provenance metadata.`);
    }
    if (expected.sourceApplicationId !== undefined && segment.source_application_id !== expected.sourceApplicationId) throw new Error(`${label}[${index}] references the wrong application.`);
    if (expected.sourceAmendmentId !== undefined && segment.source_amendment_id !== expected.sourceAmendmentId) throw new Error(`${label}[${index}] references the wrong amendment.`);
    if (expected.versionNumber !== undefined && segment.version_number !== expected.versionNumber) throw new Error(`${label}[${index}] references the wrong version number.`);
  });
}

function pcValidateAmendment(entry, index, mode = "task3-project") {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`amendments[${index}] must be an object.`);
  if (!String(entry.amendment_id ?? "").trim()) throw new Error(`amendments[${index}].amendment_id is required.`);
  if (!String(entry.pc_source_reference ?? "").trim()) throw new Error(`amendments[${index}].pc_source_reference is required.`);
  if (!String(entry.pc_instruction_text ?? "").trim()) throw new Error(`amendments[${index}].pc_instruction_text is required.`);
  if (!PC_AMENDMENT_CATEGORIES.includes(entry.amendment_category)) throw new Error(`amendments[${index}].amendment_category is not supported.`);
  if (!PC_AMENDMENT_OPERATIONS.includes(entry.amendment_operation)) throw new Error(`amendments[${index}].amendment_operation is not supported.`);
  const deferred = ["Defined-term Amendment", "Global Amendment"].includes(entry.amendment_category);
  if (deferred && entry.application_status !== "Identified – Deferred") throw new Error(`amendments[${index}].application_status must be Identified – Deferred for its category.`);
  if (entry.verification_status !== "Not Verified") throw new Error(`amendments[${index}].verification_status must remain Not Verified.`);
  ["affected_element_ids", "affected_tag_ids"].forEach((field) => {
    if (!Array.isArray(entry[field]) || entry[field].length) throw new Error(`amendments[${index}].${field} must remain an empty array in Task 3.`);
  });
  if (!Array.isArray(entry.global_dependency_ids)) throw new Error(`amendments[${index}].global_dependency_ids must be an array.`);
  if (entry.amendment_category === "Defined-term Amendment" && entry.amendment_operation !== "Amend Defined Term") throw new Error(`amendments[${index}] defined-term category must use Amend Defined Term.`);
  if (entry.amendment_category === "Global Amendment" && entry.amendment_operation !== "Global Amendment") throw new Error(`amendments[${index}] global category must use Global Amendment.`);
  if (entry.amendment_category === "Unclassified Instruction" && entry.human_review_required !== true) throw new Error(`amendments[${index}] unclassified instruction must require human review.`);
  if (["Delete Exact Text", "Replace Exact Text"].includes(entry.amendment_operation) && !String(entry.target_text ?? "").trim()) throw new Error(`amendments[${index}].target_text is required for ${entry.amendment_operation}.`);
  if (["Replace Exact Text", "Replace Paragraph", "Replace Entire Sub-Clause", "Insert Before", "Insert After", "Add Paragraph", "Add New Sub-Clause"].includes(entry.amendment_operation) && !String(entry.replacement_or_added_text ?? "").trim()) throw new Error(`amendments[${index}].replacement_or_added_text is required for ${entry.amendment_operation}.`);
  ["benchmark_element_id", "effective_element_id", "affected_party", "risk_direction", "risk_category", "benchmark_deviation", "substantive_exposure", "procedural_burden", "financial_exposure", "controllability", "uncertainty", "confidence", "scoring_rule_id", "risk_rationale", "governing_law_review_status", "risk_verification_status"].forEach((field) => {
    if (entry[field] !== null && entry[field] !== undefined && entry[field] !== "Not Assessed") throw new Error(`amendments[${index}].${field} cannot be populated in Task 3.`);
  });
  if (mode === "legacy-project") {
    ["target_gc_clause_id", "target_gc_clause_number", "target_gc_heading", "effective_clause_id", "effective_location", "source_confidence"].forEach((field) => {
      if (entry[field] !== null && entry[field] !== "" && entry[field] !== undefined) throw new Error(`amendments[${index}].${field} must remain null in a Task 2 project.`);
    });
    if (entry.alignment_status !== "Not Assessed") throw new Error(`amendments[${index}].alignment_status must be Not Assessed in a Task 2 project.`);
    if (!deferred && entry.application_status !== "Not Assessed") throw new Error(`amendments[${index}].application_status is invalid for a Task 2 project.`);
    if (entry.global_dependency_ids.length) throw new Error(`amendments[${index}].global_dependency_ids must be empty in a Task 2 project.`);
    return;
  }
  if (mode === "structured-input") {
    if (entry.target_gc_clause_id !== null && entry.target_gc_clause_id !== undefined) throw new Error(`amendments[${index}].target_gc_clause_id must not contain a pre-computed alignment.`);
    if (entry.alignment_status !== "Not Assessed") throw new Error(`amendments[${index}].alignment_status must be Not Assessed in structured input.`);
    if (!deferred && entry.application_status !== "Not Assessed") throw new Error(`amendments[${index}].application_status must be Not Assessed in structured input.`);
    if (entry.effective_clause_id !== null && entry.effective_clause_id !== undefined) throw new Error(`amendments[${index}].effective_clause_id must be null in structured input.`);
    if (entry.machine_alignment_status && entry.machine_alignment_status !== "Not Assessed") throw new Error(`amendments[${index}] cannot import a machine alignment result.`);
    return;
  }
  if (!PC_ALIGNMENT_STATUSES.includes(entry.alignment_status)) throw new Error(`amendments[${index}].alignment_status is invalid.`);
  if (!PC_TARGET_BASES.includes(entry.target_basis)) throw new Error(`amendments[${index}].target_basis is invalid.`);
  if (entry.machine_alignment_status !== null && entry.machine_alignment_status !== undefined && !PC_ALIGNMENT_STATUSES.includes(entry.machine_alignment_status)) {
    throw new Error(`amendments[${index}].machine_alignment_status is invalid.`);
  }
  if (!PC_APPLICATION_STATUSES.includes(entry.application_status)) throw new Error(`amendments[${index}].application_status is invalid.`);
}

function pcUpgradeAmendmentForTask3(entry) {
  const deferred = ["Defined-term Amendment", "Global Amendment"].includes(entry.amendment_category);
  return {
    ...entry,
    target_gc_clause_id: entry.target_gc_clause_id || null,
    target_gc_clause_number: pcNullable(entry.target_gc_clause_number),
    target_gc_heading: pcNullable(entry.target_gc_heading),
    target_basis: PC_TARGET_BASES.includes(entry.target_basis) ? entry.target_basis : "Unclear",
    target_location: pcNullable(entry.target_location || entry.effective_location),
    alignment_status: PC_ALIGNMENT_STATUSES.includes(entry.alignment_status) ? entry.alignment_status : "Not Assessed",
    machine_alignment_status: PC_ALIGNMENT_STATUSES.includes(entry.machine_alignment_status) ? entry.machine_alignment_status : null,
    machine_alignment_reason: pcNullable(entry.machine_alignment_reason),
    active_alignment_assessment_id: entry.active_alignment_assessment_id || null,
    active_alignment_decision_id: entry.active_alignment_decision_id || null,
    manual_alignment_status: entry.manual_alignment_status || null,
    manual_alignment_decision: entry.manual_alignment_decision || null,
    manual_alignment_at: entry.manual_alignment_at || null,
    manual_alignment_by: entry.manual_alignment_by || null,
    proposed_target_gc_clause_id: entry.proposed_target_gc_clause_id || null,
    proposed_target_gc_clause_number: pcNullable(entry.proposed_target_gc_clause_number),
    proposed_target_gc_heading: pcNullable(entry.proposed_target_gc_heading),
    target_occurrence_count: Number.isInteger(entry.target_occurrence_count) ? entry.target_occurrence_count : null,
    alignment_conflicts: Array.isArray(entry.alignment_conflicts) ? entry.alignment_conflicts : [],
    blocking_issue: pcNullable(entry.blocking_issue),
    alignment_evaluated_at: entry.alignment_evaluated_at || null,
    application_status: deferred ? "Identified – Deferred" : (entry.application_status || "Not Assessed"),
    effective_clause_id: entry.effective_clause_id || null,
    effective_location: pcNullable(entry.effective_location),
    affected_element_ids: [],
    affected_tag_ids: [],
    global_dependency_ids: Array.isArray(entry.global_dependency_ids) ? entry.global_dependency_ids : [],
    verification_status: "Not Verified"
  };
}

function pcUpgradeReviewProject(data) {
  const upgraded = structuredClone(data);
  upgraded.schema_version = PC_REVIEW_SCHEMA_VERSION;
  upgraded.alignment_assessments = Array.isArray(upgraded.alignment_assessments) ? upgraded.alignment_assessments : [];
  upgraded.alignment_decisions = Array.isArray(upgraded.alignment_decisions) ? upgraded.alignment_decisions : [];
  upgraded.effective_clauses = Array.isArray(upgraded.effective_clauses) ? upgraded.effective_clauses : [];
  upgraded.application_log = Array.isArray(upgraded.application_log) ? upgraded.application_log : [];
  upgraded.processing_history = Array.isArray(upgraded.processing_history) ? upgraded.processing_history : [];
  upgraded.amendments = upgraded.amendments.map(pcUpgradeAmendmentForTask3);
  upgraded.project.consolidation_mode = "Preview / Unverified Baseline";
  upgraded.project.publication_eligible = false;
  upgraded.project.baseline_source_sha256 = upgraded.project.baseline_source_sha256 || fidicSourceLayer?.source_sha256 || null;
  upgraded.project.baseline_source_layer_sha256 = upgraded.project.baseline_source_layer_sha256 || fidicSourceLayer?.runtime_source_layer_sha256 || null;
  upgraded.project.alignment_assessment_ids = upgraded.alignment_assessments.map((item) => item.alignment_assessment_id);
  upgraded.project.alignment_decision_ids = upgraded.alignment_decisions.map((item) => item.alignment_decision_id);
  upgraded.project.effective_clause_ids = upgraded.effective_clauses.map((item) => item.effective_clause_id);
  upgraded.project.application_ids = upgraded.application_log.map((item) => item.application_id);
  return upgraded;
}

function pcValidateJsonPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("JSON root must be an object.");
  pcAssertSafeJson(data);
  const reviewProjectVersions = [PC_REVIEW_SCHEMA_VERSION, PC_REVIEW_LEGACY_SCHEMA_VERSION];
  if (reviewProjectVersions.includes(data.schema_version) && data.document_type === "pc_review_project") {
    const isLegacy = data.schema_version === PC_REVIEW_LEGACY_SCHEMA_VERSION;
    pcRequireOwnFields(data, isLegacy
      ? ["schema_version", "document_type", "export_timestamp", "project", "source_documents", "amendments", "processing_history"]
      : ["schema_version", "document_type", "export_timestamp", "project", "source_documents", "amendments", "alignment_assessments", "alignment_decisions", "effective_clauses", "application_log", "processing_history"], "$" );
    if (data.export_timestamp !== null && pcTimestampMillis(data.export_timestamp) === null) throw new Error("export_timestamp must be null or an ISO date-time string.");
    if (!data.project || typeof data.project !== "object") throw new Error("project object is required.");
    const legacyProjectFields = ["project_id", "project_name", "contract_reference", "fidic_form", "fidic_edition", "baseline_id", "baseline_verification_status", "created_at", "updated_at", "project_status", "source_document_ids", "amendment_ids", "notes"];
    pcRequireOwnFields(data.project, isLegacy ? legacyProjectFields : [...legacyProjectFields, "consolidation_mode", "publication_eligible", "baseline_source_sha256", "baseline_source_layer_sha256", "alignment_assessment_ids", "alignment_decision_ids", "effective_clause_ids", "application_ids"], "project");
    if (!data.project.project_id || !data.project.project_name) throw new Error("project.project_id and project.project_name are required.");
    if (pcTimestampMillis(data.project.created_at) === null || pcTimestampMillis(data.project.updated_at) === null) throw new Error("project.created_at and project.updated_at must be ISO date-time strings.");
    if (data.project.fidic_form !== "Red Book" || data.project.fidic_edition !== "2017" || data.project.baseline_id !== "fidic_red_2017") {
      throw new Error("Only the FIDIC Red Book 2017 baseline is supported.");
    }
    if (data.project.baseline_verification_status !== "Not Verified") throw new Error("baseline_verification_status must remain Not Verified while PDF verification is incomplete.");
    if (!Array.isArray(data.project.source_document_ids) || !Array.isArray(data.project.amendment_ids)) throw new Error("project source_document_ids and amendment_ids must be arrays.");
    if (!PC_PROJECT_STATUSES.includes(data.project.project_status)) throw new Error("project.project_status is not a controlled Task 3 status.");
    if (!isLegacy && (data.project.consolidation_mode !== "Preview / Unverified Baseline" || data.project.publication_eligible !== false)) {
      throw new Error("Task 3 projects must remain Preview / Unverified Baseline and publication_eligible=false.");
    }
    const currentSourceGate = PCAlignmentEngine.sourceLayerGate(fidicSourceLayer);
    if (!isLegacy && !currentSourceGate.ok) {
      throw new Error(`The controlled FIDIC source layer must be loaded before a Task 3 project can be imported: ${currentSourceGate.reason}`);
    }
    if (!isLegacy && (data.project.baseline_source_sha256 !== fidicSourceLayer.source_sha256
      || data.project.baseline_source_layer_sha256 !== fidicSourceLayer.runtime_source_layer_sha256)) {
      throw new Error("The project baseline origin or processed source-layer SHA-256 does not match the currently loaded controlled source layer.");
    }
    if (!Array.isArray(data.source_documents) || !Array.isArray(data.amendments) || !Array.isArray(data.processing_history)) {
      throw new Error("source_documents, amendments and processing_history must be arrays.");
    }
    data.source_documents.forEach((source, index) => {
      pcRequireOwnFields(source, ["source_document_id", "project_id", "file_name", "file_type", "file_size", "selected_at", "document_role", "extraction_status", "preprocessing_status", "processing_status", "verification_status", "extracted_text", "extraction_method", "extraction_error", "source_hash", "notes"], `source_documents[${index}]`);
      if (!source?.source_document_id || !source?.file_name || !source?.file_type) throw new Error(`source_documents[${index}] is missing its id, filename or type.`);
      if (source.project_id !== data.project.project_id) throw new Error(`source_documents[${index}].project_id does not match the project.`);
      if (pcTimestampMillis(source.selected_at) === null) throw new Error(`source_documents[${index}].selected_at must be an ISO date-time string.`);
      if (!['txt', 'json', 'docx', 'pdf'].includes(String(source.file_type).toLowerCase())) throw new Error(`source_documents[${index}].file_type is unsupported.`);
      if (source.document_role !== "Particular Conditions" || source.verification_status !== "Not Verified") throw new Error(`source_documents[${index}] has an unsupported role or verification status.`);
      if (!Number.isSafeInteger(source.file_size) || source.file_size < 0) throw new Error(`source_documents[${index}].file_size must be a non-negative integer.`);
      if (source.source_hash !== null && !/^sha256:[0-9a-f]{64}$/.test(source.source_hash)) throw new Error(`source_documents[${index}].source_hash is invalid.`);
      if (['docx', 'pdf'].includes(String(source.file_type).toLowerCase()) && (source.extraction_status !== "Not Extracted" || source.preprocessing_status !== "Requires Preprocessing" || source.extracted_text !== null)) {
        throw new Error(`source_documents[${index}] claims unsupported DOCX/PDF extraction.`);
      }
    });
    const amendmentRequiredFields = ["amendment_id", "project_id", "pc_source_document_id", "pc_source_reference", "pc_instruction_text", "pc_instruction_summary", "pc_clause_number", "pc_clause_heading", "parent_clause", "target_gc_clause_id", "target_gc_clause_number", "target_gc_heading", "amendment_operation", "target_text", "replacement_or_added_text", "sequence_number", "amendment_category", "alignment_status", "application_status", "verification_status", "effective_clause_id", "effective_location", "affected_element_ids", "affected_tag_ids", "global_dependency_ids", "human_review_required", "source_confidence", "notes"];
    data.amendments.forEach((entry, index) => {
      pcRequireOwnFields(entry, isLegacy ? amendmentRequiredFields : [...amendmentRequiredFields, "target_basis", "machine_alignment_status"], `amendments[${index}]`);
      pcValidateAmendment(entry, index, isLegacy ? "legacy-project" : "task3-project");
    });
    const sourceIds = data.source_documents.map((source) => source.source_document_id);
    const amendmentIds = data.amendments.map((entry) => entry.amendment_id);
    if (new Set(sourceIds).size !== sourceIds.length) throw new Error("source_document_id values must be unique.");
    if (new Set(amendmentIds).size !== amendmentIds.length) throw new Error("amendment_id values must be unique.");
    if (JSON.stringify([...data.project.source_document_ids].sort()) !== JSON.stringify([...sourceIds].sort())) throw new Error("project.source_document_ids must match source_documents exactly.");
    if (JSON.stringify([...data.project.amendment_ids].sort()) !== JSON.stringify([...amendmentIds].sort())) throw new Error("project.amendment_ids must match amendments exactly.");
    data.amendments.forEach((entry, index) => {
      if (entry.project_id !== data.project.project_id) throw new Error(`amendments[${index}].project_id does not match the project.`);
      if (!sourceIds.includes(entry.pc_source_document_id)) throw new Error(`amendments[${index}].pc_source_document_id does not reference an imported source.`);
      const missingDependency = entry.global_dependency_ids.find((id) => !amendmentIds.includes(id));
      if (missingDependency) throw new Error(`amendments[${index}].global_dependency_ids references missing amendment ${missingDependency}.`);
    });
    const historyIds = data.processing_history.map((item, index) => {
      pcRequireOwnFields(item, ["event_id", "project_id", "source_document_id", "amendment_id", "timestamp", "previous_status", "new_status", "action", "actor", "notes"], `processing_history[${index}]`);
      if (!item.event_id || item.project_id !== data.project.project_id) throw new Error(`processing_history[${index}] has an invalid id or project reference.`);
      if (pcTimestampMillis(item.timestamp) === null) throw new Error(`processing_history[${index}].timestamp is invalid.`);
      return item.event_id;
    });
    if (new Set(historyIds).size !== historyIds.length) throw new Error("processing history event_id values must be unique.");
    if (!isLegacy) {
      ["alignment_assessments", "alignment_decisions", "effective_clauses", "application_log"].forEach((field) => {
        if (!Array.isArray(data[field])) throw new Error(`${field} must be an array in ${PC_REVIEW_SCHEMA_VERSION}.`);
      });
      const assessmentIds = data.alignment_assessments.map((item, index) => {
        pcRequireOwnFields(item, ["alignment_assessment_id", "amendment_id", "assessed_at", "assessed_by", "baseline_id", "baseline_source_sha256", "baseline_source_layer_sha256", "amendment_operation", "target_basis", "target_location", "replacement_or_added_text", "sequence_number", "machine_status", "underlying_match_status", "asserted_target", "proposed_target", "evidence", "conflicts", "blocking_dependency_ids", "blocking_issue", "reason", "supersedes_assessment_id"], `alignment_assessments[${index}]`);
        if (!item?.alignment_assessment_id || !amendmentIds.includes(item.amendment_id)) throw new Error(`alignment_assessments[${index}] has an invalid id or amendment reference.`);
        if (pcTimestampMillis(item.assessed_at) === null || !String(item.assessed_by ?? "").trim()) throw new Error(`alignment_assessments[${index}] has invalid assessment audit metadata.`);
        if (!["Exact Match", "Target Text Match", "Number Match / Heading Difference", "Heading Match / Number Difference", "Probable Match", "Ambiguous", "Unmatched", "New Clause", "Blocking Dependency", "Not Assessed"].includes(item.machine_status)) throw new Error(`alignment_assessments[${index}].machine_status is invalid.`);
        if (item.baseline_source_sha256 !== fidicSourceLayer.source_sha256
          || item.baseline_source_layer_sha256 !== fidicSourceLayer.runtime_source_layer_sha256) {
          throw new Error(`alignment_assessments[${index}] was recorded against a different baseline source identity or processed source layer.`);
        }
        return item.alignment_assessment_id;
      });
      if (new Set(assessmentIds).size !== assessmentIds.length) throw new Error("alignment_assessment_id values must be unique.");
      const assessmentsById = new Map(data.alignment_assessments.map((item) => [item.alignment_assessment_id, item]));
      const derivedActiveAssessmentByAmendment = new Map();
      const lastAssessmentTimeByAmendment = new Map();
      data.alignment_assessments.forEach((assessment, index) => {
        const priorAssessmentId = derivedActiveAssessmentByAmendment.get(assessment.amendment_id) || null;
        if ((assessment.supersedes_assessment_id ?? null) !== priorAssessmentId) throw new Error(`alignment_assessments[${index}].supersedes_assessment_id does not match the preceding assessment for its amendment.`);
        const assessmentTime = pcTimestampMillis(assessment.assessed_at);
        const previousAssessmentTime = lastAssessmentTimeByAmendment.get(assessment.amendment_id);
        if (previousAssessmentTime !== undefined && assessmentTime < previousAssessmentTime) throw new Error(`alignment_assessments[${index}].assessed_at is not chronological for its amendment.`);
        lastAssessmentTimeByAmendment.set(assessment.amendment_id, assessmentTime);
        derivedActiveAssessmentByAmendment.set(assessment.amendment_id, assessment.alignment_assessment_id);
      });
      const decisionIds = data.alignment_decisions.map((item, index) => {
        pcRequireOwnFields(item, ["alignment_decision_id", "amendment_id", "alignment_assessment_id", "action", "previous_alignment_status", "new_alignment_status", "confirmed_target_clause_id", "confirmed_target_clause_number", "confirmed_target_heading", "decided_at", "decided_by", "supersedes_decision_id", "processing_history_event_id"], `alignment_decisions[${index}]`);
        if (!item?.alignment_decision_id || !amendmentIds.includes(item.amendment_id)) throw new Error(`alignment_decisions[${index}] has an invalid id or amendment reference.`);
        if (!assessmentIds.includes(item.alignment_assessment_id)) throw new Error(`alignment_decisions[${index}] does not reference an alignment assessment.`);
        if (!["Confirm Alignment", "Reject Alignment", "Mark Ambiguous", "Clear Manual Decision"].includes(item.action) || pcTimestampMillis(item.decided_at) === null || !String(item.decided_by ?? "").trim()) throw new Error(`alignment_decisions[${index}] has invalid decision audit metadata.`);
        return item.alignment_decision_id;
      });
      if (new Set(decisionIds).size !== decisionIds.length) throw new Error("alignment_decision_id values must be unique.");
      const decisionsById = new Map(data.alignment_decisions.map((item) => [item.alignment_decision_id, item]));
      const derivedActiveDecisionByAmendment = new Map();
      const lastDecisionTimeByAmendment = new Map();
      data.alignment_decisions.forEach((decision, index) => {
        const assessment = assessmentsById.get(decision.alignment_assessment_id);
        if (!assessment || assessment.amendment_id !== decision.amendment_id) throw new Error(`alignment_decisions[${index}] references an assessment for a different amendment.`);
        const assessmentActiveAtDecision = data.alignment_assessments
          .filter((candidate) => candidate.amendment_id === decision.amendment_id
            && pcTimestampMillis(candidate.assessed_at) <= pcTimestampMillis(decision.decided_at))
          .at(-1) || null;
        if (assessmentActiveAtDecision?.alignment_assessment_id !== decision.alignment_assessment_id) throw new Error(`alignment_decisions[${index}] does not reference the assessment active when the decision was recorded.`);
        const priorDecisionId = derivedActiveDecisionByAmendment.get(decision.amendment_id) || null;
        const priorDecision = priorDecisionId ? decisionsById.get(priorDecisionId) : null;
        if ((decision.supersedes_decision_id ?? null) !== priorDecisionId) throw new Error(`alignment_decisions[${index}].supersedes_decision_id does not match the active decision at that point.`);
        if (decision.action === "Clear Manual Decision" && !priorDecision) throw new Error(`alignment_decisions[${index}] cannot clear a manual decision when none is active.`);
        if (priorDecision?.action === "Reject Alignment" && decision.action !== "Clear Manual Decision") throw new Error(`alignment_decisions[${index}] cannot supersede an uncleared Reject Alignment decision.`);
        if (decision.action === "Confirm Alignment" && (assessment.machine_status === "Blocking Dependency"
          || assessment.blocking_dependency_ids?.length
          || assessment.blocking_issue)) {
          throw new Error(`alignment_decisions[${index}] cannot confirm an assessment with a blocking dependency.`);
        }
        const proposedTarget = assessment.proposed_target || {};
        if (decision.action === "Confirm Alignment") {
          if ((decision.confirmed_target_clause_id ?? null) !== (proposedTarget.clause_id ?? null)
            || (decision.confirmed_target_clause_number ?? null) !== (proposedTarget.clause_number ?? null)
            || (decision.confirmed_target_heading ?? null) !== (proposedTarget.clause_heading ?? null)
            || (!(decision.confirmed_target_clause_id ?? null) && !(decision.confirmed_target_clause_number ?? null))) {
            throw new Error(`alignment_decisions[${index}] confirmed target does not exactly match its alignment assessment.`);
          }
        } else if (decision.confirmed_target_clause_id !== null
          || decision.confirmed_target_clause_number !== null
          || decision.confirmed_target_heading !== null) {
          throw new Error(`alignment_decisions[${index}] cannot retain a confirmed target for ${decision.action}.`);
        }
        const expectedPreviousStatus = priorDecision?.new_alignment_status || assessment.machine_status;
        const expectedNewStatus = {
          "Confirm Alignment": "Human Confirmed",
          "Reject Alignment": "Rejected",
          "Mark Ambiguous": "Ambiguous",
          "Clear Manual Decision": assessment.machine_status
        }[decision.action];
        if (decision.previous_alignment_status !== expectedPreviousStatus || decision.new_alignment_status !== expectedNewStatus) {
          throw new Error(`alignment_decisions[${index}] action/status transition is inconsistent with its assessment and prior decision.`);
        }
        const decisionTime = pcTimestampMillis(decision.decided_at);
        if (decisionTime < pcTimestampMillis(assessment.assessed_at)) throw new Error(`alignment_decisions[${index}].decided_at predates its alignment assessment.`);
        const previousDecisionTime = lastDecisionTimeByAmendment.get(decision.amendment_id);
        if (previousDecisionTime !== undefined && decisionTime < previousDecisionTime) throw new Error(`alignment_decisions[${index}].decided_at is not chronological for its amendment.`);
        lastDecisionTimeByAmendment.set(decision.amendment_id, decisionTime);
        derivedActiveDecisionByAmendment.set(decision.amendment_id, decision.action === "Clear Manual Decision" ? null : decision.alignment_decision_id);
      });
      const effectiveIds = data.effective_clauses.map((item, index) => {
        pcRequireOwnFields(item, ["effective_clause_id", "project_id", "baseline_clause_id", "clause_number", "clause_heading", "parent_clause_number", "baseline_original_order", "effective_order_key", "baseline_text", "current_effective_text", "current_version_id", "current_version_number", "amendment_ids", "applied_amendment_ids", "failed_amendment_ids", "clause_status", "baseline_verification_status", "effective_verification_status", "publication_eligible", "is_tombstone", "version_history", "structured_change_segments", "unresolved_issues", "created_at", "updated_at"], `effective_clauses[${index}]`);
        if (!item?.effective_clause_id || item.project_id !== data.project.project_id) throw new Error(`effective_clauses[${index}] has an invalid id or project reference.`);
        if (pcTimestampMillis(item.created_at) === null || pcTimestampMillis(item.updated_at) === null) throw new Error(`effective_clauses[${index}] has invalid created_at or updated_at metadata.`);
        if (item.effective_verification_status !== "Not Verified" || item.publication_eligible !== false) throw new Error(`effective_clauses[${index}] must remain Not Verified and publication-ineligible.`);
        if (!Array.isArray(item.version_history) || !item.version_history.length || !Array.isArray(item.structured_change_segments)) throw new Error(`effective_clauses[${index}] is missing version history or change segments.`);
        ["amendment_ids", "applied_amendment_ids", "failed_amendment_ids", "unresolved_issues"].forEach((field) => {
          if (!Array.isArray(item[field])) throw new Error(`effective_clauses[${index}].${field} must be an array.`);
        });
        if ([...item.amendment_ids, ...item.applied_amendment_ids, ...item.failed_amendment_ids].some((id) => !amendmentIds.includes(id))) throw new Error(`effective_clauses[${index}] references a missing amendment.`);
        if (new Set(item.amendment_ids).size !== item.amendment_ids.length) throw new Error(`effective_clauses[${index}].amendment_ids must be unique.`);
        if (new Set(item.applied_amendment_ids).size !== item.applied_amendment_ids.length) throw new Error(`effective_clauses[${index}].applied_amendment_ids must be unique.`);
        if (new Set(item.failed_amendment_ids).size !== item.failed_amendment_ids.length) throw new Error(`effective_clauses[${index}].failed_amendment_ids must be unique.`);
        if (item.applied_amendment_ids.some((id) => item.failed_amendment_ids.includes(id))) throw new Error(`effective_clauses[${index}] cannot mark the same amendment both applied and failed.`);
        const versions = item.version_history;
        const versionIds = versions.map((version) => version?.version_id);
        if (versionIds.some((id) => !id) || new Set(versionIds).size !== versionIds.length) throw new Error(`effective_clauses[${index}] has duplicate or missing version IDs.`);
        versions.forEach((version, versionIndex) => {
          pcRequireOwnFields(version, ["version_id", "version_number", "parent_version_id", "version_event", "created_by_application_id", "text", "active_amendment_ids", "structured_change_segments", "created_at", "created_by"], `effective_clauses[${index}].version_history[${versionIndex}]`);
          if (!version || typeof version !== "object" || version.version_number !== versionIndex || typeof version.text !== "string") {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex}] must have contiguous zero-based numbering and exact text.`);
          }
          const versionTime = pcTimestampMillis(version.created_at);
          const previousVersionTime = versionIndex ? pcTimestampMillis(versions[versionIndex - 1].created_at) : null;
          if (versionTime === null || (previousVersionTime !== null && versionTime < previousVersionTime)) {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex}] has an invalid or non-monotonic timestamp.`);
          }
          const expectedParentId = versionIndex === 0 ? null : versions[versionIndex - 1].version_id;
          if ((version.parent_version_id ?? null) !== expectedParentId) throw new Error(`effective_clauses[${index}].version_history[${versionIndex}] has an invalid parent_version_id.`);
          if (versionIndex === 0 && version.created_by_application_id !== null) throw new Error(`effective_clauses[${index}] initial version cannot be created by an application.`);
          if (versionIndex > 0 && !String(version.created_by_application_id ?? "").trim()) throw new Error(`effective_clauses[${index}].version_history[${versionIndex}] must identify its creating application.`);
          if (!Array.isArray(version.active_amendment_ids) || new Set(version.active_amendment_ids).size !== version.active_amendment_ids.length || version.active_amendment_ids.some((id) => !amendmentIds.includes(id))) {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex}].active_amendment_ids is invalid.`);
          }
          pcValidateChangeSegments(version.structured_change_segments, `effective_clauses[${index}].version_history[${versionIndex}].structured_change_segments`);
        });
        const currentVersion = versions.at(-1);
        const expectedInitialText = item.baseline_text ?? "";
        const expectedInitialEvent = item.baseline_clause_id ? "Baseline" : "New Clause Pending";
        if (versions[0].text !== expectedInitialText || versions[0].version_event !== expectedInitialEvent) {
          throw new Error(`effective_clauses[${index}] initial version does not preserve its declared baseline origin.`);
        }
        if (versions[0].active_amendment_ids.length || versions[0].structured_change_segments.length) {
          throw new Error(`effective_clauses[${index}] initial version must have no active amendments or change segments.`);
        }
        if (item.current_version_id !== currentVersion.version_id || item.current_version_number !== currentVersion.version_number) {
          throw new Error(`effective_clauses[${index}] current version pointer must reference the last contiguous version.`);
        }
        if (item.created_at !== versions[0].created_at) {
          throw new Error(`effective_clauses[${index}].created_at must equal its initial version created_at.`);
        }
        if (pcTimestampMillis(item.updated_at) < pcTimestampMillis(currentVersion.created_at)) {
          throw new Error(`effective_clauses[${index}].updated_at cannot predate its current version.`);
        }
        if (currentVersion.text !== item.current_effective_text) throw new Error(`effective_clauses[${index}] current text does not match its current version.`);
        if (item.baseline_clause_id) {
          const controlledBaseline = currentSourceGate.ok ? currentSourceGate.index.byId.get(item.baseline_clause_id) : null;
          if (currentSourceGate.ok && !controlledBaseline) throw new Error(`effective_clauses[${index}].baseline_clause_id is absent from the controlled source layer.`);
          if (controlledBaseline && (controlledBaseline.clause_no !== item.clause_number
            || controlledBaseline.clause_title !== item.clause_heading
            || controlledBaseline.parent_clause_no !== item.parent_clause_number
            || controlledBaseline.full_text !== item.baseline_text
            || item.baseline_original_order !== controlledBaseline.original_order
            || item.effective_order_key !== controlledBaseline.original_order)) {
            throw new Error(`effective_clauses[${index}] baseline identity, heading, parent, order or text differs from the controlled source layer.`);
          }
          const expectedBaselineVerification = controlledBaseline?.pdf_verification_status || controlledBaseline?.verification_status || fidicSourceLayer?.verification_status;
          if (controlledBaseline && item.baseline_verification_status !== expectedBaselineVerification) throw new Error(`effective_clauses[${index}].baseline_verification_status differs from the controlled source record.`);
        } else {
          const hasNewClauseOrigin = item.version_history.some((version) => ["New Clause Pending", "New Clause Created"].includes(version.version_event));
          if (item.baseline_text !== null || !hasNewClauseOrigin) throw new Error(`effective_clauses[${index}] without a baseline_clause_id must retain a New Clause origin in its version history.`);
          const intendedParent = PCAlignmentEngine.parentNumber(item.clause_number);
          if (!intendedParent || item.parent_clause_number !== intendedParent || !currentSourceGate.index.mainClauseNumbers.has(intendedParent)
            || item.baseline_original_order !== null || item.effective_order_key !== item.clause_number) {
            throw new Error(`effective_clauses[${index}] has an invalid New Clause parent or ordering identity.`);
          }
          if (currentSourceGate.ok && item.baseline_verification_status !== fidicSourceLayer.verification_status) throw new Error(`effective_clauses[${index}].baseline_verification_status differs from the controlled source-layer status.`);
        }
        return item.effective_clause_id;
      });
      if (new Set(effectiveIds).size !== effectiveIds.length) throw new Error("effective_clause_id values must be unique.");
      const effectiveClauseNumbers = data.effective_clauses.map((item) => item.clause_number);
      const effectiveBaselineIds = data.effective_clauses.filter((item) => item.baseline_clause_id).map((item) => item.baseline_clause_id);
      if (new Set(effectiveClauseNumbers).size !== effectiveClauseNumbers.length) throw new Error("Each clause_number may have only one Effective Clause record.");
      if (new Set(effectiveBaselineIds).size !== effectiveBaselineIds.length) throw new Error("Each controlled baseline clause may have only one Effective Clause record.");
      data.effective_clauses.forEach((item, index) => {
        if (!item.baseline_clause_id && currentSourceGate.index.byNumber.has(item.clause_number)) {
          throw new Error(`effective_clauses[${index}] claims a New Clause number that is already occupied by the controlled baseline.`);
        }
      });
      const effectiveById = new Map(data.effective_clauses.map((item) => [item.effective_clause_id, item]));
      const applicationIds = data.application_log.map((item, index) => {
        pcRequireOwnFields(item, ["application_id", "amendment_id", "effective_clause_id", "attempt_type", "operation", "amendment_category", "target_basis", "input_version", "target_clause_id", "target_clause_number", "target_text", "replacement_or_added_text", "target_location", "sequence_number", "target_occurrence_count", "output_version", "output_text", "application_result", "failure_reason", "change_segments", "attempted_at", "applied_at", "applied_by", "rollback_available", "rolled_back_at", "reverses_application_id", "verification_status"], `application_log[${index}]`);
        if (!item?.application_id || !amendmentIds.includes(item.amendment_id)) throw new Error(`application_log[${index}] has an invalid id or amendment reference.`);
        const requiredAuditFields = ["effective_clause_id", "attempt_type", "operation", "amendment_category", "target_basis", "input_version", "target_clause_id", "target_clause_number", "target_text", "replacement_or_added_text", "target_location", "sequence_number", "target_occurrence_count", "output_version", "output_text", "application_result", "failure_reason", "change_segments", "attempted_at", "applied_at", "applied_by", "rollback_available", "rolled_back_at", "reverses_application_id", "verification_status"];
        const missingAuditField = requiredAuditFields.find((field) => !Object.hasOwn(item, field));
        if (missingAuditField) throw new Error(`application_log[${index}].${missingAuditField} is required for a complete audit record.`);
        if (!["Previewed", "Applied", "Failed", "Rejected", "Rolled Back"].includes(item.application_result)) throw new Error(`application_log[${index}].application_result is invalid.`);
        const allowedResultsByAttempt = {
          Preview: ["Previewed", "Failed"],
          Apply: ["Applied", "Failed"],
          Rollback: ["Rolled Back", "Failed"],
          Reject: ["Rejected"]
        };
        if (!allowedResultsByAttempt[item.attempt_type]?.includes(item.application_result)) throw new Error(`application_log[${index}] has an invalid attempt_type/application_result combination.`);
        if (["Previewed", "Applied", "Rolled Back"].includes(item.application_result) && item.failure_reason !== null) {
          throw new Error(`application_log[${index}] cannot report a failure reason for a successful result.`);
        }
        if (["Failed", "Rejected"].includes(item.application_result) && !String(item.failure_reason ?? "").trim()) {
          throw new Error(`application_log[${index}] must record a failure/rejection reason.`);
        }
        if (["Failed", "Rejected"].includes(item.application_result)
          && (item.output_version !== null || !Array.isArray(item.change_segments) || item.change_segments.length)) {
          throw new Error(`application_log[${index}] failed/rejected attempt must not claim an output version or change segments.`);
        }
        if (item.application_result === "Rejected" && item.output_text !== null) {
          throw new Error(`application_log[${index}] rejected alignment must not claim output text.`);
        }
        if (item.application_result === "Rolled Back" && item.target_occurrence_count !== 1) {
          throw new Error(`application_log[${index}] successful rollback must retain the deterministic occurrence count.`);
        }
        if (!PC_AMENDMENT_OPERATIONS.includes(item.operation) || !PC_AMENDMENT_CATEGORIES.includes(item.amendment_category) || !PC_TARGET_BASES.includes(item.target_basis)) {
          throw new Error(`application_log[${index}] has an uncontrolled operation, category or target basis.`);
        }
        if (!String(item.applied_by ?? "").trim()) throw new Error(`application_log[${index}] has invalid actor metadata.`);
        pcValidateChangeSegments(item.change_segments, `application_log[${index}].change_segments`, {
          sourceApplicationId: item.application_id,
          sourceAmendmentId: item.amendment_id
        });
        const attemptedAt = pcTimestampMillis(item.attempted_at);
        const appliedAt = item.applied_at === null ? null : pcTimestampMillis(item.applied_at);
        const rolledBackAt = item.rolled_back_at === null ? null : pcTimestampMillis(item.rolled_back_at);
        if (attemptedAt === null || (item.applied_at !== null && (appliedAt === null || appliedAt < attemptedAt)) || (item.rolled_back_at !== null && rolledBackAt === null)) {
          throw new Error(`application_log[${index}] has an invalid or non-causal timestamp.`);
        }
        if (item.target_occurrence_count !== null && (!Number.isInteger(item.target_occurrence_count) || item.target_occurrence_count < 0)) throw new Error(`application_log[${index}].target_occurrence_count is invalid.`);
        if (item.verification_status !== "Not Verified") throw new Error(`application_log[${index}].verification_status must remain Not Verified.`);
        if (["Applied", "Rolled Back"].includes(item.application_result) !== Boolean(item.applied_at)) throw new Error(`application_log[${index}].applied_at is inconsistent with its result.`);
        if (["Applied", "Rolled Back"].includes(item.application_result) && item.applied_at !== item.attempted_at) throw new Error(`application_log[${index}] successful application or rollback must be one atomic timestamped event.`);
        if (item.effective_clause_id !== null && !effectiveIds.includes(item.effective_clause_id)) throw new Error(`application_log[${index}].effective_clause_id does not reference an Effective Clause.`);
        if (["Applied", "Rolled Back"].includes(item.application_result) && !effectiveIds.includes(item.effective_clause_id)) throw new Error(`application_log[${index}] must reference an Effective Clause for ${item.application_result}.`);
        if (item.effective_clause_id !== null) {
          const effective = effectiveById.get(item.effective_clause_id);
          const versionIds = effective.version_history.map((version) => version.version_id);
          if (attemptedAt < pcTimestampMillis(effective.created_at)) throw new Error(`application_log[${index}].attempted_at predates its Effective Clause creation.`);
          if (!versionIds.includes(item.input_version)) throw new Error(`application_log[${index}].input_version is outside its Effective Clause chain.`);
          if (["Applied", "Rolled Back"].includes(item.application_result) && !versionIds.includes(item.output_version)) throw new Error(`application_log[${index}].output_version is outside its Effective Clause chain.`);
          if ((item.target_clause_id ?? null) !== (effective.baseline_clause_id ?? null)
            || String(item.target_clause_number ?? "") !== effective.clause_number) {
            throw new Error(`application_log[${index}] immutable target snapshot differs from its Effective Clause.`);
          }
        }
        if (item.application_result === "Applied") {
          if (!PC_SUPPORTED_OPERATIONS.includes(item.operation) || !PC_TARGET_BASES.includes(item.target_basis) || item.target_basis === "Unclear" || !Number.isInteger(Number(item.sequence_number)) || Number(item.sequence_number) < 1) {
            throw new Error(`application_log[${index}] has an invalid immutable operation, basis or sequence snapshot.`);
          }
        }
        return item.application_id;
      });
      if (new Set(applicationIds).size !== applicationIds.length) throw new Error("application_id values must be unique.");
      const applicationsById = new Map(data.application_log.map((item) => [item.application_id, item]));
      data.application_log.forEach((item, index) => {
        if (index && pcTimestampMillis(item.attempted_at) < pcTimestampMillis(data.application_log[index - 1].attempted_at)) {
          throw new Error(`application_log[${index}].attempted_at is earlier than the preceding audit record.`);
        }
      });
      const pcStableAuditValue = (value) => {
        if (Array.isArray(value)) return value.map(pcStableAuditValue);
        if (!value || typeof value !== "object") return value;
        return Object.keys(value).sort().reduce((result, key) => {
          if (value[key] !== undefined) result[key] = pcStableAuditValue(value[key]);
          return result;
        }, {});
      };
      const pcAuditValuesEqual = (left, right) => JSON.stringify(pcStableAuditValue(left)) === JSON.stringify(pcStableAuditValue(right));
      const pcEffectiveSnapshotsAt = (cutoffMillis, excludedApplicationId = null) => data.effective_clauses.flatMap((record) => {
        const version = record.version_history
          .filter((candidate) => pcTimestampMillis(candidate.created_at) <= cutoffMillis
            && candidate.created_by_application_id !== excludedApplicationId)
          .at(-1) || null;
        if (!version || pcTimestampMillis(record.created_at) > cutoffMillis) return [];
        return [{
          ...record,
          current_effective_text: version.text,
          current_version_id: version.version_id,
          current_version_number: version.version_number,
          applied_amendment_ids: [...version.active_amendment_ids],
          structured_change_segments: [...version.structured_change_segments]
        }];
      });
      const pcApplicationStatusAt = (candidate, cutoffMillis) => {
        const logs = data.application_log.filter((log) => log.amendment_id === candidate.amendment_id
          && pcTimestampMillis(log.attempted_at) <= cutoffMillis);
        const activeApplied = logs.filter((log) => log.application_result === "Applied"
          && pcTimestampMillis(log.applied_at) <= cutoffMillis
          && (log.rolled_back_at === null || pcTimestampMillis(log.rolled_back_at) > cutoffMillis)).at(-1) || null;
        if (activeApplied) return "Applied";
        const latest = logs.at(-1) || null;
        if (["Previewed", "Failed", "Rejected", "Rolled Back"].includes(latest?.application_result)) return latest.application_result;
        return ["Defined-term Amendment", "Global Amendment"].includes(candidate.amendment_category)
          ? "Identified – Deferred"
          : "Not Assessed";
      };
      const pcAmendmentSnapshotsAt = (cutoffMillis) => data.amendments.map((candidate) => ({
        ...candidate,
        application_status: pcApplicationStatusAt(candidate, cutoffMillis)
      }));
      const pcDecisionAt = (amendmentId, cutoffMillis) => {
        let activeDecision = null;
        data.alignment_decisions.forEach((decision) => {
          if (decision.amendment_id !== amendmentId || pcTimestampMillis(decision.decided_at) > cutoffMillis) return;
          activeDecision = decision.action === "Clear Manual Decision" ? null : decision;
        });
        return activeDecision;
      };
      const pcAssessmentOperands = (assessment, entry) => {
        const asserted = assessment.asserted_target || {};
        return {
          ...entry,
          parent_clause: asserted.parent_clause ?? null,
          target_gc_clause_id: entry.target_gc_clause_id ?? null,
          target_gc_clause_number: asserted.target_gc_clause_number ?? null,
          target_gc_heading: asserted.target_gc_heading ?? null,
          target_text: asserted.target_text ?? null,
          amendment_operation: assessment.amendment_operation,
          target_basis: assessment.target_basis,
          target_location: assessment.target_location ?? null,
          replacement_or_added_text: assessment.replacement_or_added_text ?? null,
          sequence_number: assessment.sequence_number,
          global_dependency_ids: [...entry.global_dependency_ids]
        };
      };
      const pcComputeAssessmentAt = (assessment, entry, cutoffMillis = pcTimestampMillis(assessment.assessed_at), excludedApplicationId = null) => {
        const operands = pcAssessmentOperands(assessment, entry);
        const effectiveSnapshots = pcEffectiveSnapshotsAt(cutoffMillis, excludedApplicationId);
        const amendmentSnapshots = pcAmendmentSnapshotsAt(cutoffMillis).map((candidate) => candidate.amendment_id === entry.amendment_id
          ? { ...candidate, ...operands }
          : candidate);
        const result = PCAlignmentEngine.alignAmendment(operands, fidicSourceLayer, data.project, amendmentSnapshots, effectiveSnapshots);
        const withoutDependencies = operands.global_dependency_ids.length
          ? PCAlignmentEngine.alignAmendment({ ...operands, global_dependency_ids: [] }, fidicSourceLayer, data.project, amendmentSnapshots, effectiveSnapshots)
          : result;
        const proposedTarget = result.proposed_target_gc_clause_id ? result : withoutDependencies;
        return {
          operands,
          result,
          underlying: withoutDependencies,
          proposedTarget,
          expectedConflicts: [...new Set([...(withoutDependencies.conflicts || []), ...(result.conflicts || [])])],
          expectedEvidence: {
            fidic_form_match: data.project.fidic_form === "Red Book",
            fidic_edition_match: data.project.fidic_edition === "2017",
            operation_supported: PC_SUPPORTED_OPERATIONS.includes(operands.amendment_operation),
            sequence_known: Number.isInteger(Number(operands.sequence_number)) && Number(operands.sequence_number) > 0,
            target_basis: operands.target_basis || "Unclear",
            ...withoutDependencies.match_evidence,
            effective_status_evidence: result.match_evidence
          },
          effectiveSnapshots,
          amendmentSnapshots
        };
      };
      const pcValidateDeterministicAssessment = (assessment, entry, label) => {
        if (!assessment || !entry) throw new Error(`${label} cannot be deterministically evaluated.`);
        if (assessment.baseline_id !== data.project.baseline_id) throw new Error(`${label}.baseline_id differs from the controlled project baseline.`);
        if (!Array.isArray(assessment.blocking_dependency_ids)
          || !pcAuditValuesEqual(assessment.blocking_dependency_ids, entry.global_dependency_ids)) {
          throw new Error(`${label}.blocking_dependency_ids differs from the immutable amendment dependency snapshot.`);
        }
        if (!assessment.asserted_target || typeof assessment.asserted_target !== "object" || Array.isArray(assessment.asserted_target)
          || !assessment.proposed_target || typeof assessment.proposed_target !== "object" || Array.isArray(assessment.proposed_target)
          || !assessment.evidence || typeof assessment.evidence !== "object" || Array.isArray(assessment.evidence)
          || !Array.isArray(assessment.conflicts)) {
          throw new Error(`${label} is missing deterministic alignment evidence.`);
        }
        const computed = pcComputeAssessmentAt(assessment, entry);
        const proposedTarget = {
          clause_id: computed.proposedTarget.proposed_target_gc_clause_id || null,
          clause_number: computed.proposedTarget.proposed_target_gc_clause_number || null,
          clause_heading: computed.proposedTarget.proposed_target_gc_heading || null
        };
        if (assessment.machine_status !== computed.result.machine_alignment_status
          || assessment.underlying_match_status !== computed.underlying.machine_alignment_status
          || assessment.reason !== computed.result.machine_alignment_reason
          || (assessment.blocking_issue ?? null) !== (computed.result.blocking_issue ?? null)
          || !pcAuditValuesEqual(assessment.proposed_target, proposedTarget)
          || !pcAuditValuesEqual(assessment.conflicts, computed.expectedConflicts)
          || !pcAuditValuesEqual(assessment.evidence, computed.expectedEvidence)) {
          throw new Error(`${label} does not equal deterministic alignment against the controlled baseline and Effective Clause version at assessed_at.`);
        }
        return computed;
      };
      const pcPreviewSegmentsMatch = (actual, expected, applicationId, amendmentId, versionNumber) => Array.isArray(actual)
        && actual.length === expected.length
        && actual.every((segment, index) => segment.order === index
          && segment.segment_type === expected[index].segment_type
          && segment.text === expected[index].text
          && (segment.original_text ?? null) === (expected[index].original_text ?? null)
          && segment.source_application_id === applicationId
          && segment.source_amendment_id === amendmentId
          && segment.version_number === versionNumber);
      const pcHistoricalSequenceGate = (entry, operands, cutoffMillis) => {
        const canonicalId = operands.target_gc_clause_id || null;
        const canonicalNumber = operands.target_gc_clause_number || null;
        const candidateTargetAt = (candidate) => {
          const historicalAssessment = data.alignment_assessments
            .filter((assessment) => assessment.amendment_id === candidate.amendment_id
              && pcTimestampMillis(assessment.assessed_at) <= cutoffMillis)
            .at(-1) || null;
          return {
            clauseId: historicalAssessment?.proposed_target?.clause_id || candidate.target_gc_clause_id || null,
            clauseNumber: historicalAssessment?.proposed_target?.clause_number || candidate.target_gc_clause_number || null
          };
        };
        const isSameTarget = (candidate) => {
          const historicalTarget = candidateTargetAt(candidate);
          return canonicalId
            ? historicalTarget.clauseId === canonicalId
            : canonicalNumber && String(historicalTarget.clauseNumber || "") === String(canonicalNumber);
        };
        const earlierPending = data.amendments.some((candidate) => candidate.amendment_id !== entry.amendment_id
          && Number.isInteger(Number(candidate.sequence_number))
          && isSameTarget(candidate)
          && Number(candidate.sequence_number) < Number(operands.sequence_number)
          && ["Clause-specific Amendment", "New Clause"].includes(candidate.amendment_category)
          && !["Applied", "Rolled Back"].includes(pcApplicationStatusAt(candidate, cutoffMillis))
          && pcDecisionAt(candidate.amendment_id, cutoffMillis)?.action !== "Reject Alignment");
        const laterActive = data.amendments.some((candidate) => candidate.amendment_id !== entry.amendment_id
          && isSameTarget(candidate)
          && Number(candidate.sequence_number) > Number(operands.sequence_number)
          && pcApplicationStatusAt(candidate, cutoffMillis) === "Applied");
        const sameSequence = data.amendments.some((candidate) => candidate.amendment_id !== entry.amendment_id
          && isSameTarget(candidate)
          && Number(candidate.sequence_number) === Number(operands.sequence_number));
        return { ok: !earlierPending && !laterActive && !sameSequence, earlierPending, laterActive, sameSequence };
      };
      data.effective_clauses.forEach((record, index) => {
        const committedApplications = data.application_log.filter((log) => log.effective_clause_id === record.effective_clause_id
          && log.application_result === "Applied");
        if (record.version_history.length === 1 || !committedApplications.length) {
          throw new Error(`effective_clauses[${index}] is orphaned because it has no successful committed application beyond its initial version.`);
        }
      });
      const applicationIndexById = new Map(data.application_log.map((item, index) => [item.application_id, index]));
      const causalStateByEffective = new Map(data.effective_clauses.map((record) => [record.effective_clause_id, {
        currentVersionId: record.version_history[0].version_id,
        currentVersionCreatedAt: pcTimestampMillis(record.version_history[0].created_at),
        activeApplicationIds: new Set(),
        failedAmendmentIds: new Set()
      }]));
      const causalActiveApplicationByAmendment = new Map();
      const successfulRollbackByOriginal = new Map();
      data.application_log.forEach((item, index) => {
        if (item.reverses_application_id) {
          const reversed = applicationsById.get(item.reverses_application_id);
          if (!reversed || reversed.application_result !== "Applied" || item.attempt_type !== "Rollback") throw new Error(`application_log[${index}].reverses_application_id is invalid.`);
          if (applicationIndexById.get(item.reverses_application_id) >= index) throw new Error(`application_log[${index}] Rollback attempt must follow the Applied record it addresses.`);
          const snapshotFields = ["amendment_id", "effective_clause_id", "operation", "amendment_category", "target_basis", "target_clause_id", "target_clause_number", "target_text", "replacement_or_added_text", "target_location", "sequence_number"];
          if (snapshotFields.some((field) => (item[field] ?? null) !== (reversed[field] ?? null))) {
            throw new Error(`application_log[${index}] Rollback audit snapshot differs from the reversed Applied log.`);
          }
          if (pcTimestampMillis(item.attempted_at) < pcTimestampMillis(reversed.applied_at)) {
            throw new Error(`application_log[${index}] Rollback attempt predates the Applied record it addresses.`);
          }
        } else if (item.attempt_type === "Rollback") {
          throw new Error(`application_log[${index}] rollback attempt must identify the Applied record it addresses.`);
        }
        const activeApplicationIdForAmendment = causalActiveApplicationByAmendment.get(item.amendment_id) || null;
        if (activeApplicationIdForAmendment && ["Apply", "Preview"].includes(item.attempt_type)) {
          const activeApplication = applicationsById.get(activeApplicationIdForAmendment);
          if (item.application_result !== "Failed"
            || item.effective_clause_id !== activeApplication.effective_clause_id) {
            throw new Error(`application_log[${index}] cannot record a successful or detached ${item.attempt_type} while the same amendment is active.`);
          }
        }
        if (item.effective_clause_id !== null) {
          const causalState = causalStateByEffective.get(item.effective_clause_id);
          if (pcTimestampMillis(item.attempted_at) < causalState.currentVersionCreatedAt) {
            throw new Error(`application_log[${index}] attempts to use an Effective Clause version before that version was created.`);
          }
          if (item.input_version !== causalState.currentVersionId) {
            throw new Error(`application_log[${index}].input_version is not the Effective Clause version current at the time of the attempt.`);
          }
          const sameAmendmentWasActive = [...causalState.activeApplicationIds]
            .some((applicationId) => applicationsById.get(applicationId)?.amendment_id === item.amendment_id);
          if (sameAmendmentWasActive && ["Apply", "Preview"].includes(item.attempt_type) && item.application_result !== "Failed") {
            throw new Error(`application_log[${index}] cannot record a successful ${item.attempt_type} while the same amendment is already active.`);
          }
          if (item.attempt_type === "Rollback" && !causalState.activeApplicationIds.has(item.reverses_application_id)) {
            throw new Error(`application_log[${index}] Rollback attempt does not address an application active at that point in the audit trail.`);
          }
          if (item.attempt_type === "Apply" && item.application_result === "Failed" && !sameAmendmentWasActive) {
            causalState.failedAmendmentIds.add(item.amendment_id);
          }
          if (item.application_result === "Applied") {
            causalState.failedAmendmentIds.delete(item.amendment_id);
            causalState.activeApplicationIds.add(item.application_id);
            causalState.currentVersionId = item.output_version;
            causalState.currentVersionCreatedAt = pcTimestampMillis(item.applied_at);
          } else if (item.application_result === "Rolled Back") {
            causalState.activeApplicationIds.delete(item.reverses_application_id);
            causalState.currentVersionId = item.output_version;
            causalState.currentVersionCreatedAt = pcTimestampMillis(item.applied_at);
          }
        }
        if (item.application_result === "Rejected") {
          causalStateByEffective.forEach((causalState) => causalState.failedAmendmentIds.delete(item.amendment_id));
        }
        if (item.application_result === "Applied") causalActiveApplicationByAmendment.set(item.amendment_id, item.application_id);
        if (item.application_result === "Rolled Back") causalActiveApplicationByAmendment.delete(item.amendment_id);
        if (item.application_result === "Applied") {
          const wasRolledBack = item.rolled_back_at !== null;
          if ((wasRolledBack && item.rollback_available !== false) || (!wasRolledBack && item.rollback_available !== true)) {
            throw new Error(`application_log[${index}] has an inconsistent Applied rollback state.`);
          }
        } else if (item.rollback_available !== false) {
          throw new Error(`application_log[${index}] cannot be rollback-available unless it is an active Applied log.`);
        }
        if (item.attempt_type === "Rollback" && item.application_result === "Failed"
          && (item.output_version !== null || item.output_text !== null || item.change_segments.length)) {
          throw new Error(`application_log[${index}] failed Rollback must not claim an output version, output text or change segments.`);
        }
        if (item.application_result === "Rolled Back") {
          if (!item.reverses_application_id || item.rolled_back_at !== null) throw new Error(`application_log[${index}] has an invalid Rolled Back audit state.`);
          if (successfulRollbackByOriginal.has(item.reverses_application_id)) throw new Error(`application_log[${index}] duplicates a successful rollback for ${item.reverses_application_id}.`);
          successfulRollbackByOriginal.set(item.reverses_application_id, item);
        }
        if (item.application_result !== "Applied" && item.rolled_back_at !== null) throw new Error(`application_log[${index}] cannot itself be marked as rolled back.`);
      });
      data.effective_clauses.forEach((record, index) => {
        if (causalStateByEffective.get(record.effective_clause_id).currentVersionId !== record.current_version_id) {
          throw new Error(`effective_clauses[${index}] current version is inconsistent with the chronological application audit trail.`);
        }
      });
      data.application_log.forEach((item, index) => {
        if (item.application_result !== "Applied") return;
        const rollback = successfulRollbackByOriginal.get(item.application_id) || null;
        if (item.rolled_back_at !== null) {
          if (!rollback || item.rolled_back_at !== rollback.applied_at
            || rollback.effective_clause_id !== item.effective_clause_id
            || rollback.amendment_id !== item.amendment_id
            || pcTimestampMillis(rollback.applied_at) < pcTimestampMillis(item.applied_at)) {
            throw new Error(`application_log[${index}] is not paired with exactly one matching successful rollback.`);
          }
        } else if (rollback) {
          throw new Error(`application_log[${index}] has a successful rollback but remains marked active.`);
        }
      });
      data.effective_clauses.forEach((record, index) => {
        const historicalActiveLogs = new Map();
        record.version_history.slice(1).forEach((version, versionIndex) => {
          const creatingLog = applicationsById.get(version.created_by_application_id);
          if (!creatingLog || !["Applied", "Rolled Back"].includes(creatingLog.application_result)
            || creatingLog.effective_clause_id !== record.effective_clause_id
            || creatingLog.input_version !== version.parent_version_id
            || creatingLog.output_version !== version.version_id
            || creatingLog.output_text !== version.text
            || creatingLog.applied_at !== version.created_at) {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] is not bound to one matching application log.`);
          }
          const expectedVersionEvent = creatingLog.application_result === "Rolled Back"
            ? "Rollback"
            : (creatingLog.operation === "Add New Sub-Clause" ? "New Clause Created" : (creatingLog.operation === "Delete Entire Sub-Clause" ? "Tombstone" : "Applied"));
          if (version.version_event !== expectedVersionEvent) throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] version_event is inconsistent with its creating application.`);
          if (creatingLog.application_result === "Applied") {
            const incomingSequence = Number(creatingLog.sequence_number);
            if ([...historicalActiveLogs.values()].some((activeLog) => Number(activeLog.sequence_number) >= incomingSequence)) {
              throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] applies an amendment earlier than an already-active sequence.`);
            }
            historicalActiveLogs.set(creatingLog.application_id, creatingLog);
          } else {
            if (!historicalActiveLogs.has(creatingLog.reverses_application_id)) {
              throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] rolls back an application that was not active in the preceding version.`);
            }
            historicalActiveLogs.delete(creatingLog.reverses_application_id);
          }
          const historicalReplay = pcReplayAppliedSnapshots(record, [...historicalActiveLogs.values()]);
          if (!historicalReplay.ok || historicalReplay.currentText !== version.text || creatingLog.output_text !== version.text) {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] cannot be reproduced from its immutable application history.`);
          }
          if (JSON.stringify([...historicalReplay.appliedIds].sort()) !== JSON.stringify([...version.active_amendment_ids].sort())) {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] has an incorrect active amendment snapshot.`);
          }
          const inputVersion = record.version_history[versionIndex];
          const logSegments = creatingLog.change_segments || [];
          if ((logSegments.length && (pcReconstructSegmentSide(logSegments, "before") !== inputVersion.text || pcReconstructSegmentSide(logSegments, "after") !== version.text))
            || (!logSegments.length && inputVersion.text !== version.text)) {
            throw new Error(`application_log ${creatingLog.application_id} change segments do not reconstruct its input and output versions.`);
          }
          if (logSegments.some((segment, segmentIndex) => segment.order !== segmentIndex
            || segment.source_application_id !== creatingLog.application_id
            || segment.source_amendment_id !== creatingLog.amendment_id
            || segment.version_number !== version.version_number)) {
            throw new Error(`application_log ${creatingLog.application_id} change segment provenance is invalid.`);
          }
          const versionSegments = version.structured_change_segments;
          pcValidateChangeSegments(logSegments, `application_log ${creatingLog.application_id} change_segments`, {
            sourceApplicationId: creatingLog.application_id,
            sourceAmendmentId: creatingLog.amendment_id,
            versionNumber: version.version_number
          });
          if ((versionSegments.length && (pcReconstructSegmentSide(versionSegments, "before") !== inputVersion.text || pcReconstructSegmentSide(versionSegments, "after") !== version.text))
            || (!versionSegments.length && inputVersion.text !== version.text)) {
            throw new Error(`effective_clauses[${index}].version_history[${versionIndex + 1}] change segments do not reconstruct its parent and output text.`);
          }
          pcValidateChangeSegments(versionSegments, `effective_clauses[${index}].version_history[${versionIndex + 1}].structured_change_segments`, {
            sourceApplicationId: creatingLog.application_id,
            sourceAmendmentId: creatingLog.amendment_id,
            versionNumber: version.version_number
          });
        });
        data.application_log.filter((log) => log.effective_clause_id === record.effective_clause_id && ["Applied", "Rolled Back"].includes(log.application_result)).forEach((log) => {
          const outputVersion = record.version_history.find((version) => version.version_id === log.output_version);
          if (!outputVersion || outputVersion.created_by_application_id !== log.application_id || outputVersion.parent_version_id !== log.input_version) {
            throw new Error(`application_log ${log.application_id} is not the unique creator of its declared output version.`);
          }
        });
        const replay = pcReplayImmutableLogs(record, data.application_log);
        if (!replay.ok) throw new Error(`effective_clauses[${index}] failed immutable application replay: ${replay.reason}`);
        if (replay.currentText !== record.current_effective_text) throw new Error(`effective_clauses[${index}].current_effective_text does not equal deterministic replay of active Applied logs.`);
        if (JSON.stringify([...replay.appliedIds].sort()) !== JSON.stringify([...(record.applied_amendment_ids || [])].sort())) {
          throw new Error(`effective_clauses[${index}].applied_amendment_ids does not equal deterministic replay state.`);
        }
        const segments = record.structured_change_segments || [];
        pcValidateChangeSegments(segments, `effective_clauses[${index}].structured_change_segments`, { versionNumber: record.current_version_number });
        const currentVersion = record.version_history.at(-1);
        segments.forEach((segment, segmentIndex) => {
          const sourceApplication = applicationsById.get(segment.source_application_id);
          if (!sourceApplication || sourceApplication.effective_clause_id !== record.effective_clause_id
            || sourceApplication.amendment_id !== segment.source_amendment_id
            || segment.source_application_id !== currentVersion.created_by_application_id) {
            throw new Error(`effective_clauses[${index}].structured_change_segments[${segmentIndex}] has invalid application provenance.`);
          }
        });
        if (segments.length) {
          if (pcReconstructSegmentSide(segments, "before") !== (record.baseline_text ?? "") || pcReconstructSegmentSide(segments, "after") !== record.current_effective_text) {
            throw new Error(`effective_clauses[${index}] structured change segments do not reconstruct baseline and current text.`);
          }
        } else if ((record.baseline_text ?? "") !== record.current_effective_text) {
          throw new Error(`effective_clauses[${index}] changed text requires reconstructable structured change segments.`);
        }
        const entryTargetsRecord = (entry) => {
          const canonicalId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id || null;
          const canonicalNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number || null;
          if (canonicalId) return canonicalId === record.baseline_clause_id;
          return canonicalNumber !== null && canonicalNumber !== undefined && String(canonicalNumber) === record.clause_number;
        };
        const recordEntries = data.amendments.filter((entry) => ["Clause-specific Amendment", "New Clause"].includes(entry.amendment_category)
          && entryTargetsRecord(entry));
        const linkedEntryMismatch = (record.amendment_ids || []).find((amendmentId) => {
          const linkedEntry = data.amendments.find((entry) => entry.amendment_id === amendmentId);
          const hasActiveLink = data.application_log.some((log) => log.amendment_id === amendmentId
            && log.effective_clause_id === record.effective_clause_id
            && log.application_result === "Applied"
            && !log.rolled_back_at);
          return linkedEntry && hasActiveLink && !entryTargetsRecord(linkedEntry);
        });
        if (linkedEntryMismatch) throw new Error(`effective_clauses[${index}].amendment_ids links an amendment whose canonical target is a different clause.`);
        const activeAmendmentIds = new Set(replay.appliedIds);
        const hasPending = recordEntries.some((entry) => ["Clause-specific Amendment", "New Clause"].includes(entry.amendment_category)
          && !activeAmendmentIds.has(entry.amendment_id)
          && entry.application_status !== "Rejected");
        const activeSequences = replay.activeLogs.map((log) => Number(log.sequence_number));
        const firstActiveSequence = activeSequences.length ? Math.min(...activeSequences) : null;
        if (firstActiveSequence !== null && recordEntries.some((entry) => !activeAmendmentIds.has(entry.amendment_id)
          && !["Rejected", "Rolled Back"].includes(entry.application_status)
          && Number.isInteger(Number(entry.sequence_number))
          && Number(entry.sequence_number) < firstActiveSequence)) {
          throw new Error(`effective_clauses[${index}] has an active application while an earlier linked sequence remains unresolved.`);
        }
        const expectedFailedAmendmentIds = [...causalStateByEffective.get(record.effective_clause_id).failedAmendmentIds];
        if (JSON.stringify([...(record.failed_amendment_ids || [])].sort()) !== JSON.stringify(expectedFailedAmendmentIds.sort())) {
          throw new Error(`effective_clauses[${index}].failed_amendment_ids does not equal the unresolved latest failed Apply state.`);
        }
        const expectedTombstone = replay.finalStatus === "Deleted" || (!record.baseline_clause_id && !replay.activeLogs.length);
        if (record.is_tombstone !== expectedTombstone) throw new Error(`effective_clauses[${index}].is_tombstone is inconsistent with deterministic replay.`);
        const expectedClauseStatus = (record.failed_amendment_ids || []).length
          ? (replay.activeLogs.length ? "Partially Applied" : "Application Failed")
          : (!record.baseline_clause_id && !replay.activeLogs.length
            ? "Deleted"
            : (hasPending ? (replay.activeLogs.length ? "Partially Applied" : "Amendment Pending") : replay.finalStatus));
        if (record.clause_status !== expectedClauseStatus) throw new Error(`effective_clauses[${index}].clause_status is inconsistent with deterministic replay and pending/failed amendments.`);
      });
      data.amendments.forEach((entry, index) => {
        const activeAssessment = entry.active_alignment_assessment_id ? assessmentsById.get(entry.active_alignment_assessment_id) : null;
        if ((entry.active_alignment_assessment_id || null) !== (derivedActiveAssessmentByAmendment.get(entry.amendment_id) || null)) {
          throw new Error(`amendments[${index}].active_alignment_assessment_id does not equal the final assessment in its causal chain.`);
        }
        if (entry.active_alignment_assessment_id && (!activeAssessment || activeAssessment.amendment_id !== entry.amendment_id)) throw new Error(`amendments[${index}].active_alignment_assessment_id is invalid.`);
        if (activeAssessment && entry.machine_alignment_status !== activeAssessment.machine_status) throw new Error(`amendments[${index}].machine_alignment_status differs from its active assessment.`);
        if (!activeAssessment && entry.machine_alignment_status) throw new Error(`amendments[${index}] has a machine alignment status without an active assessment.`);
        if (activeAssessment) {
          const asserted = activeAssessment.asserted_target || {};
          if ((asserted.parent_clause ?? null) !== (entry.parent_clause ?? null)
            || (asserted.target_gc_clause_number ?? null) !== (entry.target_gc_clause_number ?? null)
            || (asserted.target_gc_heading ?? null) !== (entry.target_gc_heading ?? null)
            || (asserted.target_text ?? null) !== (entry.target_text ?? null)
            || activeAssessment.amendment_operation !== entry.amendment_operation
            || activeAssessment.target_basis !== entry.target_basis
            || (activeAssessment.target_location ?? null) !== (entry.target_location ?? null)
            || (activeAssessment.replacement_or_added_text ?? null) !== (entry.replacement_or_added_text ?? null)
            || Number(activeAssessment.sequence_number) !== Number(entry.sequence_number)
            || (activeAssessment.proposed_target?.clause_id ?? null) !== (entry.proposed_target_gc_clause_id ?? null)
            || String(activeAssessment.proposed_target?.clause_number ?? "") !== String(entry.proposed_target_gc_clause_number ?? "")
            || (activeAssessment.proposed_target?.clause_heading ?? null) !== (entry.proposed_target_gc_heading ?? null)) {
            throw new Error(`amendments[${index}] differs from its active immutable alignment assessment.`);
          }
          const deterministicActive = pcValidateDeterministicAssessment(activeAssessment, entry, `amendments[${index}] active alignment assessment`);
          if ((entry.machine_alignment_reason ?? null) !== (deterministicActive.result.machine_alignment_reason ?? null)
            || (entry.target_occurrence_count ?? null) !== (deterministicActive.result.target_occurrence_count ?? null)
            || (entry.blocking_issue ?? null) !== (deterministicActive.result.blocking_issue ?? null)
            || entry.alignment_evaluated_at !== activeAssessment.assessed_at
            || !pcAuditValuesEqual(entry.alignment_conflicts || [], deterministicActive.expectedConflicts)) {
            throw new Error(`amendments[${index}] derived alignment fields differ from its deterministic active assessment.`);
          }
        }
        const activeDecision = entry.active_alignment_decision_id ? decisionsById.get(entry.active_alignment_decision_id) : null;
        if ((entry.active_alignment_decision_id || null) !== (derivedActiveDecisionByAmendment.get(entry.amendment_id) || null)) {
          throw new Error(`amendments[${index}].active_alignment_decision_id does not equal the final causal decision state.`);
        }
        if (entry.active_alignment_decision_id && (!activeDecision || activeDecision.amendment_id !== entry.amendment_id || activeDecision.alignment_assessment_id !== entry.active_alignment_assessment_id)) {
          throw new Error(`amendments[${index}].active_alignment_decision_id is invalid.`);
        }
        if (activeDecision && entry.alignment_status !== activeDecision.new_alignment_status) throw new Error(`amendments[${index}].alignment_status differs from its active human decision.`);
        if (!activeDecision && activeAssessment && entry.alignment_status !== activeAssessment.machine_status) throw new Error(`amendments[${index}].alignment_status must equal the active machine result when no human decision is active.`);
        if (entry.alignment_status === "Human Confirmed" && activeDecision?.action !== "Confirm Alignment") throw new Error(`amendments[${index}] claims Human Confirmed without its active confirmation decision.`);
        if (entry.alignment_status === "Rejected" && activeDecision?.action !== "Reject Alignment") throw new Error(`amendments[${index}] claims Rejected without its active rejection decision.`);
        if (entry.effective_clause_id && !effectiveIds.includes(entry.effective_clause_id)) throw new Error(`amendments[${index}].effective_clause_id does not reference an Effective Clause.`);
        const activeAppliedLogs = data.application_log.filter((log) => log.amendment_id === entry.amendment_id && log.application_result === "Applied" && !log.rolled_back_at);
        const entryApplicationLogs = data.application_log.filter((log) => log.amendment_id === entry.amendment_id);
        const assessmentSupportsLog = (assessment, log) => {
          const asserted = assessment.asserted_target || {};
          return assessment.amendment_id === entry.amendment_id
            && assessment.amendment_operation === log.operation
            && assessment.target_basis === log.target_basis
            && (assessment.target_location ?? null) === (log.target_location ?? null)
            && (assessment.replacement_or_added_text ?? null) === (log.replacement_or_added_text ?? null)
            && Number(assessment.sequence_number) === Number(log.sequence_number)
            && (asserted.parent_clause ?? null) === (entry.parent_clause ?? null)
            && (asserted.target_gc_clause_number ?? null) === (entry.target_gc_clause_number ?? null)
            && (asserted.target_gc_heading ?? null) === (entry.target_gc_heading ?? null)
            && (asserted.target_text ?? null) === (log.target_text ?? null)
            && (assessment.proposed_target?.clause_id ?? null) === (log.target_clause_id ?? null)
            && String(assessment.proposed_target?.clause_number ?? "") === String(log.target_clause_number ?? "");
        };
        const assessmentAtAttemptByApplication = new Map();
        entryApplicationLogs.forEach((log) => {
          const assessmentAtAttempt = data.alignment_assessments
            .filter((assessment) => assessment.amendment_id === entry.amendment_id
              && pcTimestampMillis(assessment.assessed_at) <= pcTimestampMillis(log.attempted_at))
            .at(-1) || null;
          if (!assessmentAtAttempt || !assessmentSupportsLog(assessmentAtAttempt, log)) throw new Error(`amendments[${index}] application audit record ${log.application_id} is not supported by the assessment active at that attempt.`);
          assessmentAtAttemptByApplication.set(log.application_id, assessmentAtAttempt);
          if (["Applied", "Previewed"].includes(log.application_result)) {
            pcValidateDeterministicAssessment(assessmentAtAttempt, entry, `application_log ${log.application_id} supporting alignment assessment`);
            const attemptComputation = pcComputeAssessmentAt(assessmentAtAttempt, entry, pcTimestampMillis(log.attempted_at), log.application_id);
            const attemptTarget = attemptComputation.result.proposed_target_gc_clause_id
              ? attemptComputation.result
              : attemptComputation.underlying;
            if (assessmentAtAttempt.machine_status !== attemptComputation.result.machine_alignment_status
              || (assessmentAtAttempt.blocking_issue ?? null) !== (attemptComputation.result.blocking_issue ?? null)
              || (assessmentAtAttempt.proposed_target?.clause_id ?? null) !== (attemptTarget.proposed_target_gc_clause_id ?? null)
              || (assessmentAtAttempt.proposed_target?.clause_number ?? null) !== (attemptTarget.proposed_target_gc_clause_number ?? null)
              || (assessmentAtAttempt.proposed_target?.clause_heading ?? null) !== (attemptTarget.proposed_target_gc_heading ?? null)) {
              throw new Error(`application_log ${log.application_id} used an alignment assessment that was stale at attempted_at.`);
            }
          }
        });
        const latestApplicationLog = entryApplicationLogs.at(-1) || null;
        const entryDecisions = data.alignment_decisions.filter((decision) => decision.amendment_id === entry.amendment_id);
        const appliedIntervals = entryApplicationLogs
          .filter((log) => log.application_result === "Applied")
          .map((log) => ({
            start: pcTimestampMillis(log.applied_at),
            end: log.rolled_back_at === null ? Infinity : pcTimestampMillis(log.rolled_back_at)
          }));
        const fallsInsideActiveApplication = (timestamp) => appliedIntervals.some((interval) => timestamp >= interval.start && timestamp < interval.end);
        data.alignment_assessments
          .filter((assessment) => assessment.amendment_id === entry.amendment_id)
          .forEach((assessment) => {
            if (fallsInsideActiveApplication(pcTimestampMillis(assessment.assessed_at))) {
              throw new Error(`amendments[${index}] contains an alignment assessment recorded while its application was active.`);
            }
          });
        entryDecisions.forEach((decision) => {
          if (fallsInsideActiveApplication(pcTimestampMillis(decision.decided_at))) {
            throw new Error(`amendments[${index}] contains a manual alignment decision recorded while its application was active.`);
          }
        });
        entryApplicationLogs.filter((log) => log.application_result === "Previewed").forEach((log) => {
          const logTime = pcTimestampMillis(log.attempted_at);
          const assessmentAtPreview = assessmentAtAttemptByApplication.get(log.application_id) || null;
          const assessmentComputation = pcComputeAssessmentAt(assessmentAtPreview, entry, logTime, log.application_id);
          const historicalSnapshots = pcEffectiveSnapshotsAt(logTime, log.application_id);
          const targetSnapshots = historicalSnapshots.filter((record) => {
            const idMatches = log.target_clause_id === null || record.baseline_clause_id === log.target_clause_id;
            const numberMatches = log.target_clause_number === null || record.clause_number === String(log.target_clause_number);
            return idMatches && numberMatches;
          });
          if (targetSnapshots.length > 1) throw new Error(`application_log ${log.application_id} had an ambiguous Effective Clause target at attempted_at.`);
          let historicalRecord = targetSnapshots[0] || null;
          if (log.effective_clause_id !== null) {
            if (!historicalRecord || historicalRecord.effective_clause_id !== log.effective_clause_id) {
              throw new Error(`application_log ${log.application_id} does not reference the Effective Clause version that existed at attempted_at.`);
            }
          } else if (historicalRecord) {
            throw new Error(`application_log ${log.application_id} omits the Effective Clause that existed at attempted_at.`);
          }
          const isNewClause = log.amendment_category === "New Clause" || log.operation === "Add New Sub-Clause";
          if (!historicalRecord) {
            const controlledById = log.target_clause_id ? currentSourceGate.index.byId.get(log.target_clause_id) || null : null;
            const controlledByNumber = log.target_clause_number ? currentSourceGate.index.byNumber.get(String(log.target_clause_number)) || null : null;
            if (controlledById && controlledByNumber && controlledById.id !== controlledByNumber.id) {
              throw new Error(`application_log ${log.application_id} identifies conflicting controlled baseline records.`);
            }
            const controlled = controlledByNumber || controlledById;
            if (!isNewClause && !controlled) throw new Error(`application_log ${log.application_id} cannot reconstruct its preview input from the controlled baseline.`);
            const initialVersionId = controlled
              ? `baseline:${controlled.id}`
              : `new:${String(log.target_clause_number)}:pending`;
            historicalRecord = {
              effective_clause_id: null,
              baseline_clause_id: controlled?.id || null,
              clause_number: String(log.target_clause_number ?? controlled?.clause_no ?? ""),
              clause_heading: controlled?.clause_title || assessmentAtPreview.proposed_target?.clause_heading || null,
              parent_clause_number: controlled?.parent_clause_no || PCAlignmentEngine.parentNumber(assessmentComputation.operands.parent_clause || log.target_clause_number),
              baseline_text: controlled?.full_text ?? null,
              current_effective_text: controlled?.full_text || "",
              current_version_id: initialVersionId,
              current_version_number: 0,
              applied_amendment_ids: []
            };
          }
          if (log.input_version !== historicalRecord.current_version_id) {
            throw new Error(`application_log ${log.application_id}.input_version was not current at attempted_at.`);
          }
          const decisionAtPreview = pcDecisionAt(entry.amendment_id, logTime);
          const confirmedAtPreview = decisionAtPreview?.action === "Confirm Alignment"
            && decisionAtPreview.alignment_assessment_id === assessmentAtPreview.alignment_assessment_id;
          const alignmentStatusAtPreview = decisionAtPreview
            ? decisionAtPreview.new_alignment_status
            : assessmentAtPreview.machine_status;
          const controlledTarget = assessmentAtPreview.proposed_target?.clause_id
            ? currentSourceGate.index.byId.get(assessmentAtPreview.proposed_target.clause_id) || null
            : null;
          const resolvedOperands = {
            ...assessmentComputation.operands,
            alignment_status: alignmentStatusAtPreview,
            machine_alignment_status: assessmentAtPreview.machine_status,
            blocking_issue: assessmentComputation.result.blocking_issue || null,
            target_gc_clause_id: assessmentAtPreview.proposed_target?.clause_id || assessmentComputation.operands.target_gc_clause_id || null,
            target_gc_clause_number: assessmentAtPreview.proposed_target?.clause_number || assessmentComputation.operands.target_gc_clause_number || null,
            target_gc_heading: assessmentAtPreview.proposed_target?.clause_heading || assessmentComputation.operands.target_gc_heading || null,
            parent_clause: confirmedAtPreview && assessmentComputation.operands.parent_clause && controlledTarget
              ? controlledTarget.parent_clause_no
              : assessmentComputation.operands.parent_clause
          };
          const amendmentSnapshots = assessmentComputation.amendmentSnapshots.map((candidate) => candidate.amendment_id === entry.amendment_id
            ? { ...candidate, ...resolvedOperands }
            : {
              ...candidate,
              target_gc_clause_id: candidate.proposed_target_gc_clause_id || candidate.target_gc_clause_id || null,
              target_gc_clause_number: candidate.proposed_target_gc_clause_number || candidate.target_gc_clause_number || null,
              target_gc_heading: candidate.proposed_target_gc_heading || candidate.target_gc_heading || null
            });
          const eligibility = PCAlignmentEngine.getEligibility(resolvedOperands, fidicSourceLayer, historicalRecord.effective_clause_id ? historicalRecord : null, amendmentSnapshots);
          if (!eligibility.eligible
            || (assessmentAtPreview.machine_status !== "Exact Match" && !confirmedAtPreview)
            || assessmentComputation.result.machine_alignment_status === "Blocking Dependency"
            || assessmentComputation.result.blocking_issue
            || assessmentComputation.operands.global_dependency_ids.length) {
            throw new Error(`application_log ${log.application_id} was not historically eligible for Preview: ${eligibility.reasons.join(" ") || "alignment confirmation or dependency gate failed."}`);
          }
          if (!pcHistoricalSequenceGate(entry, resolvedOperands, logTime).ok) {
            throw new Error(`application_log ${log.application_id} violated the historical amendment sequence gate.`);
          }
          const operationResult = pcComputeOperation(resolvedOperands, historicalRecord);
          const outputVersionNumber = historicalRecord.current_version_number + 1;
          if (!operationResult.ok
            || log.output_version !== `preview-${outputVersionNumber}`
            || log.output_text !== operationResult.outputText
            || log.target_occurrence_count !== operationResult.occurrenceCount
            || log.failure_reason !== null
            || !pcPreviewSegmentsMatch(log.change_segments, operationResult.segments, log.application_id, log.amendment_id, outputVersionNumber)) {
            throw new Error(`application_log ${log.application_id} does not equal the deterministic, non-persistent preview result.`);
          }
          if (data.effective_clauses.some((record) => record.version_history.some((version) => version.version_id === log.output_version
            || version.created_by_application_id === log.application_id))) {
            throw new Error(`application_log ${log.application_id} illegally persisted its preview as an Effective Clause version.`);
          }
          if (log.applied_at !== null || log.rollback_available !== false || log.rolled_back_at !== null || log.reverses_application_id !== null) {
            throw new Error(`application_log ${log.application_id} has committed or rollback metadata on a non-persistent preview.`);
          }
        });
        const rejectLogs = entryApplicationLogs.filter((log) => log.attempt_type === "Reject" && log.application_result === "Rejected");
        const latestRejectLog = rejectLogs.at(-1) || null;
        const rejectDecisions = entryDecisions.filter((decision) => decision.action === "Reject Alignment");
        const activeRejectDecision = activeDecision?.action === "Reject Alignment" ? activeDecision : null;
        entryApplicationLogs.filter((log) => log.application_result === "Applied").forEach((log) => {
          const logTime = pcTimestampMillis(log.attempted_at);
          const assessmentAtApplication = data.alignment_assessments
            .filter((assessment) => assessment.amendment_id === entry.amendment_id && pcTimestampMillis(assessment.assessed_at) <= logTime)
            .at(-1) || null;
          if (!assessmentAtApplication || !assessmentSupportsLog(assessmentAtApplication, log)) throw new Error(`amendments[${index}] Applied audit record is not supported by the assessment active at application time.`);
          if (assessmentAtApplication.machine_status === "Blocking Dependency"
            || assessmentAtApplication.blocking_dependency_ids?.length
            || entry.global_dependency_ids?.length) {
            throw new Error(`amendments[${index}] Applied audit record was committed while a blocking dependency existed.`);
          }
          let decisionAtApplication = null;
          entryDecisions.forEach((decision) => {
            if (pcTimestampMillis(decision.decided_at) > logTime) return;
            decisionAtApplication = decision.action === "Clear Manual Decision" ? null : decision;
          });
          if (decisionAtApplication && (decisionAtApplication.action !== "Confirm Alignment"
            || decisionAtApplication.alignment_assessment_id !== assessmentAtApplication.alignment_assessment_id)) {
            throw new Error(`amendments[${index}] Applied audit record was committed while a non-confirmation human decision was active.`);
          }
          if (assessmentAtApplication.machine_status !== "Exact Match" && decisionAtApplication?.action !== "Confirm Alignment") {
            throw new Error(`amendments[${index}] Applied audit record required a preceding Human Confirmed decision for its assessment.`);
          }
          const applicationOperands = pcAssessmentOperands(assessmentAtApplication, entry);
          const resolvedApplicationOperands = {
            ...applicationOperands,
            target_gc_clause_id: assessmentAtApplication.proposed_target?.clause_id || applicationOperands.target_gc_clause_id || null,
            target_gc_clause_number: assessmentAtApplication.proposed_target?.clause_number || applicationOperands.target_gc_clause_number || null,
            target_gc_heading: assessmentAtApplication.proposed_target?.clause_heading || applicationOperands.target_gc_heading || null
          };
          if (!pcHistoricalSequenceGate(entry, resolvedApplicationOperands, logTime).ok) {
            throw new Error(`amendments[${index}] Applied audit record violated the historical amendment sequence gate.`);
          }
        });
        if (rejectLogs.length !== rejectDecisions.length) throw new Error(`amendments[${index}] must pair every Reject Alignment decision with exactly one Rejected application log.`);
        rejectLogs.forEach((log, rejectIndex) => {
          const rejectDecision = rejectDecisions[rejectIndex];
          const decisionPosition = entryDecisions.indexOf(rejectDecision);
          const nextDecision = decisionPosition >= 0 ? entryDecisions[decisionPosition + 1] : null;
          if (pcTimestampMillis(log.attempted_at) < pcTimestampMillis(rejectDecision.decided_at)) {
            throw new Error(`amendments[${index}] Rejected application log ${rejectIndex} predates its paired Reject Alignment decision.`);
          }
          if (nextDecision && pcTimestampMillis(log.attempted_at) > pcTimestampMillis(nextDecision.decided_at)) {
            throw new Error(`amendments[${index}] Rejected application log ${rejectIndex} was recorded after a later alignment decision.`);
          }
        });
        if (activeRejectDecision && (!latestRejectLog
          || pcTimestampMillis(latestRejectLog.attempted_at) < pcTimestampMillis(activeRejectDecision.decided_at))) {
          throw new Error(`amendments[${index}] has an active Reject Alignment decision without its matching causal Rejected application log.`);
        }
        if (activeAppliedLogs.length > 1) throw new Error(`amendments[${index}] cannot have more than one active Applied log.`);
        if (activeAppliedLogs.some((log) => log.effective_clause_id !== entry.effective_clause_id)) throw new Error(`amendments[${index}] has an active Applied log linked to a different Effective Clause.`);
        if (activeAppliedLogs.length && !["Exact Match", "Human Confirmed"].includes(entry.alignment_status)) {
          throw new Error(`amendments[${index}] has an active Applied log without an application-eligible Exact Match or Human Confirmed alignment.`);
        }
        if (activeAppliedLogs.length && (!activeAssessment
          || activeAppliedLogs.some((log) => pcTimestampMillis(log.attempted_at) < pcTimestampMillis(activeAssessment.assessed_at)))) {
          throw new Error(`amendments[${index}] active alignment assessment must exist and precede its Applied audit record.`);
        }
        if (activeAppliedLogs.length && activeDecision && activeDecision.action !== "Confirm Alignment") {
          throw new Error(`amendments[${index}] cannot combine an active Applied log with a non-confirmation human decision.`);
        }
        if (activeAppliedLogs.length && activeDecision?.action === "Confirm Alignment"
          && activeAppliedLogs.some((log) => pcTimestampMillis(log.attempted_at) < pcTimestampMillis(activeDecision.decided_at))) {
          throw new Error(`amendments[${index}] active Human Confirmed decision must precede its Applied audit record.`);
        }
        if (activeAppliedLogs.length && (activeAssessment?.machine_status === "Blocking Dependency"
          || activeAssessment?.blocking_dependency_ids?.length
          || entry.global_dependency_ids?.length
          || entry.blocking_issue)) {
          throw new Error(`amendments[${index}] cannot have an active Applied log while a blocking dependency remains.`);
        }
        let expectedApplicationStatus = "Not Assessed";
        if (activeAppliedLogs.length) expectedApplicationStatus = "Applied";
        else if (activeRejectDecision) expectedApplicationStatus = "Rejected";
        else if (["Defined-term Amendment", "Global Amendment"].includes(entry.amendment_category)) expectedApplicationStatus = "Identified – Deferred";
        else if (entry.machine_alignment_status === "Blocking Dependency") expectedApplicationStatus = "Blocking Dependency";
        else if (!PC_SUPPORTED_OPERATIONS.includes(entry.amendment_operation)) expectedApplicationStatus = "Not Yet Supported / Human Review Required";
        else if (["Previewed", "Failed", "Rolled Back"].includes(latestApplicationLog?.application_result)) expectedApplicationStatus = latestApplicationLog.application_result;
        if (entry.application_status !== expectedApplicationStatus) {
          throw new Error(`amendments[${index}].application_status is inconsistent with the causally latest application/decision state.`);
        }
        if (entry.effective_clause_id) {
          const effective = effectiveById.get(entry.effective_clause_id);
          const canonicalId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id || null;
          const canonicalNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number || null;
          if (activeAppliedLogs.length && ((canonicalId && effective.baseline_clause_id !== canonicalId) || (canonicalNumber && effective.clause_number !== String(canonicalNumber)))) {
            throw new Error(`amendments[${index}].effective_clause_id points to a different canonical target.`);
          }
          if (!effective.amendment_ids.includes(entry.amendment_id)) throw new Error(`amendments[${index}] is not linked back from its Effective Clause.`);
          if (entry.application_status === "Applied" && !effective.applied_amendment_ids.includes(entry.amendment_id)) throw new Error(`amendments[${index}] is missing from its Effective Clause applied list.`);
        }
        if (["Defined-term Amendment", "Global Amendment", "Contract Data"].includes(entry.amendment_category)) {
          const illegalAppliedLog = data.application_log.some((log) => log.amendment_id === entry.amendment_id && log.application_result === "Applied");
          if (illegalAppliedLog || data.effective_clauses.some((effective) => effective.applied_amendment_ids.includes(entry.amendment_id))) {
            throw new Error(`amendments[${index}] is deferred and cannot have an Applied application or Effective Clause state in Task 3.`);
          }
        }
        entryApplicationLogs.forEach((log) => {
          if (log.operation !== entry.amendment_operation
            || log.amendment_category !== entry.amendment_category
            || log.target_basis !== entry.target_basis
            || (log.target_text ?? null) !== (entry.target_text ?? null)
            || (log.replacement_or_added_text ?? null) !== (entry.replacement_or_added_text ?? null)
            || (log.target_location ?? null) !== (entry.target_location ?? null)
            || Number(log.sequence_number) !== Number(entry.sequence_number)) {
            throw new Error(`amendments[${index}] differs from its immutable application audit snapshot.`);
          }
        });
      });
      const historyIdSet = new Set(historyIds);
      data.alignment_decisions.forEach((decision, index) => {
        if (decision.processing_history_event_id && !historyIdSet.has(decision.processing_history_event_id)) throw new Error(`alignment_decisions[${index}] references a missing processing history event.`);
      });
      const idLists = [
        [data.project.alignment_assessment_ids, assessmentIds, "project.alignment_assessment_ids"],
        [data.project.alignment_decision_ids, decisionIds, "project.alignment_decision_ids"],
        [data.project.effective_clause_ids, effectiveIds, "project.effective_clause_ids"],
        [data.project.application_ids, applicationIds, "project.application_ids"]
      ];
      idLists.forEach(([actual, expected, label]) => {
        if (!Array.isArray(actual) || JSON.stringify([...actual].sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label} must match its records exactly.`);
      });
    }
    return {
      kind: "review-project",
      label: "Complete exported PC Review Project",
      sourceCount: data.source_documents.length,
      amendmentCount: data.amendments.length,
      projectName: data.project.project_name,
      needsUpgrade: isLegacy,
      warnings: [
        ...(isLegacy ? [`${PC_REVIEW_LEGACY_SCHEMA_VERSION} will be upgraded in memory to ${PC_REVIEW_SCHEMA_VERSION}.`] : []),
        ...pcUnknownKeys(data, ["schema_version", "document_type", "export_timestamp", "project", "source_documents", "amendments", "alignment_assessments", "alignment_decisions", "effective_clauses", "application_log", "processing_history"]).map((key) => `Unrecognised top-level field preserved: ${key}`)
      ]
    };
  }
  if (data.schema_version === PC_STRUCTURED_INPUT_SCHEMA_VERSION && data.document_type === "pc_structured_amendment_input") {
    pcRequireOwnFields(data, ["schema_version", "document_type", "source_document", "amendments"], "$" );
    if (!data.source_document || typeof data.source_document !== "object") throw new Error("source_document object is required.");
    pcRequireOwnFields(data.source_document, ["file_name", "file_type"], "source_document");
    if (!data.source_document.file_name || !data.source_document.file_type) throw new Error("source_document.file_name and file_type are required.");
    const structuredType = String(data.source_document.file_type).toLowerCase();
    if (!["txt", "json", "docx", "pdf"].includes(structuredType)) throw new Error("source_document.file_type is unsupported.");
    if (["docx", "pdf"].includes(structuredType)) {
      if (data.source_document.extracted_text !== null && data.source_document.extracted_text !== undefined) throw new Error("Structured DOCX/PDF input cannot claim extracted text in this static prototype.");
      if (data.source_document.extraction_status && data.source_document.extraction_status !== "Not Extracted") throw new Error("Structured DOCX/PDF extraction_status must be Not Extracted.");
      if (data.source_document.preprocessing_status && data.source_document.preprocessing_status !== "Requires Preprocessing") throw new Error("Structured DOCX/PDF preprocessing_status must be Requires Preprocessing.");
    }
    if (!Array.isArray(data.amendments)) throw new Error("amendments must be an array.");
    const structuredAmendmentRequiredFields = ["amendment_id", "pc_source_reference", "pc_instruction_text", "pc_instruction_summary", "pc_clause_number", "pc_clause_heading", "parent_clause", "target_gc_clause_id", "target_gc_clause_number", "target_gc_heading", "amendment_operation", "target_text", "replacement_or_added_text", "sequence_number", "amendment_category", "alignment_status", "application_status", "verification_status", "effective_clause_id", "effective_location", "affected_element_ids", "affected_tag_ids", "global_dependency_ids", "human_review_required", "source_confidence", "notes"];
    data.amendments.forEach((entry, index) => {
      pcRequireOwnFields(entry, structuredAmendmentRequiredFields, `amendments[${index}]`);
      pcValidateAmendment(entry, index, "structured-input");
    });
    const inputIds = data.amendments.map((entry) => entry.amendment_id);
    if (new Set(inputIds).size !== inputIds.length) throw new Error("amendment_id values must be unique within structured input.");
    data.amendments.forEach((entry, index) => {
      const missingDependency = entry.global_dependency_ids.find((id) => !inputIds.includes(id) && !pcReviewData.amendments.some((current) => current.amendment_id === id));
      if (missingDependency) throw new Error(`amendments[${index}].global_dependency_ids references unknown amendment ${missingDependency}.`);
    });
    if (data.source_document.source_document_id && pcReviewData.source_documents.some((source) => source.source_document_id === data.source_document.source_document_id)) {
      throw new Error(`source_document_id ${data.source_document.source_document_id} already exists in the current project.`);
    }
    const conflictingAmendmentId = inputIds.find((id) => pcReviewData.amendments.some((entry) => entry.amendment_id === id));
    if (conflictingAmendmentId) throw new Error(`amendment_id ${conflictingAmendmentId} already exists in the current project.`);
    return {
      kind: "structured-input",
      label: "Structured Particular Conditions amendment input",
      sourceCount: 1,
      amendmentCount: data.amendments.length,
      projectName: pcReviewData.project?.project_name || "Current project",
      warnings: pcUnknownKeys(data, ["schema_version", "document_type", "source_document", "amendments", "notes"]).map((key) => `Unrecognised top-level field will be preserved in import metadata: ${key}`)
    };
  }
  throw new Error(`Unsupported document_type or schema_version. Expected pc_review_project/${PC_REVIEW_SCHEMA_VERSION} (or legacy ${PC_REVIEW_LEGACY_SCHEMA_VERSION}) or pc_structured_amendment_input/${PC_STRUCTURED_INPUT_SCHEMA_VERSION}.`);
}

function pcShowJsonValidation(data, summary, file, origin) {
  pcPendingJsonImport = { data, summary, file, origin };
  const panel = document.getElementById("pcJsonValidation");
  panel.innerHTML = `<div class="pc-section-heading"><div><p>Validation summary</p><h3>${escapeHtml(summary.label)}</h3></div><span>Native validation passed</span></div>
    <dl class="pc-key-values"><div><dt>Project</dt><dd>${escapeHtml(summary.projectName)}</dd></div><div><dt>Source documents</dt><dd>${summary.sourceCount}</dd></div><div><dt>Amendments</dt><dd>${summary.amendmentCount}</dd></div></dl>
    ${summary.warnings.length ? `<ul>${summary.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : "<p>No unrecognised top-level fields.</p>"}
    <div class="pc-form-actions split-actions"><button id="pcCancelJsonImport" type="button">Cancel import</button><button id="pcConfirmJsonImport" class="pc-primary-action" type="button">Confirm import</button></div>`;
  panel.hidden = false;
  pcSetMessage("JSON passed native structural and semantic validation. Review the summary and confirm before import.", "is-success");
  document.getElementById("pcCancelJsonImport").addEventListener("click", pcCancelJsonImport);
  document.getElementById("pcConfirmJsonImport").addEventListener("click", pcConfirmJsonImport);
}

function pcCancelJsonImport() {
  pcPendingJsonImport = null;
  document.getElementById("pcJsonValidation").hidden = true;
  pcSourceFile.value = "";
  pcSetMessage("JSON import cancelled. Current browser-session state was not changed.");
}

function pcNormalizeImportedAmendment(entry, sourceDocumentId) {
  const category = entry.amendment_category;
  const rawSequence = Number(entry.sequence_number);
  return pcUpgradeAmendmentForTask3({
    ...entry,
    amendment_id: entry.amendment_id || createPcId("amendment"),
    project_id: pcReviewData.project.project_id,
    pc_source_document_id: sourceDocumentId,
    pc_source_reference: pcNullable(entry.pc_source_reference),
    pc_instruction_text: String(entry.pc_instruction_text),
    pc_instruction_summary: pcNullable(entry.pc_instruction_summary),
    pc_clause_number: pcNullable(entry.pc_clause_number),
    pc_clause_heading: pcNullable(entry.pc_clause_heading),
    parent_clause: pcNullable(entry.parent_clause),
    target_gc_clause_id: null,
    target_gc_clause_number: pcNullable(entry.target_gc_clause_number),
    target_gc_heading: pcNullable(entry.target_gc_heading),
    target_basis: PC_TARGET_BASES.includes(entry.target_basis) ? entry.target_basis : "Unclear",
    target_location: pcNullable(entry.target_location || entry.effective_location),
    amendment_operation: entry.amendment_operation,
    target_text: pcExactNullable(entry.target_text),
    replacement_or_added_text: pcExactNullable(entry.replacement_or_added_text),
    sequence_number: Number.isInteger(rawSequence) && rawSequence > 0 ? rawSequence : null,
    amendment_category: category,
    alignment_status: "Not Assessed",
    machine_alignment_status: null,
    machine_alignment_reason: null,
    active_alignment_assessment_id: null,
    active_alignment_decision_id: null,
    manual_alignment_status: null,
    manual_alignment_decision: null,
    manual_alignment_at: null,
    manual_alignment_by: null,
    proposed_target_gc_clause_id: null,
    proposed_target_gc_clause_number: null,
    proposed_target_gc_heading: null,
    target_occurrence_count: null,
    alignment_conflicts: [],
    blocking_issue: null,
    alignment_evaluated_at: null,
    application_status: ["Defined-term Amendment", "Global Amendment"].includes(category) ? "Identified – Deferred" : "Not Assessed",
    verification_status: "Not Verified",
    effective_clause_id: null,
    effective_location: null,
    affected_element_ids: [],
    affected_tag_ids: [],
    global_dependency_ids: Array.isArray(entry.global_dependency_ids) ? entry.global_dependency_ids : [],
    human_review_required: entry.human_review_required !== false,
    source_confidence: null,
    notes: pcNullable(entry.notes)
  });
}

function pcConfirmJsonImport() {
  if (!pcPendingJsonImport) return;
  const { data, summary, file, origin } = pcPendingJsonImport;
  if (summary.kind === "review-project") {
    const hasCurrentState = Boolean(pcReviewData.project || pcReviewData.source_documents.length || pcReviewData.amendments.length);
    if (hasCurrentState && !window.confirm(`Replace the current browser-session review with “${data.project.project_name}”? Unsaved state will be lost.`)) return;
    pcReviewData = pcUpgradeReviewProject(data);
    pcSeedAuditClock(pcReviewData);
    pcSelectedAmendmentIds.clear();
    pcApplicationPreviews.clear();
    pcWorkbenchAmendmentId = null;
    pcReviewData.export_timestamp = null;
    pcActiveSourceDocumentId = pcReviewData.source_documents.at(-1)?.source_document_id || null;
    pcRecordHistory({ previousStatus: pcReviewData.project.project_status, newStatus: pcReviewData.project.project_status, action: "Review project JSON re-imported", notes: file.name });
    pcSyncProjectForm();
    pcSetMessage(`Review project “${data.project.project_name}” imported${summary.needsUpgrade ? ` and upgraded to ${PC_REVIEW_SCHEMA_VERSION}` : ""}. No amendment was written to the baseline.`, "is-success");
  } else {
    const sourceHash = null;
    const importedFileType = String(data.source_document.file_type).toLowerCase();
    const requiresPreprocessing = ["docx", "pdf"].includes(importedFileType);
    const source = {
      ...data.source_document,
      source_document_id: data.source_document.source_document_id || createPcId("pc_source"),
      project_id: pcReviewData.project.project_id,
      file_name: data.source_document.file_name,
      file_type: importedFileType,
      file_size: Number(data.source_document.file_size) || file.size,
      selected_at: pcNow(),
      document_role: "Particular Conditions",
      extraction_status: requiresPreprocessing ? "Not Extracted" : (data.source_document.extracted_text != null ? "Text Extracted" : "Not Extracted"),
      preprocessing_status: requiresPreprocessing ? "Requires Preprocessing" : (data.source_document.preprocessing_status || "Not Assessed"),
      processing_status: requiresPreprocessing ? "Requires Preprocessing" : "Source Loaded",
      verification_status: "Not Verified",
      extracted_text: requiresPreprocessing ? null : (typeof data.source_document.extracted_text === "string" ? data.source_document.extracted_text : null),
      extraction_method: requiresPreprocessing ? null : (data.source_document.extraction_method || "Structured JSON import"),
      extraction_error: null,
      source_hash: sourceHash,
      notes: pcNullable(data.source_document.notes),
      import_metadata: { unrecognised_top_level_fields: pcUnknownKeys(data, ["schema_version", "document_type", "source_document", "amendments", "notes"]), original_schema_version: data.schema_version, original_document_type: data.document_type }
    };
    pcRegisterSourceDocument(source, "Structured Particular Conditions JSON imported");
    data.amendments.forEach((entry) => {
      const amendment = pcNormalizeImportedAmendment(entry, source.source_document_id);
      pcReviewData.amendments.push(amendment);
      pcReviewData.project.amendment_ids.push(amendment.amendment_id);
      pcRecordHistory({ sourceDocumentId: source.source_document_id, amendmentId: amendment.amendment_id, newStatus: amendment.application_status, action: "Amendment entry imported" });
    });
    source.processing_status = data.amendments.length ? "Amendments Identified" : "Amendments Not Yet Identified";
    pcReviewData.project.project_status = pcReviewData.amendments.length ? "Amendments Identified" : "Amendments Not Yet Identified";
    pcSetMessage(`${data.amendments.length} amendment entries imported. Deterministic alignment evidence will be recorded locally; no amendment will be applied automatically.`, "is-success");
  }
  pcPendingJsonImport = null;
  pcSourceFile.value = "";
  document.getElementById("pcJsonValidation").hidden = true;
  if (origin === "project-import") switchPcView("pcOverviewView");
  if (summary.kind === "structured-input" || summary.needsUpgrade) pcEvaluateAllAlignments({ recordHistory: false });
  updatePcProjectSummary();
}

async function processPcSourceFile(file, origin = "source-intake") {
  if (!file) return;
  if (!pcReviewData.project && origin !== "project-import") {
    pcSourceFile.value = "";
    pcSetMessage("Create the review project before registering a source document.", "is-error");
    pcProjectName.focus();
    return;
  }
  const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
  document.getElementById("pcJsonValidation").hidden = true;
  if (!["txt", "json", "docx", "pdf"].includes(extension)) {
    pcSourceFile.value = "";
    pcSetMessage("Failed Validation: select TXT, structured JSON, DOCX or PDF.", "is-error");
    setPcStage("source", "Failed Validation", "is-failed");
    return;
  }
  if (extension === "json") {
    try {
      const text = await pcReadFileAsText(file);
      const data = JSON.parse(text);
      const summary = pcValidateJsonPayload(data);
      if (summary.kind === "structured-input" && !pcReviewData.project) throw new Error("Create a review project before importing structured amendment input.");
      pcShowJsonValidation(data, summary, file, origin);
    } catch (error) {
      pcPendingJsonImport = null;
      pcSourceFile.value = "";
      document.getElementById("pcJsonValidation").hidden = true;
      pcSetMessage(`Failed Validation: ${error.message}`, "is-error");
      setPcStage("source", "Failed Validation", "is-failed");
    }
    return;
  }
  try {
    const sourceHash = await pcHashFile(file);
    const source = pcBaseSourceDocument(file, extension, sourceHash);
    if (extension === "txt") {
      source.extracted_text = await pcReadFileAsText(file);
      source.extraction_status = "Text Extracted";
      source.extraction_method = "Browser FileReader.readAsText";
      source.processing_status = "Amendments Not Yet Identified";
      pcRegisterSourceDocument(source, "TXT source loaded and text extracted locally");
      pcSetMessage(`TXT text extracted exactly (${source.extracted_text.length.toLocaleString()} characters). Amendments Not Yet Identified.`, "is-success");
    } else {
      source.preprocessing_status = "Requires Preprocessing";
      source.processing_status = "Requires Preprocessing";
      source.extraction_error = null;
      pcRegisterSourceDocument(source, `${extension.toUpperCase()} source registered; preprocessing required`);
      pcSetMessage(`${extension.toUpperCase()} registered locally. Extraction status: Not Extracted. The static prototype cannot extract this document reliably.`, "is-warning");
    }
  } catch (error) {
    pcSourceFile.value = "";
    pcSetMessage(`Failed Validation: ${error.message}`, "is-error");
    setPcStage("text", "Failed Validation", "is-failed");
  }
}

function pcPopulateSelect(select, values) {
  const current = select.value;
  select.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

function pcInitializeRegisterControls() {
  pcPopulateSelect(document.getElementById("pcAmendmentCategory"), PC_AMENDMENT_CATEGORIES);
  pcPopulateSelect(document.getElementById("pcAmendmentOperation"), PC_AMENDMENT_OPERATIONS);
  document.querySelectorAll("[data-amendment-filter]").forEach((select) => {
    if (select.dataset.amendmentFilter === "amendment_category") select.insertAdjacentHTML("beforeend", PC_AMENDMENT_CATEGORIES.map((value) => `<option>${escapeHtml(value)}</option>`).join(""));
    if (select.dataset.amendmentFilter === "amendment_operation") select.insertAdjacentHTML("beforeend", PC_AMENDMENT_OPERATIONS.map((value) => `<option>${escapeHtml(value)}</option>`).join(""));
    if (select.dataset.amendmentFilter === "alignment_status") select.innerHTML = '<option value="">All</option>' + PC_ALIGNMENT_STATUSES.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
    if (select.dataset.amendmentFilter === "application_status") select.innerHTML = '<option value="">All</option>' + ["Not Assessed", "Identified – Deferred", "Blocking Dependency", "Not Yet Supported / Human Review Required", "Previewed", "Applied", "Failed", "Rejected", "Rolled Back"].map((value) => `<option>${escapeHtml(value)}</option>`).join("");
  });
}

function pcPopulateAmendmentSourceOptions() {
  const select = document.getElementById("pcAmendmentSourceDocument");
  if (!select) return;
  const current = select.value;
  select.innerHTML = pcReviewData.source_documents.length
    ? pcReviewData.source_documents.map((source) => `<option value="${escapeHtml(source.source_document_id)}">${escapeHtml(source.file_name)}</option>`).join("")
    : '<option value="">Register a source document first</option>';
  if ([...select.options].some((option) => option.value === current)) select.value = current;
}

function pcFilteredAmendments() {
  const filters = Object.fromEntries([...document.querySelectorAll("[data-amendment-filter]")].map((select) => [select.dataset.amendmentFilter, select.value]));
  return pcReviewData.amendments.filter((entry) => Object.entries(filters).every(([field, value]) => {
    if (!value) return true;
    return String(entry[field]) === value;
  }));
}

function pcRenderAmendmentRegister() {
  const rows = document.getElementById("pcAmendmentRows");
  if (!rows) return;
  const amendments = pcFilteredAmendments();
  document.getElementById("pcRegisterCount").textContent = `${amendments.length} of ${pcReviewData.amendments.length} entries`;
  document.getElementById("pcRegisterEmpty").hidden = amendments.length > 0;
  rows.innerHTML = amendments.map((entry) => `<tr class="pc-amendment-row">
      <td><button type="button" class="pc-row-expand" data-expand-amendment="${escapeHtml(entry.amendment_id)}" aria-expanded="false">${escapeHtml(entry.amendment_id)}</button></td>
      <td>${escapeHtml(entry.pc_source_reference || "—")}</td><td>${escapeHtml(entry.pc_clause_number || "—")}</td>
      <td class="instruction-cell">${escapeHtml(entry.pc_instruction_text.slice(0, 90))}${entry.pc_instruction_text.length > 90 ? "…" : ""}</td>
      <td>${escapeHtml(entry.amendment_category)}</td><td>${escapeHtml(entry.amendment_operation)}</td>
      <td>${escapeHtml(entry.target_gc_clause_number || "Not Assessed")}</td><td><span class="status-badge">${escapeHtml(entry.alignment_status)}</span></td>
      <td><span class="status-badge">${escapeHtml(entry.application_status)}</span></td><td><span class="status-badge">${escapeHtml(entry.verification_status)}</span></td>
      <td>${entry.human_review_required ? "Required" : "Not required"}</td>
      <td><div class="row-actions"><button type="button" data-edit-amendment="${escapeHtml(entry.amendment_id)}">Edit</button><button type="button" data-delete-amendment="${escapeHtml(entry.amendment_id)}">Delete</button></div></td>
    </tr><tr class="pc-amendment-detail" data-amendment-detail="${escapeHtml(entry.amendment_id)}" hidden><td colspan="12"><b>Exact source instruction</b><pre>${escapeHtml(entry.pc_instruction_text)}</pre><dl><div><dt>Separate summary</dt><dd>${escapeHtml(entry.pc_instruction_summary || "None")}</dd></div><div><dt>Target basis / location</dt><dd>${escapeHtml(entry.target_basis || "Unclear")} · ${escapeHtml(entry.target_location || "No location supplied")}</dd></div><div><dt>Machine / human alignment</dt><dd>${escapeHtml(entry.machine_alignment_status || "Not Assessed")} · ${escapeHtml(entry.manual_alignment_status || "No manual decision")}</dd></div><div><dt>Effective clause</dt><dd>${escapeHtml(entry.effective_clause_id || "Not created")}</dd></div><div><dt>Deferred dependencies</dt><dd>${escapeHtml((entry.global_dependency_ids || []).join(", ") || "None")}</dd></div><div><dt>Affected elements / tags</dt><dd>Not Assessed · Task 4 not started</dd></div></dl></td></tr>`).join("");
  rows.querySelectorAll("[data-expand-amendment]").forEach((button) => button.addEventListener("click", () => {
    const detail = rows.querySelector(`[data-amendment-detail="${CSS.escape(button.dataset.expandAmendment)}"]`);
    detail.hidden = !detail.hidden;
    button.setAttribute("aria-expanded", String(!detail.hidden));
  }));
  rows.querySelectorAll("[data-edit-amendment]").forEach((button) => button.addEventListener("click", () => pcOpenAmendmentEditor(button.dataset.editAmendment)));
  rows.querySelectorAll("[data-delete-amendment]").forEach((button) => button.addEventListener("click", () => pcDeleteAmendment(button.dataset.deleteAmendment)));
}

function pcOpenAmendmentEditor(amendmentId = null) {
  if (!pcReviewData.project) {
    switchPcView("pcSourceIntakeView");
    pcSetMessage("Create a review project before adding an amendment entry.", "is-error");
    return;
  }
  if (!pcReviewData.source_documents.length) {
    switchPcView("pcSourceIntakeView");
    pcSetMessage("Register a Particular Conditions source before adding an amendment entry.", "is-error");
    return;
  }
  const entry = pcReviewData.amendments.find((item) => item.amendment_id === amendmentId) || null;
  if (entry && pcReviewData.application_log.some((log) => log.amendment_id === entry.amendment_id)) {
    pcSetWorkbenchMessage("An amendment with application, preview, rejection or rollback audit history is immutable. Create a new Amendment Register entry for revised operands.", "is-error");
    switchPcView("pcConsolidationWorkbenchView");
    pcSelectWorkbenchAmendment(entry.amendment_id);
    return;
  }
  if (entry?.active_alignment_decision_id) {
    pcSetAlignmentMessage("Clear the active human alignment decision before editing this Amendment Register entry.", "is-error");
    switchPcView("pcClauseAlignmentView");
    return;
  }
  document.getElementById("pcEditingAmendmentId").value = entry?.amendment_id || "";
  document.getElementById("pcAmendmentEditorTitle").textContent = entry ? `Edit ${entry.amendment_id}` : "New amendment entry";
  document.getElementById("pcAmendmentSourceDocument").value = entry?.pc_source_document_id || pcActiveSourceDocument()?.source_document_id || "";
  document.getElementById("pcAmendmentSourceReference").value = entry?.pc_source_reference || "";
  document.getElementById("pcAmendmentClauseNumber").value = entry?.pc_clause_number || "";
  document.getElementById("pcAmendmentClauseHeading").value = entry?.pc_clause_heading || "";
  document.getElementById("pcAmendmentParentClause").value = entry?.parent_clause || "";
  document.getElementById("pcAmendmentSequence").value = entry?.sequence_number || "";
  document.getElementById("pcAmendmentCategory").value = entry?.amendment_category || PC_AMENDMENT_CATEGORIES[0];
  document.getElementById("pcAmendmentOperation").value = entry?.amendment_operation || PC_AMENDMENT_OPERATIONS.at(-1);
  document.getElementById("pcAmendmentTargetClause").value = entry?.target_gc_clause_number || "";
  document.getElementById("pcAmendmentTargetHeading").value = entry?.target_gc_heading || "";
  document.getElementById("pcAmendmentTargetBasis").value = entry?.target_basis || "Unclear";
  document.getElementById("pcAmendmentTargetLocation").value = entry?.target_location || "";
  document.getElementById("pcAmendmentDependencies").value = (entry?.global_dependency_ids || []).join(", ");
  document.getElementById("pcAmendmentInstruction").value = entry?.pc_instruction_text || "";
  document.getElementById("pcAmendmentSummary").value = entry?.pc_instruction_summary || "";
  document.getElementById("pcAmendmentTargetText").value = entry?.target_text || "";
  document.getElementById("pcAmendmentReplacementText").value = entry?.replacement_or_added_text || "";
  document.getElementById("pcAmendmentHumanReview").checked = entry?.human_review_required !== false;
  document.getElementById("pcAmendmentNotes").value = entry?.notes || "";
  document.getElementById("pcAmendmentValidation").textContent = "Required fields are marked with *. No target or legal effect is inferred.";
  document.getElementById("pcAmendmentValidation").className = "pc-intake-message";
  const editor = document.getElementById("pcAmendmentEditor");
  editor.hidden = false;
  editor.scrollIntoView({ behavior: "smooth", block: "start" });
}

function pcSaveAmendment(event) {
  event.preventDefault();
  const sourceDocumentId = document.getElementById("pcAmendmentSourceDocument").value;
  const sourceReference = document.getElementById("pcAmendmentSourceReference").value.trim();
  const exactInstruction = document.getElementById("pcAmendmentInstruction").value;
  const category = document.getElementById("pcAmendmentCategory").value;
  const operation = document.getElementById("pcAmendmentOperation").value;
  const validation = document.getElementById("pcAmendmentValidation");
  if (!sourceDocumentId || !sourceReference || !exactInstruction.trim() || !PC_AMENDMENT_CATEGORIES.includes(category) || !PC_AMENDMENT_OPERATIONS.includes(operation)) {
    validation.textContent = "Failed Validation: source document, PC reference, exact instruction, category and operation are required.";
    validation.className = "pc-intake-message is-error";
    return;
  }
  const existingId = document.getElementById("pcEditingAmendmentId").value;
  const existing = pcReviewData.amendments.find((item) => item.amendment_id === existingId);
  if (existing && pcReviewData.application_log.some((log) => log.amendment_id === existing.amendment_id)) {
    validation.textContent = "Failed Validation: an amendment with application, preview, rejection or rollback audit history is immutable; create a new entry for revised operands.";
    validation.className = "pc-intake-message is-error";
    return;
  }
  if (existing?.active_alignment_decision_id) {
    validation.textContent = "Failed Validation: clear the active human alignment decision before editing this amendment.";
    validation.className = "pc-intake-message is-error";
    return;
  }
  const dependencyIds = document.getElementById("pcAmendmentDependencies").value.split(",").map((value) => value.trim()).filter(Boolean);
  const unknownDependency = dependencyIds.find((id) => !pcReviewData.amendments.some((entry) => entry.amendment_id === id));
  if (unknownDependency) {
    validation.textContent = `Failed Validation: deferred dependency ${unknownDependency} is not an existing Amendment Register ID.`;
    validation.className = "pc-intake-message is-error";
    return;
  }
  if (existing && dependencyIds.includes(existing.amendment_id)) {
    validation.textContent = "Failed Validation: an amendment cannot depend on itself.";
    validation.className = "pc-intake-message is-error";
    return;
  }
  const entry = pcNormalizeImportedAmendment({
    ...(existing || {}),
    amendment_id: existing?.amendment_id || createPcId("amendment"),
    pc_source_reference: sourceReference,
    pc_instruction_text: exactInstruction,
    pc_instruction_summary: document.getElementById("pcAmendmentSummary").value,
    pc_clause_number: document.getElementById("pcAmendmentClauseNumber").value,
    pc_clause_heading: document.getElementById("pcAmendmentClauseHeading").value,
    parent_clause: document.getElementById("pcAmendmentParentClause").value,
    target_gc_clause_number: document.getElementById("pcAmendmentTargetClause").value,
    target_gc_heading: document.getElementById("pcAmendmentTargetHeading").value,
    target_basis: document.getElementById("pcAmendmentTargetBasis").value,
    target_location: document.getElementById("pcAmendmentTargetLocation").value,
    amendment_operation: operation,
    target_text: document.getElementById("pcAmendmentTargetText").value,
    replacement_or_added_text: document.getElementById("pcAmendmentReplacementText").value,
    sequence_number: document.getElementById("pcAmendmentSequence").value,
    amendment_category: category,
    global_dependency_ids: dependencyIds,
    human_review_required: document.getElementById("pcAmendmentHumanReview").checked,
    notes: document.getElementById("pcAmendmentNotes").value
  }, sourceDocumentId);
  if (existing?.active_alignment_assessment_id) entry.active_alignment_assessment_id = existing.active_alignment_assessment_id;
  try {
    pcValidateAmendment(entry, existing ? pcReviewData.amendments.indexOf(existing) : pcReviewData.amendments.length, "task3-project");
  } catch (error) {
    validation.textContent = `Failed Validation: ${error.message}`;
    validation.className = "pc-intake-message is-error";
    return;
  }
  let savedEntry = entry;
  if (existing) {
    const previousApplicationStatus = existing.application_status;
    Object.assign(existing, entry);
    savedEntry = existing;
    pcRecordHistory({ sourceDocumentId, amendmentId: entry.amendment_id, previousStatus: previousApplicationStatus, newStatus: entry.application_status, action: "Amendment entry edited", actor: "User" });
  } else {
    pcReviewData.amendments.push(entry);
    pcReviewData.project.amendment_ids.push(entry.amendment_id);
    pcRecordHistory({ sourceDocumentId, amendmentId: entry.amendment_id, newStatus: entry.application_status, action: "Amendment entry created", actor: "User" });
  }
  pcEvaluateAmendmentAlignment(savedEntry, { recordHistory: true });
  pcReviewData.project.project_status = "Amendments Identified";
  document.getElementById("pcAmendmentEditor").hidden = true;
  updatePcProjectSummary();
}

function pcDeleteAmendment(amendmentId) {
  const entry = pcReviewData.amendments.find((item) => item.amendment_id === amendmentId);
  if (entry && pcReviewData.application_log.some((log) => log.amendment_id === amendmentId && log.application_result === "Applied" && !log.rolled_back_at)) {
    pcSetWorkbenchMessage("Roll back the active application before deleting this Amendment Register entry.", "is-error");
    switchPcView("pcConsolidationWorkbenchView");
    pcSelectWorkbenchAmendment(amendmentId);
    return;
  }
  if (entry && (pcReviewData.alignment_decisions.some((decision) => decision.amendment_id === amendmentId) || pcReviewData.application_log.some((log) => log.amendment_id === amendmentId))) {
    pcSetAlignmentMessage("This amendment has retained human-decision or application audit records and cannot be deleted. Reject it or reset the review instead.", "is-error");
    switchPcView("pcClauseAlignmentView");
    return;
  }
  if (!entry || !window.confirm(`Delete ${amendmentId}? This removes the register entry from the current browser session.`)) return;
  const removedAssessmentIds = pcReviewData.alignment_assessments.filter((assessment) => assessment.amendment_id === amendmentId).map((assessment) => assessment.alignment_assessment_id);
  pcReviewData.alignment_assessments = pcReviewData.alignment_assessments.filter((assessment) => assessment.amendment_id !== amendmentId);
  pcReviewData.project.alignment_assessment_ids = pcReviewData.project.alignment_assessment_ids.filter((id) => !removedAssessmentIds.includes(id));
  pcReviewData.amendments = pcReviewData.amendments.filter((item) => item.amendment_id !== amendmentId);
  pcReviewData.project.amendment_ids = pcReviewData.project.amendment_ids.filter((id) => id !== amendmentId);
  pcSelectedAmendmentIds.delete(amendmentId);
  pcApplicationPreviews.delete(amendmentId);
  pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId, previousStatus: entry.application_status, newStatus: "Deleted from register", action: "Amendment entry deleted", actor: "User" });
  pcReviewData.project.project_status = pcReviewData.amendments.length ? "Amendments Identified" : "Amendments Not Yet Identified";
  updatePcProjectSummary();
}

function pcSetAlignmentMessage(message, stateClass = "") {
  const target = document.getElementById("pcAlignmentMessage");
  if (!target) return;
  target.textContent = message;
  target.className = `pc-intake-message ${stateClass}`.trim();
}

function pcSetWorkbenchMessage(message, stateClass = "") {
  const target = document.getElementById("pcWorkbenchMessage");
  if (!target) return;
  target.textContent = message;
  target.className = `pc-intake-message ${stateClass}`.trim();
}

function pcBaselineClauseForAmendment(entry) {
  if (!fidicSourceLayer) return null;
  const index = PCAlignmentEngine.buildBaselineIndex(fidicSourceLayer);
  const resolvedId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id;
  if (resolvedId && index.byId.has(resolvedId)) return index.byId.get(resolvedId);
  const resolvedNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number;
  return resolvedNumber ? index.byNumber.get(String(resolvedNumber)) || null : null;
}

function pcControlledBaselineIntegrity(record = null) {
  const gate = PCAlignmentEngine.sourceLayerGate(fidicSourceLayer);
  if (!gate.ok) return { ok: false, reason: gate.reason };
  const expectedSourceHash = pcReviewData.project?.baseline_source_sha256 || null;
  const currentSourceHash = fidicSourceLayer?.source_sha256 || null;
  const expectedLayerHash = pcReviewData.project?.baseline_source_layer_sha256 || null;
  const currentLayerHash = fidicSourceLayer?.runtime_source_layer_sha256 || null;
  if (!expectedSourceHash || expectedSourceHash !== currentSourceHash || !expectedLayerHash || expectedLayerHash !== currentLayerHash) {
    return { ok: false, reason: "The review project baseline origin or processed source layer does not match the currently loaded controlled source." };
  }
  if (!record || !record.baseline_clause_id) return { ok: true, reason: null };
  const controlled = gate.index.byId.get(record.baseline_clause_id);
  if (!controlled || controlled.clause_no !== record.clause_number
    || controlled.clause_title !== record.clause_heading
    || controlled.parent_clause_no !== record.parent_clause_number
    || controlled.full_text !== record.baseline_text
    || record.baseline_original_order !== controlled.original_order
    || record.effective_order_key !== controlled.original_order) {
    return { ok: false, reason: "The Effective Clause baseline snapshot does not match the controlled source layer." };
  }
  return { ok: true, reason: null };
}

function pcResolvedEligibilityEntry(entry) {
  const controlledTarget = pcBaselineClauseForAmendment(entry);
  const humanConfirmed = entry.alignment_status === "Human Confirmed";
  return {
    ...entry,
    target_gc_clause_id: entry.proposed_target_gc_clause_id || entry.target_gc_clause_id || null,
    target_gc_clause_number: entry.proposed_target_gc_clause_number || entry.target_gc_clause_number || null,
    target_gc_heading: entry.proposed_target_gc_heading || entry.target_gc_heading || null,
    parent_clause: humanConfirmed && entry.parent_clause && controlledTarget
      ? controlledTarget.parent_clause_no
      : entry.parent_clause
  };
}

function pcEvaluateAmendmentAlignment(entry, { recordHistory = false } = {}) {
  if (!entry || !pcReviewData.project) return null;
  if (entry.active_alignment_decision_id) {
    if (recordHistory) pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: entry.alignment_status, newStatus: entry.alignment_status, action: "Machine reassessment skipped while a human decision is active", notes: "Clear the manual decision before recording a new machine assessment." });
    return pcActiveAssessment(entry);
  }
  if (pcHasActiveApplication(entry.amendment_id)) {
    if (recordHistory) pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: entry.alignment_status, newStatus: entry.alignment_status, action: "Machine reassessment skipped for actively applied amendment", notes: "Rollback is required before reassessment." });
    return pcActiveAssessment(entry);
  }
  const previousStatus = entry.alignment_status || "Not Assessed";
  const priorAssessmentId = entry.active_alignment_assessment_id || null;
  const result = PCAlignmentEngine.alignAmendment(entry, fidicSourceLayer, pcReviewData.project, pcReviewData.amendments, pcReviewData.effective_clauses);
  const withoutDependencies = entry.global_dependency_ids?.length
    ? PCAlignmentEngine.alignAmendment({ ...entry, global_dependency_ids: [] }, fidicSourceLayer, pcReviewData.project, pcReviewData.amendments, pcReviewData.effective_clauses)
    : result;
  const proposedTarget = result.proposed_target_gc_clause_id ? result : withoutDependencies;
  const assessedAt = pcNow();
  const assessment = {
    alignment_assessment_id: createPcId("alignment_assessment"),
    amendment_id: entry.amendment_id,
    assessed_at: assessedAt,
    assessed_by: "Deterministic browser alignment gate",
    baseline_id: pcReviewData.project.baseline_id,
    baseline_source_sha256: fidicSourceLayer?.source_sha256 || null,
    baseline_source_layer_sha256: fidicSourceLayer?.runtime_source_layer_sha256 || null,
    amendment_operation: entry.amendment_operation,
    target_basis: entry.target_basis || "Unclear",
    target_location: entry.target_location || null,
    replacement_or_added_text: entry.replacement_or_added_text,
    sequence_number: entry.sequence_number,
    machine_status: result.machine_alignment_status,
    underlying_match_status: withoutDependencies.machine_alignment_status,
    asserted_target: {
      parent_clause: entry.parent_clause || null,
      target_gc_clause_number: entry.target_gc_clause_number || null,
      target_gc_heading: entry.target_gc_heading || null,
      target_text: entry.target_text || null
    },
    proposed_target: {
      clause_id: proposedTarget.proposed_target_gc_clause_id || null,
      clause_number: proposedTarget.proposed_target_gc_clause_number || null,
      clause_heading: proposedTarget.proposed_target_gc_heading || null
    },
    evidence: {
      fidic_form_match: pcReviewData.project.fidic_form === "Red Book",
      fidic_edition_match: pcReviewData.project.fidic_edition === "2017",
      operation_supported: PC_SUPPORTED_OPERATIONS.includes(entry.amendment_operation),
      sequence_known: Number.isInteger(Number(entry.sequence_number)) && Number(entry.sequence_number) > 0,
      target_basis: entry.target_basis || "Unclear",
      ...withoutDependencies.match_evidence,
      effective_status_evidence: result.match_evidence
    },
    conflicts: [...new Set([...(withoutDependencies.conflicts || []), ...(result.conflicts || [])])],
    blocking_dependency_ids: [...(entry.global_dependency_ids || [])],
    blocking_issue: result.blocking_issue || null,
    reason: result.machine_alignment_reason,
    supersedes_assessment_id: priorAssessmentId
  };
  pcReviewData.alignment_assessments.push(assessment);
  pcReviewData.project.alignment_assessment_ids.push(assessment.alignment_assessment_id);
  entry.active_alignment_assessment_id = assessment.alignment_assessment_id;
  entry.active_alignment_decision_id = null;
  entry.manual_alignment_status = null;
  entry.manual_alignment_decision = null;
  entry.manual_alignment_at = null;
  entry.manual_alignment_by = null;
  entry.machine_alignment_status = result.machine_alignment_status;
  entry.machine_alignment_reason = result.machine_alignment_reason;
  entry.alignment_status = result.machine_alignment_status;
  entry.proposed_target_gc_clause_id = proposedTarget.proposed_target_gc_clause_id || null;
  entry.proposed_target_gc_clause_number = proposedTarget.proposed_target_gc_clause_number || null;
  entry.proposed_target_gc_heading = proposedTarget.proposed_target_gc_heading || null;
  entry.target_occurrence_count = result.target_occurrence_count;
  entry.alignment_conflicts = assessment.conflicts;
  entry.blocking_issue = result.blocking_issue || null;
  entry.alignment_evaluated_at = assessedAt;
  pcSelectedAmendmentIds.delete(entry.amendment_id);
  const deferred = ["Defined-term Amendment", "Global Amendment"].includes(entry.amendment_category);
  const activeApplication = pcReviewData.application_log.some((log) => log.amendment_id === entry.amendment_id && log.application_result === "Applied" && !log.rolled_back_at);
  if (deferred) entry.application_status = "Identified – Deferred";
  else if (!activeApplication && result.machine_alignment_status === "Blocking Dependency") entry.application_status = "Blocking Dependency";
  else if (!activeApplication && !PC_SUPPORTED_OPERATIONS.includes(entry.amendment_operation)) entry.application_status = "Not Yet Supported / Human Review Required";
  else if (!activeApplication && !["Failed", "Previewed", "Rolled Back", "Rejected"].includes(entry.application_status)) entry.application_status = "Not Assessed";
  entry.human_review_required = deferred ? false : result.machine_alignment_status !== "Exact Match";
  if (recordHistory) {
    pcRecordHistory({
      sourceDocumentId: entry.pc_source_document_id,
      amendmentId: entry.amendment_id,
      previousStatus,
      newStatus: entry.alignment_status,
      action: "Clause alignment machine assessment recorded",
      notes: `${assessment.machine_status}: ${assessment.reason}`
    });
  }
  return assessment;
}

function pcEvaluateAllAlignments({ recordHistory = true } = {}) {
  if (!pcReviewData.project || !pcReviewData.amendments.length) {
    pcSetAlignmentMessage("Create or import a review project with Amendment Register entries first.", "is-warning");
    return;
  }
  pcReviewData.amendments.forEach((entry) => pcEvaluateAmendmentAlignment(entry, { recordHistory: false }));
  pcReviewData.project.project_status = pcReviewData.application_log.some((log) => log.application_result === "Applied" && !log.rolled_back_at)
    ? "Clause-specific Consolidation"
    : "Clause Alignment Review";
  if (recordHistory) {
    pcRecordHistory({
      previousStatus: "Amendments Identified",
      newStatus: pcReviewData.project.project_status,
      action: "All registered amendments evaluated by the clause alignment gate",
      actor: "User"
    });
  }
  pcSetAlignmentMessage(`${pcReviewData.amendments.length} entries assessed. Machine results are evidence only; no amendment was applied.`, "is-success");
  updatePcProjectSummary();
}

function pcActiveAssessment(entry) {
  return pcReviewData.alignment_assessments.find((item) => item.alignment_assessment_id === entry.active_alignment_assessment_id) || null;
}

function pcHasActiveApplication(amendmentId) {
  return pcReviewData.application_log.some((log) => log.amendment_id === amendmentId && log.application_result === "Applied" && !log.rolled_back_at);
}

function pcBaseUnappliedApplicationStatus(entry) {
  if (["Defined-term Amendment", "Global Amendment"].includes(entry.amendment_category)) return "Identified – Deferred";
  if (entry.machine_alignment_status === "Blocking Dependency") return "Blocking Dependency";
  if (!PC_SUPPORTED_OPERATIONS.includes(entry.amendment_operation)) return "Not Yet Supported / Human Review Required";
  return "Not Assessed";
}

function pcRefreshEffectiveClauseDerivedStatus(record) {
  const replay = pcReplayEffectiveClause(record, null);
  if (!replay.ok || replay.currentText !== record.current_effective_text) return false;
  const noActiveNewClause = !record.baseline_clause_id && replay.appliedIds.length === 0;
  const hasPendingAmendments = pcHasPendingClauseAmendments(record);
  record.is_tombstone = replay.finalStatus === "Deleted" || noActiveNewClause;
  record.clause_status = record.failed_amendment_ids.length
    ? (replay.appliedIds.length ? "Partially Applied" : "Application Failed")
    : (noActiveNewClause ? "Deleted" : (hasPendingAmendments ? (replay.appliedIds.length ? "Partially Applied" : "Amendment Pending") : replay.finalStatus));
  record.updated_at = pcNow();
  return true;
}

function pcSetManualAlignment(amendmentId, action) {
  const entry = pcReviewData.amendments.find((item) => item.amendment_id === amendmentId);
  const assessment = entry ? pcActiveAssessment(entry) : null;
  if (!entry || !assessment) {
    pcSetAlignmentMessage("Run the machine alignment assessment before recording a human decision.", "is-error");
    return;
  }
  if (pcHasActiveApplication(amendmentId)) {
    pcSetAlignmentMessage("Roll back the active application before changing its alignment decision.", "is-error");
    return;
  }
  if (entry.application_status === "Rejected" && action !== "Clear Manual Decision") {
    pcSetAlignmentMessage("This rejection remains locked until Clear Manual Decision is used.", "is-error");
    return;
  }
  if (action === "Confirm Alignment" && (!entry.proposed_target_gc_clause_id && entry.amendment_operation !== "Add New Sub-Clause")) {
    pcSetAlignmentMessage("There is no specific proposed target to confirm. Return to the Amendment Register and correct the asserted target.", "is-error");
    return;
  }
  if (action === "Confirm Alignment" && entry.blocking_issue) {
    pcSetAlignmentMessage(`Alignment cannot be confirmed while this blocker remains: ${entry.blocking_issue}`, "is-error");
    return;
  }
  const previousStatus = entry.alignment_status;
  pcSelectedAmendmentIds.delete(entry.amendment_id);
  const priorDecisionId = entry.active_alignment_decision_id || null;
  let nextStatus = assessment.machine_status;
  if (action === "Confirm Alignment") nextStatus = "Human Confirmed";
  if (action === "Reject Alignment") nextStatus = "Rejected";
  if (action === "Mark Ambiguous") nextStatus = "Ambiguous";
  const historyEvent = pcRecordHistory({
    sourceDocumentId: entry.pc_source_document_id,
    amendmentId,
    previousStatus,
    newStatus: nextStatus,
    action,
    actor: "User",
    notes: `Machine result retained as ${assessment.machine_status}.`
  });
  const decision = {
    alignment_decision_id: createPcId("alignment_decision"),
    amendment_id: amendmentId,
    alignment_assessment_id: assessment.alignment_assessment_id,
    action,
    previous_alignment_status: previousStatus,
    new_alignment_status: nextStatus,
    confirmed_target_clause_id: action === "Confirm Alignment" ? entry.proposed_target_gc_clause_id : null,
    confirmed_target_clause_number: action === "Confirm Alignment" ? entry.proposed_target_gc_clause_number : null,
    confirmed_target_heading: action === "Confirm Alignment" ? entry.proposed_target_gc_heading : null,
    decided_at: pcNow(),
    decided_by: "User",
    reason: action === "Clear Manual Decision" ? "Manual override cleared; latest machine result restored." : null,
    supersedes_decision_id: priorDecisionId,
    processing_history_event_id: historyEvent?.event_id || null
  };
  pcReviewData.alignment_decisions.push(decision);
  pcReviewData.project.alignment_decision_ids.push(decision.alignment_decision_id);
  if (action === "Clear Manual Decision") {
    entry.active_alignment_decision_id = null;
    entry.manual_alignment_status = null;
    entry.manual_alignment_decision = null;
    entry.manual_alignment_at = null;
    entry.manual_alignment_by = null;
    entry.alignment_status = assessment.machine_status;
  } else {
    entry.active_alignment_decision_id = decision.alignment_decision_id;
    entry.manual_alignment_status = nextStatus;
    entry.manual_alignment_decision = action;
    entry.manual_alignment_at = decision.decided_at;
    entry.manual_alignment_by = decision.decided_by;
    entry.alignment_status = nextStatus;
  }
  entry.human_review_required = !["Exact Match", "Human Confirmed", "Rejected"].includes(entry.alignment_status);
  if (action === "Reject Alignment") {
    entry.application_status = "Rejected";
    pcAppendApplicationLog({ entry, record: null, attemptType: "Reject", applicationResult: "Rejected", failureReason: "Alignment rejected by human reviewer." });
    pcReviewData.effective_clauses.forEach((record) => {
      record.failed_amendment_ids = (record.failed_amendment_ids || []).filter((id) => id !== entry.amendment_id);
      record.unresolved_issues = (record.unresolved_issues || []).filter((issue) => issue?.amendment_id !== entry.amendment_id);
    });
  } else if (action === "Clear Manual Decision" && entry.application_status === "Rejected") {
    entry.application_status = pcBaseUnappliedApplicationStatus(entry);
  }
  const decisionTargetId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id;
  const decisionTargetNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number;
  pcReviewData.effective_clauses
    .filter((record) => (record.amendment_ids || []).includes(entry.amendment_id)
      || (decisionTargetId && record.baseline_clause_id === decisionTargetId)
      || (decisionTargetNumber && record.clause_number === String(decisionTargetNumber)))
    .forEach(pcRefreshEffectiveClauseDerivedStatus);
  pcSetAlignmentMessage(`${action} recorded for ${entry.amendment_id}. Machine result ${assessment.machine_status} remains in the audit record.`, "is-success");
  updatePcProjectSummary();
}

function pcFindEffectiveClauseForAmendment(entry) {
  if (!entry) return null;
  const baselineId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id;
  const number = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number;
  const matchesCanonicalTarget = (record) => Boolean(record)
    && (!baselineId || record.baseline_clause_id === baselineId)
    && (!number || record.clause_number === String(number));
  if (!baselineId && !number) return null;
  const candidates = pcReviewData.effective_clauses.filter(matchesCanonicalTarget);
  if (candidates.length !== 1) return null;
  const candidate = candidates[0];
  if (entry.effective_clause_id && candidate.effective_clause_id !== entry.effective_clause_id) return null;
  return candidate;
}

function pcLinkEffectiveClause(entry, record) {
  if (!entry || !record?.effective_clause_id) return record;
  record.amendment_ids = [...new Set([...(record.amendment_ids || []), entry.amendment_id])];
  entry.effective_clause_id = record.effective_clause_id;
  return record;
}

function pcReassessPendingClauseAmendments(record, changedAmendmentId) {
  if (!record) return;
  pcReviewData.amendments.forEach((candidate) => {
    const targetId = candidate.proposed_target_gc_clause_id || candidate.target_gc_clause_id;
    const targetNumber = candidate.proposed_target_gc_clause_number || candidate.target_gc_clause_number;
    const sameClause = (record.baseline_clause_id && targetId === record.baseline_clause_id)
      || targetNumber === record.clause_number;
    if (sameClause && pcApplicationPreviews.has(candidate.amendment_id)) {
      pcApplicationPreviews.delete(candidate.amendment_id);
      if (candidate.application_status === "Previewed") {
        const reason = "The prior preview was invalidated by a newer Effective Clause version and must be generated again.";
        pcAppendApplicationLog({ entry: candidate, record, attemptType: "Preview", applicationResult: "Failed", failureReason: reason });
        candidate.application_status = "Failed";
        pcRecordHistory({ sourceDocumentId: candidate.pc_source_document_id, amendmentId: candidate.amendment_id, previousStatus: "Previewed", newStatus: "Failed", action: "Stale application preview invalidated", actor: "Browser prototype", notes: reason });
      }
    }
    if (candidate.amendment_id === changedAmendmentId || candidate.application_status === "Rejected" || pcHasActiveApplication(candidate.amendment_id)) return;
    if (sameClause && ["Clause-specific Amendment", "New Clause"].includes(candidate.amendment_category)) {
      pcEvaluateAmendmentAlignment(candidate, { recordHistory: false });
    }
  });
  pcReviewData.effective_clauses.forEach(pcRefreshEffectiveClauseDerivedStatus);
}

function pcHasPendingClauseAmendments(record) {
  return pcReviewData.amendments.some((candidate) => {
    const targetId = candidate.proposed_target_gc_clause_id || candidate.target_gc_clause_id;
    const targetNumber = candidate.proposed_target_gc_clause_number || candidate.target_gc_clause_number;
    const sameClause = (record.baseline_clause_id && targetId === record.baseline_clause_id)
      || targetNumber === record.clause_number;
    return sameClause
      && ["Clause-specific Amendment", "New Clause"].includes(candidate.amendment_category)
      && !(record.applied_amendment_ids || []).includes(candidate.amendment_id)
      && !["Applied", "Rejected"].includes(candidate.application_status);
  });
}

function pcCreateEffectiveClause(entry, { persist = true } = {}) {
  const existing = pcFindEffectiveClauseForAmendment(entry);
  if (existing) return pcLinkEffectiveClause(entry, existing);
  const canonicalBaselineId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id || null;
  const canonicalNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number || null;
  const canonicalCollision = pcReviewData.effective_clauses.some((record) => (canonicalBaselineId && record.baseline_clause_id === canonicalBaselineId)
    || (canonicalNumber && record.clause_number === String(canonicalNumber)));
  if (canonicalCollision) return null;
  const isNew = entry.amendment_operation === "Add New Sub-Clause" || entry.amendment_category === "New Clause";
  const baseline = isNew ? null : pcBaselineClauseForAmendment(entry);
  const number = isNew ? entry.target_gc_clause_number : baseline?.clause_no;
  if (!number || (!isNew && !baseline)) return null;
  const baselineIndex = fidicSourceLayer ? PCAlignmentEngine.buildBaselineIndex(fidicSourceLayer) : null;
  if (isNew && baselineIndex?.byNumber.has(String(number))) return null;
  const timestamp = pcNow();
  const initialText = baseline?.full_text || "";
  const initialVersionId = persist ? createPcId("effective_version") : (baseline ? `baseline:${baseline.id}` : `new:${number}:pending`);
  const record = {
    effective_clause_id: persist ? createPcId("effective_clause") : null,
    project_id: pcReviewData.project.project_id,
    baseline_clause_id: baseline?.id || null,
    clause_number: String(number),
    clause_heading: baseline?.clause_title || entry.target_gc_heading || entry.pc_clause_heading || null,
    parent_clause_number: baseline?.parent_clause_no || PCAlignmentEngine.parentNumber(entry.parent_clause || number),
    baseline_original_order: baseline?.original_order ?? null,
    effective_order_key: baseline?.original_order ?? String(number),
    baseline_text: baseline?.full_text ?? null,
    current_effective_text: initialText,
    current_version_id: initialVersionId,
    current_version_number: 0,
    amendment_ids: [entry.amendment_id],
    applied_amendment_ids: [],
    failed_amendment_ids: [],
    clause_status: "Amendment Pending",
    baseline_verification_status: baseline?.pdf_verification_status || baseline?.verification_status || fidicSourceLayer?.verification_status || "Not Verified",
    effective_verification_status: "Not Verified",
    publication_eligible: false,
    is_tombstone: false,
    version_history: [{
      version_id: initialVersionId,
      version_number: 0,
      parent_version_id: null,
      version_event: baseline ? "Baseline" : "New Clause Pending",
      created_by_application_id: null,
      text: initialText,
      active_amendment_ids: [],
      structured_change_segments: [],
      created_at: timestamp,
      created_by: "Browser prototype"
    }],
    structured_change_segments: [],
    unresolved_issues: [],
    created_at: timestamp,
    updated_at: timestamp
  };
  if (persist) {
    pcReviewData.effective_clauses.push(record);
    pcReviewData.project.effective_clause_ids.push(record.effective_clause_id);
    pcLinkEffectiveClause(entry, record);
  }
  return record;
}

function pcEligibilityForAmendment(entry) {
  const record = pcFindEffectiveClauseForAmendment(entry);
  const resolvedEntry = pcResolvedEligibilityEntry(entry);
  const resolvedAmendments = pcReviewData.amendments.map(pcResolvedEligibilityEntry);
  const base = PCAlignmentEngine.getEligibility(resolvedEntry, fidicSourceLayer, record, resolvedAmendments);
  const reasons = [...base.reasons];
  if (entry.alignment_status === "Rejected" || entry.application_status === "Rejected") reasons.push("This amendment remains rejected until the human decision is explicitly cleared.");
  const sourceIntegrity = pcControlledBaselineIntegrity(record);
  if (!sourceIntegrity.ok) reasons.push(sourceIntegrity.reason);
  if (entry.amendment_operation === "Add New Sub-Clause") {
    const proposedNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number;
    const occupiedEffective = proposedNumber && pcReviewData.effective_clauses.find((candidate) => candidate.clause_number === String(proposedNumber));
    if (occupiedEffective && !(occupiedEffective.amendment_ids || []).includes(entry.amendment_id)) {
      reasons.push(`Proposed new Sub-Clause ${proposedNumber} is already reserved by an existing Effective Clause audit record.`);
    }
  }
  const assessment = pcActiveAssessment(entry);
  if (!assessment) {
    reasons.push("A current machine alignment assessment is required.");
  } else {
    const currentSourceHash = fidicSourceLayer?.source_sha256 || null;
    if (assessment.baseline_source_sha256 !== currentSourceHash
      || assessment.baseline_source_layer_sha256 !== fidicSourceLayer?.runtime_source_layer_sha256) {
      reasons.push("The active alignment assessment was produced against a different baseline source identity or processed source layer.");
    }
    const asserted = assessment.asserted_target || {};
    if ((asserted.parent_clause ?? null) !== (entry.parent_clause ?? null)
      || (asserted.target_gc_clause_number ?? null) !== (entry.target_gc_clause_number ?? null)
      || (asserted.target_gc_heading ?? null) !== (entry.target_gc_heading ?? null)
      || (asserted.target_text ?? null) !== (entry.target_text ?? null)
      || assessment.amendment_operation !== entry.amendment_operation
      || assessment.target_basis !== entry.target_basis
      || (assessment.target_location ?? null) !== (entry.target_location ?? null)
      || (assessment.replacement_or_added_text ?? null) !== (entry.replacement_or_added_text ?? null)
      || Number(assessment.sequence_number) !== Number(entry.sequence_number)) {
      reasons.push("The active alignment assessment is stale because an asserted field or exact operand changed.");
    }
    const fresh = PCAlignmentEngine.alignAmendment(entry, fidicSourceLayer, pcReviewData.project, pcReviewData.amendments, pcReviewData.effective_clauses);
    const sameProposedTarget = (assessment.proposed_target?.clause_id || null) === (fresh.proposed_target_gc_clause_id || null)
      && (assessment.proposed_target?.clause_number || null) === (fresh.proposed_target_gc_clause_number || null);
    if (fresh.machine_alignment_status !== assessment.machine_status || !sameProposedTarget) reasons.push("The active alignment assessment is stale against the current source/effective version.");
    if (entry.alignment_status === "Exact Match" && fresh.machine_alignment_status !== "Exact Match") reasons.push("Exact Match must be reproduced by the current deterministic assessment.");
    if (entry.alignment_status === "Human Confirmed") {
      const decision = pcReviewData.alignment_decisions.find((item) => item.alignment_decision_id === entry.active_alignment_decision_id);
      if (!decision || decision.action !== "Confirm Alignment" || decision.alignment_assessment_id !== assessment.alignment_assessment_id
        || (decision.confirmed_target_clause_id || null) !== (fresh.proposed_target_gc_clause_id || null)
        || (decision.confirmed_target_clause_number || null) !== (fresh.proposed_target_gc_clause_number || null)) {
        reasons.push("Human Confirmed requires a current confirmation decision for the same machine assessment and target.");
      }
      if (fresh.blocking_issue || fresh.machine_alignment_status === "Blocking Dependency") reasons.push("Human confirmation cannot override a blocking dependency or non-unique exact anchor.");
    }
  }
  if (entry.amendment_category !== "New Clause") {
    if (!entry.parent_clause) reasons.push("The asserted parent clause is required before application.");
    if (!entry.target_gc_heading) reasons.push("The asserted GC Sub-Clause heading is required before application.");
  }
  const targetId = entry.proposed_target_gc_clause_id || entry.target_gc_clause_id;
  const targetNumber = entry.proposed_target_gc_clause_number || entry.target_gc_clause_number;
  const earlierPending = pcReviewData.amendments.filter((candidate) => {
    if (candidate.amendment_id === entry.amendment_id || !Number.isInteger(Number(candidate.sequence_number))) return false;
    const sameTarget = targetId
      ? (candidate.proposed_target_gc_clause_id || candidate.target_gc_clause_id) === targetId
      : targetNumber && (candidate.proposed_target_gc_clause_number || candidate.target_gc_clause_number) === targetNumber;
    return sameTarget
      && Number(candidate.sequence_number) < Number(entry.sequence_number)
      && ["Clause-specific Amendment", "New Clause"].includes(candidate.amendment_category)
      && candidate.application_status !== "Applied"
      && candidate.application_status !== "Rolled Back"
      && candidate.alignment_status !== "Rejected";
  });
  if (earlierPending.length) reasons.push(`Earlier sequence amendment(s) remain pending: ${earlierPending.map((item) => item.amendment_id).join(", ")}.`);
  const laterActive = pcReviewData.amendments.filter((candidate) => {
    if (candidate.amendment_id === entry.amendment_id) return false;
    const sameTarget = targetId
      ? (candidate.proposed_target_gc_clause_id || candidate.target_gc_clause_id) === targetId
      : targetNumber && (candidate.proposed_target_gc_clause_number || candidate.target_gc_clause_number) === targetNumber;
    return sameTarget
      && Number(candidate.sequence_number) > Number(entry.sequence_number)
      && pcHasActiveApplication(candidate.amendment_id);
  });
  if (laterActive.length) reasons.push(`Later sequence amendment(s) are already active: ${laterActive.map((item) => item.amendment_id).join(", ")}. Roll them back before re-applying this earlier step.`);
  return { eligible: reasons.length === 0, reasons: [...new Set(reasons)] };
}

function pcFailureCode(reason, occurrenceCount) {
  if (occurrenceCount === 0) return "ZERO_TARGET_MATCHES";
  if (occurrenceCount > 1) return "MULTIPLE_TARGET_MATCHES";
  if (/target basis/i.test(reason || "")) return "TARGET_BASIS_UNCLEAR";
  if (/Not Yet Supported/i.test(reason || "")) return "UNSUPPORTED_OPERATION";
  if (/dependency/i.test(reason || "")) return "BLOCKING_DEPENDENCY";
  if (/already exists|occupied/i.test(reason || "")) return "NEW_CLAUSE_NUMBER_OCCUPIED";
  if (/sequence/i.test(reason || "")) return "SEQUENCE_UNKNOWN";
  return "ALIGNMENT_INELIGIBLE";
}

function pcEnrichSegments(segments, entry, applicationId, versionNumber) {
  return (segments || []).map((segment, index) => ({
    segment_id: createPcId("change_segment"),
    order: index,
    ...segment,
    source_amendment_id: entry.amendment_id,
    source_application_id: applicationId,
    version_number: versionNumber
  }));
}

function pcBuildCumulativeSegments(baselineText, currentText, entry, applicationId, versionNumber) {
  const before = String(baselineText ?? "");
  const after = String(currentText ?? "");
  if (before === after) return [];
  let prefixLength = 0;
  while (prefixLength < before.length && prefixLength < after.length && before[prefixLength] === after[prefixLength]) prefixLength += 1;
  let suffixLength = 0;
  while (suffixLength < before.length - prefixLength
    && suffixLength < after.length - prefixLength
    && before[before.length - 1 - suffixLength] === after[after.length - 1 - suffixLength]) suffixLength += 1;
  const prefix = before.slice(0, prefixLength);
  const beforeMiddle = before.slice(prefixLength, before.length - suffixLength);
  const afterMiddle = after.slice(prefixLength, after.length - suffixLength);
  const suffix = suffixLength ? before.slice(before.length - suffixLength) : "";
  const changed = beforeMiddle && afterMiddle
    ? { segment_type: "replaced", original_text: beforeMiddle, text: afterMiddle }
    : (beforeMiddle ? { segment_type: "deleted", text: beforeMiddle } : { segment_type: "added", text: afterMiddle });
  return pcEnrichSegments([
    prefix ? { segment_type: "unchanged", text: prefix } : null,
    changed,
    suffix ? { segment_type: "unchanged", text: suffix } : null
  ].filter(Boolean), entry, applicationId, versionNumber);
}

function pcAppendApplicationLog({ entry, record, attemptType, applicationResult, operationResult = null, inputVersion = null, outputVersion = null, outputVersionNumber = null, failureReason = null, reversesApplicationId = null }) {
  const applicationId = createPcId("application");
  const timestamp = pcNow();
  const occurrenceCount = operationResult?.occurrenceCount ?? null;
  const log = {
    application_id: applicationId,
    amendment_id: entry.amendment_id,
    effective_clause_id: record?.effective_clause_id || null,
    attempt_type: attemptType,
    operation: entry.amendment_operation,
    amendment_category: entry.amendment_category,
    target_basis: entry.target_basis || "Unclear",
    input_version: inputVersion ?? record?.current_version_id ?? null,
    target_clause_id: entry.proposed_target_gc_clause_id || entry.target_gc_clause_id || null,
    target_clause_number: entry.proposed_target_gc_clause_number || entry.target_gc_clause_number || null,
    target_text: entry.target_text ?? null,
    replacement_or_added_text: entry.replacement_or_added_text ?? null,
    target_location: entry.target_location ?? null,
    sequence_number: entry.sequence_number ?? null,
    target_occurrence_count: occurrenceCount,
    output_version: outputVersion ?? null,
    output_text: operationResult?.outputText ?? null,
    application_result: applicationResult,
    failure_code: applicationResult === "Failed" ? pcFailureCode(failureReason || operationResult?.failureReason, occurrenceCount) : null,
    failure_reason: failureReason || operationResult?.failureReason || null,
    change_segments: [],
    attempted_at: timestamp,
    applied_at: ["Applied", "Rolled Back"].includes(applicationResult) ? timestamp : null,
    applied_by: "User",
    rollback_available: applicationResult === "Applied",
    rolled_back_at: null,
    reverses_application_id: reversesApplicationId,
    verification_status: "Not Verified"
  };
  log.change_segments = pcEnrichSegments(operationResult?.segments || [], entry, applicationId, outputVersionNumber ?? record?.current_version_number ?? 0);
  pcReviewData.application_log.push(log);
  pcReviewData.project.application_ids.push(applicationId);
  return log;
}

function pcComputeOperation(entry, record) {
  const baselineText = record.baseline_text ?? "";
  const currentText = record.current_effective_text ?? "";
  const exactOperation = PCAlignmentEngine.EXACT_TARGET_OPERATIONS.includes(entry.amendment_operation)
    || (PCAlignmentEngine.WHOLE_CLAUSE_OPERATIONS.includes(entry.amendment_operation) && Boolean(entry.target_text));
  const basisText = entry.target_basis === "Current Effective Text" ? currentText : baselineText;
  if (exactOperation) {
    const basisCount = PCAlignmentEngine.countExactOccurrences(basisText, entry.target_text);
    if (basisCount !== 1) {
      return { ok: false, outputText: currentText, occurrenceCount: basisCount, segments: [], failureReason: `Exact target occurrence count is ${basisCount} in the selected target-basis version; exactly one is required.`, clauseStatus: "Application Failed" };
    }
    if (entry.target_basis === "Original Baseline Text" && currentText !== baselineText) {
      const currentCount = PCAlignmentEngine.countExactOccurrences(currentText, entry.target_text);
      if (currentCount !== 1) {
        return { ok: false, outputText: currentText, occurrenceCount: currentCount, segments: [], failureReason: `The original-baseline target occurs ${currentCount} times in the current effective version and cannot be projected safely.`, clauseStatus: "Application Failed" };
      }
    }
  }
  const numberOccupied = entry.amendment_operation === "Add New Sub-Clause"
    && Boolean(fidicSourceLayer && PCAlignmentEngine.buildBaselineIndex(fidicSourceLayer).byNumber.has(String(entry.target_gc_clause_number)));
  return PCAlignmentEngine.applyOperation(
    entry.amendment_operation,
    currentText,
    entry.target_text,
    entry.replacement_or_added_text,
    entry.target_location,
    { targetOccupied: numberOccupied, targetExists: Boolean(record.baseline_clause_id || currentText) }
  );
}

function pcMarkApplicationFailure(entry, record, result, reason, attemptType) {
  if (record && attemptType !== "Preview") {
    if (!record.failed_amendment_ids.includes(entry.amendment_id)) record.failed_amendment_ids.push(entry.amendment_id);
    record.unresolved_issues.push({ amendment_id: entry.amendment_id, issue: reason, recorded_at: pcNow() });
    record.clause_status = record.applied_amendment_ids.length ? "Partially Applied" : "Application Failed";
    record.updated_at = pcNow();
  }
  entry.application_status = "Failed";
  const log = pcAppendApplicationLog({ entry, record, attemptType, applicationResult: "Failed", operationResult: result, failureReason: reason });
  pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Application attempted", newStatus: "Failed", action: `${attemptType} failed safely`, actor: "User", notes: reason });
  return log;
}

function pcAttemptApplication(amendmentId, attemptType = "Apply", { render = true } = {}) {
  const entry = pcReviewData.amendments.find((item) => item.amendment_id === amendmentId);
  if (!entry) return { ok: false, reason: "Amendment not found." };
  if (pcHasActiveApplication(entry.amendment_id)) {
    const record = pcFindEffectiveClauseForAmendment(entry);
    const reason = "This amendment is already actively applied. Roll it back before another preview or application attempt.";
    pcAppendApplicationLog({ entry, record, attemptType, applicationResult: "Failed", failureReason: reason });
    pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Applied", newStatus: "Applied", action: `${attemptType} rejected without changing active application state`, actor: "User", notes: reason });
    pcSetWorkbenchMessage(reason, "is-error");
    if (render) updatePcProjectSummary();
    return { ok: false, reason };
  }
  const eligibility = pcEligibilityForAmendment(entry);
  let record = pcFindEffectiveClauseForAmendment(entry);
  if (!eligibility.eligible) {
    const reason = eligibility.reasons.join(" ");
    pcMarkApplicationFailure(entry, record, { occurrenceCount: null, segments: [], outputText: record?.current_effective_text || "" }, reason, attemptType);
    const baseStatus = pcBaseUnappliedApplicationStatus(entry);
    if (baseStatus !== "Not Assessed") entry.application_status = baseStatus;
    pcSetWorkbenchMessage(`${attemptType} failed safely: ${reason}`, "is-error");
    if (render) updatePcProjectSummary();
    return { ok: false, reason };
  }
  const persistedRecord = record;
  record = record || pcCreateEffectiveClause(entry, { persist: false });
  if (!record) {
    const reason = "The exact Effective Clause target could not be created without a controlled baseline record.";
    pcMarkApplicationFailure(entry, null, { occurrenceCount: null, segments: [], outputText: "" }, reason, attemptType);
    pcSetWorkbenchMessage(`${attemptType} failed safely: ${reason}`, "is-error");
    if (render) updatePcProjectSummary();
    return { ok: false, reason };
  }
  const previewInputVersion = record.current_version_id;
  const result = pcComputeOperation(entry, record);
  if (!result.ok) {
    pcMarkApplicationFailure(entry, persistedRecord, result, result.failureReason, attemptType);
    pcSetWorkbenchMessage(`${attemptType} failed safely: ${result.failureReason}`, "is-error");
    if (render) updatePcProjectSummary();
    return { ok: false, reason: result.failureReason };
  }
  if (attemptType === "Preview") {
    const log = pcAppendApplicationLog({ entry, record: persistedRecord, attemptType, applicationResult: "Previewed", operationResult: result, inputVersion: previewInputVersion, outputVersion: `preview-${record.current_version_number + 1}`, outputVersionNumber: record.current_version_number + 1 });
    pcApplicationPreviews.set(entry.amendment_id, { ...result, application_id: log.application_id, created_at: log.attempted_at });
    entry.application_status = "Previewed";
    pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Eligible", newStatus: "Previewed", action: "Application preview generated", actor: "User" });
    pcSetWorkbenchMessage(`Preview generated for ${entry.amendment_id}. The Effective Clause and baseline were not changed.`, "is-success");
    if (render) updatePcProjectSummary();
    return { ok: true, preview: true, result };
  }
  if (!persistedRecord) {
    record = pcCreateEffectiveClause(entry, { persist: true });
    if (!record) {
      const reason = "The Effective Clause target became unavailable before the deterministic result could be committed.";
      pcMarkApplicationFailure(entry, null, result, reason, attemptType);
      pcSetWorkbenchMessage(`${attemptType} failed safely: ${reason}`, "is-error");
      if (render) updatePcProjectSummary();
      return { ok: false, reason };
    }
  } else {
    pcLinkEffectiveClause(entry, record);
  }
  const inputVersion = record.current_version_id;
  const nextVersionNumber = record.current_version_number + 1;
  const nextVersionId = createPcId("effective_version");
  const log = pcAppendApplicationLog({ entry, record, attemptType: "Apply", applicationResult: "Applied", operationResult: result, inputVersion, outputVersion: nextVersionId, outputVersionNumber: nextVersionNumber });
  const enrichedSegments = pcEnrichSegments(result.segments, entry, log.application_id, nextVersionNumber);
  const priorVersionId = record.current_version_id;
  record.current_effective_text = result.outputText;
  record.current_version_id = nextVersionId;
  record.current_version_number = nextVersionNumber;
  if (!record.applied_amendment_ids.includes(entry.amendment_id)) record.applied_amendment_ids.push(entry.amendment_id);
  record.failed_amendment_ids = record.failed_amendment_ids.filter((id) => id !== entry.amendment_id);
  record.structured_change_segments = pcBuildCumulativeSegments(record.baseline_text ?? "", result.outputText, entry, log.application_id, nextVersionNumber);
  record.clause_status = record.failed_amendment_ids.length || pcHasPendingClauseAmendments(record) ? "Partially Applied" : result.clauseStatus;
  record.is_tombstone = result.clauseStatus === "Deleted";
  record.version_history.push({
    version_id: nextVersionId,
    version_number: nextVersionNumber,
    parent_version_id: priorVersionId,
    version_event: result.clauseStatus === "New" ? "New Clause Created" : (result.clauseStatus === "Deleted" ? "Tombstone" : "Applied"),
    created_by_application_id: log.application_id,
    text: result.outputText,
    active_amendment_ids: [...record.applied_amendment_ids],
    structured_change_segments: enrichedSegments,
    created_at: log.applied_at,
    created_by: "User"
  });
  record.updated_at = log.applied_at;
  entry.application_status = "Applied";
  entry.effective_clause_id = record.effective_clause_id;
  pcSelectedAmendmentIds.delete(entry.amendment_id);
  pcApplicationPreviews.delete(entry.amendment_id);
  pcReviewData.project.project_status = "Clause-specific Consolidation";
  pcReassessPendingClauseAmendments(record, entry.amendment_id);
  pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Eligible", newStatus: "Applied", action: "Clause-specific amendment applied to separate Effective Clause", actor: "User", notes: `Baseline remained unchanged; output version ${nextVersionNumber}.` });
  pcSetWorkbenchMessage(`${entry.amendment_id} applied to separate Effective Clause version ${nextVersionNumber}. Verification remains Not Verified.`, "is-success");
  if (render) updatePcProjectSummary();
  return { ok: true, preview: false, result, log };
}

function pcApplySelectedAmendments() {
  const selected = pcReviewData.amendments
    .filter((entry) => pcSelectedAmendmentIds.has(entry.amendment_id))
    .sort((a, b) => Number(a.sequence_number || Infinity) - Number(b.sequence_number || Infinity));
  if (!selected.length) {
    pcSetWorkbenchMessage("Select eligible amendments in the Clause Alignment queue first.", "is-warning");
    return;
  }
  let applied = 0;
  let failed = 0;
  let skipped = 0;
  selected.forEach((entry) => {
    if (!pcEligibilityForAmendment(entry).eligible) {
      pcSelectedAmendmentIds.delete(entry.amendment_id);
      skipped += 1;
      return;
    }
    const result = pcAttemptApplication(entry.amendment_id, "Apply", { render: false });
    if (result.ok) {
      applied += 1;
      pcSelectedAmendmentIds.delete(entry.amendment_id);
    } else failed += 1;
  });
  pcSetWorkbenchMessage(`Selected batch finished: ${applied} applied; ${failed} failed safely; ${skipped} skipped because no longer eligible. No unselected amendment was processed.`, failed || skipped ? "is-warning" : "is-success");
  updatePcProjectSummary();
}

function pcReplayEffectiveClause(record, excludedApplicationId) {
  const activeLogs = pcReviewData.application_log
    .filter((log) => log.effective_clause_id === record.effective_clause_id && log.application_result === "Applied" && !log.rolled_back_at && log.application_id !== excludedApplicationId)
    .sort((a, b) => {
      return Number(a.sequence_number || Infinity) - Number(b.sequence_number || Infinity)
        || pcReviewData.application_log.indexOf(a) - pcReviewData.application_log.indexOf(b);
    });
  let currentText = record.baseline_text ?? "";
  const appliedIds = [];
  const segments = [];
  let finalStatus = record.baseline_clause_id ? "Unchanged" : "Amendment Pending";
  for (const log of activeLogs) {
    const entry = pcReviewData.amendments.find((item) => item.amendment_id === log.amendment_id);
    if (!entry) return { ok: false, reason: `Amendment ${log.amendment_id} is missing; downstream replay was not committed.` };
    const snapshot = {
      amendment_id: log.amendment_id,
      amendment_operation: log.operation,
      target_basis: log.target_basis,
      target_text: log.target_text,
      replacement_or_added_text: log.replacement_or_added_text,
      target_location: log.target_location,
      sequence_number: log.sequence_number
    };
    const versionIds = new Set(record.version_history.map((version) => version.version_id));
    const targetMismatch = (log.target_clause_id ?? null) !== (record.baseline_clause_id ?? null)
      || String(log.target_clause_number ?? "") !== record.clause_number;
    if (targetMismatch || !versionIds.has(log.input_version) || !versionIds.has(log.output_version)) {
      return { ok: false, reason: `Applied log ${log.application_id} is not bound to this Effective Clause and version chain; replay was not committed.` };
    }
    if (!PC_SUPPORTED_OPERATIONS.includes(snapshot.amendment_operation) || !PC_TARGET_BASES.includes(snapshot.target_basis) || !Number.isInteger(Number(snapshot.sequence_number)) || Number(snapshot.sequence_number) < 1) {
      return { ok: false, reason: `Applied log ${log.application_id} lacks a complete immutable operand snapshot; replay was not committed.` };
    }
    const basisText = snapshot.target_basis === "Current Effective Text" ? currentText : (record.baseline_text ?? "");
    const validatesTarget = PCAlignmentEngine.EXACT_TARGET_OPERATIONS.includes(snapshot.amendment_operation)
      || (PCAlignmentEngine.WHOLE_CLAUSE_OPERATIONS.includes(snapshot.amendment_operation) && Boolean(snapshot.target_text));
    if (validatesTarget) {
      const basisCount = PCAlignmentEngine.countExactOccurrences(basisText, snapshot.target_text);
      const currentCount = PCAlignmentEngine.countExactOccurrences(currentText, snapshot.target_text);
      if (basisCount !== 1 || (snapshot.target_basis === "Original Baseline Text" && currentCount !== 1)) {
        return { ok: false, reason: `Downstream replay of ${snapshot.amendment_id} failed its exact target-basis check.` };
      }
    }
    const operation = PCAlignmentEngine.applyOperation(snapshot.amendment_operation, currentText, snapshot.target_text, snapshot.replacement_or_added_text, snapshot.target_location, {
      targetOccupied: snapshot.amendment_operation === "Add New Sub-Clause" && Boolean(currentText),
      targetExists: Boolean(record.baseline_clause_id || currentText)
    });
    if (!operation.ok) return { ok: false, reason: `Downstream replay of ${snapshot.amendment_id} failed: ${operation.failureReason}` };
    currentText = operation.outputText;
    appliedIds.push(snapshot.amendment_id);
    finalStatus = operation.clauseStatus;
    segments.push(...pcEnrichSegments(operation.segments, snapshot, log.application_id, record.current_version_number + 1));
  }
  return { ok: true, currentText, appliedIds, segments, finalStatus, activeLogs };
}

function pcRollbackApplication(applicationId) {
  const originalLog = pcReviewData.application_log.find((log) => log.application_id === applicationId);
  if (!originalLog || originalLog.application_result !== "Applied" || originalLog.rolled_back_at || !originalLog.rollback_available) {
    pcSetWorkbenchMessage("This application is not currently available for rollback.", "is-error");
    return;
  }
  const entry = pcReviewData.amendments.find((item) => item.amendment_id === originalLog.amendment_id);
  const record = pcReviewData.effective_clauses.find((item) => item.effective_clause_id === originalLog.effective_clause_id);
  if (!entry || !record) {
    pcSetWorkbenchMessage("Rollback failed safely because its amendment or Effective Clause record is missing.", "is-error");
    return;
  }
  const sourceIntegrity = pcControlledBaselineIntegrity(record);
  if (!sourceIntegrity.ok) {
    pcAppendApplicationLog({ entry, record, attemptType: "Rollback", applicationResult: "Failed", failureReason: sourceIntegrity.reason, reversesApplicationId: applicationId });
    pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Applied", newStatus: "Failed", action: "Rollback blocked without changing Effective Clause", actor: "User", notes: sourceIntegrity.reason });
    pcSetWorkbenchMessage(`Rollback failed safely: ${sourceIntegrity.reason}`, "is-error");
    updatePcProjectSummary();
    return;
  }
  const replay = pcReplayEffectiveClause(record, applicationId);
  if (!replay.ok) {
    pcAppendApplicationLog({ entry, record, attemptType: "Rollback", applicationResult: "Failed", failureReason: replay.reason, reversesApplicationId: applicationId });
    pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Applied", newStatus: "Failed", action: "Rollback failed without changing Effective Clause", actor: "User", notes: replay.reason });
    pcSetWorkbenchMessage(`Rollback failed safely: ${replay.reason}`, "is-error");
    updatePcProjectSummary();
    return;
  }
  const previousText = record.current_effective_text;
  const previousVersionId = record.current_version_id;
  const nextVersionNumber = record.current_version_number + 1;
  const nextVersionId = createPcId("effective_version");
  const rollbackSegments = previousText === replay.currentText ? [] : [{ segment_type: "replaced", original_text: previousText, text: replay.currentText }];
  const rollbackResult = { ok: true, outputText: replay.currentText, occurrenceCount: 1, segments: rollbackSegments, failureReason: null, clauseStatus: replay.finalStatus };
  const rollbackLog = pcAppendApplicationLog({ entry, record, attemptType: "Rollback", applicationResult: "Rolled Back", operationResult: rollbackResult, inputVersion: previousVersionId, outputVersion: nextVersionId, outputVersionNumber: nextVersionNumber, reversesApplicationId: applicationId });
  originalLog.rolled_back_at = rollbackLog.applied_at;
  originalLog.rollback_available = false;
  record.current_effective_text = replay.currentText;
  record.current_version_id = nextVersionId;
  record.current_version_number = nextVersionNumber;
  record.applied_amendment_ids = replay.appliedIds;
  record.structured_change_segments = pcBuildCumulativeSegments(record.baseline_text ?? "", replay.currentText, entry, rollbackLog.application_id, nextVersionNumber);
  entry.application_status = "Rolled Back";
  const noActiveNewClause = !record.baseline_clause_id && replay.appliedIds.length === 0;
  const hasPendingAmendments = pcHasPendingClauseAmendments(record);
  record.is_tombstone = replay.finalStatus === "Deleted" || noActiveNewClause;
  record.clause_status = record.failed_amendment_ids.length
    ? (replay.appliedIds.length ? "Partially Applied" : "Application Failed")
    : (noActiveNewClause ? "Deleted" : (hasPendingAmendments ? (replay.appliedIds.length ? "Partially Applied" : "Amendment Pending") : replay.finalStatus));
  if (noActiveNewClause) record.unresolved_issues.push({ amendment_id: entry.amendment_id, issue: "New-clause application rolled back; retained as a tombstone audit record.", recorded_at: rollbackLog.applied_at });
  record.version_history.push({
    version_id: nextVersionId,
    version_number: nextVersionNumber,
    parent_version_id: previousVersionId,
    version_event: "Rollback",
    created_by_application_id: rollbackLog.application_id,
    reverses_application_id: applicationId,
    text: replay.currentText,
    active_amendment_ids: [...replay.appliedIds],
    structured_change_segments: rollbackLog.change_segments,
    created_at: rollbackLog.applied_at,
    created_by: "User"
  });
  record.updated_at = rollbackLog.applied_at;
  pcReassessPendingClauseAmendments(record, entry.amendment_id);
  pcApplicationPreviews.delete(entry.amendment_id);
  pcRecordHistory({ sourceDocumentId: entry.pc_source_document_id, amendmentId: entry.amendment_id, previousStatus: "Applied", newStatus: "Rolled Back", action: "Application rolled back by baseline replay", actor: "User", notes: `Effective version ${nextVersionNumber}; baseline unchanged.` });
  pcSetWorkbenchMessage(`${entry.amendment_id} rolled back. Remaining active applications were replayed transactionally.`, "is-success");
  updatePcProjectSummary();
}

function pcAlignmentExcerpt(entry, baseline) {
  if (!baseline?.full_text) return "No unique baseline text target is available.";
  const needle = entry.target_text || "";
  const index = needle ? baseline.full_text.indexOf(needle) : -1;
  if (index < 0) return baseline.full_text.slice(0, 700) + (baseline.full_text.length > 700 ? "…" : "");
  const start = Math.max(0, index - 220);
  const end = Math.min(baseline.full_text.length, index + needle.length + 220);
  return `${start ? "…" : ""}${baseline.full_text.slice(start, end)}${end < baseline.full_text.length ? "…" : ""}`;
}

function pcRenderAlignmentReview() {
  const queue = document.getElementById("pcAlignmentQueue");
  if (!queue) return;
  const clauseSpecific = pcReviewData.amendments.filter((entry) => ["Clause-specific Amendment", "New Clause"].includes(entry.amendment_category));
  const deferred = pcReviewData.amendments.filter((entry) => ["Defined-term Amendment", "Global Amendment"].includes(entry.amendment_category));
  const eligibility = new Map(clauseSpecific.map((entry) => [entry.amendment_id, pcEligibilityForAmendment(entry)]));
  document.getElementById("pcSummaryTotal").textContent = clauseSpecific.length;
  document.getElementById("pcSummaryExact").textContent = clauseSpecific.filter((entry) => entry.alignment_status === "Exact Match").length;
  document.getElementById("pcSummaryConfirmed").textContent = clauseSpecific.filter((entry) => entry.alignment_status === "Human Confirmed").length;
  document.getElementById("pcSummaryAmbiguous").textContent = clauseSpecific.filter((entry) => entry.alignment_status === "Ambiguous").length;
  document.getElementById("pcSummaryUnmatched").textContent = clauseSpecific.filter((entry) => entry.alignment_status === "Unmatched").length;
  document.getElementById("pcSummaryEligible").textContent = clauseSpecific.filter((entry) => eligibility.get(entry.amendment_id).eligible).length;
  document.getElementById("pcSummaryApplied").textContent = clauseSpecific.filter((entry) => entry.application_status === "Applied").length;
  document.getElementById("pcSummaryFailed").textContent = clauseSpecific.filter((entry) => ["Failed", "Blocking Dependency", "Not Yet Supported / Human Review Required"].includes(entry.application_status)
    || ["Target Text Match", "Number Match / Heading Difference", "Heading Match / Number Difference", "Probable Match", "Ambiguous", "Unmatched", "New Clause", "Blocking Dependency", "Rejected"].includes(entry.alignment_status)).length;
  document.getElementById("pcSummaryDeferred").textContent = deferred.length;
  const filter = document.getElementById("pcAlignmentFilter");
  if (filter.options.length === 1) filter.insertAdjacentHTML("beforeend", PC_ALIGNMENT_STATUSES.filter((status) => status !== "Not Assessed").map((status) => `<option>${escapeHtml(status)}</option>`).join(""));
  const visible = clauseSpecific.filter((entry) => !filter.value || entry.alignment_status === filter.value);
  if (!pcReviewData.project) {
    queue.innerHTML = '<div class="pc-register-empty"><b>No review project.</b><p>Create or import a project in Source Intake.</p></div>';
    return;
  }
  if (!visible.length) {
    queue.innerHTML = '<div class="pc-register-empty"><b>No clause-specific entries match this filter.</b><p>Defined-term and global entries remain deferred in the Amendment Register.</p></div>';
    return;
  }
  queue.innerHTML = visible.map((entry) => {
    const assessment = pcActiveAssessment(entry);
    const baseline = pcBaselineClauseForAmendment(entry);
    const eligible = eligibility.get(entry.amendment_id);
    const conflicts = entry.alignment_conflicts || [];
    const checked = pcSelectedAmendmentIds.has(entry.amendment_id);
    const canConfirm = Boolean(assessment && (entry.proposed_target_gc_clause_id || entry.amendment_operation === "Add New Sub-Clause") && !entry.blocking_issue && !pcHasActiveApplication(entry.amendment_id));
    return `<article class="pc-alignment-card">
      <header><label class="pc-select-amendment"><input type="checkbox" data-select-amendment="${escapeHtml(entry.amendment_id)}" ${checked ? "checked" : ""} ${eligible.eligible ? "" : "disabled"}><span>Select for controlled batch</span></label><div><b>${escapeHtml(entry.pc_source_reference)}</b><small>Sequence ${escapeHtml(entry.sequence_number ?? "unknown")}</small></div><span class="status-badge">${escapeHtml(entry.alignment_status)}</span></header>
      <div class="pc-alignment-grid">
        <section><h4>Exact PC instruction</h4><pre>${escapeHtml(entry.pc_instruction_text)}</pre><dl><div><dt>PC clause</dt><dd>${escapeHtml(entry.pc_clause_number || "—")} ${escapeHtml(entry.pc_clause_heading || "")}</dd></div><div><dt>Operation</dt><dd>${escapeHtml(entry.amendment_operation)}</dd></div><div><dt>Target basis</dt><dd>${escapeHtml(entry.target_basis || "Unclear")}</dd></div></dl></section>
        <section><h4>Proposed GC target</h4><p class="pc-target-heading">${escapeHtml(entry.proposed_target_gc_clause_number || entry.target_gc_clause_number || "No unique target")} · ${escapeHtml(entry.proposed_target_gc_heading || entry.target_gc_heading || "—")}</p><pre>${escapeHtml(pcAlignmentExcerpt(entry, baseline))}</pre><dl><div><dt>Machine result</dt><dd>${escapeHtml(entry.machine_alignment_status || "Not Assessed")}</dd></div><div><dt>Reason</dt><dd>${escapeHtml(entry.machine_alignment_reason || "Run assessment")}</dd></div><div><dt>Exact occurrences</dt><dd>${escapeHtml(entry.target_occurrence_count ?? "Not applicable")}</dd></div><div><dt>Benchmark</dt><dd>FIDIC Red Book 2017 · ${Number.isInteger(Number(entry.sequence_number)) ? "sequence known" : "sequence unknown"}</dd></div><div><dt>Operation support</dt><dd>${PC_SUPPORTED_OPERATIONS.includes(entry.amendment_operation) ? "Supported in Task 3" : "Not Yet Supported / Human Review Required"}</dd></div></dl></section>
        <section><h4>Conflicts, blockers and eligibility</h4>${conflicts.length ? `<ul>${conflicts.map((conflict) => `<li>${escapeHtml(conflict)}</li>`).join("")}</ul>` : "<p>No recorded identifier conflict.</p>"}${entry.blocking_issue ? `<p class="pc-blocker"><b>Blocking issue:</b> ${escapeHtml(entry.blocking_issue)}</p>` : ""}<p class="${eligible.eligible ? "pc-eligible" : "pc-ineligible"}">${eligible.eligible ? "Eligible for explicit preview/application" : escapeHtml(eligible.reasons.join(" "))}</p><small>Machine assessment ${escapeHtml(assessment?.alignment_assessment_id || "not recorded")}</small></section>
      </div>
      <footer><button type="button" data-alignment-action="Confirm Alignment" data-amendment-id="${escapeHtml(entry.amendment_id)}" ${canConfirm ? "" : "disabled"}>Confirm Alignment</button><button type="button" data-alignment-action="Reject Alignment" data-amendment-id="${escapeHtml(entry.amendment_id)}">Reject Alignment</button><button type="button" data-alignment-action="Mark Ambiguous" data-amendment-id="${escapeHtml(entry.amendment_id)}">Mark Ambiguous</button><button type="button" data-alignment-action="Clear Manual Decision" data-amendment-id="${escapeHtml(entry.amendment_id)}" ${entry.active_alignment_decision_id ? "" : "disabled"}>Clear Manual Decision</button><button type="button" data-return-register="${escapeHtml(entry.amendment_id)}">Return to Amendment Register</button><button type="button" data-open-workbench="${escapeHtml(entry.amendment_id)}">Open Workbench</button></footer>
    </article>`;
  }).join("");
  queue.querySelectorAll("[data-select-amendment]").forEach((checkbox) => checkbox.addEventListener("change", () => {
    if (checkbox.checked) pcSelectedAmendmentIds.add(checkbox.dataset.selectAmendment);
    else pcSelectedAmendmentIds.delete(checkbox.dataset.selectAmendment);
    pcRenderWorkbench();
  }));
  queue.querySelectorAll("[data-alignment-action]").forEach((button) => button.addEventListener("click", () => pcSetManualAlignment(button.dataset.amendmentId, button.dataset.alignmentAction)));
  queue.querySelectorAll("[data-return-register]").forEach((button) => button.addEventListener("click", () => {
    switchPcView("pcAmendmentRegisterView");
    pcOpenAmendmentEditor(button.dataset.returnRegister);
  }));
  queue.querySelectorAll("[data-open-workbench]").forEach((button) => button.addEventListener("click", () => {
    switchPcView("pcConsolidationWorkbenchView");
    pcSelectWorkbenchAmendment(button.dataset.openWorkbench);
  }));
}

function pcRenderStructuredSegments(segments) {
  if (!segments?.length) return '<p class="pc-empty-copy">No structured change segments are available for this view.</p>';
  return `<div class="pc-change-display">${segments.map((segment) => {
    if (segment.segment_type === "deleted") return `<del>${escapeHtml(segment.text)}</del>`;
    if (segment.segment_type === "added") return `<mark>${escapeHtml(segment.text)}</mark>`;
    if (segment.segment_type === "replaced") return `<span class="pc-replaced"><del>${escapeHtml(segment.original_text)}</del><mark>${escapeHtml(segment.text)}</mark></span>`;
    return `<span>${escapeHtml(segment.text)}</span>`;
  }).join("")}</div>`;
}

function pcSelectWorkbenchAmendment(amendmentId) {
  pcWorkbenchAmendmentId = amendmentId;
  pcWorkbenchTab = "effective";
  pcRenderWorkbench();
}

function pcRenderApplicationLog() {
  const rows = document.getElementById("pcApplicationLogRows");
  if (!rows) return;
  const logs = [...pcReviewData.application_log].reverse();
  document.getElementById("pcApplicationLogCount").textContent = `${logs.length} attempt${logs.length === 1 ? "" : "s"}`;
  rows.innerHTML = logs.length ? logs.map((log) => `<tr><td>${escapeHtml(new Date(log.attempted_at).toLocaleString())}</td><td>${escapeHtml(log.amendment_id)}</td><td>${escapeHtml(log.operation)}</td><td>${escapeHtml(log.target_basis)}</td><td>${escapeHtml(log.input_version || "—")} → ${escapeHtml(log.output_version || "—")}</td><td>${escapeHtml(log.target_occurrence_count ?? "—")}</td><td><span class="status-badge">${escapeHtml(log.application_result)}</span></td><td>${escapeHtml(log.failure_reason || (log.reverses_application_id ? `Reverses ${log.reverses_application_id}` : "—"))}</td><td>${log.application_result === "Applied" && log.rollback_available && !log.rolled_back_at ? `<button type="button" data-rollback-application="${escapeHtml(log.application_id)}">Rollback</button>` : "—"}</td></tr>`).join("") : '<tr><td colspan="9">No application attempts recorded.</td></tr>';
  rows.querySelectorAll("[data-rollback-application]").forEach((button) => button.addEventListener("click", () => pcRollbackApplication(button.dataset.rollbackApplication)));
}

function pcRenderWorkbench() {
  const select = document.getElementById("pcWorkbenchAmendment");
  if (!select) return;
  const candidates = pcReviewData.amendments.filter((entry) => ["Clause-specific Amendment", "New Clause"].includes(entry.amendment_category)).sort((a, b) => Number(a.sequence_number || Infinity) - Number(b.sequence_number || Infinity));
  if (!candidates.some((entry) => entry.amendment_id === pcWorkbenchAmendmentId)) pcWorkbenchAmendmentId = candidates[0]?.amendment_id || null;
  select.innerHTML = candidates.length ? candidates.map((entry) => `<option value="${escapeHtml(entry.amendment_id)}" ${entry.amendment_id === pcWorkbenchAmendmentId ? "selected" : ""}>${escapeHtml(entry.sequence_number ?? "?")} · ${escapeHtml(entry.pc_source_reference)} · ${escapeHtml(entry.alignment_status)}</option>`).join("") : '<option value="">No clause-specific amendments</option>';
  const entry = candidates.find((item) => item.amendment_id === pcWorkbenchAmendmentId) || null;
  const baselinePanel = document.getElementById("pcWorkbenchBaseline");
  const instructionPanel = document.getElementById("pcWorkbenchInstruction");
  const effectivePanel = document.getElementById("pcWorkbenchEffective");
  const previewButton = document.getElementById("pcPreviewApplication");
  const applyButton = document.getElementById("pcApplyAmendment");
  const selectedButton = document.getElementById("pcApplySelected");
  if (!entry) {
    baselinePanel.innerHTML = instructionPanel.innerHTML = effectivePanel.innerHTML = '<p class="pc-empty-copy">No clause-specific amendment selected.</p>';
    previewButton.disabled = applyButton.disabled = selectedButton.disabled = true;
    pcRenderApplicationLog();
    return;
  }
  const baseline = pcBaselineClauseForAmendment(entry);
  const record = pcFindEffectiveClauseForAmendment(entry);
  const eligibility = pcEligibilityForAmendment(entry);
  const preview = pcApplicationPreviews.get(entry.amendment_id);
  const isNew = entry.amendment_operation === "Add New Sub-Clause";
  baselinePanel.innerHTML = baseline
    ? `<div class="pc-clause-identity"><b>${escapeHtml(baseline.clause_no)} · ${escapeHtml(baseline.clause_title)}</b><span>${escapeHtml(baseline.pdf_verification_status || baseline.verification_status || "Not Verified")}</span></div><pre>${escapeHtml(baseline.full_text)}</pre><small>Read-only from ${escapeHtml(FIDIC_SOURCE_LAYER_PATH)}. This object is never mutated.</small>`
    : `<div class="pc-clause-identity"><b>${escapeHtml(entry.target_gc_clause_number || (isNew ? "Proposed new Sub-Clause" : "No resolved target"))}</b><span>${isNew ? "No baseline text — proposed new clause" : "No controlled baseline target"}</span></div><p class="pc-empty-copy">${isNew ? "A valid new clause has no baseline wording. Its number must remain unoccupied." : "Return to Clause Alignment before application."}</p>`;
  instructionPanel.innerHTML = `<div class="pc-clause-identity"><b>${escapeHtml(entry.pc_source_reference)}</b><span>${escapeHtml(entry.application_status)}</span></div><pre>${escapeHtml(entry.pc_instruction_text)}</pre><dl><div><dt>Operation</dt><dd>${escapeHtml(entry.amendment_operation)}</dd></div><div><dt>Sequence</dt><dd>${escapeHtml(entry.sequence_number ?? "Unknown")}</dd></div><div><dt>Target basis</dt><dd>${escapeHtml(entry.target_basis)}</dd></div><div><dt>Exact target / anchor</dt><dd>${escapeHtml(entry.target_text || "Not applicable")}</dd></div><div><dt>Replacement / addition</dt><dd>${escapeHtml(entry.replacement_or_added_text || "Not applicable")}</dd></div><div><dt>Alignment</dt><dd>${escapeHtml(entry.alignment_status)} (machine: ${escapeHtml(entry.machine_alignment_status || "Not Assessed")})</dd></div></dl><div class="${eligibility.eligible ? "pc-eligible" : "pc-ineligible"}">${eligibility.eligible ? "Eligible for explicit application" : escapeHtml(eligibility.reasons.join(" "))}</div>`;
  const effectiveText = preview?.outputText ?? record?.current_effective_text ?? baseline?.full_text ?? "";
  const segments = preview?.segments || record?.structured_change_segments || [];
  if (pcWorkbenchTab === "baseline") effectivePanel.innerHTML = baseline ? `<pre>${escapeHtml(baseline.full_text)}</pre>` : '<p class="pc-empty-copy">No baseline text exists for a proposed new Sub-Clause.</p>';
  if (pcWorkbenchTab === "effective") effectivePanel.innerHTML = `${preview ? '<p class="pc-preview-flag">Preview only — not committed</p>' : ""}<div class="pc-clause-identity"><b>${escapeHtml(record?.clause_status || (preview ? "Previewed" : "No Effective Clause created"))}</b><span>Effective verification: Not Verified</span></div>${record?.is_tombstone && !effectiveText ? '<p class="pc-deleted-copy">Deleted by Particular Conditions</p>' : (effectiveText ? `<pre>${escapeHtml(effectiveText)}</pre>` : '<p class="pc-empty-copy">No committed Effective Clause text.</p>')}`;
  if (pcWorkbenchTab === "changes") effectivePanel.innerHTML = pcRenderStructuredSegments(segments);
  if (pcWorkbenchTab === "history") effectivePanel.innerHTML = record?.version_history?.length ? `<ol class="pc-version-history">${[...record.version_history].reverse().map((version) => `<li><b>v${version.version_number} · ${escapeHtml(version.version_event)}</b><span>${escapeHtml(new Date(version.created_at).toLocaleString())}</span><small>${escapeHtml(version.active_amendment_ids.join(", ") || "No active amendments")}</small><details><summary>View exact version text</summary><pre>${escapeHtml(version.text)}</pre></details></li>`).join("")}</ol>` : '<p class="pc-empty-copy">No Effective Clause version has been created.</p>';
  previewButton.disabled = applyButton.disabled = !eligibility.eligible;
  const selectedEligibleCount = pcReviewData.amendments.filter((item) => pcSelectedAmendmentIds.has(item.amendment_id) && pcEligibilityForAmendment(item).eligible).length;
  selectedButton.disabled = selectedEligibleCount === 0;
  selectedButton.textContent = `Apply Selected Eligible Amendments (${selectedEligibleCount})`;
  document.querySelectorAll("[data-pc-workbench-tab]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.pcWorkbenchTab === pcWorkbenchTab);
    button.setAttribute("aria-selected", String(button.dataset.pcWorkbenchTab === pcWorkbenchTab));
  });
  pcRenderApplicationLog();
}

function pcClearActiveSource() {
  const source = pcActiveSourceDocument();
  if (!source) {
    pcSetMessage("No selected source document to clear.");
    return;
  }
  if (pcReviewData.amendments.some((entry) => entry.pc_source_document_id === source.source_document_id)) {
    pcSetMessage("This source cannot be removed while Amendment Register entries refer to it.", "is-error");
    return;
  }
  if (!window.confirm(`Remove registered source “${source.file_name}” from the current browser-session project?`)) return;
  pcReviewData.source_documents = pcReviewData.source_documents.filter((item) => item.source_document_id !== source.source_document_id);
  pcReviewData.project.source_document_ids = pcReviewData.project.source_document_ids.filter((id) => id !== source.source_document_id);
  pcRecordHistory({ sourceDocumentId: source.source_document_id, previousStatus: source.processing_status, newStatus: "Removed from review", action: "Source document removed", actor: "User" });
  pcActiveSourceDocumentId = pcReviewData.source_documents.at(-1)?.source_document_id || null;
  pcSourceFile.value = "";
  pcSetMessage("Selected source document removed from the current browser-session project.");
  updatePcProjectSummary();
}

function pcExportProject() {
  if (!pcReviewData.project) {
    switchPcView("pcSourceIntakeView");
    pcSetMessage("Create a review project before exporting.", "is-error");
    return;
  }
  pcRecordHistory({ previousStatus: pcReviewData.project.project_status, newStatus: pcReviewData.project.project_status, action: "Review project JSON exported", actor: "User" });
  const exported = structuredClone(pcReviewData);
  exported.export_timestamp = pcNow();
  try {
    pcValidateJsonPayload(exported);
  } catch (error) {
    document.getElementById("pcExportStatus").textContent = `Export blocked by project validation: ${error.message}`;
    document.getElementById("pcExportStatus").className = "pc-intake-message is-error";
    return;
  }
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
  if (pcExportObjectUrl) URL.revokeObjectURL(pcExportObjectUrl);
  pcExportObjectUrl = URL.createObjectURL(blob);
  const link = document.getElementById("pcExportDownload");
  const slug = pcReviewData.project.project_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pc-review";
  link.href = pcExportObjectUrl;
  link.download = `${slug}-pc-review.json`;
  link.hidden = false;
  link.click();
  document.getElementById("pcExportStatus").textContent = `JSON download requested as ${link.download}. Confirm the file appears in your browser downloads.`;
  document.getElementById("pcExportStatus").className = "pc-intake-message is-success";
  updatePcProjectSummary();
}

function pcResetProject() {
  if (!pcReviewData.project && !pcReviewData.source_documents.length) return;
  if (!window.confirm("Reset the entire Particular Conditions review in browser memory? Export first if you need to preserve it.")) return;
  pcReviewData = createPcReviewPackage();
  pcSelectedAmendmentIds.clear();
  pcApplicationPreviews.clear();
  pcWorkbenchAmendmentId = null;
  pcWorkbenchTab = "effective";
  pcPendingJsonImport = null;
  pcActiveSourceDocumentId = null;
  if (pcExportObjectUrl) URL.revokeObjectURL(pcExportObjectUrl);
  pcExportObjectUrl = null;
  document.getElementById("pcExportDownload").hidden = true;
  pcSyncProjectForm();
  pcSourceFile.value = "";
  document.getElementById("pcJsonValidation").hidden = true;
  document.getElementById("pcAmendmentEditor").hidden = true;
  document.getElementById("pcProjectFormMessage").textContent = "A project must be created before registering a source.";
  pcSetMessage("Review reset. No data remains in browser memory.");
  updatePcProjectSummary();
}

async function pcLoadDemoFixture() {
  try {
    const response = await fetch("data/demo/pc_review_project_demo.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const summary = pcValidateJsonPayload(data);
    pcShowJsonValidation(data, summary, { name: "pc_review_project_demo.json", size: 0 }, "project-import");
    pcSetMessage("DEMO fixture loaded for validation. It contains synthetic data only and no FIDIC wording.", "is-success");
  } catch (error) {
    pcSetMessage(`DEMO fixture failed validation: ${error.message}`, "is-error");
  }
}

workspaceOptions.forEach((button) => button.addEventListener("click", () => switchWorkspace(button.dataset.workspaceTarget)));
pcViewOptions.forEach((button) => button.addEventListener("click", () => switchPcView(button.dataset.pcViewTarget)));
document.getElementById("goToSourceIntake").addEventListener("click", () => switchPcView("pcSourceIntakeView"));
document.getElementById("openBaselineClauseSpine").addEventListener("click", () => {
  switchWorkspace("baselineWorkspace");
  switchView("clauseSpineView");
});
document.getElementById("pcCreateProject").addEventListener("click", pcCreateOrUpdateProject);
document.getElementById("pcIntakeForm").addEventListener("submit", (event) => event.preventDefault());
pcSourceFile.addEventListener("change", () => processPcSourceFile(pcSourceFile.files[0]));
pcDropZone.addEventListener("dragover", (event) => { event.preventDefault(); pcDropZone.classList.add("is-dragging"); });
pcDropZone.addEventListener("dragleave", () => pcDropZone.classList.remove("is-dragging"));
pcDropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  pcDropZone.classList.remove("is-dragging");
  processPcSourceFile(event.dataTransfer.files[0]);
});
document.getElementById("pcClearSource").addEventListener("click", pcClearActiveSource);
document.getElementById("pcContinueRegister").addEventListener("click", () => switchPcView("pcAmendmentRegisterView"));
document.getElementById("pcAddAmendment").addEventListener("click", () => pcOpenAmendmentEditor());
document.getElementById("pcCloseAmendmentEditor").addEventListener("click", () => { document.getElementById("pcAmendmentEditor").hidden = true; });
document.getElementById("pcAmendmentForm").addEventListener("submit", pcSaveAmendment);
document.querySelectorAll("[data-amendment-filter]").forEach((select) => select.addEventListener("change", pcRenderAmendmentRegister));
document.getElementById("pcRunAlignment").addEventListener("click", () => pcEvaluateAllAlignments({ recordHistory: true }));
document.getElementById("pcAlignmentFilter").addEventListener("change", pcRenderAlignmentReview);
document.getElementById("pcWorkbenchAmendment").addEventListener("change", (event) => pcSelectWorkbenchAmendment(event.target.value));
document.getElementById("pcPreviewApplication").addEventListener("click", () => pcAttemptApplication(pcWorkbenchAmendmentId, "Preview"));
document.getElementById("pcApplyAmendment").addEventListener("click", () => pcAttemptApplication(pcWorkbenchAmendmentId, "Apply"));
document.getElementById("pcApplySelected").addEventListener("click", pcApplySelectedAmendments);
document.querySelectorAll("[data-pc-workbench-tab]").forEach((button) => button.addEventListener("click", () => {
  pcWorkbenchTab = button.dataset.pcWorkbenchTab;
  pcRenderWorkbench();
}));
document.getElementById("pcExportProject").addEventListener("click", pcExportProject);
document.getElementById("pcImportProject").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  switchPcView("pcSourceIntakeView");
  processPcSourceFile(file, "project-import");
  event.target.value = "";
});
document.getElementById("pcResetProject").addEventListener("click", pcResetProject);
document.getElementById("pcLoadDemoFixture").addEventListener("click", pcLoadDemoFixture);
pcInitializeRegisterControls();
updatePcProjectSummary();

viewOptions.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

clearSelection.addEventListener("click", () => {
  selectedSystems.clear();
  updateArchitecture();
  scopeWorkspace.hidden = true;
});

openScopeWorkspace.addEventListener("click", () => {
  const scopeCategoryId = scopeMainCategory()?.id;
  if (!scopeCategoryId) return;
  selectedSystems.add(scopeCategoryId);
  updateArchitecture();
  scopeWorkspace.hidden = false;
  scopeWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderArchitecture();
renderClauseSpine();
renderTagGroups();
updateArchitecture();
switchView("functionalView");
switchWorkspace("baselineWorkspace");
switchPcView("pcOverviewView");
const mainCategoriesJob = loadMainCategories();
const clauseSourceJob = loadClauseSourceLayer();
const scopeDataJob = loadScopeData();
void Promise.allSettled([mainCategoriesJob, clauseSourceJob, scopeDataJob]);

if (new URLSearchParams(window.location.search).has("task3_acceptance")) {
  const acceptanceBridge = document.createElement("section");
  acceptanceBridge.id = "task3AcceptanceBridge";
  acceptanceBridge.setAttribute("aria-label", "Task 3 acceptance bridge");
  acceptanceBridge.innerHTML = `<textarea id="task3AcceptanceRequest" aria-label="Task 3 acceptance request"></textarea><button id="task3AcceptanceRun" type="button">Run acceptance action</button><pre id="task3AcceptanceResult"></pre>`;
  document.body.appendChild(acceptanceBridge);
  document.getElementById("task3AcceptanceRun").addEventListener("click", async () => {
    const resultNode = document.getElementById("task3AcceptanceResult");
    try {
      const request = JSON.parse(document.getElementById("task3AcceptanceRequest").value || "{}");
      let result;
      if (request.action === "getState") result = pcReviewData;
      else if (request.action === "getSourceLayer") result = fidicSourceLayer;
      else if (request.action === "loadFixture") result = await (await fetch(request.path, { cache: "no-store" })).json();
      else if (request.action === "setState") {
        pcReviewData = structuredClone(request.value);
        pcActiveSourceDocumentId = pcReviewData.source_documents.at(-1)?.source_document_id || null;
        updatePcProjectSummary();
        result = true;
      } else if (request.action === "validate") result = pcValidateJsonPayload(structuredClone(request.value));
      else if (request.action === "evaluateAll") result = pcEvaluateAllAlignments({ recordHistory: false });
      else if (request.action === "evaluateOne") result = pcEvaluateAmendmentAlignment(pcReviewData.amendments.find((entry) => entry.amendment_id === request.amendmentId), { recordHistory: false });
      else if (request.action === "manualDecision") result = pcSetManualAlignment(request.amendmentId, request.decision);
      else if (request.action === "attempt") result = pcAttemptApplication(request.amendmentId, request.attemptType || "Apply", { render: false });
      else if (request.action === "rollback") result = pcRollbackApplication(request.applicationId);
      else if (request.action === "openEditor") result = pcOpenAmendmentEditor(request.amendmentId);
      else throw new Error(`Unknown acceptance action ${request.action || "(missing)"}.`);
      resultNode.textContent = JSON.stringify({ ok: true, result });
    } catch (error) {
      resultNode.textContent = JSON.stringify({ ok: false, error: error.message });
    }
  });
}
