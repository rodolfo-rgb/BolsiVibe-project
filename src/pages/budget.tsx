import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import NewBudgetPlanForm from "../components/budget/NewBudgetPlanForm";
import BudgetPlanReport from "../components/budget/BudgetPlanReport";
import { Card } from "../components/ui/card";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";

const Budget = () => {
    const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
    const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(0);
    const { user } = useAuth();
    const { toast } = useToast();

    const currentPlan = budgetPlans[currentPlanIndex];

    // Cargar planes al iniciar
    useEffect(() => {
        const loadBudgetPlans = async () => {
            if (!user) return;

            const { data: plans, error } = await supabase
                .from('budget_plans')
                .select(`
            *,
            budget_expenses (*)
          `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading budget plans:', error);
                toast({
                    title: "Error",
                    description: "No se pudieron cargar los planes de presupuesto",
                    variant: "destructive",
                });
                return;
            }

            if (plans) {
                const formattedPlans: BudgetPlan[] = plans.map(plan => ({
                    id: plan.id,
                    initialBudget: plan.initial_budget,
                    savingsPercentage: plan.savings_percentage,
                    savingsAmount: plan.savings_amount,
                    spendingAmount: plan.spending_amount,
                    expenses: plan.budget_expenses,
                    remainingAmount: plan.remaining_amount,
                    date: plan.date,
                }));
                setBudgetPlans(formattedPlans);
            }
        };

        loadBudgetPlans();
    }, [user]);

    const handlePlanCreated = (plan: BudgetPlan) => {
        setBudgetPlans([...budgetPlans, plan]);
        setCurrentPlanIndex(budgetPlans.length);
    };

    const handleCopyPreviousPlan = async () => {
        if (!user) return;

        const previousPlan = budgetPlans[currentPlanIndex];
        if (previousPlan) {
            try {
                // Crear nuevo plan en Supabase
                const { data: newPlan, error: planError } = await supabase
                    .from('budget_plans')
                    .insert({
                        user_id: user.id,
                        initial_budget: previousPlan.initialBudget,
                        savings_percentage: previousPlan.savingsPercentage,
                        savings_amount: previousPlan.savingsAmount,
                        spending_amount: previousPlan.spendingAmount,
                        remaining_amount: previousPlan.remainingAmount,
                        date: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (planError) throw planError;

                // Copiar gastos del plan anterior
                const expensesWithNewPlanId = previousPlan.expenses.map(expense => ({
                    plan_id: newPlan.id,
                    category: expense.category,
                    amount: expense.amount,
                    is_paid: false,
                }));

                const { error: expensesError } = await supabase
                    .from('budget_expenses')
                    .insert(expensesWithNewPlanId);

                if (expensesError) throw expensesError;

                // Actualizar estado local
                const newPlanWithExpenses: BudgetPlan = {
                    ...previousPlan,
                    id: newPlan.id,
                    date: newPlan.date,
                    expenses: expensesWithNewPlanId,
                };

                setBudgetPlans([...budgetPlans, newPlanWithExpenses]);
                setCurrentPlanIndex(budgetPlans.length);

                toast({
                    title: "Plan copiado",
                    description: "Se ha creado una copia del plan quincenal",
                });
            } catch (error) {
                console.error('Error copying budget plan:', error);
                toast({
                    title: "Error",
                    description: "No se pudo copiar el plan quincenal",
                    variant: "destructive",
                });
            }
        }
    };

    const handleDeletePlan = async () => {
        if (!currentPlan?.id || !user) return;

        try {
            // Eliminar gastos del plan
            const { error: expensesError } = await supabase
                .from('budget_expenses')
                .delete()
                .eq('plan_id', currentPlan.id);

            if (expensesError) throw expensesError;

            // Eliminar plan
            const { error: planError } = await supabase
                .from('budget_plans')
                .delete()
                .eq('id', currentPlan.id);

            if (planError) throw planError;

            // Actualizar estado local
            const newPlans = budgetPlans.filter((_, index) => index !== currentPlanIndex);
            setBudgetPlans(newPlans);
            setCurrentPlanIndex(Math.max(0, currentPlanIndex - 1));

            toast({
                title: "Plan eliminado",
                description: "El plan quincenal ha sido eliminado",
            });
        } catch (error) {
            console.error('Error deleting budget plan:', error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el plan quincenal",
                variant: "destructive",
            });
        }
    };

    const navigatePlan = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPlanIndex > 0) {
            setCurrentPlanIndex(currentPlanIndex - 1);
        } else if (direction === "next" && currentPlanIndex < budgetPlans.length - 1) {
            setCurrentPlanIndex(currentPlanIndex + 1);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Planificación de Presupuesto</h1>

            {budgetPlans.length === 0 ? (
                <Card className="p-6 mb-6 bg-muted/50">
                    <p className="text-center text-muted-foreground mb-4">
                        No hay planes quincenales creados. Crea tu primer plan para comenzar.
                    </p>
                </Card>
            ) : (
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigatePlan("prev")}
                            disabled={currentPlanIndex === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Plan {currentPlanIndex + 1} de {budgetPlans.length}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigatePlan("next")}
                            disabled={currentPlanIndex === budgetPlans.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleCopyPreviousPlan}
                            className="flex items-center gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            Copiar Plan Actual
                        </Button>
                    </div>
                </div>
            )}

            {!currentPlan ? (
                <div className="text-center">
                    <NewBudgetPlanForm onPlanCreated={handlePlanCreated} />
                </div>
            ) : (
                <BudgetPlanReport
                    plan={currentPlan}
                    onReset={handleDeletePlan}
                />
            )}
        </div>
    );
};

export default Budget;