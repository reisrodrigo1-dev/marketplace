// Página de Vendas duplicada da LawyerPagesManager
import React from 'react';
import SalesPagesManager from './SalesPagesManager';

export default function SalesPageManager(props) {
  // Duplicação direta para futura customização
  return <SalesPagesManager {...props} />;
}
