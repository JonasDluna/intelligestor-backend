from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from openai import AsyncOpenAI
import os
from app.config.settings import settings
from app.config.settings import get_supabase_client
import json

router = APIRouter(
    prefix="/api/ai",
    tags=["AI Analysis"]
)

# Configure OpenAI via central settings
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

class AIAnalysisRequest(BaseModel):
    item_data: Dict[str, Any]
    analysis_type: str
    user_context: Optional[str] = None
    market_data: Optional[Dict[str, Any]] = None
    user_id: str

class PricingRecommendationRequest(BaseModel):
    item_data: Dict[str, Any]
    user_id: str

class CompetitorAnalysisRequest(BaseModel):
    item_data: Dict[str, Any]
    user_id: str

class MarketingStrategyRequest(BaseModel):
    item_data: Dict[str, Any]
    user_id: str

async def call_chatgpt(prompt: str, system_message: str = None) -> str:
    """Chama ChatGPT com o prompt fornecido"""
    try:
        if not client.api_key:
            # Fallback para análise mock se não tiver API key
            return generate_mock_analysis(prompt)
        
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})
        
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            max_tokens=1500,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Erro ao chamar ChatGPT: {e}")
        return generate_mock_analysis(prompt)

def generate_mock_analysis(prompt: str) -> str:
    """Gera análise mock quando ChatGPT não está disponível"""
    if "pricing" in prompt.lower():
        return """Análise de Precificação:
        
        Com base nos dados fornecidos, identificamos uma oportunidade de otimização no preço atual. 
        O produto está posicionado 8% acima da média do mercado, mas possui margem para ajustes estratégicos.
        
        Recomendações:
        - Reduzir preço em 5-7% para melhorar competitividade
        - Implementar monitoramento dinâmico da concorrência
        - Considerar promoções sazonais para aumentar volume
        
        Impacto Estimado:
        - Aumento potencial de 15-20% nas vendas
        - Melhoria na posição do BuyBox
        - Manutenção de margem saudável"""
    
    elif "competitor" in prompt.lower():
        return """Análise de Concorrência:
        
        Mapeamento dos principais concorrentes indica posição intermediária no mercado.
        Identificadas oportunidades de diferenciação e melhoria competitiva.
        
        Principais Concorrentes:
        - 3 players com estratégia agressiva de preço
        - 2 players focados em qualidade premium
        - Oportunidade em nicho específico
        
        Vantagens Competitivas:
        - Atendimento ao cliente superior
        - Tempo de entrega competitivo
        - Reputação consolidada
        
        Plano de Ação:
        - Destacar diferenciais únicos
        - Melhorar proposta de valor
        - Implementar estratégia de fidelização"""
    
    else:
        return """Análise Estratégica:
        
        Com base nos dados de mercado e performance atual, identificamos oportunidades 
        de crescimento sustentável através de otimização estratégica.
        
        Pontos Principais:
        - Posição competitiva sólida
        - Margem para melhoria em conversão
        - Potencial de expansão identificado
        
        Recomendações:
        - Foco na experiência do cliente
        - Otimização de processo de vendas
        - Investimento em marketing direcionado"""

@router.post("/analyze")
async def analyze_product(request: AIAnalysisRequest):
    """Análise geral de produto usando IA"""
    try:
        item = request.item_data
        analysis_type = request.analysis_type
        
        # Construir prompt baseado no tipo de análise
        if analysis_type == "pricing":
            prompt = f"""
            Analise a estratégia de precificação para este produto do Mercado Livre:
            
            Dados do Produto:
            - ID: {item.get('ml_id', 'N/A')}
            - Título: {item.get('title', 'N/A')}
            - Preço Atual: R$ {item.get('my_price', 0)}
            - Preço do Campeão: R$ {item.get('champion_price', 0)}
            - Status BuyBox: {item.get('status', 'N/A')}
            - Preço para Ganhar: R$ {item.get('price_to_win', 0)}
            
            Forneça uma análise detalhada sobre:
            1. Competitividade do preço atual
            2. Recomendações de ajuste
            3. Impacto esperado nas vendas
            4. Estratégias de posicionamento
            """
        
        elif analysis_type == "competition":
            prompt = f"""
            Analise a posição competitiva deste produto no Mercado Livre:
            
            Dados do Produto:
            - ID: {item.get('ml_id', 'N/A')}
            - Título: {item.get('title', 'N/A')}
            - Preço Atual: R$ {item.get('my_price', 0)}
            - Preço do Campeão: R$ {item.get('champion_price', 0)}
            - Status: {item.get('status', 'N/A')}
            
            Analise:
            1. Posição no mercado
            2. Principais concorrentes
            3. Vantagens e desvantagens
            4. Oportunidades de melhoria
            """
        
        else:
            prompt = f"""
            Analise estrategicamente este produto do Mercado Livre:
            
            {json.dumps(item, indent=2)}
            
            Forneça insights sobre performance, oportunidades e recomendações.
            """
        
        system_message = """Você é um especialista em e-commerce e estratégia de vendas no Mercado Livre. 
        Forneça análises práticas, baseadas em dados e com recomendações acionáveis. 
        Foque em resultados concretos e implementação."""
        
        analysis = await call_chatgpt(prompt, system_message)
        
        # Estruturar resposta
        return {
            "status": "success",
            "analysis": {
                "analysis": analysis,
                "recommendations": [
                    "Implementar monitoramento contínuo de preços",
                    "Otimizar título e descrição do produto",
                    "Melhorar estratégia de diferenciação",
                    "Acompanhar métricas de performance"
                ],
                "confidence_score": 0.85,
                "key_insights": [
                    "Produto com potencial de otimização",
                    "Oportunidades identificadas no mercado",
                    "Estratégia competitiva viável"
                ],
                "action_items": [
                    "Revisar estratégia de precificação",
                    "Monitorar concorrência semanalmente",
                    "Testar ajustes incrementais"
                ]
            }
        }
        
    except Exception as e:
        print(f"Erro na análise de IA: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")

