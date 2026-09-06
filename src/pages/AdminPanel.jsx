import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  BarChart3, Package, ClipboardList, Settings, 
  DollarSign, ShoppingCart, CheckCircle, Users,
  Power, Edit2, Edit, Trash2, Search, Plus, Clock, User, MapPin,
  Smartphone, Upload, X, Save, Calendar, Shield, LayoutGrid, Key, RefreshCw, Check, LogOut,
  Volume2, VolumeX, Truck, Home, ShoppingBag, Minus
} from 'lucide-react';

const defaultCategories = ["CHURRASCO", "BEBIDAS ALCOÓLICAS", "BEBIDAS NÃO ALCOÓLICAS"];
const defaultProducts = [
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
  { name: "Caranguejo Ouro", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Caranguejo Prata", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Cerveja Devassa", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Cerveja Itaipava", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Heineken Long Neck", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Pitu Lata", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Pitu Limão", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Ypióca", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Doses (genérico)", price: 5.00, category: "BEBIDAS ALCOÓLICAS", active: true },
  { name: "Coca-Cola Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Guaraná 1L", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Guaraná Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Pepsi 1L", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Pepsi Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Sprite Lata", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true },
  { name: "Suco", price: 5.00, category: "BEBIDAS NÃO ALCOÓLICAS", active: true }
];

export default function AdminPanel() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [period, setPeriod] = useState('Dia');
  const [customDate, setCustomDate] = useState(new Date().toLocaleDateString('sv-SE'));
  const { 
    tenant,
    isStoreOpenManual, toggleStore, 
    team, setTeam, 
    pixConfig, setPixConfig, 
    contactConfig, setContactConfig,
    categories, setCategories, 
    products, setProducts, addProduct, editProduct, deleteProduct,
    orderMethods, setOrderMethods,
    schedule, setSchedule,
    tables, setTables,
    orders, logout, currentUser, updateOrderStatus, resetOrders
  } = useStore();

  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('jana_sound') === 'true');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const audioRef = useRef(new Audio('/notification.mp3'));
  const prevOrdersCount = useRef(orders.length);
  const navigate = useNavigate();

  useEffect(() => {
    if (soundEnabled && orders.length > prevOrdersCount.current) {
      const playSound = async () => {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
        } catch (e) {
          console.error("Audio play failed:", e);
        }
      };
      playSound();
    }
    prevOrdersCount.current = orders.length;
  }, [orders.length, soundEnabled]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('jana_sound', newState.toString());
  };

  const handleLogout = () => {
    logout();
    navigate(`/${tenant?.slug || ''}/login`);
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

  const handleResetToDefaults = async () => {
    if(confirm('Isso irá restaurar os produtos oficiais padrão (Asa, Calabresa, etc). Deseja continuar?')) {
      for (const p of defaultProducts) {
        await addProduct(p);
      }
      alert('Produtos restaurados com sucesso!');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-auto">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-24 lg:w-64 bg-white border-r border-slate-200 flex-col fixed h-full z-40 shadow-xl shadow-slate-200/50 transition-all duration-300 overflow-y-auto no-scrollbar">
        <div className="p-4 pb-12 flex-1 flex flex-col min-h-max gap-4">
        <div className="flex items-center gap-4 px-3 mb-12 overflow-hidden py-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0 font-black italic text-xl shadow-lg ring-4 ring-red-50">
            {tenant?.name ? tenant.name[0].toUpperCase() : 'E'}
          </div>
          <div className="hidden md:block">
            <span className="font-black text-lg leading-tight uppercase italic block">Admin</span>
            <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">{tenant?.name || 'Espeto Fácil'}</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
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
            onClick={toggleSound}
            className={`w-full p-4 md:p-5 rounded-2xl text-[10px] font-black transition-all flex flex-col md:flex-row items-center justify-center gap-2 active:scale-95 shadow-xl
              ${soundEnabled 
                ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700' 
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}
            `}
          >
            <div className={`p-2 rounded-xl ${soundEnabled ? 'bg-white/20 animate-pulse' : 'bg-slate-400/20'}`}>
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </div>
            <div className="flex flex-col items-center md:items-start leading-none gap-1">
              <span className="hidden md:block uppercase tracking-[0.1em] text-[8px] opacity-70">Aviso Sonoro</span>
              <span className="uppercase tracking-widest text-[9px]">{soundEnabled ? 'Ligado' : 'Desligado'}</span>
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
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] p-2 flex justify-around items-center border border-white/10 shadow-2xl text-white">
        {menuItems.slice(0, 5).map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveMenu(item.id)}
            className={`p-4 rounded-full transition-all ${activeMenu === item.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/40' : 'text-white/40'}`}
          >
            {item.icon}
          </button>
        ))}
        <button onClick={() => setActiveMenu('config')} className={`p-4 rounded-full transition-all ${activeMenu === 'config' ? 'bg-red-600 text-white' : 'text-white/40'}`}><Settings size={20}/></button>
      </nav>

      <main className="flex-1 md:ml-24 lg:ml-64 p-4 md:p-12 animate-fade-in pb-32 w-full min-w-[320px]">
        {activeMenu === 'dashboard' && <AdminDashboard orders={orders} products={products} resetOrders={resetOrders} />}
        {activeMenu === 'produtos' && <AdminProducts products={products} categories={categories} addProduct={addProduct} editProduct={editProduct} deleteProduct={deleteProduct} setCategories={setCategories} />}
        {activeMenu === 'pedidos' && <AdminOrders orders={orders} updateOrderStatus={updateOrderStatus} />}
        {activeMenu === 'equipe' && <AdminTeam team={team} setTeam={setTeam} tables={tables} />}
        {activeMenu === 'mesas' && <AdminTables tables={tables} setTables={setTables} />}
        {activeMenu === 'horarios' && <AdminSchedule schedule={schedule} setSchedule={setSchedule} />}
        {activeMenu === 'config' && <AdminConfig />}
      </main>
    </div>
  );
}

