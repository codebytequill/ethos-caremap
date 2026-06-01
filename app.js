const STORAGE_KEY = "ethos-caremap-v1";

const iconPaths = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>',
  timeline: '<path d="M12 6v6l4 2"></path><circle cx="12" cy="12" r="9"></circle>',
  contacts: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"></path><circle cx="12" cy="7" r="4"></circle>',
  records: '<path d="M7 3h8l4 4v14H7z"></path><path d="M15 3v5h5"></path><path d="M9 13h6"></path><path d="M9 17h4"></path>',
  questions: '<path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"></path><path d="M12 18h.01"></path><circle cx="12" cy="12" r="9"></circle>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="M7 10l5 5 5-5"></path><path d="M12 15V3"></path>',
  trash: '<path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 15H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"></path>',
  plus: '<path d="M12 5v14"></path><path d="M5 12h14"></path>',
  x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>'
};

const defaultData = {
  timeline: [
    {
      id: "sample-event-1",
      title: "Hospital admission",
      date: "2026-05-24",
      time: "09:30",
      facility: "Mercy General",
      notes: "Admitted through emergency department. Initial discharge planning contact noted."
    },
    {
      id: "sample-event-2",
      title: "Care conference",
      date: "2026-05-27",
      time: "14:00",
      facility: "Mercy General",
      notes: "Family requested written plan, medication list, and facility transfer options."
    }
  ],
  contacts: [
    {
      id: "sample-contact-1",
      name: "Jordan Ellis",
      role: "Social worker",
      phone: "(555) 013-4480",
      email: "jordan.ellis@example.com",
      notes: "Discharge planning and rehab placement updates."
    },
    {
      id: "sample-contact-2",
      name: "Mercy General Records",
      role: "Facility",
      phone: "(555) 018-2200",
      email: "records@example.com",
      notes: "Ask for itemized request status and delivery confirmation."
    }
  ],
  records: [
    {
      id: "sample-record-1",
      name: "Discharge summary",
      source: "Mercy General",
      requestedDate: "2026-05-27",
      status: "Requested",
      notes: "Requested by email."
    },
    {
      id: "sample-record-2",
      name: "Medication administration record",
      source: "Mercy General",
      requestedDate: "2026-05-28",
      status: "Missing",
      notes: "Follow up with records department."
    }
  ],
  questions: [
    {
      id: "sample-question-1",
      question: "Who confirms rehab transfer approval?",
      owner: "Case manager",
      dueDate: "2026-05-30",
      status: "Open",
      action: "Ask for name, phone number, and written confirmation."
    }
  ],
  preservation: [
    {
      id: "sample-preservation-1",
      type: "Email",
      recipient: "Mercy General Records",
      date: "2026-05-28",
      status: "Sent",
      notes: "Requested confirmation that records and communications are preserved."
    }
  ]
};

let state = loadState();

const selectors = {
  metrics: {
    events: document.querySelector("#metricEvents"),
    contacts: document.querySelector("#metricContacts"),
    missing: document.querySelector("#metricMissing"),
    openQuestions: document.querySelector("#metricOpenQuestions")
  },
  activitySummary: document.querySelector("#activitySummary"),
  nextActions: document.querySelector("#nextActions"),
  timelineList: document.querySelector("#timelineList"),
  contactList: document.querySelector("#contactList"),
  recordBoard: document.querySelector("#recordBoard"),
  questionList: document.querySelector("#questionList"),
  preservationList: document.querySelector("#preservationList"),
  toast: document.querySelector("#toast")
};

