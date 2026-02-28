from fastapi import APIRouter, Path, HTTPException, Depends
from utils.dependencies import get_current_user
from services.analytics_service import get_emotion_distribution_by_survey

router = APIRouter()

@router.get("/analytics/{survey_id}")
async def emotion_analytics(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)  # 🔒 protected
):
    try:
        result = get_emotion_distribution_by_survey(survey_id)

        if result is None:
            raise HTTPException(status_code=404, detail="Survey not found")

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")