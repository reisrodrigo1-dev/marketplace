
import React, { useState, useEffect } from 'react';
import AppointmentModal from './AppointmentModal';
import { appointmentService } from '../firebase/firestore';

const SalesWebPage = ({ salesData, isPreview = false }) => {
  const [appointmentModal, setAppointmentModal] = useState({
    isOpen: false,
    selectedDate: null,
    selectedTime: null
  });
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    if (salesData?.userId && !isPreview) {
      loadOccupiedSlots();
    } else {
      setLoadingSlots(false);
    }
  }, [salesData?.userId, isPreview]);

  const loadOccupiedSlots = async () => {
    try {
      setLoadingSlots(true);
      const result = await appointmentService.getAppointmentsByLawyer(salesData.userId);
      if (result.success) {
        const activeAppointments = result.data.filter(appointment =>
          appointment.status === 'pendente' ||
          appointment.status === 'aguardando_pagamento' ||
          appointment.status === 'pago' ||
          appointment.status === 'confirmado'
        );
        const slots = activeAppointments.map(appointment => {
          try {
            return {
              date: appointment.data,
              time: appointment.horario
            };
          } catch {
            return null;
          }
        }).filter(Boolean);
        setOccupiedSlots(slots);
      }
    } catch (error) {
      setOccupiedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const openAppointmentModal = (date, time) => {
    setAppointmentModal({ isOpen: true, selectedDate: date, selectedTime: time });
  };
  const closeAppointmentModal = () => {
    setAppointmentModal({ isOpen: false, selectedDate: null, selectedTime: null });
  };

  // Processamento dos dados de vendas para exibição
  const processedSalesData = salesData || {};
  const nomePagina = processedSalesData.nomePagina || 'Minha Página de Vendas';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ...aqui vai o conteúdo principal da página de vendas, similar ao LawyerWebPage... */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {nomePagina}. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Página criada com DireitoHub
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SalesWebPage;
