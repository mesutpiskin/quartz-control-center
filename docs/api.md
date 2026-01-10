# API Documentation

## Overview

The Quartz Control Center API is a RESTful service that provides management capabilities for Quartz Scheduler databases.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API does not require authentication. Database credentials are provided in request bodies.

> ⚠️ **Production Warning**: Implement proper authentication before deploying to production.

## Endpoints

### Database Management

#### Test Connection
```http
POST /database/test-connection
```

**Request Body:**
```json
{
  "host": "localhost",
  "port": 5432,
  "database": "quartz_db",
  "username": "postgres",
  "password": "password",
  "schema": "public",
  "databaseType": "postgresql"
}
```

**Response:**
```json
{
  "success": true,
  "serverVersion": "PostgreSQL 14.5",
  "message": "Connection successful"
}
```

#### List Schemas
```http
POST /database/schemas
```

Returns all available schemas in the database.

#### Validate Quartz Tables
```http
POST /database/validate-quartz
```

Validates that all required Quartz tables exist in the specified schema.

### Job Management

#### List All Jobs
```http
POST /jobs/list
```

**Request Body:**
```json
{
  "connection": { /* DatabaseConnection */ },
  "filterGroup": "optional-group-name"
}
```

#### Get Job Details
```http
POST /jobs/detail
```

#### Delete Job
```http
POST /jobs/delete
```

**Request Body:**
```json
{
  "connection": { /* DatabaseConnection */ },
  "jobName": "MyJob",
  "jobGroup": "DEFAULT"
}
```

### Trigger Management

#### List All Triggers
```http
POST /triggers/list
```

#### Get Executing Jobs
```http
POST /triggers/executing
```

#### Pause Trigger
```http
POST /triggers/pause
```

#### Resume Trigger
```http
POST /triggers/resume
```

### Scheduler Information

#### Get Scheduler Info
```http
POST /scheduler/info
```

Returns information about all scheduler instances.

#### Get Statistics
```http
POST /scheduler/statistics
```

Returns comprehensive statistics:
- Total jobs
- Total triggers
- Executing jobs
- Paused triggers
- Scheduler instances

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Server Error (database connection issues, etc.)

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## CORS

CORS is configured to allow requests from the frontend application. Update `CORS_ORIGIN` environment variable as needed.
