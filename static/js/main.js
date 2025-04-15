// Main JavaScript file for the Task Management System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the task management system
    initializeApp();
    
    // Setup event listeners for the filter form
    document.getElementById('filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
    
    document.getElementById('reset-filters').addEventListener('click', function() {
        document.getElementById('filter-form').reset();
        applyFilters();
    });
    
    // Setup event listeners for the task form
    document.getElementById('task-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTask();
    });
    
    document.getElementById('cancel-task').addEventListener('click', function() {
        clearTaskForm();
        document.getElementById('task-form-container').classList.add('d-none');
    });
    
    // Setup event listener for both "Add Task" buttons
    document.getElementById('add-task-btn').addEventListener('click', function() {
        clearTaskForm();
        document.getElementById('form-title').textContent = 'Add New Task';
        document.getElementById('task-form-container').classList.remove('d-none');
        // Scroll to form
        document.getElementById('task-form-container').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Secondary add task button (in the task section)
    if (document.getElementById('secondary-add-task-btn')) {
        document.getElementById('secondary-add-task-btn').addEventListener('click', function() {
            clearTaskForm();
            document.getElementById('form-title').textContent = 'Add New Task';
            document.getElementById('task-form-container').classList.remove('d-none');
            // Scroll to form
            document.getElementById('task-form-container').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

function initializeApp() {
    // Load all tasks
    loadTasks();
    
    // Load filter options
    loadFilterOptions();
}

function loadFilterOptions() {
    // Load departments for filtering
    fetch('/api/departments')
        .then(response => response.json())
        .then(departments => {
            const departmentSelect = document.getElementById('filter-department');
            departmentSelect.innerHTML = '<option value="">All Departments</option>';
            
            departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department;
                option.textContent = department;
                departmentSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading departments:', error);
            showAlert('Error loading department filter options', 'danger');
        });
    
    // Load staff members for filtering
    fetch('/api/staff')
        .then(response => response.json())
        .then(staffMembers => {
            const staffSelect = document.getElementById('filter-staff');
            staffSelect.innerHTML = '<option value="">All Staff</option>';
            
            staffMembers.forEach(staff => {
                const option = document.createElement('option');
                option.value = staff;
                option.textContent = staff;
                staffSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading staff:', error);
            showAlert('Error loading staff filter options', 'danger');
        });
    
    // Load statuses for filtering
    fetch('/api/statuses')
        .then(response => response.json())
        .then(statuses => {
            const statusSelect = document.getElementById('filter-status');
            statusSelect.innerHTML = '<option value="">All Statuses</option>';
            
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                statusSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading statuses:', error);
            showAlert('Error loading status filter options', 'danger');
        });
}

function applyFilters() {
    const department = document.getElementById('filter-department').value;
    const staff = document.getElementById('filter-staff').value;
    const status = document.getElementById('filter-status').value;
    
    let url = '/api/tasks?';
    
    if (department) url += `department=${encodeURIComponent(department)}&`;
    if (staff) url += `staff=${encodeURIComponent(staff)}&`;
    if (status) url += `status=${encodeURIComponent(status)}&`;
    
    // Remove trailing '&' or '?'
    url = url.replace(/[&?]$/, '');
    
    fetch(url)
        .then(response => response.json())
        .then(tasks => {
            displayTasks(tasks);
        })
        .catch(error => {
            console.error('Error filtering tasks:', error);
            showAlert('Error filtering tasks', 'danger');
        });
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 150);
    }, 5000);
}
