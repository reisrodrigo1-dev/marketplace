# 🔧 Debug do Sistema de Colaboração

## Problema Reportado
- Enviar convite não funciona
- Não aparece feedback para quem enviou
- Destinatário não recebe notificação

## Correções Aplicadas

### ✅ 1. Corrigido parâmetro `senderUserId`
**Problema:** Modal passava `null` em vez do ID do usuário
**Solução:** Adicionado `useAuth()` e passando `user.uid`

### ✅ 2. Adicionados Logs de Debug
**Locais com logs:**
- `CollaborationModal.jsx` - Processo de envio
- `collaborationService.sendInvite()` - Salvamento no Firebase
- `collaborationService.findUserByClientCode()` - Busca de usuários
- `InviteNotifications.jsx` - Carregamento de convites

### ✅ 3. Removido OrderBy Temporariamente
**Problema:** Índices do Firestore podem não existir
**Solução:** Removido `orderBy('createdAt', 'desc')` para testar

### ✅ 4. Verificação de UserCode
**Problema:** Usuários podem não ter `userCode`
**Solução:** Função `ensureUserCode()` gera código se necessário

### ✅ 5. Melhor Feedback para Usuário
- Alert de sucesso ao enviar convite
- Botão "Meu código" no modal para debug
- Mensagens de erro mais detalhadas

## Como Testar

### 1. Abrir Console do Navegador
Pressione `F12` e vá na aba "Console" para ver os logs

### 2. Verificar Código do Usuário
1. Abra o modal "Convidar Colaborador"
2. Clique em "Meu código" no cabeçalho
3. Verifique se aparece um código (ex: `ABC12345`)

### 3. Testar Busca de Usuário
1. Digite um código no campo (use o código que você acabou de ver)
2. Clique em "Buscar"
3. Veja os logs no console:
   ```
   🔍 Buscando usuário com código: ABC12345
   📊 Resultado da busca - documentos encontrados: 1
   ✅ Usuário encontrado: {id: "...", name: "...", ...}
   ```

### 4. Testar Envio de Convite
1. Complete o processo até enviar o convite
2. Veja os logs:
   ```
   🔄 Enviando convite...
   💾 Dados que serão salvos: {...}
   ✅ Convite salvo com sucesso, ID: ...
   ```

### 5. Verificar Notificações
1. Faça logout e login com outra conta
2. Vá para "Gerenciar Páginas"
3. Veja os logs:
   ```
   🔄 InviteNotifications: Carregando convites...
   📊 InviteNotifications: Resultado: {success: true, data: [...]}
   📋 InviteNotifications: Convites pendentes: 1
   ```

## Possíveis Problemas e Soluções

### ❌ "Usuário não encontrado com este código"
**Causas:**
- Código digitado incorreto
- Usuário não tem `userCode`
- Usuário não existe

**Debug:**
1. Clique em "Meu código" para ver o formato correto
2. Verifique os logs de busca no console
3. Confirme se o usuário foi criado no sistema

### ❌ "Erro ao enviar convite"
**Causas:**
- Problemas de permissão no Firebase
- Dados incompletos
- Erro de conexão

**Debug:**
1. Verifique se `user.uid` está disponível
2. Confirme se `pageId` está sendo passado
3. Verifique os logs detalhados no console

### ❌ Convites não aparecem
**Causas:**
- Índices do Firestore não criados
- Query falhando
- Usuário não é o destinatário correto

**Debug:**
1. Verifique logs de `InviteNotifications`
2. Confirme se `targetUserId` = ID do usuário logado
3. Verifique se o status é 'pending'

## Comandos de Debug no Console

### Verificar dados do usuário atual:
```javascript
// No console do navegador
const auth = window.firebase?.auth?.();
console.log('User:', auth?.currentUser);
```

### Verificar coleção de convites:
```javascript
// No Firebase Console > Firestore
// Navegue para: collaboration_invites
// Verifique se há documentos com os dados corretos
```

### Forçar recarregamento:
```javascript
// No console do navegador
window.location.reload();
```

## Status das Correções

- ✅ Modal corrigido
- ✅ Logs adicionados
- ✅ Verificação de userCode
- ✅ Feedback melhorado
- ⚠️ Índices do Firestore (pode precisar criar)
- ⚠️ Teste com dados reais pendente

## Próximos Passos

1. **Teste com usuários reais** - Criar 2 contas e testar o fluxo completo
2. **Verificar índices** - Criar índices necessários no Firestore se needed
3. **Remover logs de debug** - Após confirmar que funciona
4. **Adicionar ordenação** - Reativar `orderBy` após criar índices

---

**Para reportar problemas:** Copie os logs do console e indique em qual etapa falhou.
