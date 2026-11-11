# Assumptions and Design Decisions

This document describes the assumptions and implementation decisions made while developing the School Admission System.

## 1. Student Identification

- The system does not implement student registration, login, or password authentication.
- A student's identity is represented by a 17-digit birth registration number.
- The frontend collects the identifier and stores it in browser local storage.
- Student-specific API requests send the identifier through the `X-Student-Id` HTTP header.
- The backend validates the identifier's format before processing student-specific operations.
- This approach is intended for the assignment demonstration and does not provide production-grade identity verification or authentication.

## 2. Administrator Access

- One administrator ID is configured through the `VITE_ADMIN_ID` frontend environment variable.
- The administrator can access the class creation interface.
- Regular students do not see the class creation navigation option.
- The administrator check is implemented on the frontend only.
- Since frontend environment variables are included in the built application, this mechanism is not secure authorization.
- The backend class creation endpoint is not protected by administrator authentication.

For a production system, administrator authentication and role-based authorization must be implemented and enforced by the backend.

## 3. Class and Seat Management

- Each class record represents a unique admission category, such as `Class 6 Morning` or `Class 6 Day`.
- Different shifts are treated as separate class records.
- Each class has a fixed total seat capacity.
- Available seats are calculated as:

  `Available Seats = Total Seats - Held Seats - Confirmed Seats`

- A class cannot be created with an invalid name or a non-positive seat capacity.
- Once created, the class's seat capacity is managed through the class record.

## 4. Reservation (Hold) Policy

- Applying for a class creates a temporary seat reservation rather than immediately confirming admission.
- The default reservation duration is 600 seconds (10 minutes).
- The duration can be configured using the `HOLD_DURATION_SECONDS` environment variable.
- A reservation stores its creation and expiry information in the database.
- Only an active, unexpired reservation belonging to the requesting student can be confirmed.
- Students can cancel their own active reservations.
- Expired and cancelled reservations do not consume seats.
- A student cannot have multiple active reservations or a confirmed admission in the same class.
- A student may apply to different classes simultaneously.

## 5. Automatic Reservation Expiry

- A background service periodically checks for expired reservations.
- The expiry service runs independently of frontend activity.
- The background service checks for expired reservations approximately every five seconds.
- The frontend displays a live countdown based on the reservation expiry timestamp.
- The frontend countdown is for user feedback; the backend remains responsible for enforcing expiry.
- An expired reservation cannot be confirmed, even if the frontend has not yet refreshed its status.

## 6. Concurrency and Seat Allocation

- Multiple students may attempt to reserve seats in the same class simultaneously.
- PostgreSQL transactions and row-level locking are used to coordinate seat allocation.
- The class record is locked while checking availability and creating a reservation.
- Database-level filtered unique indexes prevent a student from having more than one active or confirmed application for the same class.
- These protections ensure that concurrent requests cannot allocate more seats than the class capacity.
- Repeated confirmation requests must not increase the confirmed seat count more than once.

## 7. Payment Simulation

- The assignment requires an admission confirmation workflow, not a real payment integration.
- Therefore, payment is simulated through the frontend.
- No actual payment gateway, bank transaction, or payment provider is connected.
- Successful completion of the simulated payment workflow triggers the admission confirmation API request.
- A production implementation would require payment gateway integration, transaction verification, and payment reconciliation.

## 8. Data Persistence

- PostgreSQL is used as the primary database.
- Entity Framework Core manages database access and migrations.
- Database migrations are applied automatically when the backend starts.
- Docker Compose uses a named PostgreSQL volume to preserve data across container restarts.
- Running `docker compose down` does not remove the persistent database volume.
- Running `docker compose down -v` removes the volume and permanently deletes the stored database data.

## 9. API and Frontend Communication

- The frontend communicates with the backend through REST API endpoints.
- JSON is used for request and response bodies.
- Student-specific requests include the `X-Student-Id` header.
- The frontend API base URL is configurable through `VITE_API_BASE_URL`.
- The local development frontend and backend use separate ports.
- Docker Compose runs the frontend, backend, and database as separate services.

## 10. Error Handling

- Invalid input is rejected with appropriate client error responses.
- Requests for unavailable seats return a conflict response.
- Requests to confirm or cancel another student's reservation are rejected.
- Attempts to confirm expired or otherwise invalid reservations are rejected.
- The frontend displays meaningful messages for common API errors.

## 11. Scope and Limitations

The following features are outside the scope of this assignment:

- Production-grade student authentication and identity verification.
- Backend administrator authentication and role-based authorization.
- Real payment gateway integration.
- Email or SMS notifications.
- Document upload and verification.
- Admission approval by school staff.
- Multiple school or campus management.
- Production deployment, monitoring, and backup infrastructure.

These features could be introduced in a future production version of the system.

---

**Document:** Assumptions and Design Decisions  
**Project:** School Admission System
