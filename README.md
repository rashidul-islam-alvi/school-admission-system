# School Admission System

A full-stack school admission application that allows students to reserve seats in classes, track application status, and confirm admission through a simulated payment workflow.

The system is designed to handle concurrent admission requests safely, automatically expire temporary reservations, and preserve admission data across application restarts.

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Admission Workflow](#5-admission-workflow)
6. [API Documentation](#6-api-documentation)
7. [Business Rules](#7-business-rules)
8. [Getting Started](#8-getting-started)
9. [Running with Docker](#9-running-with-docker)
10. [Testing](#10-testing)
11. [Project Structure](#11-project-structure)
12. [Assumptions and Limitations](#12-assumptions-and-limitations)

---

## 1. Overview

The School Admission System provides a digital admission workflow where:

- An administrator creates classes and defines their seat capacity.
- A student identifies themselves using a 17-digit birth registration number.
- Students can view available classes and temporarily reserve a seat.
- A reservation remains active for a configurable period.
- Students can confirm their admission through a simulated payment process.
- Students can view and manage their applications.

The backend uses PostgreSQL transactions and database-level constraints to prevent multiple students from reserving the same available seat when requests arrive concurrently.

## 2. Features

### Student Features

- Identify students using a 17-digit birth registration number.
- Browse available classes and seat availability.
- Apply for a class by creating a temporary reservation.
- View reservation expiry through a live countdown.
- Confirm admission using simulated payment.
- Cancel an active reservation.
- View all personal applications.
- Retrieve applications after refreshing or reopening the browser.

### Administrator Features

- Access the class creation interface using a configured administrator ID.
- Create classes with a specified seat capacity.
- View class-wise admission statistics.

### Backend Features

- RESTful API built with ASP.NET Core.
- PostgreSQL database integration using Entity Framework Core.
- Automatic database migrations on application startup.
- Configurable reservation duration.
- Automatic reservation expiry.
- Concurrency-safe seat allocation.
- Database-level protection against duplicate active applications for the same student and class.
- Persistent data storage through Docker volumes.

## 3. Technology Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Frontend         | React 19, TypeScript                 |
| Build Tool       | Vite                                 |
| Routing          | TanStack Router                      |
| Data Fetching    | TanStack Query                       |
| Styling          | Tailwind CSS                         |
| Form Validation  | React Hook Form, Zod                 |
| Backend          | ASP.NET Core (.NET 10)               |
| ORM              | Entity Framework Core                |
| Database         | PostgreSQL 17                        |
| Testing          | xUnit, Vitest, React Testing Library |
| Containerization | Docker, Docker Compose               |
| Web Server       | Nginx                                |

## 4. System Architecture

The application consists of three main services:

1. **Frontend:** React application served through Nginx.
2. **Backend:** ASP.NET Core REST API responsible for admission business logic.
3. **Database:** PostgreSQL for persistent storage.

```text
              Student / Administrator
                        |
                        v
               React Frontend
                 (Port 5173)
                        |
                        v
              ASP.NET Core API
                 (Port 8080)
                        |
                        v
                  PostgreSQL
                 (Port 5432)
```

Docker Compose manages the services and their dependencies.

## 5. Admission Workflow

### Step 1: Student Identification

The student enters a 17-digit birth registration number.

The frontend stores the identifier locally and includes it in protected student-specific API requests through the `X-Student-Id` HTTP header.

### Step 2: Browse Classes

The frontend retrieves available classes from the backend.

Each class displays:

- Total seats
- Held seats
- Confirmed seats
- Available seats

### Step 3: Reserve a Seat

When a student applies for a class, the backend:

1. Validates the student identifier.
2. Checks whether the student already has an active or confirmed application for that class.
3. Locks the relevant class record inside a database transaction.
4. Checks seat availability.
5. Creates a temporary reservation if a seat is available.
6. Returns the reservation details and expiry timestamp.

### Step 4: Confirm Admission

The student can confirm admission while the reservation is still active.

The confirmation endpoint validates ownership and reservation status before changing the status to `CONFIRMED`.

Payment is simulated; no external payment gateway is integrated.

### Step 5: Expire or Cancel Reservation

If the student does not confirm within the reservation period, the reservation automatically expires.

Students can also cancel their active reservations.

Expired and cancelled reservations release their seats.

## 6. API Documentation

**Base URL:** `http://localhost:8080`

All request and response bodies use JSON unless otherwise specified.

### Class Endpoints

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/classes`           | Create a class            |
| GET    | `/classes`           | Retrieve all classes      |
| GET    | `/classes/{classId}` | Retrieve a specific class |

**Create class request:**

```json
{
  "name": "Class 6 Morning",
  "totalSeats": 50
}
```

**Class response:**

```json
{
  "id": "class-id",
  "name": "Class 6 Morning",
  "totalSeats": 50,
  "heldSeats": 2,
  "confirmedSeats": 10,
  "availableSeats": 38
}
```

### Reservation Endpoints

| Method | Endpoint                   | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| POST   | `/classes/{classId}/holds` | Create a reservation                        |
| GET    | `/holds/{holdId}`          | Retrieve reservation status                 |
| POST   | `/holds/{holdId}/confirm`  | Confirm admission                           |
| DELETE | `/holds/{holdId}`          | Cancel a reservation                        |
| GET    | `/me/holds`                | Retrieve the current student's applications |

Student-specific endpoints require the following HTTP header:

```http
X-Student-Id: 12345678901234567
```

**Create reservation response:**

```json
{
  "holdId": "hold-id",
  "classId": "class-id",
  "studentId": "12345678901234567",
  "status": "HELD",
  "expiresAt": "2026-11-11T15:00:00Z"
}
```

**Confirm admission response:**

```json
{
  "holdId": "hold-id",
  "status": "CONFIRMED"
}
```

**Reservation statuses:**

| Status    | Meaning                   |
| --------- | ------------------------- |
| HELD      | Seat temporarily reserved |
| CONFIRMED | Admission confirmed       |
| EXPIRED   | Reservation period ended  |
| CANCELLED | Reservation cancelled     |

## 7. Business Rules

### Seat Allocation

The system must never allow:

```text
Held Seats + Confirmed Seats > Total Seats
```

Seat allocation is protected through:

- Database transactions.
- PostgreSQL row-level locking.
- Database-level filtered unique indexes for active reservations.

These mechanisms help prevent overselling when multiple students apply simultaneously.

### Reservation Duration

Reservation duration is configurable using the environment variable:

```env
HOLD_DURATION_SECONDS=600
```

The default duration is 600 seconds (10 minutes).

### Student Application Restrictions

- A student cannot have more than one active reservation or confirmed admission in the same class.
- A student can apply to different classes simultaneously.
- Only the student who owns an active reservation can confirm or cancel it.
- Expired reservations cannot be confirmed.
- Repeated confirmation must not count the same admission more than once.

### Automatic Expiry

A background service periodically checks for expired reservations and updates their status.

The frontend also displays a live countdown so students can see how much reservation time remains.

## 8. Getting Started

### Prerequisites

Install the following:

- [Node.js](https://nodejs.org/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd school-admission-system
```

### Run the Backend

Start PostgreSQL first using Docker Compose, or use an existing PostgreSQL instance.

```bash
docker compose up -d db
```

Run the backend:

```bash
dotnet restore SchoolAdmissionSystem.slnx
dotnet run --project backend/SchoolAdmission.Api
```

The API will be available at:

```text
http://localhost:8080
```

Swagger documentation is available in the Development environment, if enabled.

### Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create or update `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ADMIN_ID=YOUR_17_DIGIT_ADMIN_ID
```

Replace the administrator ID with the configured 17-digit ID.

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## 9. Running with Docker

Docker Compose is the recommended way to run the complete application.

From the project root:

```bash
docker compose up --build -d
```

Check running containers:

```bash
docker compose ps
```

The application services are available at:

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| PostgreSQL  | localhost:5432        |

Stop the services:

```bash
docker compose down
```

Stop services without removing persistent database data:

```bash
docker compose down
```

PostgreSQL data is stored in a named Docker volume, allowing application data to survive container restarts and normal `docker compose down` operations.

To remove the database volume as well (this permanently deletes the stored database data):

```bash
docker compose down -v
```

## 10. Testing

The project includes backend integration tests and frontend component/schema tests.

### Backend Tests

From the project root:

```bash
dotnet test SchoolAdmissionSystem.slnx
```

The backend test suite covers:

1. Successful admission workflow.
2. Concurrent applications without exceeding available seats.
3. Invalid student identifier handling.

### Frontend Tests

From the frontend directory:

```bash
cd frontend
npm run test
```

Frontend tests cover:

- Student identification and validation.
- Administrator/student identification behavior.
- Class form schema validation.
- Administrator navigation visibility.

### Frontend Lint and Build

```bash
npm run lint
npm run build
```

## 11. Project Structure

```text
school-admission-system/
│
├── backend/
│   ├── SchoolAdmission.Api/
│   │   ├── Controllers/
│   │   ├── Data/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Migrations/
│   │   └── SchoolAdmission.Api.csproj
│   │
│   └── SchoolAdmission.Tests/
│       └── Integration tests
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── test/
│   │   └── types/
│   ├── Dockerfile
│   ├── index.html
│   └── package.json
│
├── docker-compose.yml
├── SchoolAdmissionSystem.slnx
├── README.md
├── ASSUMPTIONS.md
└── AI_USAGE.md
```

## 12. Assumptions and Limitations

- Student identity is based on a 17-digit birth registration number.
- The application does not implement student login or password authentication.
- The administrator ID check is implemented on the frontend for demonstration purposes. It is not production-grade authorization, and the class creation API is not secured by backend authentication.
- Payment is simulated; no real payment gateway or transaction processing is integrated.
- Reservation duration is configurable through `HOLD_DURATION_SECONDS`.
- The application uses PostgreSQL as its persistent database.
- The frontend communicates with the backend using the configured API base URL.

See [ASSUMPTIONS.md](ASSUMPTIONS.md) for additional implementation decisions and [AI_USAGE.md](AI_USAGE.md) for AI assistance disclosure.

---

**Project:** School Admission System  
**Backend:** ASP.NET Core / PostgreSQL  
**Frontend:** React / TypeScript  
**Deployment:** Docker Compose
