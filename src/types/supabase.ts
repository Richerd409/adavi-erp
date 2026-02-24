export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          role: 'admin' | 'manager' | 'tailor'
          created_at: string
          email: string | null
        }
        Insert: {
          id: string
          name: string
          role: 'admin' | 'manager' | 'tailor'
          created_at?: string
          email?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: 'admin' | 'manager' | 'tailor'
          created_at?: string
          email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          client_name: string
          phone: string | null
          garment_type: string
          delivery_date: string
          status: 'New' | 'In Progress' | 'Trial' | 'Alteration' | 'Completed' | 'Delivered'
          assigned_tailor_id: string | null
          measurement_id: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          phone?: string | null
          garment_type: string
          delivery_date: string
          status?: 'New' | 'In Progress' | 'Trial' | 'Alteration' | 'Completed' | 'Delivered'
          assigned_tailor_id?: string | null
          measurement_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          phone?: string | null
          garment_type?: string
          delivery_date?: string
          status?: 'New' | 'In Progress' | 'Trial' | 'Alteration' | 'Completed' | 'Delivered'
          assigned_tailor_id?: string | null
          measurement_id?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_tailor_id_fkey"
            columns: ["assigned_tailor_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_measurement_id_fkey"
            columns: ["measurement_id"]
            referencedRelation: "measurements"
            referencedColumns: ["id"]
          }
        ]
      }
      measurements: {
        Row: {
          id: string
          client_name: string
          phone: string
          chest: string | null
          waist: string | null
          hip: string | null
          shoulder: string | null
          sleeve_length: string | null
          top_length: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          phone: string
          chest?: string | null
          waist?: string | null
          hip?: string | null
          shoulder?: string | null
          sleeve_length?: string | null
          top_length?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          phone?: string
          chest?: string | null
          waist?: string | null
          hip?: string | null
          shoulder?: string | null
          sleeve_length?: string | null
          top_length?: string | null
          notes?: string | null
          created_at?: string
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
