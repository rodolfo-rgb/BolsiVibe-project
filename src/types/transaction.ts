export type TransactionType = "income" | "expense" | "credit_payment" | "transfer";

export interface Transaction {
    id: string;
    user_id: string | null;
    type: TransactionType;
    amount: number;
    description: string | null;
    date: string;
    account_id: string | null;
    credit_card_id: string | null;
    destination_account_id: string | null;
    // Campos para transacciones con tarjeta de crédito
    statement_cutoff_date: string | null; // Fecha de corte del estado de cuenta
    payment_due_date: string | null; // Fecha límite de pago
    created_at: string;
    updated_at: string;
}