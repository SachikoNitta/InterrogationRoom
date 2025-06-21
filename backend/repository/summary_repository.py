from google.cloud import firestore
import models.summary_model as summary_model

db = firestore.Client()

def create(summary: summary_model.Summary) -> summary_model.Summary:
    """新しいサマリーを作成し、Firestoreに保存する"""
    doc_ref = db.collection('summaries').document()
    doc_ref.set(summary.dict())
    #　# ドキュメントIDをsummary_idに設定
    summary.summaryId = doc_ref.id
    doc_ref.update({"summaryId": summary.summaryId})
    return summary

def get_by_summary_id(summary_id: str) -> summary_model.Summary:
    """指定されたsummaryIdのサマリーを取得する"""
    try:
        doc = db.collection('summaries').document(summary_id).get()
        if doc.exists:
            return summary_model.Summary(**doc.to_dict())
        else:
            raise ValueError(f"Summary with id {summary_id} does not exist.")
    except Exception as e:
        raise RuntimeError(f"Failed to get summary by id: {e}")

def get_all() -> list[summary_model.Summary]:
    """全てのサマリーを取得する"""
    try:
        docs = db.collection('summaries').stream()
        summaries = [summary_model.Summary(**doc.to_dict()) for doc in docs]
        return summaries
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve summaries: {e}")