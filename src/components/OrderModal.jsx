import React, { useState } from 'react';
import { X, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { products } from '../data/products';

export default function OrderModal({ isOpen, onClose, table }) {
  const [cart, setCart] = useState(table?.items || []);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-fade-in">
        
        {/* Left: Product Selection */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/10 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Lançar Pedido - <span className="text-primary">{table.name}</span></h2>
            <div className="relative flex-1 max-w-xs ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                placeholder="Buscar espetinho..."
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-primary/50 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2 custom-scrollbar">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-left border border-transparent hover:border-primary/30 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Plus size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{product.name}</h4>
                  <p className="text-secondary font-bold text-xs">R$ {product.price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full md:w-80 p-6 flex flex-col bg-white/[0.02]">
          <h3 className="font-bold mb-6 flex items-center justify-between">
            Resumo do Pedido
            <button onClick={onClose} className="text-white/30 hover:text-white md:hidden"><X /></button>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
            {cart.length === 0 ? (
              <p className="text-white/30 text-center py-10 text-sm italic">Nenhum item selecionado</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg animate-slide-up">
                  <div className="flex-1 mr-2">
                    <p className="text-xs font-semibold">{item.name}</p>
                    <p className="text-[10px] text-white/50">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary"><Minus size={14} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary"><Plus size={14} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Total</span>
              <span className="text-primary">R$ {total.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={onClose} 
                className="btn-secondary py-2 text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={() => { alert('Pedido salvo!'); onClose(); }} 
                className="btn-primary py-2 text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
