# Campus Resource Mini Search Engine 📚🚀

A robust, full-stack monorepo application designed to help university students share, discover, and organize academic resources like past papers, lecture notes, and helpful links.

Built with performance, modern styling, and scalable architecture in mind.

---

## 🏗️ Architecture & Tech Stack

This project is structured as a **Monorepo**, cleanly separating the frontend client from the backend API services.

### Frontend (`/frontend`)
- **Framework**: `Next.js 14` (App Router) with React.
- **Styling**: `CSS Modules` + Custom variables for a premium, custom "Glassmorphism" Dark Mode UI.
- **Language**: `TypeScript`.

### Backend (`/backend`)
- **Server**: `Node.js` with `Express`.
- **Database ORM**: `Prisma`.
- **Database**: `PostgreSQL` via Docker. Include native Full-Text Search (FTS) using `ts_vector` and `ts_rank` for hyper-relevant query matching.
- **Authentication**: Stateless generic `JWT` matching and secure password hashing via `Bcrypt`.
- **File Uploads**: Handled securely via `Multer` for local persistent multipart processing.
- **Language**: `TypeScript`.

---

## 🌟 Key Features

1. **Intelligent Search Engine**: Blazing fast search using Postgres FTS, ranking results strictly by title, subject, and rich descriptions.
2. **Resource Uploads**: Students can easily upload direct PDFs or submit external references/links.
3. **Authentication & Profile Profiles**: JWT-powered Demo Login providing users with dedicated profiles to see what they've uploaded and their saved/bookmarked resources.
4. **Duplicate Protection**: Backend natively validates file paths and external links to prevent database cluttering.
5. **PDF Previews**: Embedded iFrames strictly for on-site document reviewing.

---

## 🏃‍♂️ Running Locally

### Prerequisites
You need **Node.js** and **Docker** installed on your machine.

### 1. Database Setup
We use Docker to quickly spin up the required PostgreSQL instance locally:

```bash
# Boot up the PostgreSQL container
npm run db:up
```

*(Note: If you are not using Docker, you can swap `DATABASE_URL` in `backend/.env` with your own Cloud Postgres URL like Supabase or Neon, and then run `cd backend && npx prisma db push`)*.

### 2. Start the Application
Install all dependencies automatically, compile Prisma clients, and run both Next.js and Express servers simultaneously:

```bash
# Install everything
npm install

# Start development servers concurrently
npm run dev
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3002`
