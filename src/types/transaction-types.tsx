import { TransactionType } from "./transaction";

export type { TransactionType };

export interface TransactionFormData {
    type: TransactionType;
    amount: number;
    description: string;
    date: string;
    account_id?: string;
    destination_account_id?: string;
    credit_card_id?: string;
    budget_expense_id?: string;
}

export interface TransactionError {
    message: string;
    details?: unknown;
}