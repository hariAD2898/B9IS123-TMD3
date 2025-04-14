# TechSolutions Dublin - Task Management System: API Documentation

## API Overview

The TechSolutions Dublin Task Management System provides a RESTful API for managing tasks. This API allows for creating, reading, updating, and deleting tasks, as well as retrieving filtering metadata.

## Base URL

All API endpoints are relative to the base URL of the application:

```
http://localhost:5000/api
```

## Authentication

The current implementation does not include authentication. In a production environment, proper authentication using JWT, OAuth, or API keys would be implemented.

## Response Format

All responses are returned in JSON format. Successful responses typically include the requested data, while error responses include an error message.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request:

- `200 OK`: The request was successful
- `201 Created`: The resource was successfully created
- `400 Bad Request`: The request was invalid or missing required fields
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: A server error occurred

Error responses include a JSON object with an error message:

```json
{
  "error": "Error message"
}
```

## API Endpoints

### Tasks

#### Get All Tasks

Retrieves all tasks, with optional filtering.

- **URL**: `/tasks`
- **Method**: `GET`
- **URL Parameters**: 
  - `department` (optional): Filter by department
  - `staff` (optional): Filter by assigned staff member
  - `status` (optional): Filter by status

**Example Request**:
```
GET /api/tasks?department=IT&status=Pending
```

**Example Response**:
```json
[
  {
    "id": 1,
    "title": "Develop New Client Portal",
    "description": "Create a responsive client portal",
    "department": "IT",
    "assignedTo": "John Murphy",
    "priority": "High",
    "status": "Pending",
    "createdAt": "2025-04-14T09:30:00.000Z"
  },
  {
    "id": 4,
    "title": "Server Infrastructure Upgrade",
    "description": "Upgrade the company's server infrastructure",
    "department": "IT",
    "assignedTo": "David Walsh",
    "priority": "High",
    "status": "Pending",
    "createdAt": "2025-04-14T08:00:00.000Z"
  }
]
```

#### Create a Task

Creates a new task.

- **URL**: `/tasks`
- **Method**: `POST`
- **Content Type**: `application/json`
- **Request Body**: Task object without ID

**Required Fields**:
- `title`: Task title
- `description`: Task description
- `department`: Department name
- `assignedTo`: Staff member name
- `priority`: Priority level (Low, Medium, High)

**Example Request**:
```json
{
  "title": "New Feature Implementation",
  "description": "Implement new login system",
  "department": "IT",
  "assignedTo": "John Murphy",
  "priority": "Medium"
}
```

**Example Response**:
```json
{
  "id": 7,
  "title": "New Feature Implementation",
  "description": "Implement new login system",
  "department": "IT",
  "assignedTo": "John Murphy",
  "priority": "Medium",
  "status": "Pending",
  "createdAt": "2025-04-15T10:23:45.000Z"
}
```

#### Get a Task

Retrieves a specific task by ID.

- **URL**: `/tasks/:id`
- **Method**: `GET`
- **URL Parameters**: 
  - `id`: Task ID

**Example Request**:
```
GET /api/tasks/1
```

**Example Response**:
```json
{
  "id": 1,
  "title": "Develop New Client Portal",
  "description": "Create a responsive client portal",
  "department": "IT",
  "assignedTo": "John Murphy",
  "priority": "High",
  "status": "In Progress",
  "createdAt": "2025-04-14T09:30:00.000Z",
  "updatedAt": "2025-04-14T15:45:00.000Z"
}
```

#### Update a Task

Updates an existing task.

- **URL**: `/tasks/:id`
- **Method**: `PUT`
- **Content Type**: `application/json`
- **URL Parameters**: 
  - `id`: Task ID
- **Request Body**: Updated task object

**Example Request**:
```json
{
  "title": "Develop New Client Portal",
  "description": "Create a responsive client portal with enhanced security",
  "department": "IT",
  "assignedTo": "John Murphy",
  "priority": "High",
  "status": "Completed"
}
```

**Example Response**:
```json
{
  "id": 1,
  "title": "Develop New Client Portal",
  "description": "Create a responsive client portal with enhanced security",
  "department": "IT",
  "assignedTo": "John Murphy",
  "priority": "High",
  "status": "Completed",
  "createdAt": "2025-04-14T09:30:00.000Z",
  "updatedAt": "2025-04-15T11:20:00.000Z"
}
```

#### Delete a Task

Deletes a specific task.

- **URL**: `/tasks/:id`
- **Method**: `DELETE`
- **URL Parameters**: 
  - `id`: Task ID

**Example Request**:
```
DELETE /api/tasks/7
```

**Example Response**:
```json
{
  "message": "Task 7 deleted successfully",
  "task": {
    "id": 7,
    "title": "New Feature Implementation",
    "description": "Implement new login system",
    "department": "IT",
    "assignedTo": "John Murphy",
    "priority": "Medium",
    "status": "Pending",
    "createdAt": "2025-04-15T10:23:45.000Z"
  }
}
```

### Filtering Metadata

#### Get Departments

Retrieves unique department names from existing tasks.

- **URL**: `/departments`
- **Method**: `GET`

**Example Request**:
```
GET /api/departments
```

**Example Response**:
```json
["Finance", "HR", "IT", "Marketing", "Operations", "Sales"]
```

#### Get Staff Members

Retrieves unique staff member names from existing tasks.

- **URL**: `/staff`
- **Method**: `GET`

**Example Request**:
```
GET /api/staff
```

**Example Response**:
```json
["Aoife Lynch", "David Walsh", "Emma O'Connor", "John Murphy", "Michael Byrne", "Sarah Kelly"]
```

#### Get Statuses

Retrieves unique status values from existing tasks.

- **URL**: `/statuses`
- **Method**: `GET`

**Example Request**:
```
GET /api/statuses
```

**Example Response**:
```json
["Completed", "In Progress", "Pending", "Review"]
```

## Rate Limiting

The current implementation does not include rate limiting. In a production environment, rate limiting would be implemented to prevent abuse.

## Versioning

The current API does not implement versioning. Future versions would include API versioning to ensure backward compatibility.

## Support

For API support, contact TechSolutions Dublin IT department.