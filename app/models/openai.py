"""
OpenAI Data Models
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class CompletionRequest(BaseModel):
    """Request model for text completion"""
    prompt: str = Field(..., description="User prompt")
    system_message: Optional[str] = Field(None, description="System message for context")
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0, description="Temperature for randomness")
    max_tokens: Optional[int] = Field(None, ge=1, description="Maximum tokens to generate")


class CompletionResponse(BaseModel):
    """Response model for text completion"""
    model_config = ConfigDict(protected_namespaces=())
    
    text: str
    model_used: str
