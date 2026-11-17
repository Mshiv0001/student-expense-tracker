/* ── State ────────────────────────────────────────────────────────────────── */
let allExpenses = [];
let pieChart, barChart;

const COLORS = [
  '#6366f1','#f59e0b','#10b981','#ef4444',
  '#3b82f6','#ec4899','#8b5cf6','#14b8a6'
];

/* ── Init ─────────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Set default date inputs
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;

  const monthPicker = document.getElementById("monthPicker");
  monthPicker.value = today.slice(0, 7);
  monthPicker.addEventListener("change", loadAll);

  // Form submit
  document.getElementById("expenseForm").addEventListener("submit", addExpense);

  // Search
  document.getElementById("searchBox").addEventListener("input", renderTable);

  // Dark mode toggle (checkbox)
  document.getElementById("themeToggle").addEventListener("change", toggleTheme);

  loadAll();
});

/* ── API helpers ─────────────────────────────────────────────────────────── */
function currentMonth() {
  return document.getElementById("monthPicker").value; // "YYYY-MM"
}

async function loadAll() {
  const month = currentMonth();
  const [expenses, summary] = await Promise.all([
    fetch(`/api/expenses?month=${month}`).then(r => r.json()),
    fetch(`/api/summary?month=${month}`).then(r => r.json()),
  ]);
  allExpenses = expenses;
  updateCards(summary, expenses);
  renderTable();
  renderCharts(summary, expenses);
}

/* ── Add Expense ─────────────────────────────────────────────────────────── */
async function addExpense(e) {
  e.preventDefault();
  const payload = {
    name:     document.getElementById("name").value,
    amount:   document.getElementById("amount").value,
    category: document.getElementById("category").value,
    date:     document.getElementById("date").value,
    note:     document.getElementById("note").value,
  };
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) {
    showToast("Expense added ✅", "success");
    e.target.reset();
    document.getElementById("date").value = new Date().toISOString().split("T")[0];
    document.getElementById("category").value = "Food";
    loadAll();
  } else {
    showToast("Something went wrong ❌", "danger");
  }
}

/* ── Delete ──────────────────────────────────────────────────────────────── */
async function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  showToast("Deleted 🗑️", "danger");
  loadAll();
}

/* ── Summary Cards ───────────────────────────────────────────────────────── */
function updateCards(summary, expenses) {
  document.getElementById("totalAmt").textContent = `₹${summary.total.toLocaleString("en-IN")}`;
  document.getElementById("countAmt").textContent = expenses.length;

  const topCat = summary.by_category[0];
  document.getElementById("topCat").textContent = topCat ? topCat.category : "—";

  const days = new Date().getDate();
  const avg = expenses.length ? (summary.total / days) : 0;
  document.getElementById("avgAmt").textContent = `₹${avg.toFixed(0)}`;
}

/* ── Table ───────────────────────────────────────────────────────────────── */
function renderTable() {
  const q = document.getElementById("searchBox").value.toLowerCase();
  const filtered = allExpenses.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.category.toLowerCase().includes(q) ||
    (e.note || "").toLowerCase().includes(q)
  );

  const tbody = document.getElementById("expenseBody");
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">
      <i class="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>No expenses found.
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    // Strip emoji prefix added in select options (e.g. "🍔 Food" → "Food")
    const rawCat = e.category.includes(" ") && e.category.length < 20
      ? e.category.split(" ").slice(1).join(" ")
      : e.category;
    return `
    <tr class="fade-in">
      <td>
        <div class="row-name">${escHtml(e.name)}</div>
        ${e.note ? `<div class="row-note">${escHtml(e.note)}</div>` : ""}
      </td>
      <td><span class="badge-cat cat-${rawCat}">${escHtml(e.category)}</span></td>
      <td class="row-note">${formatDate(e.date)}</td>
      <td class="text-end row-amount">₹${Number(e.amount).toLocaleString("en-IN")}</td>
      <td><button class="btn-del" onclick="deleteExpense(${e.id})" title="Delete"><i class="bi bi-trash3"></i></button></td>
    </tr>
  `}).join("");
}

/* ── Charts ──────────────────────────────────────────────────────────────── */
function renderCharts(summary, expenses) {
  renderPie(summary.by_category);
  renderBar(expenses);
}

function renderPie(byCat) {
  const ctx = document.getElementById("pieChart").getContext("2d");
  if (pieChart) pieChart.destroy();

  if (!byCat.length) {
    ctx.clearRect(0, 0, 400, 400);
    return;
  }

  pieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: byCat.map(c => c.category),
      datasets: [{
        data: byCat.map(c => c.total),
        backgroundColor: COLORS.slice(0, byCat.length),
        borderWidth: 2,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 12, padding: 12 } },
        tooltip: {
          callbacks: {
            label: ctx => ` ₹${Number(ctx.raw).toLocaleString("en-IN")}`
          }
        }
      },
      cutout: "60%",
    }
  });
}

function renderBar(expenses) {
  // Group by day
  const byDay = {};
  expenses.forEach(e => {
    byDay[e.date] = (byDay[e.date] || 0) + e.amount;
  });
  const sorted = Object.entries(byDay).sort(([a],[b]) => a.localeCompare(b));
  const labels = sorted.map(([d]) => d.slice(5)); // "MM-DD"
  const data   = sorted.map(([,v]) => v);

  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChart) barChart.destroy();

  if (!sorted.length) return;

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "₹ Spent",
        data,
        backgroundColor: "#6366f1aa",
        borderColor: "#6366f1",
        borderWidth: 1.5,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: v => `₹${v}` }
        }
      }
    }
  });
}

/* ── Dark Mode ───────────────────────────────────────────────────────────── */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-bs-theme") === "dark";
  html.setAttribute("data-bs-theme", isDark ? "light" : "dark");
}

/* ── Toast ───────────────────────────────────────────────────────────────── */
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.className = `toast align-items-center border-0 bg-${type}-subtle text-${type}-emphasis`;
  document.getElementById("toastMsg").textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function formatDate(d) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day:"numeric", month:"short", year:"numeric"
  });
}

