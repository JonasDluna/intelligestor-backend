"""
OpenAI GPT Router
Handles AI-powered endpoints
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.openai import CompletionRequest, CompletionResponse
from app.models.product import ProductDescriptionRequest, KeywordSuggestionRequest
from app.services.openai_service import openai_service

router = APIRouter()


@router.post("/completion", response_model=CompletionResponse)
async def generate_completion(request: CompletionRequest):
    """
    Generate a text completion using GPT
    """
    if not openai_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI service not configured"
        )
    
    try:
        text = await openai_service.generate_completion(
            prompt=request.prompt,
            system_message=request.system_message,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        return CompletionResponse(
            text=text,
            model_used=openai_service.model
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/analyze-product")
async def analyze_product(product_data: dict):
    """
    Analyze a product using AI
    """
    if not openai_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI service not configured"
        )
    
    try:
        analysis = await openai_service.analyze_product(product_data)
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/generate-description")
async def generate_description(request: ProductDescriptionRequest):
    """
    Generate an optimized product description
    """
    if not openai_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI service not configured"
        )
    
    try:
        description = await openai_service.generate_product_description(
            product_name=request.product_name,
            features=request.features,
            target_audience=request.target_audience
        )
        return {
            "description": description,
            "model_used": openai_service.model
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/suggest-keywords", response_model=List[str])
async def suggest_keywords(request: KeywordSuggestionRequest):
    """
    Suggest relevant keywords for a product
    """
    if not openai_service:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI service not configured"
        )
    
    try:
        keywords = await openai_service.suggest_keywords(
            product_title=request.product_title,
            category=request.category
        )
        return keywords
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
