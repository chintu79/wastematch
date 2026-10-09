from fastapi import FastAPI
from .database import engine, Base
from .routers import identity, catalog, regulatory, specification, matching, inquiries, documents

# Create tables for now (will be replaced by Alembic later)

app = FastAPI(title="WasteMatch API", version="1.0")

app.include_router(identity.router)
app.include_router(catalog.router)
app.include_router(regulatory.router)
app.include_router(specification.router)
app.include_router(matching.router)
app.include_router(inquiries.router)
app.include_router(documents.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the WasteMatch API"}
