const STORAGE_KEY = "cantcol-monthly-budget-v1";
const CATEGORIES = ["Food", "Housing", "Transport", "Bills", "Health", "Personal", "Other"];
const CATEGORY_LABELS = {
  Food: "Alimente",
  Housing: "Locuință",
  Transport: "Transport",
  Bills: "Facturi",
  Health: "Sănătate",
  Personal: "Personal",
  Other: "Altele",
};
const currency = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "RON",
  minimumFractionDigits: 2,
});

const monthPicker = document.getElementById("month-picker");
const statusMessage = document.getElementById("status");
const demoDataButton = document.getElementById("demo-data-button");
const budgetForm = document.getElementById("budget-form");
const budgetAmount = document.getElementById("budget-amount");
const expenseForm = document.getElementById("expense-form");
const expenseDate = document.getElementById("expense-date");
const expenseCategory = document.getElementById("expense-category");
const expenseAmount = document.getElementById("expense-amount");
const expenseNote = document.getElementById("expense-note");
const exportButton = document.getElementById("export-button");
const importButton = document.getElementById("import-button");
const importFile = document.getElementById("import-file");
const summaryBudget = document.getElementById("summary-budget");
const summarySpent = document.getElementById("summary-spent");
const summaryRemaining = document.getElementById("summary-remaining");
const categoryList = document.getElementById("category-list");
const expenseList = document.getElementById("expense-list");
const tabButtons = [...document.querySelectorAll('[role="tab"]')];

function emptyData() {
  return { version: 1, budgets: {}, expenses: [] };
}

function isMonth(value) {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

function validateData(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1) {
    throw new Error("Unsupported backup format.");
  }
  if (!value.budgets || typeof value.budgets !== "object" || Array.isArray(value.budgets)) {
    throw new Error("Backup budgets are invalid.");
  }
  if (!Array.isArray(value.expenses)) {
    throw new Error("Backup expenses are invalid.");
  }

  const budgets = {};
  for (const [month, amount] of Object.entries(value.budgets)) {
    if (!isMonth(month) || (amount !== null && (!Number.isSafeInteger(amount) || amount < 0))) {
      throw new Error("Backup contains an invalid monthly budget.");
    }
    budgets[month] = amount;
  }

  const ids = new Set();
  const expenses = value.expenses.map((expense) => {
    if (!expense || typeof expense !== "object" || Array.isArray(expense)
      || typeof expense.id !== "string" || expense.id.length === 0
      || ids.has(expense.id)
      || !isValidDate(expense.date)
      || !CATEGORIES.includes(expense.category)
      || !Number.isSafeInteger(expense.amountCents) || expense.amountCents <= 0
      || typeof expense.note !== "string" || expense.note.length > 120) {
      throw new Error("Backup contains an invalid expense.");
    }
    ids.add(expense.id);
    return {
      id: expense.id,
      date: expense.date,
      category: expense.category,
      amountCents: expense.amountCents,
      note: expense.note,
    };
  });

  return { version: 1, budgets, expenses };
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === null ? emptyData() : validateData(JSON.parse(saved));
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMoney(value) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) ? cents : null;
}

function formatMoney(cents) {
  return currency.format(cents / 100);
}

function formatInputMoney(cents) {
  return (cents / 100).toFixed(2);
}

function showStatus(message, state = "info") {
  statusMessage.textContent = message;
  statusMessage.dataset.state = state;
}

function activateTab(selectedTab, moveFocus = false) {
  for (const tab of tabButtons) {
    const isSelected = tab === selectedTab;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !isSelected;
  }
  if (moveFocus) {
    selectedTab.focus();
  }
}

for (const [index, tab] of tabButtons.entries()) {
  tab.addEventListener("click", () => activateTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % tabButtons.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabButtons.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    activateTab(tabButtons[nextIndex], true);
  });
}

let data;
let storageAvailable = true;
monthPicker.value = getLocalDate().slice(0, 7);
let selectedMonth = monthPicker.value;
expenseDate.value = getLocalDate();

try {
  data = loadData();
} catch (error) {
  data = emptyData();
  storageAvailable = false;
  showStatus(`Datele salvate nu pot fi citite: ${error.message} Pentru a continua, restaurează o copie de siguranță validă.`, "error");
}

function saveData(nextData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
    data = nextData;
    storageAvailable = true;
    return true;
  } catch (error) {
    showStatus(`Modificările nu au putut fi salvate: ${error.message}`, "error");
    return false;
  }
}

