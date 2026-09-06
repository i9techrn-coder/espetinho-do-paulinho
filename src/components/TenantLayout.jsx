import React, { useEffect, useState } from 'react';
import { Outlet, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { StoreProvider } from '../context/StoreContext';
import { XCircle, Clock, Lock, MessageCircle } from 'lucide-react';

const PAULO_WHATSAPP = '5584999999999'; // Trocar pelo WhatsApp real do Paulo

export default function TenantLayout() {
  const { tenantSlug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState('ok'); // 'ok', 'trial_expired', 'blocked', 'not_found'

  useEffect(() => {
    async function loadTenant() {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', tenantSlug)
        .single();
      
      if (!data) {
        console.error("Tenant não encontrado", error);
        setAccessStatus('not_found');
        setLoading(false);
        return;
      }

      const now = new Date();

      // Verificar status de acesso
      if (data.status === 'blocked') {
        setTenant(data);
        setAccessStatus('blocked');
      } else if (data.status === 'trial') {
        const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
        if (trialEnd && trialEnd < now) {
          setTenant(data);
          setAccessStatus('trial_expired');
        } else {
          setTenant(data);
          setAccessStatus('ok');
        }
      } else if (data.status === 'active') {
        const approvedEnd = data.approved_until ? new Date(data.approved_until) : null;
        if (approvedEnd && approvedEnd < now) {
          setTenant(data);
          setAccessStatus('blocked');
        } else {
          setTenant(data);
          setAccessStatus('ok');
        }
      } else {
        // Fallback: se não tem status, libera (compatibilidade)
        setTenant(data);
        setAccessStatus('ok');
      }

      setLoading(false);
    }
    
    if (tenantSlug) {
      loadTenant();
    }
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 animate-pulse">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="text-center max-w-md">
          <XCircle className="text-red-500 mx-auto mb-4" size={56} />
          <h1 className="text-3xl font-black text-white mb-2">Loja não encontrada!</h1>
          <p className="text-zinc-500 mb-6">O link <span className="text-zinc-300 font-mono">/{tenantSlug}</span> não existe.</p>
          <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-2xl transition-all text-sm uppercase tracking-widest">
            Voltar para o início
          </Link>
        </div>
      </div>
    );
  }

  if (accessStatus === 'trial_expired') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="text-center max-w-md">
          <Clock className="text-orange-400 mx-auto mb-4" size={56} />
          <h1 className="text-3xl font-black text-white mb-2">Trial Expirado</h1>
          <p className="text-zinc-400 mb-2">O período de teste de <strong className="text-white">{tenant?.name}</strong> terminou.</p>
          <p className="text-zinc-500 text-sm mb-6">Entre em contato para ativar sua assinatura e continuar usando o sistema.</p>
          <a
            href={`https://wa.me/${PAULO_WHATSAPP}?text=${encodeURIComponent(`Olá! Sou ${tenant?.responsible_name || 'responsável'} do ${tenant?.name}. Meu trial acabou e quero ativar minha assinatura.`)}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all text-sm uppercase tracking-widest inline-flex items-center gap-3"
          >
            <MessageCircle size={20} /> FALAR COM SUPORTE
          </a>
        </div>
      </div>
    );
  }

  if (accessStatus === 'blocked') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="text-center max-w-md">
          <Lock className="text-red-500 mx-auto mb-4" size={56} />
          <h1 className="text-3xl font-black text-white mb-2">Acesso Suspenso</h1>
          <p className="text-zinc-400 mb-2">O acesso de <strong className="text-white">{tenant?.name}</strong> está suspenso.</p>
          <p className="text-zinc-500 text-sm mb-6">Entre em contato para regularizar sua situação.</p>
          <a
            href={`https://wa.me/${PAULO_WHATSAPP}?text=${encodeURIComponent(`Olá! Sou ${tenant?.responsible_name || 'responsável'} do ${tenant?.name}. Meu acesso está suspenso e quero regularizar.`)}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-2xl transition-all text-sm uppercase tracking-widest inline-flex items-center gap-3"
          >
            <MessageCircle size={20} /> FALAR COM SUPORTE
          </a>
        </div>
      </div>
    );
  }

  return (
    <StoreProvider tenant={tenant}>
      <Outlet />
    </StoreProvider>
  );
}
