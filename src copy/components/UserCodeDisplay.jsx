import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatUserCode } from '../services/userCodeService';

const UserCodeDisplay = ({ className = '', showLabel = true, inline = false }) => {
  const { userData } = useAuth();
  const [copied, setCopied] = useState(false);

  const userCode = userData?.userCode;
  const formattedCode = userCode ? formatUserCode(userCode) : null;

  // Função para copiar código
  const copyCode = async () => {
    if (!userCode) return;
    
    try {
      await navigator.clipboard.writeText(userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  if (!userCode) {
    return null; // Não exibir se não tiver código
  }

  if (inline) {
    return (
      <span 
        className={`font-mono text-sm font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition-colors ${className}`}
        onClick={copyCode}
        title="Clique para copiar"
      >
        {formattedCode}
      </span>
    );
  }

  return (
    <div className={`${className}`}>
      {showLabel && (
        <div className="text-sm text-gray-600 mb-1">
          {userData?.userType === 'advogado' ? 'Código do Advogado' : 'Código do Cliente'}
        </div>
      )}
      
      <div 
        className="flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={copyCode}
        title="Clique para copiar"
      >
        <span className="font-mono text-lg font-bold text-blue-600">
          {formattedCode}
        </span>
        
        <div className="flex items-center space-x-1">
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-green-600">Copiado!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-500">Copiar</span>
            </>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-1">
        Seu código único de identificação
      </div>
    </div>
  );
};

export default UserCodeDisplay;
