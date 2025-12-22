
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Utensils, Store, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { Restaurant, Dish } from '../types';
import { useApp } from '../context/AppContext';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, userProfile } = useApp();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedStallId, setSelectedStallId] = useState<string | null>(null);
  
  // Add Dish State
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [newDish, setNewDish] = useState<Partial<Dish>>({
    name: '',
    price: 0,
    description: '',
    category: '米饭',
    calories: 500,
    image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png'
  });

  const ADMIN_EMAIL = '1230019966@student.must.edu.mo';

  const fetchRestaurants = async () => {
    const data = await api.getRestaurants();
    setRestaurants(data);
  };

  useEffect(() => {
    // Basic Auth Check
    if (!userProfile) {
        navigate('/login');
        return;
    }
    
    // Strict Admin Check
    if (userProfile.email !== ADMIN_EMAIL) {
        showToast('权限不足：仅管理员可访问后台', 'error');
        navigate('/');
        return;
    }

    fetchRestaurants();
  }, [userProfile, navigate, showToast]);

  const handleAddDish = async () => {
    if (!selectedStallId) return;
    if (!newDish.name || !newDish.price) {
        showToast('请填写完整菜品信息', 'error');
        return;
    }

    const dish: Dish = {
        id: `d_${Date.now()}`,
        name: newDish.name!,
        price: Number(newDish.price),
        description: newDish.description || '暂无描述',
        calories: newDish.calories || 0,
        category: newDish.category || '其他',
        image: newDish.image || '',
        rating: 0,
        reviews: []
    };

    await api.addDish(selectedStallId, dish);
    showToast('菜品上架成功', 'success');
    setIsAddingDish(false);
    setNewDish({ name: '', price: 0, description: '', category: '米饭' });
    fetchRestaurants(); // Refresh UI
  };

  const handleDeleteDish = async (stallId: string, dishId: string) => {
    if (!window.confirm('确定要下架该菜品吗？')) return;
    await api.deleteDish(stallId, dishId);
    showToast('菜品已下架');
    fetchRestaurants();
  };

  const selectedRestaurant = restaurants.find(r => r.id === selectedStallId);

  return (
    <div className="bg-gray-100 min-h-screen">
       {/* Admin Header */}
       <div className="bg-black text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
           <div className="flex items-center space-x-3">
               <button onClick={() => navigate('/profile')} className="hover:bg-gray-800 p-1 rounded-full">
                   <ArrowLeft size={20} />
               </button>
               <h1 className="font-bold text-lg flex items-center">
                   <Store className="mr-2 text-yellow-400" />
                   商家管理后台
               </h1>
           </div>
           <div className="text-xs text-gray-400">
               管理员: {userProfile?.userName}
           </div>
       </div>

       <div className="p-4 flex flex-col md:flex-row gap-6 max-w-5xl mx-auto">
           
           {/* Sidebar: Stall List */}
           <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm overflow-hidden h-[80vh] flex flex-col">
               <div className="p-4 border-b border-gray-100 font-bold text-gray-700 bg-gray-50">
                   选择档口
               </div>
               <div className="flex-1 overflow-y-auto p-2 space-y-2">
                   {restaurants.map(r => (
                       <div 
                         key={r.id}
                         onClick={() => setSelectedStallId(r.id)}
                         className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${selectedStallId === r.id ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50 border border-transparent'}`}
                       >
                           <span className="font-medium text-sm">{r.name}</span>
                           <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{r.menu.length}道菜</span>
                       </div>
                   ))}
               </div>
           </div>

           {/* Main Area: Dish Management */}
           <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
               {selectedRestaurant ? (
                   <>
                       <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                           <div>
                               <h2 className="font-bold text-lg">{selectedRestaurant.name} - 菜单管理</h2>
                               <p className="text-xs text-gray-500">管理您的上架菜品</p>
                           </div>
                           <button 
                             onClick={() => setIsAddingDish(true)}
                             className="bg-black text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-gray-800"
                           >
                               <Plus size={16} className="mr-1" />
                               上架新菜
                           </button>
                       </div>

                       {/* Add Dish Form */}
                       {isAddingDish && (
                           <div className="p-4 bg-yellow-50 border-b border-yellow-100 animate-in slide-in-from-top-2">
                               <div className="flex justify-between items-center mb-3">
                                   <h3 className="font-bold text-sm text-yellow-800">填写菜品信息</h3>
                                   <button onClick={() => setIsAddingDish(false)}><X size={16} className="text-yellow-800"/></button>
                               </div>
                               <div className="grid grid-cols-2 gap-3 mb-3">
                                   <input 
                                     placeholder="菜品名称" 
                                     className="p-2 rounded border border-yellow-200 text-sm"
                                     value={newDish.name}
                                     onChange={e => setNewDish({...newDish, name: e.target.value})}
                                   />
                                   <input 
                                     placeholder="价格 (MOP)" 
                                     type="number"
                                     className="p-2 rounded border border-yellow-200 text-sm"
                                     value={newDish.price}
                                     onChange={e => setNewDish({...newDish, price: Number(e.target.value)})}
                                   />
                                   <input 
                                     placeholder="描述" 
                                     className="p-2 rounded border border-yellow-200 text-sm col-span-2"
                                     value={newDish.description}
                                     onChange={e => setNewDish({...newDish, description: e.target.value})}
                                   />
                                   <input 
                                     placeholder="分类 (如: 面条)" 
                                     className="p-2 rounded border border-yellow-200 text-sm"
                                     value={newDish.category}
                                     onChange={e => setNewDish({...newDish, category: e.target.value})}
                                   />
                               </div>
                               <button onClick={handleAddDish} className="w-full bg-yellow-500 text-white font-bold py-2 rounded text-sm hover:bg-yellow-600">
                                   确认上架
                               </button>
                           </div>
                       )}

                       {/* Dish List */}
                       <div className="flex-1 overflow-y-auto p-4 space-y-3">
                           {selectedRestaurant.menu.length === 0 ? (
                               <div className="text-center text-gray-400 py-10">该档口暂无菜品</div>
                           ) : (
                               selectedRestaurant.menu.map(dish => (
                                   <div key={dish.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                                       <div className="flex items-center space-x-3">
                                           <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                                               <img src={dish.image} className="w-full h-full object-cover" alt={dish.name}/>
                                           </div>
                                           <div>
                                               <div className="font-bold text-sm">{dish.name}</div>
                                               <div className="text-xs text-gray-500">{dish.price} MOP • {dish.category}</div>
                                           </div>
                                       </div>
                                       <button 
                                         onClick={() => handleDeleteDish(selectedRestaurant.id, dish.id)}
                                         className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                                         title="下架"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               ))
                           )}
                       </div>
                   </>
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-gray-400">
                       <Store size={48} className="mb-4 opacity-20" />
                       <p>请选择左侧档口进行管理</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default Admin;
