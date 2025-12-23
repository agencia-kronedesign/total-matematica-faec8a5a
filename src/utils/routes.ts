import { UserType } from '@/types/user';

export const HOME_POR_ROLE: Record<UserType, string> = {
  aluno: '/atividades',
  responsavel: '/atividades',
  professor: '/professor/atividades',
  coordenador: '/professor',
  direcao: '/professor',
  admin: '/admin',
};

export const getHomeByRole = (tipoUsuario: string | null | undefined): string => {
  if (!tipoUsuario) return '/';
  return HOME_POR_ROLE[tipoUsuario as UserType] ?? '/dashboard';
};
