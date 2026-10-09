# WasteMatch Platform

WasteMatch is a Search-First B2B Industrial Marketplace for secondary raw materials. This platform connects industrial producers with compatible buyers to facilitate the exchange of waste materials as a resource.

## Running the Application

### Running the Backend

You can run the backend using either Docker Compose (recommended) or locally with Uvicorn.

#### Option 1: Docker Compose (Recommended)
This will spin up the FastAPI server, the PostgreSQL database (with PostGIS), and PgBouncer.

1. Ensure you have Docker and Docker Compose installed.
2. From the project root, copy the environment variables:
   ```bash
   cp .env.example .env
   ```
3. Run docker-compose:
   ```bash
   docker-compose up --build
   ```
   The backend API will be available at `http://localhost:8000`, and interactive docs at `http://localhost:8000/docs`.

#### Option 2: Local Development Mode
To run the FastAPI server natively:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment:
   ```bash
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Running the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

## Architecture Highlights
- **Frontend**: Next.js App Router, Tailwind CSS
- **Backend**: FastAPI, SQLAlchemy (PostGIS), Alembic
- **Database**: PostgreSQL with Row-Level Security (RLS) for Multi-Tenancy

For full release notes and feature breakdowns, please see [RELEASE.md](./RELEASE.md).
