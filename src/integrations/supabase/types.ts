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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conferencias: {
        Row: {
          conferente: string | null
          created_at: string
          data_conferencia: string | null
          data_fiscal: string | null
          data_separacao: string
          decisao_fiscal: string | null
          fiscal: string | null
          id: string
          numero_embarque: string
          separador: string
          status: string
          updated_at: string
        }
        Insert: {
          conferente?: string | null
          created_at?: string
          data_conferencia?: string | null
          data_fiscal?: string | null
          data_separacao?: string
          decisao_fiscal?: string | null
          fiscal?: string | null
          id?: string
          numero_embarque: string
          separador: string
          status?: string
          updated_at?: string
        }
        Update: {
          conferente?: string | null
          created_at?: string
          data_conferencia?: string | null
          data_fiscal?: string | null
          data_separacao?: string
          decisao_fiscal?: string | null
          fiscal?: string | null
          id?: string
          numero_embarque?: string
          separador?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      itens_conferencia: {
        Row: {
          codigo_produto: string
          conferencia_id: string
          created_at: string
          data_fabricacao: string
          data_validade: string
          id: string
          item_separacao_id: string
          lote: string
          quantidade: number
          quantidade_pallets: number
          status: string
          tipo_embalagem: string
        }
        Insert: {
          codigo_produto: string
          conferencia_id: string
          created_at?: string
          data_fabricacao: string
          data_validade: string
          id?: string
          item_separacao_id: string
          lote: string
          quantidade?: number
          quantidade_pallets?: number
          status?: string
          tipo_embalagem: string
        }
        Update: {
          codigo_produto?: string
          conferencia_id?: string
          created_at?: string
          data_fabricacao?: string
          data_validade?: string
          id?: string
          item_separacao_id?: string
          lote?: string
          quantidade?: number
          quantidade_pallets?: number
          status?: string
          tipo_embalagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_conferencia_conferencia_id_fkey"
            columns: ["conferencia_id"]
            isOneToOne: false
            referencedRelation: "conferencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_conferencia_item_separacao_id_fkey"
            columns: ["item_separacao_id"]
            isOneToOne: false
            referencedRelation: "itens_separacao"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_separacao: {
        Row: {
          codigo_produto: string
          conferencia_id: string
          created_at: string
          data_fabricacao: string
          data_validade: string
          descricao_produto: string
          id: string
          lote: string
          quantidade: number
          quantidade_pallets: number
          tipo_embalagem: string
        }
        Insert: {
          codigo_produto: string
          conferencia_id: string
          created_at?: string
          data_fabricacao: string
          data_validade: string
          descricao_produto: string
          id?: string
          lote: string
          quantidade?: number
          quantidade_pallets?: number
          tipo_embalagem: string
        }
        Update: {
          codigo_produto?: string
          conferencia_id?: string
          created_at?: string
          data_fabricacao?: string
          data_validade?: string
          descricao_produto?: string
          id?: string
          lote?: string
          quantidade?: number
          quantidade_pallets?: number
          tipo_embalagem?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_separacao_conferencia_id_fkey"
            columns: ["conferencia_id"]
            isOneToOne: false
            referencedRelation: "conferencias"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
