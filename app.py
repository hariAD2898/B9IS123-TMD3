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


# Routes
@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')


# API Routes
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """API endpoint to get all tasks with optional filtering."""
    tasks = load_tasks()
    
    # Get filter parameters
    department = request.args.get('department')
    staff = request.args.get('staff')
    status = request.args.get('status')
    
    # Apply filters if provided
    if department:
        tasks = [task for task in tasks if task.get('department') == department]
    if staff:
        tasks = [task for task in tasks if task.get('assignedTo') == staff]
    if status:
        tasks = [task for task in tasks if task.get('status') == status]
    
    return jsonify(tasks)


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """API endpoint to create a new task."""
    tasks = load_tasks()
    
    try:
        new_task = request.json
        
        # Validate required fields
        required_fields = ['title', 'description', 'department', 'assignedTo', 'priority']
        for field in required_fields:
            if field not in new_task:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Generate a new ID (max existing ID + 1, or 1 if no tasks exist)
        task_id = 1
        if tasks:
            task_id = max(task['id'] for task in tasks) + 1
        
        # Add ID and other metadata
        new_task['id'] = task_id
        new_task['createdAt'] = datetime.now().isoformat()
        new_task['status'] = new_task.get('status', 'Pending')
        
        tasks.append(new_task)
        
        if save_tasks(tasks):
            return jsonify(new_task), 201
        else:
            return jsonify({"error": "Failed to save task"}), 500
            
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """API endpoint to get a specific task by ID."""
    tasks = load_tasks()
    
    task = next((task for task in tasks if task['id'] == task_id), None)
    if task:
        return jsonify(task)
    else:
        return jsonify({"error": "Task not found"}), 404


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """API endpoint to update an existing task."""
    tasks = load_tasks()
    
    task_index = next((i for i, task in enumerate(tasks) if task['id'] == task_id), None)
    if task_index is None:
        return jsonify({"error": "Task not found"}), 404
    
    try:
        updated_task = request.json
        
        # Ensure ID remains the same
        updated_task['id'] = task_id
        
        # Preserve creation date
        updated_task['createdAt'] = tasks[task_index]['createdAt']
        
        # Add update timestamp
        updated_task['updatedAt'] = datetime.now().isoformat()
        
        tasks[task_index] = updated_task
        
        if save_tasks(tasks):
            return jsonify(updated_task)
        else:
            return jsonify({"error": "Failed to save task"}), 500
            
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        return jsonify({"error": str(e)}), 400


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """API endpoint to delete a task."""
    tasks = load_tasks()
    
    task_index = next((i for i, task in enumerate(tasks) if task['id'] == task_id), None)
    if task_index is None:
        return jsonify({"error": "Task not found"}), 404
    
    removed_task = tasks.pop(task_index)
    
    if save_tasks(tasks):
        return jsonify({"message": f"Task {task_id} deleted successfully", "task": removed_task})
    else:
        return jsonify({"error": "Failed to save changes"}), 500


@app.route('/api/departments', methods=['GET'])
def get_departments():
    """API endpoint to get unique departments for filtering."""
    tasks = load_tasks()
    departments = sorted(list(set(task.get('department') for task in tasks if 'department' in task)))
    return jsonify(departments)


@app.route('/api/staff', methods=['GET'])
def get_staff():
    """API endpoint to get unique staff members for filtering."""
    tasks = load_tasks()
    staff = sorted(list(set(task.get('assignedTo') for task in tasks if 'assignedTo' in task)))
    return jsonify(staff)


@app.route('/api/statuses', methods=['GET'])
def get_statuses():
    """API endpoint to get unique statuses for filtering."""
    tasks = load_tasks()
    statuses = sorted(list(set(task.get('status') for task in tasks if 'status' in task)))
    return jsonify(statuses)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
