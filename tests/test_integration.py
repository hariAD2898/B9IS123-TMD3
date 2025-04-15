import json
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

# Add parent directory to path to import app
sys.path.append(str(Path(__file__).parent.parent))

from app import app


class IntegrationTestCase(unittest.TestCase):
    """Integration test for the Task Management System."""
    
    def setUp(self):
        """Set up test client and initialize test tasks."""
        self.app = app.test_client()
        self.app.testing = True
        
        # Create a test tasks file
        self.test_tasks_file = 'tests/test_tasks.json'
        
        # Patch the tasks file path
        self.patcher = patch('app.TASKS_FILE', self.test_tasks_file)
        self.patcher.start()
        
        # Initialize with empty test data
        with open(self.test_tasks_file, 'w') as f:
            json.dump([], f)
    
    def tearDown(self):
        """Clean up test file after tests."""
        if os.path.exists(self.test_tasks_file):
            os.remove(self.test_tasks_file)
        self.patcher.stop()
    
    def test_full_task_lifecycle(self):
        """Integration test that tests the full lifecycle of a task:
        Create -> Read -> Update -> Delete.
        """
        # 1. Create a new task
        new_task = {
            "title": "Integration Test Task",
            "description": "This is a task for integration testing",
            "department": "QA",
            "assignedTo": "Test User",
            "priority": "Medium"
        }
        
        # Send the create request
        create_response = self.app.post('/api/tasks',
                                      json=new_task,
                                      content_type='application/json')
        self.assertEqual(create_response.status_code, 201)
        
        # Ensure task was created with the correct data
        created_task = json.loads(create_response.data)
        self.assertEqual(created_task['title'], 'Integration Test Task')
        self.assertEqual(created_task['status'], 'Pending')  # Default status
        task_id = created_task['id']
        
        # 2. Read the task to verify it was created
        read_response = self.app.get(f'/api/tasks/{task_id}')
        self.assertEqual(read_response.status_code, 200)
        read_task = json.loads(read_response.data)
        self.assertEqual(read_task['title'], 'Integration Test Task')
        self.assertEqual(read_task['department'], 'QA')
        
        # 3. Update the task
        updated_task = {
            "title": "Updated Integration Test",
            "description": "This task has been updated during integration testing",
            "department": "QA",
            "assignedTo": "Test Manager",
            "priority": "High",
            "status": "In Progress"
        }
        
        update_response = self.app.put(f'/api/tasks/{task_id}',
                                     json=updated_task,
                                     content_type='application/json')
        self.assertEqual(update_response.status_code, 200)
        
        # Verify the task was updated
        updated_data = json.loads(update_response.data)
        self.assertEqual(updated_data['title'], 'Updated Integration Test')
        self.assertEqual(updated_data['status'], 'In Progress')
        self.assertEqual(updated_data['assignedTo'], 'Test Manager')
        
        # 4. Read the task again to confirm the update
        read_updated_response = self.app.get(f'/api/tasks/{task_id}')
        self.assertEqual(read_updated_response.status_code, 200)
        read_updated_task = json.loads(read_updated_response.data)
        self.assertEqual(read_updated_task['title'], 'Updated Integration Test')
        self.assertEqual(read_updated_task['status'], 'In Progress')
        
        # 5. Delete the task
        delete_response = self.app.delete(f'/api/tasks/{task_id}')
        self.assertEqual(delete_response.status_code, 200)
        
        # 6. Try to read the deleted task to confirm it's gone
        final_read_response = self.app.get(f'/api/tasks/{task_id}')
        self.assertEqual(final_read_response.status_code, 404)
        
        # 7. Verify that task list is empty
        list_response = self.app.get('/api/tasks')
        self.assertEqual(list_response.status_code, 200)
        task_list = json.loads(list_response.data)
        self.assertEqual(len(task_list), 0)


if __name__ == '__main__':
    unittest.main()
