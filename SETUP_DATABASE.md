# 🗄️ Setup do Banco de Dados Supabase

## ❌ Problema Atual
O endpoint `/produtos/` retorna erro 500 porque **a tabela `produtos` não existe** no banco de dados Supabase.

## ✅ Solução: Executar o Schema SQL

### Passo 1: Acessar Supabase
1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **IntelliGestor**

### Passo 2: Abrir SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (ou "+ Nova consulta")

### Passo 3: Executar o Schema
1. Abra o arquivo `database_schema_v2.sql` neste repositório
2. Copie **TODO** o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou **"Executar"** (botão verde)

### Passo 4: Verificar Criação
Após executar, você deve ver no Supabase:
- ✅ Tabela `usuarios` criada
- ✅ Tabela `produtos` criada  
- ✅ Tabela `tokens_ml` criada
- ✅ Tabela `anuncios` criada
- ✅ E outras tabelas...

### Passo 5: Testar Backend
Depois de criar as tabelas, teste novamente:

```bash
# Testar se produtos funciona
curl https://intelligestor-backend.onrender.com/produtos/?limit=10
```

## 📝 Importante
- O schema cria **TODAS** as tabelas necessárias para o sistema
- Inclui índices para performance
- Já vem com constraints e foreign keys
- **Execute apenas uma vez** - o SQL tem `IF NOT EXISTS` para evitar duplicação

## 🔧 Caso de Erro
Se der erro ao executar:
1. Verifique se já existem tabelas com os mesmos nomes
2. Use o arquivo `drop_all_tables.sql` para limpar tudo primeiro
3. Execute o `database_schema_v2.sql` novamente

## 🎯 Após Setup
Recarregue o frontend em: https://intelligestor-frontend.vercel.app/dashboard

Os erros de CORS e 500 devem desaparecer! ✨
