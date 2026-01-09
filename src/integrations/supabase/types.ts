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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number | null
          bank: string | null
          bank_name: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          bank?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          bank?: string | null
          bank_name?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          due_date: string | null
          id: string
          is_paid: boolean | null
          is_recurring: boolean | null
          plan_id: string | null
          recurring_transaction_id: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_paid?: boolean | null
          is_recurring?: boolean | null
          plan_id?: string | null
          recurring_transaction_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_paid?: boolean | null
          is_recurring?: boolean | null
          plan_id?: string | null
          recurring_transaction_id?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_expenses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "budget_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_expenses_recurring_transaction_id_fkey"
            columns: ["recurring_transaction_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_expenses_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_plans: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          initial_budget: number
          remaining_amount: number
          savings_amount: number
          savings_percentage: number
          spending_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          initial_budget: number
          remaining_amount: number
          savings_amount: number
          savings_percentage: number
          spending_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          initial_budget?: number
          remaining_amount?: number
          savings_amount?: number
          savings_percentage?: number
          spending_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          bank: string | null
          bank_name: string | null
          created_at: string
          current_balance: number | null
          cutoff_day: number
          days_until_payment: number | null
          expiration_date: string | null
          id: string
          limit_amount: number
          name: string
          payment_day: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bank?: string | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number | null
          cutoff_day: number
          days_until_payment?: number | null
          expiration_date?: string | null
          id?: string
          limit_amount: number
          name: string
          payment_day: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bank?: string | null
          bank_name?: string | null
          created_at?: string
          current_balance?: number | null
          cutoff_day?: number
          days_until_payment?: number | null
          expiration_date?: string | null
          id?: string
          limit_amount?: number
          name?: string
          payment_day?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          goal_id: string | null
          id: string
          note: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          goal_id?: string | null
          id?: string
          note?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          goal_id?: string | null
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          credit_card_id: string | null
          day_of_month: number | null
          day_of_week: number | null
          description: string
          frequency: string
          id: string
          is_active: boolean | null
          next_execution_date: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          credit_card_id?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description: string
          frequency: string
          id?: string
          is_active?: boolean | null
          next_execution_date: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          credit_card_id?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          next_execution_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_goals: {
        Row: {
          color: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          icon: string | null
          id: string
          is_completed: boolean | null
          name: string
          target_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          target_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          icon?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          target_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          credit_card_id: string | null
          date: string
          description: string | null
          destination_account_id: string | null
          id: string
          payment_due_date: string | null
          statement_cutoff_date: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          credit_card_id?: string | null
          date?: string
          description?: string | null
          destination_account_id?: string | null
          id?: string
          payment_due_date?: string | null
          statement_cutoff_date?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          credit_card_id?: string | null
          date?: string
          description?: string | null
          destination_account_id?: string | null
          id?: string
          payment_due_date?: string | null
          statement_cutoff_date?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_destination_account_id_fkey"
            columns: ["destination_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_account_balance: {
        Args: { p_account_id: string; p_amount: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      transaction_type: "income" | "expense" | "transfer" | "credit_payment"
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
      app_role: ["admin", "user"],
      transaction_type: ["income", "expense", "transfer", "credit_payment"],
    },
  },
} as const
