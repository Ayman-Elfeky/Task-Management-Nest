# 📝 Task CRUD API

A robust **Task Management RESTful API** built with **NestJS**, featuring complete CRUD operations, JWT authentication, and comprehensive testing.

## 🚀 Features

- **🔐 User Authentication** - JWT-based auth system with registration, login, and password reset
- **📋 Task Management** - Full CRUD operations for tasks (Create, Read, Update, Delete)
- **🛡️ Authorization** - Protected routes with JWT guards
- **✅ Input Validation** - Request validation using DTOs and class-validator
- **🎯 Custom Pipes** - Text transformation (UpperCase pipe)
- **📊 Comprehensive Testing** - 69 unit tests with 100% coverage
- **🗄️ Database Integration** - TypeORM with PostgreSQL/MySQL support
- **🔒 Password Security** - bcrypt hashing for secure password storage
- **🎨 Clean Architecture** - Modular design with proper separation of concerns

## 🛠️ Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: TypeORM (supports PostgreSQL, MySQL, SQLite)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: class-validator & class-transformer
- **Testing**: Jest (Unit & Integration tests)
- **Code Quality**: ESLint, Prettier

## 📋 API Endpoints

### 🔐 Authentication Endpoints
```
POST /auth/register     - Register new user
POST /auth/login        - User login
POST /auth/reset-password - Reset user password
```

### 📝 Task Endpoints (Protected)
```
GET    /tasks          - Get all tasks
GET    /tasks/:id      - Get task by ID
POST   /tasks          - Create new task
PUT    /tasks/:id/update - Update task
DELETE /tasks/:id      - Delete task
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Database (PostgreSQL/MySQL/SQLite)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd task-crud
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=task_crud

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# App
PORT=3000
NODE_ENV=development
```

4. **Database Setup**
```bash
# Run database migrations (if you have them)
npm run migration:run
```

5. **Start the application**
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 🧪 Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

**Test Coverage**: 69 passing tests covering:
- ✅ AuthController (9 tests)
- ✅ AuthService (20 tests) 
- ✅ TasksController (16 tests)
- ✅ TasksService (23 tests)
- ✅ App Controller (1 test)

## 📁 Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data Transfer Objects
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── reset-password.dto.ts
│   ├── auth.controller.ts  # Auth API endpoints
│   ├── auth.service.ts     # Auth business logic
│   ├── auth.module.ts      # Auth module configuration
│   ├── users.entity.ts     # User database entity
│   ├── jwt.strategy.ts     # JWT passport strategy
│   ├── jwt-auth.guard.ts   # JWT authentication guard
│   └── auth-logging.interceptor.ts
├── tasks/                  # Tasks module
│   ├── dto/               # Data Transfer Objects
│   │   ├── create-task.dto.ts
│   │   └── update-task.dto.ts
│   ├── tasks.controller.ts # Task API endpoints
│   ├── tasks.service.ts    # Task business logic
│   ├── tasks.module.ts     # Task module configuration
│   └── task.entity.ts      # Task database entity
├── pipes/                 # Custom pipes
│   └── UpperCase.pipe.ts
├── app.module.ts          # Root application module
└── main.ts               # Application entry point
```

## 🔧 Usage Examples

### User Registration
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "john123",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Task (Protected)
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs"
  }'
```

### Get All Tasks (Protected)
```bash
curl -X GET http://localhost:3000/tasks \
  -H "Authorization: Bearer <your-jwt-token>"
```

## 🗄️ Database Schema

### Users Table
```sql
- id: UUID (Primary Key)
- username: VARCHAR (Unique)
- name: VARCHAR
- email: VARCHAR (Unique)
- password: VARCHAR (Hashed)
```

### Tasks Table
```sql
- id: UUID (Primary Key)
- title: VARCHAR
- description: TEXT
- completed: BOOLEAN (Default: false)
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds for password security
- **Input Validation** - Comprehensive request validation using DTOs
- **Route Protection** - JWT guards protecting sensitive endpoints
- **CORS Configuration** - Cross-origin request handling

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start:prod
```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-super-secure-production-jwt-secret
PORT=3000
```

## 📈 Performance & Best Practices

- **Modular Architecture** - Clean separation of concerns
- **Dependency Injection** - NestJS IoC container for better testability
- **Error Handling** - Comprehensive exception handling with proper HTTP status codes
- **Validation Pipes** - Input validation and transformation
- **Type Safety** - Full TypeScript implementation
- **Testing Strategy** - Unit tests with high coverage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/task-crud/issues) section
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Built By Ayman Elfeky**
