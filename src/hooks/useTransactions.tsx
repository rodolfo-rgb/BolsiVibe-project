import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";
import { Transaction } from "../types/transaction";
import { useAuth } from "../lib/auth";
import { TransactionFormData } from "../types/transaction-types";
import { formatTransactionData, handleError } from "../utils/transaction-utils";

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
            const transactionData = formatTransactionData(data, user.id);
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
            }

            // Update budget expense if it exists
            if (data.budget_expense_id) {
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