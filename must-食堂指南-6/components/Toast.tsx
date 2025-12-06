
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-black text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white'
  };

  const icons = {
    success: <CheckCircle size={18} className="text-yellow-400" />,
    error: <XCircle size={18} />,
    info: <Info size={18} />
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className={`${bgColors[type]} px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 min-w-[200px] justify-center`}>
        {icons[type]}
        <span className="font-medium text-sm">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
