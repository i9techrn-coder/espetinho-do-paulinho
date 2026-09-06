import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const StoreContext = createContext();

export const StoreProvider = ({ children, tenant }) => {
  const STORAGE_KEY = `espetinho_store_${tenant.slug}`;

  const getSaved = (key, defaultValue) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return data[key] !== undefined ? data[key] : defaultValue;
      } catch (e) {
        console.error("Error parsing store data", e);
      }
    }
    return defaultValue;
  };

  const [currentUser, setCurrentUser] = useState(() => getSaved('currentUser', null));
  const [isStoreOpenManual, setIsStoreOpenManual] = useState(() => getSaved('isStoreOpenManual', true));
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState(() => getSaved('tables', Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Mesa ${i+1}` }))));
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // O PIX agora vem do Tenant no Supabase
  const [pixConfig, setPixConfig] = useState({ key: tenant.pix_key || '', qrCode: '' });
  
  const [team, setTeam] = useState(() => getSaved('team', [
    { id: 1, name: 'Admin ' + tenant.name, login: 'admin', password: '123', role: 'Gestor', active: true, assignedTables: 'todas' },
    { id: 2, name: 'Garçom', login: 'garcom', password: '123', role: 'Garçom', active: true, assignedTables: 'todas' },
  ]));
  
  const [schedule, setSchedule] = useState(() => getSaved('schedule', {
    'Segunda': { open: '18:00', close: '00:00', active: true },
    'Terça': { open: '18:00', close: '00:00', active: true },
    'Quarta': { open: '18:00', close: '00:00', active: true },
    'Quinta': { open: '18:00', close: '00:00', active: true },
    'Sexta': { open: '18:00', close: '02:00', active: true },
    'Sábado': { open: '18:00', close: '02:00', active: true },
    'Domingo': { open: '18:00', close: '23:00', active: true },
  }));

  // Buscar dados do Supabase ao carregar
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      // Busca categorias
      const { data: catData } = await supabase.from('categories').select('*').eq('tenant_id', tenant.id);
      if (catData) setCategories(catData.map(c => c.name));

      // Busca produtos
      const { data: prodData } = await supabase.from('products').select('*').eq('tenant_id', tenant.id);
      if (prodData) setProducts(prodData);

      // Busca pedidos (apenas os do dia atual em um app real, mas aqui pegamos os não finalizados)
      const { data: orderData } = await supabase.from('orders').select('*').eq('tenant_id', tenant.id);
      if (orderData) setOrders(orderData);
      
      setLoadingData(false);
    }
    
    fetchData();

    // Configurar WebSockets (Realtime) para os pedidos no futuro!
  }, [tenant.id]);

  // Auto-save do que ainda é local
  useEffect(() => {
    const dataToSave = { currentUser, isStoreOpenManual, team, schedule, tables };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [currentUser, isStoreOpenManual, team, schedule, tables]);

  const login = (loginStr, password) => {
    const user = team.find(u => u.login === loginStr && u.password === password && u.active);
    if (user) {
      setCurrentUser(user);
      return { success: true, role: user.role };
    }
    return { success: false, message: 'Usuário ou senha inválidos' };
  };

  const logout = () => setCurrentUser(null);

  const isStoreOpenAuto = () => {
    const now = new Date();
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayName = days[now.getDay()];
    const config = schedule[dayName];
    if (!config || !config.active) return false;
    const [hOpen, mOpen] = config.open.split(':').map(Number);
    const [hClose, mClose] = config.close.split(':').map(Number);
    const timeNow = now.getHours() * 60 + now.getMinutes();
    const timeOpen = hOpen * 60 + mOpen;
    let timeClose = hClose * 60 + mClose;
    if (timeClose < timeOpen) timeClose += 1440;
    return timeNow >= timeOpen && timeNow <= timeClose;
  };

  const isStoreOpen = isStoreOpenManual && isStoreOpenAuto();
  const toggleStore = () => setIsStoreOpenManual(!isStoreOpenManual);

  const addOrder = async (orderData) => {
    const shouldMerge = orderData.origin === 'Mesa';
    const existingIdx = shouldMerge 
      ? orders.findIndex(o => o.tableId === orderData.tableId && o.status === 'aberto' && o.origin === 'Mesa')
      : -1;
    
    const newOrderInfo = {
      tenant_id: tenant.id,
      origin: orderData.origin || 'Mesa',
      customer_data: orderData.customerData || null,
      status: orderData.status || 'aberto',
      items: orderData.items,
      total: orderData.total
    };

    if (existingIdx !== -1) {
      // Atualizar pedido existente no Supabase (merge de itens)
      const existingOrder = orders[existingIdx];
      const mergedItems = [...existingOrder.items, ...orderData.items];
      const newTotal = existingOrder.total + orderData.total;
      
      await supabase.from('orders').update({
        items: mergedItems,
        total: newTotal
      }).eq('id', existingOrder.id);
      
      // Atualiza estado local
      setOrders(prev => {
        const updated = [...prev];
        updated[existingIdx] = { ...existingOrder, items: mergedItems, total: newTotal };
        return updated;
      });
    } else {
      // Criar novo pedido no Supabase
      const { data } = await supabase.from('orders').insert([newOrderInfo]).select().single();
      if (data) {
        setOrders(prev => [...prev, data]);
      }
    }
  };

  const closeOrder = async (orderId, paymentDetails) => {
    await supabase.from('orders').update({ status: 'finalizado' }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'finalizado' } : o));
  };

  return (
    <StoreContext.Provider value={{ 
      tenant,
      isStoreOpen, isStoreOpenManual, toggleStore, 
      orders, setOrders, addOrder, closeOrder,
      team, setTeam,
      currentUser, login, logout,
      pixConfig, setPixConfig,
      categories, setCategories,
      products, setProducts,
      schedule, setSchedule,
      tables, setTables,
      loadingData
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
