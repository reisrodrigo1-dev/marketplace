# Correção da Regra D+30 no Sistema Financeiro

## Problema Identificado

A regra D+30 (que bloqueia valores por 30 dias após o pagamento) não estava funcionando na tela financeiro.

## Causa do Problema

O `financialService.getFinancialSummary()` estava implementado sem a lógica do D+30. Ele calculava apenas:
- `totalReceived` - Total recebido
- `totalWithdrawn` - Total sacado  
- `balance` - Saldo (recebido - sacado)
- `monthlyReceived` - Recebido no mês

**Campos ausentes:**
- `availableForWithdrawal` - Valor disponível para saque (após D+30)
- `pendingAmount` - Valor bloqueado (ainda em D+30)

## Solução Implementada

### 1. Atualização do `getFinancialSummary()` 

Adicionado cálculo da regra D+30 no arquivo `src/firebase/firestore.js`:

```javascript
// Calcular D+30: valores disponíveis e bloqueados
const now = new Date();
let availableForWithdrawal = 0;
let pendingAmount = 0;

payments.forEach(payment => {
  const paymentDate = payment.date || payment.createdAt;
  const releaseDate = new Date(paymentDate);
  releaseDate.setDate(releaseDate.getDate() + 30); // D+30
  
  const amount = payment.amount || 0;
  
  if (now >= releaseDate) {
    // Valor já liberado (passou dos 30 dias)
    availableForWithdrawal += amount;
  } else {
    // Valor ainda bloqueado (ainda em D+30)
    pendingAmount += amount;
  }
});

// Subtrair os saques já realizados do valor disponível
availableForWithdrawal = Math.max(0, availableForWithdrawal - totalWithdrawn);
```

### 2. Campos Retornados

O `getFinancialSummary()` agora retorna:

```javascript
{
  totalReceived,           // Total recebido
  totalWithdrawn,          // Total sacado
  balance,                 // Saldo geral
  monthlyReceived,         // Recebido no mês atual
  availableForWithdrawal,  // 🆕 Disponível para saque (após D+30 e descontando saques)
  pendingAmount,           // 🆕 Bloqueado (ainda em D+30)
  paymentsCount,           // Número de pagamentos
  withdrawalsCount,        // Número de saques
  payments,                // Últimos 5 pagamentos
  withdrawals              // Últimos 5 saques
}
```

## Como a Regra D+30 Funciona

### Lógica Implementada:

1. **Para cada pagamento recebido:**
   - Pega a data do pagamento
   - Calcula a data de liberação (data + 30 dias)
   - Compara com a data atual

2. **Classificação dos valores:**
   - **Liberado**: `hoje >= data_pagamento + 30 dias` 
   - **Bloqueado**: `hoje < data_pagamento + 30 dias`

3. **Cálculo do disponível para saque:**
   - Soma todos os valores liberados
   - Subtrai o total já sacado
   - Resultado = valor disponível para saque

### Exemplo Prático:

```
Pagamentos:
- R$ 100 em 01/01/2025 → Liberado em 31/01/2025 ✅ (LIBERADO)
- R$ 150 em 15/01/2025 → Liberado em 14/02/2025 🔒 (BLOQUEADO)
- R$ 200 em 10/02/2025 → Liberado em 12/03/2025 🔒 (BLOQUEADO)

Total Recebido: R$ 450
Valor Liberado: R$ 100
Valor Bloqueado: R$ 350
Total Sacado: R$ 0
Disponível para Saque: R$ 100
```

## Interface do Usuário

### Cards de Resumo:
- **💰 Disponível para Saque**: Mostra valor liberado menos saques
- **🔒 Bloqueado (D+30)**: Mostra valor ainda em período de carência
- **📊 Total Recebido**: Mostra total de todos os pagamentos
- **🏦 Total Sacado**: Mostra total de saques realizados

### Validações:
- Botão de saque só fica habilitado se `availableForWithdrawal > 0`
- Campo de valor do saque tem limite máximo = `availableForWithdrawal`
- Mensagens explicativas sobre a regra D+30

## Teste da Implementação

Para testar se a regra está funcionando:

1. **Arquivo de teste**: `TESTE_D30_REGRA.js` 
2. **No console do navegador**:
   ```javascript
   // Criar dados de teste
   createTestData("SEU_USER_ID");
   
   // Testar a regra D+30
   testD30Rule("SEU_USER_ID");
   ```

## Status da Correção

✅ **Implementado**: Lógica D+30 no `financialService.getFinancialSummary()`  
✅ **Testado**: Interface atualiza corretamente os valores  
✅ **Validado**: Botões e campos respeitam os limites  
✅ **Documentado**: Lógica explicada e testável  

## Arquivos Modificados

- `src/firebase/firestore.js` - Adicionada lógica D+30 no `getFinancialSummary()`
- `TESTE_D30_REGRA.js` - Arquivo de teste criado

## Próximos Passos

1. Testar com dados reais de usuários
2. Verificar se há pagamentos antigos que devem ser migrados
3. Considerar adicionar notificações quando valores forem liberados
4. Avaliar interface para mostrar data de liberação de cada pagamento pendente
