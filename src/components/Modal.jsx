import React from "react";

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 md:p-10 relative animate-fade-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="Fechar modal"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-bold mb-4 text-blue-900">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
