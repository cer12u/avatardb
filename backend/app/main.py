from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# import psycopg # Removed
from contextlib import asynccontextmanager
from .db import init_db
from .routers import images  # Import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Database...")
    await init_db()
    print("Database Initialized.")
    yield
    print("Closing application.")


app = FastAPI(lifespan=lifespan)  # Add lifespan

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router)  # Include the image router


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}
