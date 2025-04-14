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



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
