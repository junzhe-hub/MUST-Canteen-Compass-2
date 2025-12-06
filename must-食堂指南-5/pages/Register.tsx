
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';
import { ArrowLeft, Mail, Key, CheckCircle, Lock } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send Code
  const handleSendCode = async () => {
    if (!authService.validateEmail(email)) {
      showToast('请使用有效的 MUST 邮箱 (@must.edu.mo)', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      const serverCode = await authService.sendVerificationCode(email);
      setGeneratedCode(serverCode);
      showToast(`验证码已发送 (模拟: ${serverCode})`, 'success'); // Show code for demo
      setStep(2);
    } catch (e) {
      showToast('发送验证码失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Code
  const handleVerifyCode = () => {
    if (code !== generatedCode) {
      showToast('验证码错误', 'error');
      return;
    }
    setStep(3);
  };

  // Step 3: Set Password & Register
  const handleRegister = async () => {
    if (!authService.validatePassword(password)) {
      showToast('密码需至少8位，包含字母和数字', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Use email prefix as default username
      const defaultName = email.split('@')[0];
      await authService.register(email, password, defaultName);
      showToast('注册成功！请登录', 'success');
      navigate('/login');
    } catch (e) {
      showToast('注册失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      <div className="mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 w-10 h-10 flex items-center justify-center">
            <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">注册账号</h1>
        <p className="text-gray-500 mb-8 text-sm">
            {step === 1 && '验证您的学校邮箱'}
            {step === 2 && '输入4位验证码'}
            {step === 3 && '设置您的安全密码'}
        </p>

        {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center">
                    <Mail className="text-gray-400 mr-3" size={20} />
                    <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="student.must.edu.mo"
                    className="bg-transparent flex-1 outline-none text-sm font-medium"
                    autoFocus
                    />
                </div>
                <button 
                    onClick={handleSendCode}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
                >
                    {isLoading ? '发送中...' : '发送验证码'}
                </button>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center">
                    <Key className="text-gray-400 mr-3" size={20} />
                    <input 
                    type="text" 
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="4位数字验证码"
                    maxLength={4}
                    className="bg-transparent flex-1 outline-none text-sm font-medium tracking-widest"
                    autoFocus
                    />
                </div>
                <button 
                    onClick={handleVerifyCode}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
                >
                    验证
                </button>
                <button onClick={() => setStep(1)} className="w-full text-center text-xs text-gray-400 mt-4">
                    重新发送
                </button>
            </div>
        )}

        {step === 3 && (
             <div className="space-y-4 animate-in slide-in-from-right">
                 <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center">
                    <Lock className="text-gray-400 mr-3" size={20} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="设置密码"
                        className="bg-transparent flex-1 outline-none text-sm font-medium"
                        autoFocus
                    />
                </div>
                <div className="text-xs text-gray-400 pl-2">
                    <p className="flex items-center"><CheckCircle size={10} className="mr-1"/> 至少8个字符</p>
                    <p className="flex items-center mt-1"><CheckCircle size={10} className="mr-1"/> 包含字母和数字</p>
                </div>
                <button 
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold active:scale-95 transition-transform"
                >
                    {isLoading ? '注册中...' : '完成注册'}
                </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default Register;
