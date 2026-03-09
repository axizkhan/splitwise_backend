# Splitly Backend Documentation

---

## 1. Introduction

Splitly Backend is the core server-side component of the Splitly group expense splitting application. It manages all business logic, data storage, authentication, and communication with external services. The backend is responsible for:

- Handling API requests from the frontend
- Managing group creation, member invitations, expense tracking, payments, and balance calculations
- Authenticating users and securing endpoints
- Sending email notifications for key actions
- Persisting data in MongoDB

---

## 2. System Overview

The backend serves as the central hub for the Splitly platform, interacting with:

- **Frontend Application**: Receives REST API requests, processes them, and returns structured JSON responses.
- **Database (MongoDB)**: Stores all persistent data including users, groups, expenses, payments, invites, and balances.
- **Email Services**: Sends emails for signup, verification, invitations, reminders, and notifications using Nodemailer.

---

## 3. Architecture

Splitly backend follows a modular, layered architecture:

- **Routes**: Define API endpoints and map them to controllers.
- **Controllers**: Handle HTTP requests, validate input, and delegate business logic to services.
- **Services**: Contain business logic, interact with models, and perform operations.
- **Models**: Mongoose schemas representing MongoDB collections.
- **Middleware**: Handle authentication, error processing, response formatting, and request validation.
- **Utilities**: Helper functions for hashing, email, token generation, etc.

### Request Flow

1. **Client** sends an HTTP request to an API endpoint.
2. **Route** matches the endpoint and forwards the request to the appropriate controller.
3. **Controller** processes the request, validates input, and calls the relevant service.
4. **Service** executes business logic, interacts with models, and returns results.
5. **Model** performs database operations.
6. **Middleware** handles authentication, errors, and response formatting.
7. **Response** is sent back to the client.

---

## 4. Tech Stack

| Technology  | Purpose                         |
| ----------- | ------------------------------- |
| Node.js     | JavaScript runtime              |
| Express.js  | Web framework for REST APIs     |
| MongoDB     | NoSQL database                  |
| Mongoose    | ODM for MongoDB                 |
| JWT         | Authentication tokens           |
| Passport.js | Authentication middleware       |
| Nodemailer  | Email sending                   |
| dotenv      | Environment variable management |
| bcrypt      | Password hashing                |
| TypeScript  | Type safety and maintainability |

---

## 5. Project Structure

```
src/
	app.ts                # Express app setup
	index.ts              # Entry point
	main.ts               # Bootstrapping server
	controller/           # Controllers for each domain
		expense.controller.ts
		group.controller.ts
		journel.controller.ts
		notification.controller.ts
		payment.controller.ts
		user.controller.ts
		userAuth.controller.ts
	error/                # Custom error classes
		httpClientError.ts
		httpServerError.ts
	logs/                 # Error logs
	middleware/           # Middleware functions
		errorHandlingMiddleware.ts
		isUserExistMiddleware.ts
		reponseSenderMiddleware.ts
		passport/
			passportJwtAuth.ts
			passportLocalLoginMiddleware.ts
	models/               # Mongoose schemas
		balanceModel.ts
		emailVerficationModel.ts
		entryModel.ts
		expenseModel.ts
		groupModel.ts
		journelModel.ts
		paymentModel.ts
		reminderModel.ts
		userInvite.ts
		userModel.ts
	routes/               # API route definitions
		index.ts
		authRoutes/
			expense.routes.ts
			group.routes.ts
			index.ts
			journel.routes.ts
			payment.routes.ts
			reminder.routes.ts
			user.routes.ts
		noAuthRoutes/
			index.ts
			user.routes.ts
	server/               # Server setup
		server.ts
	service/              # Business logic
		balance.service.ts
		emailVerification.service.ts
		enetry.service.ts
		expense.service.ts
		group.service.ts
		invites.service.ts
		journel.service.ts
		jwtToken.service.ts
		payment.service.ts
		reminder.service.ts
		user.service.ts
		userAuth.service.ts
	store/                # Service container
		serviceContainer.ts
	types/                # TypeScript types
		balance.ts
		entery.ts
		expense.ts
		group.ts
		groupDetail.types.ts
		journel.ts
		jwtUser.ts
		user.ts
		userModel.ts
		express/
			index.d.ts
	utils/                # Utility functions
		hashing.util.ts
		passwordRegex.ts
		mail/
			mail.service.ts
			mailTokenGeneration.ts
```

### Directory Purpose

