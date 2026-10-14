# Finance Tracker API

A personal finance management REST API built with Java 21, Spring Boot, and PostgreSQL.

## Features

- Create, view, update, and delete financial transactions
- Categorize income and expenses
- Calculate total income, expenses, and balance
- Validate incoming transaction data
- Return appropriate HTTP error responses
- Automated unit and controller tests

## Tech Stack

- Java 21
- Spring Boot 4
- Spring Data JPA / Hibernate
- PostgreSQL
- Maven
- JUnit 5
- Mockito
- MockMvc

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/transactions` | Retrieve all transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/{id}` | Update a transaction |
| DELETE | `/api/transactions/{id}` | Delete a transaction |
| GET | `/api/transactions/summary` | Retrieve financial summary |

## Example Request

POST `/api/transactions`

```json
{
  "amount": 150.00,
  "description": "Freelance payment",
  "date": "2026-10-14",
  "type": "INCOME",
  "category": "SALARY"
}
```

## Running Locally

Requirements: Java 21 and PostgreSQL.

1. Create a PostgreSQL database named `finance_tracker`.
2. Configure your database username in `application.properties`.
3. Set the `DB_PASSWORD` environment variable to your PostgreSQL password.
4. Run the application:

```powershell
.\mvnw.cmd spring-boot:run
```

The API will be available at `http://localhost:8080`.

## Running Tests

```powershell
.\mvnw.cmd clean test
```

The project includes service unit tests using Mockito and controller tests using MockMvc.

## Future Improvements

- User authentication and authorization
- Transaction filtering and pagination
- Monthly spending reports
- Budget management
- Frontend dashboard
- Docker support
- CI/CD with GitHub Actions
