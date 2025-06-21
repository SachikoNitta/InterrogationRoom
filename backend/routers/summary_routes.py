from fastapi import APIRouter, HTTPException
import services.summary_service as summary_service

router = APIRouter()

@router.get("/summaries/{summary_id}")
def get_summary(summary_id: str):
    summary = summary_service.get_summary(summary_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary

@router.post("/summaries")
def generate_summary(case_id: str):
    try:
        return summary_service.generate_case_summary(case_id)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")