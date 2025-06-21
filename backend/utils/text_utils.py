import json

def extract_json_block(text: str) -> str:
    """バッククォートで囲まれたjsonを取り出す"""
    if text.strip().startswith("```json"):
        # 上下の ``` を取り除く
        lines = text.strip().splitlines()
        # 最初の ```json と最後の ``` を除く
        return "\n".join(lines[1:-1])
    return text