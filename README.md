# Job and Application API

A simple REST API for managing job postings and job applications, built with NestJS, TypeORM, and SQLite.

## How to Run

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository and install the dependencies:

```bash
npm install
```

### Start the Application

For development with hot reload:

```bash
npm run start:dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## Design Overview

The application follows a modular architecture using NestJS.

The main modules are:

```text
AppModule
├── JobsModule
│   ├── JobsController
│   ├── JobsService
│   └── Job Entity
│
└── ApplicationsModule
    ├── ApplicationsController
    ├── ApplicationsService
    └── Application Entity
```

### Request Flow

The general request flow is:

```text
Client
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
TypeORM Repository
  │
  ▼
SQLite Database
```

* **Controller** handles HTTP requests, routes, parameters, and request bodies.
* **Service** contains the application's business logic.
* **Repository** handles database operations through TypeORM.
* **Entity** defines the structure of the database tables.
* **SQLite** is used as the local database for persistence.

---

## API Endpoints

### Jobs

| Method  | Endpoint            | Description                 | Postman Body Example                                                              |
| ------- | ------------------- | --------------------------- | --------------------------------------------------------------------------------- |
| `POST`  | `/jobs`             | Create a new job            | `{ "title": "", "description": "", "company": "", "location": "", "status": "" }` |
| `GET`   | `/jobs`             | Get all jobs                | No body required                                                                  |
| `GET`   | `/jobs?status=OPEN` | Get jobs filtered by status | No body required                                                                  |
| `GET`   | `/jobs/:id`         | Get a specific job          | No body required                                                                  |
| `PATCH` | `/jobs/:id`         | Update a job's status       | `{ "status": "" }`                                                                |

### Applications

| Method | Endpoint                   | Description                             | Postman Body Example                                               |
| ------ | -------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| `POST` | `/applications/:jobId`     | Submit an application for a job         | `{ "candidateName": "", "candidateEmail": "", "coverLetter": "" }` |
| `GET`  | `/applications`            | Get all applications                    | No body required                                                   |
| `GET`  | `/applications/:jobId/all` | Get all applications for a specific job | No body required                                                   |
| `GET`  | `/applications/:id`        | Get a specific application              | No body required                                                   |

---

## Diagrams

### System Architecture

```text
┌──────────────┐
│    Client    │
│   / Postman  │
└──────┬───────┘
       │ HTTP
       ▼
┌─────────────────────────┐
│       Controllers       │
│                         │
│ JobsController          │
│ ApplicationsController  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│        Services         │
│                         │
│ JobsService             │
│ ApplicationsService     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   TypeORM Repositories  │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│     SQLite Database     │
│                         │
│       jobs.sqlite       │
└─────────────────────────┘
```

### Jobs and Applications ERD

[View the ERD diagram on Google Drive](https://drive.google.com/file/d/1xAlmMr84ghO9xS9xW5pEleG8bihT-XOI/view?usp=sharing)

* One job can have many applications.
* Each application belongs to one job.
* `Applications.jobId` references `Jobs.id`.

---

## Unit Tests

Unit tests are included for the key business logic of the application and are located in the corresponding `.spec.ts` files in the source code.

### JobsService

The `JobsService` tests cover:

* Service initialization
* Creating a job
* Listing all jobs
* Filtering jobs by status
* Retrieving a job by ID
* Updating a job's status
* Rejecting updates when the job does not exist
* Rejecting updates to fields other than status

### ApplicationsService

The `ApplicationsService` tests cover:

* Service initialization
* Creating an application for an open job
* Rejecting applications for closed jobs
* Rejecting applications when the job does not exist
* Rejecting duplicate applications for the same job and email
* Retrieving applications for a specific job
* Retrieving a specific application by application ID

The tests use mocked repositories and services so that the business logic can be tested independently from the actual SQLite database.

Run the tests with:

```bash
npm test
```

---

## Assumptions

1. **One job can have multiple applications**

   * A job is not limited to one candidate.

2. **A candidate cannot apply to the same job more than once**

   * The combination of `jobId` and candidate email is used to determine whether an application already exists.
   * The same candidate can still apply to different jobs.

3. **Applications remain after a job is closed**

   * Closing a job prevents new applications but does not delete existing applications.

4. **A job can be reopened**

   * The job status can be changed between `OPEN` and `CLOSED`.
   * A closed job is not permanently closed.

5. **Job status is the only field that can be updated**

   * After a job is created, its title, description, location, and creation timestamp cannot be modified.
   * Updating critical information could change the data history for applications.

6. **Email comparison is case-insensitive**

   * Email addresses such as `John@example.com` and `john@example.com` are treated as the same email when checking for duplicate applications.

7. **A job must exist before an application can be created**

   * Attempting to apply to a non-existent job returns `404 Not Found`.

8. **Applications belong to exactly one job**

   * An application cannot exist independently of a job.

9. **Deleting jobs is not supported**

   * Job deletion is not included because it is not required by the assessment.
   * This also avoids ambiguity around what should happen to existing applications when a job is deleted.

10. **Job status input is case-insensitive**

    * If the client provides `open` or `closed`, the API converts the value to uppercase (`OPEN` or `CLOSED`).

11. **Invalid job status returns a bad request**

    * If the provided status is anything other than `open`, `closed`, `OPEN`, or `CLOSED`, the API returns `400 Bad Request`.

---

## What I'd Improve With More Time

If I had more time, I would improve the system in the following areas:

* **Add a User table** - Store candidate information in a dedicated `User` table and reference the user's ID from the `Application` table instead of storing the candidate's name and email directly.

* **Add job versioning/history** - Allow job details such as the title, description, company, and location to be updated while keeping previous versions of the job. This would preserve the job information that candidates originally applied to.

* **Add authentication and authorization** - Add user authentication and different roles, such as candidates and employers, so that only authorized users can create, update, or manage jobs and applications.

* **Add job closing dates** - Add a `closeDate` field to jobs and automatically change the job status from `OPEN` to `CLOSED` when the closing date is reached.

* **Strengthen validation and error responses** - Extend the existing validation with stricter rules such as required fields and length limits, and standardize the structure of error responses across the API.

* **Add pagination and sorting** - Add pagination, filtering, and sorting to job and application listing endpoints to handle larger amounts of data efficiently.

* **Improve database constraints** - Add database-level constraints and indexes, such as an index for job status and a unique constraint for a job and candidate email combination, to improve data integrity and query performance.

* **Add soft deletion** - Instead of permanently deleting records, add soft deletion for entities where appropriate so that important data can be retained and recovered if needed.

* **Add environment-based configuration** - Move configuration such as the database path and other application settings into environment variables so that development, testing, and production environments can use different configurations.
