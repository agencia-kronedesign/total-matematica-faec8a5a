
import React from 'react';
import { Play } from 'lucide-react';

interface VideoButtonProps {
  title: string;
  onClick: () => void;
}

const VideoButton: React.FC<VideoButtonProps> = ({ title, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-white text-totalBlue flex items-center gap-2 py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all"
    >
      <Play size={18} className="text-totalBlue" />
      <span className="font-medium">{title}</span>
    </button>
  );
};

export default VideoButton;
