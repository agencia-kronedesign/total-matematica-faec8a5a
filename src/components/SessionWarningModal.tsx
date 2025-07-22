
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionWarningModalProps {
  isOpen: boolean;
  timeLeft: number;
  onExtendSession: () => void;
}

const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  timeLeft,
  onExtendSession
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <AlertDialogTitle className="text-xl">
            Sessão Expirando
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-2">
            <p>Sua sessão expirará em:</p>
            <div className="text-2xl font-bold text-red-600">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-500">
              Clique em "Continuar Logado" para estender sua sessão.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-center">
          <AlertDialogAction asChild>
            <Button 
              onClick={onExtendSession}
              className="bg-totalBlue hover:bg-totalBlue/90 text-white min-w-[140px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Continuar Logado
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionWarningModal;
