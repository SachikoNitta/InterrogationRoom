from datetime import datetime
from typing import List, Optional
from fastapi.responses import StreamingResponse
import models.case_model as case_model
import repository.case_repository as case_repo
import repository.summary_repository as summary_repo
import services.gemini_client as gemini_client
import services.prompt_manager as prompt_manager

def get_case_id(summary_id: str, user_id: str) -> str:
    """ケースIDを生成する関数"""
    return f"{summary_id}_{user_id}"

def get_default_case(user_id: str, summary_id: str) -> case_model.Case:
    """デフォルトのケースを取得する関数"""
    try:
        case_id = get_case_id(summary_id, user_id)

        # デフォルトのケースを作成
        case = case_model.Case(
            caseId=case_id,
            userId=user_id,
            status=case_model.Case.STATUS_IN_PROGRESS,
            createdAt=datetime.now(),
            lastUpdated=datetime.now(),
            summaryId=summary_id,
            logs=[],
            tokenUsage=case_model.TokenUsage(totalTokens=0, inputTokens=0, outputTokens=0)
        )
        return case
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_default_case: {e}")

def create_my_case(summary_id: str, user_id: str)-> case_model.Case:
    """新しいケースを作成する関数"""
    try:
        # Caseを作成する
        case = get_default_case(user_id, summary_id)

        # Firestoreに保存する
        case = case_repo.create(case)

        return case
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.create_case: {e}")

def get_my_cases(user_id: str) -> List[case_model.Case]:
    """現在のユーザーのケース一覧を取得する関数"""
    try:
        # ユーザーIDからケースを取得する
        cases = case_repo.get_by_user_id(user_id)
        return cases
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_my_cases: {e}")

def get_my_case_by_id(case_id: str, user_id: str)-> case_model.Case:
    """指定されたcaseIdのケースを取得する関数"""
    try:
        case = case_repo.get_by_case_id_and_user_id(case_id, user_id)

        if not case:
            raise Exception("Case not found")
        return case
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_case_by_id: {e}")
    
def get_my_case_by_summary_id(summary_id: str, user_id: str) -> Optional[case_model.Case]:
    """指定されたsummaryIdのケースを取得する関数"""
    try:
        return case_repo.get_by_summary_id_and_user_id(summary_id, user_id)
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.get_case_by_summary_id: {e}")
    
def delete_my_case(case_id: str, user_id: str):
    """指定されたcaseIdのケースを削除する関数"""
    try:
        case_repo.delete_by_case_id_and_user_id(case_id, user_id)
    except Exception as e:
        raise RuntimeError(f"Failed to delete case: {e}")

def generate_my_suspect_response(case_id: str, message: str, user_id: str) -> StreamingResponse:
    """指定されたcaseIdのケースに対してチャットの応答を生成する関数"""
    # todo: Userのメッセージを最後に保存する.
    try:
        def save_reply(full_text: str, token_usage_input: int, token_usage_output: int, token_usage_total: int):
            """全てのレスポンスが完了した後に呼び出されるコールバック関数"""
            # Caseを更新
            token_usage = case_model.TokenUsage(
                totalTokens=token_usage_total,
                inputTokens=token_usage_input,
                outputTokens=token_usage_output
            )
            print(f"Token usage: {token_usage.json()}")
            log = case_model.LogEntry(role="model", message=full_text, createdAt=datetime.now(), tokenUsage = token_usage)
            case_repo.append_log(case_id, user_id, log)

        # Userのメッセージをログに保存
        log = case_model.LogEntry(role="user", message=message, createdAt=datetime.now())
        case_repo.append_log(case_id, user_id, log)

        # Caseを取得
        case = case_repo.get_by_case_id_and_user_id(case_id, user_id)
        if not case:
            raise Exception("Case not found")

        logs = case.logs if case.logs else []
        system_prompt = prompt_manager.get_prompt("suspect_system_prompt.txt")
        summary = summary_repo.get_by_summary_id(case.summaryId)
        system_prompt += "事件の概要は以下です。: " + summary.json()
        print(f"System prompt: {system_prompt}")
        model = gemini_client.get_model("gemini-1.5-pro-002", system_instruction = system_prompt)
        stream = gemini_client.generate_stream_response(
            model,
            contents=build_gemini_contents(logs=logs),
            on_complete=save_reply
        )
        return StreamingResponse(stream, media_type="text/plain")
    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.generate_my_suspect_response: {e}")

def build_gemini_contents(logs: List[case_model.LogEntry] = None) -> List[gemini_client.Content]:
    """LogEntry型のリストからContent型のリストを生成する"""
    try:
        contents = []

        # ログエントリからコンテンツを生成
        if logs:
            for log in logs:
                message = log.message
                if not message:
                    continue
                
                part = gemini_client.Part.from_text(message)
                content = gemini_client.Content(role=log.role, parts=[part])
                contents.append(content)
    except Exception as e:
        raise RuntimeError(f"Failed to build Gemini contents: {e}")

    return contents