import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useToast } from "../components/ui/use-toast";
import { SavingsGoal, GoalContribution } from "../types/savings-goal";
import { useAuth } from "../lib/auth";

// Workaround para tablas no definidas en los tipos de Supabase
const supabaseAny = supabase as any;

export const useSavingsGoals = () => {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchGoals();
        } else {
            setGoals([]);
            setLoading(false);
        }
    }, [user]);

    const fetchGoals = async () => {
        try {
            const { data, error } = await supabaseAny
                .from("savings_goals")
                .select("*")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setGoals(data || []);
        } catch (error) {
            console.error("Error fetching savings goals:", error);
            toast({
                title: "Error",
                description: "No se pudieron cargar las metas de ahorro",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const addGoal = async (data: {
        name: string;
        target_amount: number;
        deadline?: string;
        icon: string;
        color: string;
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
            const { data: newGoal, error } = await supabaseAny
                .from("savings_goals")
                .insert([{
                    user_id: user.id,
                    name: data.name,
                    target_amount: data.target_amount,
                    current_amount: 0,
                    deadline: data.deadline || null,
                    icon: data.icon,
                    color: data.color,
                    is_completed: false,
                }])
                .select()
                .single();

            if (error) throw error;

            setGoals((prev) => [newGoal, ...prev]);
            return newGoal;
        } catch (error) {
            console.error("Error adding savings goal:", error);
            throw error;
        }
    };

    const updateGoal = async (id: string, data: Partial<SavingsGoal>) => {
        if (!user) return;

        try {
            const { error } = await supabaseAny
                .from("savings_goals")
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            setGoals((prev) =>
                prev.map((goal) => (goal.id === id ? { ...goal, ...data } : goal))
            );
        } catch (error) {
            console.error("Error updating savings goal:", error);
            throw error;
        }
    };

    const deleteGoal = async (id: string) => {
        if (!user) return;

        try {
            const { error } = await supabaseAny
                .from("savings_goals")
                .delete()
                .eq("id", id)
                .eq("user_id", user.id);

            if (error) throw error;

            setGoals((prev) => prev.filter((goal) => goal.id !== id));
        } catch (error) {
            console.error("Error deleting savings goal:", error);
            throw error;
        }
    };

    const contributeToGoal = async (
        goalId: string,
        amount: number,
        accountId?: string,
        note?: string
    ) => {
        if (!user) return;

        try {
            // Registrar la contribución
            const { error: contribError } = await supabaseAny
                .from("goal_contributions")
                .insert([{
                    goal_id: goalId,
                    amount,
                    account_id: accountId || null,
                    note: note || null,
                }]);

            if (contribError) throw contribError;

            // Actualizar el monto actual de la meta
            const goal = goals.find((g) => g.id === goalId);
            if (!goal) return;

            const newAmount = goal.current_amount + amount;
            const isCompleted = newAmount >= goal.target_amount;

            await supabaseAny
                .from("savings_goals")
                .update({
                    current_amount: newAmount,
                    is_completed: isCompleted,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", goalId)
                .eq("user_id", user.id);

            setGoals((prev) =>
                prev.map((g) =>
                    g.id === goalId
                        ? { ...g, current_amount: newAmount, is_completed: isCompleted }
                        : g
                )
            );

            if (isCompleted) {
                toast({
                    title: "🎉 ¡Meta completada!",
                    description: `¡Felicidades! Has alcanzado tu meta "${goal.name}"`,
                });
            }

            return { success: true, isCompleted };
        } catch (error) {
            console.error("Error contributing to goal:", error);
            throw error;
        }
    };

    const getContributions = async (goalId: string): Promise<GoalContribution[]> => {
        try {
            const { data, error } = await supabaseAny
                .from("goal_contributions")
                .select("*")
                .eq("goal_id", goalId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("Error fetching contributions:", error);
            return [];
        }
    };

    const getActiveGoals = () => goals.filter((g) => !g.is_completed);
    const getCompletedGoals = () => goals.filter((g) => g.is_completed);

    const getTotalProgress = () => {
        if (goals.length === 0) return 0;
        const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
        const totalCurrent = goals.reduce((sum, g) => sum + g.current_amount, 0);
        return totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    };

    return {
        goals,
        loading,
        addGoal,
        updateGoal,
        deleteGoal,
        contributeToGoal,
        getContributions,
        getActiveGoals,
        getCompletedGoals,
        getTotalProgress,
        refreshGoals: fetchGoals,
    };
};
