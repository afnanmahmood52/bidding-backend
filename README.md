# 🚀 Auction Backend (NestJS + PostgreSQL)

This is the backend server for a real-time auction system built using **NestJS**, **PostgreSQL**, **TypeORM**, and **Docker**.

---

## 🧰 Tech Stack

- **NestJS** – Progressive Node.js framework
- **TypeORM** – ORM for PostgreSQL
- **PostgreSQL** – Database (Used Deployed on Supabase)
- **Docker** – Containerized local development
- **Render** – Cloud platform for deployment
- **GitHub Actions** – CI/CD

---

## 📦 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Git](https://git-scm.com/) installed

---

## 🚀 Running the Backend Locally

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/auction-backend.git
cd auction-backend
2. Create .env File
At the root of the project, add a .env file:

env
Copy
Edit
DATABASE_URL=postgres://postgres:postgres@db:5432/bidding
FRONTEND_URL=http://localhost:5173
PORT=3000
You can change FRONTEND_URL to match your frontend URL.

3. Start with Docker
bash
Copy
Edit
docker compose up --build
This command will:

Start a PostgreSQL container

Build and run the NestJS backend

Backend is accessible at: http://localhost:3000

✅ API Overview
Method	Endpoint	Description
GET	/items	Get all auction items
POST	/items	Create an item
GET	/bids/:itemId	Get bids for an item
POST	/bids	Place a bid

⚙️ Development Notes
🧠 Key Decisions
PostgreSQL via Docker for easy portability

TypeORM to simplify DB interaction

Used transactions and locking mechanisms to prevent race conditions during bid placement

Designed for stateless REST services, suitable for horizontal scaling

Environment-based CORS to allow secure frontend/backend interaction

🔁 Race Condition Handling
To avoid concurrent write issues:

placeBid() uses TypeORM transactions

Applies pessimistic locking on item records

Checks for highest bid inside the transaction before writing

This guarantees that multiple simultaneous bids are handled safely.

🚀 CI/CD with GitHub Actions & Render
🧪 GitHub Actions CI
A GitHub Actions workflow runs on every push to main:

Installs dependencies

Builds the app

(Optional) Can run tests/lint

Triggers deployment to Render

.github/workflows/deploy.yml:

yaml
Copy
Edit
name: Deploy to Render

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - name: Deploy to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
🔐 Add RENDER_DEPLOY_HOOK in your GitHub repo secrets.

☁️ Render Deployment
Go to https://dashboard.render.com

Click New Web Service

Link to this repo

Configure:

Build Command: npm run build

Start Command: npm run start:prod

Add environment variables:

DATABASE_URL

FRONTEND_URL

Enable auto-deploy from main branch

🐳 Docker Compose
Example docker-compose.yml used for local development:

yaml
Copy
Edit
version: '3.8'

services:
  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bidding
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: .
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432/bidding
      FRONTEND_URL: http://localhost:5173
    depends_on:
      - db

volumes:
  pgdata:
🐞 Common Issues
💤 Render Free Tier Inactivity
Render free tier services sleep after 15 minutes of inactivity.

This may cause slow initial responses.

Consider upgrading for production workloads.

🔁 Race Conditions
Handled using database-level locks and transactions during bid placement.

❌ CORS Issues
Ensure FRONTEND_URL is correctly set in environment variables to allow CORS.

📄 .gitignore
gitignore
Copy
Edit
node_modules
.env
dist
