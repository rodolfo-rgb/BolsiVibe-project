import { useState, useEffect, useCallback } from "react";
import { addMonths, startOfMonth, isSameMonth } from "date-fns";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Copy, RefreshCw, Calculator, Target, Bell, Plus } from "lucide-react";
import NewBudgetPlanForm from "../components/budget/NewBudgetPlanForm";
import BudgetPlanReport from "../components/budget/BudgetPlanReport";
import BudgetAlerts from "../components/budget/BudgetAlerts";
import TransactionMatcher from "../components/budget/TransactionMatcher";
import GoalsList from "../components/goals/GoalsList";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../lib/auth";
import { useToast } from "../hooks/use-toast";
import { useBudgetAlerts } from "../hooks/useBudgetAlerts";

const Budget = () => {
    const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
    const [currentPlanIndex, setCurrentPlanIndex] = useState<number>(0);
    const [showNewPlanForm, setShowNewPlanForm] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    
    // Hook para alertas del presupuesto
    const {
        alerts,
        loading: alertsLoading,
        categorySpending,
        refreshAlerts,
        pendingExpensesCount,
        overdueExpensesCount,
        overspentCategoriesCount,
    } = useBudgetAlerts();

    const currentPlan = budgetPlans[currentPlanIndex];

    // Función para cargar planes
    const loadBudgetPlans = async () => {
        if (!user) return;

        const { data: plans, error } = await supabase
            .from('budget_plans')
            .select(`
            *,
            budget_expenses (*)
          `)
            .eq('user_id', user.id)
            .order('date', { ascending: false });

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
            
            // Encontrar el índice del plan del mes actual
            const today = new Date();
            const currentMonthPlanIndex = formattedPlans.findIndex(plan => 
                isSameMonth(new Date(plan.date), today)
            );
            
            // Si existe un plan para el mes actual, mostrarlo; si no, mostrar el más reciente (índice 0)
            setCurrentPlanIndex(currentMonthPlanIndex >= 0 ? currentMonthPlanIndex : 0);
        }
    };

    // Cargar planes al iniciar
    useEffect(() => {
        loadBudgetPlans();
    }, [user]);

    // Recargar datos cuando la ventana vuelve a estar visible (útil cuando se cambia de pestaña)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                loadBudgetPlans();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // También refrescar periódicamente cada 30 segundos mientras la página está visible
        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible' && user) {
                loadBudgetPlans();
            }
        }, 30000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(intervalId);
        };
    }, [user]);

    // Suscripción a cambios en budget_expenses para actualizar en tiempo real
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('budget_expenses_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'budget_expenses'
                },
                (payload) => {
                    // Actualizar el estado local cuando un gasto se marca como pagado
                    setBudgetPlans(prevPlans => 
                        prevPlans.map(plan => ({
                            ...plan,
                            expenses: plan.expenses.map(expense => 
                                expense.id === payload.new.id 
                                    ? { ...expense, is_paid: payload.new.is_paid, transaction_id: payload.new.transaction_id }
                                    : expense
                            )
                        }))
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handlePlanCreated = (plan: BudgetPlan) => {
        // Insertar el plan en la posición correcta manteniendo orden por fecha descendente
        const newPlanDate = new Date(plan.date);
        const updatedPlans = [...budgetPlans];
        
        // Encontrar la posición donde insertar (antes del primer plan con fecha menor)
        let insertIndex = updatedPlans.findIndex(p => new Date(p.date) < newPlanDate);
        if (insertIndex === -1) insertIndex = updatedPlans.length;
        
        updatedPlans.splice(insertIndex, 0, plan);
        setBudgetPlans(updatedPlans);
        setCurrentPlanIndex(insertIndex); // Seleccionar el nuevo plan
        setShowNewPlanForm(false);
    };

    const handleCopyPreviousPlan = async () => {
        if (!user) return;

        const previousPlan = budgetPlans[currentPlanIndex];
        if (previousPlan) {
            try {
                // Calcular la fecha del siguiente mes basándose en el plan actual
                const currentPlanDate = new Date(previousPlan.date);
                const nextMonthDate = startOfMonth(addMonths(currentPlanDate, 1));

                // Verificar si ya existe un plan para ese mes
                const existingPlanForMonth = budgetPlans.find(plan => {
                    const planDate = new Date(plan.date);
                    return planDate.getMonth() === nextMonthDate.getMonth() && 
                           planDate.getFullYear() === nextMonthDate.getFullYear();
                });

                if (existingPlanForMonth) {
                    toast({
                        title: "Plan existente",
                        description: `Ya existe un plan para ${nextMonthDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
                        variant: "destructive",
                    });
                    return;
                }

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
                        date: nextMonthDate.toISOString(),
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
                    expenses: expensesWithNewPlanId.map((exp, idx) => ({ ...exp, id: `temp-${idx}`, is_paid: false })),
                };

                // Insertar el plan en la posición correcta manteniendo orden por fecha descendente
                const newPlanDate = new Date(newPlanWithExpenses.date);
                const updatedPlans = [...budgetPlans];
                let insertIndex = updatedPlans.findIndex(p => new Date(p.date) < newPlanDate);
                if (insertIndex === -1) insertIndex = updatedPlans.length;
                
                updatedPlans.splice(insertIndex, 0, newPlanWithExpenses);
                setBudgetPlans(updatedPlans);
                setCurrentPlanIndex(insertIndex); // Seleccionar el nuevo plan

                const monthName = new Date(newPlan.date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
                toast({
                    title: "Plan copiado",
                    description: `Se ha creado el plan para ${monthName}`,
                });
            } catch (error) {
                console.error('Error copying budget plan:', error);
                toast({
                    title: "Error",
                    description: "No se pudo copiar el plan mensual",
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
                description: "El plan mensual ha sido eliminado",
            });
        } catch (error) {
            console.error('Error deleting budget plan:', error);
            toast({
                title: "Error",
                description: "No se pudo eliminar el plan mensual",
                variant: "destructive",
            });
        }
    };

    // Navegación: prev (izquierda) = planes más antiguos, next (derecha) = planes más recientes
    // Como los planes están ordenados por fecha descendente (más reciente = índice 0),
    // ir a la izquierda significa ir a índices mayores (planes anteriores)
    const navigatePlan = (direction: "prev" | "next") => {
        if (direction === "prev" && currentPlanIndex < budgetPlans.length - 1) {
            // Ir a un plan más antiguo (índice mayor)
            setCurrentPlanIndex(currentPlanIndex + 1);
        } else if (direction === "next" && currentPlanIndex > 0) {
            // Ir a un plan más reciente (índice menor)
            setCurrentPlanIndex(currentPlanIndex - 1);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Planificación Financiera</h1>

            <Tabs defaultValue="budget" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="budget" className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Plan Mensual
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="flex items-center gap-2 relative">
                        <Bell className="h-4 w-4" />
                        Alertas
                        {(overdueExpensesCount > 0 || overspentCategoriesCount > 0) && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {overdueExpensesCount + overspentCategoriesCount}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Metas de Ahorro
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="budget">
                    {budgetPlans.length === 0 ? (
                        <Card className="p-6 mb-6 bg-muted/50">
                            <p className="text-center text-muted-foreground mb-4">
                                No hay planes mensuales creados. Crea tu primer plan para comenzar.
                            </p>
                        </Card>
                    ) : !showNewPlanForm ? (
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigatePlan("prev")}
                                    disabled={currentPlanIndex === budgetPlans.length - 1}
                                    title="Ver plan anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {currentPlan && new Date(currentPlan.date).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => navigatePlan("next")}
                                    disabled={currentPlanIndex === 0}
                                    title="Ver plan más reciente"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => loadBudgetPlans()}
                                    title="Actualizar estados"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCopyPreviousPlan}
                                    className="flex items-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copiar Plan
                                </Button>
                                <Button
                                    onClick={() => setShowNewPlanForm(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Nuevo Plan
                                </Button>
                            </div>
                        </div>
                    ) : null}

                    {!currentPlan || showNewPlanForm ? (
                        <div className="text-center">
                            {showNewPlanForm && budgetPlans.length > 0 && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowNewPlanForm(false)}
                                    className="mb-4"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Volver al plan actual
                                </Button>
                            )}
                            <NewBudgetPlanForm 
                                onPlanCreated={handlePlanCreated} 
                                existingPlans={budgetPlans}
                            />
                        </div>
                    ) : (
                        <BudgetPlanReport
                            plan={currentPlan}
                            onReset={handleDeletePlan}
                        />
                    )}
                </TabsContent>

                <TabsContent value="alerts">
                    {budgetPlans.length === 0 ? (
                        <Card className="p-6 bg-muted/50">
                            <p className="text-center text-muted-foreground">
                                Crea un plan mensual para ver alertas y seguimiento de gastos.
                            </p>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {/* Sugerencias de vinculación automática */}
                            <TransactionMatcher />
                            
                            {/* Alertas del presupuesto */}
                            <BudgetAlerts
                                alerts={alerts}
                                categorySpending={categorySpending}
                                loading={alertsLoading}
                                onRefresh={refreshAlerts}
                                pendingExpensesCount={pendingExpensesCount}
                                overdueExpensesCount={overdueExpensesCount}
                                overspentCategoriesCount={overspentCategoriesCount}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="goals">
                    <GoalsList />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Budget;