
import { UserProfile } from '../types';
import { db } from '../db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const SESSION_KEY = 'must_canteen_session';
const TOKEN_KEY = 'auth_token';

export const authService = {
  // 1. Validate Email Domain (Client-side pre-validation)
  validateEmail: (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@(student\.must\.edu\.mo|must\.edu\.mo)$/;
    return regex.test(email);
  },

  // 2. Validate Password (8 chars, letter + number)
  validatePassword: (password: string): boolean => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  },

  // 3. Send Verification Code
  // POST /api/auth/send-code
  sendVerificationCode: async (email: string): Promise<string> => {
    try {
      const response = await fetch(`${API_URL}/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('后端服务异常');
      
      const data = await response.json();
      return data.code || '1234';
    } catch (error) {
      console.warn('后端不可用，切换到本地演示模式。验证码：1234');
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      return '1234'; 
    }
  },

  // 4. Register
  // POST /api/auth/register
  register: async (email: string, password: string, userName: string): Promise<UserProfile> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userName })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || '注册失败');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.warn('后端不可用，数据将保存在本地数据库');
      
      const newUser: UserProfile & { password?: string } = {
        id: `u_${Date.now()}`,
        userName,
        email,
        password, // 仅本地演示模式下存储明文
        major: '未设置',
        grade: '大一',
        isGuest: false
      };
      
      await db.users.add(newUser);
      return newUser;
    }
  },

  // 5. Login
  // POST /api/auth/login
  login: async (identifier: string, password: string): Promise<UserProfile> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      if (!response.ok) {
          throw new Error('账号或密码错误');
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      return data.user;
    } catch (error: any) {
      // 检查本地数据库
      const localUser = await db.users
        .where('email').equals(identifier)
        .or('userName').equals(identifier)
        .first();
      
      if (localUser && localUser.password === password) {
        console.log('本地登录成功');
        const { password: _, ...userWithoutPass } = localUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPass));
        return userWithoutPass;
      }

      throw new Error(error.message === '账号或密码错误' ? '账号或密码错误' : '无法连接到服务器，且本地未找到该账号');
    }
  },

  // 6. Guest Login
  guestLogin: async (): Promise<UserProfile> => {
    const guestUser: UserProfile = {
      id: 'guest',
      userName: '游客',
      major: '未知',
      grade: '未知',
      isGuest: true
    };
    localStorage.removeItem(TOKEN_KEY); 
    localStorage.setItem(SESSION_KEY, JSON.stringify(guestUser));
    return guestUser;
  },

  // 7. Get Current Session
  getSession: (): UserProfile | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  // 8. Logout
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  // 9. Change Password
  changePassword: async (email: string, oldPass: string, newPass: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, oldPassword: oldPass, newPassword: newPass })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || '修改失败');
      }
      return true;
    } catch (error) {
      // 本地修改
      const user = await db.users.where('email').equals(email).first();
      if (user && user.password === oldPass) {
        await db.users.update(user.id, { password: newPass });
        return true;
      }
      throw new Error('原密码错误或用户不存在');
    }
  },

  // 10. Update Profile
  updateProfile: async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_URL}/users/${userId}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('更新失败');
    } catch (error) {
      await db.users.update(userId, updates);
    }

    // 更新本地 Session
    const session = authService.getSession();
    if (session && session.id === userId) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, ...updates }));
    }
  }
};
