from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel, Field

from services.response_service import process_response, get_responses_by_survey
from utils.sanitizer import sanitize_text
from utils.dependencies import get_current_user

router = APIRouter()


class ResponsePayload(BaseModel):
    question_id: int = Field(..., gt=0)
    text: str = Field(..., min_length=1, max_length=1000)


@router.post("/submit-response")
async def submit_response(
    payload: ResponsePayload,
    current_user: dict = Depends(get_current_user)
):
    try:
        clean_text = sanitize_text(payload.text)

        if not clean_text:
            raise HTTPException(status_code=422, detail="Text is empty after sanitization")

        result = process_response(
            payload.question_id,
            clean_text,
            current_user["email"]
        )

        if result is None:
            raise HTTPException(status_code=404, detail="Question not found")

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to process response")


@router.get("/responses/{survey_id}")
async def get_responses_endpoint(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = get_responses_by_survey(survey_id, current_user["id"])

        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return {"survey_id": survey_id, "responses": result}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve responses")