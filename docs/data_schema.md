# TechSolutions Dublin - Task Management System: Data Schema

## Overview

This document outlines the data schema used in the TechSolutions Dublin Task Management System. The system uses a JSON-based data storage approach for simplicity and portability.

## Task Schema

Each task in the system is represented as a JSON object with the following structure:

```json
{
  "id": 1,
  "title": "Task Title",
  "description": "Detailed description of the task",
  "department": "Department Name",
  "assignedTo": "Staff Member Name",
  "priority": "Priority Level",
  "status": "Task Status",
  "createdAt": "ISO 8601 Date String",
  "updatedAt": "ISO 8601 Date String"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Integer | Yes | Unique identifier for the task. Automatically generated. |
| title | String | Yes | Short title describing the task. Limited to 100 characters. |
| description | String | Yes | Detailed description of the task. Can be multiple lines. |
| department | String | Yes | The department responsible for the task. Must be one of the predefined departments. |
| assignedTo | String | Yes | Name of the staff member assigned to the task. |
| priority | String | Yes | Priority level of the task. Must be one of: "Low", "Medium", or "High". |
| status | String | No | Current status of the task. Defaults to "Pending" if not specified. Must be one of: "Pending", "In Progress", "Review", or "Completed". |
| createdAt | ISO Date String | Yes | Timestamp when the task was created. Automatically generated. |
| updatedAt | ISO Date String | No | Timestamp when the task was last updated. Only present if the task has been updated. |

## Sample Task Object

```json
{
  "id": 1,
  "title": "Develop New Client Portal",
  "description": "Create a responsive client portal with enhanced security features that allows clients to view project status and communicate with team members.",
  "department": "IT",
  "assignedTo": "John Murphy",
  "priority": "High",
  "status": "In Progress",
  "createdAt": "2025-04-14T09:30:00.000Z",
  "updatedAt": "2025-04-14T15:45:00.000Z"
}
```

## Storage Structure

Tasks are stored in a JSON file at `data/tasks.json`. The file contains an array of task objects:

```json
[
  {
    "id": 1,
    "title": "Task 1",
    // other task properties
  },
  {
    "id": 2,
    "title": "Task 2",
    // other task properties
  }
]
```

## Validation Rules

The following validation rules are applied to task data:

1. `title` must be non-empty and limited to 100 characters
2. `description` must be non-empty
3. `department` must be one of the valid departments in the system
4. `assignedTo` must be non-empty
5. `priority` must be "Low", "Medium", or "High"
6. `status` must be "Pending", "In Progress", "Review", or "Completed"

## Constraints

- Task IDs are automatically generated and must be unique
- Timestamps are automatically generated in ISO 8601 format
- When a task is created, its status defaults to "Pending" if not specified

## Data Relationships

In the current implementation, there are no formal relationships between tasks. Each task is treated as an independent entity. However, the system uses the following fields to establish implicit relationships:

- `department`: Tasks can be filtered by department
- `assignedTo`: Tasks can be filtered by assigned staff member

## Future Schema Extensions

In future versions, the data schema could be extended to include:

1. User information and authentication
2. Task dependencies
3. Task comments
4. File attachments
5. Time tracking
6. Versioning