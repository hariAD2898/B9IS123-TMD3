import json
import os
import sys
import unittest
from pathlib import Path

# Add parent directory to path to import app
sys.path.append(str(Path(__file__).parent.parent))

from app import app, load_tasks, save_tasks


class TaskAPITestCase(unittest.TestCase):
    """Test case for the Task Management API."""
    
    def setUp(self):
        """Set up test client and initialize test tasks."""
        self.app = app.test_client()
        self.app.testing = True
        
        # Create a test tasks file
        self.test_tasks_file = 'tests/test_tasks.json'
        app.config['TASKS_FILE'] = self.test_tasks_file
        
        # Initialize with test data
        self.test_tasks = [
            {
                "id": 1,
                "title": "Test Task 1",
                "description": "This is a test task",
                "department": "IT",
                "assignedTo": "John Doe",
                "priority": "Medium",
                "status": "Pending",
                "createdAt": "2023-04-15T12:00:00Z"
            },
            {
                "id": 2,
                "title": "Test Task 2",
                "description": "This is another test task",
                "department": "Marketing",
                "assignedTo": "Jane Smith",
                "priority": "High",
                "status": "In Progress",
                "createdAt": "2023-04-16T10:00:00Z"
            }
        ]
        
        with open(self.test_tasks_file, 'w') as f:
            json.dump(self.test_tasks, f)
    
    def tearDown(self):
        """Clean up test file after tests."""
        if os.path.exists(self.test_tasks_file):
            os.remove(self.test_tasks_file)
    
    def test_get_all_tasks(self):
        """Test getting all tasks."""
        response = self.app.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['title'], 'Test Task 1')
        self.assertEqual(data[1]['title'], 'Test Task 2')
    
    def test_get_task_by_id(self):
        """Test getting a task by ID."""
        response = self.app.get('/api/tasks/1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Test Task 1')
        self.assertEqual(data['department'], 'IT')
    
    def test_get_nonexistent_task(self):
        """Test getting a task that doesn't exist."""
        response = self.app.get('/api/tasks/999')
        self.assertEqual(response.status_code, 404)
    
    def test_create_task(self):
        """Test creating a new task."""
        new_task = {
            "title": "New Test Task",
            "description": "This is a new test task",
            "department": "HR",
            "assignedTo": "Bob Johnson",
            "priority": "Low"
        }
        
        response = self.app.post('/api/tasks',
                                json=new_task,
                                content_type='application/json')
        self.assertEqual(response.status_code, 201)
        
        # Check that the task was created with the right data
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'New Test Task')
        self.assertEqual(data['department'], 'HR')
        self.assertEqual(data['status'], 'Pending')  # Default status
        
        # Check that ID was assigned
        self.assertIn('id', data)
        
        # Verify it was added to the tasks list
        tasks = load_tasks()
        self.assertEqual(len(tasks), 3)
    
    def test_create_task_missing_fields(self):
        """Test creating a task with missing required fields."""
        new_task = {
            "title": "Incomplete Task",
            # Missing description
            "department": "HR",
            # Missing assignedTo
            "priority": "Low"
        }
        
        response = self.app.post('/api/tasks',
                                json=new_task,
                                content_type='application/json')
        self.assertEqual(response.status_code, 400)
    
    def test_update_task(self):
        """Test updating an existing task."""
        updated_task = {
            "title": "Updated Task 1",
            "description": "This task has been updated",
            "department": "IT",
            "assignedTo": "John Doe",
            "priority": "High",
            "status": "Completed"
        }
        
        response = self.app.put('/api/tasks/1',
                               json=updated_task,
                               content_type='application/json')
        self.assertEqual(response.status_code, 200)
        
        # Check that the task was updated
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Updated Task 1')
        self.assertEqual(data['status'], 'Completed')
        
        # Verify it was updated in the tasks list
        tasks = load_tasks()
        task = next((t for t in tasks if t['id'] == 1), None)
        self.assertEqual(task['title'], 'Updated Task 1')
    
    def test_update_nonexistent_task(self):
        """Test updating a task that doesn't exist."""
        updated_task = {
            "title": "This shouldn't work",
            "description": "This task doesn't exist",
            "department": "IT",
            "assignedTo": "John Doe",
            "priority": "Medium",
            "status": "Pending"
        }
        
        response = self.app.put('/api/tasks/999',
                               json=updated_task,
                               content_type='application/json')
        self.assertEqual(response.status_code, 404)
    
    def test_delete_task(self):
        """Test deleting a task."""
        response = self.app.delete('/api/tasks/2')
        self.assertEqual(response.status_code, 200)
        
        # Verify it was removed from the tasks list
        tasks = load_tasks()
        self.assertEqual(len(tasks), 1)
        task_ids = [t['id'] for t in tasks]
        self.assertNotIn(2, task_ids)
    
    def test_delete_nonexistent_task(self):
        """Test deleting a task that doesn't exist."""
        response = self.app.delete('/api/tasks/999')
        self.assertEqual(response.status_code, 404)
    
    def test_filter_tasks(self):
        """Test filtering tasks."""
        # Add another task for better filtering
        third_task = {
            "id": 3,
            "title": "Test Task 3",
            "description": "Another IT task",
            "department": "IT",
            "assignedTo": "Alice Brown",
            "priority": "Low",
            "status": "Completed",
            "createdAt": "2023-04-17T14:00:00Z"
        }
        tasks = load_tasks()
        tasks.append(third_task)
        save_tasks(tasks)
        
        # Test filter by department
        response = self.app.get('/api/tasks?department=IT')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)  # Should find 2 IT tasks
        
        # Test filter by status
        response = self.app.get('/api/tasks?status=Completed')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)  # Should find 1 completed task
        
        # Test filter by staff
        response = self.app.get('/api/tasks?staff=Jane+Smith')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)  # Should find 1 task assigned to Jane
        
        # Test multiple filters
        response = self.app.get('/api/tasks?department=IT&status=Completed')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)  # Should find 1 completed IT task


if __name__ == '__main__':
    unittest.main()
