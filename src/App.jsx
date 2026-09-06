import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import WaiterDashboard from './pages/WaiterDashboard';
import CustomerMenu from './pages/CustomerMenu';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import TenantLayout from './components/TenantLayout';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Landing Page do SaaS Espeto Fácil */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white p-8 text-center">
              <h1 className="text-4xl font-bold mb-4">Espeto Fácil</h1>
              <p className="text-zinc-400 max-w-md">O melhor sistema SaaS para gestão da sua espetaria. Acesse o link exclusivo da sua loja.</p>
            </div>
          } />

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
