# Guia Rápido - Git e Deploy

## 🚀 Primeiro Deploy (GitHub + Vercel + Render)

### 1. Inicializar Git (se ainda não foi feito)

```powershell
cd intelligestor-backend-main

# Inicializar repositório
git init

# Adicionar remote (seu repositório já existe)
git remote add origin https://github.com/JonasDluna/intelligestor-backend.git
```

### 2. Verificar Status

```powershell
# Ver arquivos modificados
git status

# Ver diferenças
git diff
```

### 3. Adicionar Arquivos

```powershell
# Adicionar todos os arquivos
git add .

# Ou adicionar arquivos específicos
git add main.py
git add requirements.txt
git add vercel.json
```

### 4. Fazer Commit

```powershell
git commit -m "Configure FastAPI backend with Vercel and Render deployment"
```

### 5. Fazer Push

```powershell
# Primeira vez (se o repo está vazio)
git push -u origin main

# Ou se já existe conteúdo
git pull origin main --rebase
git push origin main
```

## ⚡ Deploy Automático

Após o push, automaticamente:

1. **GitHub** detecta as mudanças
2. **Vercel** faz deploy automático
3. **Render** também faz deploy (se configurado)
4. **GitHub Actions** roda testes

## 🔍 Verificar Deploy

### Vercel

```powershell
# Ver status do último deploy
# Acesse: https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo/deployments

# Ou via CLI
vercel ls

# Ver logs
vercel logs
```

### Render

```powershell
# Acesse: https://dashboard.render.com
# Vá em: intelligestor-backend > Logs
```

## 🧪 Testar Endpoints

```powershell
# Testar Vercel
curl https://intelligestor-backend-rlyo.vercel.app/health

# Testar Render
curl https://intelligestor-backend.onrender.com/health

# Ver documentação
# https://intelligestor-backend-rlyo.vercel.app/docs
# https://intelligestor-backend.onrender.com/docs
```

## 📝 Comandos Git Úteis

```powershell
# Ver histórico de commits
git log --oneline

# Ver branches
git branch

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Voltar para main
git checkout main

# Atualizar do remoto
git pull origin main

# Ver remote
git remote -v

# Desfazer último commit (mantém mudanças)
git reset --soft HEAD~1

# Descartar mudanças não commitadas
git checkout -- .

# Ver diferenças de um arquivo específico
git diff main.py

# Adicionar arquivo ao último commit
git add arquivo.py
git commit --amend --no-edit
```

## 🔄 Workflow de Desenvolvimento

### 1. Fazer mudanças localmente

```powershell
# Editar arquivos
code app/routers/new_router.py

# Testar localmente
uvicorn main:app --reload
```

### 2. Testar

```powershell
# Rodar testes
pytest

# Verificar código
flake8 app/
```

### 3. Commit e Push

```powershell
git add .
git commit -m "Add new router for X feature"
git push origin main
```

### 4. Verificar Deploy

```powershell
# Aguardar 2-5 minutos
# Verificar status na Vercel/Render
# Testar endpoints
```

## 🌿 Branches Strategy

### Main Branch (Production)
```powershell
main → Deploy automático para produção
```

### Development
```powershell
# Criar branch de desenvolvimento
git checkout -b develop
git push -u origin develop

# Trabalhar em features
git checkout -b feature/oauth-ml
# ... fazer mudanças ...
git commit -m "Implement OAuth ML"
git push origin feature/oauth-ml

# Abrir Pull Request no GitHub
# Após aprovação, merge para develop
# Depois merge develop → main
```

## 🔐 .gitignore Já Configurado

Arquivos que NÃO serão commitados:
- `.env` (credenciais)
- `venv/` (ambiente virtual)
- `__pycache__/` (cache Python)
- `.vscode/`, `.idea/` (IDEs)

## ⚠️ IMPORTANTE

### ❌ NUNCA commitar:
- Arquivo `.env` com credenciais reais
- API keys
- Senhas
- Tokens

### ✅ SEMPRE commitar:
- Arquivo `.env.example` (sem credenciais)
- Código fonte
- Documentação
- Configurações

## 🚨 Resolver Conflitos

```powershell
# Se houver conflito ao fazer pull
git pull origin main

# Resolver manualmente nos arquivos
# Buscar por: <<<<<<<, =======, >>>>>>>

# Após resolver
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## 📊 Ver Status do Deploy

### Vercel Dashboard
```
https://vercel.com/jonas-projects-37b78e14/intelligestor-backend-rlyo
```

### Render Dashboard
```
https://dashboard.render.com/web/srv-d4bi0h7diees73ajfp3g
```

### GitHub Actions
```
https://github.com/JonasDluna/intelligestor-backend/actions
```

## 🎯 Checklist Primeiro Deploy

- [ ] Verificar se o `.env` NÃO está no repo
- [ ] Adicionar variáveis no Vercel Dashboard
- [ ] Adicionar variáveis no Render Dashboard
- [ ] Fazer commit de todos os arquivos
- [ ] Fazer push para GitHub
- [ ] Aguardar deploy automático
- [ ] Testar endpoint `/health`
- [ ] Testar endpoint `/docs`
- [ ] Verificar logs em caso de erro
- [ ] Atualizar Redirect URI no Mercado Livre

## 💡 Dicas

1. **Sempre testar localmente** antes de fazer push
2. **Commits pequenos e frequentes** são melhores
3. **Mensagens de commit descritivas**
4. **Verificar logs** após cada deploy
5. **Usar branches** para features grandes

---

## 🔗 Links Rápidos

- **Repositório**: https://github.com/JonasDluna/intelligestor-backend
- **Vercel**: https://intelligestor-backend-rlyo.vercel.app
- **Render**: https://intelligestor-backend.onrender.com
- **Docs Vercel**: https://intelligestor-backend-rlyo.vercel.app/docs
- **Docs Render**: https://intelligestor-backend.onrender.com/docs
