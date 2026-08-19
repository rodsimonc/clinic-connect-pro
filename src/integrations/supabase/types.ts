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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      disponibilidades: {
        Row: {
          created_at: string
          dia_semana: number
          duracion_min: number
          hora_fin: string
          hora_inicio: string
          id: string
          medico_id: string
        }
        Insert: {
          created_at?: string
          dia_semana: number
          duracion_min?: number
          hora_fin: string
          hora_inicio: string
          id?: string
          medico_id: string
        }
        Update: {
          created_at?: string
          dia_semana?: number
          duracion_min?: number
          hora_fin?: string
          hora_inicio?: string
          id?: string
          medico_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidades_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidades: {
        Row: {
          activa: boolean
          created_at: string
          descripcion: string
          icono: string
          id: string
          nombre: string
        }
        Insert: {
          activa?: boolean
          created_at?: string
          descripcion?: string
          icono?: string
          id?: string
          nombre: string
        }
        Update: {
          activa?: boolean
          created_at?: string
          descripcion?: string
          icono?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      medicos: {
        Row: {
          activo: boolean
          apellido: string
          bio: string
          created_at: string
          especialidad_id: string
          foto_url: string | null
          id: string
          matricula: string
          nombre: string
          precio_consulta: number
        }
        Insert: {
          activo?: boolean
          apellido: string
          bio?: string
          created_at?: string
          especialidad_id: string
          foto_url?: string | null
          id?: string
          matricula?: string
          nombre: string
          precio_consulta?: number
        }
        Update: {
          activo?: boolean
          apellido?: string
          bio?: string
          created_at?: string
          especialidad_id?: string
          foto_url?: string | null
          id?: string
          matricula?: string
          nombre?: string
          precio_consulta?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicos_especialidad_id_fkey"
            columns: ["especialidad_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_clinicas: {
        Row: {
          autor_id: string
          contenido: string
          created_at: string
          id: string
          paciente_id: string
          turno_id: string | null
        }
        Insert: {
          autor_id: string
          contenido: string
          created_at?: string
          id?: string
          paciente_id: string
          turno_id?: string | null
        }
        Update: {
          autor_id?: string
          contenido?: string
          created_at?: string
          id?: string
          paciente_id?: string
          turno_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_clinicas_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          apellido: string
          created_at: string
          dni: string | null
          email: string | null
          fecha_nacimiento: string | null
          id: string
          nombre: string
          obra_social: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          apellido?: string
          created_at?: string
          dni?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          id: string
          nombre?: string
          obra_social?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          apellido?: string
          created_at?: string
          dni?: string | null
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string
          obra_social?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      turnos: {
        Row: {
          created_at: string
          duracion_min: number
          estado: Database["public"]["Enums"]["estado_turno"]
          fecha_hora: string
          id: string
          medico_id: string
          motivo: string
          obra_social: string | null
          paciente_id: string
          recordatorio_enviado: boolean
          token_confirmacion: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duracion_min?: number
          estado?: Database["public"]["Enums"]["estado_turno"]
          fecha_hora: string
          id?: string
          medico_id: string
          motivo?: string
          obra_social?: string | null
          paciente_id: string
          recordatorio_enviado?: boolean
          token_confirmacion?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duracion_min?: number
          estado?: Database["public"]["Enums"]["estado_turno"]
          fecha_hora?: string
          id?: string
          medico_id?: string
          motivo?: string
          obra_social?: string | null
          paciente_id?: string
          recordatorio_enviado?: boolean
          token_confirmacion?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "paciente"
      estado_turno:
        | "solicitado"
        | "confirmado"
        | "cancelado"
        | "atendido"
        | "ausente"
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
      app_role: ["admin", "staff", "paciente"],
      estado_turno: [
        "solicitado",
        "confirmado",
        "cancelado",
        "atendido",
        "ausente",
      ],
    },
  },
} as const
