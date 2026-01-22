# Store Order Management System

A full-stack application for managing store orders with a .NET Core backend and Vanilla JS frontend.

## Project Structure

```
DataSmitOrderManager/
├── api/                           # Backend .NET Core API
│   ├── StoreOrderAPI/             # Main API project
│   │   ├── Controllers/           # API controllers (HTTP endpoints)
│   │   ├── Domain/                # Domain models, DTOs, enums
│   │   └── Infrastructure/        # Data access, services, config
│   │
│   └── StoreOrderAPI.Tests/       # Unit tests for the backend API
│
├── client/                        # Frontend web application
│   └── store-order-manager/       # Vanilla JS frontend (no framework)
│       ├── css/                   # Stylesheets (.css files)
│       └── js/                    # JavaScript source files
│
└── .gitignore                     # Git ignore rules

```

## Backend (.NET Core Web API)

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) or later
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [Visual Studio Code](https://code.visualstudio.com/)

### Technology Stack

- **Framework**: ASP.NET Core 10
- **Database**: Entity Framework Core with InMemory Database
- **Testing**: xUnit, NSubstitute
- **Object Mapping**: AutoMapper
- **API Documentation**: Swagger/OpenAPI

### Key Features

- RESTful API for order management
- InMemory database (no migrations required)
- Comprehensive unit testing
- Clean architecture with DTOs
- Order status tracking (Pending, Approved, Received, OnHold)
- Order line item management

### Getting Started

1. **Clone and navigate to the backend directory**

```bash
git clone https://github.com/paulo-ngove/DataSmithOrderManager.git
cd StoreOrderAPI/Backend
```

2. **Restore dependencies**

```bash
dotnet restore
```

3. **Build the solution**

```bash
dotnet build
```

4. **Run the application**

```bash
dotnet run
```

The API will start at `https://localhost:7169` (or `http://localhost:5100`)

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/{id}` | Get order by ID |
| POST | `/api/orders` | Create a new order |
| PUT | `/api/orders/{id}` | Update an order |
| PATCH | `/api/orders/{id}` | Partially update an order |
| DELETE | `/api/orders/{id}` | Delete an order |
| GET | `/api/orders/{id}/items` | Get order line items |
| PATCH | `/api/orders/{id}/status` | Update order status |

### Testing

The project includes comprehensive unit tests using xUnit and NSubstitute.

#### Run Tests

```bash
# Navigate to the tests project
cd StoreOrderAPI.Tests

# Run all tests
dotnet test

# Run tests with specific output
dotnet test --logger "console;verbosity=detailed"

# Run tests and generate coverage report
dotnet test --collect:"XPlat Code Coverage"
```

#### Test Structure

- **Database**: InMemory database for isolated testing
- **Mocking**: NSubstitute for mocking dependencies
- **Test Cases**:
  - Order creation and validation
  - Order status updates
  - Order line item management
  - Error handling scenarios
  - API endpoint responses

#### Test Pipeline

The project includes an Azure DevOps pipeline that:
1. Restores NuGet packages
2. Builds the solution in Release configuration
3. Runs xUnit tests with TRX output
4. Generates test results file (`testresults.trx`)

### Database

- Uses Entity Framework Core InMemory provider
- No migrations needed - database is created at runtime
- Seed data is loaded during application startup
- Data is persisted only during application lifetime

### Important Notes

- The InMemory database is reset on each application restart
- AutoMapper is configured for DTO transformations
- Order numbers are auto-generated in format: `PO-YYYYMMDD-XXXXXXXX`

## Frontend (Vanilla JS Application)

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Getting Started

1. **Navigate to the frontend directory**

```bash
cd client/store-order-manager
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Start the development server**

```bash
npm start
# or
yarn start
# or using the provided server.js
node server.js
```

The application will start at `http://localhost:3000`

### Frontend Features

- JS application
- Responsive design
- Order creation and management interface
- Real-time order status updates
- Order line item management
- Form validation
- API integration with backend

### Environment Configuration

The frontend is configured to connect to the backend API. Update the API URL in the configuration if needed.

## Development Workflow

### 1. Start Backend

```bash
cd api/StoreOrderAPI
dotnet run
```

### 2. Start Frontend (in a new terminal)

```bash
cd client/store-order-manager
npm start
```

### 3. Run Tests

```bash
cd api/StoreOrderAPI
dotnet test

```

## CI/CD Pipeline

The project includes an Azure DevOps pipeline configured to:

### Build Pipeline
- Trigger: Changes to master branch
- Environment: Ubuntu latest
- Steps:
  1. Restore NuGet packages
  2. Build solution in Release configuration
  3. Run xUnit tests with detailed logging
  4. Generate test results report

### Pipeline File Location
The pipeline configuration is in `.tests-build-azure-pipeline.yml` at the root of the backend application.

## Project Architecture

### Backend Layers
1. **Controllers**: Handle HTTP requests/responses
3. **Infrastructure**: Database context and configurations
4. **Domain**: Models and business entities, dtos and enums

### Key Models
- **Order**: Main order entity with status tracking
- **OrderLineItem**: Individual items within an order
- **OrderDto**: Data transfer object for order operations
