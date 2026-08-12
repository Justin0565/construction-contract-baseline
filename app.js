/*
 * Construction Contract Baseline
 * Plain JavaScript only. The JSON files are the source of truth; this file
 * joins them by their id fields and renders the dashboard.
 */

const DATA_FILES = {
  modules: "./data/modules.json",
  issues: "./data/sub_issues.json",
  elements: "./data/elements.json",
  tags: "./data/tags.json",
  map2017: "./data/fidic_2017_red_map.json",
  map1999: "./data/fidic_1999_red_map.json",
  crosswalk: "./data/crosswalk_2017_1999.json"
};

/*
 * Embedded fallback data keeps the prototype useful when a browser blocks
 * local JSON requests or the page is opened from a path without /data.
 * The JSON files remain the editable source whenever they can be fetched.
 */
const FALLBACK_TAGS = [
  ["condition-precedent", "Condition Precedent"], ["time-bar", "Time Bar"],
  ["claim", "Claim"], ["counterclaim", "Counterclaim / Countercharge"],
  ["determination", "Determination"], ["breach-default", "Breach / Default"],
  ["remedy", "Remedy"], ["indemnity", "Indemnity"],
  ["deduction-setoff", "Deduction / Set-off"], ["termination-trigger", "Termination Trigger"],
  ["deemed-approval", "Deemed Approval"], ["deemed-rejection", "Deemed Rejection"],
  ["back-to-back", "Back-to-back"], ["waiver-discharge", "Waiver / Discharge"]
].map(([id, name]) => ({ id, name }));

