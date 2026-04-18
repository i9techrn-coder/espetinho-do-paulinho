import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Users, Plus, X, Search, ChevronRight, 
  Banknote, Smartphone, CreditCard, Receipt, CheckCircle2, Minus, LogOut 
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function WaiterDashboard() {
  const { orders, addOrder, closeOrder, pixConfig, products, categories, tables, team, currentUser, logout } = useStore();
  const [selectedTable, setSelectedTable] = useState(null);
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('mesas');
  const [loggedWaiter, setLoggedWaiter] = useState(currentUser);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const specialTables = [
    { id: 'Balcão', name: 'Balcão', type: 'special' },
    { id: 'Online', name: 'Online', type: 'special' }
  ];

  const getTableOrder = (id) => {
    return orders.find(o => o.tableId === id && o.status === 'aberto');
  };

  const isGestor = currentUser?.role === 'Gestor';

  const visibleTables = isGestor || !currentUser?.assignedTables || currentUser?.assignedTables === 'todas' 
    ? tables 
    : tables.filter(t => currentUser?.assignedTables.split(',').includes(t.id.toString()));

  const myOrders = isGestor 
    ? orders.filter(o => o.status === 'aberto')
    : orders.filter(o => o.status === 'aberto' && (o.waiterId === currentUser?.id || visibleTables.some(vt => vt.id === o.tableId)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{currentUser?.name} • {currentUser?.role === 'Gestor' ? 'Gestor' : 'Garçom'}</h1>
              <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">Painel de Operação</p>
            </div>
            <button 
              onClick={handleLogout}
              className="md:hidden p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-slate-100 rounded-2xl p-1.5 shadow-inner flex-1 md:flex-none">
            <button 
              onClick={() => setActiveTab('mesas')}
              className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'mesas' ? 'bg-white shadow-md text-red-600' : 'opacity-40 hover:opacity-100'}`}
            >
              Mesas
            </button>
            <button 
              onClick={() => setActiveTab('pedidos')}
              className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'pedidos' ? 'bg-white shadow-md text-red-600' : 'opacity-40 hover:opacity-100'}`}
            >
              Lista
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="hidden md:flex p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors ml-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'mesas' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-6">
            {[...visibleTables, ...specialTables].map(t => {
              const order = getTableOrder(t.id);
              const isBusy = !!order;
              
              let bgClass = "bg-white border-slate-100 border-2 hover:border-green-500 hover:bg-green-50/30 shadow-sm";
              let textClass = "text-slate-800";
              let badgeClass = "bg-green-500 text-white";

              if (t.id === 'Balcão') {
                bgClass = "bg-gradient-to-br from-orange-400 to-orange-600 border-none shadow-xl shadow-orange-500/20";
                textClass = "text-white";
                badgeClass = "bg-white/20 text-white";
              } else if (t.id === 'Online') {
                bgClass = "bg-gradient-to-br from-blue-400 to-blue-600 border-none shadow-xl shadow-blue-500/20";
                textClass = "text-white";
                badgeClass = "bg-white/20 text-white";
              } else if (isBusy) {
                bgClass = "bg-gradient-to-br from-red-500 to-red-600 border-none shadow-2xl shadow-red-500/30 ring-4 ring-red-50 scale-[1.05]";
                textClass = "text-white";
                badgeClass = "bg-white/20 text-white";
              }

              return (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTable(t)}
                  className={`relative rounded-[2rem] md:rounded-[2.5rem] p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 h-32 md:h-44 overflow-hidden group
                    ${bgClass}
                  `}
                >
                  <span className={`text-[7px] md:text-[10px] font-black uppercase tracking-widest opacity-60 ${textClass}`}>
                    {t.type === 'special' ? 'SETOR' : 'MESA'}
                  </span>
                  <span className={`text-xl md:text-3xl font-black tracking-tighter italic ${textClass}`}>
                    {t.name || t.id}
                  </span>
                  
                  {isBusy ? (
                    <div className={`mt-2 font-black text-[10px] md:text-lg px-3 py-1.5 rounded-full bg-black/10 ${textClass} font-sans`}>
                      R$ {order.total.toFixed(2)}
                    </div>
                  ) : (
                    <div className={`mt-2 px-3 py-1.5 rounded-full text-[6px] md:text-[8px] font-black uppercase tracking-widest ${badgeClass}`}>
                      LIVRE
                    </div>
                  )}
                  
                  {/* Subtle Background Glow */}
                  {isBusy && (
                     <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-3">
            {myOrders.length === 0 ? (
              <div className="text-center py-32 space-y-4 opacity-20">
                <ShoppingBag size={64} className="mx-auto" />
                <p className="font-black uppercase tracking-widest">Nenhum pedido ativo</p>
              </div>
            ) : (
              myOrders.map(o => (
                <div key={o.id} onClick={() => setSelectedTable({id: o.tableId, name: o.tableId})} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm hover:border-red-500 hover:shadow-xl cursor-pointer transition-all animate-fade-in group">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Origem:</span>
                       <h3 className="font-black text-xl md:text-2xl text-slate-800 italic uppercase">#{o.tableId}</h3>
                    </div>
                    <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Atendente: {o.waiterName}</p>
                  </div>
                  <div className="text-right flex items-center gap-4 md:gap-6">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black uppercase opacity-20 font-sans tracking-widest">Valor</p>
                      <p className="text-xl md:text-2xl font-black text-red-600 italic tracking-tighter font-sans">R$ {o.total.toFixed(2)}</p>
                    </div>
                    <ChevronRight className="opacity-20 group-hover:text-red-600 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Logic Modals */}
      {selectedTable && (
        <OrderModal 
          table={selectedTable} 
          currentOrder={getTableOrder(selectedTable.id)}
          products={products}
          categories={categories}
          onClose={() => setSelectedTable(null)} 
          onCheckout={(order) => { 
            setCheckoutOrder(order); 
            setSelectedTable(null); 
          }}
        />
      )}

      {checkoutOrder && (
        <CheckoutModal 
          order={checkoutOrder} 
          pixConfig={pixConfig}
          onClose={() => setCheckoutOrder(null)} 
          onFinish={(payment) => {
            closeOrder(checkoutOrder.id, payment);
            setCheckoutOrder(null);
          }}
        />
      )}
    </div>
  );
}

function OrderModal({ table, currentOrder, products, categories, onClose, onCheckout }) {
  const { addOrder } = useStore();
  const [cart, setCart] = useState(currentOrder ? currentOrder.items : []);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const total = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const handleSave = () => {
    if (cart.length === 0) return;
    addOrder({ tableId: table.id, items: cart, total });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-6xl h-[94vh] md:h-[90vh] rounded-t-[4rem] md:rounded-[4rem] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-white relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">#{table.id}</span>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase">Gerenciar Mesa</h2>
            </div>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2 px-1">Lançamento rápido de pedidos</p>
          </div>
          <button onClick={onClose} className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-red-500 hover:text-white transition-all duration-300">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar bg-white min-h-0">
            <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar">
              {categories.map(c => (
                <button 
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border-2
                    ${selectedCategory === c ? 'bg-red-600 border-red-600 text-white shadow-2xl shadow-red-600/30' : 'bg-white border-slate-100 text-slate-400 hover:border-red-200'}
                  `}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
              {products.filter(p => p.category === selectedCategory && p.active).map(p => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)}
                  className="bg-slate-50 border-2 border-transparent p-6 rounded-[2.5rem] text-left hover:border-red-500 hover:bg-white active:scale-95 transition-all group flex flex-col justify-between h-40 shadow-sm"
                >
                  <div>
                    <h4 className="font-black text-sm text-slate-800 leading-tight uppercase italic group-hover:text-red-600 transition-colors">{p.name}</h4>
                    <p className="text-[8px] font-black opacity-20 uppercase tracking-widest mt-1">Disponível</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-slate-400 group-hover:text-red-600 transition-colors font-sans">R$ {p.price.toFixed(2)}</p>
                    <div className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all">
                      <Plus size={20} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:w-[400px] bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-4 shrink-0 h-[45vh] md:h-auto md:p-10 flex flex-col shadow-inner">
            <div className="flex items-center gap-3 mb-4 md:mb-8 opacity-20">
              <ShoppingBag size={16} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Itens na Mesa</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 pr-1 no-scrollbar min-h-0 md:min-h-[200px]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center gap-2 md:gap-4">
                  <Plus size={32} className="md:w-12 md:h-12" />
                  <p className="font-black text-xs uppercase tracking-widest">Mesa vazia</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200/50 transition-all hover:shadow-md animate-slide-up">
                    <div className="flex-1">
                      <p className="font-black text-xs text-slate-800 uppercase italic">{item.name}</p>
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-tighter mt-0.5 font-sans">R$ {item.price.toFixed(2)} / un</p>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <button onClick={() => setCart(c => c.map(x => x.id === item.id ? {...x, qty: Math.max(0, x.qty - 1)} : x).filter(x => x.qty > 0))} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-red-600 shadow-sm transition-colors"><Minus size={18} /></button>
                      <span className="font-black text-lg w-6 text-center tracking-tighter font-sans">{item.qty}</span>
                      <button onClick={() => setCart(c => c.map(x => x.id === item.id ? {...x, qty: x.qty + 1} : x))} className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 hover:text-red-600 shadow-sm transition-colors"><Plus size={18} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 md:mt-8 pt-4 md:pt-10 border-t border-slate-200">
              <div className="flex justify-between items-end mb-4 md:mb-10 px-2">
                <span className="font-black opacity-20 uppercase text-xs tracking-widest italic">Total Parcial</span>
                <div className="text-right">
                  <span className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic block font-sans">R$ {total.toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button 
                  onClick={handleSave} 
                  disabled={cart.length === 0}
                  className="bg-slate-900 disabled:opacity-30 text-white font-black py-4 md:py-7 rounded-3xl md:rounded-[2.5rem] text-[10px] md:text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                >
                  Salvar
                </button>
                <button 
                  onClick={() => onCheckout({ ...currentOrder, items: cart, total, tableId: table.id, id: currentOrder?.id || Date.now() })} 
                  disabled={cart.length === 0}
                  className="bg-red-600 disabled:opacity-30 text-white font-black py-4 md:py-7 rounded-3xl md:rounded-[2.5rem] text-[10px] md:text-xs uppercase tracking-widest active:scale-95 transition-all shadow-2xl shadow-red-600/30"
                >
                  Pagar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ order, pixConfig, onClose, onFinish }) {
  const [method, setMethod] = useState('Dinheiro');
  const [received, setReceived] = useState('');
  const change = Math.max(0, (parseFloat(received) || 0) - order.total);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-2xl animate-slide-up border border-white/20">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter italic uppercase">Pagamento</h2>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-1 px-1">Selecione o método</p>
          </div>
          <button onClick={onClose} className="p-5 bg-slate-50 rounded-3xl text-slate-300 hover:bg-red-500 hover:text-white transition-all"><X size={24} /></button>
        </div>

        <div className="p-10 space-y-10">
          <div className="bg-slate-900 p-8 rounded-[3rem] text-center shadow-inner relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 relative z-10">Total da Mesa #{order.tableId}</p>
            <h3 className="text-6xl font-black text-white tracking-tighter italic relative z-10 font-sans">R$ {order.total.toFixed(2)}</h3>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'Dinheiro', icon: <Banknote size={24} /> },
              { id: 'PIX', icon: <Smartphone size={24} /> },
              { id: 'Cartão', icon: <CreditCard size={24} /> }
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)} className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all font-black text-[10px] uppercase tracking-widest ${method === m.id ? 'bg-red-600 border-red-600 text-white shadow-2xl shadow-red-600/30 scale-105' : 'bg-white border-slate-100 text-slate-300 opacity-60 hover:opacity-100'}`}>
                <div className={`${method === m.id ? 'text-white' : 'text-slate-300'}`}>{m.icon}</div>
                {m.id}
              </button>
            ))}
          </div>

          <div className="animate-fade-in min-h-[220px] flex flex-col justify-center">
            {method === 'Dinheiro' && (
              <div className="space-y-6">
                <div className="relative group">
                   <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-3xl text-slate-200 transition-colors group-focus-within:text-green-500 font-sans">R$</span>
                  <input 
                    autoFocus 
                    type="number" 
                    placeholder="0,00" 
                    className="w-full bg-slate-50 border-2 border-slate-100 p-8 pl-20 rounded-[2.5rem] outline-none focus:border-green-500 font-black text-4xl transition-all shadow-inner font-sans" 
                    value={received} 
                    onChange={e => setReceived(e.target.value)} 
                  />
                </div>
                {received && (
                  <div className="bg-green-500 p-8 rounded-[2.5rem] flex justify-between items-center shadow-xl shadow-green-500/20 animate-slide-up">
                    <span className="font-black text-[10px] uppercase tracking-widest text-white/60">Troco a devolver</span>
                    <span className="text-4xl font-black text-white tracking-tighter italic font-sans">R$ {change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {method === 'PIX' && (
              <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
                {pixConfig.qrCode ? (
                  <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <img src={pixConfig.qrCode} className="w-48 h-48 rounded-3xl" />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-2">
                    <Receipt size={48} className="opacity-20" />
                    <span className="text-[8px] font-black uppercase">Sem QR Code</span>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Chave para Copiar</p>
                  <p className="font-black text-xl text-slate-800 break-all select-all px-4 py-2 bg-slate-50 rounded-2xl italic tracking-tight">{pixConfig.key || 'DADOS NÃO CADASTRADOS'}</p>
                </div>
              </div>
            )}

            {method === 'Cartão' && (
              <div className="flex flex-col items-center justify-center h-full gap-6 opacity-20 py-10">
                <CreditCard size={80} className="animate-pulse" />
                <p className="font-black text-sm uppercase tracking-widest italic">Aguardando maquininha...</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 pt-0">
          <button 
            onClick={() => onFinish({ method, received, change })} 
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-8 rounded-full text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 group"
          >
            <CheckCircle2 size={32} className="group-hover:text-green-500 transition-colors" /> FINALIZAR E LIBERAR
          </button>
        </div>
      </div>
    </div>
  );
}
