# Guia de Deploy - Frontend no Vercel

## 🚀 Deploy Automático via GitHub

### Passo 1: Preparar o Repositório

Você tem duas opções:

#### Opção A: Usar o repositório `intelligestor-frontend` (Recomendado)
Se você já tem um repositório separado para o frontend, use-o diretamente.

#### Opção B: Criar monorepo
Se quiser manter backend e frontend juntos, crie a estrutura:
```
intelligestor-backend/
  ├── backend/          (código Python/FastAPI)
  ├── frontend/         (código Next.js)
  └── vercel.json       (config do frontend)
```

### Passo 2: Fazer Deploy no Vercel

1. **Acesse:** https://vercel.com
2. **Login:** Entre com sua conta GitHub
3. **Novo Projeto:** Clique em "Add New" → "Project"
4. **Importar Repositório:** Selecione `intelligestor-frontend`

### Passo 3: Configurar o Projeto

#### Framework Preset
```
Next.js
```

#### Root Directory
```
./
```
(ou `frontend` se estiver em monorepo)

#### Build and Output Settings

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

#### Environment Variables (IMPORTANTE!)

Adicione estas variáveis no Vercel:

| Key | Value | Onde encontrar |
|-----|-------|----------------|
| `NEXT_PUBLIC_API_URL` | `https://intelligestor-backend.onrender.com` | URL do seu backend no Render |
| `NODE_ENV` | `production` | - |

**Como adicionar:**
- Na página de configuração do projeto
- Seção "Environment Variables"
- Clique "Add" para cada variável
- Marque: Production, Preview, Development (todas)

### Passo 4: Deploy

Clique em **"Deploy"**

O Vercel vai:
1. ✅ Clonar o repositório
2. ✅ Instalar dependências
3. ✅ Executar build
4. ✅ Fazer deploy automático

**Tempo estimado:** 2-5 minutos

### Passo 5: Verificar Deploy

Após o deploy, você receberá uma URL:
```
https://intelligestor-frontend.vercel.app
```

Teste os endpoints:
- `https://intelligestor-frontend.vercel.app/` - Página inicial
- `https://intelligestor-frontend.vercel.app/dashboard` - Dashboard
- `https://intelligestor-frontend.vercel.app/login` - Login

---

## 🔄 Deploy Contínuo

Após o setup inicial, o Vercel fará deploy automático:
- ✅ A cada push na branch `main`
- ✅ Preview para PRs automaticamente
- ✅ Rollback fácil para versões anteriores

---

## 🐛 Troubleshooting

### Erro: "Module not found"
**Solução:** Verifique se todas as dependências estão no `package.json`

### Erro: "Failed to compile"
**Solução:** Rode `npm run build` localmente primeiro para ver o erro detalhado

### Erro: "API not responding"
**Solução:** 
1. Verifique se `NEXT_PUBLIC_API_URL` está correta
2. Confirme que o backend está rodando
3. Verifique CORS no backend

### Erro: "Environment variable not found"
**Solução:** 
1. Vá em Settings → Environment Variables
2. Adicione as variáveis necessárias
3. Faça um novo deploy (Deployments → Redeploy)

---

## 📝 Checklist Pré-Deploy

- [ ] Código no GitHub/GitLab
- [ ] `package.json` com scripts corretos
- [ ] `.env.production` configurado
- [ ] Backend rodando e acessível
- [ ] Build local funciona (`npm run build`)
- [ ] Sem erros TypeScript
- [ ] CORS configurado no backend

---

## 🎯 URLs Importantes

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentação:** https://vercel.com/docs
- **Status:** https://vercel-status.com

---

## 🔐 Variáveis de Ambiente do Backend

Certifique-se que o backend no Render tem:

```env
ALLOWED_ORIGINS=https://intelligestor-frontend.vercel.app,http://localhost:3000
```

Adicione a URL do Vercel aos CORS permitidos!

---

## 🚀 Comandos Úteis

```bash
# Testar build localmente
npm run build
npm run start

# Ver logs de produção
vercel logs [deployment-url]

# Fazer deploy manual
vercel --prod
```

---

Pronto! Seu frontend estará no ar e com deploy automático configurado! 🎉
