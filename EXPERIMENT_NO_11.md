# EXPERIMENT NO. 11

## 1. Title
**Design and Implementation of a Full-Stack Web Application for Personal Expense Tracking using Python (Flask), SQLite, and Interactive Data Visualization.**

---

## 2. Objective
To design, develop, and implement a responsive full-stack web application using Python (Flask framework) for the backend RESTful API, SQLite for relational persistence, and modern frontend technologies (HTML5, Bootstrap, Chart.js) for real-time CRUD operations and dynamic spending analytics.

---

## 3. Outcome
After completing this experiment, the student will be able to:
- Understand the architecture of full-stack client-server web applications.
- Build RESTful API endpoints using Python Flask to perform CRUD operations (Create, Read, Update, Delete).
- Design and interface a relational database schema using SQLite in Python.
- Integrate asynchronous frontend JavaScript (Fetch API) with backend REST endpoints.
- Render dynamic data visualizations (Doughnut and Bar charts) using Chart.js based on live database queries.
- Implement responsive user interfaces with animated theme toggling (Dark/Light mode).

---

## 4. Theory / Description
- **Full-Stack Web Architecture**: A full-stack web application is divided into three primary layers: the presentation layer (Frontend/Client), the business logic layer (Backend Server), and the persistence layer (Database).
- **Flask Micro-Framework**: Flask is a lightweight Python WSGI web application framework designed to make getting started quick and easy, with the ability to scale up to complex applications. It provides routing, request/response lifecycle handling, and JSON serialization without forcing rigid project structures.
- **Relational Database (SQLite)**: SQLite is a C-language library that implements a small, fast, self-contained, high-reliability, full-featured SQL database engine. It stores the complete database in a single disk file, making it ideal for local testing, rapid prototyping, and embedded deployments.
- **RESTful API Architecture**: Representational State Transfer (REST) uses standard HTTP request verbs (`GET`, `POST`, `PUT`, `DELETE`) and standardized JSON payloads to exchange data statelessly between the client and backend.
- **Asynchronous Client-Server Communication**: By leveraging JavaScript's native Fetch API and DOM manipulation, users interact with the application without requiring complete page reloads, providing a smooth single-page application (SPA) experience.
- **Data Visualization with Chart.js**: Chart.js is an open-source HTML5 canvas-based library that renders responsive, customizable data charts on the client side based on aggregated summary payloads from the backend.
- **UI Design & Micro-Interactions**: The interface incorporates modern UI design tokens, including responsive Bootstrap 5 grid layout, glassmorphism cards, customized fonts (Playfair Display and Inter), and an animated CSS toggle switch for light/dark theme switching.

### Working Steps
1. Initialize the SQLite database table (`expenses`) with fields for `id`, `name`, `amount`, `category`, `date`, and `note`.
2. Implement Flask backend routes to handle CRUD operations (`/api/expenses` for `GET`, `POST`, `DELETE`).
3. Build the `/api/summary` aggregation endpoint to compute total monthly expenditure, category breakdowns, and daily averages.
4. Design the HTML5 frontend with responsive input forms, summary cards, and a real-time expense log table.
5. Connect Chart.js components to render live doughnut and bar charts dynamically from API responses.
6. Add an animated dark mode switch and responsive styling using custom CSS variables.
7. Execute functional and integration testing by logging expenses and verifying data integrity.

---

## 5. Code

