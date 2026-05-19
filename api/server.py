#!/usr/bin/env python3
"""
Elite AI Mini App — API Server
Shares the same SQLite database as the Telegram bot.
Tracks Mini App opens, questions, and captures leads.
"""

import sqlite3
import logging
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

DB_PATH = Path(__file__).parent.parent.parent / "elite-ai-concierge-bot" / "bot_data.db"
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder=str(FRONTEND_DIST), static_url_path="")
CORS(app)

def get_db():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def index():
    """Serve the Mini App frontend."""
    return send_from_directory(str(FRONTEND_DIST), "index.html")


@app.route("/<path:path>")
def static_files(path):
    """Serve built frontend assets."""
    return send_from_directory(str(FRONTEND_DIST), path)


@app.route("/api/track", methods=["POST"])
def track_event():
    """Track any event from the Mini App."""
    data = request.json
    telegram_id = data.get("telegram_id")
    event_type = data.get("event_type", "mini_app_event")
    event_data = data.get("event_data", "")

    conn = get_db()

    # Register user if not exists
    if telegram_id:
        conn.execute(
            """INSERT INTO users (telegram_id, username, first_name, last_name,
               language_code, first_seen, last_seen, interaction_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, 1)
               ON CONFLICT(telegram_id) DO UPDATE SET
                   username=COALESCE(excluded.username, users.username),
                   first_name=COALESCE(excluded.first_name, users.first_name),
                   last_seen=excluded.last_seen,
                   interaction_count=interaction_count+1""",
            (
                telegram_id,
                data.get("username"),
                data.get("first_name"),
                data.get("last_name"),
                data.get("language_code"),
                datetime.now().isoformat(),
                datetime.now().isoformat(),
            ),
        )

    # Track event
    if telegram_id:
        conn.execute(
            "INSERT INTO events (telegram_id, event_type, event_data, timestamp) VALUES (?, ?, ?, ?)",
            (telegram_id, event_type, event_data, datetime.now().isoformat()),
        )

    conn.commit()
    conn.close()
    return jsonify({"status": "ok"})


@app.route("/api/lead", methods=["POST"])
def capture_lead():
    """Capture a lead from the Mini App demo flow."""
    data = request.json
    telegram_id = data.get("telegram_id")
    name = data.get("name", "Unknown")
    industry = data.get("industry", "Unknown")
    email = data.get("email", "")

    if not email or not telegram_id:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db()

    # Save lead
    conn.execute(
        "INSERT INTO leads (telegram_id, name, industry, email, source, date) VALUES (?, ?, ?, ?, ?, ?)",
        (telegram_id, name, industry, email, "Telegram Mini App", datetime.now().isoformat()),
    )

    # Track the event
    conn.execute(
        "INSERT INTO events (telegram_id, event_type, event_data, timestamp) VALUES (?, ?, ?, ?)",
        (telegram_id, "mini_app_lead_captured", f"{name} | {industry} | {email}", datetime.now().isoformat()),
    )

    conn.commit()
    conn.close()

    logger.info(f"🎯 New lead from Mini App: {name} ({email}) - {industry}")

    # TODO: notify Kat via bot (would need bot instance or webhook)

    return jsonify({"status": "ok", "lead_id": name})


@app.route("/api/question", methods=["POST"])
def track_question():
    """Track a question asked in the Mini App."""
    data = request.json
    telegram_id = data.get("telegram_id")
    question = data.get("question", "")

    if not telegram_id:
        return jsonify({"error": "Missing telegram_id"}), 400

    conn = get_db()
    conn.execute(
        "INSERT INTO events (telegram_id, event_type, event_data, timestamp) VALUES (?, ?, ?, ?)",
        (telegram_id, "mini_app_question", question[:500], datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})


if __name__ == "__main__":
    logger.info(f"📡 API Server starting on port 3001")
    logger.info(f"📦 Database: {DB_PATH}")
    logger.info(f"🌐 Frontend: {FRONTEND_DIST}")
    app.run(host="0.0.0.0", port=3001, debug=True)
