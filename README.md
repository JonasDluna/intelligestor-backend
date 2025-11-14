# Intelligestor Backend

Backend API com integrações para Supabase, OpenAI, pronto para deploy no Render e Vercel.

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **Supabase** - Banco de dados e autenticação
- **OpenAI** - Inteligência artificial
- **Render/Vercel** - Plataformas de deploy

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Conta no [Supabase](https://supabase.com)
- Conta no [OpenAI](https://platform.openai.com)
- Conta no [Render](https://render.com) ou [Vercel](https://vercel.com)

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/JonasDluna/intelligestor-backend.git
cd intelligestor-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Server
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://wsluajpeibcfeerbxqiz.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# OpenAI
OPENAI_API_KEY=sua-chave-openai
OPENAI_MODEL=gpt-5.1

# CORS (desenvolvimento + produção)
**Produção:**
```env
ALLOWED_ORIGINS=https://intelligestor.com,https://www.intelligestor.com
```
```

### 4. Execute o servidor

**Modo desenvolvimento:**
```bash
npm run dev
```

**Modo produção:**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🔑 Obtendo Credenciais

### Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **Settings** > **API**
4. Copie:
   - **URL** (Project URL)
   - **anon/public** key
   - **service_role** key (para operações admin)

### OpenAI

1. Acesse [https://platform.openai.com](https://platform.openai.com)
2. Vá em **API Keys**
3. Clique em **Create new secret key**
4. Copie a chave gerada

## 📡 Endpoints da API

### Health Check
```
GET /health
```

Retorna o status do servidor e serviços conectados.

### Supabase Data
```
GET /api/data
```

Exemplo de consulta ao Supabase.

### OpenAI Chat
```
POST /api/chat
Content-Type: application/json

{
  "message": "Olá, como você pode me ajudar?"
}
```

### Análise Combinada
```
POST /api/analyze
Content-Type: application/json

{
  "dataId": "123",
  "prompt": "Analise estes dados"
}
```

Combina dados do Supabase com análise da OpenAI.

## 🚀 Deploy

### Render

1. Conecte seu repositório GitHub no [Render](https://render.com)
2. O arquivo `render.yaml` já está configurado
3. Adicione as variáveis de ambiente no dashboard do Render
4. O deploy será automático a cada push

**Variáveis necessárias no Render:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ALLOWED_ORIGINS`

### Vercel

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Configure as variáveis de ambiente no dashboard da Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `ALLOWED_ORIGINS`

**Nota:** O arquivo `vercel.json` já está configurado.

## 📁 Estrutura do Projeto

```
intelligestor-backend/
├── src/
│   ├── config/
│   │   ├── supabase.js      # Configuração do Supabase
│   │   └── openai.js         # Configuração da OpenAI
│   ├── routes/
│   │   └── api.js            # Rotas da API
│   └── index.js              # Servidor principal
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── render.yaml               # Config do Render
├── vercel.json              # Config da Vercel
└── README.md
```

## 🛠️ Desenvolvimento

### Comandos disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor com hot-reload

### Adicionando novas rotas

Edite o arquivo `src/routes/api.js` para adicionar novos endpoints.

### Exemplo de uso do Supabase

```javascript
import { supabase } from '../config/supabase.js';

const { data, error } = await supabase
  .from('tabela')
  .select('*')
  .eq('campo', 'valor');
```

### Exemplo de uso da OpenAI

```javascript
import { openai, OPENAI_CONFIG } from '../config/openai.js';

const completion = await openai.chat.completions.create({
  model: OPENAI_CONFIG.model,
  messages: [{ role: 'user', content: 'Olá!' }]
});
```

## 🔒 Segurança

- Nunca commite o arquivo `.env`
- Use `SUPABASE_SERVICE_ROLE_KEY` apenas no backend
- Configure CORS adequadamente em produção
- Implemente rate limiting se necessário

## 📝 Licença

MIT

## 👤 Autor

Jonas Luna
- GitHub: [@JonasDluna](https://github.com/JonasDluna)

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças importantes, abra uma issue primeiro.

---

**Feito com ❤️ por Jonas Luna**
