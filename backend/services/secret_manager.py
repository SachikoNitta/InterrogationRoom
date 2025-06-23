import os
from google.cloud import secretmanager

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", 'interrogation-room')

def getsecret(secret_name: str) -> str:
    """指定されたシークレット名のシークレットをGoogle Cloud Secret Managerから取得する"""
    client = secretmanager.SecretManagerServiceClient()
    secret_name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
    response = client.access_secret_version(request={"name": secret_name})
    if not response.payload.data:
        raise ValueError(f"Secret '{secret_name}' not found in environment variables.")
    return response.payload.data.decode("UTF-8")