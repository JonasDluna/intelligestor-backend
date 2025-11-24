"""
Script de Teste Completo - API de Catálogo do Mercado Livre
Testa todos os endpoints com tokens reais do ML
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, List

# ===========================
# CONFIGURAÇÃO
# ===========================

BASE_URL = "http://localhost:8000"

# CONFIGURE AQUI SEUS TOKENS REAIS DO ML
ML_ACCESS_TOKEN = "APP_USR-SEU_TOKEN_AQUI"  # Token de produção
USER_ID = "123456789"  # Seu User ID do ML
SITE_ID = "MLB"  # MLB, MLA, MLM, etc.

# Item IDs para teste (substitua pelos seus)
TEST_ITEM_ID = "MLB1234567890"  # Item tradicional seu
TEST_CATALOG_PRODUCT_ID = "MLB18500844"  # ID de produto de catálogo

# ===========================
# CORES PARA OUTPUT
# ===========================

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

# ===========================
# FUNÇÕES AUXILIARES
# ===========================

def print_header(title: str):
    """Imprime cabeçalho formatado"""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'=' * 80}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{title.center(80)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'=' * 80}{Colors.END}\n")

def print_success(message: str):
    """Imprime mensagem de sucesso"""
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message: str):
    """Imprime mensagem de erro"""
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_warning(message: str):
    """Imprime mensagem de aviso"""
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

def print_info(message: str):
    """Imprime mensagem informativa"""
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def test_endpoint(
    name: str,
    method: str,
    url: str,
    expected_status: int = 200,
    params: Dict = None,
    data: Dict = None,
    headers: Dict = None
) -> Dict[str, Any]:
    """Testa um endpoint e retorna resultado"""
    
    print(f"\n{Colors.BOLD}Testando: {name}{Colors.END}")
    print(f"Método: {method} | URL: {url}")
    
    try:
        # Fazer requisição
        if method == "GET":
            response = requests.get(url, params=params, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, json=data, params=params, headers=headers, timeout=30)
        elif method == "PUT":
            response = requests.put(url, json=data, params=params, headers=headers, timeout=30)
        else:
            print_error(f"Método HTTP não suportado: {method}")
            return {"success": False}
        
        # Verificar status
        if response.status_code == expected_status:
            print_success(f"Status: {response.status_code} ✓")
        else:
            print_warning(f"Status: {response.status_code} (esperado: {expected_status})")
        
        # Parse JSON
        try:
            response_data = response.json()
            print_info(f"Resposta recebida: {len(json.dumps(response_data))} caracteres")
            
            # Mostrar preview dos dados
            if isinstance(response_data, dict):
                print(f"\nPreview da Resposta:")
                for key, value in list(response_data.items())[:5]:
                    if isinstance(value, (dict, list)):
                        print(f"  • {key}: {type(value).__name__} com {len(value)} itens")
                    else:
                        print(f"  • {key}: {value}")
            
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response_data
            }
            
        except json.JSONDecodeError:
            print_warning("Resposta não é JSON")
            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.text
            }
    
    except requests.exceptions.Timeout:
        print_error("Timeout na requisição (30s)")
        return {"success": False, "error": "timeout"}
    
    except requests.exceptions.ConnectionError:
        print_error("Erro de conexão - verifique se o backend está rodando")
        return {"success": False, "error": "connection_error"}
    
    except Exception as e:
        print_error(f"Erro inesperado: {str(e)}")
        return {"success": False, "error": str(e)}

# ===========================
# TESTES - ELEGIBILIDADE
# ===========================

def test_eligibility():
    """Testa endpoints de elegibilidade"""
    print_header("TESTES DE ELEGIBILIDADE")
    
    results = []
    
    # 1. Verificar elegibilidade de um item
    result = test_endpoint(
        name="Verificar Elegibilidade de Um Item",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/eligibility/{TEST_ITEM_ID}",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 2. Verificar elegibilidade múltipla
    result = test_endpoint(
        name="Verificar Elegibilidade Múltipla (Multiget)",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/eligibility/multiget",
        params={"item_ids": f"{TEST_ITEM_ID},MLB123,MLB456"},
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 3. Listar itens de catálogo do vendedor
    result = test_endpoint(
        name="Listar Itens de Catálogo do Vendedor",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/seller/{USER_ID}/items",
        params={"catalog_listing": "true", "status": "active"},
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    return results

# ===========================
# TESTES - BUSCA DE PRODUTOS
# ===========================

def test_product_search():
    """Testa endpoints de busca de produtos"""
    print_header("TESTES DE BUSCA DE PRODUTOS")
    
    results = []
    
    # 1. Buscar produtos por palavras-chave
    result = test_endpoint(
        name="Buscar Produtos por Palavras-Chave",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/products/search",
        params={
            "site_id": SITE_ID,
            "q": "iPhone 13",
            "status": "active",
            "limit": 5
        }
    )
    results.append(result)
    
    # 2. Buscar por código de barras
    result = test_endpoint(
        name="Buscar por Código de Barras (GTIN)",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/products/search",
        params={
            "site_id": SITE_ID,
            "product_identifier": "7891234567890"
        }
    )
    results.append(result)
    
    # 3. Buscar por domínio
    result = test_endpoint(
        name="Buscar por Domínio",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/products/search",
        params={
            "site_id": SITE_ID,
            "domain_id": f"{SITE_ID}-CELLPHONES",
            "listing_strategy": "catalog_required",
            "limit": 5
        }
    )
    results.append(result)
    
    # 4. Detalhes de um produto
    result = test_endpoint(
        name="Detalhes de um Produto de Catálogo",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/products/{TEST_CATALOG_PRODUCT_ID}"
    )
    results.append(result)
    
    return results

# ===========================
# TESTES - PUBLICAÇÃO
# ===========================

def test_catalog_publishing():
    """Testa endpoints de publicação no catálogo"""
    print_header("TESTES DE PUBLICAÇÃO NO CATÁLOGO")
    
    print_warning("Testes de publicação desabilitados por padrão (evitar criar itens reais)")
    print_info("Para testar publicação, descomente o código abaixo e configure os dados")
    
    results = []
    
    # Exemplo de estrutura para criação direta (DESABILITADO)
    """
    result = test_endpoint(
        name="Criar Publicação Direta no Catálogo",
        method="POST",
        url=f"{BASE_URL}/ml/catalog/items/create",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"},
        data={
            "site_id": SITE_ID,
            "title": "Apple iPhone 13 128GB Preto",
            "category_id": "MLB1051",
            "price": 3500.00,
            "currency_id": "BRL",
            "available_quantity": 5,
            "buying_mode": "buy_it_now",
            "listing_type_id": "gold_special",
            "catalog_product_id": TEST_CATALOG_PRODUCT_ID,
            "catalog_listing": True,
            "condition": "new"
        }
    )
    results.append(result)
    """
    
    # Exemplo de optin (DESABILITADO)
    """
    result = test_endpoint(
        name="Fazer Optin de Item Tradicional",
        method="POST",
        url=f"{BASE_URL}/ml/catalog/items/optin",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"},
        data={
            "item_id": TEST_ITEM_ID,
            "catalog_product_id": TEST_CATALOG_PRODUCT_ID
        }
    )
    results.append(result)
    """
    
    return results

# ===========================
# TESTES - COMPETIÇÃO
# ===========================

def test_competition():
    """Testa endpoints de competição e Buy Box"""
    print_header("TESTES DE COMPETIÇÃO E BUY BOX")
    
    results = []
    
    # 1. Análise completa do Buy Box
    result = test_endpoint(
        name="Análise Completa do Buy Box",
        method="GET",
        url=f"{BASE_URL}/ml/buybox/analysis/{TEST_ITEM_ID}",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 2. Detalhes da competição no produto
    if results[0].get("success"):
        data = results[0].get("data", {})
        product_id = data.get("product_id") or TEST_CATALOG_PRODUCT_ID
        
        result = test_endpoint(
            name="Detalhes da Competição no Produto",
            method="GET",
            url=f"{BASE_URL}/ml/products/{product_id}/competition",
            headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
        )
        results.append(result)
    
    # 3. Listar competidores
    result = test_endpoint(
        name="Listar Competidores da PDP",
        method="GET",
        url=f"{BASE_URL}/ml/products/{TEST_CATALOG_PRODUCT_ID}/items",
        params={"limit": 10}
    )
    results.append(result)
    
    return results

# ===========================
# TESTES - BRAND CENTRAL
# ===========================

def test_brand_central():
    """Testa endpoints do Brand Central"""
    print_header("TESTES DE BRAND CENTRAL")
    
    results = []
    
    # 1. Verificar quota disponível
    result = test_endpoint(
        name="Verificar Quota de Sugestões",
        method="GET",
        url=f"{BASE_URL}/ml/brand-central/users/{USER_ID}/quota",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 2. Listar domínios disponíveis
    result = test_endpoint(
        name="Listar Domínios Disponíveis",
        method="GET",
        url=f"{BASE_URL}/ml/brand-central/domains/{SITE_ID}/available",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 3. Ficha técnica de um domínio
    result = test_endpoint(
        name="Obter Ficha Técnica do Domínio",
        method="GET",
        url=f"{BASE_URL}/ml/brand-central/domains/{SITE_ID}-CELLPHONES/technical-specs",
        params={"spec_type": "input"},
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 4. Listar sugestões do usuário
    result = test_endpoint(
        name="Listar Sugestões do Usuário",
        method="GET",
        url=f"{BASE_URL}/ml/brand-central/users/{USER_ID}/suggestions",
        params={"limit": 10},
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 5. Validar sugestão (exemplo)
    print_warning("Teste de validação desabilitado por padrão")
    """
    result = test_endpoint(
        name="Validar Sugestão de Produto",
        method="POST",
        url=f"{BASE_URL}/ml/brand-central/suggestions/validate",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"},
        data={
            "title": "Samsung Galaxy S21 128GB Preto",
            "domain_id": f"{SITE_ID}-CELLPHONES",
            "pictures": [{"id": "647954-MLA46144073729_052021"}],
            "attributes": [
                {"id": "BRAND", "values": [{"name": "Samsung"}]},
                {"id": "MODEL", "values": [{"name": "Galaxy S21"}]},
                {"id": "INTERNAL_MEMORY", "values": [{"name": "128 GB"}]}
            ]
        }
    )
    results.append(result)
    """
    
    return results

# ===========================
# TESTES - SINCRONIZAÇÃO
# ===========================

def test_synchronization():
    """Testa endpoints de sincronização"""
    print_header("TESTES DE SINCRONIZAÇÃO")
    
    results = []
    
    # 1. Verificar status de sincronização
    result = test_endpoint(
        name="Verificar Status de Sincronização",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/sync/{TEST_ITEM_ID}/status",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    # 2. Consultar data limite (forewarning)
    result = test_endpoint(
        name="Consultar Data Limite (Forewarning)",
        method="GET",
        url=f"{BASE_URL}/ml/catalog/forewarning/{TEST_ITEM_ID}/date",
        headers={"Authorization": f"Bearer {ML_ACCESS_TOKEN}"}
    )
    results.append(result)
    
    return results

# ===========================
# RELATÓRIO FINAL
# ===========================

def generate_report(all_results: List[List[Dict]]):
    """Gera relatório final dos testes"""
    print_header("RELATÓRIO FINAL DOS TESTES")
    
    total_tests = sum(len(results) for results in all_results)
    successful_tests = sum(
        len([r for r in results if r.get("success")])
        for results in all_results
    )
    
    success_rate = (successful_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n{Colors.BOLD}Resumo:{Colors.END}")
    print(f"  • Total de testes: {total_tests}")
    print(f"  • Testes bem-sucedidos: {successful_tests}")
    print(f"  • Testes falhados: {total_tests - successful_tests}")
    print(f"  • Taxa de sucesso: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print_success(f"\n✓ Sistema funcionando corretamente! ({success_rate:.1f}%)")
    elif success_rate >= 50:
        print_warning(f"\n⚠ Sistema parcialmente funcional ({success_rate:.1f}%)")
    else:
        print_error(f"\n✗ Sistema com problemas críticos ({success_rate:.1f}%)")
    
    # Salvar relatório em JSON
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"test_catalog_report_{timestamp}.json"
    
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": timestamp,
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "success_rate": success_rate,
            "results": all_results
        }, f, indent=2, ensure_ascii=False)
    
    print_info(f"\nRelatório completo salvo em: {report_file}")

# ===========================
# MAIN
# ===========================

def main():
    """Função principal"""
    print_header("TESTE COMPLETO - API DE CATÁLOGO DO MERCADO LIVRE")
    
    print(f"{Colors.BOLD}Configuração:{Colors.END}")
    print(f"  • Base URL: {BASE_URL}")
    print(f"  • User ID: {USER_ID}")
    print(f"  • Site ID: {SITE_ID}")
    print(f"  • Token configurado: {'✓' if ML_ACCESS_TOKEN != 'APP_USR-SEU_TOKEN_AQUI' else '✗'}")
    
    if ML_ACCESS_TOKEN == "APP_USR-SEU_TOKEN_AQUI":
        print_error("\n✗ ERRO: Configure seu token do ML na variável ML_ACCESS_TOKEN")
        print_info("Edite o arquivo e substitua 'APP_USR-SEU_TOKEN_AQUI' pelo seu token real")
        sys.exit(1)
    
    input(f"\n{Colors.YELLOW}Pressione ENTER para iniciar os testes...{Colors.END}")
    
    # Executar todos os testes
    all_results = []
    
    all_results.append(test_eligibility())
    all_results.append(test_product_search())
    all_results.append(test_catalog_publishing())
    all_results.append(test_competition())
    all_results.append(test_brand_central())
    all_results.append(test_synchronization())
    
    # Gerar relatório final
    generate_report(all_results)

if __name__ == "__main__":
    main()
