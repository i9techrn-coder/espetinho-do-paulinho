import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { products as defaultProducts, categories as defaultCategories } from '../data/products';
import { 
  BarChart3, Package, ClipboardList, Settings, 
  DollarSign, ShoppingCart, CheckCircle, Users,
  Power, Edit2, Trash2, Search, Plus, Clock,
  Smartphone, Upload, X, Save, Calendar, Shield, LayoutGrid, Key, RefreshCw, Check, LogOut
} from 'lucide-react';

export default function AdminPanel() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const { 
    isStoreOpenManual, toggleStore, 
    team, setTeam, 
    pixConfig, setPixConfig, 
    categories, setCategories, 
    products, setProducts,
    schedule, setSchedule,
    tables, setTables,
    orders, logout, currentUser
  } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={20} /> },
    { id: 'produtos', label: 'Produtos', icon: <Package size={20} /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ClipboardList size={20} /> },
    { id: 'equipe', label: 'Equipe', icon: <Users size={20} /> },
    { id: 'mesas', label: 'Mesas', icon: <LayoutGrid size={20} /> },
    { id: 'horarios', label: 'Horários', icon: <Calendar size={20} /> },
    { id: 'config', label: 'Geral', icon: <Settings size={20} /> },
  ];

  const handleResetToDefaults = () => {
    if(confirm('Isso irá substituir seus produtos atuais pelos produtos oficiais (Asa, Calabresa, etc) e categorias. Deseja continuar?')) {
      setProducts(defaultProducts);
      setCategories(defaultCategories);
      alert('Produtos restaurados com sucesso!');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 fixed h-full z-40 shadow-xl shadow-slate-200/50 transition-all duration-300">
        <div className="flex items-center gap-4 px-3 mb-12 overflow-hidden py-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 font-black italic text-xl shadow-lg ring-4 ring-red-50">P</div>
          <div className="hidden md:block">
            <span className="font-black text-lg leading-tight uppercase italic block">Admin</span>
            <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">Espetinho Paulinho</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm relative group
                ${activeMenu === item.id ? 'bg-red-600 text-white shadow-2xl shadow-red-600/30 active:scale-95' : 'text-slate-400 hover:bg-slate-50'}
              `}
            >
              <div className={activeMenu === item.id ? 'scale-110 transition-transform' : ''}>{item.icon}</div>
              <span className="hidden md:block uppercase tracking-widest text-[10px]">{item.label}</span>
              {activeMenu === item.id && <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full hidden md:block" />}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100 px-2 space-y-3">
           <button 
            onClick={handleResetToDefaults}
            className="w-full p-4 rounded-2xl text-[8px] font-black transition-all flex items-center justify-center gap-2 hover:bg-slate-50 text-slate-400 uppercase tracking-widest"
          >
            <RefreshCw size={12} />
            <span className="hidden md:block">Restaurar Menu</span>
          </button>
          
          <button 
            onClick={toggleStore}
            className={`w-full p-4 md:p-5 rounded-2xl text-[10px] font-black transition-all flex flex-col md:flex-row items-center justify-center gap-2 active:scale-95 shadow-xl
              ${isStoreOpenManual 
                ? 'bg-green-600 text-white shadow-green-600/20 hover:bg-green-700' 
                : 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700'}
            `}
          >
            <div className={`p-2 rounded-xl bg-white/20 ${isStoreOpenManual ? 'animate-pulse' : ''}`}>
              <Power size={14} />
            </div>
            <div className="flex flex-col items-center md:items-start leading-none gap-1">
              <span className="hidden md:block uppercase tracking-[0.1em] text-[8px] opacity-70">Status Loja</span>
              <span className="uppercase tracking-widest text-[9px]">{isStoreOpenManual ? 'Aberta' : 'Fechada'}</span>
            </div>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full p-4 rounded-2xl text-[10px] font-black transition-all flex items-center justify-center md:justify-start gap-4 hover:bg-red-50 text-slate-300 hover:text-red-600 uppercase tracking-widest"
          >
            <LogOut size={16} />
            <span className="hidden md:block">Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 animate-fade-in pb-32">
        {activeMenu === 'dashboard' && <AdminDashboard waiters={team} orders={orders} />}
        {activeMenu === 'produtos' && <AdminProducts categories={categories} products={products} setProducts={setProducts} setCategories={setCategories} />}
        {activeMenu === 'pedidos' && <AdminOrders orders={orders} />}
        {activeMenu === 'equipe' && <AdminTeam team={team} setTeam={setTeam} tables={tables} />}
        {activeMenu === 'mesas' && <AdminTables tables={tables} setTables={setTables} />}
        {activeMenu === 'horarios' && <AdminSchedule schedule={schedule} setSchedule={setSchedule} />}
        {activeMenu === 'config' && <AdminConfig pixConfig={pixConfig} setPixConfig={setPixConfig} />}
      </main>
    </div>
  );
}

function AdminDashboard({ waiters, orders }) {
  const [period, setPeriod] = useState('Dia');

  const isWithinPeriod = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (period === 'Dia') {
      return date.toLocaleDateString() === now.toLocaleDateString();
    }
    if (period === 'Semana') {
      const diff = now - date;
      const days = diff / (1000 * 60 * 60 * 24);
      return days <= 7;
    }
    if (period === 'Mês') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (period === 'Ano') {
      return date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredOrders = orders.filter(o => isWithinPeriod(o.timestamp));
  const revenue = filteredOrders.filter(o => o.status === 'finalizado').reduce((acc, curr) => acc + curr.total, 0);
  const openCount = filteredOrders.filter(o => o.status === 'aberto').length;
  const salesCount = filteredOrders.filter(o => o.status === 'finalizado').length;

  // Product sales summary
  const productSales = {};
  filteredOrders.filter(o => o.status === 'finalizado').forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { qty: 0, total: 0 };
      }
      productSales[item.name].qty += item.qty;
      productSales[item.name].total += item.price * item.qty;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 10);

  return (
    <div className="space-y-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Dash<span className="text-red-600">board</span></h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.3em] mt-2">Visão geral • {period}</p>
        </div>
        <div className="flex bg-white rounded-2xl p-1.5 shadow-xl shadow-slate-200/50 border border-slate-100 w-full md:w-auto overflow-x-auto no-scrollbar">
          {['Dia', 'Semana', 'Mês', 'Ano'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`flex-1 md:flex-none px-6 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${period === p ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Bruto Finalizado', value: `R$ ${revenue.toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Mesas Abertas', value: openCount, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pedidos Concluídos', value: salesCount, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Ticket Médio', value: `R$ ${(revenue / Math.max(1, salesCount)).toFixed(2)}`, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 blur-2xl opacity-50`} />
            <p className="text-[9px] font-black uppercase opacity-20 tracking-widest mb-2 relative z-10">{stat.label}</p>
            <h3 className={`text-2xl md:text-3xl font-black ${stat.color} tracking-tighter italic relative z-10 font-sans`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter italic uppercase">Produtos <span className="text-red-600">Mais Vendidos</span></h3>
        <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/20">
          {topProducts.length === 0 ? (
            <div className="p-12 text-center opacity-30 italic font-black uppercase text-[10px] tracking-widest">Nenhum dado para este período</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-[9px] md:text-[10px] uppercase font-black opacity-30 border-b border-slate-100">
                    <th className="px-8 py-6 md:px-12 md:py-10">Produto</th>
                    <th className="px-8 py-6 md:px-12 md:py-10 text-center">Quantidade</th>
                    <th className="px-8 py-6 md:px-12 md:py-10 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topProducts.map(([name, data]) => (
                    <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 md:px-12 md:py-8">
                        <p className="font-black text-slate-800 italic uppercase text-sm md:text-base">{name}</p>
                      </td>
                      <td className="px-8 py-6 md:px-12 md:py-8 text-center font-black text-slate-400 font-sans">{data.qty}x</td>
                      <td className="px-8 py-6 md:px-12 md:py-8 text-right font-black text-red-600 text-lg md:text-xl tracking-tighter italic font-sans">R$ {data.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminProducts({ categories, products, setProducts, setCategories }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: '', category: '', active: true, description: '' });
  const [newCat, setNewCat] = useState('');

  const handleAddProduct = () => {
    if (!newProd.name || !newProd.price || !newProd.category) return;
    setProducts([...products, { ...newProd, id: Date.now(), price: parseFloat(newProd.price) }]);
    setIsModalOpen(false);
    setNewProd({ name: '', price: '', category: '', active: true, description: '' });
  };

  const deleteProduct = (id) => {
    if(confirm('Deseja excluir este produto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-10 max-w-7xl">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Gerenciar <span className="text-red-600">Itens</span></h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{products.length} itens no cardápio</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsCatModalOpen(true)} className="bg-white border-2 border-slate-100 px-6 md:px-8 py-4 md:py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-sm">Categorias</button>
          <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3"><Plus size={18} /> Novo Item</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead><tr className="text-[10px] uppercase font-black opacity-30 border-b border-slate-100"><th className="px-8 md:px-12 py-8 md:py-10">Protudo</th><th className="px-8 md:px-12 py-8 md:py-10">Categoria</th><th className="px-8 md:px-12 py-8 md:py-10">Preço (R$)</th><th className="px-8 md:px-12 py-8 md:py-10 text-right">Status / Ação</th></tr></thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 md:px-12 py-6 md:py-8">
                    <p className="font-black text-slate-800 italic uppercase">{p.name}</p>
                  </td>
                  <td className="px-8 md:px-12 py-6 md:py-8">
                    <span className="bg-slate-100 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-tighter opacity-50">{p.category}</span>
                  </td>
                  <td className="px-8 md:px-12 py-6 md:py-8 font-black text-red-600 text-xl md:text-2xl tracking-tighter italic font-sans">R$ {p.price.toFixed(2)}</td>
                  <td className="px-8 md:px-12 py-6 md:py-8 text-right space-x-2">
                    <button onClick={() => setProducts(products.map(x => x.id === p.id ? {...x, active: !x.active } : x))} className={`p-4 rounded-2xl border-2 transition-all ${p.active ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                      <Power size={18} />
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="p-4 rounded-2xl border-2 border-slate-100 text-slate-300 hover:border-red-500 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in px-4">
          <div className="bg-white w-full max-w-lg p-12 rounded-[4rem] shadow-2xl relative animate-slide-up border border-white/20">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-10 top-10 text-slate-300 hover:text-red-600 transition-all"><X size={32} /></button>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-10">Novo Item</h3>
            <div className="space-y-6">
              <input className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold transition-all" placeholder="Nome do Produto" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
              <div className="relative">
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 font-sans">R$</span>
                 <input className="w-full bg-slate-50 border-2 border-slate-50 p-6 pl-14 rounded-3xl outline-none focus:border-red-600 font-black text-2xl font-sans" type="number" placeholder="0,00" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} />
              </div>
              <select className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold appearance-none cursor-pointer uppercase text-xs tracking-widest" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
                <option value="" disabled>Escolha a categoria</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold h-24" placeholder="Descrição (opcional)..." value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} />
              <button onClick={handleAddProduct} className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest italic">CADASTRAR PRODUTO</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in px-4">
          <div className="bg-white w-full max-w-lg p-12 rounded-[4rem] shadow-2xl relative animate-slide-up border border-white/20">
            <button onClick={() => setIsCatModalOpen(false)} className="absolute right-10 top-10 text-slate-300 hover:text-red-600 transition-all"><X size={32} /></button>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-10">Categorias</h3>
            <div className="space-y-3 mb-10 max-h-[40vh] overflow-y-auto pr-2 no-scrollbar">
              {categories.map(c => (
                <div key={c} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex justify-between items-center font-black italic uppercase text-sm group">
                  <span className="group-hover:text-red-600 transition-colors uppercase">{c}</span>
                  <button onClick={() => setCategories(categories.filter(x => x !== c))} className="text-slate-200 hover:text-red-600 transition-all"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input className="flex-1 bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold uppercase text-xs" placeholder="Nova Categoria..." value={newCat} onChange={e => setNewCat(e.target.value.toUpperCase())} />
              <button onClick={() => { if(newCat) setCategories([...categories, newCat]); setNewCat(''); }} className="bg-slate-900 text-white p-6 rounded-3xl active:scale-90 transition-all shadow-xl hover:bg-black"><Plus size={24}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOrders({ orders }) {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [originFilter, setOriginFilter] = useState('Online');

  const filteredOrders = orders.filter(o => {
    const matchesDate = !dateFilter || new Date(o.timestamp).toISOString().split('T')[0] === dateFilter;
    const matchesOrigin = !originFilter || o.origin === originFilter;
    return matchesDate && matchesOrigin;
  });

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Histó<span className="text-red-600">rico</span></h2>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{filteredOrders.length} pedidos encontrados</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50">
            <Calendar size={18} className="text-slate-300 ml-2" />
            <input 
              type="date" 
              className="bg-transparent font-black uppercase text-[10px] tracking-widest outline-none cursor-pointer" 
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 transition-colors"><X size={14}/></button>
            )}
          </div>
        </div>

        {/* Origin Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Online', 'Mesa', 'Balcão'].map(filter => (
            <button 
              key={filter}
              onClick={() => setOriginFilter(filter)}
              className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 whitespace-nowrap
                ${originFilter === filter ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}
            >
              {filter}
            </button>
          ))}
          <button 
            onClick={() => setOriginFilter('')}
            className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 whitespace-nowrap
              ${originFilter === '' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}
          >
            Todos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3.5rem] border border-slate-100 text-center opacity-30 font-black italic uppercase tracking-widest text-[10px]">Nenhum pedido registrado com este filtro</div>
        ) : (
          filteredOrders.slice().reverse().map(o => (
            <div key={o.id} className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 flex flex-col items-stretch justify-between shadow-xl shadow-slate-200/20 transition-all hover:scale-[1.01] relative overflow-hidden group">
              <div className={`absolute left-0 top-0 w-2 h-full ${o.status === 'finalizado' ? 'bg-green-500' : 'bg-red-500'}`} />
              
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 text-left w-full">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center font-black italic border border-slate-100 uppercase tracking-tighter shrink-0
                  ${o.origin === 'Online' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-50 text-slate-300'}`}>
                  <span className="text-[8px] opacity-60">{o.origin}</span>
                  <span className="text-xl md:text-2xl">{o.origin === 'Mesa' ? o.tableId : '#'}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[9px] font-black uppercase opacity-20 tracking-[0.2em]">{new Date(o.timestamp).toLocaleString()}</p>
                    <span className="text-[8px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-md uppercase tracking-widest italic">{o.origin}</span>
                  </div>
                  
                  <h4 className="font-black text-slate-800 text-lg md:text-xl italic uppercase mb-2">{o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</h4>
                  
                  {o.origin === 'Online' && o.customerData && (
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-3 mb-4 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <User size={14} className="text-red-500" />
                        <span className="font-black text-xs uppercase italic">{o.customerData.name}</span>
                        <span className="text-[10px] font-bold opacity-30">• {o.customerData.phone}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="text-[10px] font-bold opacity-60 leading-relaxed break-all">{o.customerData.address}</span>
                      </div>
                      {o.customerData.obs && (
                        <div className="flex items-center gap-3 text-red-600 text-[10px] font-black uppercase italic">
                           <X size={14} /> Obs: {o.customerData.obs}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                     <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${o.status === 'finalizado' ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}>{o.status}</span>
                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Atende: <span className="text-slate-900">{o.waiterName || 'Sistema'}</span></span>
                     {(o.payment || (o.customerData && o.customerData.payment)) && (
                       <span className="text-[8px] font-black px-3 py-1.5 bg-green-500 text-white rounded-full uppercase tracking-widest italic flex items-center gap-1">
                         <CheckCircle size={10} /> {o.payment?.method || o.customerData?.payment}
                       </span>
                     )}
                  </div>
                </div>

                <div className="text-left md:text-right mt-4 md:mt-0 w-full md:w-auto flex md:block justify-between items-end border-t md:border-t-0 pt-4 md:pt-0">
                  <span className="text-[10px] md:hidden font-black uppercase opacity-20 italic">Total</span>
                  <span className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic block font-sans">R$ {o.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AdminTeam({ team, setTeam, tables }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', login: '', password: '', role: 'Garçom', active: true, assignedTables: 'todas' });

  const handleOpenCreate = () => {
    setEditingMember(null);
    setUserForm({ name: '', login: '', password: '', role: 'Garçom', active: true, assignedTables: 'todas' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingMember(member);
    setUserForm({ ...member });
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if(!userForm.name || !userForm.login || !userForm.password) return;
    if (editingMember) {
      setTeam(team.map(u => u.id === editingMember.id ? { ...userForm } : u));
    } else {
      setTeam([...team, { ...userForm, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const toggleTable = (tableId) => {
    let current = userForm.assignedTables === 'todas' 
      ? tables.map(t => t.id.toString()).join(',') 
      : userForm.assignedTables;
    
    let list = current ? current.split(',') : [];
    if (list.includes(tableId.toString())) {
      list = list.filter(id => id !== tableId.toString());
    } else {
      list.push(tableId.toString());
    }
    
    setUserForm({ ...userForm, assignedTables: list.length === tables.length ? 'todas' : list.join(',') });
  };

  return (
    <div className="space-y-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Equipe <span className="text-red-600">&</span> Staff</h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{team.length} membros ativos</p>
        </div>
        <button onClick={handleOpenCreate} className="bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3"><Plus size={18} /> Novo Membro</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {team.map(w => (
          <div key={w.id} className="bg-white p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/10 transition-all hover:shadow-2xl relative overflow-hidden group">
             <div className="flex items-start justify-between mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center font-black text-2xl md:text-3xl text-slate-200 italic transition-all group-hover:border-red-600 group-hover:text-red-600 uppercase">{w.name[0]}</div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${w.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{w.active ? 'Ativo' : 'Off'}</div>
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase tracking-tighter">{w.name}</h3>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-1 mb-6">{w.role}</p>
                <div className="space-y-2">
                   <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl md:rounded-3xl border border-slate-100">
                      <Shield size={14} className="opacity-20" />
                      <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Login: {w.login}</span>
                   </div>
                   <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl md:rounded-3xl border border-slate-100 text-[10px] font-black uppercase tracking-widest">
                      <LayoutGrid size={14} className="opacity-20" /> Mesas: {w.assignedTables === 'todas' ? 'Todas' : w.assignedTables}
                   </div>
                </div>
             </div>
             <div className="mt-8 flex gap-3">
                <button onClick={() => handleOpenEdit(w)} className="flex-1 bg-white border-2 border-slate-100 py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-red-600 hover:text-red-600 transition-all">Editar</button>
                <button onClick={() => setTeam(team.map(x => x.id === w.id ? {...x, active: !x.active} : x))} className={`w-14 rounded-xl md:rounded-2xl border-2 flex items-center justify-center transition-all ${w.active ? 'bg-slate-50 border-slate-100 text-slate-300' : 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'}`}><Power size={18} /></button>
             </div>
          </div>
        ))}
      </div>

       {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in px-4">
          <div className="bg-white w-full max-w-2xl p-12 rounded-[4rem] shadow-2xl relative animate-slide-up border border-white/20 max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-10 top-10 text-slate-300 hover:text-red-600 transition-all"><X size={32} /></button>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-10">{editingMember ? 'Editar Membro' : 'Novo Membro'}</h3>
            <div className="space-y-8">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase opacity-20 tracking-widest block px-2">Identificação</label>
                 <input className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold" placeholder="Nome Completo" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold" placeholder="Usuário" value={userForm.login} onChange={e => setUserForm({...userForm, login: e.target.value})} />
                    <input className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold" type="password" placeholder="Senha" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase opacity-20 tracking-widest block px-2">Função</label>
                 <select className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold uppercase text-xs tracking-widest appearance-none cursor-pointer" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                    <option value="Garçom">Garçom</option>
                    <option value="Balconista">Balconista</option>
                    <option value="Gestor">Gestor</option>
                 </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                   <label className="text-[10px] font-black uppercase opacity-20 tracking-widest block">Mesas Atendidas</label>
                   <button 
                    onClick={() => setUserForm({ ...userForm, assignedTables: userForm.assignedTables === 'todas' ? '' : 'todas' })}
                    className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${userForm.assignedTables === 'todas' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                   >
                     Selecionar Todas
                   </button>
                </div>
                
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-4 bg-slate-50 rounded-[2.5rem] border-2 border-slate-50 no-scrollbar">
                  {[...tables, {id: 'Balcão', name: 'Balcão'}, {id: 'Online', name: 'Online'}].map(t => {
                    const isSelected = userForm.assignedTables === 'todas' || userForm.assignedTables.split(',').includes(t.id.toString());
                    return (
                      <button 
                        key={t.id}
                        onClick={() => toggleTable(t.id)}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 group
                          ${isSelected ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-transparent text-slate-300 opacity-60'}
                        `}
                      >
                        <span className="text-[8px] font-black uppercase group-hover:scale-110 transition-transform">{t.name}</span>
                        {isSelected && <Check size={10} className="animate-in zoom-in" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={handleSaveUser} className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest italic">{editingMember ? 'SALVAR ALTERAÇÕES' : 'CONTRATAR COLABORADOR'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminTables({ tables, setTables }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTable, setNewTable] = useState({ name: '' });

  const handleAddTable = () => {
    if(!newTable.name) return;
    setTables([...tables, { id: tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1, name: newTable.name }]);
    setIsModalOpen(false);
    setNewTable({ name: '' });
  };

  return (
    <div className="space-y-10 max-w-7xl">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Gestão <span className="text-red-600">de Mesas</span></h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{tables.length} mesas cadastradas</p>
        </div>
        <div className="flex gap-4">
           <button onClick={() => { if(confirm('Gerar automaticamente Mesas 1 a 20?')) setTables(Array.from({length: 20}, (_,i) => ({id: i+1, name: `Mesa ${i+1}`}))) }} className="bg-white border-2 border-slate-100 px-6 md:px-8 py-4 md:py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all hover:bg-slate-50 active:scale-95 shadow-sm">Gerar 1-20</button>
           <button onClick={() => setIsModalOpen(true)} className="bg-slate-900 text-white px-8 md:px-10 py-4 md:py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3"><Plus size={18} /> Nova Mesa</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        {tables.map(t => (
          <div key={t.id} className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 group transition-all hover:border-red-500 hover:shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 rounded-full -mr-8 -mt-8 opacity-5" />
             <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">Mesa</span>
             <h4 className="text-2xl md:text-3xl font-black text-slate-800 italic uppercase tracking-tighter">{t.name || t.id}</h4>
             <button onClick={() => setTables(tables.filter(x => x.id !== t.id))} className="text-slate-200 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-fade-in px-4">
          <div className="bg-white w-full max-w-lg p-12 rounded-[4rem] shadow-2xl relative animate-slide-up border border-white/20">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-10 top-10 text-slate-300 hover:text-red-600 transition-all"><X size={32} /></button>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter italic uppercase mb-10">Nova Mesa</h3>
            <div className="space-y-6">
              <input className="w-full bg-slate-50 border-2 border-slate-50 p-6 rounded-3xl outline-none focus:border-red-600 font-bold" placeholder="Nome da Mesa (Ex: Mesa 21)" value={newTable.name} onChange={e => setNewTable({ name: e.target.value })} />
              <button onClick={handleAddTable} className="w-full bg-slate-900 text-white font-black py-8 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-sm uppercase tracking-widest italic">CADASTRAR MESA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSchedule({ schedule, setSchedule }) {
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Horá<span className="text-red-600">rios</span></h2>
        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-2">Configuração semanal automática</p>
      </div>

      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/30 p-6 md:p-10 space-y-4">
        {Object.entries(schedule).map(([day, config]) => (
          <div key={day} className={`flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-3xl transition-all ${config.active ? 'bg-slate-50 border border-slate-100' : 'bg-white border-2 border-slate-50 opacity-30 shadow-inner grayscale'}`}>
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setSchedule({...schedule, [day]: {...config, active: !config.active}})}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all ${config.active ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}
              >
                 <Power size={20} />
              </button>
              <div>
                 <h4 className="font-black text-base md:text-lg italic uppercase tracking-tighter text-slate-800">{day}</h4>
                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{config.active ? 'Loja Operante' : 'Pausado'}</p>
              </div>
            </div>

            {config.active && (
              <div className="flex items-center gap-4 md:gap-10">
                 <div className="space-y-1">
                   <span className="text-[8px] font-black uppercase opacity-20 block text-center">Abre</span>
                   <input type="time" className="bg-white border-2 border-slate-200 px-3 md:px-4 py-2 rounded-xl font-bold font-sans outline-none focus:border-red-500 transition-all shadow-sm text-xs md:text-base" value={config.open} onChange={e => setSchedule({...schedule, [day]: {...config, open: e.target.value}})} />
                 </div>
                 <div className="w-4 h-0.5 bg-slate-200 hidden sm:block" />
                 <div className="space-y-1">
                   <span className="text-[8px] font-black uppercase opacity-20 block text-center">Fecha</span>
                   <input type="time" className="bg-white border-2 border-slate-200 px-3 md:px-4 py-2 rounded-xl font-bold font-sans outline-none focus:border-red-500 transition-all shadow-sm text-xs md:text-base" value={config.close} onChange={e => setSchedule({...schedule, [day]: {...config, close: e.target.value}})} />
                 </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="pt-10">
           <button className="w-full bg-slate-900 text-white font-black py-6 md:py-7 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl active:scale-95 transition-all text-[10px] md:text-xs uppercase tracking-[0.2em] italic flex items-center justify-center gap-4">
              <Save size={20} /> Salvar Alterações
           </button>
        </div>
      </div>
    </div>
  );
}

function AdminConfig({ pixConfig, setPixConfig }) {
  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPixConfig({ ...pixConfig, qrCode: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Gerenci<span className="text-red-600">amento</span></h2>
        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">Dados vitais do estabelecimento</p>
      </div>
      
      <section className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600 rounded-full -mr-24 -mt-24 blur-3xl opacity-5" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-white shadow-xl"><Smartphone size={28} /></div>
          <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Pagamento PIX</h3>
        </div>
        
        <div className="space-y-8 relative z-10">
          <div>
            <label className="text-[10px] font-black uppercase opacity-20 tracking-[0.3em] block mb-3 pl-2">Chave PIX Oficial</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 p-5 md:p-6 rounded-2xl md:rounded-[2rem] outline-none focus:border-red-600 font-bold transition-all shadow-inner italic" 
              placeholder="Ex: seu@email.com ou CNPJ..." 
              value={pixConfig.key} 
              onChange={e => setPixConfig({ ...pixConfig, key: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-20 tracking-[0.3em] block mb-6 pl-2">Upload do QR Code (Base64)</label>
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              {pixConfig.qrCode ? (
                <div className="relative group">
                  <div className="bg-white p-4 rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100">
                    <img src={pixConfig.qrCode} className="w-40 h-40 md:w-44 md:h-44 rounded-2xl md:rounded-3xl object-cover" />
                  </div>
                  <button onClick={() => setPixConfig({...pixConfig, qrCode: ''})} className="absolute -top-3 -right-3 bg-red-600 text-white w-10 h-10 rounded-full shadow-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 border-4 border-white"><X size={20}/></button>
                </div>
              ) : (
                <label className="w-40 h-40 md:w-44 md:h-44 rounded-[3rem] md:rounded-[3.5rem] bg-slate-50 border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-red-600 transition-all group shadow-inner">
                  <Upload className="text-slate-200 group-hover:text-red-600 transition-all scale-125" />
                  <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.1em]">Selecionar Imagem</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                </label>
              )}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-[10px] font-bold opacity-30 leading-relaxed italic uppercase tracking-tighter">O QR Code aparecerá automaticamente para o garçom durante o fechamento de mesas.</p>
              </div>
            </div>
          </div>

          <button className="w-full bg-slate-900 text-white font-black py-6 md:py-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 text-xs md:text-sm uppercase tracking-widest italic group overflow-hidden relative">
            <div className="absolute inset-0 bg-green-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Save size={24} className="relative z-10" /> <span className="relative z-10">GRAVAR DADOS NO SISTEMA</span>
          </button>
        </div>
      </section>
    </div>
  );
}
