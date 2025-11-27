# Rotação de Segredos

Este guia descreve como rotacionar com segurança os segredos usados no projeto (Supabase, OpenAI, Mercado Livre), e onde atualizá-los (Render e Vercel).

## Checklist Rápida
- Inventariar segredos atuais
- Gerar novos segredos no provedor
- Atualizar variáveis no Render e Vercel
- Publicar/Deploy e testar fluxos críticos
- Revogar segredos antigos

---

## Supabase
- Onde: Project Settings → API
- Ações:
  - Regenerate Keys para `anon` e `service_role`
  - Atualizar no Render (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
  - Se o frontend usa Supabase público, atualizar no Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
  - Testes: `/health`, login do frontend, chamadas básicas ao banco

## OpenAI
- Onde: https://platform.openai.com/ → API Keys
- Ações:
  - Criar nova `OPENAI_API_KEY`
  - Atualizar no Render
  - Testes: endpoints que chamam IA (descrições, análises) retornando 200
  - Revogar chave antiga após validação

## Mercado Livre
- Onde: https://developers.mercadolivre.com.br → Minha Aplicação
- Ações:
  - Gerar novo `App Secret` (`ML_CLIENT_SECRET`)
  - Confirmar `redirect_uri` em: `https://intelligestor-backend.onrender.com/integrations/ml/callback`
  - Atualizar no Render (`ML_CLIENT_ID`, `ML_CLIENT_SECRET`)
  - Testes: fluxo OAuth completo (auth-url → login → callback → `?connected=1`)
  - Revogar secret antigo após validação

## Render (Backend)
- Onde: Service → Environment
- Ações:
  - Atualizar variáveis: `SUPABASE_*`, `OPENAI_API_KEY`, `ML_CLIENT_*`, `FRONTEND_SUCCESS_REDIRECT`, `RENDER_URL`
  - Redeploy automático pelo Render
  - Testes: `GET /health`, `GET /integrations/ml/{id}/status`

## Vercel (Frontend)
- Onde: Project → Settings → Environment Variables
- Ações:
  - Se aplicável, atualizar `NEXT_PUBLIC_*` (Supabase, API base)
  - Deploy (Production) e validação das páginas críticas

## Boas Práticas
- Nunca versionar `.env` (já ignorado no repositório)
- Evitar reuso prolongado de secrets antigos; aplicar rotação periódica
- Aplicar RLS no Supabase (ver `docs/SECURITY_SUPABASE_RLS.md`)
