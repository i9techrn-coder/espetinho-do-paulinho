import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Plus, Minus, X, MessageSquare, MapPin, Clock, User, Phone, Home, CreditCard, Smartphone, Banknote, Copy, Check, Navigation } from 'lucide-react';

export default function CustomerMenu() {
  const { isStoreOpen, products, categories, addOrder, pixConfig } = useStore();
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
    obs: '' 
  });

  // Set initial category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Persist cart
  useEffect(() => {
    const saved = localStorage.getItem('espetinho_cart_v5');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing cart", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('espetinho_cart_v5', JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handlePhoneChange = (val) => {
    // Only numbers
    const cleaned = val.replace(/\D/g, '').slice(0, 11);
    setFormData({...formData, phone: cleaned});
  };

  const getGeolocation = () => {
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setFormData({...formData, address: url});
        setIsGettingLocation(false);
      },
      (err) => {
        alert("Não foi possível obter a localização. Por favor, digite manualmente.");
        setIsGettingLocation(false);
      }
    );
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixConfig.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendOrder = () => {
    let paymentStr = formData.payment;
    if (formData.payment === 'Dinheiro') {
      paymentStr += formData.paymentDetails.changeFor ? ` (Troco para R$ ${formData.paymentDetails.changeFor})` : ' (Sem troco)';
    } else if (formData.payment === 'Cartão') {
      paymentStr += ` (${formData.paymentDetails.cardType} - ${formData.paymentDetails.cardBrand})`;
    }

    const methodStr = formData.method === 'Entrega' 
      ? `🚚 *Entrega*%0A📍 Endereço: ${formData.address}%0A🏠 Ref: ${formData.reference}`
      : `🛍️ *Retirar no Local*%0A📍 Local: Rua do Churrasco, 123 - Bairro Central`;

    const message = `*Pedido Online - Espetinho do Paulinho*%0A%0A` +
      cart.map(i => `✅ ${i.qty}x ${i.name} (R$ ${(i.price * i.qty).toFixed(2)})`).join('%0A') +
      `%0A%0A*💰 Total: R$ ${total.toFixed(2)}*%0A%0A*📋 Dados do Cliente:*%0A👤 Nome: ${formData.name}%0A📞 Tel: ${formData.phone}%0A%0A${methodStr}%0A💳 Pagamento: ${paymentStr}%0A📝 Obs: ${formData.obs}`;
    
    // Add to Store context for admin
    const orderObj = {
      items: cart,
      total: total,
      origin: 'Online',
      customerData: {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        payment: paymentStr,
        obs: formData.obs
      }
    };
    
    addOrder(orderObj);
    setLastOrder(orderObj);
    setOrderSent(true);
    setCart([]);
    
    // Open WhatsApp
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const canSend = formData.name && formData.phone.length >= 10 && cart.length > 0 && 
    (formData.method === 'Retirar' || (formData.method === 'Entrega' && formData.address));

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-10 text-center">
        <div className="space-y-4 opacity-30">
          <ShoppingBag size={64} className="mx-auto" />
          <p className="font-black uppercase tracking-widest">Carregando Cardápio...</p>
        </div>
      </div>
    );
  }

  // Success View
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
             {lastOrder.items.map(i => (
               <div key={i.id} className="flex justify-between text-sm font-bold opacity-80">
                 <span>{i.qty}x {i.name}</span>
                 <span>R$ {(i.qty * i.price).toFixed(2)}</span>
               </div>
             ))}
          </div>
          <div className="pt-4 flex justify-between items-center text-xl font-black italic">
            <span>TOTAL</span>
            <span className="text-red-500 font-sans">R$ {lastOrder.total.toFixed(2)}</span>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32">
      {!isStoreOpen && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white text-center">
          <div className="space-y-6">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Clock size={48} />
            </div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Estamos Fechados</h2>
            <p className="font-bold opacity-60">Consulte nossos horários ou volte mais tarde!</p>
          </div>
        </div>
      )}

      <header className="bg-red-600 p-8 pt-12 pb-24 rounded-b-[4rem] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="max-w-2xl mx-auto flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter italic uppercase">Paulinho</h1>
            <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Espetinhos & Acompanhamentos</p>
            <p className="opacity-80 font-bold flex items-center gap-1 mt-3 text-xs bg-black/20 w-fit px-3 py-1 rounded-full border border-white/10">
              <MapPin size={12} /> Rua do Churrasco, 123
            </p>
          </div>
          <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-xl border border-white/20">
            <ShoppingBag size={28} />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto -mt-12 px-4 relative z-20">
        <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {categories.map(c => (
            <button 
              key={c} 
              onClick={() => setActiveCategory(c)}
              className={`px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-xl border-2
                ${activeCategory === c ? 'bg-white border-red-500 text-red-600 scale-105' : 'bg-white border-transparent text-slate-400 opacity-60 hover:opacity-100'}
              `}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6">
          {products.filter(p => p.category === activeCategory && p.active).length === 0 ? (
             <div className="col-span-2 bg-white rounded-[2.5rem] p-12 text-center opacity-20 border border-slate-100 italic">
                Nenhum produto nesta categoria
             </div>
          ) : (
            products.filter(p => p.category === activeCategory && p.active).map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 flex flex-col justify-between border border-slate-100 shadow-sm transition-all hover:border-red-500 active:scale-[0.95] group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="mb-4">
                  <h3 className="font-black text-sm md:text-xl text-slate-800 leading-tight tracking-tighter uppercase italic line-clamp-2">{p.name}</h3>
                  <p className="text-[8px] md:text-[10px] font-bold opacity-30 mt-1 line-clamp-1 uppercase tracking-tighter">{p.description || 'CHURRASCO PREMIUM'}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter font-sans">R$ {p.price.toFixed(2)}</span>
                  <button 
                    onClick={() => addToCart(p)}
                    className="w-full bg-slate-50 text-slate-400 group-hover:bg-red-600 group-hover:text-white py-3 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

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

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[130] bg-black/70 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-white p-8 flex flex-col animate-slide-up rounded-t-[3.5rem] md:rounded-l-[3.5rem] md:rounded-tr-none h-full shadow-2xl overflow-hidden mt-12 md:mt-0">
            <div className="flex justify-between items-center mb-12 h-12">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">Meu Pedido</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center hover:bg-red-50 transition-colors text-slate-400"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-10 pr-2 no-scrollbar">
              <section>
                <div className="flex items-center gap-2 mb-6 opacity-30">
                  <ShoppingBag size={14} />
                  <h3 className="text-[10px] uppercase font-black tracking-widest">Resumo do Carrinho</h3>
                </div>
                {cart.map(i => (
                  <div key={i.id} className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] mb-4 border border-slate-100 transition-all hover:border-red-200">
                    <div className="flex-1">
                      <p className="font-black text-slate-800 text-sm italic uppercase">{i.name}</p>
                      <p className="text-[10px] font-black opacity-30 tracking-tighter font-sans">Qtd: {i.qty} • R$ {(i.price * i.qty).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm">
                      <button onClick={() => setCart(c => c.map(x => x.id === i.id ? {...x, qty: Math.max(0, x.qty - 1)} : x).filter(x => x.qty > 0))} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Minus size={18} /></button>
                      <span className="font-black text-xl w-6 text-center tracking-tighter font-sans">{i.qty}</span>
                      <button onClick={() => setCart(c => c.map(x => x.id === i.id ? {...x, qty: x.qty + 1} : x))} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Plus size={18} /></button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 mb-2 opacity-30">
                  <User size={14} />
                  <h3 className="text-[10px] uppercase font-black tracking-widest">Seus Dados</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-6 pl-14 rounded-3xl outline-none focus:border-red-500 font-bold transition-all" 
                      placeholder="Seu Nome" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-6 pl-14 rounded-3xl outline-none focus:border-red-500 font-bold transition-all" 
                      placeholder="DDD + Telefone (só números)" 
                      value={formData.phone} 
                      onChange={e => handlePhoneChange(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {['Retirar', 'Entrega'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setFormData({...formData, method: m})} 
                      className={`py-5 rounded-2xl border-2 font-black text-[10px] tracking-widest uppercase transition-all flex items-center justify-center gap-2
                        ${formData.method === m ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'}`}
                    >
                      {m === 'Retirar' ? <ShoppingBag size={14} /> : <Home size={14} />}
                      {m === 'Retirar' ? 'Retirar' : 'Entrega'}
                    </button>
                  ))}
                </div>

                {formData.method === 'Entrega' && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="relative">
                      <input 
                        className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl outline-none focus:border-red-500 font-bold transition-all" 
                        placeholder="Endereço Completo" 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                      />
                      <button 
                        onClick={getGeolocation}
                        disabled={isGettingLocation}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-3 rounded-2xl flex items-center gap-2 text-[8px] font-black uppercase tracking-widest active:scale-90 transition-all disabled:opacity-50"
                      >
                        {isGettingLocation ? 'Obtendo...' : <Navigation size={14} />}
                      </button>
                    </div>
                    <input 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl outline-none focus:border-red-500 font-bold" 
                      placeholder="Ponto de Referência" 
                      value={formData.reference} 
                      onChange={e => setFormData({...formData, reference: e.target.value})} 
                    />
                  </div>
                )}

                {formData.method === 'Retirar' && (
                  <div className="bg-slate-900 p-6 rounded-[2rem] space-y-1 border border-slate-800 animate-fade-in">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retire em:</p>
                    <p className="text-white font-black italic">Rua do Churrasco, 123 - Bairro Central</p>
                  </div>
                )}

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Pagamento</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {id: 'PIX', icon: <Smartphone size={14}/>},
                      {id: 'Dinheiro', icon: <Banknote size={14}/>},
                      {id: 'Cartão', icon: <CreditCard size={14}/>}
                    ].map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setFormData({...formData, payment: p.id})} 
                        className={`py-5 rounded-2xl border flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all
                          ${formData.payment === p.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 opacity-40'}`}
                      >
                        {p.icon}
                        {p.id}
                      </button>
                    ))}
                  </div>

                  {formData.payment === 'PIX' && (
                    <div className="bg-slate-50 p-6 rounded-[2rem] space-y-6 animate-fade-in text-center border border-dashed border-slate-200">
                      <div className="w-40 h-40 bg-white mx-auto rounded-3xl flex items-center justify-center p-2 border-2 border-slate-100">
                        {pixConfig.qrCode ? (
                          <img src={pixConfig.qrCode} alt="PIX" className="w-full h-full object-contain" />
                        ) : (
                          <Smartphone size={40} className="text-slate-100" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase opacity-40">Chave Pix</p>
                        <p className="font-black text-slate-800 break-all px-4">{pixConfig.key || 'Chave não configurada'}</p>
                        <button 
                          onClick={copyPix}
                          className="w-full bg-white text-slate-900 border-2 border-slate-100 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />} 
                          {copied ? 'COPIADO!' : 'COPIAR CHAVE'}
                        </button>
                      </div>
                    </div>
                  )}

                  {formData.payment === 'Dinheiro' && (
                    <div className="space-y-4 animate-fade-in">
                       <p className="text-[10px] font-black uppercase opacity-40">Precisa de troco?</p>
                       <div className="grid grid-cols-4 gap-2">
                         {[20, 50, 100, 200].map(val => (
                           <button 
                             key={val} 
                             onClick={() => setFormData({...formData, paymentDetails: {...formData.paymentDetails, changeFor: val.toString()}})}
                             className={`py-3 rounded-xl border font-black text-xs transition-all
                               ${formData.paymentDetails.changeFor === val.toString() ? 'bg-green-500 border-green-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                           >
                             R$ {val}
                           </button>
                         ))}
                       </div>
                       <input 
                         className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl outline-none focus:border-red-500 font-bold" 
                         placeholder="Outro valor..." 
                         type="number"
                         value={formData.paymentDetails.changeFor} 
                         onChange={e => setFormData({...formData, paymentDetails: {...formData.paymentDetails, changeFor: e.target.value}})} 
                       />
                       {formData.paymentDetails.changeFor && Number(formData.paymentDetails.changeFor) > total && (
                         <div className="bg-green-50 p-4 rounded-2xl text-center">
                            <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">Seu Troco:</p>
                            <p className="text-2xl font-black text-green-700 font-sans">R$ {(Number(formData.paymentDetails.changeFor) - total).toFixed(2)}</p>
                         </div>
                       )}
                    </div>
                  )}

                  {formData.payment === 'Cartão' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-2 gap-2">
                          {['Crédito', 'Débito'].map(type => (
                            <button 
                              key={type}
                              onClick={() => setFormData({...formData, paymentDetails: {...formData.paymentDetails, cardType: type}})}
                              className={`py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all
                                ${formData.paymentDetails.cardType === type ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase opacity-40">Bandeira</p>
                           <div className="grid grid-cols-4 gap-2">
                             {['Visa', 'Master', 'Elo', 'Hiper'].map(brand => (
                               <button 
                                 key={brand}
                                 onClick={() => setFormData({...formData, paymentDetails: {...formData.paymentDetails, cardBrand: brand}})}
                                 className={`py-3 rounded-xl border text-[8px] font-black uppercase tracking-widest transition-all
                                   ${formData.paymentDetails.cardBrand === brand ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}
                               >
                                 {brand}
                               </button>
                             ))}
                           </div>
                        </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="pt-10 border-t border-slate-100">
              <div className="flex justify-between items-end mb-8 px-2">
                <span className="font-black opacity-20 uppercase text-xs tracking-widest italic">Total</span>
                <span className="text-5xl font-black text-red-600 tracking-tighter italic font-sans">R$ {total.toFixed(2)}</span>
              </div>
              <button 
                onClick={sendOrder} 
                disabled={!canSend}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 text-white font-black py-7 rounded-full text-xl shadow-2xl shadow-green-500/30 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                ENVIAR NO WHATSAPP <MessageSquare size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
