from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/health")
def healthz():
    return JSONResponse(content={"status": "ok"})
