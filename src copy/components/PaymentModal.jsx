import React, { useState } from 'react';
import { appointmentService } from '../firebase/firestore';

const PaymentModal = ({ isOpen, onClose, appointment, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentGenerated, setPaymentGenerated] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [showLgpdDetails, setShowLgpdDetails] = useState(false);

  if (!isOpen || !appointment) return null;

  // Função auxiliar para formatar data de forma robusta
  const formatAppointmentDate = (appointmentDate) => {
    try {
      if (!appointmentDate) return 'Data não informada';
      
      let date;
      
      // Se for um Firestore Timestamp
      if (appointmentDate && typeof appointmentDate.toDate === 'function') {
        date = appointmentDate.toDate();
      } else {
        // Se for uma string ou Date object
        date = new Date(appointmentDate);
      }
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data do agendamento:', error);
      return 'Data inválida';
    }
  };

  // Simular geração de pagamento (em produção, integrar com gateway real)
  const generatePayment = async (method) => {
    // Verificar consentimento LGPD antes de prosseguir
    if (!lgpdConsent) {
      alert('Para prosseguir com o pagamento, é necessário aceitar os termos de uso de dados pessoais.');
      return;
    }

    setLoading(true);
    
    try {
      // Simular chamada para API de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let paymentInfo = {
        paymentMethod: method,
        paymentAmount: appointment.finalPrice,
        paymentLink: '',
        paymentCode: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      };

      switch (method) {
        case 'pix':
          paymentInfo.paymentLink = `pix://pay?amount=${appointment.finalPrice}&message=Consulta%20Juridica`;
          paymentInfo.paymentCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}5204000053039865802BR5925DIREITO HUB CONSULTORIA6009SAO PAULO62070503***6304`;
          break;
        case 'boleto':
          paymentInfo.paymentLink = `https://www.bb.com.br/pbb/pagina-inicial/bb-code/boleto/${Math.random().toString(36).substring(2, 15)}`;
          paymentInfo.paymentCode = `${Math.random().toString().substring(2, 17)}`;
          break;
        case 'credit_card':
          paymentInfo.paymentLink = `https://checkout.pagseguro.uol.com.br/payment/${Math.random().toString(36).substring(2, 15)}`;
          break;
      }

      // Salvar dados do pagamento
      const result = await appointmentService.generatePaymentLink(appointment.id, paymentInfo);
      
      if (result.success) {
        setPaymentData(paymentInfo);
        setPaymentGenerated(true);
      } else {
        alert('Erro ao gerar pagamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao gerar pagamento:', error);
      alert('Erro ao gerar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Simular confirmação de pagamento
  const simulatePayment = async () => {
    setLoading(true);
    
    try {
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const result = await appointmentService.confirmPayment(appointment.id, {
        transactionId,
        paidAt: new Date(),
        lgpdConsent: lgpdConsent,
        lgpdConsentDate: new Date()
      });
      
      if (result.success) {
        alert('Pagamento confirmado com sucesso!');
        onPaymentSuccess();
        onClose();
      } else {
        alert('Erro ao confirmar pagamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      alert('Erro ao confirmar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const formatPrice = (price) => {
    return `R$ ${parseFloat(price).toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Pagamento da Consulta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Informações do Agendamento */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Detalhes da Consulta</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><strong>Advogado:</strong> {appointment.lawyerName}</p>
              <p><strong>Data:</strong> {formatAppointmentDate(appointment.appointmentDate)}</p>
              <p><strong>Valor:</strong> {formatPrice(appointment.finalPrice)}</p>
            </div>
          </div>

          {!paymentGenerated ? (
            /* Seleção do Método de Pagamento */
            <div className="space-y-4">
              {/* Informação sobre agenda automática */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <h4 className="font-semibold mb-1">Após o pagamento:</h4>
                    <ul className="space-y-1">
                      <li>• A consulta será automaticamente adicionada à agenda do advogado</li>
                      <li>• Suas informações serão salvas na base de clientes do advogado</li>
                      <li>• O advogado poderá exportar o evento para sua agenda pessoal</li>
                      <li>• Você receberá acesso ao link da videochamada</li>
                      <li>• Poderá adicionar o evento à sua agenda pessoal</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Escolha a forma de pagamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* PIX */}
                <button
                  onClick={() => setSelectedMethod('pix')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    selectedMethod === 'pix'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔄</div>
                    <h4 className="font-semibold text-gray-900">PIX</h4>
                    <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                  </div>
                </button>

                {/* Boleto */}
                <button
                  onClick={() => setSelectedMethod('boleto')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    selectedMethod === 'boleto'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📄</div>
                    <h4 className="font-semibold text-gray-900">Boleto</h4>
                    <p className="text-sm text-gray-600">Vence em 3 dias úteis</p>
                  </div>
                </button>

                {/* Cartão de Crédito */}
                <button
                  onClick={() => setSelectedMethod('credit_card')}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    selectedMethod === 'credit_card'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">💳</div>
                    <h4 className="font-semibold text-gray-900">Cartão</h4>
                    <p className="text-sm text-gray-600">Crédito ou débito</p>
                  </div>
                </button>
              </div>

              {/* Consentimento LGPD */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-800 mb-2">Consentimento para Uso de Dados Pessoais</h4>
                    <p className="text-sm text-yellow-700 mb-3">
                      Para processar o pagamento e fornecer nossos serviços, suas informações pessoais (nome, email e telefone) 
                      serão inseridas na base de clientes do advogado para:
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1 mb-3 pl-4">
                      <li>• Gestão e acompanhamento do seu histórico de consultas</li>
                      <li>• Comunicação sobre agendamentos e serviços jurídicos</li>
                      <li>• Melhoria da qualidade do atendimento</li>
                      <li>• Cumprimento de obrigações legais e contratuais</li>
                    </ul>
                    <button
                      onClick={() => setShowLgpdDetails(!showLgpdDetails)}
                      className="text-sm text-yellow-800 underline hover:text-yellow-900"
                    >
                      {showLgpdDetails ? 'Ocultar' : 'Ver'} detalhes sobre proteção de dados
                    </button>
                    
                    {showLgpdDetails && (
                      <div className="mt-3 p-3 bg-yellow-100 rounded border text-sm text-yellow-800">
                        <h5 className="font-medium mb-2">Seus Direitos (LGPD):</h5>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>Acesso:</strong> Consultar seus dados pessoais armazenados</li>
                          <li>• <strong>Correção:</strong> Solicitar correção de dados incorretos</li>
                          <li>• <strong>Exclusão:</strong> Solicitar remoção dos seus dados</li>
                          <li>• <strong>Portabilidade:</strong> Obter cópia dos seus dados</li>
                          <li>• <strong>Oposição:</strong> Contestar o tratamento dos seus dados</li>
                        </ul>
                        <p className="mt-2 text-xs">
                          <strong>Responsável pelo tratamento:</strong> {appointment.lawyerName}<br/>
                          <strong>Base legal:</strong> Execução de contrato e legítimo interesse<br/>
                          <strong>Retenção:</strong> Dados mantidos conforme legislação aplicável
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkbox de Consentimento */}
              <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  id="lgpdConsent"
                  checked={lgpdConsent}
                  onChange={(e) => setLgpdConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="lgpdConsent" className="text-sm text-gray-700 cursor-pointer">
                  <strong>Declaro que li e aceito</strong> que meus dados pessoais sejam inseridos na base de clientes 
                  do advogado {appointment.lawyerName} para os fins descritos acima. Estou ciente dos meus direitos 
                  conforme a Lei Geral de Proteção de Dados (LGPD) e que posso revogar este consentimento a qualquer momento.
                </label>
              </div>

              <button
                onClick={() => generatePayment(selectedMethod)}
                disabled={!selectedMethod || !lgpdConsent || loading}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gerando pagamento...' : 'Aceitar e Gerar Pagamento'}
              </button>
            </div>
          ) : (
            /* Dados do Pagamento Gerado */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamento Gerado!</h3>
                <p className="text-gray-600">Use os dados abaixo para efetuar o pagamento</p>
              </div>

              {paymentData.paymentMethod === 'pix' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Pagamento via PIX</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-green-700">Código PIX:</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 bg-white p-2 rounded border text-xs break-all">
                          {paymentData.paymentCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentData.paymentCode)}
                          className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-green-600">
                      Cole este código no seu app bancário ou escaneie o QR Code
                    </p>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === 'boleto' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Boleto Bancário</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Código de Barras:</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="flex-1 bg-white p-2 rounded border text-xs">
                          {paymentData.paymentCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentData.paymentCode)}
                          className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                    <a
                      href={paymentData.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Baixar Boleto
                    </a>
                    <p className="text-xs text-blue-600">
                      Vencimento: {paymentData.expiresAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === 'credit_card' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Cartão de Crédito/Débito</h4>
                  <div className="space-y-3">
                    <p className="text-sm text-purple-700">
                      Clique no link abaixo para acessar a página segura de pagamento:
                    </p>
                    <a
                      href={paymentData.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      Pagar com Cartão
                    </a>
                  </div>
                </div>
              )}

              {/* Botão para simular pagamento (apenas para demo) */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800">Modo Demonstração</h4>
                    <p className="text-sm text-yellow-700 mt-1 mb-3">
                      Para testar o sistema, clique no botão abaixo para simular o pagamento:
                    </p>
                    <button
                      onClick={simulatePayment}
                      disabled={loading}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      {loading ? 'Processando...' : 'Simular Pagamento Aprovado'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