const FALLBACK_ELEMENTS = [
  {id:"site-access",subIssueId:"scope-site",name:"Site access and possession",classification:"Baseline",description:"Allocates the obligation to provide access and possession needed for performance.",tagIds:["breach-default","claim","remedy"],mapping2017:{clause:"2.1",heading:"Right of Access to the Site",summary:"Employer access obligations within the contractual timing framework."},mapping1999:{clause:"2.1",heading:"Right of Access to the Site",summary:"Employer access obligations under the stated arrangements."},crosswalkNote:"The baseline allocation is substantially continuous across the editions.",pcParserNote:"Future parser: identify amendments to access dates, phased possession and consequences of delay."},
  {id:"access-delay-notice",subIssueId:"scope-site",name:"Delayed access notice and entitlement",classification:"Control Mechanism",description:"Routes delayed access and resulting time or cost entitlement through the claims procedure.",tagIds:["condition-precedent","claim","time-bar"],mapping2017:{clause:"2.1 / 20.2",heading:"Access delay and claims procedure",summary:"Connects delayed access with notice and substantiation."},mapping1999:{clause:"2.1 / 20.1",heading:"Access delay and contractor claims",summary:"Connects delayed access with contractor notice and entitlement."},crosswalkNote:"2017 uses the common Clause 20 claims process; 1999 contractor entitlement routes through Sub-Clause 20.1.",pcParserNote:"Future parser: compare amended notice periods and access-related compensation rules."},
  {id:"eot",subIssueId:"time-delay",name:"Extension of Time",classification:"Adjustment",description:"Adjusts the completion baseline for qualifying delay events, subject to the claims procedure.",tagIds:["claim","condition-precedent","time-bar","determination"],mapping2017:{clause:"8.5",heading:"Extension of Time for Completion",summary:"Lists principal grounds for adjusting completion time."},mapping1999:{clause:"8.4",heading:"Extension of Time for Completion",summary:"Provides grounds for extension through the contractor claims route."},crosswalkNote:"2017 moves EOT from 8.4 to 8.5 and integrates it with a more detailed common claims procedure.",pcParserNote:"Future parser: detect changes to EOT grounds, concurrency rules, notice periods and assessment powers."},
  {id:"eot-assessment",subIssueId:"time-delay",name:"EOT assessment and determination",classification:"Control Mechanism",description:"Assesses causation, critical delay and the adjustment to the applicable Time for Completion.",tagIds:["claim","determination"],mapping2017:{clause:"8.5 / 3.7",heading:"EOT assessment and determination",summary:"Connects extension assessment with agreement or determination."},mapping1999:{clause:"8.4 / 3.5",heading:"EOT assessment and determination",summary:"Connects extension assessment with the Engineer's determination."},crosswalkNote:"The determination function moves from 3.5 to the more structured 3.7 process in 2017.",pcParserNote:"Future parser: flag changes to assessment criteria, programme evidence and Engineer discretion."},
  {id:"payment-application",subIssueId:"payment-process",name:"Interim payment application",classification:"Control Mechanism",description:"Identifies the periodic statement and supporting records for amounts claimed as due.",tagIds:["claim","condition-precedent"],mapping2017:{clause:"14.3",heading:"Application for Interim Payment",summary:"Sets the application and supporting statement for interim assessment."},mapping1999:{clause:"14.3",heading:"Application for Interim Payment Certificates",summary:"Sets the contractor's statement and supporting documents."},crosswalkNote:"The application remains at 14.3; 2017 adds procedural detail.",pcParserNote:"Future parser: detect amended submission dates, supporting documents and minimum certificate thresholds."},
  {id:"payment-cert",subIssueId:"payment-process",name:"Interim payment certification",classification:"Control Mechanism",description:"Controls assessment, certification and timing of interim amounts due.",tagIds:["determination","deduction-setoff","claim"],mapping2017:{clause:"14.3–14.7",heading:"Application, Certificate and Payment",summary:"Links application, Engineer certification and employer payment."},mapping1999:{clause:"14.3–14.7",heading:"Application, Certificate and Payment",summary:"Structures interim application, certification and payment."},crosswalkNote:"The principal sequence stays in 14.3–14.7, with more procedural detail in 2017.",pcParserNote:"Future parser: compare certification periods, withholding rights and payment deadlines."},
  {id:"exceptional-events",subIssueId:"risk-external",name:"Exceptional Events / Force Majeure",description:"Defines relief where qualifying events beyond a party's control materially affect performance.",tagIds:["claim","condition-precedent","termination-trigger"],mapping2017:{clause:"18.1–18.6",heading:"Exceptional Events",summary:"Provides relief and possible termination for qualifying events."},mapping1999:{clause:"19.1–19.7",heading:"Force Majeure",summary:"Provides relief and termination rights for defined circumstances."},crosswalkNote:"2017 changes the label and moves the regime from Clause 19 to Clause 18.",pcParserNote:"Future parser: detect changes to event definitions, exclusions, relief and termination thresholds."},
  {id:"exceptional-event-notice",subIssueId:"risk-external",name:"Event notice and mitigation",description:"Controls notice, continuing updates and reasonable steps to reduce the event's effects.",tagIds:["condition-precedent","claim","termination-trigger"],mapping2017:{clause:"18.2–18.3",heading:"Notice and duty to minimise delay",summary:"Controls event notice and reasonable mitigation."},mapping1999:{clause:"19.2–19.3",heading:"Notice and duty to minimise delay",summary:"Controls force majeure notice and mitigation."},crosswalkNote:"Comparable functions move from Clause 19 in 1999 to Clause 18 in 2017.",pcParserNote:"Future parser: compare notice timing, update duties and mitigation standards."},
  {id:"liability-delay-damages",subIssueId:"liability-default",name:"Delay Damages",description:"Models the agreed remedy arising from failure to meet the completion baseline.",tagIds:["breach-default","remedy","deduction-setoff"],mapping2017:{clause:"8.8",heading:"Delay Damages",summary:"Provides the agreed monetary remedy for late completion."},mapping1999:{clause:"8.7",heading:"Delay Damages",summary:"Provides the agreed monetary remedy for late completion."},crosswalkNote:"The remedy remains comparable and is renumbered from 8.7 to 8.8.",pcParserNote:"Future parser: extract amended rates, caps, sectional application and exclusivity language."},
  {id:"delay-damages-cap",subIssueId:"liability-default",name:"Delay damages cap and recovery",description:"Records the agreed ceiling and payment or deduction route for delay damages.",tagIds:["remedy","deduction-setoff"],mapping2017:{clause:"8.8",heading:"Delay Damages",summary:"Connects the amount with the maximum in the Contract Data."},mapping1999:{clause:"8.7",heading:"Delay Damages",summary:"Connects the amount with the maximum in the Appendix to Tender."},crosswalkNote:"The cap is project-specific; the location of project data differs between editions.",pcParserNote:"Future parser: identify cap changes and any new set-off or recovery mechanism."},
  {id:"claims-notice",subIssueId:"claims-procedure",name:"Notice of Claim",description:"Starts the contractual claims process and preserves asserted entitlement, subject to timing rules.",tagIds:["claim","condition-precedent","time-bar","waiver-discharge"],mapping2017:{clause:"20.2.1",heading:"Notice of Claim",summary:"Introduces the common notice route for employer and contractor claims."},mapping1999:{clause:"20.1",heading:"Contractor's Claims",summary:"Sets notice and substantiation steps for contractor claims."},crosswalkNote:"2017 creates a common claims process; 1999 separates contractor and employer claim routes.",pcParserNote:"Future parser: detect amendments to time bars, notice content, deemed waiver and claim ownership."},
  {id:"claims-records",subIssueId:"claims-procedure",name:"Contemporary records and detailed claim",description:"Supports the notified claim with records, particulars and continuing updates.",tagIds:["claim","condition-precedent","determination"],mapping2017:{clause:"20.2.3–20.2.4",heading:"Records and Fully Detailed Claim",summary:"Requires records and particulars for the notified claim."},mapping1999:{clause:"20.1",heading:"Contractor's Claims",summary:"Contains record and detailed-claim requirements in one sequence."},crosswalkNote:"2017 separates records and the detailed claim into express sub-steps.",pcParserNote:"Future parser: compare record access, submission deadlines and continuing-claim requirements."},
  {id:"notices",subIssueId:"mechanics-notices",name:"Contractual notices",description:"Sets form, delivery and addressing requirements for communications with contractual effect.",tagIds:["condition-precedent","time-bar"],mapping2017:{clause:"1.3",heading:"Notices and Other Communications",summary:"Specifies communication form and delivery rules."},mapping1999:{clause:"1.3",heading:"Communications",summary:"Sets writing and delivery requirements."},crosswalkNote:"2017 distinguishes formal Notices from other communications more expressly.",pcParserNote:"Future parser: identify modified addresses, delivery methods, language and formality requirements."},
  {id:"notice-delivery",subIssueId:"mechanics-notices",name:"Notice delivery and effectiveness",description:"Identifies the permitted delivery route, addressee and point at which a notice becomes effective.",tagIds:["condition-precedent","deemed-approval","deemed-rejection"],mapping2017:{clause:"1.3",heading:"Notices and Other Communications",summary:"Identifies delivery methods, addresses and effectiveness rules."},mapping1999:{clause:"1.3",heading:"Communications",summary:"Identifies approved delivery methods and contract addresses."},crosswalkNote:"The core clause number remains stable, with more express notice categorisation in 2017.",pcParserNote:"Future parser: detect deemed receipt rules and amendments to authorised communication platforms."}
];

