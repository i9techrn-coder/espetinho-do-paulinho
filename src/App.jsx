import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import WaiterDashboard from './pages/WaiterDashboard';
import CustomerMenu from './pages/CustomerMenu';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import TenantLayout from './components/TenantLayout';
import LandingPage from './pages/LandingPage';
import SuperAdmin from './pages/SuperAdmin';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Landing Page do SaaS Espeto Fácil */}
          <Route path="/" element={<LandingPage />} />

          {/* Super Admin (Paulo) */}
          <Route path="/superadmin" element={<SuperAdmin />} />

          {/* Rotas de Inquilinos (Clientes do SaaS) */}
          <Route path="/:tenantSlug" element={<TenantLayout />}>
            {/* Cliente Final */}
            <Route index element={<CustomerMenu />} />
            
            {/* Login da Equipe */}
            <Route path="login" element={<Login />} />
            
            {/* Garçom */}
            <Route path="garcon" element={
              <ProtectedRoute allowedRoles={['Garçom', 'Balconista', 'Gestor']}>
                <WaiterDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin */}
            <Route path="admin/*" element={
              <ProtectedRoute allowedRoles={['Gestor']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Route>

          {/* Rota não encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
