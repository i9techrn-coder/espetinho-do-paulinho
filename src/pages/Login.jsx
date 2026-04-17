import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { User, Lock, ArrowRight, XCircle } from 'lucide-react';

export default function Login() {
  const [loginStr, setLoginStr] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(loginStr, password);
    if (result.success) {
      if (result.role === 'Gestor') {
        navigate('/admin');
      } else {
        navigate('/garcon');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 relative z-10 animate-fade-in shadow-2xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center text-white font-black italic text-4xl shadow-2xl shadow-red-600/30 mx-auto mb-6 transform -rotate-12">P</div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase uppercase">Espetinho<br/><span className="text-red-500 italic block">Paulinho</span></h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Usuário de Acesso</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
              <input 
                type="text" 
                autoComplete="username"
                className="w-full bg-white/5 border-2 border-white/5 p-6 pl-16 rounded-3xl outline-none focus:border-red-600 transition-all text-white font-bold placeholder:text-slate-700" 
                placeholder="Ex: joao_garcom" 
                value={loginStr} 
                onChange={e => setLoginStr(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-2">Senha de Segurança</label>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" size={20} />
              <input 
                type="password" 
                autoComplete="current-password"
                className="w-full bg-white/5 border-2 border-white/5 p-6 pl-16 rounded-3xl outline-none focus:border-red-600 transition-all text-white font-bold placeholder:text-slate-700" 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold animate-slide-up">
              <XCircle size={18} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-8 rounded-[2.5rem] shadow-2xl shadow-red-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-4 group italic"
          >
            ENTRAR NO SISTEMA <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-600 opacity-50">Acesso exclusivo para colaboradores habilitados</p>
      </div>
    </div>
  );
}
