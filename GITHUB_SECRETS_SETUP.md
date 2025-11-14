# 🔑 Configurar GitHub Secrets para Render

## Informações para Adicionar

### 1. Acesse a página de Secrets
URL: https://github.com/JonasDluna/intelligestor-backend/settings/secrets/actions

### 2. Adicione as duas secrets:

#### Secret #1
- **Name:** `RENDER_API_KEY`
- **Secret:** `rnd_FZtkDMUQHWjB4r33enHMCcCC38fF`

**Passos:**
1. Clique em **"New repository secret"**
2. Em **"Name"**, digite: `RENDER_API_KEY`
3. Em **"Secret"**, cole: `rnd_FZtkDMUQHWjB4r33enHMCcCC38fF`
4. Clique em **"Add secret"**

#### Secret #2
- **Name:** `RENDER_SERVICE_ID`
- **Secret:** `srv-d4bi0h7diees73ajfp3g`

**Passos:**
1. Clique em **"New repository secret"** novamente
2. Em **"Name"**, digite: `RENDER_SERVICE_ID`
3. Em **"Secret"**, cole: `srv-d4bi0h7diees73ajfp3g`
4. Clique em **"Add secret"**

---

## ✅ Após Adicionar as Secrets

As secrets estarão disponíveis para o GitHub Actions workflow em `.github/workflows/deploy.yml`.

O workflow já está configurado para usar essas secrets:
```yaml
env:
  RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
  RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
```

---

## 🎯 Próximos Passos

Agora que você tem:
- ✅ GitHub Secrets configuradas
- ✅ Credenciais do Supabase
- ✅ SECRET_KEY gerada

### PRIORIDADE: Configurar Environment Variables no Render

Acesse: https://dashboard.render.com/web/srv-d4bi0h7diees73ajfp3g

Clique em **"Environment"** e adicione as variáveis do arquivo **`RENDER_ENV_VARS.md`**:

1. `SUPABASE_URL` = `https://wsluajpeibcfeerbxqiz.supabase.co`
2. `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. `SECRET_KEY` = `ZNm1Rc5o2plY80iZiUKormgvZ9ln2INXBIWL1suYeBk`
5. `ENVIRONMENT` = `production`
6. `DEBUG` = `False`
7. `OPENAI_MODEL` = `gpt-4`

Depois de salvar, o Render fará redeploy automático e o app funcionará! 🚀