function setFormAvailability() {
  budgetAmount.disabled = !storageAvailable;
  budgetForm.querySelector("button").disabled = !storageAvailable;
  expenseForm.querySelectorAll("input, select, button").forEach((control) => {
    control.disabled = !storageAvailable;
  });
  exportButton.disabled = !storageAvailable;
}

function renderBudget() {
  const month = monthPicker.value;
  const budget = data.budgets[month];
  budgetAmount.value = budget === undefined || budget === null ? "" : formatInputMoney(budget);
  summaryBudget.textContent = budget === undefined || budget === null ? "Nestabilit" : formatMoney(budget);
}

function renderSummary() {
  const month = monthPicker.value;
  const monthlyExpenses = data.expenses.filter((expense) => expense.date.startsWith(month));
  const spent = monthlyExpenses.reduce((total, expense) => total + expense.amountCents, 0);
  const budget = data.budgets[month];

  summarySpent.textContent = formatMoney(spent);
  if (budget === undefined || budget === null) {
    summaryRemaining.textContent = "Stabilește bugetul";
    summaryRemaining.className = "summary-value";
  } else {
    const remaining = budget - spent;
    summaryRemaining.textContent = formatMoney(remaining);
    summaryRemaining.className = `summary-value ${remaining < 0 ? "negative" : "positive"}`;
  }
  return { monthlyExpenses, spent, budget };
}

function renderCategories(monthlyExpenses, spent, budget) {
  const totals = new Map(CATEGORIES.map((category) => [category, 0]));
  for (const expense of monthlyExpenses) {
    totals.set(expense.category, totals.get(expense.category) + expense.amountCents);
  }

  categoryList.replaceChildren();
  if (monthlyExpenses.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Adaugă o cheltuială pentru a vedea rezumatul pe categorii.";
    categoryList.appendChild(empty);
    return;
  }

  for (const category of CATEGORIES) {
    const amount = totals.get(category);
    if (amount === 0) {
      continue;
    }

    const item = document.createElement("li");
    item.className = "category-row";
    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = CATEGORY_LABELS[category];

    const track = document.createElement("div");
    track.className = "category-track";
    track.setAttribute("aria-label", `${CATEGORY_LABELS[category]}: ${formatMoney(amount)}`);
    const progress = document.createElement("div");
    progress.className = "category-progress";
    const denominator = budget > 0 ? budget : spent;
    progress.style.width = `${denominator > 0 ? Math.min(100, (amount / denominator) * 100) : 0}%`;
    track.appendChild(progress);

    const value = document.createElement("span");
    value.className = "category-amount";
    value.textContent = formatMoney(amount);
    item.append(name, track, value);
    categoryList.appendChild(item);
  }
}

function renderExpenses(monthlyExpenses) {
  expenseList.replaceChildren();
  const sortedExpenses = [...monthlyExpenses].sort((a, b) => {
    return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
  });

  if (sortedExpenses.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = "Nu există cheltuieli pentru această lună.";
    expenseList.appendChild(empty);
    return;
  }

  for (const expense of sortedExpenses) {
    const item = document.createElement("li");
    item.className = "expense-row";

    const description = document.createElement("div");
    description.className = "expense-description";
    const title = document.createElement("p");
    title.className = "expense-title";
    title.textContent = expense.note || CATEGORY_LABELS[expense.category];
    const date = document.createElement("p");
    date.className = "expense-meta";
    date.textContent = `${new Date(`${expense.date}T12:00:00`).toLocaleDateString("ro-RO")} · ${CATEGORY_LABELS[expense.category]}`;
    description.append(title, date);

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = formatMoney(expense.amountCents);

    const removeButton = document.createElement("button");
    removeButton.className = "delete-expense";
    removeButton.type = "button";
    removeButton.textContent = "Șterge";
    removeButton.setAttribute("aria-label", `Șterge cheltuiala: ${expense.note || CATEGORY_LABELS[expense.category]}`);
    removeButton.disabled = !storageAvailable;
    removeButton.addEventListener("click", () => {
      const nextData = {
        ...data,
        expenses: data.expenses.filter((entry) => entry.id !== expense.id),
      };
      if (saveData(nextData)) {
        render();
        showStatus("Cheltuiala a fost ștearsă.", "success");
      }
    });

    item.append(description, amount, removeButton);
    expenseList.appendChild(item);
  }
}

function render() {
  setFormAvailability();
  demoDataButton.hidden = !storageAvailable
    || data.expenses.length > 0
    || Object.keys(data.budgets).length > 0;
  renderBudget();
  const { monthlyExpenses, spent, budget } = renderSummary();
  renderCategories(monthlyExpenses, spent, budget);
  renderExpenses(monthlyExpenses);
}

