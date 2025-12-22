import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Dish, UserProfile } from '../types';
import { api } from '../services/api';
import { authService } from '../services/auth';
import { USER_STATS } from '../constants';

interface CartItem {
  dish: Dish;
  quantity: number;
  stallId: string;
  stallName: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface FavoritesState {
  restaurants: string[];
  dishes: string[];
}

interface AppContextType {
  cart: CartItem[];
  addToCart: (dish: Dish, stallId: string, stallName: string) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, delta: number) => void;
  clearCart: () => void;
  checkout: () => Promise<boolean>;
  isOrdering: boolean;
  toast: ToastState;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  cartTotal: number;
  cartCount: number;
  // Favorites
  favorites: FavoritesState;
  toggleFavoriteRestaurant: (id: string) => void;
  toggleFavoriteDish: (id: string) => void;
  isFavoriteRestaurant: (id: string) => boolean;
  isFavoriteDish: (id: string) => boolean;
  // User Profile & Auth
  userProfile: UserProfile | null;
  isLoadingSession: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  requireAuth: (action: () => void) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load session on mount
  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setUserProfile(session);
    }
    setIsLoadingSession(false);
  }, []);

  const login = (user: UserProfile) => {
    setUserProfile(user);
  };

  const logout = () => {
    authService.logout();
    setUserProfile(null);
    setCart([]); // Clear cart on logout
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    // Optimistic UI Update
    setUserProfile(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });

    // DB Update
    if (!userProfile.isGuest) {
        authService.updateProfile(userProfile.id, updates).catch(err => {
            console.error("Failed to update profile DB", err);
            showToast("保存失败，请重试", "error");
        });
    } else {
         // Update guest session storage
         const session = authService.getSession();
         if (session) {
             localStorage.setItem('must_canteen_session', JSON.stringify({ ...session, ...updates }));
         }
    }
  };
  
  // Initialize favorites from localStorage
  // NOTE: For a full backend, this should also move to `db.favorites`
  const [favorites, setFavorites] = useState<FavoritesState>(() => {
    try {
      const stored = localStorage.getItem('must-canteen-favorites');
      return stored ? JSON.parse(stored) : { restaurants: [], dishes: [] };
    } catch (e) {
      return { restaurants: [], dishes: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('must-canteen-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const requireAuth = (action: () => void) => {
    if (!userProfile) return;
    if (userProfile.isGuest) {
        showToast('游客模式无法执行此操作，请登录', 'info');
        return;
    }
    action();
  };

  const addToCart = (dish: Dish, stallId: string, stallName: string) => {
    if (userProfile?.isGuest) {
      showToast('游客模式无法点餐，请先登录', 'info');
      return;
    }

    setCart(prev => {
      if (prev.length > 0 && prev[0].stallId !== stallId) {
        if (!window.confirm(`要在 ${stallName} 开始新订单吗？这将清空 ${prev[0].stallName} 的购物车。`)) {
          return prev;
        }
        showToast(`已开始在 ${stallName} 的新订单`, 'info');
        return [{ dish, quantity: 1, stallId, stallName }];
      }

      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        showToast(`又添加了一份 ${dish.name}`);
        return prev.map(item => 
          item.dish.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      showToast(`已添加 ${dish.name} 到购物车`);
      return [...prev, { dish, quantity: 1, stallId, stallName }];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart(prev => prev.filter(item => item.dish.id !== dishId));
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.dish.id === dishId) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const checkout = async () => {
    if (userProfile?.isGuest) {
      showToast('游客模式无法结算，请先登录', 'info');
      return false;
    }

    if (cart.length === 0) return false;
    
    setIsOrdering(true);
    try {
      const total = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
      await api.submitOrder(cart, total);
      showToast('下单成功！🎉', 'success');
      clearCart();
      return true;
    } catch (error) {
      showToast('下单失败，请重试。', 'error');
      return false;
    } finally {
      setIsOrdering(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleFavoriteRestaurant = (id: string) => {
    requireAuth(() => {
        setFavorites(prev => {
            const isFav = prev.restaurants.includes(id);
            const newRestaurants = isFav 
              ? prev.restaurants.filter(rid => rid !== id)
              : [...prev.restaurants, id];
            
            if (!isFav) showToast('已收藏该档口');
            else showToast('已取消收藏', 'info');
            
            return { ...prev, restaurants: newRestaurants };
          });
    });
  };

  const toggleFavoriteDish = (id: string) => {
    requireAuth(() => {
        setFavorites(prev => {
            const isFav = prev.dishes.includes(id);
            const newDishes = isFav 
              ? prev.dishes.filter(did => did !== id)
              : [...prev.dishes, id];
              
            if (!isFav) showToast('已收藏该菜品');
            else showToast('已取消收藏', 'info');
      
            return { ...prev, dishes: newDishes };
          });
    });
  };

  const isFavoriteRestaurant = (id: string) => favorites.restaurants.includes(id);
  const isFavoriteDish = (id: string) => favorites.dishes.includes(id);

  return (
    <AppContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateQuantity, clearCart, checkout, 
      isOrdering, toast, showToast, hideToast,
      cartTotal, cartCount,
      favorites, toggleFavoriteRestaurant, toggleFavoriteDish, isFavoriteRestaurant, isFavoriteDish,
      userProfile, isLoadingSession, updateUserProfile, login, logout, requireAuth
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};