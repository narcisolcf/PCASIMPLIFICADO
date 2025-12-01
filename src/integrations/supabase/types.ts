export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agentes_publicos: {
        Row: {
          ativo: boolean
          cargo: string | null
          cargo_id: string | null
          cpf: string
          created_at: string
          email: string | null
          email_corporativo: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          cargo_id?: string | null
          cpf: string
          created_at?: string
          email?: string | null
          email_corporativo?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          cargo_id?: string | null
          cpf?: string
          created_at?: string
          email?: string | null
          email_corporativo?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agentes_publicos_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
        ]
      }
      anexos_dfd: {
        Row: {
          caminho_storage: string
          created_at: string
          dfd_id: string
          id: string
          nome_arquivo: string
          tamanho_bytes: number
          tipo_mime: string | null
          uploaded_by: string
        }
        Insert: {
          caminho_storage: string
          created_at?: string
          dfd_id: string
          id?: string
          nome_arquivo: string
          tamanho_bytes: number
          tipo_mime?: string | null
          uploaded_by: string
        }
        Update: {
          caminho_storage?: string
          created_at?: string
          dfd_id?: string
          id?: string
          nome_arquivo?: string
          tamanho_bytes?: number
          tipo_mime?: string | null
          uploaded_by?: string
        }
        Relationships: []
      }
      areas_requisitantes: {
        Row: {
          created_at: string | null
          disponibilidade_orcamentaria: number
          id: string
          nome: string
          numero: number
          numero_uasg: string
          uasg_id: string | null
        }
        Insert: {
          created_at?: string | null
          disponibilidade_orcamentaria?: number
          id?: string
          nome: string
          numero?: number
          numero_uasg: string
          uasg_id?: string | null
        }
        Update: {
          created_at?: string | null
          disponibilidade_orcamentaria?: number
          id?: string
          nome?: string
          numero?: number
          numero_uasg?: string
          uasg_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "areas_requisitantes_uasg_id_fkey"
            columns: ["uasg_id"]
            isOneToOne: false
            referencedRelation: "uasgs"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      catalogo_itens: {
        Row: {
          ativo: boolean
          codigo_item: string | null
          created_at: string
          descricao: string
          especificacoes: string | null
          id: string
          tipo: Database["public"]["Enums"]["tipo_material_servico"]
          unidade_medida: string
          updated_at: string
          valor_unitario_referencia: number | null
        }
        Insert: {
          ativo?: boolean
          codigo_item?: string | null
          created_at?: string
          descricao: string
          especificacoes?: string | null
          id?: string
          tipo: Database["public"]["Enums"]["tipo_material_servico"]
          unidade_medida: string
          updated_at?: string
          valor_unitario_referencia?: number | null
        }
        Update: {
          ativo?: boolean
          codigo_item?: string | null
          created_at?: string
          descricao?: string
          especificacoes?: string | null
          id?: string
          tipo?: Database["public"]["Enums"]["tipo_material_servico"]
          unidade_medida?: string
          updated_at?: string
          valor_unitario_referencia?: number | null
        }
        Relationships: []
      }
      dfds: {
        Row: {
          area_requisitante_id: string | null
          created_at: string | null
          data_conclusao: string | null
          descricao_sucinta: string | null
          id: string
          justificativa_necessidade: string | null
          numero: number
          numero_uasg: string
          prioridade: Database["public"]["Enums"]["prioridade"] | null
          situacao: Database["public"]["Enums"]["situacao_dfd"] | null
          updated_at: string | null
          user_id: string
          valor_total: number | null
        }
        Insert: {
          area_requisitante_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          descricao_sucinta?: string | null
          id?: string
          justificativa_necessidade?: string | null
          numero?: number
          numero_uasg: string
          prioridade?: Database["public"]["Enums"]["prioridade"] | null
          situacao?: Database["public"]["Enums"]["situacao_dfd"] | null
          updated_at?: string | null
          user_id: string
          valor_total?: number | null
        }
        Update: {
          area_requisitante_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          descricao_sucinta?: string | null
          id?: string
          justificativa_necessidade?: string | null
          numero?: number
          numero_uasg?: string
          prioridade?: Database["public"]["Enums"]["prioridade"] | null
          situacao?: Database["public"]["Enums"]["situacao_dfd"] | null
          updated_at?: string | null
          user_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dfds_area_requisitante_id_fkey"
            columns: ["area_requisitante_id"]
            isOneToOne: false
            referencedRelation: "areas_requisitantes"
            referencedColumns: ["id"]
          },
        ]
      }
      funcoes: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      materiais_servicos: {
        Row: {
          codigo_item: string | null
          created_at: string | null
          descricao: string
          dfd_id: string
          id: string
          justificativa: string | null
          quantidade: number
          tipo: Database["public"]["Enums"]["tipo_material_servico"]
          unidade_medida: string
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          codigo_item?: string | null
          created_at?: string | null
          descricao: string
          dfd_id: string
          id?: string
          justificativa?: string | null
          quantidade?: number
          tipo: Database["public"]["Enums"]["tipo_material_servico"]
          unidade_medida: string
          valor_total?: number | null
          valor_unitario?: number
        }
        Update: {
          codigo_item?: string | null
          created_at?: string | null
          descricao?: string
          dfd_id?: string
          id?: string
          justificativa?: string | null
          quantidade?: number
          tipo?: Database["public"]["Enums"]["tipo_material_servico"]
          unidade_medida?: string
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "materiais_servicos_dfd_id_fkey"
            columns: ["dfd_id"]
            isOneToOne: false
            referencedRelation: "dfds"
            referencedColumns: ["id"]
          },
        ]
      }
      responsaveis: {
        Row: {
          cargo: string | null
          cargo_id: string | null
          cpf: string
          created_at: string | null
          dfd_id: string
          email: string | null
          funcao: string | null
          funcao_id: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          cargo?: string | null
          cargo_id?: string | null
          cpf: string
          created_at?: string | null
          dfd_id: string
          email?: string | null
          funcao?: string | null
          funcao_id?: string | null
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          cargo?: string | null
          cargo_id?: string | null
          cpf?: string
          created_at?: string | null
          dfd_id?: string
          email?: string | null
          funcao?: string | null
          funcao_id?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responsaveis_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responsaveis_dfd_id_fkey"
            columns: ["dfd_id"]
            isOneToOne: false
            referencedRelation: "dfds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responsaveis_funcao_id_fkey"
            columns: ["funcao_id"]
            isOneToOne: false
            referencedRelation: "funcoes"
            referencedColumns: ["id"]
          },
        ]
      }
      uasgs: {
        Row: {
          created_at: string
          disponibilidade_orcamentaria: number
          id: string
          nome: string
          numero_uasg: string
          ordenador_despesa_id: string | null
          rubricas: string | null
          unidades_orcamentarias: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          disponibilidade_orcamentaria?: number
          id?: string
          nome: string
          numero_uasg: string
          ordenador_despesa_id?: string | null
          rubricas?: string | null
          unidades_orcamentarias?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          disponibilidade_orcamentaria?: number
          id?: string
          nome?: string
          numero_uasg?: string
          ordenador_despesa_id?: string | null
          rubricas?: string | null
          unidades_orcamentarias?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ordenador_despesa"
            columns: ["ordenador_despesa_id"]
            isOneToOne: false
            referencedRelation: "agentes_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      funcao_responsavel: "Requisitante" | "Técnico" | "Gerente" | "Fiscal"
      prioridade: "Baixa" | "Média" | "Alta"
      situacao_dfd: "Rascunho" | "Enviado" | "Vinculado"
      tipo_material_servico: "Material" | "Serviço"
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
      funcao_responsavel: ["Requisitante", "Técnico", "Gerente", "Fiscal"],
      prioridade: ["Baixa", "Média", "Alta"],
      situacao_dfd: ["Rascunho", "Enviado", "Vinculado"],
      tipo_material_servico: ["Material", "Serviço"],
    },
  },
} as const
