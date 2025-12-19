from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalysisRequest, SentenceAnalysis
from app.services.nlp import nlp_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze", response_model=SentenceAnalysis)
async def analyze_sentence(request: AnalysisRequest):
    """
    Analyze a sentence using Stanza with language-specific strategies.
    """
    try:
        analysis = nlp_service.analyze_text(request.text, request.language)
        return analysis
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error during analysis")




