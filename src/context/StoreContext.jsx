import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts, categories as initialCategories } from '../data/products';

const StoreContext = createContext();

const STORAGE_KEY = 'espetinho_store_v6';

export const StoreProvider = ({ children }) => {
  // Initialize state from localStorage immediately to prevent "flash" of empty data
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
  const [products, setProducts] = useState(() => getSaved('products', initialProducts));
  const [categories, setCategories] = useState(() => getSaved('categories', initialCategories));
  const [tables, setTables] = useState(() => getSaved('tables', Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `Mesa ${i+1}` }))));
  const [orders, setOrders] = useState(() => getSaved('orders', []));
  const [pixConfig, setPixConfig] = useState(() => getSaved('pixConfig', { key: '', qrCode: '' }));
  const [team, setTeam] = useState(() => getSaved('team', [
    { id: 1, name: 'Paulinho', login: 'admin', password: '123', role: 'Gestor', active: true, assignedTables: 'todas' },
    { id: 2, name: 'João', login: 'joao', password: '123', role: 'Garçom', active: true, assignedTables: 'todas' },
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

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = { 
      currentUser,
      isStoreOpenManual, 
      orders, 
      team, 
      pixConfig, 
      categories, 
      products, 
      schedule, 
      tables 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [currentUser, isStoreOpenManual, orders, team, pixConfig, categories, products, schedule, tables]);

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

  const addOrder = (orderData) => {
    setOrders(prev => {
      // For Mesa orders, we might want to merge if there's an open order.
      // For Online/Balcão, every order should be a new entry.
      const shouldMerge = orderData.origin === 'Mesa';
      const existingIdx = shouldMerge 
        ? prev.findIndex(o => o.tableId === orderData.tableId && o.status === 'aberto' && o.origin === 'Mesa')
        : -1;
      
      const newOrderInfo = {
        ...orderData,
        origin: orderData.origin || 'Mesa',
        customerData: orderData.customerData || null,
        waiterId: orderData.waiterId || currentUser?.id,
        waiterName: orderData.waiterName || currentUser?.name || 'Sistema',
        timestamp: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...newOrderInfo,
          items: [...updated[existingIdx].items, ...orderData.items], // Append items for Mesa
          total: updated[existingIdx].total + orderData.total,
          id: updated[existingIdx].id, // keep original id
          status: 'aberto'
        };
        return updated;
      } else {
        return [...prev, { 
          ...newOrderInfo, 
          id: Date.now(), 
          status: orderData.status || 'aberto'
        }];
      }
    });
  };

  const closeOrder = (orderId, paymentDetails) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, status: 'finalizado', payment: paymentDetails } 
        : o
    ));
  };

  return (
    <StoreContext.Provider value={{ 
      isStoreOpen, isStoreOpenManual, toggleStore, 
      orders, setOrders, addOrder, closeOrder,
      team, setTeam,
      currentUser, login, logout,
      pixConfig, setPixConfig,
      categories, setCategories,
      products, setProducts,
      schedule, setSchedule,
      tables, setTables
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
