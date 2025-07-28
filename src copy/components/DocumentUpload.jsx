import React, { useRef, useState } from 'react';
import { processDocument } from '../services/documentService';

const DocumentUpload = ({ onDocumentProcessed, isLoading, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (file) => {
    if (!file || isProcessing || disabled) return;

    setIsProcessing(true);
    
    try {
      const result = await processDocument(file);
      
      if (result.success) {
        onDocumentProcessed({
          fileName: result.fileName,
          content: result.content,
          fileSize: result.fileSize,
          fileType: result.fileType,
          wordCount: result.wordCount
        });
      } else {
        // Notificar erro ao componente pai
        onDocumentProcessed({
          error: result.error
        });
      }
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      onDocumentProcessed({
        error: 'Erro inesperado ao processar documento: ' + error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
    // Limpar input para permitir seleção do mesmo arquivo novamente
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isProcessing) return;

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleButtonClick = () => {
    if (!disabled && !isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isDisabled = disabled || isLoading || isProcessing;

  return (
    <div className="w-full">
      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.docx,.doc,.pdf"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isDisabled}
      />

      {/* Área de drop */}
      <div
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
          transition-all duration-200 min-h-[100px] flex flex-col items-center justify-center
          ${isDragOver
            ? 'border-purple-400 bg-purple-50'
            : isDisabled
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }
        `}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600">Processando documento...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <svg
              className={`w-8 h-8 ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="text-center">
              <p className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                {isDragOver
                  ? 'Solte o arquivo aqui'
                  : 'Clique para selecionar ou arraste um documento'
                }
              </p>
              <p className={`text-xs mt-1 ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}>
                Arquivos aceitos: .txt, .docx, .pdf (máx. 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botão de anexo alternativo */}
      <button
        onClick={handleButtonClick}
        disabled={isDisabled}
        className={`
          mt-2 inline-flex items-center px-3 py-1 text-xs font-medium rounded-md
          transition-colors duration-200
          ${isDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }
        `}
        title="Anexar documento"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        📎 Anexar Documento
      </button>
    </div>
  );
};

export default DocumentUpload;
