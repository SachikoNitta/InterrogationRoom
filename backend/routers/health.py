from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/health")
def healthz():
    return JSONResponse(content={"status": "ok"})
