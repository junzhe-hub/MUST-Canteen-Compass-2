
import { UserProfile } from '../types';

const USERS_DB_KEY = 'must_canteen_users_db';
const SESSION_KEY = 'must_canteen_session';

// Internal interface for stored users which includes password
interface StoredUser extends UserProfile {
  password?: string;
}

// Helper to get all users
const getUsers = (): StoredUser[] => {
  const usersStr = localStorage.getItem(USERS_DB_KEY);
  return usersStr ? JSON.parse(usersStr) : [];
};

// Helper to save users
const saveUser = (user: UserProfile) => {
  const users = getUsers();
  // Remove existing if updating
  const filtered = users.filter(u => u.email !== user.email);
  // We allow pushing user (UserProfile) to StoredUser[] because password is optional in StoredUser
  // At runtime, if user has password property (from register), it will be saved.
  filtered.push(user as StoredUser); 
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(filtered));
};

export const authService = {
  // 1. Validate Email Domain
  validateEmail: (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@(student\.must\.edu\.mo|must\.edu\.mo)$/;
    return regex.test(email);
  },

  // 2. Validate Password (8 chars, letter + number)
  validatePassword: (password: string): boolean => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  },

  // 3. Send Verification Code (Simulated)
  sendVerificationCode: async (email: string): Promise<string> => {
    return new Promise((resolve) => {
      // Check if email already registered
      const users = getUsers();
      if (users.find(u => u.email === email)) {
          // For this demo, we allow re-registration or password reset flows mixed, 
          // but strictly speaking should check unique. 
          // For now, assume if valid email, send code.
      }

      const code = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`[AUTH SERVICE] Verification Code for ${email}: ${code}`);
      
      // Simulate network delay
      setTimeout(() => {
        resolve(code);
      }, 1000);
    });
  },

  // 4. Register
  register: async (email: string, password: string, userName: string): Promise<UserProfile> => {
    return new Promise((resolve) => {
      const newUser: StoredUser = {
        id: `u-${Date.now()}`,
        userName: userName, // Default to email prefix or custom
        email: email,
        major: '未设置',
        grade: '未设置',
        isGuest: false,
        password: password 
      };
      
      saveUser(newUser);
      setTimeout(() => resolve(newUser), 800);
    });
  },

  // 5. Login
  login: async (identifier: string, password: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      const users = getUsers();
      // Allow login with either full email or the part before @
      const user = users.find(u => {
        const email = u.email || '';
        const username = email.includes('@') ? email.split('@')[0] : '';
        return (email === identifier || username === identifier) && u.password === password;
      });
      
      setTimeout(() => {
        if (user) {
          const sessionUser = { ...user };
          delete sessionUser.password; // Don't put password in session
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
          resolve(sessionUser);
        } else {
          reject(new Error('账号或密码错误'));
        }
      }, 800);
    });
  },

  // 6. Guest Login
  guestLogin: async (): Promise<UserProfile> => {
    return new Promise((resolve) => {
      const guestUser: UserProfile = {
        id: 'guest',
        userName: '游客',
        major: '未知',
        grade: '未知',
        isGuest: true
      };
      // Guest session is usually temporary, but we can store it
      localStorage.setItem(SESSION_KEY, JSON.stringify(guestUser));
      resolve(guestUser);
    });
  },

  // 7. Get Current Session
  getSession: (): UserProfile | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // 8. Logout
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // 9. Change Password
  changePassword: async (email: string, oldPass: string, newPass: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const users = getUsers();
      const userIdx = users.findIndex(u => u.email === email);
      
      if (userIdx === -1) {
          reject(new Error('用户数据异常'));
          return;
      }

      if (users[userIdx].password !== oldPass) {
          reject(new Error('旧密码不正确'));
          return;
      }

      const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!regex.test(newPass)) {
          reject(new Error('新密码格式不符：需8位以上且包含字母和数字'));
          return;
      }

      // Update password
      users[userIdx].password = newPass;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      
      setTimeout(() => resolve(true), 800);
    });
  }
};