const FALLBACK_DATA = {
  modules: [
    {id:"scope",name:"Scope & Interface",nameZh:"范围与界面",short:"Define deliverables, boundaries, access and responsibility interfaces.",description:"The physical, functional and responsibility boundaries of the Works.",accent:"#087e78",hasLogic:true},
    {id:"time",name:"Time",nameZh:"工期",short:"Model the time baseline and the routes by which it may move.",description:"Completion, delay allocation and mechanisms for extending time.",accent:"#3177a8",hasLogic:true},
    {id:"payment",name:"Payment / Price",nameZh:"付款与价格",short:"Connect the price baseline with valuation and payment machinery.",description:"The commercial baseline, assessment, certification and payment.",accent:"#b47420",hasLogic:true},
    {id:"risk",name:"Risk Allocation",nameZh:"风险分配",short:"Locate responsibility for physical, legal and external risks.",description:"Allocation of defined project risks and exceptional events.",accent:"#7a63a8",hasLogic:false},
    {id:"liability",name:"Liability & Remedies",nameZh:"责任与救济",short:"Trace default, responsibility and contractual responses.",description:"Consequences of non-performance and available remedies.",accent:"#b0535f",hasLogic:false},
    {id:"claims",name:"Claims & Disputes",nameZh:"索赔与争议",short:"Follow entitlement from notice through determination and dispute.",description:"Procedural pathways for claims and dispute resolution.",accent:"#2e7f68",hasLogic:false},
    {id:"mechanics",name:"Contract Mechanics",nameZh:"合同运行机制",short:"Understand the administrative rules that operate the contract.",description:"Notices, communications, roles and operating machinery.",accent:"#536c78",hasLogic:false}
  ],
  issues: [
    {id:"scope-site",moduleId:"scope",name:"Site access and possession"},
    {id:"time-delay",moduleId:"time",name:"Extension of Time"},
    {id:"payment-process",moduleId:"payment",name:"Interim Payment"},
    {id:"risk-external",moduleId:"risk",name:"Exceptional Events / Force Majeure"},
    {id:"liability-default",moduleId:"liability",name:"Delay Damages"},
    {id:"claims-procedure",moduleId:"claims",name:"Claims procedure"},
    {id:"mechanics-notices",moduleId:"mechanics",name:"Notices"}
  ],
  elements: FALLBACK_ELEMENTS.map(({mapping2017, mapping1999, crosswalkNote, ...element}) => element),
  tags: FALLBACK_TAGS,
  map2017: FALLBACK_ELEMENTS.map(element => ({elementId:element.id, ...element.mapping2017})),
  map1999: FALLBACK_ELEMENTS.map(element => ({elementId:element.id, ...element.mapping1999})),
  crosswalk: FALLBACK_ELEMENTS.map(element => ({elementId:element.id, note:element.crosswalkNote}))
};

