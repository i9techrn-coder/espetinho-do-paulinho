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

  // Configurações do Tenant do Jana
  const [pixConfig, setPixConfig] = useState({ key: tenant.pix_key || '', qrCode: '' });
  const [contactConfig, setContactConfig] = useState({
    phone: tenant.phone || tenant.whatsapp || '',
    instagram: tenant.instagram || '',
    locationUrl: tenant.address || '',
    address: tenant.address || ''
  });
  const [orderMethods, setOrderMethods] = useState(tenant.order_methods || { pickup: true, delivery: true });
  const [deliveryFees, setDeliveryFees] = useState(tenant.delivery_fees || [
    { name: 'Centro', fee: 5.00 },
    { name: 'Bairro Vizinho', fee: 7.00 }
  ]);
  const [schedule, setSchedule] = useState(tenant.schedule || {
    'Segunda': { open: '18:00', close: '00:00', active: true },
    'Terça': { open: '18:00', close: '00:00', active: true },
    'Quarta': { open: '18:00', close: '00:00', active: true },
    'Quinta': { open: '18:00', close: '00:00', active: true },
    'Sexta': { open: '18:00', close: '02:00', active: true },
    'Sábado': { open: '18:00', close: '02:00', active: true },
    'Domingo': { open: '18:00', close: '23:00', active: true },
  });

  const [team, setTeam] = useState(() => getSaved('team', [
    { id: 1, name: 'Admin ' + tenant.name, login: 'admin', password: '123', role: 'Gestor', active: true, assignedTables: 'todas' },
    { id: 2, name: 'Garçom', login: 'garcom', password: '123', role: 'Garçom', active: true, assignedTables: 'todas' },
  ]));

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Buscar dados do Supabase ao carregar
  useEffect(() => {
    async function fetchData() {
      setLoadingData(true);
      
      // Busca categorias
      const { data: catData } = await supabase.from('categories').select('*').eq('tenant_id', tenant.id);
      if (catData && catData.length > 0) {
        setCategories(catData.map(c => c.name));
      }

      // Busca produtos
      const { data: prodData } = await supabase.from('products').select('*').eq('tenant_id', tenant.id);
      if (prodData) {
        setProducts(prodData);
      }

      // Busca pedidos
      const { data: orderData } = await supabase.from('orders').select('*').eq('tenant_id', tenant.id);
      if (orderData) {
        setOrders(orderData.map(o => ({
          ...o,
          tableId: o.customer_data?.tableId || o.origin,
          customerData: o.customer_data
        })));
      }
      
      setLoadingData(false);
    }
    
    fetchData();
  }, [tenant.id]);

  // Persistir alterações de Tenant no Supabase
  const updatePixConfig = async (newConfig) => {
    setPixConfig(newConfig);
    await supabase.from('tenants').update({ pix_key: newConfig.key }).eq('id', tenant.id);
    showToast('Chave PIX atualizada!');
  };

  const updateContactConfig = async (newConfig) => {
    setContactConfig(newConfig);
    await supabase.from('tenants').update({ 
      contact_config: newConfig,
      address: newConfig.address || newConfig.locationUrl,
      instagram: newConfig.instagram,
      phone: newConfig.phone
    }).eq('id', tenant.id);
    showToast('Contatos atualizados!');
  };

  const updateDeliveryFees = async (newFees) => {
    setDeliveryFees(newFees);
    await supabase.from('tenants').update({ delivery_fees: newFees }).eq('id', tenant.id);
    showToast('Taxas de entrega salvas!');
  };

  const updateOrderMethods = async (newMethods) => {
    setOrderMethods(newMethods);
    await supabase.from('tenants').update({ order_methods: newMethods }).eq('id', tenant.id);
    showToast('Métodos de pedido salvos!');
  };

  const updateSchedule = async (newSchedule) => {
    setSchedule(newSchedule);
    await supabase.from('tenants').update({ schedule: newSchedule }).eq('id', tenant.id);
    showToast('Horários salvos!');
  };

  const updateCategories = async (newCats) => {
    setCategories(newCats);
  };

  const updateProducts = async (newProds) => {
    setProducts(newProds);
  };

  const addProduct = async (prod) => {
    const { data } = await supabase.from('products').insert([{ ...prod, tenant_id: tenant.id }]).select().single();
    if (data) {
      setProducts(prev => [...prev, data]);
      showToast('Produto adicionado!');
    }
  };

  const editProduct = async (prod) => {
    const { data } = await supabase.from('products').update(prod).eq('id', prod.id).select().single();
    if (data) {
      setProducts(prev => prev.map(p => p.id === prod.id ? data : p));
      showToast('Produto atualizado!');
    }
  };

  const deleteProduct = async (id) => {
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Produto removido!');
  };

  // Auto-save do que ainda é local
  useEffect(() => {
    const dataToSave = { currentUser, isStoreOpenManual, team, tables };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [currentUser, isStoreOpenManual, team, tables]);

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
      const existingOrder = orders[existingIdx];
      const mergedItems = [...existingOrder.items, ...orderData.items];
      const newTotal = existingOrder.total + orderData.total;
      
      await supabase.from('orders').update({
        items: mergedItems,
        total: newTotal
      }).eq('id', existingOrder.id);
      
      setOrders(prev => {
        const updated = [...prev];
        updated[existingIdx] = { ...existingOrder, items: mergedItems, total: newTotal };
        return updated;
      });
    } else {
      const { data } = await supabase.from('orders').insert([newOrderInfo]).select().single();
      if (data) {
        setOrders(prev => [...prev, {
          ...data,
          tableId: data.customer_data?.tableId || data.origin,
          customerData: data.customer_data
        }]);
      }
    }
  };

  const closeOrder = async (orderId, paymentDetails) => {
    await supabase.from('orders').update({ status: 'finalizado' }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'finalizado' } : o));
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const resetOrders = async () => {
    await supabase.from('orders').delete().eq('tenant_id', tenant.id);
    setOrders([]);
    showToast('Vendas zeradas com sucesso!');
  };

  return (
    <StoreContext.Provider value={{ 
      tenant,
      isStoreOpen, isStoreOpenManual, toggleStore, 
      orders, setOrders, addOrder, closeOrder, updateOrderStatus, resetOrders,
      team, setTeam,
      currentUser, login, logout,
      pixConfig, setPixConfig, updatePixConfig,
      contactConfig, setContactConfig, updateContactConfig,
      orderMethods, setOrderMethods, updateOrderMethods,
      deliveryFees, setDeliveryFees, updateDeliveryFees,
      categories, setCategories: updateCategories,
      products, setProducts: updateProducts, addProduct, editProduct, deleteProduct,
      schedule, setSchedule: updateSchedule,
      tables, setTables,
      loadingData,
      toast, showToast
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
