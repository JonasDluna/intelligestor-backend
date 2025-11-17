"""
Service - IA/BuyBox
Análise inteligente de BuyBox e otimização de preços via GPT-4
"""
from typing import List, Dict, Any
from decimal import Decimal
from datetime import datetime, timedelta
from openai import OpenAI
from supabase import Client
from app.config.settings import settings
from app.models.schemas import (
    BuyBoxAnalysisResponse,
    PriceOptimizationResponse
)

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class IAService:
    def __init__(self, supabase_client: Client, user_id: str):
        self.db = supabase_client
        self.user_id = user_id
        self.openai = client
    
    async def analisar_buybox(
        self, 
        anuncio_id: int,
        incluir_historico: bool = True
    ) -> BuyBoxAnalysisResponse:
        """
        Analisa posição no BuyBox com IA
        - Compara preços com concorrentes
        - Avalia histórico de mudanças
        - Gera recomendações inteligentes
        """
        # Busca anúncio
        anuncio = self.db.table("anuncios_ml")\
            .select("*, produtos(*)")\
            .eq("id", anuncio_id)\
            .eq("user_id", self.user_id)\
            .single()\
            .execute()
        
        if not anuncio.data:
            raise ValueError("Anúncio não encontrado")
        
        anuncio_data = anuncio.data
        nosso_preco = Decimal(str(anuncio_data["price"]))
        
        # Busca concorrentes
        concorrentes = self.db.table("concorrentes")\
            .select("*")\
            .eq("anuncio_id", anuncio_id)\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        
        # Encontra campeão do BuyBox
        preco_campeao = nosso_preco
        if concorrentes.data:
            precos = [Decimal(str(c["preco"])) for c in concorrentes.data]
            preco_campeao = min(precos) if precos else nosso_preco
        
        # Busca histórico se solicitado
        historico = []
        if incluir_historico:
            historico = self.db.table("historico_buybox")\
                .select("*")\
                .eq("anuncio_id", anuncio_id)\
                .gte("created_at", (datetime.utcnow() - timedelta(days=7)).isoformat())\
                .order("created_at", desc=True)\
                .execute()
        
        # Monta contexto para IA
        contexto = self._montar_contexto_buybox(
            anuncio_data, 
            nosso_preco,
            preco_campeao,
            concorrentes.data,
            historico.data if incluir_historico else []
        )
        
        # Consulta GPT-4
        recomendacao = await self._consultar_ia_buybox(contexto)
        
        # Calcula diferença
        diferenca_percent = ((nosso_preco - preco_campeao) / preco_campeao * 100) if preco_campeao > 0 else 0
        estamos_no_buybox = nosso_preco <= preco_campeao
        
        # Extrai ações sugeridas da recomendação
        acoes = self._extrair_acoes(recomendacao)
        
        # Salva log
        self.db.table("logs_ia").insert({
            "user_id": self.user_id,
            "tipo": "buybox_analysis",
            "input": contexto,
            "output": recomendacao,
            "tokens_usados": 0  # TODO: capturar do response
        }).execute()
        
        return BuyBoxAnalysisResponse(
            anuncio_id=anuncio_id,
            nosso_preco=nosso_preco,
            preco_campeao=preco_campeao,
            diferenca_percent=diferenca_percent,
            estamos_no_buybox=estamos_no_buybox,
            recomendacao=recomendacao,
            acoes_sugeridas=acoes
        )
    
    def _montar_contexto_buybox(
        self,
        anuncio: Dict,
        nosso_preco: Decimal,
        preco_campeao: Decimal,
        concorrentes: List[Dict],
        historico: List[Dict]
    ) -> str:
        """Monta contexto formatado para IA"""
        ctx = f"""
ANÁLISE DE BUYBOX - MERCADO LIVRE

Produto: {anuncio['title']}
Nosso Preço: R$ {nosso_preco}
Preço Campeão BuyBox: R$ {preco_campeao}
Diferença: {((nosso_preco - preco_campeao) / preco_campeao * 100):.2f}%

CONCORRENTES ({len(concorrentes)}):
"""
        for i, c in enumerate(concorrentes[:5], 1):
            ctx += f"\n{i}. R$ {c['preco']} - Reputação: {c.get('reputacao', 'N/A')}"
        
        if historico:
            ctx += f"\n\nHISTÓRICO (7 dias): {len(historico)} mudanças"
        
        return ctx
    
    async def _consultar_ia_buybox(self, contexto: str) -> str:
        """Consulta GPT-4 para análise de BuyBox"""
        messages = [
            {
                "role": "system",
                "content": """Você é um especialista em estratégia de precificação para Mercado Livre.
Analise a situação do BuyBox e forneça recomendações práticas e objetivas.
Foque em: competitividade, margem, volume de vendas e reputação."""
            },
            {
                "role": "user",
                "content": contexto
            }
        ]
        
        response = self.openai.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
    
    def _extrair_acoes(self, recomendacao: str) -> List[str]:
        """Extrai ações práticas da recomendação da IA"""
        acoes = []
        
        # Busca por padrões comuns
        if "reduzir" in recomendacao.lower() or "diminuir" in recomendacao.lower():
            acoes.append("Reduzir preço")
        if "aumentar" in recomendacao.lower():
            acoes.append("Aumentar preço")
        if "manter" in recomendacao.lower():
            acoes.append("Manter preço atual")
        if "pausar" in recomendacao.lower():
            acoes.append("Considerar pausar anúncio")
        if "estoque" in recomendacao.lower():
            acoes.append("Verificar estoque")
        
        return acoes if acoes else ["Revisar manualmente"]
    
    async def otimizar_preco(
        self,
        anuncio_id: int,
        margem_minima: Decimal = Decimal("20.00")
    ) -> PriceOptimizationResponse:
        """
        Otimiza preço com IA considerando:
        - Custo do produto
        - Margem mínima desejada
        - Preços da concorrência
        - Histórico de vendas
        """
        # Busca anúncio com produto
        anuncio = self.db.table("anuncios_ml")\
            .select("*, produtos(*)")\
            .eq("id", anuncio_id)\
            .eq("user_id", self.user_id)\
            .single()\
            .execute()
        
        if not anuncio.data:
            raise ValueError("Anúncio não encontrado")
        
        produto = anuncio.data.get("produtos")
        if not produto or not produto.get("custo"):
            raise ValueError("Produto sem custo definido")
        
        custo = Decimal(str(produto["custo"]))
        preco_atual = Decimal(str(anuncio.data["price"]))
        preco_minimo = custo * (1 + margem_minima / 100)
        
        # Busca concorrentes
        concorrentes = self.db.table("concorrentes")\
            .select("preco")\
            .eq("anuncio_id", anuncio_id)\
            .execute()
        
        precos_concorrencia = [Decimal(str(c["preco"])) for c in concorrentes.data]
        preco_medio_concorrencia = sum(precos_concorrencia) / len(precos_concorrencia) if precos_concorrencia else preco_atual
        
        # IA sugere preço otimizado
        contexto = f"""
Otimize o preço deste produto:
- Custo: R$ {custo}
- Preço Atual: R$ {preco_atual}
- Preço Mínimo (margem {margem_minima}%): R$ {preco_minimo}
- Preço Médio Concorrência: R$ {preco_medio_concorrencia}

Sugira um preço competitivo que maximize vendas mantendo margem saudável.
"""
        
        messages = [
            {"role": "system", "content": "Você é um especialista em precificação estratégica."},
            {"role": "user", "content": contexto}
        ]
        
        response = self.openai.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.5
        )
        
        recomendacao_ia = response.choices[0].message.content
        
        # Extrai preço sugerido (procura por valores R$)
        import re
        match = re.search(r'R\$\s*([\d,]+\.?\d*)', recomendacao_ia)
        preco_recomendado = preco_atual
        
        if match:
            preco_str = match.group(1).replace(',', '')
            preco_recomendado = Decimal(preco_str)
            
            # Valida margem mínima
            if preco_recomendado < preco_minimo:
                preco_recomendado = preco_minimo
        
        # Calcula impacto
        diferenca = preco_recomendado - preco_atual
        impacto = "neutro"
        if diferenca > 0:
            impacto = f"Aumento de {((diferenca / preco_atual) * 100):.1f}% - Pode reduzir volume mas aumenta margem"
        elif diferenca < 0:
            impacto = f"Redução de {((abs(diferenca) / preco_atual) * 100):.1f}% - Pode aumentar volume e competitividade"
        
        return PriceOptimizationResponse(
            preco_atual=preco_atual,
            preco_recomendado=preco_recomendado,
            motivo=recomendacao_ia,
            impacto_estimado=impacto
        )


# Função legacy para compatibilidade
def chamar_ia(messages: list, model: str | None = None) -> str:
    """Função legacy - mantida para compatibilidade com código existente"""
    modelo = model or settings.OPENAI_MODEL
    response = client.chat.completions.create(
        model=modelo,
        messages=messages,
    )
    return response.choices[0].message.content
