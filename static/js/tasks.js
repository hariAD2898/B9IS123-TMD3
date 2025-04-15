// Tasks-specific JavaScript for the Task Management System

// Global variable to store current task ID when editing
let currentTaskId = null;

function loadTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            displayTasks(tasks);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
            showAlert('Error loading tasks', 'danger');
        });
}

function displayTasks(tasks) {
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `
            <div class="alert alert-info text-center p-5">
                <i class="bi bi-inbox display-1 mb-3"></i>
                <h4>No Tasks Found</h4>
                <p class="mb-4">There are no tasks matching your criteria. Create a new task to get started.</p>
                <button class="btn btn-primary" id="empty-add-task">
                    <i class="bi bi-plus-circle"></i> Add Your First Task
                </button>
            </div>
        `;
        
        // Add event listener to the "Add Your First Task" button
        document.getElementById('empty-add-task')?.addEventListener('click', function() {
            clearTaskForm();
            document.getElementById('form-title').textContent = 'Add New Task';
            document.getElementById('task-form-container').classList.remove('d-none');
            document.getElementById('task-form-container').scrollIntoView({ behavior: 'smooth' });
        });
        
        return;
    }
    
    // Create table to display tasks
    const table = document.createElement('table');
    table.className = 'table table-striped table-hover shadow-sm';
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr class="table-light">
            <th scope="col">#</th>
            <th scope="col">Title</th>
            <th scope="col">Department</th>
            <th scope="col">Assigned To</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    tasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.classList.add('align-middle', 'fadeIn');
        
        // Set background color based on priority
        let priorityClass = '';
        let priorityBadge = '';
        
        switch(task.priority?.toLowerCase()) {
            case 'high':
                priorityClass = 'table-danger';
                priorityBadge = '<span class="badge bg-danger">High</span>';
                break;
            case 'medium':
                priorityClass = 'table-warning';
                priorityBadge = '<span class="badge bg-warning text-dark">Medium</span>';
                break;
            case 'low':
                priorityClass = 'table-info';
                priorityBadge = '<span class="badge bg-info text-dark">Low</span>';
                break;
            default:
                priorityBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        if (priorityClass) {
            tr.className = priorityClass;
        }
        
        // Create status badge
        let statusBadge = '';
        switch(task.status?.toLowerCase()) {
            case 'pending':
                statusBadge = '<span class="badge bg-info">Pending</span>';
                break;
            case 'in progress':
                statusBadge = '<span class="badge bg-warning text-dark">In Progress</span>';
                break;
            case 'review':
                statusBadge = '<span class="badge bg-primary">Review</span>';
                break;
            case 'completed':
                statusBadge = '<span class="badge bg-success">Completed</span>';
                break;
            default:
                statusBadge = '<span class="badge bg-secondary">Unknown</span>';
        }
        
        tr.innerHTML = `
            <td><strong>${task.id}</strong></td>
            <td><strong>${task.title}</strong></td>
            <td><span class="badge bg-light text-dark border">${task.department}</span></td>
            <td>${task.assignedTo}</td>
            <td class="text-center">${priorityBadge}</td>
            <td class="text-center">${statusBadge}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info view-task" data-id="${task.id}" title="View Task">
                        <i class="bi bi-eye"></i> View
                    </button>
                    <button class="btn btn-outline-primary edit-task" data-id="${task.id}" title="Edit Task">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger delete-task" data-id="${task.id}" title="Delete Task">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    tasksContainer.appendChild(table);
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            viewTask(taskId);
        });
    });
    
    document.querySelectorAll('.edit-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            editTask(taskId);
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', function() {
            const taskId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(taskId);
            }
        });
    });
}

function viewTask(taskId) {
    fetch(`/api/tasks/${taskId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Task not found');
            }
            return response.json();
        })
        .then(task => {
            // Prepare status badge for modal
            let statusBadge = '';
            switch(task.status?.toLowerCase()) {
                case 'pending':
                    statusBadge = '<span class="badge bg-info">Pending</span>';
                    break;
                case 'in progress':
                    statusBadge = '<span class="badge bg-warning text-dark">In Progress</span>';
                    break;
                case 'review':
                    statusBadge = '<span class="badge bg-primary">Review</span>';
                    break;
                case 'completed':
                    statusBadge = '<span class="badge bg-success">Completed</span>';
                    break;
                default:
                    statusBadge = '<span class="badge bg-secondary">Unknown</span>';
            }
            
            // Prepare priority badge for modal
            let priorityBadge = '';
            switch(task.priority?.toLowerCase()) {
                case 'high':
                    priorityBadge = '<span class="badge bg-danger">High</span>';
                    break;
                case 'medium':
                    priorityBadge = '<span class="badge bg-warning text-dark">Medium</span>';
                    break;
                case 'low':
                    priorityBadge = '<span class="badge bg-info text-dark">Low</span>';
                    break;
                default:
                    priorityBadge = '<span class="badge bg-secondary">Unknown</span>';
            }
            
            // Create a modal to display task details
            const modalHtml = `
                <div class="modal fade" id="taskViewModal" tabindex="-1" aria-labelledby="taskViewModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="taskViewModalLabel">
                                    <i class="bi bi-clipboard-check me-2"></i>Task Details
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-8">
                                        <h4 class="mb-3">${task.title}</h4>
                                        <div class="d-flex gap-2 mb-4">
                                            ${statusBadge}
                                            ${priorityBadge}
                                            <span class="badge bg-light text-dark border">${task.department}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-4 text-md-end">
                                        <span class="badge bg-secondary rounded-pill mb-2">ID: ${task.id}</span>
                                    </div>
                                </div>
                                
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <i class="bi bi-card-text me-2"></i>Description
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">${task.description}</p>
                                    </div>
                                </div>
                                
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <i class="bi bi-person me-2"></i>Assignment Details
                                            </div>
                                            <div class="card-body">
                                                <p><strong>Assigned To:</strong> ${task.assignedTo}</p>
                                                <p><strong>Department:</strong> ${task.department}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card h-100">
                                            <div class="card-header">
                                                <i class="bi bi-calendar-date me-2"></i>Timestamps
                                            </div>
                                            <div class="card-body">
                                                <p><strong>Created:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
                                                <p><strong>Last Updated:</strong> ${task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary edit-from-view" data-id="${task.id}">
                                    <i class="bi bi-pencil me-1"></i>Edit Task
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to document
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHtml;
            document.body.appendChild(modalContainer);
            
            // Initialize and show the modal
            const modal = new bootstrap.Modal(document.getElementById('taskViewModal'));
            modal.show();
            
            // Clean up when modal is hidden
            document.getElementById('taskViewModal').addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modalContainer);
            });
            
            // Add event listener to edit button in modal
            document.querySelector('.edit-from-view').addEventListener('click', function() {
                modal.hide();
                editTask(this.getAttribute('data-id'));
            });
        })
        .catch(error => {
            console.error('Error viewing task:', error);
            showAlert('Error loading task details', 'danger');
        });
}

function editTask(taskId) {
    fetch(`/api/tasks/${taskId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Task not found');
            }
            return response.json();
        })
        .then(task => {
            // Set form title
            document.getElementById('form-title').textContent = 'Edit Task';
            
            // Fill the form with task data
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-department').value = task.department;
            document.getElementById('task-assigned-to').value = task.assignedTo;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-status').value = task.status;
            
            // Set current task ID for update
            currentTaskId = task.id;
            
            // Show the form
            document.getElementById('task-form-container').classList.remove('d-none');
            
            // Scroll to form
            document.getElementById('task-form-container').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error loading task for edit:', error);
            showAlert('Error loading task for editing', 'danger');
        });
}

