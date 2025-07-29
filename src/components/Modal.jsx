import React from "react";

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative animate-fade-in">
        <div className="flex-shrink-0 p-6 border-b border-gray-200">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
          {title && <h2 className="text-xl font-bold text-blue-900 pr-8">{title}</h2>}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
