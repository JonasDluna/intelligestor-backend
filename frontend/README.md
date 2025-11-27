## IntelliGestor Frontend

Interface React/Next.js para as automações, análises de IA e integrações com Mercado Livre oferecidas pelo backend do IntelliGestor. Este projeto utiliza App Router, React 19 e TailwindCSS v4, além de React Query para o consumo das APIs.

### Pré-requisitos

- Node.js >= 18.18 e npm >= 9 (verifique com `node -v` e `npm -v`).
- Backend do IntelliGestor rodando localmente (`http://localhost:8000`) ou acessível via Render.

### Configuração rápida

1. Copie o arquivo de exemplo e ajuste as variáveis necessárias:

	```bash
	cp .env.example .env.local
	# edite .env.local e defina NEXT_PUBLIC_API_URL
	```

2. Instale as dependências:

	```bash
	npm install
	```

3. Suba o servidor de desenvolvimento:

	```bash
	npm run dev
	```

4. Acesse [http://localhost:3000](http://localhost:3000).

### Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor em modo desenvolvimento com Turbopack |
| `npm run build` | Gera o bundle otimizado para produção |
| `npm run start` | Roda o bundle de produção localmente |
| `npm run lint` / `npm run lint:fix` | Executa o ESLint (modo somente leitura ou com correções) |
| `npm run typecheck` | Verifica os tipos com `tsc --noEmit` |
| `npm run preview` | Build + start para testar o pacote final |

### Estrutura de pastas (resumo)

```
src/
 ├─ app/               # Rotas e páginas usando App Router
 ├─ components/        # Componentes compartilhados (atoms/molecules/etc.)
 ├─ contexts/          # Providers (Auth, React Query, etc.)
 ├─ lib/               # Configurações comuns (axios, hooks)
 ├─ services/          # Wrapper para chamadas ao backend
 └─ utils/             # Helpers (formatação, imagens)
```

### Convenções e qualidade

- Utilize o alias `@/*` para importar arquivos dentro de `src`.
- Sempre rode `npm run lint` e `npm run typecheck` antes de abrir um PR.
- O arquivo `next.config.ts` já aplica CSP básica e remove logs em produção; mantenha qualquer novo domínio/API registrado ali.

### Deploy

O fluxo oficial é via Vercel (`vercel.json`). Após o merge na branch principal:

1. Execute `npm run preview` localmente para validar o bundle final.
2. Garanta que `NEXT_PUBLIC_API_URL` esteja configurada nos ambientes da Vercel (Preview/Production).
3. Faça o deploy com `vercel` ou via pipeline automático do GitHub.

Consulte `DEPLOY_VERCEL.md` para detalhes específicos.
