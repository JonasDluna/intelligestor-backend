"""
Teste completo de integração oficial ML - Frontend e Backend
Valida funcionamento end-to-end com dados reais do Mercado Livre
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path

# Importar serviços do backend
import sys
sys.path.append(str(Path(__file__).parent))

from app.services.ml_official_api import MLOfficialAPI
from app.routers.ml_real import router

# Item de teste - Martelo de Borracha
TEST_ITEM_ID = "MLB4237624393"
TEST_PRODUCT_ID = "MLB1055"

class IntegrationTester:
    """
    Testa integração completa oficial ML
    """
    
    def __init__(self):
        self.ml_api = MLOfficialAPI()
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'test_item': TEST_ITEM_ID,
            'test_product': TEST_PRODUCT_ID,
            'tests': {}
        }

    def test_backend_apis(self):
        """Testa todas as APIs do backend"""
        print("🔧 Testando APIs do Backend...")
        
        # 1. Teste price_to_win
        print("  📊 Testando price_to_win...")
        try:
            price_analysis = self.ml_api.get_item_price_to_win(TEST_ITEM_ID)
            self.results['tests']['price_to_win'] = {
                'status': 'SUCCESS',
                'data': {
                    'current_status': price_analysis.get('buybox_status', {}).get('current_status'),
                    'price_to_win': price_analysis.get('pricing_analysis', {}).get('price_to_win'),
                    'price_gap': price_analysis.get('pricing_analysis', {}).get('price_gap'),
                    'boosts_active': len(price_analysis.get('competitive_advantages', {}).get('active_boosts', [])),
                    'boosts_opportunities': len(price_analysis.get('competitive_advantages', {}).get('available_opportunities', []))
                }
            }
            print(f"    ✅ Status: {price_analysis.get('buybox_status', {}).get('current_status')}")
            print(f"    💰 Price to Win: R$ {price_analysis.get('pricing_analysis', {}).get('price_to_win', 'N/A')}")
            
        except Exception as e:
            self.results['tests']['price_to_win'] = {
                'status': 'ERROR',
                'error': str(e)
            }
            print(f"    ❌ Erro: {e}")

        # 2. Teste competitors
        print("  👥 Testando competitors...")
        try:
            competitors_data = self.ml_api.get_product_competitors(TEST_PRODUCT_ID)
            self.results['tests']['competitors'] = {
                'status': 'SUCCESS',
                'data': {
                    'total_competitors': competitors_data.get('total_competitors', 0),
                    'competitors_found': len(competitors_data.get('competitors', [])),
                    'free_shipping_adoption': competitors_data.get('market_analysis', {}).get('market_characteristics', {}).get('free_shipping_adoption'),
                    'fulfillment_adoption': competitors_data.get('market_analysis', {}).get('market_characteristics', {}).get('fulfillment_adoption')
                }
            }
            print(f"    ✅ Concorrentes encontrados: {len(competitors_data.get('competitors', []))}")
            
        except Exception as e:
            self.results['tests']['competitors'] = {
                'status': 'ERROR',
                'error': str(e)
            }
            print(f"    ❌ Erro: {e}")

        # 3. Teste buybox winner
        print("  🏆 Testando buybox winner...")
        try:
            winner_data = self.ml_api.get_product_buybox_winner(TEST_PRODUCT_ID)
            self.results['tests']['buybox_winner'] = {
                'status': 'SUCCESS',
                'data': {
                    'winner_item_id': winner_data.get('current_winner', {}).get('item_id'),
                    'winner_price': winner_data.get('current_winner', {}).get('price'),
                    'price_range': winner_data.get('price_range'),
                    'competitive_insights': len(winner_data.get('competitive_insights', []))
                }
            }
            print(f"    ✅ Ganhador: {winner_data.get('current_winner', {}).get('item_id')}")
            
        except Exception as e:
            self.results['tests']['buybox_winner'] = {
                'status': 'ERROR',
                'error': str(e)
            }
            print(f"    ❌ Erro: {e}")

    def test_data_integration(self):
        """Testa consistência dos dados entre APIs"""
        print("🔗 Testando consistência dos dados...")
        
        price_data = self.results['tests'].get('price_to_win', {}).get('data', {})
        competitors_data = self.results['tests'].get('competitors', {}).get('data', {})
        winner_data = self.results['tests'].get('buybox_winner', {}).get('data', {})
        
        integration_tests = {
            'price_consistency': price_data.get('price_to_win') is not None,
            'competitors_available': competitors_data.get('total_competitors', 0) > 0,
            'winner_identified': winner_data.get('winner_item_id') is not None,
            'market_analysis': competitors_data.get('free_shipping_adoption') is not None
        }
        
        self.results['tests']['data_integration'] = integration_tests
        
        for test_name, result in integration_tests.items():
            status = "✅" if result else "❌"
            print(f"  {status} {test_name}: {result}")

    def generate_competitive_scenario(self):
        """Gera cenário competitivo baseado nos resultados"""
        print("📋 Gerando cenário competitivo...")
        
        # Extrair dados dos testes
        price_data = self.results['tests'].get('price_to_win', {}).get('data', {})
        competitors_data = self.results['tests'].get('competitors', {}).get('data', {})
        
        scenario = {
            'competitive_status': price_data.get('current_status', 'unknown'),
            'price_gap_exists': price_data.get('price_gap') is not None,
            'market_competition_level': 'high' if competitors_data.get('total_competitors', 0) > 5 else 'medium',
            'boost_opportunities': price_data.get('boosts_opportunities', 0),
            'market_characteristics': {
                'free_shipping_standard': competitors_data.get('free_shipping_adoption', {}).get('is_standard', False) if competitors_data.get('free_shipping_adoption') else False,
                'fulfillment_advantage': competitors_data.get('fulfillment_adoption', {}).get('competitive_advantage', False) if competitors_data.get('fulfillment_adoption') else False
            }
        }
        
        self.results['competitive_scenario'] = scenario
        
        print(f"  🎯 Status Competitivo: {scenario['competitive_status']}")
        print(f"  💰 Gap de Preço Existe: {'Sim' if scenario['price_gap_exists'] else 'Não'}")
        print(f"  📊 Nível de Competição: {scenario['market_competition_level']}")
        print(f"  ⚡ Oportunidades de Boost: {scenario['boost_opportunities']}")

    def frontend_validation_guide(self):
        """Gera guia de validação para o frontend"""
        print("🖥️ Guia de Validação Frontend:")
        
        print("  📝 Para validar o BuyBoxModal_Official.tsx:")
        print("    1. Abrir modal do item MLB4237624393")
        print("    2. Verificar carregamento dos dados oficiais")
        print("    3. Validar exibição das abas:")
        print("       - Concorrentes Reais: Lista de competidores oficiais")
        print("       - Price to Win: Análise de preço para ganhar")
        print("       - Boosts ML: Oportunidades de boost reais")
        print("       - Estratégias: Recomendações competitivas")
        
        print("  🎨 Elementos visuais a verificar:")
        print("    - Status badge do BuyBox")
        print("    - Score competitivo (0-100)")
        print("    - Price to Win vs Preço Atual")
        print("    - Lista de concorrentes com preços reais")
        print("    - Boosts ativos vs oportunidades")
        print("    - Análise de mercado (frete grátis, fulfillment)")
        
        print("  📱 URLs de teste no frontend:")
        print(f"    - http://localhost:3000/api/ml/buybox/analysis/{TEST_ITEM_ID}")
        print(f"    - http://localhost:3000/api/ml/competitors/official/{TEST_PRODUCT_ID}")
        print(f"    - http://localhost:3000/api/ml/product/winner/{TEST_PRODUCT_ID}")

    def save_results(self):
        """Salva resultados do teste"""
        results_file = Path("test_integration_results.json")
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Resultados salvos em: {results_file}")

    def run_complete_test(self):
        """Executa teste completo"""
        print("🚀 Iniciando teste completo de integração oficial ML")
        print("=" * 60)
        
        # Testes de backend
        self.test_backend_apis()
        print()
        
        # Testes de integração
        self.test_data_integration()
        print()
        
        # Cenário competitivo
        self.generate_competitive_scenario()
        print()
        
        # Guia frontend
        self.frontend_validation_guide()
        print()
        
        # Salvar resultados
        self.save_results()
        
        print("=" * 60)
        print("✅ Teste completo finalizado!")
        
        # Resumo final
        successful_tests = sum(1 for test in self.results['tests'].values() 
                             if test.get('status') == 'SUCCESS')
        total_tests = len(self.results['tests'])
        
        print(f"📊 Resumo: {successful_tests}/{total_tests} testes passaram")
        
        if successful_tests == total_tests:
            print("🎉 INTEGRAÇÃO OFICIAL ML FUNCIONANDO PERFEITAMENTE!")
        else:
            print("⚠️ Alguns testes falharam - verificar logs acima")

def main():
    """Função principal"""
    tester = IntegrationTester()
    tester.run_complete_test()

if __name__ == "__main__":
    main()