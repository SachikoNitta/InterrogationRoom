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

def get_summary_by_id(summary_id: str) -> summary_model.Summary:
    """指定されたsummaryIdのサマリーを取得する"""
    try:
        doc = db.collection('summaries').document(summary_id).get()
        if doc.exists:
            return summary_model.Summary(**doc.to_dict())
        else:
            raise ValueError(f"Summary with id {summary_id} does not exist.")
    except Exception as e:
        raise RuntimeError(f"Failed to get summary by id: {e}")
