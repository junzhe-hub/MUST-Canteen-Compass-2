import Dexie, { Table } from 'dexie';
import { UserProfile, Review, Restaurant } from '../types';
import { RESTAURANTS } from '../constants';

// Define database schema
export class MustCanteenDB extends Dexie {
  users!: Table<UserProfile & { password?: string }>;
  reviews!: Table<Review & { targetId: string }>;
  orders!: Table<any>;
  favorites!: Table<{ userId: string, type: 'stall' | 'dish', itemId: string }>;
  // NEW: Store restaurants dynamically to allow Admin updates
  restaurants!: Table<Restaurant>;

  constructor() {
    super('MustCanteenDB');
    (this as any).version(2).stores({
      users: 'id, email, userName',
      reviews: 'id, targetId, userId, date',
      orders: 'id, userId, date',
      favorites: '[userId+itemId], type',
      restaurants: 'id, name, cuisineType, *tags' // Add indexes for search
    });
  }

  /**
   * Initialize the database with mock data if it's empty
   */
  async seed() {
    try {
      // Seed Restaurants if empty
      const restaurantCount = await this.restaurants.count();
      if (restaurantCount === 0) {
        console.log("Seeding Restaurants data...");
        // Deep copy RESTAURANTS to avoid reference issues
        const initialRestaurants = JSON.parse(JSON.stringify(RESTAURANTS));
        await this.restaurants.bulkAdd(initialRestaurants);
      }

      // Seed Reviews if empty (Existing logic)
      const reviewCount = await this.reviews.count();
      if (reviewCount === 0) {
        console.log("Seeding Reviews data...");
        const allReviews: (Review & { targetId: string })[] = [];
        RESTAURANTS.forEach(r => {
            r.reviews.forEach(rev => allReviews.push({ ...rev, targetId: r.id }));
            r.menu.forEach(d => {
                if(d.reviews) d.reviews.forEach(rev => allReviews.push({ ...rev, targetId: d.id }));
            });
        });
        await this.reviews.bulkAdd(allReviews);
      }
    } catch (error) {
      console.error("Database seeding failed:", error);
    }
  }
}

export const db = new MustCanteenDB();
