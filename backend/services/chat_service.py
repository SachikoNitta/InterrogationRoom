import services.gemini_client as gemini_client
import services.prompt_manager as prompt_manager
from fastapi.responses import StreamingResponse

def _stream_response(system_prompt, summary, logs, on_complete):
    """
    Geminiへリクエストを送り、ストリームを返す（共通処理）
    """
    system_prompt += "事件の概要は以下です。: " + summary.json()
    print(f"System prompt: {system_prompt}")
    model = gemini_client.get_model("gemini-1.5-pro-002", system_instruction=system_prompt)
    stream = gemini_client.generate_stream_response(
        model,
        contents=logs,
        on_complete=on_complete
    )
    return stream

def stream_suspect_response(summary, logs, on_complete):
    """
    Geminiへ容疑者向けのリクエストを送り、ストリームを返す
    """
    system_prompt = prompt_manager.get_prompt("suspect_system_prompt.txt")
    return _stream_response(system_prompt, summary, logs, on_complete)

def stream_assistant_response(summary, logs, on_complete):
    """
    Geminiへ新米刑事向けのリクエストを送り、ストリームを返す
    """
    system_prompt = prompt_manager.get_prompt("assistant_system_prompt.txt")
    return _stream_response(system_prompt, summary, logs, on_complete)

def build_gemini_contents(logs):
    """
    LogEntry型のリストからContent型のリストを生成する
    """
    import services.gemini_client as gemini_client
    contents = []
    if logs:
        for log in logs:
            message = log.message
            if not message:
                continue
            part = gemini_client.Part.from_text(message)
            content = gemini_client.Content(role=log.role, parts=[part])
            contents.append(content)
    return contents
