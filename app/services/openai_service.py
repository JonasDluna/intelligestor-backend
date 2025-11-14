"""
OpenAI GPT Service
Handles all interactions with OpenAI GPT API
"""
from openai import AsyncOpenAI
from typing import Optional, List, Dict, Any
from app.utils.config import settings


class OpenAIService:
    """Service for interacting with OpenAI GPT API"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key must be configured")
        
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
    
    async def generate_completion(
        self,
        prompt: str,
        system_message: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate a text completion using GPT
        
        Args:
            prompt: User prompt
            system_message: Optional system message to set context
            temperature: Optional temperature override
            max_tokens: Optional max tokens override
            
        Returns:
            Generated text
        """
        messages = []
        
        if system_message:
            messages.append({"role": "system", "content": system_message})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature or self.temperature,
                max_tokens=max_tokens or self.max_tokens
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"Error generating completion: {str(e)}")
    
    async def analyze_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a product using AI
        
        Args:
            product_data: Product information
            
        Returns:
            AI analysis results
        """
        prompt = f"""
        Analyze the following product and provide insights:
        
        Title: {product_data.get('title', 'N/A')}
        Price: {product_data.get('price', 'N/A')}
        Description: {product_data.get('description', 'N/A')}
        Category: {product_data.get('category', 'N/A')}
        
        Provide:
        1. Product quality assessment
        2. Price competitiveness
        3. Target audience
        4. Improvement suggestions
        5. Marketing recommendations
        """
        
        system_message = "You are an expert e-commerce analyst specializing in product evaluation and market analysis."
        
        analysis = await self.generate_completion(prompt, system_message)
        
        return {
            "product_id": product_data.get("id"),
            "analysis": analysis,
            "model_used": self.model
        }
    
    async def generate_product_description(
        self,
        product_name: str,
        features: List[str],
        target_audience: Optional[str] = None
    ) -> str:
        """
        Generate an optimized product description
        
        Args:
            product_name: Name of the product
            features: List of product features
            target_audience: Optional target audience description
            
        Returns:
            Generated product description
        """
        features_text = "\n".join([f"- {feature}" for feature in features])
        
        prompt = f"""
        Create an engaging and SEO-optimized product description for:
        
        Product: {product_name}
        Features:
        {features_text}
        {f'Target Audience: {target_audience}' if target_audience else ''}
        
        The description should be persuasive, highlight key benefits, and include relevant keywords.
        """
        
        system_message = "You are an expert copywriter specializing in e-commerce product descriptions."
        
        return await self.generate_completion(prompt, system_message)
    
    async def suggest_keywords(self, product_title: str, category: str) -> List[str]:
        """
        Suggest relevant keywords for a product
        
        Args:
            product_title: Product title
            category: Product category
            
        Returns:
            List of suggested keywords
        """
        prompt = f"""
        Suggest 10 relevant SEO keywords for the following product:
        
        Title: {product_title}
        Category: {category}
        
        Return only the keywords, one per line.
        """
        
        system_message = "You are an SEO expert specializing in e-commerce keyword research."
        
        response = await self.generate_completion(prompt, system_message)
        keywords = [keyword.strip() for keyword in response.split("\n") if keyword.strip()]
        
        return keywords


# Singleton instance
openai_service = OpenAIService() if settings.OPENAI_API_KEY else None
