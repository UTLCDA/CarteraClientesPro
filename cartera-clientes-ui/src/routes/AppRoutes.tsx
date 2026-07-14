import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ClientesList from '../pages/ClientesList';
import ClienteFormPage from '../pages/ClienteFormPage';
import ClienteDetailPage from '../pages/ClienteDetailPage';
import VentasList from '../pages/VentasList';
import VentaFormPage from '../pages/VentaFormPage';
import VentaDetailPage from '../pages/VentaDetailPage';
import PagosList from '../pages/PagosList';
import PagoFormPage from '../pages/PagoFormPage';
import RecordatoriosList from '../pages/RecordatoriosList';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/clientes" element={<ClientesList />} />
      <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
      <Route path="/clientes/editar/:id" element={<ClienteFormPage />} />
      <Route path="/clientes/:id" element={<ClienteDetailPage />} />
      <Route path="/ventas" element={<VentasList />} />
      <Route path="/ventas/nueva" element={<VentaFormPage />} />
      <Route path="/ventas/:id" element={<VentaDetailPage />} />
      <Route path="/pagos" element={<PagosList />} />
      <Route path="/pagos/nuevo" element={<PagoFormPage />} />
      <Route path="/recordatorios" element={<RecordatoriosList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
