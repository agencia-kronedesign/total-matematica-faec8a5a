export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      aluno_responsavel: {
        Row: {
          aluno_id: string
          autorizacao_buscar: boolean | null
          created_at: string
          id: string
          parentesco: string
          responsavel_financeiro: boolean | null
          responsavel_id: string
          responsavel_principal: boolean | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          autorizacao_buscar?: boolean | null
          created_at?: string
          id?: string
          parentesco: string
          responsavel_financeiro?: boolean | null
          responsavel_id: string
          responsavel_principal?: boolean | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          autorizacao_buscar?: boolean | null
          created_at?: string
          id?: string
          parentesco?: string
          responsavel_financeiro?: boolean | null
          responsavel_id?: string
          responsavel_principal?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aluno_responsavel_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aluno_responsavel_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "responsaveis"
            referencedColumns: ["id"]
          },
        ]
      }
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
          ativo: boolean | null
          cor: string | null
          created_at: string
          descricao: string | null
          icone_url: string | null
          id: string
          nivel_dificuldade: number | null
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nivel_dificuldade?: number | null
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nivel_dificuldade?: number | null
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      consentimento_usuario: {
        Row: {
          created_at: string | null
          data_consentimento: string | null
          id: string
          ip_consentimento: string | null
          navegador_consentimento: string | null
          politica_privacidade: boolean | null
          termos_uso: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          data_consentimento?: string | null
          id?: string
          ip_consentimento?: string | null
          navegador_consentimento?: string | null
          politica_privacidade?: boolean | null
          termos_uso?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          data_consentimento?: string | null
          id?: string
          ip_consentimento?: string | null
          navegador_consentimento?: string | null
          politica_privacidade?: boolean | null
          termos_uso?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consentimento_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas: {
        Row: {
          cep: string | null
          cidade: string | null
          cnpj: string | null
          coordenador_email: string | null
          coordenador_nome: string | null
          created_at: string
          data_contrato: string | null
          diretor_email: string | null
          diretor_nome: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          horario_funcionamento: string | null
          id: string
          inscricao_estadual: string | null
          inscricao_municipal: string | null
          isento_estadual: boolean | null
          isento_municipal: boolean | null
          logotipo_url: string | null
          niveis_ensino: string[] | null
          nome_fantasia: string | null
          observacoes: string | null
          pais: string | null
          razao_social: string
          redes_sociais: Json | null
          site: string | null
          status: boolean | null
          telefone: string | null
          tipo_escola: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          coordenador_email?: string | null
          coordenador_nome?: string | null
          created_at?: string
          data_contrato?: string | null
          diretor_email?: string | null
          diretor_nome?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          isento_estadual?: boolean | null
          isento_municipal?: boolean | null
          logotipo_url?: string | null
          niveis_ensino?: string[] | null
          nome_fantasia?: string | null
          observacoes?: string | null
          pais?: string | null
          razao_social: string
          redes_sociais?: Json | null
          site?: string | null
          status?: boolean | null
          telefone?: string | null
          tipo_escola?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          coordenador_email?: string | null
          coordenador_nome?: string | null
          created_at?: string
          data_contrato?: string | null
          diretor_email?: string | null
          diretor_nome?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          horario_funcionamento?: string | null
          id?: string
          inscricao_estadual?: string | null
          inscricao_municipal?: string | null
          isento_estadual?: boolean | null
          isento_municipal?: boolean | null
          logotipo_url?: string | null
          niveis_ensino?: string[] | null
          nome_fantasia?: string | null
          observacoes?: string | null
          pais?: string | null
          razao_social?: string
          redes_sociais?: Json | null
          site?: string | null
          status?: boolean | null
          telefone?: string | null
          tipo_escola?: string | null
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
          dispositivo: string | null
          id: string
          ip: string | null
          localizacao: string | null
          navegador: string | null
          sucesso: boolean | null
          tipo_login: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          data_login?: string
          dispositivo?: string | null
          id?: string
          ip?: string | null
          localizacao?: string | null
          navegador?: string | null
          sucesso?: boolean | null
          tipo_login?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          data_login?: string
          dispositivo?: string | null
          id?: string
          ip?: string | null
          localizacao?: string | null
          navegador?: string | null
          sucesso?: boolean | null
          tipo_login?: string | null
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
      preferencias_usuario: {
        Row: {
          aceite_notificacoes: boolean | null
          created_at: string | null
          id: string
          notificacao_email: boolean | null
          notificacao_push: boolean | null
          notificacao_site: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          aceite_notificacoes?: boolean | null
          created_at?: string | null
          id?: string
          notificacao_email?: boolean | null
          notificacao_push?: boolean | null
          notificacao_site?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          aceite_notificacoes?: boolean | null
          created_at?: string | null
          id?: string
          notificacao_email?: boolean | null
          notificacao_push?: boolean | null
          notificacao_site?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferencias_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          email: string
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          rg: string | null
          telefone: string | null
          tipo_responsavel: string
          updated_at: string
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          rg?: string | null
          telefone?: string | null
          tipo_responsavel: string
          updated_at?: string
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          rg?: string | null
          telefone?: string | null
          tipo_responsavel?: string
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
          ativo: boolean | null
          categoria_id: string | null
          cor: string | null
          created_at: string
          descricao: string | null
          icone_url: string | null
          id: string
          nivel_dificuldade: number | null
          nome: string
          ordem: number | null
          prerequisitos: string[] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nivel_dificuldade?: number | null
          nome: string
          ordem?: number | null
          prerequisitos?: string[] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          icone_url?: string | null
          id?: string
          nivel_dificuldade?: number | null
          nome?: string
          ordem?: number | null
          prerequisitos?: string[] | null
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
          cargo: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string
          data_criacao: string
          data_nascimento: string | null
          email: string
          email_responsavel: string | null
          endereco: string | null
          estado: string | null
          foto_url: string | null
          id: string
          nome: string
          nome_responsavel: string | null
          numero_chamada: number | null
          numero_matricula: string | null
          perfil_acesso_id: string | null
          permissao_relatorios: boolean | null
          rg: string | null
          telefone: string | null
          telefone_fixo: string | null
          telefone_mobile: string | null
          tipo_usuario: Database["public"]["Enums"]["user_type"]
          turma: string | null
          ultima_atividade: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_criacao?: string
          data_nascimento?: string | null
          email: string
          email_responsavel?: string | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          id: string
          nome: string
          nome_responsavel?: string | null
          numero_chamada?: number | null
          numero_matricula?: string | null
          perfil_acesso_id?: string | null
          permissao_relatorios?: boolean | null
          rg?: string | null
          telefone?: string | null
          telefone_fixo?: string | null
          telefone_mobile?: string | null
          tipo_usuario: Database["public"]["Enums"]["user_type"]
          turma?: string | null
          ultima_atividade?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string
          data_criacao?: string
          data_nascimento?: string | null
          email?: string
          email_responsavel?: string | null
          endereco?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          nome_responsavel?: string | null
          numero_chamada?: number | null
          numero_matricula?: string | null
          perfil_acesso_id?: string | null
          permissao_relatorios?: boolean | null
          rg?: string | null
          telefone?: string | null
          telefone_fixo?: string | null
          telefone_mobile?: string | null
          tipo_usuario?: Database["public"]["Enums"]["user_type"]
          turma?: string | null
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_type"]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acerto_nivel_type: [
        "correto",
        "correto_com_margem",
        "meio_certo",
        "incorreto",
      ],
      activity_type: ["casa", "aula"],
      notification_type: [
        "atividade_pendente",
        "sem_atividade",
        "lembrete",
        "sistema",
      ],
      user_type: [
        "admin",
        "direcao",
        "coordenador",
        "professor",
        "aluno",
        "responsavel",
      ],
    },
  },
} as const
