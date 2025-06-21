import os

def get_prompt(prompt_name: str) -> str:
    """
    prompts ディレクトリから指定名のプロンプトファイルを読み込んで返す
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prompt_path = os.path.join(base_dir, "prompts", prompt_name)
    with open(prompt_path, "r", encoding="utf-8") as f:
        return f.read()
