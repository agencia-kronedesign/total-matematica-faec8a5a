import { useQuery } from '@tanstack/react-query';
import { fetchCitiesByState, fallbackCitiesByState } from '@/services/ibge';

export const useCidades = (estado: string) => {
  return useQuery({
    queryKey: ['cidades', estado],
    queryFn: async () => {
      try {
        const data = await fetchCitiesByState(estado);
        return data.map(cidade => cidade.nome);
      } catch (error) {
        console.warn('Erro ao buscar cidades do IBGE, usando lista local');
        return fallbackCitiesByState[estado] || [];
      }
    },
    enabled: !!estado,
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: 1,
  });
};