function AdminDashboard({ orders, products, resetOrders }) {
  const totalSales = orders.filter(o => o.status === 'finalizado').reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const openOrdersCount = orders.filter(o => o.status === 'aberto').length;
  const finishedOrdersCount = orders.filter(o => o.status === 'finalizado').length;

  return (
    <div className="space-y-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Dash<span className="text-red-600">board</span></h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">Visão geral do faturamento e vendas</p>
        </div>
        <button 
          onClick={() => { if (confirm('Zerar o histórico de vendas?')) resetOrders(); }} 
          className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
        >
          Zerar Vendas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-4">
          <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg"><DollarSign size={28} /></div>
          <div>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Total Faturado</span>
            <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter mt-1 font-sans">R$ {totalSales.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-4">
          <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><ShoppingCart size={28} /></div>
          <div>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Pedidos Abertos</span>
            <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter mt-1 font-sans">{openOrdersCount}</h3>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-4">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><CheckCircle size={28} /></div>
          <div>
            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Pedidos Finalizados</span>
            <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter mt-1 font-sans">{finishedOrdersCount}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminProducts({ products, categories, addProduct, editProduct, deleteProduct, setCategories }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', category: categories[0] || 'CHURRASCO', active: true });

  const handleOpenAdd = () => {
    setEditingProd(null);
    setForm({ name: '', price: '', category: categories[0] || 'CHURRASCO', active: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProd(prod);
    setForm({ name: prod.name, price: prod.price, category: prod.category, active: prod.active });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    if (editingProd) {
      await editProduct({ ...editingProd, name: form.name, price: parseFloat(form.price), category: form.category, active: form.active });
    } else {
      await addProduct({ name: form.name, price: parseFloat(form.price), category: form.category, active: form.active });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Gerenciar <span className="text-red-600">Produtos</span></h2>
          <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{products.length} itens cadastrados</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-3"><Plus size={18} /> Novo Produto</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex justify-between items-center">
            <div>
              <span className="text-[8px] font-black uppercase text-red-600 tracking-widest">{p.category}</span>
              <h4 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">{p.name}</h4>
              <p className="text-2xl font-black text-slate-900 font-sans mt-1">R$ {Number(p.price).toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleOpenEdit(p)} className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100"><Edit size={18} /></button>
              <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative space-y-6">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-red-600"><X size={24} /></button>
            <h3 className="text-2xl font-black uppercase italic">{editingProd ? 'Editar Produto' : 'Novo Produto'}</h3>
            <input className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold" placeholder="Nome do Produto" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold" type="number" step="0.5" placeholder="Preço (R$)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
            <select className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold uppercase text-xs" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={handleSave} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-xs">{editingProd ? 'SALVAR' : 'CRIAR'}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOrders({ orders, updateOrderStatus }) {
  return (
    <div className="space-y-10 max-w-7xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Lista de <span className="text-red-600">Pedidos</span></h2>
        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">{orders.length} pedidos no total</p>
      </div>

      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${o.status === 'aberto' ? 'bg-red-600 text-white' : 'bg-green-500 text-white'}`}>{o.status}</span>
                <span className="text-[10px] font-black opacity-40 uppercase">Origem: {o.origin}</span>
                {o.customerData?.name && <span className="text-[10px] font-black text-slate-700">Cliente: {o.customerData.name}</span>}
              </div>
              <div className="space-y-1">
                {o.items?.map((item, idx) => (
                  <p key={idx} className="text-xs font-bold text-slate-800">{item.qty}x {item.name}</p>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-2xl font-black text-slate-900 font-sans">R$ {(Number(o.total) || 0).toFixed(2)}</span>
              {o.status === 'aberto' && (
                <button onClick={() => updateOrderStatus(o.id, 'finalizado')} className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600">Finalizar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTeam({ team, setTeam, tables }) {
  return (
    <div className="space-y-10 max-w-7xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Equipe <span className="text-red-600">& Staff</span></h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(w => (
          <div key={w.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-4">
            <h3 className="text-2xl font-black text-slate-800 italic uppercase">{w.name}</h3>
            <p className="text-xs font-bold opacity-50 uppercase">{w.role} • Login: {w.login}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminTables({ tables, setTables }) {
  return (
    <div className="space-y-10 max-w-7xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Gestão <span className="text-red-600">de Mesas</span></h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {tables.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md text-center">
            <h4 className="text-2xl font-black text-slate-800 italic uppercase">{t.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSchedule({ schedule, setSchedule }) {
  const { updateSchedule } = useStore();
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Horá<span className="text-red-600">rios</span></h2>
      </div>
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 space-y-4">
        {Object.entries(schedule || {}).map(([day, config]) => (
          <div key={day} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
            <span className="font-black italic uppercase text-slate-800">{day}</span>
            <span className="font-black text-xs text-red-600">{config.active ? `${config.open} - ${config.close}` : 'Fechado'}</span>
          </div>
        ))}
        <button onClick={() => updateSchedule(schedule)} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-xs mt-6">Salvar Horários</button>
      </div>
    </div>
  );
}

function AdminConfig() {
  const { pixConfig, updatePixConfig, setPixConfig, contactConfig, updateContactConfig, setContactConfig, orderMethods, updateOrderMethods, deliveryFees, setDeliveryFees, updateDeliveryFees } = useStore();
  const [newBairro, setNewBairro] = useState('');
  const [newFee, setNewFee] = useState('');

  const handleQRUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPixConfig({ ...pixConfig, qrCode: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic uppercase">Gerenci<span className="text-red-600">amento</span></h2>
        <p className="text-[10px] font-black opacity-30 uppercase tracking-widest mt-2">Dados vitais do estabelecimento</p>
      </div>
      
      <section className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><Users size={28} /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Contatos & Redes</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40">Telefone (DDD + Núm)</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold" 
                placeholder="Ex: 84999999999" 
                value={contactConfig.phone} 
                onChange={e => setContactConfig({ ...contactConfig, phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40">Instagram (User ou Link)</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold" 
                placeholder="Ex: @espetinho_loja" 
                value={contactConfig.instagram} 
                onChange={e => setContactConfig({ ...contactConfig, instagram: e.target.value })} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Localização (Endereço / Link Maps)</label>
            <textarea 
              className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold h-24" 
              placeholder="Cole o endereço ou link do Google Maps..." 
              value={contactConfig.address} 
              onChange={e => setContactConfig({ ...contactConfig, address: e.target.value })} 
            />
          </div>

          <button 
            onClick={() => updateContactConfig(contactConfig)}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-green-600 transition-all text-xs uppercase tracking-widest italic"
          >
            SALVAR CONTATOS
          </button>
        </div>
      </section>

      <section className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><Truck size={28} /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Opções de Entrega</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => updateOrderMethods({ ...orderMethods, delivery: !orderMethods.delivery })}
            className={`p-6 rounded-2xl border-2 font-black uppercase tracking-widest text-xs ${orderMethods.delivery ? 'bg-green-50 border-green-500 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            Entrega: {orderMethods.delivery ? 'ATIVADO' : 'DESATIVADO'}
          </button>
          <button 
            onClick={() => updateOrderMethods({ ...orderMethods, pickup: !orderMethods.pickup })}
            className={`p-6 rounded-2xl border-2 font-black uppercase tracking-widest text-xs ${orderMethods.pickup ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
          >
            Retirada: {orderMethods.pickup ? 'ATIVADO' : 'DESATIVADO'}
          </button>
        </div>
      </section>

      <section className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><MapPin size={28} /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Taxas de Entrega / Bairros</h3>
        </div>
        
        <div className="space-y-4">
          {(deliveryFees || []).map((df, i) => (
            <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-black italic uppercase text-slate-800 text-sm">{df.name}</span>
              <div className="flex items-center gap-4">
                <span className="font-black text-red-600">R$ {Number(df.fee).toFixed(2)}</span>
                <button 
                  onClick={() => setDeliveryFees((deliveryFees || []).filter((_, index) => index !== i))}
                  className="text-slate-300 hover:text-red-600"
                ><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <input 
              className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold uppercase text-xs" 
              placeholder="Nome do Bairro (Ex: Centro)" 
              value={newBairro} 
              onChange={e => setNewBairro(e.target.value)} 
            />
            <input 
              className="w-28 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-center text-xs" 
              placeholder="R$ 0,00" 
              type="number"
              value={newFee} 
              onChange={e => setNewFee(e.target.value)} 
            />
            <button 
              onClick={() => {
                if(newBairro && newFee) {
                  setDeliveryFees([...(deliveryFees || []), { name: newBairro, fee: parseFloat(newFee) }]);
                  setNewBairro('');
                  setNewFee('');
                }
              }} 
              className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-black"
            ><Plus size={20}/></button>
          </div>
          <button 
            onClick={() => updateDeliveryFees(deliveryFees)}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl text-xs uppercase tracking-widest italic hover:bg-green-600 flex items-center justify-center gap-2"
          >
            <Save size={18} /> SALVAR TAXAS DE ENTREGA
          </button>
        </div>
      </section>

      <section className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl"><Smartphone size={28} /></div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Pagamento PIX</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase opacity-40 block mb-2">Chave PIX Oficial</label>
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-2xl font-bold italic" 
              placeholder="Ex: seu@email.com ou CNPJ..." 
              value={pixConfig.key} 
              onChange={e => setPixConfig({ ...pixConfig, key: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase opacity-40 block mb-4">QR Code PIX (Base64)</label>
            <div className="flex items-center gap-6">
              {pixConfig.qrCode ? (
                <div className="relative group">
                  <img src={pixConfig.qrCode} className="w-32 h-32 rounded-2xl border object-cover" />
                  <button onClick={() => setPixConfig({...pixConfig, qrCode: ''})} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"><X size={16}/></button>
                </div>
              ) : (
                <label className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white">
                  <Upload size={24} className="text-slate-300" />
                  <span className="text-[8px] font-black opacity-40 uppercase">Upload QR</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                </label>
              )}
            </div>
          </div>

          <button 
            onClick={() => updatePixConfig(pixConfig)}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl text-xs uppercase tracking-widest italic"
          >
            SALVAR PIX
          </button>
        </div>
      </section>
    </div>
  );
}