- **controller/**: Handles incoming requests and response logic.
- **service/**: Contains business logic and interacts with models.
- **models/**: Defines MongoDB schemas and collections.
- **routes/**: Maps endpoints to controllers.
- **middleware/**: Handles authentication, error processing, and response formatting.
- **utils/**: Helper functions for hashing, email, etc.
- **types/**: TypeScript type definitions.
- **error/**: Custom error classes for consistent error handling.
- **store/**: Service container for dependency management.
- **server/**: Server initialization and configuration.
- **logs/**: Stores error logs.

---

## 6. Installation & Setup

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or cloud instance)
- npm

### Clone Repository

```bash
git clone <repository-url>
cd splitly-backend
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory. Example:

```env
PORT=8080
MONGODB_URL=mongodb://localhost:27017/splitly
JWT_SIGN=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_email_password
FRONTEND_URL=http://localhost:3000
SALT_ROUND=10
```

**Variable Explanations:**

- `PORT`: Port for server to run
- `MONGODB_URL`: MongoDB connection string
- `JWT_SIGN`: Secret for JWT token signing
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`: Email service credentials
- `FRONTEND_URL`: URL for frontend app (used in email links)
- `SALT_ROUND`: bcrypt salt rounds for password hashing

### Running the Server

```bash
npm run dev
```

---

## 7. API Documentation

### Authentication

- **POST /api/user/signup-local**
  - Registers a new user (local signup)
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123",
      "firstName": "John",
      "lastName": "Doe"
    }
    ```
  - Response:
    ```json
    {
      "message": "User signup successfully",
      "data": "Check your email"
    }
    ```

- **GET /api/user/verify-email?token=...**
  - Verifies user email using token
  - Response:
    ```json
    {
    	"message": "User verified successfully",
    	"data": { "user": { ... }, "accessToken": "..." }
    }
    ```

- **POST /api/user/login-local**
  - Logs in user
  - Request body:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - Response:
    ```json
    {
    	"message": "User login successfully",
    	"data": { "user": { ... }, "accessToken": "..." }
    }
    ```

### Users

- **GET /api/auth/user/**
  - Returns all groups for authenticated user
  - Response:
    ```json
    {
    	"data": [ { "_id": "...", "name": "Group 1", ... } ],
    	"statusCode": 200,
    	"message": "Data found successfully"
    }
    ```

### Groups

- **POST /api/auth/group/**
  - Create a new group
  - Request body:
    ```json
    {
      "name": "Trip to Goa",
      "description": "Friends trip"
    }
    ```
  - Response:
    ```json
    {
    	"data": { "_id": "...", "name": "Trip to Goa", ... },
    	"statusCode": 201,
    	"message": "GROUP_CREATED_SUCCESSFULLY"
    }
    ```

- **PUT /api/auth/group/:groupId**
  - Add member to group by email
  - Request body:
    ```json
    {
      "newMemberEmail": "friend@example.com"
    }
    ```
  - Response:
    ```json
    {
      "message": "Invitation sent to user email"
    }
    ```

- **GET /api/auth/group/:groupId**
  - Get group details and balances

- **DELETE /api/auth/group/:groupId**
  - Delete group (creator only)

### Invitations

- **POST /api/auth/group/:groupId**
  - Invites user to group (if not registered)

### Expenses

- **POST /api/auth/expense/:groupId**
  - Add expense to group
  - Request body:
    ```json
    {
      "title": "Lunch",
      "amount": 500,
      "description": "Lunch at restaurant"
    }
    ```

- **GET /api/auth/expense/user/:groupId**
  - Get all expenses added by user in group

- **GET /api/auth/expense/:groupId**
  - Get all expenses in group

- **PUT /api/auth/expense/:expenseId**
  - Edit expense amount

- **DELETE /api/auth/expense/:expenseId**
  - Delete expense

### Payments

- **POST /api/auth/payment/**
  - Record payment between users
  - Request body:
    ```json
    {
      "groupId": "...",
      "paidToId": "...",
      "amount": 200
    }
    ```

### Balance Calculations

- **GET /api/auth/group/:groupId**
  - Returns group summary, balances, and user data

### Reminders

- **POST /api/auth/reminder/:groupId/:memberId**
  - Send payment reminder to group member

### Journals

- **GET /api/auth/journel/:journelId/:pageNumber**
  - Get journal entries for a group

---

## 8. Database Models

### User

```js
{
	emailId: String,
	name: { firstName: String, lastName: String },
	mobileNumber: Number,
	upiId: String,
	isEmailVerified: Boolean,
	account: { type: "local" | "google", passwordHash, providerId },
	updatedAt: Date,
	deletedAt: Date
}
```

### Group

```js
{
	createdBy: ObjectId,
	name: String,
	description: String,
	totalAmount: Number,
	members: [
		{ memberId: ObjectId, amountOwed: Number, amountToBeRecieved: Number }
	]
}
```

### Expense

```js
{
	groupId: ObjectId,
	title: String,
	description: String,
	amount: Number,
	paidBy: ObjectId,
	deletedAt: Date
}
```

### Payment

```js
{
	paidBy: ObjectId,
	paidTo: ObjectId,
	amount: Number,
	groupId: ObjectId,
	createdAt: Date
}
```

### UserInvite

```js
{
	emailId: String,
	groupId: ObjectId,
	invitedBy: ObjectId,
	createdAt: Date
}
```

### Relationships

- **User** can belong to multiple **Groups**
- **Group** has multiple **Members** (Users)
- **Expense** is linked to a **Group** and a **User** (paidBy)
- **Payment** records transactions between users in a group
- **UserInvite** tracks invitations sent to users

---

## 9. Error Handling

Errors are handled using custom error classes and middleware. API responses include:

- `success`: Boolean
- `message`: Error or success message
- `code`: Error code (if applicable)
- `data`: Response data or empty array

Example error response:

```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED",
  "data": []
}
```

---

## 10. Authentication & Security

- **JWT Authentication**: Users receive JWT tokens on login. Protected routes require valid JWT in Authorization header.
- **Passport.js**: Used for local and JWT authentication strategies.
- **Password Hashing**: User passwords are hashed using bcrypt before storage.
- **Protected Routes**: Middleware checks for authenticated users before allowing access.
- **Input Validation**: Controllers and services validate input data.

---

## 11. Development Guidelines

- Use TypeScript for all code
- Follow modular architecture (controller → service → model)
- Use async/await for asynchronous operations
- Write clear, descriptive function and variable names
- Handle errors using custom error classes and middleware
- Keep business logic in services, not controllers
- Use environment variables for secrets and configuration
- Document new endpoints and models
- Write unit and integration tests for new features

---

## 12. Future Improvements

- Add OAuth (Google/Facebook) authentication
- Improve API documentation (Swagger/OpenAPI)
- Add unit and integration tests
- Support recurring expenses and multi-currency
- Add push notifications for mobile/web
- Build admin dashboard for analytics and monitoring
- Enhance error logging and monitoring
- Optimize performance for large groups
- Improve invitation and onboarding flow

---

## 13. License

ISC
