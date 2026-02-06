# 🔐 AuthService – Authentication, Authorization & RBAC as a Service

AuthService is a **production-grade authentication and authorization platform** built for developers who create real-world, client-facing applications.

It centralizes **user storage, roles, permissions, and security**, while allowing **clients to manage access directly inside their own applications** — without ever visiting the AuthService dashboard.

---

## 🎯 Problem Statement

Most applications need:
- Secure authentication
- Role-based access control (RBAC)
- Permission management
- Multi-tenant user isolation

However:
- Implementing auth + RBAC repeatedly is time-consuming
- Clients want full control over users and permissions
- Third-party admin dashboards are often unacceptable

AuthService solves this by acting as a **central authentication and authorization system** that integrates seamlessly into any project.

---

## 👥 Personas

There are three distinct actors in the system:

- **AuthService Owner**  
  Maintains the authentication platform.

- **Developer**  
  Builds applications using AuthService.

- **Client**  
  Owns the application built by the developer and manages users inside that app.

> ⚠️ Clients never log into AuthService directly.  
> All user, role, and permission management happens inside the client’s own application.

---

## 🧠 Core Concept

- Developers register their projects in AuthService
- AuthService generates a **Client ID** and **Client Secret**
- The project integrates AuthService via APIs or SDK
- Users are stored centrally but scoped per project
- Roles and permissions are enforced at runtime
- Clients manage everything from their own application UI

---

## 🏗 High-Level Architecture

```
Client Application (React / Next.js)
        |
        | AuthService SDK / REST APIs
        |
AuthService Backend (Node.js + Express)
        |
PostgreSQL Database (Prisma ORM)
        |
JWT & Refresh Tokens
```

---

## ✨ Features

### Authentication
- Email & password login
- JWT-based access tokens
- Refresh token rotation
- Secure password hashing
- Project-level authentication isolation

### Authorization (RBAC)
- Role creation per project
- Permission assignment to roles
- User-role mapping
- Permission validation via middleware

### Client-Controlled Access
- Clients manage users, roles, and permissions inside their app
- No dependency on AuthService dashboard
- Fully API-driven design

### Developer-Friendly
- REST APIs
- Lightweight npm SDK
- Simple middleware for permission checks
- Clear integration patterns

---

## 🧱 Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt

### Dashboard
- Next.js
- React
- TypeScript
- Tailwind CSS

### SDK
- JavaScript / TypeScript
- Published as an npm package

---

## 📁 Project Structure

```
auth-service/
├── apps/
│   ├── dashboard/        # Developer Dashboard (Next.js)
│   └── api/              # Backend API (Express)
│
├── packages/
│   └── auth-service-sdk/ # npm SDK
│
├── prisma/
│   └── schema.prisma
│
├── docs/
│   └── api-reference.md
│
└── README.md
```

---

## 🔐 Authentication Flow

1. Developer creates a project in AuthService dashboard
2. AuthService generates Client ID and Client Secret
3. Developer integrates AuthService into their backend
4. User logs in from the client application
5. AuthService validates credentials
6. JWT is issued containing roles and permissions
7. Client backend authorizes requests using the token

---

## 🧩 Authorization Flow (RBAC)

1. Client defines roles (e.g., Admin, Manager, User)
2. Client assigns permissions to roles
3. Client assigns roles to users
4. Backend validates permissions via middleware

Example permissions:
```
user:create
user:update
invoice:read
invoice:delete
```

---

## 📦 SDK Usage Example

```ts
import { AuthService } from "@auth-service/sdk";

const auth = new AuthService({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

await auth.login({
  email: "user@example.com",
  password: "password123",
});
```

---

## 🛡 Backend Permission Middleware Example

```ts
import { checkPermission } from "@auth-service/sdk/middleware";

app.post(
  "/users",
  checkPermission("user:create"),
  createUserController
);
```

---

## 🧑‍💻 Developer Dashboard

The dashboard is only for developers and provides:
- Project creation and management
- Client credentials (ID & Secret)
- API documentation
- SDK integration guides

---

## 👥 Client Experience

Clients manage access entirely inside their application:
- Create and manage users
- Assign roles and permissions
- Enable or disable users

This keeps full control in the client’s hands.

---

## 🗃 Database Design (Simplified)

Core tables:
- projects
- users
- roles
- permissions
- role_permissions
- user_roles
- tokens

All data is **project-scoped** to prevent cross-project access.

---

## 🔒 Security Practices

- Hashed passwords and secrets
- Token expiration and rotation
- Strict project isolation
- Role-based authorization
- Rate limiting
- Audit logs (planned)

---

## 🛣 Roadmap

- OAuth providers (Google, GitHub)
- Multi-factor authentication
- Audit logging
- Organization support
- Usage-based billing
- Role templates

---

## 🧪 Local Development

```bash
git clone https://github.com/yourusername/auth-service
cd auth-service

npm install
npm run dev
```

---

## 📄 License

MIT License

---

## ⭐ Final Note

AuthService is built to solve a real industry problem:

**Providing secure, reusable authentication and authorization without taking control away from clients.**
