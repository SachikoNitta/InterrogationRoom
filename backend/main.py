from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/healthz")
def healthz():
    return JSONResponse(content={"status": "ok"})
