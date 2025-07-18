import React, { useState } from 'react';
import { formatUserCode } from '../services/userCodeService';

const ClientCodeDisplay = ({ clientCode, clientName, className = '', size = 'normal' }) => {
  const [copied, setCopied] = useState(false);

  if (!clientCode) {
    return (
      <div className={`text-gray-400 text-sm italic ${className}`}>
        Código não disponível
      </div>
    );
  }

  const formattedCode = formatUserCode(clientCode);

  // Função para copiar código
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(clientCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  const sizeClasses = {
    small: {
      code: 'text-sm font-mono',
      label: 'text-xs',
      icon: 'w-3 h-3'
    },
    normal: {
      code: 'text-base font-mono',
      label: 'text-sm',
      icon: 'w-4 h-4'
    },
    large: {
      code: 'text-lg font-mono',
      label: 'text-base',
      icon: 'w-5 h-5'
    }
  };

  const classes = sizeClasses[size] || sizeClasses.normal;

  return (
    <div className={className}>
      <div className={`text-gray-600 mb-1 ${classes.label}`}>
        Código do Cliente {clientName && `(${clientName})`}
      </div>
      
      <div 
        className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={copyCode}
        title="Clique para copiar código do cliente"
      >
        <span className={`font-bold text-blue-600 ${classes.code}`}>
          {formattedCode}
        </span>
        
        <div className="flex items-center space-x-1">
          {copied ? (
            <>
              <svg className={`text-green-500 ${classes.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-green-600 ${classes.label}`}>Copiado!</span>
            </>
          ) : (
            <>
              <svg className={`text-gray-400 ${classes.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className={`text-gray-500 ${classes.label}`}>Copiar</span>
            </>
          )}
        </div>
      </div>
      
      <div className={`text-gray-500 mt-1 ${classes.label}`}>
        Código único de identificação do cliente
      </div>
    </div>
  );
};

export default ClientCodeDisplay;