function icon(name) {
  const path = iconPaths[name] || iconPaths.dashboard;
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

function hydrateIcons() {
  document.querySelectorAll("[data-icon]").forEach((target) => {
    target.innerHTML = icon(target.dataset.icon);
  });
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(defaultData);

  try {
    const parsed = JSON.parse(saved);
    return {
      timeline: parsed.timeline || [],
      contacts: parsed.contacts || [],
      records: parsed.records || [],
      questions: parsed.questions || [],
      preservation: parsed.preservation || []
    };
  } catch {
    return structuredClone(defaultData);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseIsoDate(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ""));
  if (!match) return null;

  const [, yearValue, monthValue, dayValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return null;
  }

  return { day, month, year: yearValue };
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function formatDate(date, time) {
  if (!date) return "No date";
  const parsed = parseIsoDate(date);
  const formatted = parsed ? `${monthNames[parsed.month - 1]} ${parsed.day}, ${parsed.year}` : date;
  return time ? `${formatted} at ${time}` : formatted;
}

function formToObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function showToast(message) {
  selectors.toast.textContent = message;
  selectors.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => selectors.toast.classList.remove("show"), 2200);
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function deleteButton(collection, id) {
  return `<button class="icon-button" type="button" data-delete="${collection}:${id}" aria-label="Delete item" title="Delete">${icon("trash")}</button>`;
}

function statusPill(status) {
  return `<span class="pill ${slug(status)}">${escapeHtml(status)}</span>`;
}

function renderDashboard() {
  const missingRecords = state.records.filter((record) => record.status === "Missing");
  const followUpRecords = state.records.filter((record) => record.status === "Follow-up needed");
  const openQuestions = state.questions.filter((question) => question.status !== "Resolved");
  const preservationFollowUps = state.preservation.filter((item) => item.status === "Follow-up needed" || item.status === "Drafting");

  selectors.metrics.events.textContent = state.timeline.length;
  selectors.metrics.contacts.textContent = state.contacts.length;
  selectors.metrics.missing.textContent = missingRecords.length;
  selectors.metrics.openQuestions.textContent = openQuestions.length;

  const latestEvent = [...state.timeline].sort((a, b) => `${b.date || ""}${b.time || ""}`.localeCompare(`${a.date || ""}${a.time || ""}`))[0];
  selectors.activitySummary.innerHTML = [
    summaryItem("Latest timeline entry", latestEvent ? `${latestEvent.title} - ${formatDate(latestEvent.date, latestEvent.time)}` : "No timeline events recorded yet."),
    summaryItem("Records status", `${state.records.length} tracked, ${missingRecords.length} missing, ${followUpRecords.length} needing follow-up.`),
    summaryItem("Questions status", `${openQuestions.length} open or needing follow-up, ${state.questions.filter((item) => item.status === "Resolved").length} resolved.`),
    summaryItem("Preservation log", `${state.preservation.length} actions documented, ${preservationFollowUps.length} needing attention.`)
  ].join("");

  const actions = buildActions(missingRecords, followUpRecords, openQuestions, preservationFollowUps);
  selectors.nextActions.innerHTML = actions.length
    ? actions.map((item) => `<div class="action-item"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.body)}</div>`).join("")
    : emptyState("No outstanding organizational actions are detected.");
}

function summaryItem(title, body) {
  return `<div class="summary-item"><strong>${escapeHtml(title)}</strong>${escapeHtml(body)}</div>`;
}

function buildActions(missingRecords, followUpRecords, openQuestions, preservationFollowUps) {
  const actions = [];
  if (missingRecords.length) {
    actions.push({
      title: "Follow up on missing records",
      body: `${missingRecords.length} record${missingRecords.length === 1 ? "" : "s"} marked missing. Confirm the source, request date, and delivery path.`
    });
  }
  if (followUpRecords.length) {
    actions.push({
      title: "Close record request loops",
      body: `${followUpRecords.length} record request${followUpRecords.length === 1 ? "" : "s"} need follow-up. Add tracking numbers or promised dates where available.`
    });
  }
  if (openQuestions.length) {
    actions.push({
      title: "Assign owners to open questions",
      body: `${openQuestions.length} question${openQuestions.length === 1 ? "" : "s"} remain open. Capture who owns the answer and the next check-in date.`
    });
  }
  if (preservationFollowUps.length) {
    actions.push({
      title: "Confirm preservation documentation",
      body: `${preservationFollowUps.length} preservation action${preservationFollowUps.length === 1 ? "" : "s"} still need confirmation or completion.`
    });
  }
  if (!state.contacts.length) {
    actions.push({
      title: "Add core contacts",
      body: "Start with the primary facility, care coordinator, records department, and family point person."
    });
  }
  return actions.slice(0, 5);
}

function renderTimeline() {
  const sorted = [...state.timeline].sort((a, b) => `${b.date || ""}${b.time || ""}`.localeCompare(`${a.date || ""}${a.time || ""}`));
  selectors.timelineList.innerHTML = sorted.length
    ? sorted
        .map(
          (event) => `
            <article class="item-card">
              <div class="item-card-header">
                <div>
                  <h3 class="item-title">${escapeHtml(event.title)}</h3>
                  <div class="meta">
                    <span>${escapeHtml(formatDate(event.date, event.time))}</span>
                    ${event.facility ? `<span>${escapeHtml(event.facility)}</span>` : ""}
                  </div>
                </div>
                ${deleteButton("timeline", event.id)}
              </div>
              ${event.notes ? `<p class="item-note">${escapeHtml(event.notes)}</p>` : ""}
            </article>
          `
        )
        .join("")
    : emptyState("No events recorded yet.");
}

function renderContacts() {
  selectors.contactList.innerHTML = state.contacts.length
    ? state.contacts
        .map(
          (contact) => `
            <article class="item-card">
              <div class="item-card-header">
                <div>
                  <h3 class="item-title">${escapeHtml(contact.name)}</h3>
                  ${statusPill(contact.role)}
                  <div class="meta">
                    ${contact.phone ? `<span>${escapeHtml(contact.phone)}</span>` : ""}
                    ${contact.email ? `<span>${escapeHtml(contact.email)}</span>` : ""}
                  </div>
                </div>
                ${deleteButton("contacts", contact.id)}
              </div>
              ${contact.notes ? `<p class="item-note">${escapeHtml(contact.notes)}</p>` : ""}
            </article>
          `
        )
        .join("")
    : emptyState("No contacts added yet.");
}

function renderRecords() {
  const statuses = ["Requested", "Received", "Missing", "Follow-up needed"];
  selectors.recordBoard.innerHTML = statuses
    .map((status) => {
      const records = state.records.filter((record) => record.status === status);
      return `
        <section class="status-lane" aria-label="${escapeHtml(status)} records">
          <h3>${escapeHtml(status)} <span>${records.length}</span></h3>
          ${
            records.length
              ? records.map(renderRecordCard).join("")
              : `<div class="empty-state">None</div>`
          }
        </section>
      `;
    })
    .join("");
}

function renderRecordCard(record) {
  return `
    <article class="item-card">
      <div class="item-card-header">
        <div>
          <h3 class="item-title">${escapeHtml(record.name)}</h3>
          <div class="meta">
            ${record.source ? `<span>${escapeHtml(record.source)}</span>` : ""}
            ${record.requestedDate ? `<span>${escapeHtml(formatDate(record.requestedDate))}</span>` : ""}
          </div>
        </div>
        ${deleteButton("records", record.id)}
      </div>
      ${record.notes ? `<p class="item-note">${escapeHtml(record.notes)}</p>` : ""}
      <div class="inline-controls">
        <select data-status-update="records:${record.id}" aria-label="Update record status">
          ${["Requested", "Received", "Missing", "Follow-up needed"].map((status) => `<option ${status === record.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </div>
    </article>
  `;
}

function renderQuestions() {
  selectors.questionList.innerHTML = state.questions.length
    ? state.questions
        .map(
          (item) => `
            <article class="item-card">
              <div class="item-card-header">
                <div>
                  <h3 class="item-title">${escapeHtml(item.question)}</h3>
                  ${statusPill(item.status)}
                  <div class="meta">
                    ${item.owner ? `<span>${escapeHtml(item.owner)}</span>` : ""}
                    ${item.dueDate ? `<span>${escapeHtml(formatDate(item.dueDate))}</span>` : ""}
                  </div>
                </div>
                ${deleteButton("questions", item.id)}
              </div>
              ${item.action ? `<p class="item-note">${escapeHtml(item.action)}</p>` : ""}
              <div class="inline-controls">
                <select data-status-update="questions:${item.id}" aria-label="Update question status">
                  ${["Open", "Resolved", "Follow-up needed"].map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </div>
            </article>
          `
        )
        .join("")
    : emptyState("No questions logged yet.");
}

function renderPreservation() {
  selectors.preservationList.innerHTML = state.preservation.length
    ? state.preservation
        .map(
          (item) => `
            <article class="item-card">
              <div class="item-card-header">
                <div>
                  <h3 class="item-title">${escapeHtml(item.type)} to ${escapeHtml(item.recipient)}</h3>
                  ${statusPill(item.status)}
                  <div class="meta">
                    ${item.date ? `<span>${escapeHtml(formatDate(item.date))}</span>` : ""}
                  </div>
                </div>
                ${deleteButton("preservation", item.id)}
              </div>
              ${item.notes ? `<p class="item-note">${escapeHtml(item.notes)}</p>` : ""}
              <div class="inline-controls">
                <select data-status-update="preservation:${item.id}" aria-label="Update preservation status">
                  ${["Sent", "Confirmed", "Follow-up needed", "Drafting"].map((status) => `<option ${status === item.status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </div>
            </article>
          `
        )
        .join("")
    : emptyState("No preservation actions documented yet.");
}

function renderAll() {
  renderDashboard();
  renderTimeline();
  renderContacts();
  renderRecords();
  renderQuestions();
  renderPreservation();
}

function wireNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item === button));
      document.querySelectorAll(".view").forEach((section) => section.classList.toggle("active", section.id === view));
      const title = document.querySelector(`#${view}`).dataset.title;
      document.querySelector("h1").textContent = view === "dashboard" ? "Ethos CareMap" : title;
      history.replaceState(null, "", `#${view}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const initial = location.hash.replace("#", "");
  if (initial && document.querySelector(`#${initial}`)) {
    document.querySelector(`[data-view="${initial}"]`).click();
  }
}

function wireForms() {
  document.querySelector("#timelineForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.timeline.push({ id: uid("event"), ...formToObject(event.currentTarget) });
    finishForm(event.currentTarget, "Timeline event added.");
  });

  document.querySelector("#contactForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.contacts.push({ id: uid("contact"), ...formToObject(event.currentTarget) });
    finishForm(event.currentTarget, "Contact added.");
  });

  document.querySelector("#recordForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.records.push({ id: uid("record"), ...formToObject(event.currentTarget) });
    finishForm(event.currentTarget, "Record request added.");
  });

  document.querySelector("#questionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.questions.push({ id: uid("question"), ...formToObject(event.currentTarget) });
    finishForm(event.currentTarget, "Question added.");
  });

  document.querySelector("#preservationForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.preservation.push({ id: uid("preservation"), ...formToObject(event.currentTarget) });
    finishForm(event.currentTarget, "Preservation action added.");
  });
}

