from fastapi import FastAPI
from .database import engine, Base
from .routers import identity, catalog

# Create tables for now (will be replaced by Alembic later)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WasteMatch API", version="1.0")

app.include_router(identity.router)
app.include_router(catalog.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the WasteMatch API"}
