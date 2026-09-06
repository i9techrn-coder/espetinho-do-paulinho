import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { StoreProvider } from '../context/StoreContext';

export default function TenantLayout() {
  const { tenantSlug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      // Busca a loja pelo slug na URL (ex: /espetinhonordestino)
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .single();
      
      if (data) {
        setTenant(data);
      } else {
        console.error("Tenant não encontrado", error);
        setTenant(null);
      }
      setLoading(false);
    }
    
    if (tenantSlug) {
      loadTenant();
    }
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">
        <p className="text-xl animate-pulse">Carregando loja...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Loja não encontrada!</h1>
          <p>Verifique o link digitado.</p>
        </div>
      </div>
    );
  }

  // Se achou a loja, carrega o contexto injetando os dados do Tenant
  return (
    <StoreProvider tenant={tenant}>
      <Outlet />
    </StoreProvider>
  );
}
