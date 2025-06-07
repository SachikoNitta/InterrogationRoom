# Gemini APIクライアント（Vertex AI公式推奨方式）
import os
from typing import List, Dict
import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import secretmanager

def get_project_id() -> str:
    """
    Get the Google Cloud project ID from environment variables.
    
    Returns:
        str: The project ID.
    
    Raises:
        RuntimeError: If the project ID is not set in the environment variables.
    """
    PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT") or os.getenv("PROJECT_ID")
    if not PROJECT_ID:
        raise RuntimeError("環境変数 GOOGLE_CLOUD_PROJECT または PROJECT_ID が設定されていません。Cloud Run上では自動でセットされますが、ローカル開発時は.envファイル等で明示的に指定してください。")
    return PROJECT_ID

def initialize_vertex_ai():
    """
    Initialize the Vertex AI client with the project ID.
    
    Raises:
        RuntimeError: If the project ID is not set in the environment variables.
    """
    PROJECT_ID = get_project_id()
    vertexai.init(project=PROJECT_ID, location="asia-northeast1")

def get_model() -> GenerativeModel:
    """
    Get the GenerativeModel instance for the Gemini model.
    
    Returns:
        GenerativeModel: The Gemini model instance.
    
    Raises:
        RuntimeError: If the Vertex AI client is not initialized.
    """
    if not vertexai._initialized:
        initialize_vertex_ai()
    return GenerativeModel("gemini-1.5-flash-002")

def generate_story(prompt: str) -> List[Dict[str, str]]:
    """
    Generate a story based on the provided prompt using the Gemini model.
    Args:
        prompt (str): The input prompt for story generation.
    Returns:
        List[Dict[str, str]]: A list of generated story responses.
    """
    model = get_model()

    # コンテンツ生成
    responses = model.generate_content(prompt, stream=True)
    return [response.text for response in responses]

_system_prompt_cache = None

def get_system_prompt() -> str:
    """
    Get the system prompt from the cache or the file.
    
    Returns:
        str: The system prompt.
    """
    project_id = get_project_id()
    client = secretmanager.SecretManagerServiceClient()
    secret_name = f"projects/{project_id}/secrets/system_prompt/versions/latest"
    response = client.access_secret_version(request={"name": secret_name})
    return response.payload.data.decode("UTF-8")

def generate_chat_response(prompt: str) -> str:
    """
    Generate a chat response based on the provided prompt using the Gemini model.
    
    Args:
        prompt (str): The input prompt for chat response generation.
    
    Returns:
        str: The generated chat response.
    """
    model = get_model()

    # チャット応答生成      
    response = model.generate_chat(prompt)
    return response.text