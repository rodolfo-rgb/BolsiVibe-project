import { TransactionFormData } from "../types/transaction-types";
import { type ToastProps } from "../components/ui/toast";

export const formatTransactionData = (data: TransactionFormData, userId: string) => {
    return {
        type: data.type,
        amount: data.amount,
        description: data.description,
        date: data.date,
        user_id: userId,
        account_id: data.account_id || null,
        destination_account_id: data.destination_account_id || null,
        credit_card_id: data.credit_card_id || null,
    };
};

export const handleError = (error: Error, toast: (props: ToastProps) => void, message: string) => {
    console.error(message, error);
    toast({
        variant: "destructive",
        title: "Error",
        children: message,
    });
    throw error;
};