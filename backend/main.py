from fastapi import FastAPI
from routers import case, auth

app = FastAPI()

app.include_router(case.router)
app.include_router(auth.router)
