const contractSystems = [
  {
    id: "contract-mechanics",
    number: "01",
    title: "Contract Mechanics",
    chineseTitle: "合同机制",
    color: "#7566d8",
    colorDeep: "#5e4fc4",
    textColor: "#ffffff",
    panel: { x: 940, y: 4, side: "right" },
    categories: [
      "Definitions & Interpretation",
      "Notices & Communications",
      "Contract Administration",
      "Document Hierarchy"
    ]
  },
  {
    id: "scope-works",
    number: "02",
    title: "Scope & Works",
    chineseTitle: "空间 / 工程范围与工作内容",
    color: "#20b7a7",
    colorDeep: "#10988d",
    textColor: "#ffffff",
    panel: { x: 940, y: 116, side: "right" },
    approved: true,
    categories: [
      "Main Performance Obligations / 主要义务",
      "Ancillary Management Obligations / 附带义务，即管理",
      "Employer Enabling Obligations / 业主 / 对方使能义务",
      "Scope Variables and Variations / 变量，即变更"
    ]
  },
  {
    id: "time-completion",
    number: "03",
    title: "Time & Completion",
    chineseTitle: "时间与完工",
    color: "#3b8fe5",
    colorDeep: "#2376cc",
    textColor: "#ffffff",
    panel: { x: 940, y: 228, side: "right" },
    categories: ["Commencement", "Programme", "Progress Control", "EOT", "Completion"]
  },
  {
    id: "price-payment",
    number: "04",
    title: "Price & Payment",
    chineseTitle: "价格与付款",
    color: "#f0b32f",
    colorDeep: "#d59412",
    textColor: "#3b2a07",
    panel: { x: 940, y: 356, side: "right" },
    categories: ["Price Basis", "Payment Process", "Certification", "Deductions and Final Account"]
  },
  {
    id: "risk-protection",
    number: "05",
    title: "Risk & Protection",
    chineseTitle: "风险与保障",
    color: "#ec6a8b",
    colorDeep: "#d95076",
    textColor: "#ffffff",
    panel: { x: 10, y: 344, side: "left" },
    categories: ["Risk Allocation", "Insurance", "Indemnities", "Securities"]
  },
  {
    id: "default-remedies-termination",
    number: "06",
    title: "Default, Remedies & Termination",
    chineseTitle: "违约、救济与终止",
    color: "#ed7655",
    colorDeep: "#d85c3a",
    textColor: "#ffffff",
    panel: { x: 10, y: 184, side: "left" },
    categories: ["Delay Consequences", "Defects Consequences", "Termination Rights", "Post-Termination Effects"]
  },
  {
    id: "claims-determination-disputes",
    number: "07",
    title: "Claims, Determination & Disputes",
    chineseTitle: "索赔、确定与争议",
    color: "#79ad45",
    colorDeep: "#60922f",
    textColor: "#ffffff",
    panel: { x: 10, y: 24, side: "left" },
    categories: ["Claims Procedure", "Determination", "Dispute Escalation", "Arbitration"]
  }
];

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
    tags: ["Claim", "Condition Precedent", "Counterclaim / Countercharge", "EOT", "Time Bar", "Waiver / Discharge"]
  },
  {
    title: "Determination & Deemed Effects",
    chineseTitle: "决定机制与拟制效果",
    tags: ["Deemed Approval", "Deemed Rejection", "Determination"]
  },
  {
    title: "Remedies, Risk & Payment Controls",
    chineseTitle: "救济、风险与付款控制",
    tags: ["Back-to-back", "Breach / Default", "Deduction", "Indemnity", "Remedy", "Set-off", "Termination Trigger", "Withholding"]
  }
];

