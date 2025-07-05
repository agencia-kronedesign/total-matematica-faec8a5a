import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { userProfile, isAdmin, isProfessor, userType } = useAuth();

  const hasPermission = (requiredRole: string | string[]) => {
    if (!userProfile) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userProfile.tipo_usuario);
    }
    
    return userProfile.tipo_usuario === requiredRole;
  };

  const canManageUsers = () => hasPermission(['admin', 'coordenador']);
  const canManageContent = () => hasPermission(['admin', 'professor', 'coordenador']);
  const canViewReports = () => hasPermission(['admin', 'professor', 'coordenador']);
  const canManageSystem = () => hasPermission('admin');

  return {
    isAdmin,
    isProfessor,
    userType,
    hasPermission,
    canManageUsers,
    canManageContent,
    canViewReports,
    canManageSystem,
  };
};