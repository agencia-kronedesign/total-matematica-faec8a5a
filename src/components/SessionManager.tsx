
import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionWarningModal from '@/components/SessionWarningModal';

const SessionManager: React.FC = () => {
  const { showWarning, timeLeft, extendSession } = useSessionTimeout();

  return (
    <SessionWarningModal
      isOpen={showWarning}
      timeLeft={timeLeft}
      onExtendSession={extendSession}
    />
  );
};

export default SessionManager;
