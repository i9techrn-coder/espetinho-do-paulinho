import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Lock, CheckCircle, XCircle, Clock, ArrowRight, LogOut, RefreshCw, Users, Store } from 'lucide-react';

const SUPER_ADMIN_PASSWORD = 'espetofacil2025';

export default function SuperAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SUPER_ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (data) setTenants(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchTenants();
  }, [isLoggedIn]);

  const approveMonth = async (tenant) => {
    const now = new Date();
    const base = tenant.approved_until ? new Date(tenant.approved_until) : now;
    const newDate = new Date(Math.max(base.getTime(), now.getTime()));
    newDate.setDate(newDate.getDate() + 30);

    await supabase.from('tenants').update({
      status: 'active',
      approved_until: newDate.toISOString()
    }).eq('id', tenant.id);
    
    fetchTenants();
  };

  const blockTenant = async (tenant) => {
    await supabase.from('tenants').update({ status: 'blocked' }).eq('id', tenant.id);
    fetchTenants();
  };

  const reactivateTenant = async (tenant) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 30);
    await supabase.from('tenants').update({
      status: 'active',
      approved_until: newDate.toISOString()
    }).eq('id', tenant.id);
    fetchTenants();
  };

  const getStatusBadge = (tenant) => {
    const now = new Date();
    if (tenant.status === 'blocked') return { label: 'BLOQUEADO', color: 'bg-red-500/20 text-red-400' };
    if (tenant.status === 'trial') {
      const trialEnd = new Date(tenant.trial_ends_at);
      if (trialEnd < now) return { label: 'TRIAL EXPIRADO', color: 'bg-orange-500/20 text-orange-400' };
      const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      return { label: `TRIAL (${daysLeft}d)`, color: 'bg-blue-500/20 text-blue-400' };
    }
    if (tenant.status === 'active') {
      if (tenant.approved_until) {
        const approvedEnd = new Date(tenant.approved_until);
        if (approvedEnd < now) return { label: 'INADIMPLENTE', color: 'bg-orange-500/20 text-orange-400' };
        const daysLeft = Math.ceil((approvedEnd - now) / (1000 * 60 * 60 * 24));
        return { label: `ATIVO (${daysLeft}d)`, color: 'bg-green-500/20 text-green-400' };
      }
      return { label: 'ATIVO', color: 'bg-green-500/20 text-green-400' };
    }
    return { label: tenant.status || 'N/A', color: 'bg-zinc-500/20 text-zinc-400' };
  };

  // Tela de Login
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-10">
          <div className="text-center mb-8">
            <Shield className="text-red-500 mx-auto mb-4" size={48} />
            <h1 className="text-2xl font-black text-white uppercase">Super Admin</h1>
            <p className="text-zinc-500 text-sm mt-1">Painel de gerenciamento Espeto Fácil</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-red-600 transition-all text-white placeholder:text-zinc-600"
                placeholder="Senha do Super Admin"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                <XCircle size={16} /> {error}
              </div>
            )}

            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
              ENTRAR <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Painel Admin
  const stats = {
    total: tenants.length,
    active: tenants.filter(t => t.status === 'active').length,
    trial: tenants.filter(t => t.status === 'trial').length,
    blocked: tenants.filter(t => t.status === 'blocked').length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Shield className="text-red-500" size={32} />
          <div>
            <h1 className="text-2xl font-black text-white uppercase">Super Admin</h1>
            <p className="text-zinc-500 text-sm">Espeto Fácil • Gerenciamento de Lojas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTenants} className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 p-3 rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, icon: <Store size={20} />, color: 'text-white' },
          { label: 'Ativos', value: stats.active, icon: <CheckCircle size={20} />, color: 'text-green-400' },
          { label: 'Trial', value: stats.trial, icon: <Clock size={20} />, color: 'text-blue-400' },
          { label: 'Bloqueados', value: stats.blocked, icon: <XCircle size={20} />, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 text-center">
            <div className={`${s.color} mx-auto mb-2 flex justify-center`}>{s.icon}</div>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-zinc-500 text-xs uppercase tracking-widest font-bold mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tenant List */}
      <div className="space-y-3">
        {tenants.map(tenant => {
          const badge = getStatusBadge(tenant);
          return (
            <div key={tenant.id} className="bg-white/5 border border-white/5 rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold text-lg truncate">{tenant.name}</h3>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-xs space-y-0.5">
                    <p>🔗 <span className="text-zinc-400 font-mono">/{tenant.slug}</span></p>
                    {tenant.responsible_name && <p>👤 {tenant.responsible_name}</p>}
                    {tenant.email && <p>📧 {tenant.email}</p>}
                    {tenant.whatsapp && <p>📱 {tenant.whatsapp}</p>}
                    {tenant.cpf_cnpj && <p>📋 {tenant.cpf_cnpj}</p>}
                    <p>📅 Criado em {new Date(tenant.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approveMonth(tenant)}
                    className="bg-green-600/20 hover:bg-green-600/40 text-green-400 font-bold text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
                  >
                    +30 dias
                  </button>
                  {tenant.status === 'blocked' ? (
                    <button
                      onClick={() => reactivateTenant(tenant)}
                      className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
                    >
                      Reativar
                    </button>
                  ) : (
                    <button
                      onClick={() => blockTenant(tenant)}
                      className="bg-red-600/20 hover:bg-red-600/40 text-red-400 font-bold text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
                    >
                      Bloquear
                    </button>
                  )}
                  <a
                    href={`/${tenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white/5 hover:bg-white/10 text-zinc-400 font-bold text-xs px-4 py-2 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Visitar
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {tenants.length === 0 && !loading && (
          <div className="text-center text-zinc-500 py-20">
            <Users className="mx-auto mb-4 text-zinc-700" size={48} />
            <p>Nenhum estabelecimento cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
