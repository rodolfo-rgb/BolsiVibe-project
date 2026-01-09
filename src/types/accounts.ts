import { BankType } from './creditCard';

export interface Account {
    id: string;
    user_id: string | null;
    name: string;
    balance: number | null;
    bank?: BankType;
    bank_name?: string;
    created_at: string;
    updated_at: string;
}