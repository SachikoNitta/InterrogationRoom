from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import case, auth

app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントURL（開発用）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case.router)
app.include_router(auth.router)
