export interface CreditCard {
    id: string;
    user_id: string | null;
    name: string;
    limit_amount: number;
    current_balance: number | null;
    payment_day: number;
    cutoff_day: number;
    created_at: string;
    updated_at: string;
}