
import { Review } from '../types';
import { RESTAURANTS, USER_STATS } from '../constants';

// Mock Backend Service
// Simulates API calls with network latency

export const api = {
  /**
   * Simulate placing an order
   */
  submitOrder: async (cartItems: any[], totalAmount: number) => {
    console.log("Processing order...", { items: cartItems, total: totalAmount });
    
    // Simulate network delay (800ms - 1.5s)
    const delay = Math.random() * 700 + 800;
    
    return new Promise<{ success: boolean; orderId: string }>((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          orderId: `ORD-${Date.now().toString().slice(-6)}`
        });
      }, delay);
    });
  },

  /**
   * Simulate checking stall availability
   */
  checkStallStatus: async (stallId: string) => {
    return Promise.resolve({ isOpen: true, waitTime: '15-20 min' });
  },

  /**
   * Simulate submitting a review (works for Restaurant or Dish)
   */
  submitReview: async (targetId: string, reviewData: Omit<Review, 'id' | 'date' | 'likes'>) => {
    console.log(`Submitting review for ${targetId}:`, reviewData);

    const delay = Math.random() * 500 + 500;

    return new Promise<Review>((resolve) => {
      setTimeout(() => {
        const newReview: Review = {
          ...reviewData,
          id: `r-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          likes: 0
        };
        
        // Actually push to constants for session persistence
        let found = false;
        // Check stalls
        const stall = RESTAURANTS.find(r => r.id === targetId);
        if (stall) {
            stall.reviews.unshift(newReview);
            found = true;
        } else {
            // Check dishes
            for (const r of RESTAURANTS) {
                const dish = r.menu.find(d => d.id === targetId);
                if (dish) {
                    if (!dish.reviews) dish.reviews = [];
                    dish.reviews.unshift(newReview);
                    found = true;
                    break;
                }
            }
        }

        resolve(newReview);
      }, delay);
    });
  },

  /**
   * Simulate liking a review
   */
  likeReview: async (reviewId: string) => {
      return new Promise<boolean>((resolve) => {
          setTimeout(() => resolve(true), 200);
      });
  },

  /**
   * Get all reviews for current user
   */
  getUserReviews: async (userId: string) => {
      return new Promise<{ review: Review, targetName: string }[]>((resolve) => {
          const userReviews: { review: Review, targetName: string }[] = [];
          
          // Helper to check list
          const checkList = (list: Review[], name: string) => {
              list.forEach(r => {
                  if (r.userId === userId) {
                      userReviews.push({ review: r, targetName: name });
                  }
              });
          };

          // Scan restaurants
          RESTAURANTS.forEach(r => {
              checkList(r.reviews, r.name);
              // Scan dishes
              r.menu.forEach(d => {
                  if (d.reviews) checkList(d.reviews, d.name);
              });
          });

          // Sort by date desc
          userReviews.sort((a, b) => new Date(b.review.date).getTime() - new Date(a.review.date).getTime());
          
          setTimeout(() => resolve(userReviews), 300);
      });
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string) => {
      return new Promise<boolean>((resolve) => {
          const remove = (list: Review[]) => {
              const idx = list.findIndex(r => r.id === reviewId);
              if (idx !== -1) {
                  list.splice(idx, 1);
                  return true;
              }
              return false;
          };

          // Scan all
          for (const r of RESTAURANTS) {
              if (remove(r.reviews)) { resolve(true); return; }
              for (const d of r.menu) {
                  if (d.reviews && remove(d.reviews)) { resolve(true); return; }
              }
          }
          resolve(false);
      });
  },

  /**
   * Append text to a review
   */
  appendReview: async (reviewId: string, additionalText: string) => {
      return new Promise<boolean>((resolve) => {
          const update = (list: Review[]) => {
              const review = list.find(r => r.id === reviewId);
              if (review) {
                  const dateStr = new Date().toLocaleDateString();
                  review.comment += `\n[追评 ${dateStr}]: ${additionalText}`;
                  return true;
              }
              return false;
          };

          for (const r of RESTAURANTS) {
              if (update(r.reviews)) { resolve(true); return; }
              for (const d of r.menu) {
                  if (d.reviews && update(d.reviews)) { resolve(true); return; }
              }
          }
          resolve(false);
      });
  }
};
