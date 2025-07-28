import React, { useState } from 'react';

const AttachedDocument = ({ document, onRemove, isReadOnly = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!document) return null;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'docx':
        return '📄';
      case 'txt':
        return '📝';
      case 'pdf':
        return '📕';
      default:
        return '📄';
    }
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
      {/* Header do documento */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getFileIcon(document.fileType)}</span>
            {document.index && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {document.index}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-blue-900 truncate">
              {document.index ? `Doc ${document.index}: ` : ''}{document.fileName}
            </h4>
            <div className="flex items-center space-x-3 text-xs text-blue-600 mt-1">
              <span>{formatFileSize(document.fileSize)}</span>
              <span>•</span>
              <span>{document.wordCount} palavras</span>
              <span>•</span>
              <span className="capitalize">{document.fileType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-2">
          {/* Botão expandir/recolher */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title={isExpanded ? 'Recolher' : 'Expandir'}
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Botão remover */}
          {!isReadOnly && onRemove && (
            <button
              onClick={() => onRemove(document.fileName)}
              className="text-red-500 hover:text-red-700 transition-colors"
              title="Remover documento"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="bg-white rounded p-3 text-sm text-gray-700 max-h-60 overflow-y-auto">
            <div className="whitespace-pre-wrap font-mono text-xs">
              {document.content}
            </div>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            <span>📊 Conteúdo completo: {document.content.length} caracteres</span>
          </div>
        </div>
      )}

      {/* Preview do conteúdo (quando não expandido) */}
      {!isExpanded && (
        <div className="mt-2 text-sm text-gray-600">
          <div className="bg-white rounded p-2 text-xs">
            {truncateContent(document.content)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachedDocument;
