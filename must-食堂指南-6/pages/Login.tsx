import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';
import { LogIn, User, Lock, ArrowRight, Ghost } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, showToast } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      login(user);
      showToast(`欢迎回来，${user.userName}`);
      navigate('/');
    } catch (error: any) {
      showToast(error.message || '登录失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    const guest = await authService.guestLogin();
    login(guest);
    showToast('已进入游客模式', 'info');
    navigate('/');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <img 
            src="https://raw.githubusercontent.com/zhD1dqz/must-canteen/main/images/登录页.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
            style={{
                animation: 'pan-horizontal 20s ease-in-out infinite alternate'
            }}
        />
        <style>{`
            @keyframes pan-horizontal {
                0% { object-position: 0% 50%; }
                100% { object-position: 100% 50%; }
            }
        `}</style>
      </div>

      {/* Overlay Mask */}
      <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[2px]"></div>

      <div className="w-full max-w-sm relative z-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">MUST 食堂点评</h1>
          <p className="text-gray-600 font-medium">发现校园美味，拒绝踩雷</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-white/50 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl">
          <div className="bg-white/80 border border-gray-200 rounded-xl px-4 py-3 flex items-center focus-within:ring-2 focus-within:ring-black transition-all">
            <User className="text-gray-500 mr-3" size={20} />
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="请输入完整邮箱 或 账号前缀"
              className="bg-transparent flex-1 outline-none text-sm font-medium placeholder-gray-400 text-gray-900"
            />
          </div>

          <div className="bg-white/80 border border-gray-200 rounded-xl px-4 py-3 flex items-center focus-within:ring-2 focus-within:ring-black transition-all">
            <Lock className="text-gray-500 mr-3" size={20} />
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="密码"
              className="bg-transparent flex-1 outline-none text-sm font-medium placeholder-gray-400 text-gray-900"
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-gray-800 shadow-lg"
          >
            {isLoading ? <span>登录中...</span> : (
              <>
                <span>登录</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button 
            onClick={() => navigate('/register')}
            className="text-sm font-bold text-gray-900 hover:underline"
          >
            注册新账号
          </button>

          <div className="w-full flex items-center justify-center space-x-2 my-2">
            <div className="h-px bg-gray-300 w-12"></div>
            <span className="text-xs text-gray-500 font-medium">或</span>
            <div className="h-px bg-gray-300 w-12"></div>
          </div>

          <button 
            onClick={handleGuestLogin}
            className="text-sm text-gray-600 flex items-center hover:text-gray-900 transition-colors bg-white/50 px-4 py-2 rounded-full border border-gray-200"
          >
            <Ghost size={16} className="mr-1" />
            游客随便逛逛
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;