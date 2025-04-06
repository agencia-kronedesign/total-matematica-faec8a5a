export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atividade_exercicios: {
        Row: {
          atividade_id: string | null
          created_at: string
          exercicio_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          atividade_id?: string | null
          created_at?: string
          exercicio_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          atividade_id?: string | null
          created_at?: string
          exercicio_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_exercicios_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividade_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          created_at: string
          data_envio: string
          data_limite: string | null
          descricao: string | null
          id: string
          professor_id: string | null
          status: string | null
          tipo: Database["public"]["Enums"]["activity_type"]
          titulo: string
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_envio?: string
          data_limite?: string | null
          descricao?: string | null
          id?: string
          professor_id?: string | null
          status?: string | null
          tipo: Database["public"]["Enums"]["activity_type"]
          titulo: string
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_envio?: string
          data_limite?: string | null
          descricao?: string | null
          id?: string
          professor_id?: string | null
          status?: string | null
          tipo?: Database["public"]["Enums"]["activity_type"]
          titulo?: string
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      escolas: {
        Row: {
          cidade: string | null
          cnpj: string | null
          created_at: string
          data_contrato: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          logotipo_url: string | null
          nome: string
          pais: string | null
          status: boolean | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          data_contrato?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logotipo_url?: string | null
          nome: string
          pais?: string | null
          status?: boolean | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          cnpj?: string | null
          created_at?: string
          data_contrato?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          logotipo_url?: string | null
          nome?: string
          pais?: string | null
          status?: boolean | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      exercicios: {
        Row: {
          ativo: boolean | null
          created_at: string
          formula: string | null
          id: string
          imagem_url: string | null
          margem_erro: number | null
          ordem: number | null
          subcategoria_id: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          formula?: string | null
          id?: string
          imagem_url?: string | null
          margem_erro?: number | null
          ordem?: number | null
          subcategoria_id?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          formula?: string | null
          id?: string
          imagem_url?: string | null
          margem_erro?: number | null
          ordem?: number | null
          subcategoria_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercicios_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_acesso: {
        Row: {
          created_at: string
          data_login: string
          id: string
          ip: string | null
          navegador: string | null
          sucesso: boolean | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          data_login?: string
          id?: string
          ip?: string | null
          navegador?: string | null
          sucesso?: boolean | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          data_login?: string
          id?: string
          ip?: string | null
          navegador?: string | null
          sucesso?: boolean | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_acesso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          created_at: string
          id: string
          numero_chamada: number | null
          status: string | null
          turma_id: string | null
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          numero_chamada?: number | null
          status?: string | null
          turma_id?: string | null
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          numero_chamada?: number | null
          status?: string | null
          turma_id?: string | null
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          corpo: string
          created_at: string
          data_envio: string
          destinatario_id: string | null
          id: string
          lida: boolean | null
          remetente_id: string | null
          tipo_destinatario: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          corpo: string
          created_at?: string
          data_envio?: string
          destinatario_id?: string | null
          id?: string
          lida?: boolean | null
          remetente_id?: string | null
          tipo_destinatario?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          corpo?: string
          created_at?: string
          data_envio?: string
          destinatario_id?: string | null
          id?: string
          lida?: boolean | null
          remetente_id?: string | null
          tipo_destinatario?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          conteudo: string
          created_at: string
          data_disparo: string
          id: string
          tipo: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          usuario_id: string | null
          vista: boolean | null
        }
        Insert: {
          conteudo: string
          created_at?: string
          data_disparo?: string
          id?: string
          tipo: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          usuario_id?: string | null
          vista?: boolean | null
        }
        Update: {
          conteudo?: string
          created_at?: string
          data_disparo?: string
          id?: string
          tipo?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          usuario_id?: string | null
          vista?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_acesso: {
        Row: {
          created_at: string
          descricao: string
          id: string
          nivel: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          nivel: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          nivel?: number
          updated_at?: string
        }
        Relationships: []
      }
      respostas: {
        Row: {
          acerto_nivel: Database["public"]["Enums"]["acerto_nivel_type"] | null
          aluno_id: string | null
          atividade_id: string | null
          created_at: string
          data_envio: string
          exercicio_id: string | null
          id: string
          margem_aplicada: number | null
          numero_n: number | null
          resposta_digitada: string | null
          resultado_calculado: number | null
          updated_at: string
        }
        Insert: {
          acerto_nivel?: Database["public"]["Enums"]["acerto_nivel_type"] | null
          aluno_id?: string | null
          atividade_id?: string | null
          created_at?: string
          data_envio?: string
          exercicio_id?: string | null
          id?: string
          margem_aplicada?: number | null
          numero_n?: number | null
          resposta_digitada?: string | null
          resultado_calculado?: number | null
          updated_at?: string
        }
        Update: {
          acerto_nivel?: Database["public"]["Enums"]["acerto_nivel_type"] | null
          aluno_id?: string | null
          atividade_id?: string | null
          created_at?: string
          data_envio?: string
          exercicio_id?: string | null
          id?: string
          margem_aplicada?: number | null
          numero_n?: number | null
          resposta_digitada?: string | null
          resultado_calculado?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "respostas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respostas_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias: {
        Row: {
          categoria_id: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      sugestoes: {
        Row: {
          created_at: string
          data_envio: string
          id: string
          mensagem: string
          respondido: boolean | null
          updated_at: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          data_envio?: string
          id?: string
          mensagem: string
          respondido?: boolean | null
          updated_at?: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          data_envio?: string
          id?: string
          mensagem?: string
          respondido?: boolean | null
          updated_at?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sugestoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano_letivo: number
          created_at: string
          escola_id: string | null
          id: string
          nivel_ensino: string | null
          nome: string
          status: boolean | null
          turno: string | null
          updated_at: string
        }
        Insert: {
          ano_letivo: number
          created_at?: string
          escola_id?: string | null
          id?: string
          nivel_ensino?: string | null
          nome: string
          status?: boolean | null
          turno?: string | null
          updated_at?: string
        }
        Update: {
          ano_letivo?: number
          created_at?: string
          escola_id?: string | null
          id?: string
          nivel_ensino?: string | null
          nome?: string
          status?: boolean | null
          turno?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string
          data_criacao: string
          email: string
          id: string
          nome: string
          perfil_acesso_id: string | null
          telefone: string | null
          tipo_usuario: Database["public"]["Enums"]["user_type"]
          ultima_atividade: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          data_criacao?: string
          email: string
          id: string
          nome: string
          perfil_acesso_id?: string | null
          telefone?: string | null
          tipo_usuario: Database["public"]["Enums"]["user_type"]
          ultima_atividade?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          data_criacao?: string
          email?: string
          id?: string
          nome?: string
          perfil_acesso_id?: string | null
          telefone?: string | null
          tipo_usuario?: Database["public"]["Enums"]["user_type"]
          ultima_atividade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_perfil_acesso_id_fkey"
            columns: ["perfil_acesso_id"]
            isOneToOne: false
            referencedRelation: "perfis_acesso"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_acesso_usuarios: {
        Row: {
          data_login: string | null
          email: string | null
          ip: string | null
          navegador: string | null
          nome: string | null
          sucesso: boolean | null
          tipo_usuario: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      vw_redal: {
        Row: {
          ano_letivo: number | null
          atividade: string | null
          percentual_acertos: number | null
          total_acertos: number | null
          total_alunos: number | null
          total_respostas: number | null
          turma: string | null
        }
        Relationships: []
      }
      vw_redalgraf: {
        Row: {
          ano_letivo: number | null
          mes: string | null
          percentual_acertos: number | null
          total_acertos: number | null
          total_alunos: number | null
          total_respostas: number | null
          turma: string | null
        }
        Relationships: []
      }
      vw_redingraf: {
        Row: {
          aluno: string | null
          ano_letivo: number | null
          mes: string | null
          percentual_acertos: number | null
          total_acertos: number | null
          total_respostas: number | null
          turma: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      acerto_nivel_type:
        | "correto"
        | "correto_com_margem"
        | "meio_certo"
        | "incorreto"
      activity_type: "casa" | "aula"
      notification_type:
        | "atividade_pendente"
        | "sem_atividade"
        | "lembrete"
        | "sistema"
      user_type:
        | "admin"
        | "direcao"
        | "coordenador"
        | "professor"
        | "aluno"
        | "responsavel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
