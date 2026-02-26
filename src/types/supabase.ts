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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          name: string
          phone: string
          email: string | null
          address: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          phone: string
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string
          order_id: string
          paid_amount: number
          status: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          order_id: string
          paid_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          order_id?: string
          paid_amount?: number
          status?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          chest: string | null
          client_name: string
          created_at: string | null
          hip: string | null
          id: string
          notes: string | null
          phone: string
          shoulder: string | null
          sleeve_length: string | null
          top_length: string | null
          unit: string | null
          waist: string | null
          measurement_number: string | null
        }
        Insert: {
          chest?: string | null
          client_name: string
          created_at?: string | null
          hip?: string | null
          id?: string
          notes?: string | null
          phone: string
          shoulder?: string | null
          sleeve_length?: string | null
          top_length?: string | null
          unit?: string | null
          waist?: string | null
          measurement_number?: string | null
        }
        Update: {
          chest?: string | null
          client_name?: string
          created_at?: string | null
          hip?: string | null
          id?: string
          notes?: string | null
          phone?: string
          shoulder?: string | null
          sleeve_length?: string | null
          top_length?: string | null
          unit?: string | null
          waist?: string | null
          measurement_number?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          assigned_tailor_id: string | null
          client_name: string
          created_at: string | null
          delivery_date: string
          garment_type: string
          id: string
          location: string | null
          measurement_id: string | null
          notes: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          assigned_tailor_id?: string | null
          client_name: string
          created_at?: string | null
          delivery_date: string
          garment_type: string
          id?: string
          location?: string | null
          measurement_id?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          assigned_tailor_id?: string | null
          client_name?: string
          created_at?: string | null
          delivery_date?: string
          garment_type?: string
          id?: string
          location?: string | null
          measurement_id?: string | null
          notes?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_tailor_id_fkey"
            columns: ["assigned_tailor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_measurement_id_fkey"
            columns: ["measurement_id"]
            isOneToOne: false
            referencedRelation: "measurements"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          location: string | null
          name: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          location?: string | null
          name: string
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          role?: string
        }
        Relationships: []
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
