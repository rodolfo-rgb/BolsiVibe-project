export interface Account {
    id: string;
    user_id: string | null;
    name: string;
    balance: number | null;
    created_at: string;
    updated_at: string;
}