#!/bin/bash
# Deploy manual para Render
# Este script força um redeploy via webhook (se configurado)

echo "🚀 Iniciando deploy manual..."

# Atualiza versão no arquivo de saúde
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "📝 Commit atual: $COMMIT_HASH"

# Faz uma alteração pequena para forçar redeploy
echo "# Deploy trigger $(date)" >> .deploy_log
git add .deploy_log
git commit -m "chore: trigger deploy - $COMMIT_HASH"
git push origin main

echo "✅ Deploy triggerado com sucesso!"
echo "🔗 Verifique em: https://dashboard.render.com/"
echo "🔗 API: https://intelligestor-backend.onrender.com/ml/health"
echo "🔗 Frontend: https://intelligestor-frontend-g8sdie7dk-jonas-projects-37b78e14.vercel.app"