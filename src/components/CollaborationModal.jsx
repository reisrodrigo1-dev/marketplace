import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService } from '../firebase/firestore';

const CollaborationModal = ({ isOpen, onClose, pageId, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: buscar usuário, 2: configurar permissões
  const [clientCode, setClientCode] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [role, setRole] = useState('advogado');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  const roles = {
    owner: {
      label: 'Dono',
      description: 'Acesso total: clientes, agendamentos e financeiro',
      permissions: ['clients', 'appointments', 'financial']
    },
    lawyer: {
      label: 'Advogado',
      description: 'Acesso a agendamentos e clientes',
      permissions: ['clients', 'appointments']
    },
    intern: {
      label: 'Estagiário',
      description: 'Acesso a agendamentos e clientes',
      permissions: ['clients', 'appointments']
    },
    financial: {
      label: 'Financeiro',
      description: 'Acesso somente ao financeiro',
      permissions: ['financial']
    }
  };

  const handleSearchUser = async () => {
    if (!clientCode.trim()) {
      setError('Digite o código do cliente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Buscando usuário com código:', clientCode.trim());
      const result = await collaborationService.findUserByClientCode(clientCode.trim());
      
      console.log('📊 Resultado da busca:', result);
      
      if (result.success) {
        setTargetUser(result.data);
        setStep(2);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('💥 Erro ao buscar usuário:', error);
      setError('Erro ao buscar usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função de debug para verificar o código do usuário atual
  const checkCurrentUserCode = async () => {
    try {
      // Primeiro garantir que o usuário tem um userCode
      const ensureResult = await collaborationService.ensureUserCode(user.uid);
      console.log('🔧 Resultado ensureUserCode:', ensureResult);

      const { userService } = await import('../firebase/firestore');
      const result = await userService.getUser(user.uid);
      if (result.success) {
        setDebugInfo(result.data);
        console.log('🔍 Dados do usuário atual:', result.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!targetUser || !pageId) {
      setError('Dados incompletos');
      return;
    }

    if (!user?.uid) {
      setError('Usuário não está logado');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Enviando convite...', {
        senderUserId: user.uid,
        targetUserId: targetUser.id,
        targetUserEmail: targetUser.email,
        pageId,
        role,
        permissions: roles[role].permissions
      });

      console.log('👤 Dados completos do targetUser:', targetUser);

      const inviteData = {
        targetUserId: targetUser.id,
        recipientEmail: targetUser.email, // Adicionando email para facilitar busca
        pageId,
        role,
        permissions: roles[role].permissions,
        message: `Você foi convidado para colaborar como ${roles[role].label}`
      };

      const result = await collaborationService.sendInvite(user.uid, inviteData);
      
      console.log('📤 Resultado do envio de convite:', result);
      
      if (result.success) {
        alert(`✅ Convite enviado com sucesso para ${targetUser.name}!`);
        onSuccess && onSuccess();
        handleClose();
      } else {
        console.error('❌ Erro ao enviar convite:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('💥 Erro ao enviar convite:', error);
      setError('Erro ao enviar convite: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setClientCode('');
    setTargetUser(null);
    setRole('lawyer');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Convidar Colaborador
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={checkCurrentUserCode}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
              title="Ver meu código"
            >
              Meu código
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {debugInfo && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Seu código:</strong> <span className="font-mono">{debugInfo.userCode || 'Gerando...'}</span>
              {debugInfo.userCode && (
                <button
                  onClick={() => navigator.clipboard.writeText(debugInfo.userCode)}
                  className="ml-2 text-blue-600 hover:text-blue-700"
                  title="Copiar código"
                >
                  📋
                </button>
              )}
            </p>
          </div>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Cliente do Advogado
                </label>
                <input
                  type="text"
                  value={clientCode}
                  onChange={(e) => setClientCode(e.target.value)}
                  placeholder="Digite o código do cliente"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  O código do cliente pode ser encontrado no perfil do advogado
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSearchUser}
                  disabled={loading || !clientCode.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && targetUser && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Usuário Encontrado</h3>
                <p className="text-blue-800">
                  <strong>Nome:</strong> {targetUser.name}
                </p>
                <p className="text-blue-800">
                  <strong>Email:</strong> {targetUser.email}
                </p>
                <p className="text-blue-800">
                  <strong>Código:</strong> {targetUser.userCode}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nível de Acesso
                </label>
                <div className="space-y-3">
                  {Object.entries(roles).map(([roleKey, roleInfo]) => (
                    <label
                      key={roleKey}
                      className="flex items-start cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="role"
                        value={roleKey}
                        checked={role === roleKey}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {roleInfo.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {roleInfo.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar Convite'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborationModal;
