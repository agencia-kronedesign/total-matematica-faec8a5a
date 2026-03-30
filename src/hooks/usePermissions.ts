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

  // Helpers de tipo
  const isDirecao = () => hasPermission('direcao');
  const isCoordenador = () => hasPermission('coordenador');
  const isStudent = () => hasPermission('aluno');

  // NÍVEL 0 - Admin: tudo
  const canManageSystem = () => hasPermission('admin');

  // NÍVEL 1 - Direção: gestão de usuários, escolas, turmas, matrículas
  const canManageUsers = () => hasPermission(['admin', 'direcao']);
  const canDeleteStudents = () => hasPermission(['admin', 'direcao']);
  const canImportData = () => hasPermission(['admin', 'direcao']);
  const canControlSubordinateSecretaries = () => hasPermission(['admin', 'direcao']);
  const canGenerateInternalReports = () => hasPermission(['admin', 'direcao']);
  const canManageSchools = () => hasPermission(['admin', 'direcao']);

  // NÍVEL 2 - Coordenador: visualizar relatórios, monitorar, matrículas
  const canManageEnrollments = () => hasPermission(['admin', 'direcao', 'coordenador']);
  const canViewReports = () => hasPermission(['admin', 'direcao', 'professor', 'coordenador']);

  // NÍVEL 3 - Professor: criar exercícios, gerenciar categorias, suas turmas
  const canCreateExercises = () => hasPermission(['admin', 'professor']);
  const canManageCategories = () => hasPermission(['admin', 'professor']);
  const canManageContent = () => hasPermission(['admin', 'professor']);

  // Acesso à área do professor (visualização): admin, direcao, professor, coordenador
  const canAccessProfessorArea = () => hasPermission(['admin', 'direcao', 'professor', 'coordenador']);

  return {
    isAdmin,
    isProfessor,
    userType,
    hasPermission,
    isDirecao,
    isCoordenador,
    isStudent,
    canManageUsers,
    canDeleteStudents,
    canImportData,
    canControlSubordinateSecretaries,
    canGenerateInternalReports,
    canManageSchools,
    canManageEnrollments,
    canViewReports,
    canManageContent,
    canManageSystem,
    canCreateExercises,
    canManageCategories,
    canAccessProfessorArea,
  };
};
