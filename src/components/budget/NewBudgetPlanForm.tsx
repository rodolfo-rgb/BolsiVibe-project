import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import ExpensesSelection from "./ExpensesSelection";
import { supabase } from "../../integrations/supabase/client";
import { useAuth } from "../../lib/auth";
import { addMonths, startOfMonth, format, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";

interface NewBudgetPlanFormProps {
    onPlanCreated: (plan: BudgetPlan) => void;
    existingPlans?: BudgetPlan[];
}

const NewBudgetPlanForm = ({ onPlanCreated, existingPlans = [] }: NewBudgetPlanFormProps) => {
    const { toast } = useToast();
    const { user } = useAuth();
    const [step, setStep] = useState<"initial" | "expenses">("initial");
    const [initialBudget, setInitialBudget] = useState("");
    const [savingsPercentage, setSavingsPercentage] = useState("");

    // Calcular el siguiente mes disponible
    const nextAvailableMonth = useMemo(() => {
        const today = new Date();
        let candidateMonth = startOfMonth(today);
        
        // Buscar el siguiente mes que no tenga plan
        while (true) {
            const hasPlaneForMonth = existingPlans.some(plan => {
                const planDate = new Date(plan.date);
                return isSameMonth(planDate, candidateMonth);
            });
            
            if (!hasPlaneForMonth) {
                return candidateMonth;
            }
            
            candidateMonth = addMonths(candidateMonth, 1);
            
            // Límite de seguridad: máximo 24 meses hacia adelante
            if (candidateMonth > addMonths(today, 24)) {
                return startOfMonth(today);
            }
        }
    }, [existingPlans]);

    const formattedMonth = format(nextAvailableMonth, "MMMM yyyy", { locale: es });

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialBudget || !savingsPercentage) {
            toast({
                title: "Error",
                description: "Por favor completa todos los campos",
                variant: "destructive",
            });
            return;
        }

        const percentage = parseFloat(savingsPercentage);

        if (percentage < 0 || percentage > 100) {
            toast({
                title: "Error",
                description: "El porcentaje debe estar entre 0 y 100",
                variant: "destructive",
            });
            return;
        }

        setStep("expenses");
    };

    const handleExpensesSubmit = async (expenses: BudgetExpense[]) => {
        if (!user) return;

        const budget = parseFloat(initialBudget);
        const percentage = parseFloat(savingsPercentage);
        const savingsAmount = (budget * percentage) / 100;
        const spendingAmount = budget - savingsAmount;

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        if (totalExpenses > spendingAmount) {
            toast({
                title: "Error",
                description: "Los gastos superan el monto disponible para gastar",
                variant: "destructive",
            });
            return;
        }

        try {
            // Insert budget plan con el mes calculado
            const { data: planData, error: planError } = await supabase
                .from('budget_plans')
                .insert({
                    user_id: user.id,
                    initial_budget: budget,
                    savings_percentage: percentage,
                    savings_amount: savingsAmount,
                    spending_amount: spendingAmount,
                    remaining_amount: spendingAmount - totalExpenses,
                    date: nextAvailableMonth.toISOString()
                })
                .select()
                .single();

            if (planError) throw planError;

            // Insert budget expenses
            const expensesWithPlanId = expenses.map(expense => ({
                ...expense,
                plan_id: planData.id
            }));

            const { error: expensesError } = await supabase
                .from('budget_expenses')
                .insert(expensesWithPlanId);

            if (expensesError) throw expensesError;

            const plan: BudgetPlan = {
                id: planData.id,
                initialBudget: budget,
                savingsPercentage: percentage,
                savingsAmount,
                spendingAmount,
                expenses,
                remainingAmount: spendingAmount - totalExpenses,
                date: planData.date ?? new Date().toISOString(),
            };

            onPlanCreated(plan);
        } catch (error) {
            console.error('Error creating budget plan:', error);
            toast({
                title: "Error",
                description: "Hubo un error al crear el plan de presupuesto",
                variant: "destructive",
            });
        }
    };

    if (step === "expenses") {
        const budget = parseFloat(initialBudget);
        const percentage = parseFloat(savingsPercentage);
        const savingsAmount = (budget * percentage) / 100;
        const spendingAmount = budget - savingsAmount;

        return (
            <ExpensesSelection
                availableAmount={spendingAmount}
                onSubmit={handleExpensesSubmit}
                onBack={() => setStep("initial")}
            />
        );
    }

    return (
        <Card className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-2">Crear Nuevo Plan Mensual</h2>
            
            {/* Indicador del mes */}
            <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
                <span className="font-medium capitalize">
                    Plan para: {formattedMonth}
                </span>
            </div>

            <form onSubmit={handleInitialSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="initialBudget">Presupuesto Mensual</Label>
                    <Input
                        id="initialBudget"
                        type="number"
                        value={initialBudget}
                        onChange={(e) => setInitialBudget(e.target.value)}
                        placeholder="Ingresa tu presupuesto"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="savingsPercentage">Porcentaje de Ahorro</Label>
                    <Input
                        id="savingsPercentage"
                        type="number"
                        value={savingsPercentage}
                        onChange={(e) => setSavingsPercentage(e.target.value)}
                        placeholder="Porcentaje a ahorrar"
                        min="0"
                        max="100"
                    />
                </div>
                <Button type="submit" className="w-full">
                    Continuar
                </Button>
            </form>
        </Card>
    );
};

export default NewBudgetPlanForm;