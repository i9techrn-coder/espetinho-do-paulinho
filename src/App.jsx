import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import WaiterDashboard from './pages/WaiterDashboard';
import CustomerMenu from './pages/CustomerMenu';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <Router>
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Cliente: / */}
            <Route path="/" element={<CustomerMenu />} />
            
            {/* Garçom: /garcon */}
            <Route path="/garcon" element={
              <ProtectedRoute allowedRoles={['Garçom', 'Balconista', 'Gestor']}>
                <WaiterDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin: /admin/* (handles sidebar subroutes) */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['Gestor']}>
                <AdminPanel />
              </ProtectedRoute>
            } />

            {/* Default redirect to Client */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StoreProvider>
    </ThemeProvider>
  );
}
