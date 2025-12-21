import { useState, useCallback, useEffect } from 'react';

interface UseLoginRateLimiterReturn {
  isBlocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
  registerFailedAttempt: () => void;
  resetAttempts: () => void;
}

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_SECONDS = 30;

export const useLoginRateLimiter = (): UseLoginRateLimiterReturn => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const isBlocked = blockEndTime !== null && Date.now() < blockEndTime;

  useEffect(() => {
    if (!blockEndTime) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = Math.ceil((blockEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setBlockEndTime(null);
        setRemainingSeconds(0);
        setFailedAttempts(0);
      } else {
        setRemainingSeconds(remaining);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [blockEndTime]);

  const registerFailedAttempt = useCallback(() => {
    setFailedAttempts((prev) => {
      const newCount = prev + 1;
      if (newCount >= MAX_ATTEMPTS) {
        setBlockEndTime(Date.now() + BLOCK_DURATION_SECONDS * 1000);
      }
      return newCount;
    });
  }, []);

  const resetAttempts = useCallback(() => {
    setFailedAttempts(0);
    setBlockEndTime(null);
    setRemainingSeconds(0);
  }, []);

  return {
    isBlocked,
    remainingSeconds,
    failedAttempts,
    registerFailedAttempt,
    resetAttempts,
  };
};
