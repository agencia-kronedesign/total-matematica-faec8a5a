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

  // Permissões específicas por nível hierárquico
  const canManageUsers = () => hasPermission(['admin', 'direcao', 'coordenador']);
  const canDeleteStudents = () => hasPermission(['admin', 'direcao']); // DIREÇÃO pode descadastrar alunos
  const canImportData = () => hasPermission(['admin', 'direcao']); // DIREÇÃO pode importar dados em massa
  const canControlSubordinateSecretaries = () => hasPermission(['admin', 'direcao']); // DIREÇÃO controla secretarias
  const canGenerateInternalReports = () => hasPermission(['admin', 'direcao']); // DIREÇÃO gera relatórios internos
  
  const canManageContent = () => hasPermission(['admin', 'direcao', 'professor', 'coordenador']);
  const canViewReports = () => hasPermission(['admin', 'direcao', 'professor', 'coordenador']);
  const canManageSystem = () => hasPermission('admin');
  
  // Controle específico para criação de exercícios
  const canCreateExercises = () => hasPermission(['admin', 'direcao', 'professor', 'coordenador']);
  const canManageCategories = () => hasPermission(['admin', 'direcao', 'professor', 'coordenador']);
  
  // Verificar se é aluno
  const isStudent = () => hasPermission('aluno');

  return {
    isAdmin,
    isProfessor,
    userType,
    hasPermission,
    canManageUsers,
    canDeleteStudents,
    canImportData,
    canControlSubordinateSecretaries,
    canGenerateInternalReports,
    canManageContent,
    canViewReports,
    canManageSystem,
    canCreateExercises,
    canManageCategories,
    isStudent,
  };
};