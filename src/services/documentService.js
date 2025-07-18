// Serviço para leitura e processamento de documentos
import mammoth from 'mammoth';
import { requiresMandatoryDocument, canBenefitFromDocument, getDocumentRequestMessage } from './promptDocumentConfig.js';

// Verificar se estamos no browser ou Node.js
const isBrowser = typeof window !== 'undefined';

// Função para ler arquivos de texto simples
const readTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'utf-8');
  });
};

// Função para ler arquivos Word (.docx)
const readWordFile = async (file) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Erro ao ler arquivo Word:', error);
    throw new Error('Erro ao processar arquivo Word. Certifique-se de que é um arquivo .docx válido.');
  }
};

// Função para ler PDFs no browser (implementação simplificada temporária)
const readPDFFile = async (file) => {
  console.log('🔍 Processando PDF:', file.name);
  
  // Implementação temporária simplificada
  // TODO: Implementar extração real de PDF quando resolver problemas com PDF.js
  
  const fileName = file.name;
  const fileSize = Math.round(file.size / 1024);
  
  return `📕 DOCUMENTO PDF CARREGADO: ${fileName}

📊 INFORMAÇÕES DO ARQUIVO:
• Nome: ${fileName}
• Tamanho: ${fileSize}KB
• Tipo: PDF

⚠️ AVISO TEMPORÁRIO:
Este PDF foi carregado com sucesso, mas a extração automática de texto está temporariamente limitada.

🔧 PARA MELHOR RESULTADO:
1. Converta o PDF para formato .txt ou .docx
2. Ou copie e cole o conteúdo principal do PDF em um arquivo .txt
3. Isso garantirá que todo o conteúdo seja processado corretamente pela IA

📝 CONTEÚDO PARA A RÉPLICA:
Por favor, descreva brevemente o conteúdo deste PDF ou forneça o texto principal em formato adicional.

✅ O arquivo foi aceito e o fluxo da Réplica pode continuar.`;
};

// Função principal para processar qualquer tipo de documento
export const processDocument = async (file) => {
  if (!file) {
    throw new Error('Nenhum arquivo fornecido');
  }

  const fileExtension = file.name.toLowerCase().split('.').pop();
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
  }

  let content = '';
  
  try {
    switch (fileExtension) {
      case 'txt':
        content = await readTextFile(file);
        break;
      
      case 'docx':
        content = await readWordFile(file);
        break;
      
      case 'doc':
        throw new Error('Arquivos .doc não são suportados. Converta para .docx ou .txt');
      
      case 'pdf':
        content = await readPDFFile(file);
        break;
      
      default:
        throw new Error(`Tipo de arquivo não suportado: .${fileExtension}. Use: .txt, .docx, .pdf`);
    }

    // Validar conteúdo extraído
    if (!content || content.trim().length === 0) {
      throw new Error('O documento está vazio ou não pôde ser lido');
    }

    // Limitar tamanho do conteúdo
    const maxContentLength = 50000; // 50k caracteres
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength) + '\n\n[DOCUMENTO TRUNCADO - MUITO LONGO]';
    }

    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension,
      content: content.trim(),
      wordCount: content.trim().split(/\s+/).length
    };

  } catch (error) {
    console.error('Erro ao processar documento:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido ao processar documento'
    };
  }
};

// Função para validar se um prompt específico precisa de documentos
export const promptRequiresDocument = (promptType) => {
  return requiresMandatoryDocument(promptType?.id, promptType?.name);
};

// Função para verificar se prompt pode se beneficiar de documentos
export const promptCanBenefitFromDocument = (promptType) => {
  return canBenefitFromDocument(promptType?.id, promptType?.name);
};

// Função para gerar mensagem solicitando documento
export const generateDocumentRequestMessage = (promptType) => {
  return getDocumentRequestMessage(promptType);
};

// Função para gerar mensagem de documento para mensagem inicial
export const generateInitialDocumentMessage = (promptType) => {
  const promptName = promptType?.name || '';
  const promptId = (promptType?.id || '').toLowerCase();
  
  // Mensagens específicas mais diretas para a mensagem inicial
  if (promptId.includes('laudo') || promptId.includes('medico')) {
    return `📋 **DOCUMENTO NECESSÁRIO:** Para analisar laudos médicos, você precisará anexar o documento durante nossa conversa. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('pec')) {
    return `📜 **DOCUMENTO NECESSÁRIO:** Para analisar a PEC, você precisará anexar o texto completo da proposta. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('correcao') || promptId.includes('corrigir')) {
    return `✏️ **DOCUMENTO NECESSÁRIO:** Para corrigir seu texto, você precisará anexar o documento original. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('memoriais')) {
    return `📝 **DOCUMENTO NECESSÁRIO:** Para elaborar memoriais, você precisará anexar as peças processuais relevantes. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('resumir') || promptId.includes('resumo')) {
    return `📋 **DOCUMENTO NECESSÁRIO:** Para criar um resumo, você precisará anexar os documentos do processo. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('relatorio')) {
    return `📊 **DOCUMENTO NECESSÁRIO:** Para elaborar o relatório, você precisará anexar os documentos base. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('contradicoes') || promptId.includes('encontrar')) {
    return `🔍 **DOCUMENTO NECESSÁRIO:** Para encontrar contradições, você precisará anexar os depoimentos ou documentos a serem analisados. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('rebater') || promptId.includes('acrescentar')) {
    return `⚖️ **DOCUMENTO NECESSÁRIO:** Para trabalhar com argumentos, você precisará anexar a peça original. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('ementa')) {
    return `🏛️ **DOCUMENTO NECESSÁRIO:** Para elaborar a ementa, você precisará anexar a decisão judicial. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('dosimetria')) {
    return `⚖️ **DOCUMENTO NECESSÁRIO:** Para análise de dosimetria, você precisará anexar os documentos do processo criminal. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('replica')) {
    return `📝 **DOCUMENTO NECESSÁRIO:** Para elaborar uma réplica eficaz, você precisará anexar a contestação da parte contrária. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('contrarrazoes')) {
    return `⚖️ **DOCUMENTO NECESSÁRIO:** Para elaborar contrarrazões, você precisará anexar o recurso da parte contrária. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('razoes-rese')) {
    return `📋 **DOCUMENTO NECESSÁRIO:** Para fundamentar o Recurso Especial, você precisará anexar o acórdão recorrido. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  if (promptId.includes('despacho-judicial')) {
    return `⚖️ **DOCUMENTO NECESSÁRIO:** Para elaborar o despacho, você precisará anexar as petições das partes. Aceito arquivos .txt e .docx (máximo 10MB).`;
  }
  
  // Mensagem genérica para outros tipos que requerem documento
  return `📄 **DOCUMENTO NECESSÁRIO:** Para realizar ${promptName}, você precisará anexar o documento relacionado durante nossa conversa. Aceito arquivos .txt e .docx (máximo 10MB).`;
};

export default {
  processDocument,
  promptRequiresDocument,
  promptCanBenefitFromDocument,
  generateDocumentRequestMessage,
  generateInitialDocumentMessage
};
