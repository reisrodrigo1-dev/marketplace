// ATIVAR DEBUG E TESTAR RÉPLICA
// Execute no console do navegador na página Juri.IA

// 1. Ativar debug
window.DEBUG_PROMPTS = true;
console.log('✅ Debug de prompts ativado');

// 2. Instruções para teste
console.log('📝 AGORA FAÇA O TESTE MANUAL:');
console.log('============================');
console.log('1. Vá para Dashboard > Juri.IA');
console.log('2. Clique em "Novo Chat"');
console.log('3. Digite "réplica" ou procure "Réplica"');
console.log('4. Selecione o prompt "Réplica"');
console.log('5. Observe os logs de debug no console');
console.log('6. Verifique se aparece a solicitação de documento');

console.log('\n🔍 SE NÃO APARECER O UPLOAD:');
console.log('• Verifique os logs para ver onde está falhando');
console.log('• O sistema deveria detectar que Réplica precisa de documento');
console.log('• Deveria exibir automaticamente o campo de upload');

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('• Logs de debug mostrando a detecção');
console.log('• Campo de upload de documento visível');
console.log('• Mensagem explicando que precisa da contestação');

// 3. Função para desativar debug depois
window.disableDebug = function() {
  window.DEBUG_PROMPTS = false;
  console.log('❌ Debug de prompts desativado');
};