demoDataButton.addEventListener("click", () => {
  if (!storageAvailable || data.expenses.length > 0 || Object.keys(data.budgets).length > 0) {
    return;
  }
  if (!isMonth(monthPicker.value)) {
    showStatus("Selectează o lună validă înainte de a încărca datele demonstrative.", "error");
    return;
  }

  const [year, monthNumber] = monthPicker.value.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const currentDate = getLocalDate();
  const lastDay = monthPicker.value === currentDate.slice(0, 7)
    ? Number(currentDate.slice(-2))
    : daysInMonth;
  const expenseDateFor = (daysAgo) => {
    const day = Math.max(1, lastDay - daysAgo);
    return `${monthPicker.value}-${String(day).padStart(2, "0")}`;
  };
  const nextData = {
    ...data,
    budgets: { ...data.budgets, [monthPicker.value]: 300000 },
    expenses: [
      {
        id: `demo-${monthPicker.value}-food`,
        date: expenseDateFor(7),
        category: "Food",
        amountCents: 4590,
        note: "Cumpărături alimentare",
      },
      {
        id: `demo-${monthPicker.value}-transport`,
        date: expenseDateFor(3),
        category: "Transport",
        amountCents: 1200,
        note: "Transport public",
      },
      {
        id: `demo-${monthPicker.value}-bills`,
        date: expenseDateFor(0),
        category: "Bills",
        amountCents: 6500,
        note: "Factură de utilități",
      },
    ],
  };
  if (saveData(nextData)) {
    render();
    showStatus("Datele demonstrative au fost încărcate.", "success");
  }
});

budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isMonth(monthPicker.value)) {
    showStatus("Selectează o lună validă înainte de a salva bugetul.", "error");
    return;
  }
  const amount = parseMoney(budgetAmount.value);
  if (amount === null) {
    showStatus("Introdu o sumă validă pentru buget, cu cel mult două zecimale.", "error");
    return;
  }

  const nextData = {
    ...data,
    budgets: { ...data.budgets, [monthPicker.value]: amount },
  };
  if (saveData(nextData)) {
    render();
    showStatus("Bugetul lunar a fost salvat.", "success");
  }
});

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isMonth(monthPicker.value)) {
    showStatus("Selectează o lună validă înainte de a adăuga o cheltuială.", "error");
    return;
  }
  const amount = parseMoney(expenseAmount.value);
  if (amount === null || amount <= 0) {
    showStatus("Introdu o sumă validă mai mare decât zero.", "error");
    return;
  }
  if (!isValidDate(expenseDate.value) || !expenseDate.value.startsWith(monthPicker.value)) {
    showStatus("Alege o dată din luna selectată.", "error");
    return;
  }

  const expense = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    date: expenseDate.value,
    category: expenseCategory.value,
    amountCents: amount,
    note: expenseNote.value.trim(),
  };
  const nextData = { ...data, expenses: [...data.expenses, expense] };
  if (saveData(nextData)) {
    expenseForm.reset();
    expenseCategory.value = CATEGORIES[0];
    expenseDate.value = monthPicker.value === getLocalDate().slice(0, 7)
      ? getLocalDate()
      : `${monthPicker.value}-01`;
    render();
    showStatus("Cheltuiala a fost adăugată.", "success");
  }
});

monthPicker.addEventListener("change", () => {
  const month = monthPicker.value;
  if (!isMonth(month)) {
    monthPicker.value = selectedMonth;
    showStatus("Selectează o lună validă.", "error");
    return;
  }
  selectedMonth = month;
  expenseDate.value = month === getLocalDate().slice(0, 7) ? getLocalDate() : `${month}-01`;
  render();
});

exportButton.addEventListener("click", () => {
  const backup = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(backup);
  const link = document.createElement("a");
  link.href = url;
  link.download = `monthly-budget-backup-${monthPicker.value}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showStatus("Copia de siguranță a fost descărcată.", "success");
});

importButton.addEventListener("click", () => importFile.click());

importFile.addEventListener("change", async () => {
  const file = importFile.files[0];
  if (!file) {
    return;
  }

  try {
    const importedData = validateData(JSON.parse(await file.text()));
    if (!window.confirm("Restaurezi această copie de siguranță? Datele salvate în acest browser vor fi înlocuite.")) {
      importFile.value = "";
      return;
    }
    if (saveData(importedData)) {
      render();
      showStatus("Copia de siguranță a fost restaurată.", "success");
    }
  } catch (error) {
    showStatus(`Copia de siguranță nu a putut fi restaurată: ${error.message}`, "error");
  } finally {
    importFile.value = "";
  }
});

render();
