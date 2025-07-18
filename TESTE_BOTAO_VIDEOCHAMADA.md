# 🧪 Guia de Teste - Botão de Videochamada na Agenda

## ✅ Checklist de Validação

### Pré-condições Necessárias:

- [ ] Sistema está rodando (`npm run dev`)
- [ ] Usuário logado como advogado
- [ ] Pelo menos 1 agendamento confirmado com videochamada
- [ ] Agendamento adicionado à agenda DireitoHub

## 📋 Roteiro de Teste Detalhado

### Teste 1: Verificar Evento de Consulta na Agenda

1. **Navegue para**: Painel do Advogado → Agenda
2. **Localize**: Data com evento de consulta
3. **Clique**: Na data para expandir detalhes
4. **Verifique**:
   - [ ] Evento aparece com badge roxo "Consulta"
   - [ ] Nome do cliente está correto
   - [ ] Horário está correto
   - [ ] Informações do cliente estão visíveis

### Teste 2: Validar Botão de Videochamada

1. **Localize**: O evento de consulta nos detalhes do dia
2. **Verifique na área de ações** (lado direito):
   - [ ] Botão azul "Entrar na Chamada" está presente
   - [ ] Ícone de videochamada (📹) está visível
   - [ ] Botão está posicionado antes dos outros botões
3. **Hover**: Sobre o botão
   - [ ] Tooltip "Entrar na videochamada" aparece
   - [ ] Cor muda para azul mais escuro

### Teste 3: Funcionalidade do Botão

1. **Clique**: No botão "Entrar na Chamada"
2. **Verifique**:
   - [ ] Nova aba/janela abre automaticamente
   - [ ] URL corresponde ao link da videochamada
   - [ ] Não há erros no console do navegador

### Teste 4: Diferentes Plataformas de Vídeo

Teste com diferentes tipos de links:

**Google Meet:**
- Link: `https://meet.google.com/xxx-xxxx-xxx`
- [ ] Abre corretamente
- [ ] Direciona para sala de reunião

**Zoom:**
- Link: `https://zoom.us/j/123456789`
- [ ] Abre corretamente
- [ ] Direciona para sala Zoom

**Microsoft Teams:**
- Link: `https://teams.microsoft.com/l/meetup-join/...`
- [ ] Abre corretamente
- [ ] Direciona para Teams

### Teste 5: Eventos Sem Videochamada

1. **Crie**: Evento normal (não consulta) na agenda
2. **Verifique**:
   - [ ] Botão "Entrar na Chamada" NÃO aparece
   - [ ] Apenas botões de editar/excluir estão presentes

3. **Crie**: Evento de consulta SEM videoCallLink
4. **Verifique**:
   - [ ] Badge "Consulta" aparece
   - [ ] Botão "Entrar na Chamada" NÃO aparece

## 🔍 Validação Visual

### Layout Esperado:

```
┌─────────────────────────────────────────────────────────┐
│ 📅 Consulta com João Silva              [Consulta]     │
│ 14:00                                                   │
│ Descrição da consulta...                                │
│                                                         │
│ Cliente: João Silva                                     │
│ Email: joao@email.com                                   │
│ Valor: R$ 200,00                                        │
│                                                         │
│                    [🎥 Entrar na Chamada] [📥] [✏️] [🗑️] │
└─────────────────────────────────────────────────────────┘
```

### Cores e Estilos:

- **Botão Videochamada**: 
  - Cor: Azul (#3B82F6)
  - Hover: Azul escuro (#2563EB)
  - Texto: Branco
  - Tamanho: Pequeno (`text-xs`)

## 🐛 Problemas Comuns e Soluções

### Problema: Botão não aparece
**Possíveis causas:**
- [ ] Event.type não é 'consulta'
- [ ] Event.videoCallLink está vazio ou null
- [ ] Erro na renderização condicional

**Verificação:**
```javascript
// Abra console do navegador e digite:
console.log(events.filter(e => e.type === 'consulta'));
```

### Problema: Clique não funciona
**Possíveis causas:**
- [ ] URL inválida no videoCallLink
- [ ] Bloqueador de popup ativo
- [ ] Erro de sintaxe no link

**Verificação:**
- Abra o Network tab do DevTools
- Verifique se há erros na console

### Problema: Nova aba não abre
**Possíveis causas:**
- [ ] Navegador bloqueia popups
- [ ] Link inválido
- [ ] Configuração de segurança

**Solução:**
- Permitir popups para o site
- Verificar se o link está correto

## 📊 Resultados Esperados

### ✅ Teste PASSOU se:
- Botão aparece apenas em eventos de consulta com videoCallLink
- Clique abre nova aba com URL correta
- Design e layout estão consistentes
- Não há erros no console

### ❌ Teste FALHOU se:
- Botão aparece em eventos que não são consulta
- Botão não aparece quando deveria
- Clique não abre nova aba
- URL incorreta é aberta
- Erros aparecem no console

## 🔧 Debug e Logs

### Para debugar problemas:

1. **Abra o Console** (F12)
2. **Execute comandos**:

```javascript
// Verificar eventos carregados
console.log('Events:', events);

// Verificar eventos de consulta
console.log('Consultas:', events.filter(e => e.type === 'consulta'));

// Verificar videoCallLinks
events.filter(e => e.type === 'consulta').forEach(e => {
  console.log(`${e.title}: ${e.videoCallLink}`);
});
```

### Logs Importantes:
- [ ] Sem erros 404 ou 500
- [ ] Sem warnings de React
- [ ] Eventos carregam corretamente
- [ ] videoCallLink tem valor válido

## 🎯 Critérios de Aceitação

### Funcionalidade Mínima:
- [x] Botão aparece em eventos de consulta com link
- [x] Botão não aparece em outros casos
- [x] Clique abre link em nova aba
- [x] Design consistente com o sistema

### Funcionalidade Completa:
- [x] Suporte a múltiplas plataformas de vídeo
- [x] Tooltip informativo
- [x] Segurança (noopener, noreferrer)
- [x] Responsividade em diferentes telas

## 📈 Próximos Passos

Após validação completa:
- [ ] Testar em produção com dados reais
- [ ] Coletar feedback dos advogados
- [ ] Monitorar logs de erro
- [ ] Implementar melhorias baseadas no uso

---

**Status do Teste**: ⏳ Aguardando execução
**Última atualização**: 17/07/2025
**Responsável**: Sistema de Agenda DireitoHub
