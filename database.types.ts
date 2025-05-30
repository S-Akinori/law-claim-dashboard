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
      account_options: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          image_url: string | null
          master_option_id: string
          text: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          master_option_id: string
          text?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          master_option_id?: string
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_account_options_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_account_options_master"
            columns: ["master_option_id"]
            isOneToOne: false
            referencedRelation: "master_options"
            referencedColumns: ["id"]
          },
        ]
      }
      account_questions: {
        Row: {
          account_id: string
          created_at: string | null
          hidden: boolean
          id: string
          master_question_id: string
          text: string | null
          title: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          hidden?: boolean
          id?: string
          master_question_id: string
          text?: string | null
          title?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          hidden?: boolean
          id?: string
          master_question_id?: string
          text?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_account_questions_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_account_questions_master"
            columns: ["master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          created_at: string | null
          email: string | null
          email_answer_question_id: string | null
          final_email_template_id: string | null
          final_question_id: string | null
          first_question_id: string | null
          hours: string | null
          id: string
          line_channel_access_token: string
          line_channel_id: string
          line_channel_secret: string
          name: string
          sheet_id: string | null
          sub_emails: Json | null
          tel: string | null
          use_master: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_answer_question_id?: string | null
          final_email_template_id?: string | null
          final_question_id?: string | null
          first_question_id?: string | null
          hours?: string | null
          id?: string
          line_channel_access_token: string
          line_channel_id: string
          line_channel_secret: string
          name: string
          sheet_id?: string | null
          sub_emails?: Json | null
          tel?: string | null
          use_master?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_answer_question_id?: string | null
          final_email_template_id?: string | null
          final_question_id?: string | null
          first_question_id?: string | null
          hours?: string | null
          id?: string
          line_channel_access_token?: string
          line_channel_id?: string
          line_channel_secret?: string
          name?: string
          sheet_id?: string | null
          sub_emails?: Json | null
          tel?: string | null
          use_master?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_email_answer_question_id_fkey"
            columns: ["email_answer_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_final_email_template_id_fkey"
            columns: ["final_email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_final_question_id_fkey"
            columns: ["final_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_first_question_id_fkey"
            columns: ["first_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      actions: {
        Row: {
          account_id: string
          created_at: string | null
          email_template_id: string | null
          id: string
          next_question_id: string | null
          type: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          email_template_id?: string | null
          id?: string
          next_question_id?: string | null
          type: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          email_template_id?: string | null
          id?: string
          next_question_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_account"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_email_template"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_next_account_question"
            columns: ["next_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      auto_limit_amounts: {
        Row: {
          amount: number
          created_at: string | null
          grade: number
          id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          grade: number
          id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          grade?: number
          id?: string
        }
        Relationships: []
      }
      compensation_input_mapping: {
        Row: {
          compensation_table_id: string
          created_at: string | null
          id: string
          kind: string
          question_id: string
        }
        Insert: {
          compensation_table_id: string
          created_at?: string | null
          id?: string
          kind: string
          question_id: string
        }
        Update: {
          compensation_table_id?: string
          created_at?: string | null
          id?: string
          kind?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compensation_input_mapping_compensation_table_id_fkey"
            columns: ["compensation_table_id"]
            isOneToOne: false
            referencedRelation: "compensation_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensation_input_mapping_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      compensation_tables: {
        Row: {
          account_id: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          table_name: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          table_name: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "compensation_tables_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
      death_compensation: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      disability_compensation: {
        Row: {
          amount_auto: number
          amount_lawyer: number
          created_at: string | null
          grade: number
          id: string
        }
        Insert: {
          amount_auto: number
          amount_lawyer: number
          created_at?: string | null
          grade: number
          id?: string
        }
        Update: {
          amount_auto?: number
          amount_lawyer?: number
          created_at?: string | null
          grade?: number
          id?: string
        }
        Relationships: []
      }
      disability_loss_table: {
        Row: {
          disability_grade: number
          id: number
          work_loss_percent: number
        }
        Insert: {
          disability_grade: number
          id?: number
          work_loss_percent: number
        }
        Update: {
          disability_grade?: number
          id?: number
          work_loss_percent?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          account_id: string
          body: string
          created_at: string | null
          id: string
          subject: string
        }
        Insert: {
          account_id: string
          body: string
          created_at?: string | null
          id?: string
          subject: string
        }
        Update: {
          account_id?: string
          body?: string
          created_at?: string | null
          id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
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
          master_option_id: string | null
          url: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          master_option_id?: string | null
          url: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          master_option_id?: string | null
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
          {
            foreignKeyName: "images_master_option_id_fkey"
            columns: ["master_option_id"]
            isOneToOne: false
            referencedRelation: "master_options"
            referencedColumns: ["id"]
          },
        ]
      }
      life_expectancy_coefficients: {
        Row: {
          age: number
          coefficient: number
          created_at: string | null
          id: string
        }
        Insert: {
          age: number
          coefficient: number
          created_at?: string | null
          id?: string
        }
        Update: {
          age?: number
          coefficient?: number
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      line_users: {
        Row: {
          account_id: string
          created_at: string | null
          current_question_id: string | null
          id: string
          is_answer_complete: boolean | null
          is_email_sent: boolean
          line_id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          current_question_id?: string | null
          id?: string
          is_answer_complete?: boolean | null
          is_email_sent?: boolean
          line_id: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          current_question_id?: string | null
          id?: string
          is_answer_complete?: boolean | null
          is_email_sent?: boolean
          line_id?: string
          name?: string | null
          updated_at?: string | null
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
      master_actions: {
        Row: {
          created_at: string | null
          id: string
          master_email_template_id: string | null
          next_master_question_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          master_email_template_id?: string | null
          next_master_question_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          master_email_template_id?: string | null
          next_master_question_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_master_question"
            columns: ["next_master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_actions_master_email_template_id_fkey"
            columns: ["master_email_template_id"]
            isOneToOne: false
            referencedRelation: "master_email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      master_conditions: {
        Row: {
          condition_group: string
          created_at: string | null
          id: string
          master_question_id: string
          operator: string
          required_master_option_id: string | null
          required_master_question_id: string
          value: string | null
        }
        Insert: {
          condition_group: string
          created_at?: string | null
          id?: string
          master_question_id: string
          operator: string
          required_master_option_id?: string | null
          required_master_question_id: string
          value?: string | null
        }
        Update: {
          condition_group?: string
          created_at?: string | null
          id?: string
          master_question_id?: string
          operator?: string
          required_master_option_id?: string | null
          required_master_question_id?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_conditions_master_question_id_fkey"
            columns: ["master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_conditions_required_master_option_id_fkey"
            columns: ["required_master_option_id"]
            isOneToOne: false
            referencedRelation: "master_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_conditions_required_master_question_id_fkey"
            columns: ["required_master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      master_email_templates: {
        Row: {
          body: string
          created_at: string | null
          id: string
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          subject?: string
        }
        Relationships: []
      }
      master_options: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          master_question_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          master_question_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          master_question_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_options_master_question_id_fkey"
            columns: ["master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      master_question_routes: {
        Row: {
          condition_group: string
          created_at: string | null
          from_master_question_id: string
          id: string
          next_master_question_id: string
        }
        Insert: {
          condition_group: string
          created_at?: string | null
          from_master_question_id: string
          id?: string
          next_master_question_id: string
        }
        Update: {
          condition_group?: string
          created_at?: string | null
          from_master_question_id?: string
          id?: string
          next_master_question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_question_routes_from_master_question_id_fkey"
            columns: ["from_master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_question_routes_next_master_question_id_fkey"
            columns: ["next_master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      master_questions: {
        Row: {
          created_at: string | null
          id: string
          key: string | null
          text: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key?: string | null
          text: string
          title?: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string | null
          text?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      master_scheduled_messages: {
        Row: {
          created_at: string | null
          day_offset: number
          hour: number
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          day_offset: number
          hour: number
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          day_offset?: number
          hour?: number
          id?: string
          message?: string
        }
        Relationships: []
      }
      master_start_triggers: {
        Row: {
          created_at: string | null
          id: string
          keyword: string
          master_question_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keyword: string
          master_question_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keyword?: string
          master_question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_start_triggers_master_question_id_fkey"
            columns: ["master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      master_validations: {
        Row: {
          id: string
          master_question_id: string
          message: string
          type: string
          value: string | null
        }
        Insert: {
          id?: string
          master_question_id: string
          message?: string
          type: string
          value?: string | null
        }
        Update: {
          id?: string
          master_question_id?: string
          message?: string
          type?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "master_validations_master_question_id_fkey"
            columns: ["master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      minor_injury_compensation: {
        Row: {
          amount: number
          hospitalization_months: number
          id: string
          outpatient_months: number
        }
        Insert: {
          amount: number
          hospitalization_months: number
          id?: string
          outpatient_months: number
        }
        Update: {
          amount?: number
          hospitalization_months?: number
          id?: string
          outpatient_months?: number
        }
        Relationships: []
      }
      option_images: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          image_id: string
          master_option_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          image_id: string
          master_option_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          image_id?: string
          master_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "option_images_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_images_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "option_images_master_option_id_fkey"
            columns: ["master_option_id"]
            isOneToOne: false
            referencedRelation: "master_options"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          question_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          question_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          question_id?: string
          text?: string
        }
        Relationships: [
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
          key: string | null
          text: string
          title: string
          type: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          key?: string | null
          text: string
          title?: string
          type: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          key?: string | null
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
        ]
      }
      scheduled_message_logs: {
        Row: {
          account_id: string
          id: string
          line_user_id: string
          scheduled_message_id: string
          sent_at: string | null
          success: boolean | null
        }
        Insert: {
          account_id: string
          id?: string
          line_user_id: string
          scheduled_message_id: string
          sent_at?: string | null
          success?: boolean | null
        }
        Update: {
          account_id?: string
          id?: string
          line_user_id?: string
          scheduled_message_id?: string
          sent_at?: string | null
          success?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_message_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_message_logs_line_user_id_fkey"
            columns: ["line_user_id"]
            isOneToOne: false
            referencedRelation: "line_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_message_logs_scheduled_message_id_fkey"
            columns: ["scheduled_message_id"]
            isOneToOne: false
            referencedRelation: "master_scheduled_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          account_id: string
          created_at: string | null
          day_offset: number
          hour: number
          id: string
          message: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          day_offset: number
          hour: number
          id?: string
          message: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          day_offset?: number
          hour?: number
          id?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_messages_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      severe_injury_compensation: {
        Row: {
          amount: number
          created_at: string | null
          hospitalization_months: number
          id: string
          outpatient_months: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          hospitalization_months: number
          id?: string
          outpatient_months: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          hospitalization_months?: number
          id?: string
          outpatient_months?: number
        }
        Relationships: []
      }
      start_triggers: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          keyword: string
          question_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          keyword: string
          question_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          keyword?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "start_triggers_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "start_triggers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_responses: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          master_option_id: string | null
          master_question_id: string | null
          option_id: string | null
          question_id: string | null
          response: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          master_option_id?: string | null
          master_question_id?: string | null
          option_id?: string | null
          question_id?: string | null
          response?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          master_option_id?: string | null
          master_question_id?: string | null
          option_id?: string | null
          question_id?: string | null
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
            foreignKeyName: "user_responses_master_option_id_fkey"
            columns: ["master_option_id"]
            isOneToOne: false
            referencedRelation: "master_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_responses_master_question_id_fkey"
            columns: ["master_question_id"]
            isOneToOne: false
            referencedRelation: "master_questions"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
