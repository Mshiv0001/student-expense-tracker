import urllib.request, json

expenses = [
    {"name": "Canteen Lunch",     "amount": 85,  "category": "Food",          "date": "2026-11-10", "note": "Dal rice + curd"},
    {"name": "Bus Pass Recharge", "amount": 300, "category": "Transport",     "date": "2026-11-11", "note": "Monthly bus pass"},
    {"name": "Python Textbook",   "amount": 450, "category": "Study",         "date": "2026-11-12", "note": "Reference book"},
    {"name": "Movie Ticket",      "amount": 220, "category": "Entertainment", "date": "2026-11-13", "note": "Weekend outing"},
    {"name": "Maggi and Chai",    "amount": 40,  "category": "Food",          "date": "2026-11-14", "note": "Evening snack"},
    {"name": "Gym Membership",    "amount": 500, "category": "Health",        "date": "2026-11-15", "note": "Monthly fee"},
    {"name": "New Earphones",     "amount": 799, "category": "Shopping",      "date": "2026-11-16", "note": "boAt Bassheads"},
    {"name": "Printing Notes",    "amount": 60,  "category": "Study",         "date": "2026-11-17", "note": "Exam prep printouts"},
    {"name": "Vada Pav",          "amount": 25,  "category": "Food",          "date": "2026-11-17", "note": "Quick snack"},
    {"name": "Uber to College",   "amount": 95,  "category": "Transport",     "date": "2026-11-15", "note": "Missed the bus"},
]

print("Adding expenses...\n")
for e in expenses:
    data = json.dumps(e).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/expenses",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as res:
        r = json.loads(res.read())
        print("  Added #" + str(r["id"]) + "  Rs." + str(r["amount"]) + "  [" + r["category"] + "]  " + r["name"])

print("\nFetching summary...")
with urllib.request.urlopen("http://127.0.0.1:5000/api/summary?month=2026-11") as res:
    s = json.loads(res.read())
    print("\n  Monthly Total : Rs. " + str(s["total"]))
    print("  By Category   :")
    for c in s["by_category"]:
        print("    " + c["category"].ljust(16) + "Rs. " + str(c["total"]))