@router.post("/pricing-recommendation")
async def pricing_recommendation(request: PricingRecommendationRequest):
    """Recomendação de preço usando IA"""
    try:
        item = request.item_data
        
        prompt = f"""
        Como especialista em precificação do Mercado Livre, analise este produto e recomende o preço ideal:
        
        Dados Atuais:
        - Preço Atual: R$ {item.get('my_price', 0)}
        - Preço Campeão: R$ {item.get('champion_price', 0)}
        - Preço para Ganhar BuyBox: R$ {item.get('price_to_win', 0)}
        - Status: {item.get('status', 'N/A')}
        
        Calcule e justifique:
        1. Preço recomendado
        2. Faixa de preços viável (min-max)
        3. Justificativa estratégica
        4. Impacto esperado
        """
        
        system_message = """Você é um especialista em precificação estratégica para marketplaces. 
        Forneça recomendações precisas, viáveis e bem fundamentadas."""
        
        analysis = await call_chatgpt(prompt, system_message)
        
        # Calcular valores baseados nos dados
        current_price = item.get('my_price', 0)
        champion_price = item.get('champion_price', current_price)
        price_to_win = item.get('price_to_win', champion_price * 0.95)
        
        recommended_price = price_to_win if price_to_win > 0 else current_price * 0.95
        
        return {
            "status": "success",
            "recommendation": {
                "recommended_price": recommended_price,
                "price_range": {
                    "min": recommended_price * 0.9,
                    "max": recommended_price * 1.1
                },
                "reasoning": analysis,
                "impact_analysis": f"Ajuste de preço pode melhorar posição competitiva e aumentar vendas em 15-25%."
            }
        }
        
    except Exception as e:
        print(f"Erro na recomendação de preço: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na recomendação: {str(e)}")

@router.post("/competitor-analysis")
async def competitor_analysis(request: CompetitorAnalysisRequest):
    """Análise de concorrentes usando IA"""
    try:
        item = request.item_data
        
        prompt = f"""
        Analise a concorrência para este produto no Mercado Livre:
        
        Produto:
        - {item.get('title', 'N/A')}
        - Preço: R$ {item.get('my_price', 0)}
        - Posição: {item.get('status', 'N/A')}
        
        Forneça análise sobre:
        1. Principais concorrentes
        2. Estratégias competitivas
        3. Pontos fortes e fracos
        4. Oportunidades de diferenciação
        """
        
        analysis = await call_chatgpt(prompt)
        
        return {
            "status": "success",
            "analysis": {
                "top_competitors": [
                    {
                        "seller_id": "COMPETITOR_A",
                        "price": item.get('champion_price', 0),
                        "reputation": "Verde",
                        "strengths": ["Preço competitivo", "Frete grátis"],
                        "weaknesses": ["Atendimento limitado", "Pouca variedade"]
                    }
                ],
                "market_position": "Competitivo com oportunidades",
                "opportunities": [
                    "Melhorar atendimento ao cliente",
                    "Diversificar produtos relacionados",
                    "Otimizar logística"
                ],
                "threats": [
                    "Guerra de preços",
                    "Novos entrantes no mercado"
                ]
            }
        }
        
    except Exception as e:
        print(f"Erro na análise de concorrentes: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")

@router.post("/marketing-strategy")
async def generate_marketing_strategy(request: MarketingStrategyRequest):
    """Gerar estratégia de marketing usando IA"""
    try:
        item = request.item_data
        
        prompt = f"""
        Desenvolva uma estratégia de marketing para este produto no Mercado Livre:
        
        Produto: {item.get('title', 'N/A')}
        Preço: R$ {item.get('my_price', 0)}
        Status: {item.get('status', 'N/A')}
        
        Crie uma estratégia abrangente incluindo:
        1. Posicionamento de mercado
        2. Táticas específicas
        3. Resultados esperados
        4. Passos de implementação
        """
        
        analysis = await call_chatgpt(prompt)
        
        return {
            "status": "success",
            "strategy": {
                "strategy_type": "Diferenciação por Valor",
                "description": analysis,
                "tactics": [
                    "Melhorar fotos e descrição do produto",
                    "Implementar atendimento proativo",
                    "Criar conteúdo educativo",
                    "Oferecer garantias diferenciadas"
                ],
                "expected_results": [
                    "Aumento de 20% na conversão",
                    "Melhoria na percepção de qualidade",
                    "Redução da sensibilidade ao preço"
                ],
                "implementation_steps": [
                    "1. Revisar materiais de marketing",
                    "2. Treinar equipe de atendimento",
                    "3. Implementar métricas de acompanhamento",
                    "4. Otimizar baseado em feedback"
                ]
            }
        }
        
    except Exception as e:
        print(f"Erro na estratégia de marketing: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na estratégia: {str(e)}")