const tagClauseMappings = {
  "Back-to-back": [],
  "Breach / Default": [
    ["4.1", "Contractor's General Obligations"],
    ["8.8", "Delay Damages"],
    ["11.4", "Failure to Remedy Defects"],
    ["15.2", "Termination for Contractor's Default"]
  ],
  Claim: [
    ["1.9", "Delayed Drawings or Instructions"],
    ["1.13", "Compliance with Laws"],
    ["2.1", "Right of Access to the Site"],
    ["4.12", "Unforeseeable Physical Conditions"],
    ["20.2", "Claims For Payment and/or EOT"]
  ],
  "Condition Precedent": [
    ["4.2", "Performance Security"],
    ["20.2", "Claims For Payment and/or EOT"],
    ["21.4", "Obtaining DAAB's Decision"]
  ],
  "Counterclaim / Countercharge": [
    ["20.2", "Claims For Payment and/or EOT"]
  ],
  Deduction: [
    ["8.8", "Delay Damages"],
    ["11.4", "Failure to Remedy Defects"],
    ["14.6", "Issue of IPC"],
    ["14.15", "Currencies of Payment"]
  ],
  "Deemed Approval": [
    ["3.7", "Agreement or Determination"],
    ["13.3.1", "Variation by Instruction"]
  ],
  "Deemed Rejection": [
    ["20.2", "Claims For Payment and/or EOT"],
    ["21.4", "Obtaining DAAB's Decision"]
  ],
  Determination: [
    ["3.7", "Agreement or Determination"],
    ["13.3.1", "Variation by Instruction"],
    ["20.2", "Claims For Payment and/or EOT"]
  ],
  EOT: [
    ["2.1", "Right of Access to the Site"],
    ["8.5", "Extension of Time for Completion"],
    ["8.6", "Delays Caused by Authorities"],
    ["13.3.1", "Variation by Instruction"],
    ["13.6", "Adjustments for Changes in Laws"]
  ],
  Indemnity: [
    ["1.13", "Compliance with Laws"],
    ["17.4", "Indemnities by the Contractor"],
    ["17.5", "Indemnities by the Employer"]
  ],
  Remedy: [
    ["7.5", "Defects and Rejection"],
    ["7.6", "Remedial Work"],
    ["11.1", "Completion of Outstanding Work and Remedying Defects"],
    ["11.4", "Failure to Remedy Defects"]
  ],
  "Set-off": [
    ["2.2", "Assistance"],
    ["8.8", "Delay Damages"],
    ["14.6", "Issue of IPC"]
  ],
  "Termination Trigger": [
    ["15.2", "Termination for Contractor's Default"],
    ["15.5", "Termination for Employer's Convenience"],
    ["16.2", "Termination by Contractor"]
  ],
  "Time Bar": [
    ["20.2", "Claims For Payment and/or EOT"]
  ],
  "Waiver / Discharge": [
    ["20.2", "Claims For Payment and/or EOT"],
    ["14.12", "Discharge"]
  ],
  Withholding: [
    ["14.6", "Issue of IPC"],
    ["14.9", "Payment of Retention Money"],
    ["15.4", "Payment after Termination for Contractor's Default"]
  ]
};

const sampleTagDetails = {
  "EOT::2.1": {
    reason: "The clause provides that delayed access or possession may entitle the Contractor to EOT, subject to the claims procedure.",
    path: "Scope & Works > Employer Enabling Obligations > Site access and possession",
    elements: [
      "Employer obligation to give access and possession",
      "Timing of access",
      "Non-exclusive access",
      "Delayed access consequence",
      "Contractor delay or error carve-out"
    ]
  },
  "EOT::13.3.1": {
    reason: "The Contractor's proposal may include adjustment to the Time for Completion where the instructed Variation affects time.",
    path: "Scope & Works > Scope Variables and Variations > Variation instruction",
    elements: [
      "Engineer instruction",
      "Contractor obligation to execute Variation",
      "Contractor proposal",
      "Time impact",
      "Engineer agreement or determination"
    ]
  },
  "Determination::3.7": {
    reason: "This is the core Engineer agreement or determination mechanism.",
    path: "Contract Mechanics > Contract Administration > Agreement or Determination",
    elements: [
      "Engineer consultation",
      "Agreement process",
      "Determination process",
      "Notice of determination"
    ]
  }
};

const RING_CENTER = { x: 610, y: 280 };
const RING_RADIUS = 270;
const PANEL_WIDTH = 270;
const PANEL_LINK_Y = 43;
const SEGMENT_STEP = 360 / contractSystems.length;

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
const appViews = [...document.querySelectorAll(".app-view")];
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
  const normalized = tuples.flatMap(([reference, title]) => {
    const clauseNumbers = expandClauseAnchor(reference);
    if (!clauseNumbers.length || clauseNumbers.some((number) => !CONCRETE_CLAUSE_REFERENCE.test(number))) {
      throw new Error(`${context} contains an invalid clause anchor: ${reference}`);
    }
    return clauseNumbers.map((number) => [number, title]);
  });
  return normalized.filter(([number], index) => normalized.findIndex(([candidate]) => candidate === number) === index);
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

