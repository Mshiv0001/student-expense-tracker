from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
DB_PATH = "database.db"

# ── DB Setup ─────────────────────────────────────────────────────────────────
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

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/expenses", methods=["GET"])
def get_expenses():
    month = request.args.get("month")  # optional filter: "2026-11"
    with get_db() as conn:
        if month:
            rows = conn.execute(
                "SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC",
                (f"{month}%",)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM expenses ORDER BY date DESC"
            ).fetchall()
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
    print("✅  Expense Tracker running → http://127.0.0.1:5000")
    app.run(debug=True)

