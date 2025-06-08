from fastapi import FastAPI
from routers import health, case, auth

app = FastAPI()

app.include_router(health.router)
app.include_router(case.router)
app.include_router(auth.router)
