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
      booking_event_log: {
        Row: {
          calendar_id: string | null
          contact_id: string | null
          created_at: string
          error: string | null
          event_type: string
          id: string
          lead_capture_id: string | null
          location: string | null
          meta: Json | null
          page_url: string | null
          slot_iso: string | null
          source: string | null
        }
        Insert: {
          calendar_id?: string | null
          contact_id?: string | null
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          lead_capture_id?: string | null
          location?: string | null
          meta?: Json | null
          page_url?: string | null
          slot_iso?: string | null
          source?: string | null
        }
        Update: {
          calendar_id?: string | null
          contact_id?: string | null
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          lead_capture_id?: string | null
          location?: string | null
          meta?: Json | null
          page_url?: string | null
          slot_iso?: string | null
          source?: string | null
        }
        Relationships: []
      }
      env_change_log: {
        Row: {
          changed_at: string
          from_env: string | null
          id: string
          to_env: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string
          from_env?: string | null
          id?: string
          to_env: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string
          from_env?: string | null
          id?: string
          to_env?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ghl_free_slots: {
        Row: {
          calendar_id: string
          fetched_at: string
          location: string
          slot_end: string
          slot_start: string
        }
        Insert: {
          calendar_id: string
          fetched_at?: string
          location: string
          slot_end: string
          slot_start: string
        }
        Update: {
          calendar_id?: string
          fetched_at?: string
          location?: string
          slot_end?: string
          slot_start?: string
        }
        Relationships: []
      }
      ghl_sync_runs: {
        Row: {
          error: string | null
          finished_at: string | null
          id: string
          slot_count: number | null
          started_at: string
          status: string
        }
        Insert: {
          error?: string | null
          finished_at?: string | null
          id?: string
          slot_count?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          error?: string | null
          finished_at?: string | null
          id?: string
          slot_count?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      lead_captures: {
        Row: {
          attribution: Json | null
          created_at: string
          crm_contact_id: string | null
          crm_error: string | null
          crm_status: string
          email: string | null
          id: string
          location: string | null
          name: string | null
          page_url: string | null
          phone: string | null
          service: string | null
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          attribution?: Json | null
          created_at?: string
          crm_contact_id?: string | null
          crm_error?: string | null
          crm_status?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string | null
          page_url?: string | null
          phone?: string | null
          service?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          attribution?: Json | null
          created_at?: string
          crm_contact_id?: string | null
          crm_error?: string | null
          crm_status?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string | null
          page_url?: string | null
          phone?: string | null
          service?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_is_admin: { Args: never; Returns: boolean }
      is_admin_email: { Args: { _email: string }; Returns: boolean }
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
