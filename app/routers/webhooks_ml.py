"""
Router - Webhooks Mercado Livre
Recebe notificações de vendas, perguntas, mensagens
"""
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from typing import Dict, Any
import httpx
from datetime import datetime

from app.config.settings import settings, get_supabase_client

router = APIRouter(prefix="/webhooks/ml", tags=["Mercado Livre Webhooks"])


@router.post("/notifications")
async def receive_ml_notification(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Webhook para receber notificações do Mercado Livre
    
    **Tipos de notificação:**
    - **orders**: Novos pedidos, alterações de status
    - **items**: Alterações em anúncios
    - **questions**: Novas perguntas
    - **messages**: Novas mensagens
    - **claims**: Reclamações
    
    Documentação: https://developers.mercadolibre.com.br/pt_br/notificacoes
    """
    try:
        # ML envia no formato application/x-www-form-urlencoded
        body = await request.body()
        params = await request.form()
        
        notification_data = {
            "topic": params.get("topic"),
            "resource": params.get("resource"),
            "user_id": params.get("user_id"),
            "application_id": params.get("application_id"),
            "attempts": params.get("attempts", 1),
            "sent": params.get("sent"),
            "received": datetime.utcnow().isoformat()
        }
        
        # Processar em background para responder rápido ao ML
        background_tasks.add_task(
            process_notification,
            notification_data
        )
        
        # ML espera resposta 200 rápida
        return {"status": "received"}
        
    except Exception as e:
        # Log erro mas retorna 200 para não reenviar
        print(f"Erro ao receber notificação: {e}")
        return {"status": "error", "message": str(e)}


async def process_notification(data: Dict[str, Any]):
    """
    Processa notificação do ML em background
    """
    topic = data.get("topic")
    resource = data.get("resource")
    user_id = data.get("user_id")
    
    try:
        # Salvar notificação no banco
        supabase = get_supabase_client()
        supabase.table("logs_sistema").insert({
            "tipo": f"ml_webhook_{topic}",
            "dados": data,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        # Processar por tipo
        if topic == "orders":
            await process_order_notification(resource, user_id)
        
        elif topic == "items":
            await process_item_notification(resource, user_id)
        
        elif topic == "questions":
            await process_question_notification(resource, user_id)
        
        elif topic == "messages":
            await process_message_notification(resource, user_id)
        
    except Exception as e:
        print(f"Erro ao processar notificação: {e}")


async def process_order_notification(resource: str, ml_user_id: str):
    """
    Processa notificação de pedido
    - Busca detalhes do pedido na API do ML
    - Salva/atualiza no banco
    - Atualiza estoque
    """
    # Buscar token do usuário
    supabase = get_supabase_client()
    token_result = supabase.table("tokens_ml")\
        .select("access_token, user_id")\
        .eq("ml_user_id", int(ml_user_id))\
        .maybe_single()\
        .execute()
    
    if not token_result.data:
        print(f"Token não encontrado para ml_user_id: {ml_user_id}")
        return
    
    access_token = token_result.data["access_token"]
    our_user_id = token_result.data["user_id"]
    
    # Buscar detalhes do pedido
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                resource,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            order_data = response.json()
        
        # Salvar pedido (você pode criar tabela 'pedidos' se quiser)
        # Por enquanto, apenas log
        supabase.table("logs_sistema").insert({
            "tipo": "ml_order_processed",
            "dados": {
                "order_id": order_data.get("id"),
                "status": order_data.get("status"),
                "buyer_id": order_data.get("buyer", {}).get("id"),
                "total_amount": order_data.get("total_amount")
            }
        }).execute()
        
        # TODO: Atualizar estoque automaticamente
        
    except Exception as e:
        print(f"Erro ao processar pedido: {e}")


async def process_item_notification(resource: str, ml_user_id: str):
    """
    Processa notificação de alteração em anúncio
    - Sincroniza dados do anúncio
    """
    supabase = get_supabase_client()
    token_result = supabase.table("tokens_ml")\
        .select("access_token, user_id")\
        .eq("ml_user_id", int(ml_user_id))\
        .maybe_single()\
        .execute()
    
    if not token_result.data:
        return
    
    access_token = token_result.data["access_token"]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                resource,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            item_data = response.json()
        
        # Atualizar anúncio no banco
        ml_id = item_data.get("id")
        supabase.table("anuncios_ml").upsert({
            "ml_id": ml_id,
            "user_id": token_result.data["user_id"],
            "title": item_data.get("title"),
            "price": str(item_data.get("price")),
            "available_quantity": item_data.get("available_quantity"),
            "status": item_data.get("status")
        }, on_conflict="ml_id").execute()
        
    except Exception as e:
        print(f"Erro ao processar item: {e}")


async def process_question_notification(resource: str, ml_user_id: str):
    """
    Processa notificação de pergunta
    - Salva pergunta no banco
    - Pode integrar com IA para resposta automática
    """
    supabase = get_supabase_client()
    token_result = supabase.table("tokens_ml")\
        .select("access_token, user_id")\
        .eq("ml_user_id", int(ml_user_id))\
        .maybe_single()\
        .execute()
    
    if not token_result.data:
        print(f"Token não encontrado para ml_user_id: {ml_user_id}")
        return
    
    access_token = token_result.data["access_token"]
    our_user_id = token_result.data["user_id"]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                resource,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            question_data = response.json()
        
        # Salvar pergunta
        supabase.table("logs_sistema").insert({
            "tipo": "ml_question_received",
            "dados": {
                "question_id": question_data.get("id"),
                "item_id": question_data.get("item_id"),
                "text": question_data.get("text"),
                "from_user_id": question_data.get("from", {}).get("id"),
                "status": question_data.get("status")
            }
        }).execute()
        
        print(f"Pergunta processada: {question_data.get('id')}")
        
    except Exception as e:
        print(f"Erro ao processar pergunta: {e}")


async def process_message_notification(resource: str, ml_user_id: str):
    """
    Processa notificação de mensagem
    - Salva mensagem no banco
    - Notifica usuário
    """
    supabase = get_supabase_client()
    token_result = supabase.table("tokens_ml")\
        .select("access_token, user_id")\
        .eq("ml_user_id", int(ml_user_id))\
        .maybe_single()\
        .execute()
    
    if not token_result.data:
        print(f"Token não encontrado para ml_user_id: {ml_user_id}")
        return
    
    access_token = token_result.data["access_token"]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                resource,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            message_data = response.json()
        
        # Salvar mensagem
        supabase.table("logs_sistema").insert({
            "tipo": "ml_message_received",
            "dados": {
                "message_id": message_data.get("id"),
                "from_user_id": message_data.get("from", {}).get("user_id"),
                "to_user_id": message_data.get("to", {}).get("user_id"),
                "text": message_data.get("text"),
                "status": message_data.get("status")
            }
        }).execute()
        
        print(f"Mensagem processada: {message_data.get('id')}")
        
    except Exception as e:
        print(f"Erro ao processar mensagem: {e}")


@router.get("/test")
async def test_webhook():
    """
    Endpoint de teste para validar se webhook está acessível
    """
    return {
        "status": "ok",
        "message": "Webhook está funcionando",
        "endpoint": "/webhooks/ml/notifications"
    }
