
import { Review, Restaurant, Dish } from '../types';
import { RESTAURANTS } from '../constants'; // Fallback mock data

// Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const CACHE_PREFIX = 'must_api_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache validity

// --- Cache Helpers ---

const getCached = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL) {
      // Cache expired, but keep it in case network fails? 
      // For now, strict TTL.
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCache = (key: string, data: any) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache storage failed', e);
  }
};

// Helper to get headers with JWT token
const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

// Generic Request Handler
const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  // Set a timeout for the fetch to allow quicker fallback
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...getHeaders(), ...options.headers },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || `API Error: ${response.statusText}`);
    }

    if (response.status === 204) return {} as T;
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const api = {
  // --- RESTAURANT & DISH READ OPERATIONS ---

  /**
   * Get All Restaurants (Optimized with Cache & Fallback)
   * GET /api/restaurants
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    // 1. Try Cache
    const cached = getCached<Restaurant[]>('restaurants');
    if (cached) {
        console.log('Serving restaurants from cache');
        return cached;
    }

    try {
        // 2. Try Network
        const data = await request<Restaurant[]>('/restaurants');
        setCache('restaurants', data);
        return data;
    } catch (error) {
        console.warn('Backend unavailable, falling back to mock data', error);
        // 3. Fallback to Mock Data
        // Simulate a slight network delay even for mock to check skeletons
        await new Promise(resolve => setTimeout(resolve, 500)); 
        return RESTAURANTS;
    }
  },

  /**
   * Get Restaurant By ID (Optimized)
   * GET /api/restaurants/:id
   */
  getRestaurantById: async (id: string): Promise<Restaurant | undefined> => {
    // 1. Try Cache (Specific ID)
    const cached = getCached<Restaurant>(`restaurant_${id}`);
    if (cached) return cached;

    // 1.1 Try finding in All Restaurants Cache
    const allCached = getCached<Restaurant[]>('restaurants');
    if (allCached) {
        const found = allCached.find(r => r.id === id);
        if (found) return found;
    }

    try {
      // 2. Try Network
      const data = await request<Restaurant>(`/restaurants/${id}`);
      setCache(`restaurant_${id}`, data);
      return data;
    } catch (e) {
      // 3. Fallback
      return RESTAURANTS.find(r => r.id === id);
    }
  },

  /**
   * Search Restaurants
   * GET /api/restaurants/search?q=query
   */
  searchRestaurants: async (query: string): Promise<Restaurant[]> => {
    try {
        return await request<Restaurant[]>(`/restaurants/search?q=${encodeURIComponent(query)}`);
    } catch (e) {
        // Fallback local search
        const lowerQ = query.toLowerCase();
        return RESTAURANTS.filter(r => 
            r.name.toLowerCase().includes(lowerQ) || 
            r.cuisineType.toLowerCase().includes(lowerQ) ||
            r.tags.some(tag => tag.toLowerCase().includes(lowerQ))
        );
    }
  },

  // --- ADMIN OPERATIONS ---

  addDish: async (restaurantId: string, dish: Dish): Promise<void> => {
    try {
        await request(`/restaurants/${restaurantId}/dishes`, {
            method: 'POST',
            body: JSON.stringify(dish),
        });
        // Invalidate cache
        localStorage.removeItem(CACHE_PREFIX + 'restaurants');
        localStorage.removeItem(CACHE_PREFIX + `restaurant_${restaurantId}`);
    } catch (e) {
        // If mock mode, we can't persist, just warn
        console.error("Cannot add dish in offline mode");
        alert("离线模式下无法保存数据到服务器");
    }
  },

  deleteDish: async (restaurantId: string, dishId: string): Promise<void> => {
    try {
        await request(`/restaurants/${restaurantId}/dishes/${dishId}`, { method: 'DELETE' });
        localStorage.removeItem(CACHE_PREFIX + 'restaurants');
        localStorage.removeItem(CACHE_PREFIX + `restaurant_${restaurantId}`);
    } catch (e) {
        console.error("Cannot delete dish in offline mode");
    }
  },

  updateRestaurant: async (id: string, updates: Partial<Restaurant>): Promise<void> => {
    await request(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    localStorage.removeItem(CACHE_PREFIX + 'restaurants');
    localStorage.removeItem(CACHE_PREFIX + `restaurant_${id}`);
  },

  // --- ORDER & REVIEW OPERATIONS ---

  submitOrder: async (cartItems: any[], totalAmount: number) => {
    // For demo purposes, if network fails, just succeed locally
    try {
        return await request<{ success: boolean; orderId: string }>('/orders', {
            method: 'POST',
            body: JSON.stringify({ items: cartItems, total: totalAmount }),
        });
    } catch (e) {
        return { success: true, orderId: 'offline-order' };
    }
  },

  checkStallStatus: async (stallId: string) => {
    return Promise.resolve({ isOpen: true, waitTime: '15-20 min' });
  },

  submitReview: async (targetId: string, reviewData: Omit<Review, 'id' | 'date' | 'likes'>) => {
    // Mock ID generation for optimistic UI if offline
    const mockReview: Review = {
        id: `r_temp_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        ...reviewData
    };

    try {
        return await request<Review>('/reviews', {
            method: 'POST',
            body: JSON.stringify({ targetId, ...reviewData }),
        });
    } catch (e) {
        return mockReview;
    }
  },

  getReviews: async (targetId: string): Promise<Review[]> => {
    try {
        return await request<Review[]>(`/reviews?targetId=${targetId}`);
    } catch (e) {
        // Find reviews from mock data
        const stall = RESTAURANTS.find(r => r.id === targetId);
        if (stall) return stall.reviews;
        
        // Find dish reviews
        let dishReviews: Review[] = [];
        RESTAURANTS.forEach(r => {
            const d = r.menu.find(m => m.id === targetId);
            if (d && d.reviews) dishReviews = d.reviews;
        });
        return dishReviews;
    }
  },

  likeReview: async (reviewId: string) => {
    try {
        return await request<{ success: boolean }>(`/reviews/${reviewId}/like`, { method: 'POST' });
    } catch (e) {
        return { success: true };
    }
  },

  getUserReviews: async (userId: string) => {
    try {
        return await request<{ review: Review; targetName: string }[]>(`/users/${userId}/reviews`);
    } catch (e) {
        return [];
    }
  },

  deleteReview: async (reviewId: string) => {
    try {
        return await request<boolean>(`/reviews/${reviewId}`, { method: 'DELETE' });
    } catch (e) {
        return true;
    }
  },

  appendReview: async (reviewId: string, additionalText: string) => {
    try {
        return await request<boolean>(`/reviews/${reviewId}/append`, {
            method: 'PATCH',
            body: JSON.stringify({ text: additionalText }),
        });
    } catch (e) {
        return true;
    }
  }
};