async function loadClauseSourceLayer() {
  try {
    const response = await fetch("data/processed/fidic_2017_red_clauses.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const sourceLayer = await response.json();
    if (!Array.isArray(sourceLayer.main_clauses) || !Array.isArray(sourceLayer.clauses)) {
      throw new Error("invalid source-layer structure");
    }
    fidicSourceLayer = sourceLayer;
    clauseDirectoryCount.textContent = `${sourceLayer.main_clause_count} main clauses · ${sourceLayer.sub_clause_count} sub-clauses`;
    renderClauseSpine();
    selectClause(selectedClauseNumber || 1);
  } catch (error) {
    clauseLoadError = error;
    clauseDirectoryCount.textContent = "21 main clauses · source layer unavailable";
    renderClauseSpine();
    renderClauseLoadError();
    console.error("Could not load the local FIDIC source layer", error);
  }
}

async function loadScopeData() {
  try {
    const response = await fetch("data/scope_works_v1.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    scopeData = enforceProjectClauseAnchorRule(await response.json());
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
    console.error("Could not load Scope & Works v1", error);
  }
}

function buildScopeClauseMappings(data) {
  const clauseIndex = new Map();
  data.performance_nodes.forEach((node) => {
    node.primary_clauses.forEach(([clauseNo, clauseTitle]) => {
      const existing = clauseIndex.get(clauseNo);
      if (!existing) {
        const category = data.practice_categories.find((item) => item.id === node.practice_category_id);
        clauseIndex.set(clauseNo, {
          id: `scope_${clauseNo.replaceAll(".", "_")}`,
          main_system: data.main_system,
          practice_category: category?.name || node.practice_category_id,
          performance_node: node.name,
          performance_node_id: node.id,
          clause_no: clauseNo,
          clause_title: clauseTitle,
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
      let mapping = clauseIndex.get(clauseNo);
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
          primary_path: node?.primary_path || "Scope & Works > Approved tag mapping",
          secondary_paths: node ? [...node.secondary_paths] : [],
          elements: node ? [...node.elements] : [],
          legal_effect_tags: [], tag_reasons: {},
          source_status: data.source_status, qc_status: data.qc_status,
          lawyer_review_status: data.lawyer_review_status
        };
        clauseIndex.set(clauseNo, mapping);
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

function renderArchitecture() {
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
  const rotation = SEGMENT_STEP * index;
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
    <article class="ring-system panel-${system.panel.side}" data-system-id="${system.id}" style="${style}">
      <button
        class="ring-segment"
        type="button"
        aria-expanded="false"
        aria-controls="categories-${system.id}"
        aria-label="${system.number} ${system.title} ${system.chineseTitle}"
      >
        <span class="segment-label">
          <span class="segment-number">${system.number}</span>
          <span class="segment-copy">
            <strong>${system.title}</strong>
            <span lang="zh-Hans">${system.chineseTitle}</span>
          </span>
        </span>
      </button>
      <i class="panel-link" aria-hidden="true"></i>
      <section
        id="categories-${system.id}"
        class="category-panel"
        aria-label="${system.title} practice categories"
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
  selectedSystems.has(id) ? selectedSystems.delete(id) : selectedSystems.add(id);
  updateArchitecture();
  if (id === "scope-works" && selectedSystems.has(id) && scopeData) {
    scopeWorkspace.hidden = false;
    scopeWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (id === "scope-works" && !selectedSystems.has(id)) {
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
        <div class="scope-node-status"><span>needs_pdf_verification</span><span>needs_lawyer_review</span></div>
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
    <section><span>Primary path</span><p class="scope-path">${escapeHtml(node.primary_path)}</p></section>
    <section><span>Secondary paths / cross-links</span><ul>${node.secondary_paths.map((path) => `<li>${escapeHtml(path)}</li>`).join("")}</ul></section>
    <section><span>Clause anchors</span><div class="scope-clause-chips">${node.primary_clauses.map(([number, title]) => `<button type="button" data-detail-clause="${escapeHtml(number)}">${escapeHtml(number)} ${escapeHtml(title)}</button>`).join("")}</div></section>
    <section><span>Approved legal-effect tags</span><div class="scope-tag-row">${tags.length ? tags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join("") : "<em>No approved tag by default.</em>"}</div></section>
    <footer><b>${escapeHtml(category.name)}</b><span>source_text_loaded</span><span>needs_pdf_verification</span><span>needs_lawyer_review</span></footer>`;
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
    target.querySelector(".subclause-body")?.insertAdjacentHTML("afterbegin", renderCrossViewStatus(normalizedClauseNo, true));
    requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "center" }));
    return;
  }

  renderMissingClauseFallback(normalizedClauseNo, origin);
}

function clauseSpineViewTarget(clauseNo) {
  return clauseDetail.querySelector(`[data-subclause-number="${CSS.escape(clauseNo)}"]`);
}

function renderCrossViewStatus(clauseNo, textLoaded) {
  return `<div class="crossview-status-card">
    <strong>Opened from ${escapeHtml(clauseNavigationOrigin || "Dashboard")}</strong>
    <span>${textLoaded ? "Text loaded from source layer." : "Full clause text not loaded in source layer."}</span>
    <div><b>${textLoaded ? "source_text_loaded" : "source_text_not_loaded"}</b><b>needs_pdf_verification</b><b>needs_lawyer_review</b></div>
  </div>`;
}

function renderMissingClauseFallback(clauseNo, origin) {
  const mapping = getScopeMapping(clauseNo);
  const title = mapping?.clause_title || `${clauseNo} [Title to be verified]`;
  const register = clauseDetail.querySelector(".subclause-register");
  if (!register) return;
  register.insertAdjacentHTML("afterbegin", `<article class="missing-clause-card is-crossview-target">
    <span class="subclause-number">${escapeHtml(clauseNo)}</span><h4>${escapeHtml(title)}</h4>
    ${renderCrossViewStatus(clauseNo, false)}
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
  return `<div class="scope-detail-kicker">${escapeHtml(label)}</div>
    <h3>${escapeHtml(mapping.clause_no)} ${escapeHtml(mapping.clause_title)}</h3>
    <section><span>Practice category / performance node</span><p>${escapeHtml(mapping.practice_category || "Scope & Works")}<br><strong>${escapeHtml(mapping.performance_node || "Approved Scope mapping")}</strong></p></section>
    <section><span>Primary path</span><p class="scope-path">${escapeHtml(mapping.primary_path)}</p></section>
    <section><span>Secondary paths / cross-links</span><ul>${mapping.secondary_paths.map((path) => `<li>${escapeHtml(path)}</li>`).join("") || "<li>None approved.</li>"}</ul></section>
    <section><span>Relevant elements</span><ul>${mapping.elements.map((element) => `<li>${escapeHtml(element)}</li>`).join("")}</ul></section>
    <section><span>Approved legal-effect tags</span><div class="scope-tag-row">${mapping.legal_effect_tags.length ? mapping.legal_effect_tags.map((tag) => `<b>${escapeHtml(tag)}</b>`).join("") : "<em>No approved tag by default.</em>"}</div>${Object.entries(mapping.tag_reasons).map(([tag, reason]) => `<p class="scope-tag-reason"><strong>${escapeHtml(tag)}:</strong> ${escapeHtml(reason)}</p>`).join("")}</section>
    <footer><span>${escapeHtml(mapping.source_status)}</span><span>${escapeHtml(mapping.qc_status)}</span><span>${escapeHtml(mapping.lawyer_review_status)}</span></footer>`;
}

function updateArchitecture() {
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
  selectionCount.textContent = `${count} ${count === 1 ? "module" : "modules"} open`;
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
  const matchedCount = childClauses.filter((item) => item.verification_status === "pdf_text_matched").length;
  const scopeMappedCount = childClauses.filter((item) => findScopeNodesForClause(item.clause_no).length).length;

  clauseDetail.classList.remove("is-populated");
  clauseDetail.innerHTML = `
    <div class="clause-detail-header">
      <span class="detail-state">Clause ${String(clause.number).padStart(2, "0")}</span>
      <span class="clause-source-state">${scopeMappedCount} Scope mapped · ${matchedCount} PDF matched</span>
    </div>
    ${clauseNavigationOrigin ? `<div class="clause-origin-indicator">Opened from ${escapeHtml(clauseNavigationOrigin)}</div>` : ""}
    <p class="detail-eyebrow">Imported source-layer directory</p>
    <h3>${escapeHtml(clause.title)}</h3>
    <p class="detail-note">${childClauses.length} imported sub-clauses · Word manual copy compared with the local PDF reference.</p>
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
  requestAnimationFrame(() => clauseDetail.classList.add("is-populated"));
}

function renderSubClause(clause) {
  const isMatched = clause.verification_status === "pdf_text_matched";
  const scopeNodesForClause = findScopeNodesForClause(clause.clause_no);
  const scopeMapping = getScopeMapping(clause.clause_no);
  const statusText = isMatched ? "PDF text matched" : "Needs PDF verification";
  const paragraphs = Array.isArray(clause.paragraphs) ? clause.paragraphs.length : 0;
  const references = Array.isArray(clause.literal_cross_references)
    ? clause.literal_cross_references
    : [];
  return `
    <details data-subclause-number="${escapeHtml(clause.clause_no)}" class="subclause-card ${isMatched ? "is-matched" : "is-pending"} ${scopeNodesForClause.length ? "has-scope-map" : ""}">
      <summary>
        <span class="subclause-number">${escapeHtml(clause.clause_no)}</span>
        <span class="subclause-heading">${escapeHtml(clause.clause_title)}</span>
        <span class="verification-badge">${scopeNodesForClause.length ? "Scope mapped · " : ""}${statusText}</span>
      </summary>
      <div class="subclause-body">
        <div class="subclause-metadata">
          <span>${paragraphs} paragraph${paragraphs === 1 ? "" : "s"}</span>
          <span>Source: ${escapeHtml(clause.source_text_origin)}</span>
          ${references.length ? `<span>References: ${references.map(escapeHtml).join(", ")}</span>` : ""}
        </div>
        <div class="clause-full-text">${escapeHtml(clause.full_text)}</div>
        ${scopeNodesForClause.length ? `<div class="subclause-scope-map">
          <strong>Scope &amp; Works mapping</strong>
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
    <p class="detail-note">Run the Word importer to create <code>data/processed/fidic_2017_red_clauses.json</code>, then refresh this page.</p>
  `;
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
    <div class="tag-clause-list">
      ${clauses.map(([number, title]) => `
        <div class="tag-clause-result-row">
          <button
            class="tag-clause-result"
            type="button"
            data-clause-number="${number}"
            aria-pressed="false"
          >
            <span class="tag-result-clause-no">${number}</span>
            <span class="tag-result-copy">
              <strong>${title}</strong>
              <small>FIDIC Red Book 2017 · Scope &amp; Works</small>
            </span>
            <span class="mapping-status">needs_pdf_verification</span>
            <span class="tag-result-arrow" aria-hidden="true">›</span>
          </button>
          <button class="tag-spine-link" type="button" data-open-spine="${number}">View in Clause Spine</button>
        </div>
      `).join("")}
    </div>
  `;

  tagResults.querySelectorAll(".tag-clause-result").forEach((button) => {
    button.addEventListener("click", () => selectTagClause(button.dataset.clauseNumber));
  });
  tagResults.querySelectorAll("[data-open-spine]").forEach((button) => {
    button.addEventListener("click", () => openClauseInSpine(button.dataset.openSpine, "Tag View"));
  });
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
  const reason = mapping?.tag_reasons?.[selectedTag] || scopeData?.tag_reason_templates?.[selectedTag] || "needs_pdf_verification";

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
          <p class="functional-path">${escapeHtml(mapping?.primary_path || "Scope & Works > Approved tag mapping")}</p>
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
        <b>source_text_loaded</b>
        <b>needs_pdf_verification</b>
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

viewOptions.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

clearSelection.addEventListener("click", () => {
  selectedSystems.clear();
  updateArchitecture();
  scopeWorkspace.hidden = true;
});

openScopeWorkspace.addEventListener("click", () => {
  selectedSystems.add("scope-works");
  updateArchitecture();
  scopeWorkspace.hidden = false;
  scopeWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
});

renderArchitecture();
renderClauseSpine();
renderTagGroups();
updateArchitecture();
switchView("functionalView");
loadClauseSourceLayer();
loadScopeData();
