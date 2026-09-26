# 🏦 Bank Transaction & Ledger Management System

A backend API for a banking transaction system built with **Node.js, Express.js, MongoDB, and Mongoose**.

The system provides user authentication, account management, ledger-based balance calculation, secure money transfers, transaction tracking, idempotency, JWT invalidation, and email notifications.

---

## 🚀 Features

- 🔐 User registration and login
- 🔑 JWT-based authentication
- 🍪 Cookie-based authentication
- 🔒 Password hashing using bcrypt
- 👤 User and account management
- 💰 Account-to-account money transfers
- 📒 Ledger-based transaction system
- 📊 Balance calculated from ledger entries
- 🔄 Transaction status tracking
- 🛡️ Idempotency key support to prevent duplicate transactions
- 🔒 MongoDB transactions for atomic operations
- 🚫 JWT blacklist for token invalidation
- 📧 Transaction email notifications using Nodemailer and OAuth2
- 🧩 Modular backend structure

---

## 🧠 Ledger-Based Balance

The system does not rely on a manually maintained account balance.

Instead, account balance is calculated from ledger entries:

```text
Balance = Total Credit - Total Debit
```

This keeps the transaction history as the source of the account balance.

---

## 💳 Transaction Flow

```text
Authenticated User
        ↓
Validate Accounts
        ↓
Validate Transaction
        ↓
Check Idempotency Key
        ↓
Check Available Balance
        ↓
Create Debit Ledger Entry
        ↓
Create Credit Ledger Entry
        ↓
Create Transaction Record
        ↓
Commit MongoDB Transaction
        ↓
Send Transaction Notification
```

MongoDB sessions/transactions are used to keep related database operations consistent.

---

## 🛡️ Security

The backend includes:

- JWT authentication
- HTTP-only authentication cookies
- Password hashing with bcrypt
- JWT blacklist for invalidated tokens
- Account ownership validation
- Transaction validation
- Idempotency keys
- Environment variables for sensitive credentials
- MongoDB transactions for atomic operations

---

## 🔄 Idempotency

Transactions use an **idempotency key** to prevent accidental duplicate processing.

If the same request is submitted more than once, the existing transaction can be detected instead of processing the transfer again.

```text
Request 1 → Transaction processed
Request 2 → Existing transaction detected
```

---

## 📁 Project Structure

```text
Backend/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── account.controller.js
│   │   ├── auth.controller.js
│   │   └── transaction.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── models/
│   │   ├── account.model.js
│   │   ├── blacklist.model.js
│   │   ├── ledger.model.js
│   │   ├── transaction.model.js
│   │   └── user.model.js
│   │
│   ├── routes/
│   │   ├── account.routes.js
│   │   ├── auth.routes.js
│   │   └── transaction.routes.js
│   │
│   ├── services/
│   │   └── ...
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- JavaScript

### Database
- MongoDB
- Mongoose

### Authentication & Security
- JSON Web Token (JWT)
- bcrypt
- HTTP-only cookies

### Email & Notification
- Nodemailer
- OAuth2

### Development
- Git
- GitHub
- REST API

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/bank-transaction-backend.git
```

### 2. Navigate into the project

```bash
cd bank-transaction-backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create the `.env` file

Create a `.env` file in the project root and add your environment variables.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add the required email/OAuth2 configuration if email notifications are enabled.

> **Never commit your `.env` file to GitHub.**

---

## ▶️ Running the Server

Start the server with:

```bash
node server.js
```

The API will run on:

```text
http://localhost:3000
```

For development with Nodemon:

```bash
npx nodemon server.js
```

---

## 🔐 Environment Variables

The application uses environment variables for sensitive configuration.

Required configuration includes:

```text
MONGO_URI
JWT_SECRET
```

Email/OAuth2 variables are also required when transaction email notifications are configured.

Keep all credentials inside `.env`.

---

## 📌 API Modules

The backend provides APIs for:

### Authentication
- User registration
- User login
- User logout

### Accounts
- Account creation
- Account information
- Balance retrieval

### Transactions
- Create transactions
- Validate transactions
- Track transaction status
- Prevent duplicate transactions using idempotency keys

---

## 🗃️ Database Models

The application contains the following main models:

### User
Stores user authentication and user-related information.

### Account
Represents a user's bank account.

### Ledger
Stores individual debit and credit entries used to calculate account balance.

### Transaction
Stores transaction information and its processing status.

### Blacklist
Stores invalidated JWT tokens.

---

## 🔄 Transaction Status

Transactions can have different states, including:

```text
PENDING
COMPLETED
FAILED
REVERSED
```

This allows transaction processing and failure states to be tracked.

---

## 📧 Email Notifications

The backend uses **Nodemailer** with OAuth2 configuration to send transaction-related email notifications.

---

## 🔒 Important

This project is intended for educational and portfolio purposes and is **not a production banking system**.

A real banking application would require additional security, compliance, auditing, encryption, fraud detection, infrastructure, monitoring, and regulatory requirements.

---

## 👨‍💻 Author

**Your Name**

B.Tech Computer Science & Engineering

---

## 🚧 Future Improvements

- Swagger/OpenAPI API documentation
- Unit and integration testing
- Rate limiting
- Request validation
- Centralized error handling
- Refresh-token authentication
- Docker support
- CI/CD
- Transaction history pagination
- Advanced logging and monitoring

---

## 📄 License

This project is for educational and portfolio purposes.
