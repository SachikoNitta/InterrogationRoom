from fastapi import APIRouter, HTTPException
import services.summary_service as summary_service

router = APIRouter()

@router.get("/api/summaries/{summary_id}")
def get_summary(summary_id: str):
    """指定されたsummaryIdのサマリーを取得するAPIエンドポイント。"""
    summary = summary_service.get_summary(summary_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary

@router.get("/api/summaries")
def get_all_summaries():
    """全てのサマリーを取得するAPIエンドポイント。"""
    try:
        return summary_service.get_all_summaries()
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/api/summaries")
def generate_summary(case_id: str):
    """指定されたcaseIdのサマリーを生成するAPIエンドポイント。"""
    try:
        return summary_service.generate_case_summary(case_id)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")