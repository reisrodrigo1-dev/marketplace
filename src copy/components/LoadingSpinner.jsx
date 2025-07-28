import React from 'react';

const LoadingSpinner = ({ message = "Carregando...", size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center space-y-4">
        <div className={`animate-spin rounded-full border-b-2 border-purple-600 ${sizeClasses[size]}`}></div>
        <div className="text-center">
          <p className="text-gray-600 font-medium">{message}</p>
          <p className="text-sm text-gray-500 mt-1">Aguarde um momento...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
