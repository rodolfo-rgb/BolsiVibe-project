import { TransactionFormData } from "../types/transaction-types";
import { type ToastProps } from "../components/ui/toast";
import { CreditCard } from "../types/creditCard";
import { addDays, addMonths, setDate, startOfDay } from "date-fns";

/**
 * Calcula la fecha de corte del estado de cuenta al que pertenece una transacción
 * basándose en la fecha de la transacción y el día de corte de la tarjeta.
 * 
 * Si la transacción es antes o en el día de corte del mes actual, pertenece a ese corte.
 * Si es después del día de corte, pertenece al corte del siguiente mes.
 */
export const calculateStatementCutoffDate = (transactionDate: Date, cutoffDay: number): Date => {
    const txDate = startOfDay(new Date(transactionDate));
    const currentMonth = txDate.getMonth();
    const currentYear = txDate.getFullYear();
    
    // Crear fecha de corte del mes actual
    let cutoffDate = new Date(currentYear, currentMonth, cutoffDay);
    
    // Si el día de corte no existe en el mes (ej: 31 en febrero), usar el último día
    if (cutoffDate.getMonth() !== currentMonth) {
        cutoffDate = new Date(currentYear, currentMonth + 1, 0); // Último día del mes
    }
    
    // Si la transacción es después del día de corte, pertenece al siguiente período
    if (txDate.getDate() > cutoffDay) {
        cutoffDate = addMonths(cutoffDate, 1);
        // Ajustar si el día de corte no existe en el siguiente mes
        const nextMonth = cutoffDate.getMonth();
        if (cutoffDate.getDate() !== cutoffDay) {
            cutoffDate = new Date(cutoffDate.getFullYear(), nextMonth + 1, 0);
        }
    }
    
    return startOfDay(cutoffDate);
};

/**
 * Calcula la fecha límite de pago basándose en la fecha de corte
 * y los días que el banco otorga para pagar.
 */
export const calculatePaymentDueDate = (cutoffDate: Date, daysUntilPayment: number): Date => {
    return startOfDay(addDays(new Date(cutoffDate), daysUntilPayment));
};

/**
 * Obtiene las fechas de corte y pago para una transacción con tarjeta de crédito
 */
export const getCreditCardTransactionDates = (
    transactionDate: string,
    creditCard: CreditCard
): { statement_cutoff_date: string; payment_due_date: string } => {
    const txDate = new Date(transactionDate);
    const cutoffDate = calculateStatementCutoffDate(txDate, creditCard.cutoff_day);
    const paymentDueDate = calculatePaymentDueDate(cutoffDate, creditCard.days_until_payment || 20);
    
    return {
        statement_cutoff_date: cutoffDate.toISOString(),
        payment_due_date: paymentDueDate.toISOString(),
    };
};

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