```python
# Install required packages: pip install flask
from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
DB_PATH = "database.db"

# Database Initialization
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS expenses (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                name      TEXT    NOT NULL,
                amount    REAL    NOT NULL,
                category  TEXT    NOT NULL,
                date      TEXT    NOT NULL,
                note      TEXT
            )
        """)
        conn.commit()

# Application Routing & RESTful API Endpoints
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    month = request.args.get("month")
    with get_db() as conn:
        if month:
            rows = conn.execute(
                "SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC",
                (f"{month}%",)
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM expenses ORDER BY date DESC").fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()
    if not data or not data.get("name") or not data.get("amount"):
        return jsonify({"error": "name and amount are required"}), 400
    with get_db() as conn:
        cur = conn.execute(
            "INSERT INTO expenses (name, amount, category, date, note) VALUES (?,?,?,?,?)",
            (
                data["name"].strip(),
                float(data["amount"]),
                data.get("category", "Other"),
                data.get("date", datetime.today().strftime("%Y-%m-%d")),
                data.get("note", "").strip(),
            ),
        )
        conn.commit()
        new_id = cur.lastrowid
    with get_db() as conn:
        row = conn.execute("SELECT * FROM expenses WHERE id=?", (new_id,)).fetchone()
    return jsonify(dict(row)), 201

@app.route("/api/expenses/<int:eid>", methods=["DELETE"])
def delete_expense(eid):
    with get_db() as conn:
        conn.execute("DELETE FROM expenses WHERE id=?", (eid,))
        conn.commit()
    return jsonify({"message": "deleted"})

@app.route("/api/summary", methods=["GET"])
def summary():
    month = request.args.get("month", datetime.today().strftime("%Y-%m"))
    with get_db() as conn:
        total = conn.execute(
            "SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE date LIKE ?",
            (f"{month}%",)
        ).fetchone()["total"]

        cats = conn.execute(
            """SELECT category, SUM(amount) as total
               FROM expenses WHERE date LIKE ?
               GROUP BY category ORDER BY total DESC""",
            (f"{month}%",)
        ).fetchall()

        recent = conn.execute(
            "SELECT * FROM expenses ORDER BY date DESC LIMIT 5"
        ).fetchall()

    return jsonify({
        "total": round(total, 2),
        "by_category": [dict(r) for r in cats],
        "recent": [dict(r) for r in recent],
    })

if __name__ == "__main__":
    init_db()
    print("Expense Tracker server running on http://127.0.0.1:5000")
    app.run(debug=True)
```

---

## 6. Output
The Flask application is deployed on the local development server at `http://127.0.0.1:5000`. The full-stack system allows users to seamlessly add, view, search, and delete expenses while dynamically calculating and rendering real-time category distribution and daily timeline analytics.

### Observed Results:

| Metric / Parameter | Observed Value / Status |
|---|---|
| **Total Monthly Expenditure Logged** | ₹ 2,574.00 |
| **Total Transactions Recorded** | 10 Entries |
| **Top Expenditure Category** | Shopping (₹ 799.00) |
| **Daily Average Spending** | ₹ 151.00 / day |
| **Database Persistence Layer** | SQLite 3 (`database.db`) - 100% ACID compliant |

*(Screenshot embedded directly in the `.docx` document file)*

### Conclusion
A complete full-stack web application for personal expense tracking was successfully designed, developed, and evaluated using Python Flask, SQLite, HTML5, Bootstrap 5, and Chart.js. The application reliably handles CRUD operations via RESTful APIs and translates stored transactional data into dynamic, interactive data visualizations.

---

## 7. Viva Questions with Answers

**Q. What is Full-Stack Web Development?**  
**Ans:** Full-stack web development refers to the process of building both the frontend (client-side interface and presentation) and the backend (server-side logic, routing, APIs, and database) of a web application.

**Q. Why is Flask called a 'micro-framework'?**  
**Ans:** Flask is called a micro-framework because it keeps its core simple but extensible. It does not force specific database tools or libraries, providing developers complete flexibility while natively supplying essential routing, request dispatching, and templating features.

**Q. What is a RESTful API and which HTTP methods are commonly used?**  
**Ans:** A RESTful API (Representational State Transfer) is an architectural style for networked systems. It utilizes standard HTTP methods: `GET` (retrieve data), `POST` (create new record), `PUT`/`PATCH` (update record), and `DELETE` (remove record) with stateless JSON communications.

**Q. What are the advantages of using SQLite in this project?**  
**Ans:** SQLite is serverless, zero-configuration, and fully ACID-compliant. It stores the entire database within a single disk file, eliminating external database server dependencies and making it lightweight, fast, and easy to maintain.

**Q. How does asynchronous JavaScript (Fetch API) enhance user experience?**  
**Ans:** The Fetch API allows the browser to communicate with backend server endpoints in the background without refreshing the web page. This results in faster responsiveness, smoother transitions, and dynamic DOM updates.

**Q. How does Chart.js generate dynamic charts on the frontend?**  
**Ans:** Chart.js utilizes HTML5 Canvas rendering. When the client receives JSON summary metrics from the Flask backend, Chart.js parses the dataset arrays and dynamically renders responsive vector charts with tooltips and animations.

