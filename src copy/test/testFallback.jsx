// Teste manual para verificar a função generateSimpleFinalResult
import { generateSimpleFinalResult } from './simpleFallbackService.js';

// Dados de teste
const testPromptType = { name: 'Análise de PEC' };
const testCollectedData = [
  {
    question: 'Qual o número da PEC?',
    answer: 'PEC 2/2025'
  },
  {
    question: 'Qual o tema principal?',
    answer: 'Reforma do sistema eleitoral'
  },
  {
    question: 'Qual a sua análise?',
    answer: 'A PEC propõe mudanças significativas no processo eleitoral brasileiro.'
  }
];

// Executar teste
console.log('🧪 Iniciando teste da função generateSimpleFinalResult...');

const result = generateSimpleFinalResult(testPromptType, testCollectedData);

console.log('📊 Resultado do teste:');
console.log('Success:', result.success);
console.log('IsFallback:', result.isFallback);
console.log('Message length:', result.message?.length || 0);
console.log('Message preview:', result.message?.substring(0, 200) + '...');

if (result.success) {
  console.log('✅ Teste passou! A função está funcionando corretamente.');
} else {
  console.log('❌ Teste falhou!');
}

export default function TestResult() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Teste da Função generateSimpleFinalResult</h3>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
