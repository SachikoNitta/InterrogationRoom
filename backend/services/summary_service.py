from fastapi.responses import StreamingResponse
import services.prompt_service as prompt_service
import services.gemini_client as gemini_client
import services.keyword_manager as keyword_manager
import models.summary_model as summary_model
import repository.summary_repository as summary_repository
import json
import utils.text_utils as text_utils

def generate_summary() -> summary_model.Summary:
    try:
        # Generate a summary using the Gemini model
        model = gemini_client.get_model("gemini-1.5-pro-002")
        keywords = keyword_manager.get_random_keywords(3)
        prompt_template = prompt_service.get_prompt("summary_prompt.txt")
        prompt = prompt_template + "\nキーワード: " + ', '.join([keyword.word for keyword in keywords])
        part = gemini_client.get_part_from_text(prompt)
        content = gemini_client.get_content_from_role_parts('model', [part])
        summary_json = gemini_client.generate_response(
            model,
            contents=[content]
        )
        extracted_json = text_utils.extract_json_block(summary_json)
        print(f"Extracted JSON block: {extracted_json}")
        if not extracted_json:
            raise RuntimeError("No JSON block found in the summary response")

        summary_dict = json.loads(extracted_json)
        print(f"Extracted summary JSON: {summary_dict}")
  
        if not summary_dict or 'summaryName' not in summary_dict:
            raise RuntimeError("Invalid summary response format: 'summaryName' not found")
        
        # Save the summary to the repository
        summary = summary_model.Summary(**summary_dict)
        summary_repository.create(summary)

    except Exception as e:
        raise RuntimeError(f"Unexpected error in services.generate_case_summary: {e}")
    
    return summary

