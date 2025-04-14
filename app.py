import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify, render_template, abort

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")

# Ensure data directory exists
DATA_DIR = "data"
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Initialize tasks.json if it doesn't exist
if not os.path.exists(TASKS_FILE):
    with open(TASKS_FILE, 'w') as f:
        json.dump([], f)


def load_tasks():
    """Load tasks from the JSON file."""
    try:
        with open(TASKS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading tasks: {e}")
        return []


def save_tasks(tasks):
    """Save tasks to the JSON file."""
    try:
        with open(TASKS_FILE, 'w') as f:
            json.dump(tasks, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving tasks: {e}")
        return False


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
