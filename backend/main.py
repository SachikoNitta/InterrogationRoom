from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import case_routes, auth_routes


app = FastAPI()

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントURL（開発用）
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_routes.router)
app.include_router(auth_routes.router)
