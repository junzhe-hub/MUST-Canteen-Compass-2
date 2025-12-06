
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, GraduationCap, Check, Lock, ChevronRight, X, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/auth';

// Simple Preset Avatar Colors/Initials Mock
const AVATAR_PRESETS = [
  '', // Default (Initial)
  'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140051.png'
];

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, showToast } = useApp();
  
  const [formData, setFormData] = useState({
    userName: userProfile?.userName || '',
    major: userProfile?.major || '',
    grade: userProfile?.grade || '',
    avatar: userProfile?.avatar || ''
  });

  // Password Modal State
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [pwdData, setPwdData] = useState({ old: '', new: '' });
  const [isPwdLoading, setIsPwdLoading] = useState(false);

  const handleSave = () => {
    if (!formData.userName.trim()) {
      showToast('昵称不能为空', 'error');
      return;
    }
    updateUserProfile(formData);
    showToast('个人资料已更新', 'success');
    navigate(-1);
  };

  const handleChangePassword = async () => {
    if (!pwdData.old || !pwdData.new) {
        showToast('请填写所有密码字段', 'error');
        return;
    }
    if (!userProfile?.email) return;

    setIsPwdLoading(true);
    try {
        await authService.changePassword(userProfile.email, pwdData.old, pwdData.new);
        showToast('密码修改成功', 'success');
        setIsPwdModalOpen(false);
        setPwdData({ old: '', new: '' });
    } catch (e: any) {
        showToast(e.message || '修改失败', 'error');
    } finally {
        setIsPwdLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
       <div className="bg-white p-4 sticky top-0 z-40 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-lg font-bold">编辑资料</h1>
          </div>
          <button 
            onClick={handleSave}
            className="text-sm font-bold bg-black text-white px-4 py-2 rounded-lg active:scale-95 transition-transform"
          >
            保存
          </button>
       </div>

       <div className="p-4 space-y-6">
          {/* Avatar Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
             <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-4 border-4 border-white shadow-md relative">
                {formData.avatar ? (
                   <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-yellow-200 flex items-center justify-center text-3xl font-bold text-yellow-800">
                      {formData.userName.charAt(0)}
                   </div>
                )}
             </div>
             <p className="text-xs text-gray-400 mb-3">选择头像</p>
             <div className="flex space-x-3">
                 <button 
                   onClick={() => setFormData({...formData, avatar: ''})}
                   className={`w-10 h-10 rounded-full bg-yellow-200 border-2 flex items-center justify-center text-xs font-bold text-yellow-800 ${formData.avatar === '' ? 'border-black' : 'border-transparent'}`}
                 >
                    {formData.userName.charAt(0)}
                 </button>
                 {AVATAR_PRESETS.slice(1).map((url, idx) => (
                    <button 
                       key={idx}
                       onClick={() => setFormData({...formData, avatar: url})}
                       className={`w-10 h-10 rounded-full overflow-hidden border-2 relative ${formData.avatar === url ? 'border-black' : 'border-transparent'}`}
                    >
                       <img src={url} alt={`preset-${idx}`} className="w-full h-full object-cover" />
                       {formData.avatar === url && (
                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                               <Check size={16} className="text-white" />
                           </div>
                       )}
                    </button>
                 ))}
             </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-4 border-b border-gray-50 flex items-center">
                 <User className="text-gray-400 mr-3" size={20} />
                 <div className="flex-1">
                     <label className="block text-xs text-gray-500 mb-1">昵称</label>
                     <input 
                        type="text" 
                        value={formData.userName}
                        onChange={e => setFormData({...formData, userName: e.target.value})}
                        className="w-full font-bold text-gray-900 outline-none placeholder-gray-300"
                        placeholder="请输入昵称"
                     />
                 </div>
             </div>
             
             <div className="p-4 border-b border-gray-50 flex items-center">
                 <BookOpen className="text-gray-400 mr-3" size={20} />
                 <div className="flex-1">
                     <label className="block text-xs text-gray-500 mb-1">专业</label>
                     <input 
                        type="text" 
                        value={formData.major}
                        onChange={e => setFormData({...formData, major: e.target.value})}
                        className="w-full font-bold text-gray-900 outline-none placeholder-gray-300"
                        placeholder="例如：计算机科学"
                     />
                 </div>
             </div>

             <div className="p-4 flex items-center">
                 <GraduationCap className="text-gray-400 mr-3" size={20} />
                 <div className="flex-1">
                     <label className="block text-xs text-gray-500 mb-1">年级</label>
                     <select 
                        value={formData.grade}
                        onChange={e => setFormData({...formData, grade: e.target.value})}
                        className="w-full font-bold text-gray-900 outline-none bg-transparent appearance-none"
                     >
                        <option value="大一">大一</option>
                        <option value="大二">大二</option>
                        <option value="大三">大三</option>
                        <option value="大四">大四</option>
                        <option value="研究生">研究生</option>
                        <option value="博士">博士</option>
                        <option value="校友">校友</option>
                        <option value="教职工">教职工</option>
                     </select>
                 </div>
             </div>
          </div>

          {/* Security Section - Hidden for Guest */}
          {!userProfile.isGuest && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <h3 className="text-xs font-bold text-gray-500 uppercase">账户安全</h3>
                  </div>
                  <div 
                    onClick={() => setIsPwdModalOpen(true)}
                    className="p-4 flex items-center justify-between active:bg-gray-50 cursor-pointer"
                  >
                     <div className="flex items-center">
                        <Lock className="text-gray-400 mr-3" size={20} />
                        <span className="font-bold text-gray-900">修改密码</span>
                     </div>
                     <ChevronRight size={16} className="text-gray-300" />
                  </div>
              </div>
          )}
       </div>

       {/* Change Password Modal */}
       {isPwdModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPwdModalOpen(false)}></div>
               <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 p-6 animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold">修改密码</h3>
                       <button onClick={() => setIsPwdModalOpen(false)} className="text-gray-400 hover:text-black">
                           <X size={20} />
                       </button>
                   </div>
                   
                   <div className="space-y-4 mb-6">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1.5">当前密码</label>
                           <input 
                                type="password"
                                value={pwdData.old}
                                onChange={e => setPwdData({...pwdData, old: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="输入旧密码"
                           />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 mb-1.5">新密码</label>
                           <input 
                                type="password"
                                value={pwdData.new}
                                onChange={e => setPwdData({...pwdData, new: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="8位以上，含字母和数字"
                           />
                       </div>
                   </div>

                   <button 
                        onClick={handleChangePassword}
                        disabled={isPwdLoading}
                        className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
                   >
                       {isPwdLoading ? <Loader2 size={18} className="animate-spin" /> : '确认修改'}
                   </button>
               </div>
           </div>
       )}
    </div>
  );
};

export default Settings;
