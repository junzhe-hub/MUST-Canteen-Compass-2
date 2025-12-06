import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, clearCart } = useApp();

  if (!isOpen) return null;

  const handleClearCart = () => {
    // Removed confirm dialog to make clearing immediate as requested
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-t-2xl w-full max-h-[70vh] flex flex-col relative z-10 animate-in slide-in-from-bottom-full duration-300 shadow-2xl">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50 rounded-t-2xl">
          <h3 className="font-bold text-lg text-gray-800">购物车</h3>
          <div className="flex items-center space-x-4">
            {cart.length > 0 && (
                <button 
                    onClick={handleClearCart}
                    className="flex items-center text-xs text-gray-500 hover:text-red-500 transition-colors"
                >
                    <Trash2 size={14} className="mr-1" />
                    清空
                </button>
            )}
            <button onClick={onClose} className="bg-gray-200 p-1 rounded-full text-gray-500 hover:bg-gray-300">
                <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={24} className="opacity-30" />
                </div>
                <p>购物车是空的</p>
                <button 
                    onClick={onClose} 
                    className="mt-4 bg-yellow-400 text-black px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-yellow-500 transition-colors"
                >
                    去点餐
                </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.dish.id} className="flex items-center justify-between">
                <div className="flex-1">
                   <h4 className="font-bold text-gray-800 text-sm">{item.dish.name}</h4>
                   <p className="text-xs text-gray-500">{item.dish.price} MOP / 份</p>
                </div>
                <div className="flex items-center space-x-3">
                   <span className="font-bold text-gray-900 text-sm w-16 text-right">
                       {(item.dish.price * item.quantity).toFixed(2)} MOP
                   </span>
                   <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                       <button 
                         onClick={() => updateQuantity(item.dish.id, -1)}
                         className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md shadow-sm active:scale-90 transition-transform"
                       >
                           <Minus size={14} className="text-gray-600" />
                       </button>
                       <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                       <button 
                         onClick={() => updateQuantity(item.dish.id, 1)}
                         className="w-7 h-7 flex items-center justify-center bg-yellow-400 border border-yellow-500 rounded-md shadow-sm active:scale-90 transition-transform"
                       >
                           <Plus size={14} className="text-black" />
                       </button>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Helper text */}
        {cart.length > 0 && (
            <div className="bg-yellow-50 p-2 text-center text-[10px] text-yellow-700">
                点击上方背景区域可关闭详情
            </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;