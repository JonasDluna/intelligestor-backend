def prompt_diagnostico_buybox(dados: dict) -> str:
    return f"""Você é um especialista em Mercado Livre e BuyBox.
Analise os dados abaixo e gere um diagnóstico completo com recomendações em português do Brasil.

Dados do produto e contexto:
{dados}

Responda com:
1) Diagnóstico geral
2) Principais problemas
3) Sugestão de preço ou estratégia
4) Ações de curto prazo
5) Ações de médio prazo
"""


def prompt_descricao_produto(dados: dict) -> str:
    return f"""Você é um copywriter especializado em Mercado Livre.
Gere uma descrição de produto persuasiva, clara e objetiva em português do Brasil.

Dados do produto:
{dados}

Formate a resposta com:
- Título
- Bullet points com benefícios
- Texto corrido
- Chamada final para ação
"""


def prompt_titulo_produto(dados: dict) -> str:
    return f"""Crie 5 variações de títulos otimizados para Mercado Livre.

Dados:
{dados}

Regras:
- Máximo ~60 caracteres quando possível
- Comece com a marca, depois o tipo de produto e o diferencial
- Evite palavras proibidas pelo ML
Retorne apenas os títulos, numerados.
"""
