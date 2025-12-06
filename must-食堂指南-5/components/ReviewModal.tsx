
import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Loader2, Camera, Trash2 } from 'lucide-react';
import { Review } from '../types';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Review, 'id' | 'date' | 'likes'>) => Promise<void>;
  restaurantName: string; // Used for Display title (can be Dish name too)
}

const ReviewModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, restaurantName }) => {
  const { userProfile } = useApp();
  const [appearance, setAppearance] = useState(0);
  const [aroma, setAroma] = useState(0);
  const [taste, setTaste] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto calculate average rating
  const calculatedRating = React.useMemo(() => {
    if (appearance === 0 && aroma === 0 && taste === 0) return 0;
    // Simple average rounded to 1 decimal
    return parseFloat(((appearance + aroma + taste) / 3).toFixed(1));
  }, [appearance, aroma, taste]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
        setAppearance(0);
        setAroma(0);
        setTaste(0);
        setComment('');
        setSelectedImage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  };

  const removeImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const handleSubmit = async () => {
    // Add null check for userProfile to guard against TS errors
    if (!userProfile) return;
    if (!comment.trim() || appearance === 0 || aroma === 0 || taste === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        userId: userProfile.id, 
        userName: userProfile.userName, // Use dynamic name
        rating: Math.round(calculatedRating), // Store as integer stars for simplicity in data
        dimensions: { appearance, aroma, taste },
        comment,
        images: selectedImage ? [selectedImage] : []
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
                <h3 className="font-bold text-gray-900">评价菜品</h3>
                <p className="text-xs text-gray-500">{restaurantName}</p>
            </div>
            <button onClick={onClose} className="bg-gray-200 p-1 rounded-full text-gray-500 hover:bg-gray-300 transition-colors">
                <X size={16} />
            </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
            {/* 3 Dimensions Input */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-700 w-16">色 (外观)</span>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setAppearance(star)} className="focus:outline-none transition-transform active:scale-110">
                                <Star size={24} className={`${star <= appearance ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-700 w-16">香 (气味)</span>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setAroma(star)} className="focus:outline-none transition-transform active:scale-110">
                                <Star size={24} className={`${star <= aroma ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-700 w-16">味 (口感)</span>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setTaste(star)} className="focus:outline-none transition-transform active:scale-110">
                                <Star size={24} className={`${star <= taste ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Calculated Score Display */}
            <div className="flex justify-center items-center py-2">
                <div className="text-center">
                    <span className="text-4xl font-bold text-gray-900">{calculatedRating}</span>
                    <span className="text-gray-400 text-sm ml-1">/ 5.0</span>
                    <div className="flex justify-center mt-1">
                        <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-bold">
                            {calculatedRating >= 4.5 ? '超棒' : calculatedRating >= 4 ? '很好' : calculatedRating >= 3 ? '一般' : '需改进'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Comment Area */}
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">评价内容</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="请输入评论内容..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 min-h-[100px] resize-none"
                />
            </div>
            
             {/* Photo Upload */}
             <div>
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                />
                
                {selectedImage ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                            onClick={removeImage}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={triggerFileInput}
                            className="border border-dashed border-gray-300 rounded-lg p-3 text-gray-400 flex flex-col items-center justify-center hover:bg-gray-50 w-20 h-20 active:scale-95 transition-transform"
                        >
                            <Camera size={20} className="mb-1" />
                            <span className="text-[10px]">添加图片</span>
                        </button>
                    </div>
                )}
             </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
                onClick={handleSubmit}
                disabled={isSubmitting || !comment.trim() || calculatedRating === 0}
                className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                {isSubmitting && <Loader2 size={16} className="animate-spin mr-2" />}
                提交评价
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
