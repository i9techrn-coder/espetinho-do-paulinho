import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Flame, ArrowRight, CheckCircle, Store, User, Phone, Mail, CreditCard, Link2, XCircle, Loader2, MapPin, Camera } from 'lucide-react';

const DEFAULT_CATEGORIES = ["CHURRASCO", "BEBIDAS ALCOÓLICAS", "BEBIDAS NÃO ALCOÓLICAS"];

const DEFAULT_PRODUCTS = [
  // CHURRASCO
  { name: "Asa de frango", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Calabresa", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Camarão", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Carne", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Charque", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Coração de boi", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Coração de frango", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Costela de porco", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Frango", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Língua bovina", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Moela", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Ovo com calabresa", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Pão de alho", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Queijo", price: 5.00, category: "CHURRASCO", active: true },
  { name: "Tripa", price: 5.00, category: "CHURRASCO", active: true },
  
  // BEBIDAS ALCOÓLICAS
  { name: "Caranguejo Ouro", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Caranguejo Prata", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Cerveja Devassa", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Cerveja Itaipava", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Heineken Long Neck", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Pitu Lata", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Pitu Limão", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Ypióca", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Doses (genérico)", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },

  // BEBIDAS NÃO ALCOÓLICAS
  { name: "Coca-Cola Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Guaraná 1L", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Guaraná Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Pepsi 1L", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Pepsi Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Sprite Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Suco", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true }
];

export default function LandingPage() {
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    storeName: '',
    slug: '',
    responsibleName: '',
    phone: '',
    whatsapp: '',
    address: '',
    instagram: '',
    cpfCnpj: '',
    email: '',
    pixKey: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Auto-gerar slug a partir do nome
    if (name === 'storeName') {
      const slug = value
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 30);
      setForm(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!form.storeName || !form.responsibleName || !form.email || !form.slug) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    // Verificar se slug já existe
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', form.slug)
      .single();

    if (existing) {
      setError('Esse link já está em uso. Escolha outro nome.');
      setLoading(false);
      return;
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    const initialContactConfig = {
      phone: form.phone || form.whatsapp || '',
      instagram: form.instagram || '',
      locationUrl: form.address || '',
      address: form.address || ''
    };

    const initialDeliveryFees = [
      { name: "Centro", fee: 5.00 },
      { name: "Bairro Vizinho", fee: 7.00 }
    ];

    const initialOrderMethods = { pickup: true, delivery: true };

    const { data, error: dbError } = await supabase
      .from('tenants')
      .insert([{
        slug: form.slug,
        name: form.storeName,
        responsible_name: form.responsibleName,
        phone: form.phone,
        whatsapp: form.whatsapp,
        address: form.address,
        instagram: form.instagram,
        cpf_cnpj: form.cpfCnpj,
        email: form.email,
        pix_key: form.pixKey,
        status: 'trial',
        trial_ends_at: trialEnd.toISOString(),
        is_active: true,
        contact_config: initialContactConfig,
        delivery_fees: initialDeliveryFees,
        order_methods: initialOrderMethods
      }])
      .select()
      .single();

    if (dbError) {
      setError('Erro ao criar o estabelecimento: ' + dbError.message);
      setLoading(false);
      return;
    }

    // Injetar categorias e produtos padrão automaticamente!
    try {
      await supabase.from('categories').insert(
        DEFAULT_CATEGORIES.map(cat => ({ tenant_id: data.id, name: cat }))
      );

      await supabase.from('products').insert(
        DEFAULT_PRODUCTS.map(p => ({ ...p, tenant_id: data.id }))
      );
    } catch (seedErr) {
      console.error("Erro ao popular cardápio padrão:", seedErr);
    }

    setSuccess(data);
    setLoading(false);
  };

  // Tela de sucesso
  if (success) {
    const storeUrl = `${window.location.origin}/${success.slug}`;
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-10 text-center">
          <CheckCircle className="text-green-400 mx-auto mb-6" size={64} />
          <h1 className="text-3xl font-black text-white mb-2">Cadastro Realizado! 🎉</h1>
          <p className="text-zinc-400 mb-6">Seu estabelecimento está no ar com 7 dias grátis e cardápio completo pré-carregado!</p>
          
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6">
            <p className="text-xs text-green-400 font-bold uppercase mb-1">Seu link exclusivo:</p>
            <p className="text-green-300 font-mono text-lg break-all">{storeUrl}</p>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left text-sm text-zinc-400 space-y-2">
            <p>🔐 <strong className="text-white">Login admin:</strong> admin</p>
            <p>🔑 <strong className="text-white">Senha padrão:</strong> 123</p>
            <p className="text-xs text-zinc-500 mt-2">Troque a senha no painel admin assim que logar!</p>
          </div>

          <button
            onClick={() => navigate(`/${success.slug}`)}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
          >
            ACESSAR MINHA LOJA <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[150px]" />

      {/* Hero */}
      {!showRegister && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-red-600/30 mb-8 transform -rotate-12">
            <Flame className="text-white" size={48} />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-4">
            Espeto <span className="text-red-500">Fácil</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mb-4">
            O sistema completo para sua espetaria. Cardápio online, controle de mesas, pedidos e muito mais.
          </p>
          <p className="text-zinc-500 text-sm mb-10">
            🔥 Cadastre seu estabelecimento e ganhe <strong className="text-red-400">7 dias grátis</strong>!
          </p>

          <button
            onClick={() => setShowRegister(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-black py-6 px-12 rounded-[2rem] shadow-2xl shadow-red-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-4 group"
          >
            CADASTRAR MEU ESTABELECIMENTO
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
            {[
              { icon: '📱', title: 'Cardápio Digital', desc: 'Seu cliente pede pelo celular sem baixar nada' },
              { icon: '🍽️', title: 'Controle de Mesas', desc: 'Garçom vê os pedidos em tempo real' },
              { icon: '📊', title: 'Painel Admin', desc: 'Dashboard completo com vendas e produtos' },
            ].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-6 text-left">
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="text-white font-bold mb-1">{f.title}</h3>
                <p className="text-zinc-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulário de Cadastro */}
      {showRegister && (
        <div className="relative z-10 flex items-center justify-center min-h-screen p-6 py-12">
          <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
            <button onClick={() => setShowRegister(false)} className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold mb-6 flex items-center gap-2">
              ← Voltar
            </button>

            <div className="text-center mb-8">
              <Store className="text-red-500 mx-auto mb-3" size={40} />
              <h2 className="text-2xl font-black text-white uppercase">Cadastre seu Estabelecimento</h2>
              <p className="text-zinc-500 text-sm mt-1">7 dias grátis • sem compromisso</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField icon={<Store size={18} />} name="storeName" placeholder="Nome do Estabelecimento *" value={form.storeName} onChange={handleChange} />
              
              <div className="relative">
                <Link2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  name="slug"
                  className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-red-600 transition-all text-white text-sm placeholder:text-zinc-600"
                  placeholder="Link da sua loja *"
                  value={form.slug}
                  onChange={handleChange}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-mono">espeto-facil.vercel.app/{form.slug || '...'}</span>
              </div>

              <InputField icon={<User size={18} />} name="responsibleName" placeholder="Nome do Responsável *" value={form.responsibleName} onChange={handleChange} />
              <InputField icon={<Phone size={18} />} name="phone" placeholder="Telefone de Contato *" value={form.phone} onChange={handleChange} />
              <InputField icon={<Phone size={18} />} name="whatsapp" placeholder="WhatsApp para Pedidos" value={form.whatsapp} onChange={handleChange} />
              <InputField icon={<MapPin size={18} />} name="address" placeholder="Endereço Completo (Bairro, Cidade)" value={form.address} onChange={handleChange} />
              <InputField icon={<Camera size={18} />} name="instagram" placeholder="Instagram (ex: @seu.espetinho)" value={form.instagram} onChange={handleChange} />
              <InputField icon={<CreditCard size={18} />} name="cpfCnpj" placeholder="CPF ou CNPJ" value={form.cpfCnpj} onChange={handleChange} />
              <InputField icon={<Mail size={18} />} name="email" placeholder="Email *" value={form.email} onChange={handleChange} type="email" />
              <InputField icon={<CreditCard size={18} />} name="pixKey" placeholder="Chave PIX (opcional)" value={form.pixKey} onChange={handleChange} />

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs font-bold">
                  <XCircle size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-red-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 mt-6"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>CRIAR MINHA LOJA <ArrowRight size={18} /></>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ icon, name, placeholder, value, onChange, type = 'text' }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">{icon}</span>
      <input
        type={type}
        name={name}
        className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-red-600 transition-all text-white text-sm placeholder:text-zinc-600"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
