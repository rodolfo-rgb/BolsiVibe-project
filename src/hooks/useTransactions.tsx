import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";
import { Transaction } from "../types/transaction";
import { useAuth } from "../lib/auth";
import { TransactionFormData } from "../types/transaction-types";
import { formatTransactionData, handleError, getCreditCardTransactionDates } from "../utils/transaction-utils";
import { CreditCard } from "../types/creditCard";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchTransactions = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from("transactions")
                .select("*")
                .eq('user_id', user.id)
                .order("date", { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            handleError(error as Error, toast, "No se pudieron cargar las transacciones");
        } finally {
            setLoading(false);
        }
    };

    const updateAccountBalance = async (accountId: string, amount: number) => {
        const { error } = await supabase.rpc(
            'update_account_balance',
            {
                p_account_id: accountId,
                p_amount: amount
            }
        );

        if (error) {
            console.error("Error al actualizar el saldo de la cuenta:", error);
            throw error;
        }
    };

    const updateCreditCardBalance = async (creditCardId: string, amount: number) => {
        // Get current balance
        const { data: card, error: fetchError } = await supabase
            .from("credit_cards")
            .select("current_balance")
            .eq("id", creditCardId)
            .single();

        if (fetchError) {
            console.error("Error al obtener el saldo de la tarjeta:", fetchError);
            throw fetchError;
        }

        const currentBalance = card?.current_balance ?? 0;
        const newBalance = currentBalance + amount;

        const { error: updateError } = await supabase
            .from("credit_cards")
            .update({ current_balance: newBalance, updated_at: new Date().toISOString() })
            .eq("id", creditCardId);

        if (updateError) {
            console.error("Error al actualizar el saldo de la tarjeta:", updateError);
            throw updateError;
        }
    };

    const addTransaction = async (data: TransactionFormData) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            let transactionData = formatTransactionData(data, user.id);
            
            // Si es una transacción con tarjeta de crédito, calcular fechas de corte y pago
            if (data.credit_card_id && data.type === "expense") {
                // Obtener información de la tarjeta para calcular las fechas
                const { data: creditCard, error: cardError } = await supabase
                    .from("credit_cards")
                    .select("*")
                    .eq("id", data.credit_card_id)
                    .single();
                
                if (cardError) {
                    console.error("Error al obtener la tarjeta:", cardError);
                    throw cardError;
                }
                
                // Calcular y agregar fechas de corte y pago
                const cardDates = getCreditCardTransactionDates(data.date, creditCard as CreditCard);
                transactionData = {
                    ...transactionData,
                    ...cardDates,
                };
            }
            
            console.log("Datos de transacción formateados:", transactionData);

            const { data: newTransaction, error: transactionError } = await supabase
                .from("transactions")
                .insert([transactionData])
                .select()
                .single();

            if (transactionError) {
                console.error("Error al insertar transacción:", transactionError);
                throw transactionError;
            }

            if (data.type === "income" && data.destination_account_id) {
                await updateAccountBalance(data.destination_account_id, data.amount);
            } else if (data.type === "expense" && data.account_id) {
                await updateAccountBalance(data.account_id, -data.amount);
            } else if (data.type === "expense" && data.credit_card_id) {
                // Update credit card balance (increase debt)
                await updateCreditCardBalance(data.credit_card_id, data.amount);
            } else if (data.type === "credit_payment" && data.credit_card_id && data.account_id) {
                // Update credit card balance (decrease debt)
                await updateCreditCardBalance(data.credit_card_id, -data.amount);
                // Deduct payment amount from the account
                await updateAccountBalance(data.account_id, -data.amount);
            }

            // Update budget expense if it exists
            console.log("budget_expense_id recibido:", data.budget_expense_id);
            if (data.budget_expense_id) {
                console.log("Actualizando gasto del presupuesto:", data.budget_expense_id);
                const { error: updateError } = await supabase
                    .from('budget_expenses')
                    .update({
                        is_paid: true,
                        transaction_id: newTransaction.id
                    })
                    .eq('id', data.budget_expense_id);

                if (updateError) {
                    console.error("Error al actualizar el gasto del presupuesto:", updateError);
                    throw updateError;
                }
                console.log("Gasto del presupuesto actualizado exitosamente");
            }

            setTransactions((prev) => [newTransaction as Transaction, ...prev]);

            toast({
                title: "Transacción exitosa",
                description: "La transacción se ha registrado y los saldos se han actualizado.",
            });

            return newTransaction;
        } catch (error) {
            handleError(error as Error, toast, "No se pudo crear la transacción");
        }
    };

    const deleteTransaction = async (transaction: Transaction) => {
        if (!user) {
            toast({
                title: "Error",
                children: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            // Update budget expense if it exists
            const { data: budgetExpense } = await supabase
                .from('budget_expenses')
                .select('id')
                .eq('transaction_id', transaction.id)
                .single();

            if (budgetExpense) {
                const { error: updateError } = await supabase
                    .from('budget_expenses')
                    .update({
                        is_paid: false,
                        transaction_id: null
                    })
                    .eq('id', budgetExpense.id);

                if (updateError) throw updateError;
            }

            // Delete the transaction
            const { error: deleteError } = await supabase
                .from("transactions")
                .delete()
                .eq("id", transaction.id)
                .eq("user_id", user.id);

            if (deleteError) throw deleteError;

            // Update account balance based on transaction type
            if (transaction.type === "income" && transaction.destination_account_id) {
                await updateAccountBalance(transaction.destination_account_id, -transaction.amount);
            } else if (transaction.type === "expense" && transaction.account_id) {
                await updateAccountBalance(transaction.account_id, transaction.amount);
            } else if (transaction.type === "expense" && transaction.credit_card_id) {
                // Reverse credit card balance (decrease debt)
                await updateCreditCardBalance(transaction.credit_card_id, -transaction.amount);
            } else if (transaction.type === "credit_payment" && transaction.credit_card_id) {
                // Reverse credit card payment (increase debt back)
                await updateCreditCardBalance(transaction.credit_card_id, transaction.amount);
                // Reverse account deduction (add money back)
                if (transaction.account_id) {
                    await updateAccountBalance(transaction.account_id, transaction.amount);
                }
            }

            setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));

            toast({
                title: "Transacción eliminada",
                children: "La transacción se ha eliminado y los saldos se han actualizado.",
            });
        } catch (error) {
            handleError(error as Error, toast, "No se pudo eliminar la transacción");
        }
    };

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    return {
        transactions,
        loading,
        addTransaction,
        deleteTransaction,
    };
};