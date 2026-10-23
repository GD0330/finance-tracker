# 💰 Finance Tracker - not ready yet :(

A full-stack personal finance management application built with **Spring Boot, React, TypeScript, and PostgreSQL**.

Finance Tracker helps users manage their income and expenses, monitor their financial balance, and analyze spending habits through an interactive dashboard.

## ✨ Features

### 📊 Financial Dashboard
- View total income, expenses, and current balance.
- Add, edit, and delete transactions.
- Search transactions by description.
- Filter transactions by type.
- Sort transactions.

### 📈 Financial Reports
- View monthly income, expenses, and net savings.
- Calculate monthly savings rates.
- Select a month to analyze financial activity.
- Compare income and expenses using interactive bar charts.
- Visualize spending by category using a donut chart.
- Responsive chart layouts.

### 💳 Transaction Management
- Create income and expense transactions.
- Assign categories to transactions.
- Record transaction descriptions, amounts, and dates.
- Validate transaction data.
- Store transactions in a PostgreSQL database.

## 🛠️ Tech Stack

**Backend**
- Java 21
- Spring Boot
- Spring Data JPA / Hibernate
- Maven
- REST API

**Frontend**
- React
- TypeScript
- Vite
- Recharts
- CSS

**Database**
- PostgreSQL

**Development & Testing**
- IntelliJ IDEA
- Git & GitHub
- JUnit
- Mockito
- GitHub Actions (CI)

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Java 21
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/GD0330/finance-tracker.git
cd finance-tracker
```

### 2. Configure the Database

Create a PostgreSQL database named `finance_tracker`.

Configure your Spring Boot database connection in `application.properties` or `application.yml`.

The backend expects the database password through the `DB_PASSWORD` environment variable.

**Note:** The database schema and its category constraints must be compatible with the current backend model.

### 3. Start the Backend

Run `FinanceTrackerApplication` from IntelliJ IDEA, or use the Maven wrapper from the project root:

```bash
./mvnw spring-boot:run
```

The backend runs at:

`http://localhost:8080`

### 4. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

`http://localhost:5173`

## 🧪 Testing

The backend includes automated tests for application functionality.

Run the tests using:

```bash
./mvnw test
```

GitHub Actions is configured to run backend checks automatically.

## 📸 Screenshots

*Screenshots of the Overview and Reports dashboards will be added here.*

## 🗺️ Planned Improvements

- Monthly budget management.
- Improved financial insights.
- Export transactions and reports.
- More advanced filtering and analytics.
- Easier local installation and deployment.

## 👨‍💻 About the Project

This project was developed as a personal learning and portfolio project to gain practical experience with full-stack development.

It covers REST API development, database integration, frontend state management, financial data visualization, automated testing, and version control.

