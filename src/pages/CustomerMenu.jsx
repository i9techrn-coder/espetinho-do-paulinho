import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Plus, 
  Minus, 
  X,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  User,
  Phone,
  Home,
  CreditCard,
  Banknote,
  Copy,
  Navigation,
  Check,
  Camera,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CustomerMenu() {
  const { 
    tenant,
    products, categories, 
    isStoreOpen, contactConfig, schedule, addOrder, pixConfig, orderMethods, deliveryFees, loadingData
  } = useStore();

  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const businessPhone = tenant?.whatsapp || tenant?.phone || contactConfig?.phone || '5584997080020';

  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    method: 'Retirar', 
    address: '', 
    reference: '',
    payment: 'PIX', 
    paymentDetails: {
      changeFor: '',
      cardType: 'Crédito',
      cardBrand: 'Visa'
    },
    obs: '',
    neighborhood: '' 
  });

  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (!orderMethods?.delivery && formData.method === 'Entrega') {
      setFormData(prev => ({ ...prev, method: 'Retirar' }));
    }
    if (!orderMethods?.pickup && formData.method === 'Retirar') {
      setFormData(prev => ({ ...prev, method: 'Entrega' }));
    }
  }, [orderMethods]);

  const itemsTotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const deliveryFee = formData.method === 'Entrega' && formData.neighborhood && deliveryFees ? 
    (deliveryFees.find(df => df.name === formData.neighborhood)?.fee || 0) : 0;
  
  const total = itemsTotal + deliveryFee;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(0, item.qty - 1) } : item
    ).filter(item => item.qty > 0));
  };

  const handlePhoneChange = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 15);
    setFormData({...formData, phone: cleaned});
  };

  const getGeolocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização.");
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setFormData({...formData, address: url});
        setIsGettingLocation(false);
      },
      (err) => {
        alert("Não foi possível obter a localização. Por favor, digite manualmente.");
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const copyPix = () => {
    if (!pixConfig?.key) return;
    navigator.clipboard.writeText(pixConfig.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canSend = formData.name && formData.phone.length >= 10 && cart.length > 0 && 
    (formData.method === 'Retirar' || (formData.method === 'Entrega' && formData.address && formData.neighborhood));

  const sendOrder = async () => {
    let paymentStr = formData.payment;
    if (formData.payment === 'Dinheiro') {
      paymentStr += formData.paymentDetails.changeFor ? ` (Troco para R$ ${formData.paymentDetails.changeFor})` : ' (Sem troco)';
    } else if (formData.payment === 'Cartão') {
      paymentStr += ` (${formData.paymentDetails.cardType} - ${formData.paymentDetails.cardBrand})`;
    }

    const methodStr = formData.method === 'Entrega' 
      ? `🚚 *Entrega* (${formData.neighborhood} - R$ ${deliveryFee.toFixed(2)})%0A📍 Endereço: ${formData.address}%0A🏠 Ref: ${formData.reference}`
      : `🛍️ *Retirar no Local*%0A📍 Local: ${contactConfig?.address || tenant?.address || 'Endereço no Estabelecimento'}`;

    const message = `*Pedido Online - ${tenant?.name?.toUpperCase() || 'ESPETINHO'}*%0A%0A` +
      cart.map(i => `✅ ${i.qty}x ${i.name} (R$ ${(i.price * i.qty).toFixed(2)})`).join('%0A') +
      (formData.method === 'Entrega' && deliveryFee > 0 ? `%0A🚚 Taxa de Entrega (R$ ${deliveryFee.toFixed(2)})` : '') +
      `%0A%0A*💰 Total: R$ ${total.toFixed(2)}*%0A%0A*📋 Dados do Cliente:*%0A👤 Nome: ${formData.name}%0A📞 Tel: ${formData.phone}%0A%0A${methodStr}%0A💳 Pagamento: ${paymentStr}%0A📝 Obs: ${formData.obs}`;
    
    const orderObj = {
      items: cart,
      total: total,
      origin: 'Online',
      status: 'aberto',
      customerData: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        payment: paymentStr,
        obs: formData.obs,
        neighborhood: formData.neighborhood,
        deliveryFee: deliveryFee
      }
    };
    
    await addOrder(orderObj);
    setLastOrder(orderObj);
    setOrderSent(true);
    setCart([]);
    
    const cleanPhone = businessPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
  };

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    const element = document.getElementById(`category-${cat}`);
    if (element) {
      const offset = 180;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10 text-center">
        <div className="space-y-4 opacity-40">
          <ShoppingBag size={64} className="mx-auto animate-bounce text-red-600" />
          <p className="font-black uppercase tracking-widest text-slate-800">Carregando Cardápio...</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0 && !loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="space-y-4 opacity-50 mb-8">
          <ShoppingBag size={64} className="mx-auto text-slate-400" />
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Cardápio Vazio</h2>
          <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">Você acabou de criar sua loja! Acesse o painel admin para cadastrar seus produtos.</p>
        </div>
        <a href={`/${tenant?.slug}/login`} className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded-full shadow-lg active:scale-95 transition-all uppercase tracking-widest text-sm">
          Acessar Painel Admin
        </a>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col p-8 items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-green-500/30 animate-bounce">
          <Check size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Pedido Enviado!</h2>
        <p className="opacity-60 font-bold mb-12">Você já foi redirecionado para o WhatsApp. Estamos preparando seu pedido agora!</p>
        
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-left space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</span>
            <span className="text-green-400 font-black uppercase text-xs animate-pulse">Em Preparo</span>
          </div>
          <div className="space-y-2">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Resumo</span>
             {lastOrder?.items?.map(i => (
               <div key={i.id} className="flex justify-between text-sm font-bold opacity-80">
                 <span>{i.qty}x {i.name}</span>
                 <span>R$ {(i.qty * i.price).toFixed(2)}</span>
               </div>
             ))}
             {lastOrder?.customerData?.deliveryFee > 0 && (
                <div className="flex justify-between text-sm font-bold opacity-80 pt-2 border-t border-white/10 mt-2">
                  <span>Taxa de Entrega ({lastOrder.customerData.neighborhood})</span>
                  <span>R$ {lastOrder.customerData.deliveryFee.toFixed(2)}</span>
                </div>
             )}
          </div>
          <div className="pt-4 flex justify-between items-center text-xl font-black italic">
            <span>TOTAL</span>
            <span className="text-red-500 font-sans">R$ {lastOrder?.total?.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={() => { setOrderSent(false); setIsCheckoutOpen(false); }}
          className="mt-12 text-xs font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          Fazer outro pedido
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {isScheduleOpen && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white" onClick={() => setIsScheduleOpen(false)}>
           <div className="bg-white text-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
              <h3 className="font-black italic text-2xl uppercase tracking-tighter">Horário de Funcionamento</h3>
              <div className="space-y-3">
                {Object.entries(schedule || {}).map(([day, time]) => (
                   <div key={day} className="flex justify-between border-b border-slate-100 pb-2">
                     <span className="font-bold opacity-60 capitalize">{day}</span>
                     <span className="font-black italic">{time.active ? `${time.open} - ${time.close}` : 'Fechado'}</span>
                   </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {!isStoreOpen && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-white text-center">
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-red-600/30">
              <Clock size={48} className="animate-pulse" />
            </div>
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">Estamos Fechados</h2>
            <p className="font-bold opacity-60 max-w-xs mx-auto">Consulte nossos horários ou peça para retirada se estivermos no local!</p>
            <button 
              onClick={() => setIsScheduleOpen(true)}
              className="px-8 py-4 bg-white text-slate-900 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95"
            >
              Ver Horários de Funcionamento
            </button>
          </div>
        </div>
      )}

      <header className="bg-red-600 text-white p-6 md:p-12 pb-12 relative overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div className="space-y-3">
                 <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">{tenant?.name || 'ESPETO FÁCIL'}</h1>
                 <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] opacity-60">Sabor Irresistível em cada espeto</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                 {businessPhone && (
                   <button 
                    onClick={() => {
                      const cleanPhone = businessPhone.replace(/\D/g, '');
                      const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                      window.open(`https://wa.me/${finalPhone}`, '_blank');
                    }} 
                    className="bg-green-500 hover:bg-green-600 px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95 text-[10px] font-black uppercase text-white"
                   >
                      <MessageSquare size={12} />
                      <span>WhatsApp</span>
                   </button>
                 )}
                 {(contactConfig?.instagram || tenant?.instagram) && (
                   <button 
                    onClick={() => {
                      const rawInsta = (contactConfig?.instagram || tenant?.instagram || '').trim();
                      if (rawInsta.startsWith('http://') || rawInsta.startsWith('https://')) {
                        window.open(rawInsta, '_blank');
                      } else {
                        const cleanUser = rawInsta.replace('@', '').replace(/\s+/g, '');
                        window.open(`https://www.instagram.com/${cleanUser}/`, '_blank');
                      }
                    }} 
                    className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 px-4 py-2.5 rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95 text-[10px] font-black uppercase text-white"
                   >
                      <Camera size={12} />
                      <span>Instagram</span>
                   </button>
                 )}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                 {(contactConfig?.address || tenant?.address) && (
                   <div 
                    onClick={() => {
                      const addr = (contactConfig?.address || tenant?.address || '').trim();
                      if (addr.startsWith('http://') || addr.startsWith('https://') || addr.includes('google.com')) {
                        window.open(addr, '_blank');
                      } else {
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`, '_blank');
                      }
                    }}
                    className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/10 cursor-pointer hover:bg-black/40 transition-all text-white"
                   >
                      <MapPin size={14} />
                      <span className="text-[10px] font-black uppercase tracking-wider truncate max-w-[200px]">{contactConfig?.address || tenant?.address}</span>
                   </div>
                 )}
                  <div 
                    onClick={() => setIsScheduleOpen(true)}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 border cursor-pointer transition-all active:scale-95 ${isStoreOpen ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-red-950/20 border-red-500/50 text-red-300'}`}
                  >
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{isStoreOpen ? 'Aberto Agora' : 'Fechado'}</span>
                    <ChevronDown size={10} />
                  </div>
              </div>
            </div>
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl border border-white/20">
              <ShoppingBag size={28} />
            </div>
          </div>
        </div>
      </header>

      {/* Categories Bar */}
      <div className="sticky top-0 z-40 bg-white pb-4 -mt-10 pt-1 shadow-2xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2
                  ${activeCategory === cat ? 'bg-red-600 border-red-600 text-white shadow-xl scale-105' : 'bg-white border-slate-100 text-red-600 hover:border-red-600'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-16 mt-0 relative z-20">
        {categories.map(cat => (
          <section key={cat} id={`category-${cat}`} className="space-y-8 animate-fade-in scroll-mt-48">
            <div className="flex items-center gap-6">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">{cat}</h2>
              <div className="h-1 bg-red-600 flex-1 rounded-full opacity-10" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {products.filter(p => p.category === cat && p.active !== false)
                .sort((a, b) => b.price - a.price)
                .map(p => (
                <div key={p.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-red-600 transition-all hover:shadow-2xl relative overflow-hidden">
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight uppercase italic leading-tight group-hover:text-red-600 transition-colors line-clamp-2">{p.name}</h3>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-20">{p.description || 'CHURRASCO PREMIUM'}</p>
                  </div>
                  
                  <div className="mt-6 md:mt-10 flex flex-col gap-3 relative z-10">
                    <span className="text-lg md:text-3xl font-black text-slate-900 tracking-tighter italic font-sans leading-none">R$ {Number(p.price).toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                       {cart.find(i => i.id === p.id) ? (
                         <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-[1.5rem] text-white w-full justify-between animate-in zoom-in">
                           <button onClick={() => removeFromCart(p.id)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Minus size={14}/></button>
                           <span className="font-black text-lg w-4 text-center font-sans text-white">{cart.find(i => i.id === p.id).qty}</span>
                           <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><Plus size={14}/></button>
                         </div>
                       ) : (
                         <button 
                           onClick={() => addToCart(p)}
                           className="w-full bg-slate-50 border-2 border-slate-100 py-3 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all shadow-sm"
                         >
                           <Plus size={20} />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-[100]">
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-slate-900 text-white p-7 rounded-[2.5rem] shadow-2xl flex justify-between items-center font-black animate-slide-up ring-4 ring-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-600 w-10 h-10 rounded-2xl flex items-center justify-center text-sm shadow-lg font-sans">
                {cart.reduce((acc, i) => acc + i.qty, 0)}
              </div>
              <span className="tracking-tighter uppercase italic">Ver Carrinho</span>
            </div>
            <span className="text-2xl tracking-tighter font-sans">R$ {total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Advanced Checkout Drawer */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-white p-8 flex flex-col animate-slide-up rounded-t-[3.5rem] md:rounded-l-[3.5rem] md:rounded-tr-none h-full shadow-2xl overflow-hidden mt-12 md:mt-0">
            <div className="flex justify-between items-center mb-8 h-12">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">Meu Pedido</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center hover:bg-red-50 transition-colors text-slate-400"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar">
              <section>
                <div className="flex items-center gap-2 mb-4 opacity-30">
                  <ShoppingBag size={14} />
                  <h3 className="text-[10px] uppercase font-black tracking-widest">Resumo do Carrinho</h3>
                </div>
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-[2rem] mb-3 border border-slate-100">
                    <div className="flex-1">
                      <p className="font-black text-slate-800 text-sm italic uppercase">{i.name}</p>
                      <p className="text-[10px] font-black opacity-30 tracking-tighter font-sans">Qtd: {i.qty} • R$ {(i.price * i.qty).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm">
                      <button onClick={() => removeFromCart(i.id)} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600"><Minus size={16} /></button>
                      <span className="font-black text-lg w-6 text-center font-sans text-slate-900">{i.qty}</span>
                      <button onClick={() => addToCart(i)} className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600"><Plus size={16} /></button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <User size={14} />
                  <h3 className="text-[10px] uppercase font-black tracking-widest">Seus Dados</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm" 
                      placeholder="Seu Nome *" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm" 
                      placeholder="DDD + Telefone (só números) *" 
                      value={formData.phone} 
                      onChange={e => handlePhoneChange(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {['Retirar', 'Entrega'].filter(m => {
                    if (m === 'Retirar') return orderMethods?.pickup !== false;
                    if (m === 'Entrega') return orderMethods?.delivery !== false;
                    return true;
                  }).map(m => (
                    <button 
                      key={m} 
                      onClick={() => setFormData({...formData, method: m})} 
                      className={`py-4 rounded-2xl border-2 font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2
                        ${formData.method === m ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-slate-50 border-slate-300 text-slate-400 hover:border-red-100'}`}
                    >
                      {m === 'Retirar' ? <ShoppingBag size={14} /> : <Home size={14} />}
                      {m === 'Retirar' ? 'Retirar' : 'Entrega'}
                    </button>
                  ))}
                </div>

                {formData.method === 'Entrega' && (
                  <div className="space-y-3 animate-slide-up pt-2">
                    <div className="space-y-1 relative">
                      <p className="text-[10px] font-black uppercase opacity-40">Bairro da Entrega *</p>
                      <select 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm appearance-none"
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                      >
                        <option value="" disabled>Selecione o Bairro...</option>
                        {(deliveryFees || []).map(df => (
                          <option key={df.name} value={df.name}>{df.name} - R$ {Number(df.fee).toFixed(2)}</option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-9 pointer-events-none text-slate-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm" 
                        placeholder="Endereço Completo *" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                      />
                      <button 
                        onClick={getGeolocation}
                        disabled={isGettingLocation}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-2.5 rounded-2xl flex items-center gap-1 text-[8px] font-black uppercase tracking-widest active:scale-90 transition-all disabled:opacity-50"
                      >
                        {isGettingLocation ? 'Obtendo...' : <Navigation size={12} />}
                      </button>
                    </div>
                    <input 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm" 
                      placeholder="Ponto de Referência" 
                      value={formData.reference} 
                      onChange={e => setFormData({...formData, reference: e.target.value})} 
                    />
                  </div>
                )}

                {formData.method === 'Retirar' && (
                  <div className="bg-slate-900 p-5 rounded-[2rem] space-y-1 border border-slate-800 animate-fade-in">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retire em:</p>
                    <p className="text-white font-black italic text-sm">{contactConfig?.address || tenant?.address || 'Endereço da Loja'}</p>
                  </div>
                )}

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Forma de Pagamento</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {id: 'PIX', icon: <Smartphone size={14}/>},
                      {id: 'Dinheiro', icon: <Banknote size={14}/>},
                      {id: 'Cartão', icon: <CreditCard size={14}/>}
                    ].map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setFormData({...formData, payment: p.id})} 
                        className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all
                          ${formData.payment === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-300 text-slate-400 hover:border-red-100'}`}
                      >
                        {p.icon}
                        {p.id}
                      </button>
                    ))}
                  </div>

                  {formData.payment === 'PIX' && (
                    <div className="bg-slate-50 p-5 rounded-[2rem] space-y-4 animate-fade-in text-center border border-dashed border-slate-200">
                      <div className="w-36 h-36 bg-white mx-auto rounded-3xl flex items-center justify-center p-2 border-2 border-slate-100">
                        {pixConfig?.qrCode ? (
                          <img src={pixConfig.qrCode} alt="PIX" className="w-full h-full object-contain" />
                        ) : (
                          <Smartphone size={36} className="text-slate-200" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase opacity-40">Chave Pix da Loja</p>
                        <p className="font-black text-slate-800 break-all px-2 text-xs">{pixConfig?.key || tenant?.pix_key || 'Chave não configurada'}</p>
                        <button 
                          onClick={copyPix}
                          className="w-full bg-white text-slate-900 border-2 border-slate-100 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} 
                          {copied ? 'COPIADO!' : 'COPIAR CHAVE'}
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.payment === 'Dinheiro' && (
                    <div className="space-y-3 animate-fade-in">
                       <p className="text-[10px] font-black uppercase opacity-40">Precisa de troco?</p>
                       <div className="grid grid-cols-4 gap-2">
                         {[20, 50, 100, 200].map(val => (
                           <button 
                             key={val} 
                             onClick={() => setFormData({...formData, paymentDetails: {...formData.paymentDetails, changeFor: val.toString()}})}
                             className={`py-3 rounded-xl border-2 font-black text-xs transition-all
                               ${formData.paymentDetails.changeFor === val.toString() ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'bg-slate-50 border-slate-300 text-slate-400'}`}
                           >
                             R$ {val}
                           </button>
                         ))}
                       </div>
                       <input 
                         className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm" 
                         placeholder="Outro valor..." 
                         type="number"
                         value={formData.paymentDetails.changeFor} 
                         onChange={e => setFormData({...formData, paymentDetails: {...formData.paymentDetails, changeFor: e.target.value}})} 
                       />
                       {formData.paymentDetails.changeFor && Number(formData.paymentDetails.changeFor) > total && (
                         <div className="bg-green-50 p-3 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">Seu Troco:</p>
                            <p className="text-xl font-black text-green-700 font-sans">R$ {(Number(formData.paymentDetails.changeFor) - total).toFixed(2)}</p>
                         </div>
                       )}
                    </div>
                  )}

                  {formData.payment === 'Cartão' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          {['Crédito', 'Débito'].map(type => (
                            <button 
                              key={type}
                              onClick={() => setFormData({...formData, paymentDetails: {...formData.paymentDetails, cardType: type}})}
                              className={`py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all
                                ${formData.paymentDetails.cardType === type ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-300 text-slate-400'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase opacity-40">Bandeira</p>
                           <div className="grid grid-cols-4 gap-2">
                             {['Visa', 'Master', 'Elo', 'Hiper'].map(brand => (
                               <button 
                                 key={brand}
                                 onClick={() => setFormData({...formData, paymentDetails: {...formData.paymentDetails, cardBrand: brand}})}
                                 className={`py-2.5 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest transition-all
                                   ${formData.paymentDetails.cardBrand === brand ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-slate-50 border-slate-300 text-slate-400'}`}
                               >
                                 {brand}
                               </button>
                             ))}
                           </div>
                        </div>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">Observações (Opcional)</p>
                  <textarea 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-3xl outline-none focus:border-red-500 font-bold text-slate-900 text-sm resize-none" 
                    placeholder="Ex: Tirar cebola, ponto da carne..." 
                    rows="2"
                    value={formData.obs} 
                    onChange={e => setFormData({...formData, obs: e.target.value})} 
                  />
                </div>
              </section>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end mb-2 px-2">
                <span className="font-black opacity-20 uppercase text-xs tracking-widest italic">Subtotal</span>
                <span className="text-lg font-black text-slate-500 font-sans">R$ {itemsTotal.toFixed(2)}</span>
              </div>
              {formData.method === 'Entrega' && deliveryFee > 0 && (
                 <div className="flex justify-between items-end mb-2 px-2">
                   <span className="font-black opacity-20 uppercase text-xs tracking-widest italic">Taxa de Entrega</span>
                   <span className="text-lg font-black text-slate-500 font-sans">+ R$ {deliveryFee.toFixed(2)}</span>
                 </div>
              )}
              <div className="flex justify-between items-end mb-6 px-2 mt-2">
                <span className="font-black opacity-40 uppercase text-sm tracking-widest italic">Total Final</span>
                <span className="text-4xl font-black text-red-600 tracking-tighter italic font-sans">R$ {total.toFixed(2)}</span>
              </div>
              <button 
                onClick={sendOrder} 
                disabled={!canSend}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 text-white font-black py-6 rounded-full text-lg shadow-2xl shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                ENVIAR NO WHATSAPP <MessageSquare size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
