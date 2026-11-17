# 💰 Student Expense Tracker — Full-Stack Web Application

A full-stack personal expense tracking web application built with **Python (Flask)**, **SQLite**, **Bootstrap 5**, and **Chart.js** with dynamic spending analytics, interactive charts, and animated light/dark theme toggling.

Developed as **Experiment No. 11** / Minor Capstone Project.

---

## 🌟 Features

- **Full-Stack RESTful API**: Built with Python Flask providing complete CRUD operations (`GET`, `POST`, `DELETE`).
- **Relational Persistence**: Uses lightweight, serverless SQLite (`database.db`) with relational schema and aggregate SQL queries.
- **Dynamic Visual Analytics**:
  - **Category Spending Doughnut Chart**: Interactive breakdown using Chart.js.
  - **Daily Spending Bar Chart**: Visual timeline of expenditures across dates.
- **Summary Metrics**: Real-time KPI cards for Total Spent, Total Entries, Top Category, and Daily Average.
- **Responsive UI & Micro-Interactions**:
  - Glassmorphic card styling.
  - Playfair Display typography.
  - Custom animated sun/moon toggle switch with star transitions for Light/Dark mode.
- **Search & Filter**: Real-time client-side search across transaction descriptions, notes, and categories.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Client Browser                      │
│      HTML5 + Bootstrap 5 + Chart.js + Custom CSS       │
└───────────────────────────┬────────────────────────────┘
                            │ Asynchronous HTTP (Fetch API)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Flask Backend Server                   │
│         RESTful API Routes (/api/expenses, /api/summary)│
└───────────────────────────┬────────────────────────────┘
                            │ sqlite3 driver
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SQLite Database                      │
│                    (database.db)                       │
└────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
capstne/
├── app.py                      # Flask backend & RESTful API routes
├── database.db                 # SQLite database file
├── requirements.txt            # Python dependencies
├── seed.py                     # Initial seed data script
├── screenshot.py               # Playwright automated screenshot generator
├── EXPERIMENT_NO_11.docx       # Complete academic lab report document
├── EXPERIMENT_NO_11.md         # Lab report markdown version
├── templates/
│   └── index.html              # Frontend user interface
└── static/
    ├── app.js                  # Frontend async logic & Chart.js rendering
    └── style.css               # Modern styling, variables & dark mode animation
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/student-expense-tracker.git
cd student-expense-tracker
```

### 2. Install dependencies
```bash
pip install -r expense-tracker/requirements.txt
```

### 3. Run the application
```bash
cd expense-tracker
python app.py
```

### 4. Access the web dashboard
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/` | `GET` | Serves the web dashboard |
| `/api/expenses` | `GET` | Returns list of expenses (supports optional `?month=YYYY-MM` query) |
| `/api/expenses` | `POST` | Creates a new expense entry (`name`, `amount`, `category`, `date`, `note`) |
| `/api/expenses/<id>` | `DELETE` | Removes an expense by ID |
| `/api/summary` | `GET` | Returns aggregate metrics: total spend, category breakdown, daily averages |

---

## 📄 License
This project is open-source and available for educational and academic use.

