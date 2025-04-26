
export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  nivel_dificuldade?: number;
  ordem?: number;
  cor?: string;
  ativo?: boolean;
}
