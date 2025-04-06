
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  videoId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, title, videoId }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Assista o vídeo para aprender mais sobre o método Total Matemática
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video">
          <iframe 
            width="100%" 
            height="100%" 
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-md"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
