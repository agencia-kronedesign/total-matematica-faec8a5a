
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SessionConfig {
  sessionDuration: number; // em minutos
  inactivityLimit: number; // em minutos
  warningTime: number; // em minutos antes do timeout
}

const SESSION_CONFIGS: Record<string, SessionConfig> = {
  admin: {
    sessionDuration: 60, // 1 hora
    inactivityLimit: 15, // 15 minutos
    warningTime: 5 // 5 minutos de aviso
  },
  professor: {
    sessionDuration: 240, // 4 horas
    inactivityLimit: 30, // 30 minutos
    warningTime: 10 // 10 minutos de aviso
  },
  direcao: {
    sessionDuration: 240, // 4 horas
    inactivityLimit: 30, // 30 minutos
    warningTime: 10 // 10 minutos de aviso
  },
  coordenador: {
    sessionDuration: 240, // 4 horas
    inactivityLimit: 30, // 30 minutos
    warningTime: 10 // 10 minutos de aviso
  },
  aluno: {
    sessionDuration: 480, // 8 horas
    inactivityLimit: 60, // 1 hora
    warningTime: 15 // 15 minutos de aviso
  },
  responsavel: {
    sessionDuration: 480, // 8 horas
    inactivityLimit: 60, // 1 hora
    warningTime: 15 // 15 minutos de aviso
  }
};

export const useSessionTimeout = () => {
  const { user, signOut, userType } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const logoutTimerRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();

  const getSessionConfig = useCallback((): SessionConfig => {
    const config = SESSION_CONFIGS[userType || 'aluno'];
    return config || SESSION_CONFIGS.aluno;
  }, [userType]);

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  const handleLogout = useCallback(async (reason: string) => {
    console.log(`🚪 Logout automático: ${reason}`);
    
    // Limpar todos os timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    
    setShowWarning(false);
    
    toast({
      title: "Sessão encerrada",
      description: reason,
      variant: "destructive",
    });
    
    // Limpar dados de atividade
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('sessionStartTime');
    
    await signOut();
  }, [signOut, toast]);

  const extendSession = useCallback(() => {
    console.log('🔄 Sessão estendida pelo usuário');
    updateLastActivity();
    setShowWarning(false);
    
    // Limpar timers de aviso
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    // Reiniciar monitoramento
    startSessionMonitoring();
  }, [updateLastActivity]);

  const startSessionMonitoring = useCallback(() => {
    if (!user) return;

    const config = getSessionConfig();
    const now = Date.now();
    
    // Definir início da sessão se não existir
    if (!localStorage.getItem('sessionStartTime')) {
      localStorage.setItem('sessionStartTime', now.toString());
    }
    
    // Limpar timers existentes
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    // Timer de aviso
    const warningTimeout = (config.inactivityLimit - config.warningTime) * 60 * 1000;
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(config.warningTime * 60);
      
      // Contagem regressiva
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Timer final de logout
      logoutTimerRef.current = setTimeout(() => {
        clearInterval(countdown);
        handleLogout('Sessão encerrada por inatividade');
      }, config.warningTime * 60 * 1000);
      
    }, warningTimeout);
    
  }, [user, getSessionConfig, handleLogout]);

  const checkSessionValidity = useCallback(() => {
    if (!user) return;

    const config = getSessionConfig();
    const now = Date.now();
    
    // Verificar tempo total de sessão
    const sessionStart = parseInt(localStorage.getItem('sessionStartTime') || now.toString());
    const sessionDuration = now - sessionStart;
    const maxSessionDuration = config.sessionDuration * 60 * 1000;
    
    if (sessionDuration > maxSessionDuration) {
      handleLogout('Sessão expirou por tempo limite');
      return;
    }
    
    // Verificar inatividade
    const lastActivity = parseInt(localStorage.getItem('lastActivity') || now.toString());
    const inactivityDuration = now - lastActivity;
    const maxInactivity = config.inactivityLimit * 60 * 1000;
    
    if (inactivityDuration > maxInactivity) {
      handleLogout('Sessão encerrada por inatividade');
      return;
    }
    
  }, [user, getSessionConfig, handleLogout]);

  // Detectar atividade do usuário
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateLastActivity();
      
      // Se há aviso ativo, esconder
      if (showWarning) {
        setShowWarning(false);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        startSessionMonitoring();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, showWarning, updateLastActivity, startSessionMonitoring]);

  // Inicializar monitoramento quando usuário faz login
  useEffect(() => {
    if (user) {
      updateLastActivity();
      startSessionMonitoring();
      
      // Verificação periódica (a cada minuto)
      checkIntervalRef.current = setInterval(checkSessionValidity, 60 * 1000);
    }

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [user, updateLastActivity, startSessionMonitoring, checkSessionValidity]);

  // Verificar sessão ao carregar página
  useEffect(() => {
    if (user) {
      checkSessionValidity();
    }
  }, [user, checkSessionValidity]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    sessionConfig: getSessionConfig()
  };
};