const state = {
  data: {},
  activeModuleId: null,
  activeIssueId: null,
  activeElementId: null,
  search: "",
  moduleFilter: "all",
  tagFilter: "all",
  sourceFilter: "both"
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  bindControls();
  applyData(FALLBACK_DATA);
  try {
    const entries = await Promise.all(
      Object.entries(DATA_FILES).map(async ([key, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return [key, await response.json()];
      })
    );
    const liveData = Object.fromEntries(entries);
    validateLoadedData(liveData);
    applyData(liveData);
    dom.status.hidden = true;
  } catch (error) {
    dom.status.hidden = false;
    dom.status.textContent = "Using sample fallback data. For live JSON editing, run this through a local server.";
    console.info("Live JSON was unavailable; embedded fallback data is active.", error);
  }
}

function validateLoadedData(data) {
  const requiredArrays = ["modules", "issues", "elements", "tags", "map2017", "map1999", "crosswalk"];
  const invalid = requiredArrays.filter(key => !Array.isArray(data[key]));
  if (invalid.length) throw new Error(`Invalid or missing datasets: ${invalid.join(", ")}`);
  if (!data.modules.length || !data.elements.length || data.tags.length !== 14) {
    throw new Error("The live JSON dataset is empty or does not contain the approved 14-tag set.");
  }
}

function applyData(data) {
  state.data = data;
  populateFilters();
  dom.moduleCount.textContent = state.data.modules.length;
  dom.elementCount.textContent = state.data.elements.length;
  renderModules();
  if (state.activeModuleId && byId(state.data.modules, state.activeModuleId)) {
    selectModule(state.activeModuleId, false);
  } else {
    state.activeModuleId = state.activeIssueId = state.activeElementId = null;
    dom.explorer.hidden = true;
  }
}

function cacheDom() {
  ["moduleGrid","explorer","explorerTitle","moduleDescription","logicLegend","issueList","issueTitle","elementList","detailPanel","resultCount","searchInput","moduleFilter","tagFilter","sourceFilter","clearFilters","backToModules","resetAllModules","statusMessage","moduleCount","elementCount"].forEach(id => {
    const key = id === "statusMessage" ? "status" : id;
    dom[key] = document.getElementById(id);
  });
}

function bindControls() {
  dom.searchInput.addEventListener("input", event => {
    state.search = event.target.value.trim().toLowerCase();
    refreshView();
  });
  dom.moduleFilter.addEventListener("change", event => {
    state.moduleFilter = event.target.value;
    if (state.moduleFilter !== "all") selectModule(state.moduleFilter, false);
    refreshView();
  });
  dom.tagFilter.addEventListener("change", event => { state.tagFilter = event.target.value; refreshView(); });
  dom.sourceFilter.addEventListener("change", event => { state.sourceFilter = event.target.value; refreshView(); });
  dom.clearFilters.addEventListener("click", clearFilters);
  dom.backToModules.addEventListener("click", resetToHome);
  dom.resetAllModules.addEventListener("click", resetToHome);
}

function populateFilters() {
  dom.moduleFilter.innerHTML = '<option value="all">All modules</option>';
  dom.tagFilter.innerHTML = '<option value="all">All tags</option>';
  state.data.modules.forEach(module => dom.moduleFilter.add(new Option(module.name, module.id)));
  state.data.tags.forEach(tag => dom.tagFilter.add(new Option(tag.name, tag.id)));
}

function clearFilters() {
  state.search = "";
  state.moduleFilter = "all";
  state.tagFilter = "all";
  state.sourceFilter = "both";
  dom.searchInput.value = "";
  dom.moduleFilter.value = "all";
  dom.tagFilter.value = "all";
  dom.sourceFilter.value = "both";
  refreshView();
}

function resetToHome() {
  state.activeModuleId = state.activeIssueId = state.activeElementId = null;
  state.search = "";
  state.moduleFilter = "all";
  state.tagFilter = "all";
  state.sourceFilter = "both";
  dom.searchInput.value = "";
  dom.moduleFilter.value = "all";
  dom.tagFilter.value = "all";
  dom.sourceFilter.value = "both";
  dom.explorer.hidden = true;
  renderModules();
  document.getElementById("modulesTitle").scrollIntoView({behavior: "smooth"});
}

function refreshView() {
  renderModules();
  if (state.activeModuleId) renderExplorer();
}

function renderModules() {
  dom.moduleGrid.innerHTML = "";
  if (!state.data.modules.length) {
    dom.moduleGrid.innerHTML = '<p class="no-results"><strong>No modules were found.</strong><br>Add module records to <code>data/modules.json</code>.</p>';
    return;
  }
  state.data.modules.forEach((module, index) => {
    const matches = moduleMatchesFilters(module);
    const issueCount = issuesForModule(module.id).length;
    const elementCount = elementsForModule(module.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `module-card${module.id === state.activeModuleId ? " selected" : ""}${matches ? "" : " hidden"}`;
    button.style.setProperty("--accent", module.accent);
    button.setAttribute("aria-pressed", module.id === state.activeModuleId ? "true" : "false");
    button.innerHTML = `<span class="number">MODULE ${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(module.name)}</h3><span class="name-zh" lang="zh">${escapeHtml(module.nameZh || "中文名称待补充")}</span><p class="module-description">${escapeHtml(module.short)}</p><div class="module-meta"><span><strong>${issueCount}</strong> sub-issues</span><span><strong>${elementCount}</strong> elements</span><span class="arrow">→</span></div>`;
    button.addEventListener("click", () => selectModule(module.id));
    dom.moduleGrid.appendChild(button);
  });
  if (![...dom.moduleGrid.children].some(card => !card.classList.contains("hidden"))) {
    dom.moduleGrid.innerHTML = '<p class="no-results">No module matches the current search and filters.</p>';
  }
}

function moduleMatchesFilters(module) {
  if (state.moduleFilter !== "all" && state.moduleFilter !== module.id) return false;
  if (!state.search && state.tagFilter === "all") return true;
  if (textMatches(`${module.name} ${module.nameZh || ""} ${module.short} ${module.description}`) && state.tagFilter === "all") return true;
  return elementsForModule(module.id).some(elementMatchesFilters);
}

function selectModule(moduleId, scroll = true) {
  state.activeModuleId = moduleId;
  const validIssues = filteredIssues(moduleId);
  state.activeIssueId = validIssues[0]?.id || issuesForModule(moduleId)[0]?.id || null;
  state.activeElementId = firstElementId(state.activeIssueId);
  dom.explorer.hidden = false;
  renderModules();
  renderExplorer();
  if (scroll) dom.explorer.scrollIntoView({behavior: "smooth", block: "start"});
}

function renderExplorer() {
  const module = byId(state.data.modules, state.activeModuleId);
  if (!module) {
    dom.explorer.hidden = false;
    dom.explorerTitle.textContent = "Module not found";
    dom.moduleDescription.textContent = "The selected module is missing from data/modules.json.";
    dom.issueList.innerHTML = '<p class="no-results">No sub-issues can be shown.</p>';
    dom.elementList.innerHTML = '<p class="no-results">No elements can be shown.</p>';
    renderEmptyDetail("No element details", "Select a valid module or check the JSON links.");
    return;
  }
  dom.explorerTitle.textContent = module.name;
  dom.moduleDescription.textContent = module.description;
  dom.logicLegend.innerHTML = module.hasLogic
    ? '<span class="logic-chip">Baseline</span><span class="logic-chip adjustment">Adjustment</span><span class="logic-chip control">Control Mechanism</span>'
    : "";
  renderIssues(module.id);
  renderElements();
  if (state.activeElementId) renderDetail(state.activeElementId);
  else renderEmptyDetail("No linked element", "Add an element linked to this sub-issue, or adjust the current filters.");
}

function renderIssues(moduleId) {
  const issues = filteredIssues(moduleId);
  if (!issues.some(issue => issue.id === state.activeIssueId)) state.activeIssueId = issues[0]?.id || null;
  const availableElements = state.activeIssueId ? filteredElementsForIssue(state.activeIssueId) : [];
  if (!availableElements.some(element => element.id === state.activeElementId)) {
    state.activeElementId = availableElements[0]?.id || null;
  }
  dom.issueList.innerHTML = "";
  issues.forEach(issue => {
    const count = filteredElementsForIssue(issue.id).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `issue-button${issue.id === state.activeIssueId ? " active" : ""}`;
    button.innerHTML = `<span>${escapeHtml(issue.name)}</span><span>${count}</span>`;
    button.addEventListener("click", () => {
      state.activeIssueId = issue.id;
      state.activeElementId = firstElementId(issue.id);
      renderExplorer();
    });
    dom.issueList.appendChild(button);
  });
  if (!issues.length) dom.issueList.innerHTML = '<p class="no-results"><strong>No sub-issues found.</strong><br>Add linked records to <code>data/sub_issues.json</code>, or reset the filters.</p>';
}

function renderElements() {
  const issue = byId(state.data.issues, state.activeIssueId);
  const elements = issue ? filteredElementsForIssue(issue.id) : [];
  if (!elements.some(element => element.id === state.activeElementId)) state.activeElementId = elements[0]?.id || null;
  dom.issueTitle.textContent = issue?.name || "No matching sub-issue";
  dom.resultCount.textContent = `${elements.length} element${elements.length === 1 ? "" : "s"}`;
  dom.elementList.innerHTML = "";
  elements.forEach(element => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `element-card${element.id === state.activeElementId ? " active" : ""}`;
    button.innerHTML = `<div class="element-top"><strong>${escapeHtml(element.name)}</strong>${classificationChip(element.classification)}</div><p>${escapeHtml(element.description)}</p>`;
    button.addEventListener("click", () => {
      state.activeElementId = element.id;
      renderElements();
      renderDetail(element.id);
    });
    dom.elementList.appendChild(button);
  });
  if (!elements.length) {
    const message = issue
      ? 'No elements are linked to this sub-issue under the current filters. Add a matching record to <code>data/elements.json</code> or reset the filters.'
      : 'No sub-issue is available. Select another module or add linked sub-issue data.';
    dom.elementList.innerHTML = `<p class="no-results"><strong>No elements found.</strong><br>${message}</p>`;
  }
}

function renderDetail(elementId) {
  const element = byId(state.data.elements, elementId);
  if (!element) return renderEmptyDetail("Element not found", "The selected element is missing from data/elements.json.");
  const tags = element.tagIds.map(id => byId(state.data.tags, id)).filter(Boolean);
  const map2017 = state.data.map2017.filter(row => row.elementId === elementId);
  const map1999 = state.data.map1999.filter(row => row.elementId === elementId);
  const crosswalk = state.data.crosswalk.find(row => row.elementId === elementId);
  const parserNote = element.pcParserNote || "Future parser: compare project-specific Particular Conditions against this baseline element, identify changed clause references and record the legal effect. Amendment parsing is not active in this prototype.";
  const source = state.sourceFilter;
  dom.detailPanel.innerHTML = `
    <p class="eyebrow">SELECTED ELEMENT</p>
    <h2>${escapeHtml(element.name)}</h2>
    ${classificationChip(element.classification)}
    <p>${escapeHtml(element.description)}</p>
    <p class="detail-label">Core legal effects</p>
    <div class="tag-row">${tags.length ? tags.map(tag => `<button class="tag" type="button" data-tag-id="${tag.id}">${escapeHtml(tag.name)}</button>`).join("") : '<span class="muted">No legal effect tags are linked to this element.</span>'}</div>
    <p class="detail-label">Clause reference map</p>
    <table class="clause-table"><thead><tr><th>Source</th><th>Clause</th><th>Heading & function</th></tr></thead><tbody>
      ${source !== "1999" ? mappingRows("2017 Red", map2017) : ""}
      ${source !== "2017" ? mappingRows("1999 Red", map1999) : ""}
    </tbody></table>
    <p class="detail-label">2017 ↔ 1999 crosswalk</p>
    <div class="crosswalk">${escapeHtml(crosswalk?.note || "No sample crosswalk note has been added.")}</div>
    <p class="detail-label">Future Particular Conditions parser note</p>
    <div class="future-note"><strong>Future subsystem · not active</strong><br>${escapeHtml(parserNote)}</div>`;
  dom.detailPanel.querySelectorAll("[data-tag-id]").forEach(button => {
    button.addEventListener("click", () => {
      state.tagFilter = button.dataset.tagId;
      dom.tagFilter.value = state.tagFilter;
      refreshView();
    });
  });
}

function mappingRows(label, rows) {
  if (!rows.length) return `<tr><td>${label}</td><td colspan="2">No sample mapping.</td></tr>`;
  return rows.map(row => `<tr><td>${label}</td><td class="clause-ref">${escapeHtml(row.clause)}</td><td><strong>${escapeHtml(row.heading)}</strong><br>${escapeHtml(row.summary)}</td></tr>`).join("");
}

function renderEmptyDetail(title = "Select an element", message = "Clause mapping and crosswalk notes will appear here.") {
  dom.detailPanel.innerHTML = `<div class="empty-state"><span>§</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>`;
}

function filteredIssues(moduleId) {
  return issuesForModule(moduleId).filter(issue => {
    if (textMatches(issue.name) && state.tagFilter === "all") return true;
    return filteredElementsForIssue(issue.id).length > 0;
  });
}

function filteredElementsForIssue(issueId) {
  return state.data.elements.filter(element => element.subIssueId === issueId && elementMatchesFilters(element));
}

function elementMatchesFilters(element) {
  if (state.tagFilter !== "all" && !element.tagIds.includes(state.tagFilter)) return false;
  const has2017 = state.data.map2017.some(row => row.elementId === element.id);
  const has1999 = state.data.map1999.some(row => row.elementId === element.id);
  if (state.sourceFilter === "2017" && !has2017) return false;
  if (state.sourceFilter === "1999" && !has1999) return false;
  if (state.sourceFilter === "both" && !(has2017 && has1999)) return false;
  if (!state.search) return true;
  const issue = byId(state.data.issues, element.subIssueId);
  const module = issue && byId(state.data.modules, issue.moduleId);
  const tags = element.tagIds.map(id => byId(state.data.tags, id)?.name || "").join(" ");
  const clauses = [...state.data.map2017, ...state.data.map1999].filter(row => row.elementId === element.id).map(row => `${row.clause} ${row.heading} ${row.summary}`).join(" ");
  const note = state.data.crosswalk.find(row => row.elementId === element.id)?.note || "";
  return textMatches(`${element.name} ${element.description} ${element.classification || ""} ${issue?.name || ""} ${module?.name || ""} ${tags} ${clauses} ${note}`);
}

function issuesForModule(moduleId) { return state.data.issues.filter(issue => issue.moduleId === moduleId); }
function elementsForModule(moduleId) {
  const ids = new Set(issuesForModule(moduleId).map(issue => issue.id));
  return state.data.elements.filter(element => ids.has(element.subIssueId));
}
function firstElementId(issueId) {
  if (!issueId) return null;
  return filteredElementsForIssue(issueId)[0]?.id || null;
}
function textMatches(value) { return !state.search || String(value).toLowerCase().includes(state.search); }
function byId(list, id) { return list.find(item => item.id === id); }
function classificationChip(value) {
  if (!value) return "";
  const css = value === "Adjustment" ? " adjustment" : value === "Control Mechanism" ? " control" : "";
  return `<span class="logic-chip${css}">${escapeHtml(value)}</span>`;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[character]);
}
