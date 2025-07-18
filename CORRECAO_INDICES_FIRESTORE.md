# Correção de Índices do Firestore - Agenda

## Problema Identificado

A tela de AGENDA do advogado apresentava erros relacionados a índices compostos necessários no Firestore:

```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/direitohub-74b76/firestore/indexes
```

## Causa do Problema

As consultas estavam usando múltiplos filtros `where` em campos diferentes:
- `userId` (string)
- `date` (campo de data para range)

Quando o Firestore precisa filtrar por múltiplos campos, especialmente com ranges de data, é necessário criar índices compostos.

## Solução Implementada

### Antes (Problemático):
```javascript
const q = query(
  collection(db, 'events'),
  where('userId', '==', userId),
  where('date', '>=', startOfMonth.toISOString().split('T')[0]),
  where('date', '<=', endOfMonth.toISOString().split('T')[0])
);
```

### Depois (Corrigido):
```javascript
// Usar apenas o filtro de userId para evitar índices compostos
const q = query(
  collection(db, 'events'),
  where('userId', '==', userId)
);

// Filtrar por data no cliente
const startStr = startOfMonth.toISOString().split('T')[0];
const endStr = endOfMonth.toISOString().split('T')[0];

events = events.filter(event => {
  const eventDate = event.date || '';
  return eventDate >= startStr && eventDate <= endStr;
});
```

## Arquivos Modificados

### 1. `src/firebase/firestore.js`

#### Função `getEvents`:
- **Linha ~795**: Removido filtros de data da consulta Firestore
- **Adicionado**: Filtração por data no cliente (JavaScript)

#### Função `getProcesses`:
- **Linha ~873**: Removido filtros de data da consulta Firestore  
- **Adicionado**: Filtração por data no cliente (JavaScript)

## Vantagens da Solução

### ✅ **Sem Necessidade de Índices**
- Consultas simples com apenas um campo filtrado
- Não requer configuração adicional no Firebase Console

### ✅ **Flexibilidade**
- Filtração no cliente permite lógicas mais complexas
- Facilita futuras modificações de filtros

### ✅ **Performance Adequada**
- Para aplicações de advogados individuais, o volume de dados é gerenciável
- Filtração local é eficiente para datasets pequenos/médios

## Considerações de Performance

### Volume de Dados Esperado:
- **Eventos**: ~50-200 por mês por advogado
- **Processos**: ~20-100 por mês por advogado

### Limites Aceitáveis:
- Até ~1000 documentos: Performance excelente
- Até ~5000 documentos: Performance boa
- Acima de 10000: Considerar otimizações

## Quando Usar Índices vs Filtração Cliente

### Use Índices Compostos Quando:
- Volume de dados > 10.000 documentos
- Consultas frequentes em campos múltiplos
- Performance crítica

### Use Filtração Cliente Quando:
- Volume de dados < 5.000 documentos
- Desenvolvimento rápido sem configuração adicional
- Flexibilidade de filtros complexos

## Fallback para Índices (Futuro)

Se o volume de dados crescer, podemos facilmente retornar aos índices:

```javascript
// 1. Criar índices no Firebase Console:
// - Collection: events
// - Fields: userId (ASC), date (ASC)

// 2. Reverter para consulta composta:
const q = query(
  collection(db, 'events'),
  where('userId', '==', userId),
  where('date', '>=', startStr),
  where('date', '<=', endStr)
);
```

## Teste da Correção

### Como Verificar:
1. Acessar Dashboard do Advogado
2. Navegar para aba "Agenda"
3. Verificar se não há erros de índice no console
4. Confirmar carregamento normal de eventos e processos

### Indicadores de Sucesso:
- ✅ Sem erros de índice no console
- ✅ Agenda carrega normalmente
- ✅ Eventos aparecem corretamente
- ✅ Processos aparecem corretamente

## Monitoramento

### Métricas a Observar:
- **Tempo de carregamento** da agenda
- **Quantidade de dados** transferidos
- **Erros de console** relacionados ao Firestore

### Sinais para Otimização Futura:
- Carregamento > 3 segundos
- Transferência > 1MB de dados
- Usuários com > 5000 eventos/processos

---

**Status**: ✅ Corrigido e Implementado  
**Data**: 17 de julho de 2025  
**Impacto**: Tela de agenda funcional sem erros de índice  
**Arquivos**: `src/firebase/firestore.js` (funções getEvents e getProcesses)
