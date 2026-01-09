import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";
import { RecurringTransaction, FrequencyType } from "../types/recurring-transaction";
import { useAuth } from "../lib/auth";
import { useTransactions } from "./useTransactions";

// Workaround para tablas no definidas en los tipos de Supabase
const supabaseAny = supabase as any;

export const useRecurringTransactions = () => {
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();
    const { addTransaction } = useTransactions();

    useEffect(() => {
        if (user) {
            fetchRecurringTransactions();
            checkAndExecuteRecurringTransactions();
        } else {
            setRecurringTransactions([]);
            setLoading(false);
        }
    }, [user]);

    const fetchRecurringTransactions = async () => {
        try {
            const { data, error } = await supabaseAny
                .from("recurring_transactions")
                .select("*")
                .eq("user_id", user!.id)
                .order("next_execution_date", { ascending: true });

            if (error) throw error;
            setRecurringTransactions(data || []);
        } catch (error) {
            console.error("Error fetching recurring transactions:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las transacciones recurrentes",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateNextExecutionDate = (
        frequency: FrequencyType,
        currentDate: Date,
        dayOfMonth?: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _dayOfWeek?: number
    ): string => {
        const next = new Date(currentDate);
        
        switch (frequency) {
            case "daily":
                next.setDate(next.getDate() + 1);
                break;
            case "weekly":
                next.setDate(next.getDate() + 7);
                break;
            case "biweekly":
                next.setDate(next.getDate() + 14);
                break;
            case "monthly":
                next.setMonth(next.getMonth() + 1);
                if (dayOfMonth) {
                    const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
                    next.setDate(Math.min(dayOfMonth, lastDay));
                }
                break;
            case "yearly":
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        
        return next.toISOString().split("T")[0];
    };

    const checkAndExecuteRecurringTransactions = async () => {
        if (!user) return;

        const today = new Date().toISOString().split("T")[0];
        
        try {
            const { data: dueTransactions, error } = await supabaseAny
                .from("recurring_transactions")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .lte("next_execution_date", today);

            if (error) throw error;

            for (const recurring of dueTransactions || []) {
                // Crear la transacción
                const newTransaction = await addTransaction({
                    type: recurring.type,
                    amount: recurring.amount,
                    description: `[Recurrente] ${recurring.description}`,
                    date: today,
                    account_id: recurring.account_id || undefined,
                    credit_card_id: recurring.credit_card_id || undefined,
                    destination_account_id: recurring.type === "income" ? recurring.account_id || undefined : undefined,
                }) as { id: string } | undefined;

                // Buscar y marcar como pagado el gasto del plan vinculado
                if (newTransaction?.id && recurring.type === "expense") {
                    // Obtener el mes actual para buscar el plan correspondiente
                    const currentMonth = new Date();
                    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

                    // Buscar gastos vinculados a esta transacción recurrente en el plan del mes actual
                    const { data: linkedExpenses, error: expenseError } = await supabaseAny
                        .from("budget_expenses")
                        .select("*, budget_plans!inner(*)")
                        .eq("recurring_transaction_id", recurring.id)
                        .eq("is_paid", false)
                        .gte("budget_plans.date", startOfMonth.toISOString())
                        .lte("budget_plans.date", endOfMonth.toISOString());

                    if (!expenseError && linkedExpenses && linkedExpenses.length > 0) {
                        // Marcar el primer gasto vinculado como pagado
                        const expenseToUpdate = linkedExpenses[0];
                        await supabaseAny
                            .from("budget_expenses")
                            .update({ 
                                is_paid: true,
                                transaction_id: newTransaction.id,
                            })
                            .eq("id", expenseToUpdate.id);
                    }
                }

                // Actualizar la próxima fecha de ejecución
                const nextDate = calculateNextExecutionDate(
                    recurring.frequency,
                    new Date(recurring.next_execution_date),
                    recurring.day_of_month || undefined,
                    recurring.day_of_week || undefined
                );

                await supabaseAny
                    .from("recurring_transactions")
                    .update({ 
                        next_execution_date: nextDate,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", recurring.id);
            }

            if (dueTransactions && dueTransactions.length > 0) {
                fetchRecurringTransactions();
                toast({
                    title: "Transacciones ejecutadas",
                    description: `Se ejecutaron ${dueTransactions.length} transacciones recurrentes`,
                });
            }
        } catch (error) {
            console.error("Error executing recurring transactions:", error);
        }
    };

    const addRecurringTransaction = async (data: {
        type: "income" | "expense";
        amount: number;
        description: string;
        frequency: FrequencyType;
        day_of_month?: number;
        day_of_week?: number;
        start_date: string;
        account_id?: string;
        credit_card_id?: string;
    }) => {
        if (!user) {
            toast({
                title: "Error",
                description: "Debes iniciar sesión para realizar esta acción",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data: newRecurring, error } = await supabaseAny
                .from("recurring_transactions")
                .insert([{
                    user_id: user.id,
                    type: data.type,
                    amount: data.amount,
                    description: data.description,
                    frequency: data.frequency,
                    day_of_month: data.day_of_month,
                    day_of_week: data.day_of_week,
                    next_execution_date: data.start_date,
                    account_id: data.account_id || null,
                    credit_card_id: data.credit_card_id || null,
                    is_active: true,
                }])
                .select()
                .single();

            if (error) throw error;

            setRecurringTransactions((prev) => [...prev, newRecurring]);
            return newRecurring;
        } catch (error) {
            console.error("Error adding recurring transaction:", error);
            throw error;
        }
    };

    const toggleRecurringTransaction = async (id: string, isActive: boolean) => {
        if (!user) return;

        try {
            const { error } = await supabaseAny
                .from("recurring_transactions")
                .update({ 
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            setRecurringTransactions((prev) =>
                prev.map((rt) => (rt.id === id ? { ...rt, is_active: isActive } : rt))
            );
        } catch (error) {
            console.error("Error toggling recurring transaction:", error);
            throw error;
        }
    };

    const deleteRecurringTransaction = async (id: string) => {
        if (!user) return;

        try {
            const { error } = await supabaseAny
                .from("recurring_transactions")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            setRecurringTransactions((prev) => prev.filter((rt) => rt.id !== id));
        } catch (error) {
            console.error("Error deleting recurring transaction:", error);
            throw error;
        }
    };

    const getUpcomingTransactions = (days: number = 7) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return recurringTransactions
            .filter((rt) => rt.is_active)
            .filter((rt) => {
                const nextDate = new Date(rt.next_execution_date);
                return nextDate >= today && nextDate <= futureDate;
            })
            .sort((a, b) => 
                new Date(a.next_execution_date).getTime() - new Date(b.next_execution_date).getTime()
            );
    };

    return {
        recurringTransactions,
        loading,
        addRecurringTransaction,
        toggleRecurringTransaction,
        deleteRecurringTransaction,
        getUpcomingTransactions,
        refreshRecurringTransactions: fetchRecurringTransactions,
    };
};
