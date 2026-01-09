import { useState, useEffect, useMemo } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../lib/auth";
import { 
    startOfMonth, 
    endOfMonth, 
    addDays, 
    isBefore, 
    isToday,
    parseISO,
    differenceInDays
} from "date-fns";

interface CategorySpending {
    category: string;
    planned: number;
    actual: number;
    difference: number;
    percentageUsed: number;
}

interface UseBudgetAlertsReturn {
    alerts: BudgetAlert[];
    loading: boolean;
    categorySpending: CategorySpending[];
    refreshAlerts: () => Promise<void>;
    pendingExpensesCount: number;
    overdueExpensesCount: number;
    overspentCategoriesCount: number;
}

export const useBudgetAlerts = (): UseBudgetAlertsReturn => {
    const { user } = useAuth();
    const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState<BudgetPlan | null>(null);
    const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);

    // Mapeo de categorías de transacciones a categorías del presupuesto
    const categoryMapping: Record<string, string> = {
        'Alquiler': 'Alquiler',
        'Renta': 'Alquiler',
        'Transporte': 'Transporte',
        'Gasolina': 'Transporte',
        'Uber': 'Transporte',
        'Taxi': 'Transporte',
        'Alimentación': 'Alimentación',
        'Comida': 'Alimentación',
        'Supermercado': 'Alimentación',
        'Restaurante': 'Alimentación',
        'Servicios': 'Servicios (Luz, Agua, etc.)',
        'Luz': 'Servicios (Luz, Agua, etc.)',
        'Agua': 'Servicios (Luz, Agua, etc.)',
        'Gas': 'Servicios (Luz, Agua, etc.)',
        'Internet': 'Servicios (Luz, Agua, etc.)',
        'Entretenimiento': 'Entretenimiento',
        'Cine': 'Entretenimiento',
        'Netflix': 'Entretenimiento',
        'Spotify': 'Entretenimiento',
        'Salud': 'Salud',
        'Médico': 'Salud',
        'Farmacia': 'Salud',
        'Educación': 'Educación',
        'Cursos': 'Educación',
        'Libros': 'Educación',
    };

    const normalizeCategoryName = (description: string): string => {
        // Intentar mapear la descripción a una categoría conocida
        const lowerDescription = description.toLowerCase();
        
        for (const [key, value] of Object.entries(categoryMapping)) {
            if (lowerDescription.includes(key.toLowerCase())) {
                return value;
            }
        }
        
        return description;
    };

    const fetchCurrentPlan = async () => {
        if (!user) return null;

        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const { data: plans, error } = await (supabase as any)
            .from('budget_plans')
            .select(`
                *,
                budget_expenses (*)
            `)
            .eq('user_id', user.id)
            .gte('date', monthStart.toISOString())
            .lte('date', monthEnd.toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error loading budget plan:', error);
            return null;
        }

        if (plans && plans.length > 0) {
            const plan = plans[0] as any;
            return {
                id: plan.id,
                initialBudget: plan.initial_budget,
                savingsPercentage: plan.savings_percentage,
                savingsAmount: plan.savings_amount,
                spendingAmount: plan.spending_amount,
                expenses: plan.budget_expenses,
                remainingAmount: plan.remaining_amount,
                date: plan.date,
            } as BudgetPlan;
        }

        return null;
    };

    const fetchTransactions = async () => {
        if (!user) return [];

        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        const { data, error } = await (supabase as any)
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .eq('type', 'expense')
            .gte('date', monthStart.toISOString())
            .lte('date', monthEnd.toISOString());

        if (error) {
            console.error('Error loading transactions:', error);
            return [];
        }

        return data || [];
    };

    const calculateCategorySpending = (plan: BudgetPlan, txns: any[]): CategorySpending[] => {
        const spending: CategorySpending[] = [];

        for (const expense of plan.expenses) {
            // Calcular gastos reales para esta categoría
            const actualSpent = txns
                .filter(tx => {
                    const normalizedDesc = normalizeCategoryName(tx.description || '');
                    return normalizedDesc === expense.category;
                })
                .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

            const difference = expense.amount - actualSpent;
            const percentageUsed = expense.amount > 0 
                ? (actualSpent / expense.amount) * 100 
                : 0;

            spending.push({
                category: expense.category,
                planned: expense.amount,
                actual: actualSpent,
                difference,
                percentageUsed,
            });
        }

        return spending;
    };

    const generateAlerts = (plan: BudgetPlan, spending: CategorySpending[]): BudgetAlert[] => {
        const generatedAlerts: BudgetAlert[] = [];
        const today = new Date();
        const threeDaysFromNow = addDays(today, 3);

        // 1. Alertas de gastos próximos a vencer
        for (const expense of plan.expenses) {
            if (expense.is_paid) continue;

            if (expense.due_date) {
                const dueDate = parseISO(expense.due_date);
                const daysUntilDue = differenceInDays(dueDate, today);

                // Vencido
                if (isBefore(dueDate, today) && !isToday(dueDate)) {
                    generatedAlerts.push({
                        id: `overdue-${expense.id}`,
                        type: 'overdue',
                        title: '¡Gasto vencido!',
                        message: `El pago de "${expense.category}" por $${expense.amount.toLocaleString('es-ES')} venció hace ${Math.abs(daysUntilDue)} día(s)`,
                        expense,
                        dueDate: expense.due_date,
                        severity: 'error',
                    });
                }
                // Próximo a vencer (3 días o menos)
                else if (isBefore(dueDate, threeDaysFromNow) || isToday(dueDate)) {
                    generatedAlerts.push({
                        id: `due-soon-${expense.id}`,
                        type: 'due_soon',
                        title: 'Pago próximo a vencer',
                        message: isToday(dueDate)
                            ? `El pago de "${expense.category}" por $${expense.amount.toLocaleString('es-ES')} vence HOY`
                            : `El pago de "${expense.category}" por $${expense.amount.toLocaleString('es-ES')} vence en ${daysUntilDue} día(s)`,
                        expense,
                        dueDate: expense.due_date,
                        severity: 'warning',
                    });
                }
            }
        }

        // 2. Alertas de categorías donde el gasto real supera lo planificado
        for (const cat of spending) {
            if (cat.actual > cat.planned) {
                const excess = cat.actual - cat.planned;
                generatedAlerts.push({
                    id: `overspent-${cat.category}`,
                    type: 'overspent',
                    title: 'Presupuesto excedido',
                    message: `Has gastado $${excess.toLocaleString('es-ES')} más de lo planificado en "${cat.category}"`,
                    category: cat.category,
                    plannedAmount: cat.planned,
                    actualAmount: cat.actual,
                    severity: 'error',
                });
            } else if (cat.percentageUsed >= 80 && cat.percentageUsed < 100) {
                // Advertencia cuando está cerca del límite (80% o más)
                generatedAlerts.push({
                    id: `near-limit-${cat.category}`,
                    type: 'overspent',
                    title: 'Cerca del límite',
                    message: `Has usado el ${cat.percentageUsed.toFixed(0)}% del presupuesto de "${cat.category}"`,
                    category: cat.category,
                    plannedAmount: cat.planned,
                    actualAmount: cat.actual,
                    severity: 'warning',
                });
            }
        }

        // 3. Recordatorios de gastos pendientes
        const pendingExpenses = plan.expenses.filter(exp => !exp.is_paid);
        if (pendingExpenses.length > 0) {
            const totalPending = pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            
            // Solo mostrar recordatorio general si hay varios gastos pendientes sin fecha
            const pendingWithoutDate = pendingExpenses.filter(exp => !exp.due_date);
            if (pendingWithoutDate.length > 2) {
                generatedAlerts.push({
                    id: 'pending-reminder',
                    type: 'pending_reminder',
                    title: 'Gastos pendientes',
                    message: `Tienes ${pendingExpenses.length} gastos pendientes por un total de $${totalPending.toLocaleString('es-ES')}`,
                    severity: 'info',
                });
            }
        }

        // Ordenar alertas por severidad (error > warning > info)
        const severityOrder = { error: 0, warning: 1, info: 2 };
        generatedAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return generatedAlerts;
    };

    const refreshAlerts = async () => {
        setLoading(true);
        try {
            const plan = await fetchCurrentPlan();
            const txns = await fetchTransactions();

            setCurrentPlan(plan);

            if (plan) {
                const spending = calculateCategorySpending(plan, txns);
                setCategorySpending(spending);

                const newAlerts = generateAlerts(plan, spending);
                setAlerts(newAlerts);
            } else {
                setCategorySpending([]);
                setAlerts([]);
            }
        } catch (error) {
            console.error('Error refreshing alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar alertas al inicio
    useEffect(() => {
        if (user) {
            refreshAlerts();
        }
    }, [user]);

    // Contadores para estadísticas rápidas
    const pendingExpensesCount = useMemo(() => 
        currentPlan?.expenses.filter(exp => !exp.is_paid).length || 0
    , [currentPlan]);

    const overdueExpensesCount = useMemo(() => 
        alerts.filter(a => a.type === 'overdue').length
    , [alerts]);

    const overspentCategoriesCount = useMemo(() => 
        alerts.filter(a => a.type === 'overspent' && a.severity === 'error').length
    , [alerts]);

    return {
        alerts,
        loading,
        categorySpending,
        refreshAlerts,
        pendingExpensesCount,
        overdueExpensesCount,
        overspentCategoriesCount,
    };
};
