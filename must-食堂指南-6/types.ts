
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // Overall 1-5
  dimensions: {
    appearance: number; // "Color"
    aroma: number;
    taste: number;
  };
  comment: string;
  date: string;
  images?: string[];
  likes?: number; // Added for "lighting up" comments
}

export interface Dish {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  calories: number;
  rating: number;
  category: string;
  isPopular?: boolean;
  reviews?: Review[]; // Associated reviews
}

export interface Restaurant {
  id: string;
  name: string;
  location: string; // E.g., "Block O Canteen"
  rating: number;
  cuisineType: string; // E.g., "Japanese", "Cantonese"
  image: string;
  tags: string[];
  menu: Dish[];
  reviews: Review[];
  ratingBreakdown: {
    appearance: number;
    aroma: number;
    taste: number;
  };
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface UserProfile {
  id: string;
  userName: string;
  avatar?: string; // URL or null (if null, use initial)
  major: string;
  grade: string;
  email?: string; // New field for auth
  isGuest?: boolean; // New field for guest mode
}
