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

const RING_CENTER = { x: 610, y: 280 };
const RING_RADIUS = 270;
const PANEL_WIDTH = 270;
const PANEL_LINK_Y = 43;
const SEGMENT_STEP = 360 / contractSystems.length;

const architecture = document.getElementById("architecture");
const selectionCount = document.getElementById("selectionCount");
const clearSelection = document.getElementById("clearSelection");
const emptyHint = document.getElementById("emptyHint");
const clauseSpine = document.getElementById("clauseSpine");
const clauseDetail = document.getElementById("clauseDetail");
const viewOptions = [...document.querySelectorAll("[data-view-target]")];
const appViews = [...document.querySelectorAll(".app-view")];
const selectedSystems = new Set();
let selectedClauseNumber = null;

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
        <span class="clause-title">${clause.title}</span>
        <span class="clause-action" aria-hidden="true">+</span>
      </button>
    </div>
  `).join("");

  clauseSpine.querySelectorAll(".clause-module").forEach((button) => {
    button.addEventListener("click", () => selectClause(Number(button.dataset.clauseNumber)));
  });
}

function selectClause(number) {
  selectedClauseNumber = number;
  const clause = fidicClauses.find((item) => item.number === number);

  clauseSpine.querySelectorAll(".clause-module").forEach((button) => {
    const isSelected = Number(button.dataset.clauseNumber) === number;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  clauseDetail.classList.remove("is-populated");
  clauseDetail.innerHTML = `
    <span class="detail-state">Clause ${String(clause.number).padStart(2, "0")}</span>
    <p class="detail-eyebrow">Top-level clause directory view</p>
    <h3>${clause.title}</h3>
    <p class="detail-note">Sub-clauses to be added in next stage.</p>
  `;
  requestAnimationFrame(() => clauseDetail.classList.add("is-populated"));
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
}

viewOptions.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.viewTarget));
});

clearSelection.addEventListener("click", () => {
  selectedSystems.clear();
  updateArchitecture();
});

renderArchitecture();
renderClauseSpine();
updateArchitecture();
switchView("functionalView");
