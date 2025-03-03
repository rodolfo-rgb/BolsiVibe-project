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
                    balance: number | null
                    created_at: string
                    id: string
                    name: string
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    balance?: number | null
                    created_at?: string
                    id?: string
                    name: string
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    balance?: number | null
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
                    id: string
                    is_paid: boolean | null
                    plan_id: string | null
                    transaction_id: string | null
                    updated_at: string | null
                }
                Insert: {
                    amount: number
                    category: string
                    created_at?: string | null
                    id?: string
                    is_paid?: boolean | null
                    plan_id?: string | null
                    transaction_id?: string | null
                    updated_at?: string | null
                }
                Update: {
                    amount?: number
                    category?: string
                    created_at?: string | null
                    id?: string
                    is_paid?: boolean | null
                    plan_id?: string | null
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
                    created_at: string
                    current_balance: number | null
                    cutoff_day: number
                    id: string
                    limit_amount: number
                    name: string
                    payment_day: number
                    updated_at: string
                    user_id: string | null
                }
                Insert: {
                    created_at?: string
                    current_balance?: number | null
                    cutoff_day: number
                    id?: string
                    limit_amount: number
                    name: string
                    payment_day: number
                    updated_at?: string
                    user_id?: string | null
                }
                Update: {
                    created_at?: string
                    current_balance?: number | null
                    cutoff_day?: number
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
                Args: {
                    p_account_id: string
                    p_amount: number
                }
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