function saveTask() {
    // Get form data
    const taskData = {
        title: document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-description').value.trim(),
        department: document.getElementById('task-department').value.trim(),
        assignedTo: document.getElementById('task-assigned-to').value.trim(),
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value
    };
    
    // Validate form data
    if (!taskData.title) {
        showAlert('Task title is required', 'warning');
        return;
    }
    
    if (!taskData.description) {
        showAlert('Task description is required', 'warning');
        return;
    }
    
    if (!taskData.department) {
        showAlert('Department is required', 'warning');
        return;
    }
    
    if (!taskData.assignedTo) {
        showAlert('Assigned to is required', 'warning');
        return;
    }
    
    // Determine if we're creating or updating a task
    const isNewTask = currentTaskId === null;
    
    const url = isNewTask ? '/api/tasks' : `/api/tasks/${currentTaskId}`;
    const method = isNewTask ? 'POST' : 'PUT';
    
    // Send request to API
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Failed to save task'); });
            }
            return response.json();
        })
        .then(task => {
            showAlert(`Task ${isNewTask ? 'created' : 'updated'} successfully`, 'success');
            
            // Clear form and hide it
            clearTaskForm();
            document.getElementById('task-form-container').classList.add('d-none');
            
            // Reload tasks to reflect changes
            loadTasks();
            
            // Reload filter options as new departments, staff members, or statuses might have been added
            loadFilterOptions();
        })
        .catch(error => {
            console.error('Error saving task:', error);
            showAlert(`Error ${isNewTask ? 'creating' : 'updating'} task: ${error.message}`, 'danger');
        });
}

function deleteTask(taskId) {
    fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Failed to delete task'); });
            }
            return response.json();
        })
        .then(data => {
            showAlert('Task deleted successfully', 'success');
            
            // Reload tasks to reflect changes
            loadTasks();
            
            // Reload filter options as departments, staff members, or statuses might have changed
            loadFilterOptions();
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            showAlert(`Error deleting task: ${error.message}`, 'danger');
        });
}

function clearTaskForm() {
    document.getElementById('task-form').reset();
    currentTaskId = null;
}
