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
      accounts: {
        Row: {
          created_at: string | null
          id: string
          line_channel_access_token: string
          line_channel_id: string
          line_channel_secret: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          line_channel_access_token: string
          line_channel_id: string
          line_channel_secret: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          line_channel_access_token?: string
          line_channel_id?: string
          line_channel_secret?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          account_id: string
          condition_group: string
          created_at: string | null
          id: string
          operator: string
          question_id: string
          required_option_id: string | null
          required_question_id: string
          value: string | null
        }
        Insert: {
          account_id: string
          condition_group: string
          created_at?: string | null
          id?: string
          operator: string
          question_id: string
          required_option_id?: string | null
          required_question_id: string
          value?: string | null
        }
        Update: {
          account_id?: string
          condition_group?: string
          created_at?: string | null
          id?: string
          operator?: string
          question_id?: string
          required_option_id?: string | null
          required_question_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conditions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_required_option_id_fkey"
            columns: ["required_option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conditions_required_question_id_fkey"
            columns: ["required_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          account_id: string
          created_at: string | null
          description: string | null
          id: string
          url: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          url: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      line_users: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id: string
          name?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "line_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string | null
          id: string
          image_id: string | null
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_id?: string | null
          question_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_id?: string | null
          question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_routes: {
        Row: {
          account_id: string
          condition_group: string
          created_at: string | null
          from_question_id: string
          id: string
          next_question_id: string
        }
        Insert: {
          account_id: string
          condition_group: string
          created_at?: string | null
          from_question_id: string
          id?: string
          next_question_id: string
        }
        Update: {
          account_id?: string
          condition_group?: string
          created_at?: string | null
          from_question_id?: string
          id?: string
          next_question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_routes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_routes_from_question_id_fkey"
            columns: ["from_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_routes_next_question_id_fkey"
            columns: ["next_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          image_id: string | null
          text: string
          title: string
          type: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          image_id?: string | null
          text: string
          title?: string
          type: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          image_id?: string | null
          text?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      user_responses: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          option_id: string | null
          question_id: string
          response: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          option_id?: string | null
          question_id: string
          response?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          option_id?: string | null
          question_id?: string
          response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_responses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_responses_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
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
