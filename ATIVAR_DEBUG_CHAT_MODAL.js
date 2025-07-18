// ATIVAR DEBUG E TESTAR CHAT CREATION MODAL
// Execute no console ANTES de abrir "Novo Chat"

console.log('🔧 ATIVANDO DEBUG PARA CHAT CREATION MODAL');
console.log('==========================================');

// 1. Ativar debug
window.DEBUG_PROMPTS = true;
console.log('✅ Debug ativado');

// 2. Força recarregar page se já estiver no modal
if (window.location.reload) {
  console.log('🔄 Recarregando página para garantir que debug seja aplicado...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
} else {
  // 3. Instruções
  console.log('\n📝 INSTRUÇÕES PARA TESTE:');
  console.log('========================');
  console.log('1. ✅ Debug já está ativo');
  console.log('2. Vá para Dashboard > Juri.IA');
  console.log('3. Clique em "Novo Chat"');
  console.log('4. Procure pelo prompt "Réplica"');
  console.log('5. Observe os logs de debug no console');
  console.log('6. Verifique se aparece o badge "Documento obrigatório"');

  console.log('\n🔍 LOGS ESPERADOS:');
  console.log('• 🔍 DEBUG ChatCreationModal - getDocumentInfo para Réplica');
  console.log('• ✅ DocumentInfo criado para Réplica');
  console.log('• Badge vermelho "📄 Documento obrigatório" visível');

  console.log('\n❌ SE NÃO APARECER:');
  console.log('• Verifique se os logs de debug aparecem');
  console.log('• Se não aparecer log, o prompt pode ter ID diferente');
  console.log('• Se aparecer log mas não badge, é problema de CSS/render');

  // 4. Função para desativar debug
  window.disableDebug = function() {
    window.DEBUG_PROMPTS = false;
    console.log('❌ Debug desativado');
  };

  console.log('\n💡 Para desativar debug depois: window.disableDebug()');
}
