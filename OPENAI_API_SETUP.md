# 🔑 Configuração da API OpenAI - DireitoHub

## ❌ Problema: Erro 403 (Forbidden)

O erro 403 indica que há um problema com a API Key da OpenAI. Isso pode acontecer por:

1. **API Key não configurada**
2. **API Key inválida ou expirada**
3. **API Key sem permissões adequadas**
4. **Limite de créditos excedido**

## ✅ Solução

### 1. **Obter uma API Key da OpenAI**

1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada (começa com `sk-proj-...`)

### 2. **Configurar no Projeto**

1. **Crie um arquivo `.env`** na raiz do projeto:
```bash
# Copie o .env.example para .env
cp .env.example .env
```

2. **Adicione sua API Key** no arquivo `.env`:
```bash
VITE_OPENAI_API_KEY=sk-proj-SUA_CHAVE_AQUI
```

3. **Reinicie o servidor**:
```bash
npm run dev
```

### 3. **Verificar Configuração**

No console do navegador, você deve ver:
```
✅ API Key configurada: true
```

Se aparecer:
```
❌ API Key não configurada ou inválida
```

Verifique se:
- O arquivo `.env` está na raiz do projeto
- A variável está escrita corretamente: `VITE_OPENAI_API_KEY`
- A chave está completa e sem espaços extras

## 💰 **Custos da API**

A API da OpenAI é paga, mas tem preços baixos:
- **GPT-3.5-turbo**: ~$0.002 por 1K tokens
- **Créditos grátis**: $5 para novos usuários

## 🔍 **Verificar Uso**

1. Acesse: https://platform.openai.com/usage
2. Verifique se ainda tem créditos disponíveis
3. Monitore o uso para evitar exceder limites

## 🆘 **Problemas Comuns**

### **Erro 401 - Unauthorized**
- API Key inválida ou mal formatada
- Solução: Gerar nova chave

### **Erro 403 - Forbidden**
- API Key sem permissões
- Conta sem créditos
- Solução: Verificar conta OpenAI

### **Erro 429 - Rate Limit**
- Muitas requisições em pouco tempo
- Solução: Aguardar alguns minutos

## 📝 **Exemplo de Configuração**

Arquivo `.env` completo:
```bash
# OpenAI API
VITE_OPENAI_API_KEY=sua_openai_api_key_aqui

# Outras configurações...
VITE_YOUTUBE_API_KEY=sua_youtube_key
VITE_NEWSAPI_KEY=sua_news_key
```

## ✅ **Teste Final**

Após configurar:
1. Reinicie o servidor (`npm run dev`)
2. Acesse o Chat AI no sistema
3. Envie uma mensagem de teste
4. Verifique se a resposta é gerada sem erros

Se ainda houver problemas, verifique o console do navegador para mensagens de erro mais específicas.
