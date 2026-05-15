# HireHub - Monorepo Structure

## Folder Structure
- `backend/`: Prisma ORM, Database schema, and Server configurations.
- `frontend/`: Next.js Web application (Frontend + API Routes).

## How to run
1. Clone the repository
2. Set up `.env` files in both `backend/` and `frontend/` folders.
3. Use Docker Compose:
   ```bash
   docker-compose up --build
   ```
4. Frontend will be available at `http://localhost:3001`
5. Backend/API will be available at `http://localhost:3000`
