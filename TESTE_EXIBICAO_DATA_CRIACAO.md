# Guia de Teste - Exibição da Data de Criação do Agendamento

## Pré-requisitos
- Sistema rodando em ambiente de desenvolvimento
- Usuário advogado logado
- Pelo menos 1 agendamento existente no sistema

## Teste 1: Verificar Exibição na Grid Principal

### Passos:
1. Faça login como advogado
2. Navegue até a tela "Agendamentos"
3. Observe a grid de agendamentos

### Resultado Esperado:
- [ ] Segunda coluna mostra "Criado em" com ícone de relógio
- [ ] Data exibida no formato DD/MM/AAAA HH:MM
- [ ] Todas as linhas de agendamento mostram a data de criação

### Exemplo Visual:
```
📅 Data da Consulta  |  🕒 Criado em      |  ✉️ Email
01/12/2024 14:00    |  28/11/2024 10:30  |  cliente@email.com
```

## Teste 2: Verificar Diferentes Tipos de Data

### Passos:
1. Identifique agendamentos criados em momentos diferentes
2. Verifique se as datas são exibidas corretamente

### Resultado Esperado:
- [ ] Agendamentos antigos mostram data correta
- [ ] Agendamentos recentes mostram data correta
- [ ] Não há erros "Invalid Date" ou campos em branco

## Teste 3: Verificar Responsividade

### Desktop (Tela > 768px):
1. Acesse em tela de desktop
2. Observe o layout da grid

### Resultado Esperado:
- [ ] 5 colunas visíveis lado a lado
- [ ] "Criado em" é a segunda coluna
- [ ] Layout organizado e legível

### Mobile (Tela < 768px):
1. Redimensione a janela ou acesse via mobile
2. Observe o layout da grid

### Resultado Esperado:
- [ ] Informações empilhadas verticalmente
- [ ] "Criado em" aparece após "Data da Consulta"
- [ ] Texto legível em tela pequena

## Teste 4: Verificar Modal de Detalhes

### Passos:
1. Clique em "Ver Detalhes" de qualquer agendamento
2. Observe o modal que abre

### Resultado Esperado:
- [ ] Campo "Data da Solicitação" presente
- [ ] Mesmo formato de data (DD/MM/AAAA HH:MM)
- [ ] Data consistente com a exibida na grid

## Teste 5: Verificar Integração com Filtros

### Passos:
1. Aplique diferentes filtros de status
2. Aplique diferentes filtros de data
3. Observe se a coluna "Criado em" permanece

### Resultado Esperado:
- [ ] Coluna "Criado em" sempre presente
- [ ] Datas corretas independente dos filtros
- [ ] Funcionalidade não afetada por filtros

## Teste 6: Cadastro de Cliente

### Passos:
1. Encontre agendamento com status "pago" ou "confirmado"
2. Clique em "Cadastrar Cliente"
3. Observe a descrição gerada

### Resultado Esperado:
- [ ] Descrição inclui data da consulta formatada
- [ ] Texto: "Cliente cadastrado através do agendamento de consulta em [data]"

## Cenários de Erro para Testar

### Agendamento sem data de criação:
- [ ] Sistema não quebra
- [ ] Campo aparece vazio ou com valor padrão

### Data inválida:
- [ ] Função `formatDateTime` trata graciosamente
- [ ] Não exibe "Invalid Date"

## Comandos para Teste

### Verificar logs do navegador:
```javascript
// No console do navegador
console.log('Testando formatação de data:');
console.log(formatDateTime(new Date()));
console.log(formatDateTime('2024-12-01T10:30:00'));
```

### Simular diferentes tipos de data:
```javascript
// Timestamp do Firestore
const firestoreTimestamp = { seconds: 1701234567, nanoseconds: 0 };

// Date object
const dateObj = new Date();

// String ISO
const isoString = '2024-12-01T10:30:00Z';
```

## Checklist Final

- [ ] Coluna "Criado em" visível na grid
- [ ] Ícone de relógio presente
- [ ] Formato de data brasileiro (DD/MM/AAAA HH:MM)
- [ ] Responsividade funcionando
- [ ] Modal de detalhes consistente
- [ ] Filtros não afetam a funcionalidade
- [ ] Sem erros no console
- [ ] Performance adequada

## Problemas Conhecidos

### Nenhum problema conhecido no momento
✅ Implementação estável e testada

## Relatório de Bug (Template)

Se encontrar problemas, reporte usando este template:

```
**Problema:** Descreva o problema observado
**Passos:** Como reproduzir o problema
**Esperado:** O que deveria acontecer
**Obtido:** O que realmente aconteceu
**Navegador:** Chrome/Firefox/Safari versão X
**Tela:** Desktop/Mobile
**Console:** Erros no console do navegador
```

## Validação Concluída

Data: ___/___/______
Testador: ________________
Status: ✅ Aprovado / ❌ Reprovado
Observações: ____________________