function finishForm(form, message) {
  saveState();
  renderAll();
  form.reset();
  showToast(message);
}

function wireDelegatedActions() {
  document.body.addEventListener("click", (event) => {
    const deleteTarget = event.target.closest("[data-delete]");
    if (!deleteTarget) return;
    const [collection, id] = deleteTarget.dataset.delete.split(":");
    state[collection] = state[collection].filter((item) => item.id !== id);
    saveState();
    renderAll();
    showToast("Item deleted.");
  });

  document.body.addEventListener("change", (event) => {
    const select = event.target.closest("[data-status-update]");
    if (!select) return;
    const [collection, id] = select.dataset.statusUpdate.split(":");
    const item = state[collection].find((entry) => entry.id === id);
    if (!item) return;
    item.status = select.value;
    saveState();
    renderAll();
    showToast("Status updated.");
  });
}

function wireDataTools() {
  document.querySelector("#exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ethos-caremap-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Export created.");
  });

  document.querySelector("#clearData").addEventListener("click", () => {
    const confirmed = window.confirm("Clear all locally stored CareMap data from this browser?");
    if (!confirmed) return;
    state = { timeline: [], contacts: [], records: [], questions: [], preservation: [] };
    saveState();
    renderAll();
    showToast("Local data cleared.");
  });
}

hydrateIcons();
wireNavigation();
wireForms();
wireDelegatedActions();
wireDataTools();
renderAll();
