interface BudgetExpense {
    id?: string;
    category: string;
    amount: number;
    is_paid?: boolean;
    transaction_id?: string;
    recurring_transaction_id?: string; // Vinculación con transacción recurrente
    due_date?: string; // Fecha de vencimiento del gasto
    is_recurring?: boolean; // Si es un gasto recurrente
}

interface BudgetPlan {
    id?: string;
    initialBudget: number;
    savingsPercentage: number;
    savingsAmount: number;
    spendingAmount: number;
    expenses: BudgetExpense[];
    remainingAmount: number;
    date: string;
}

// Tipos para el sistema de alertas
type BudgetAlertType = 'due_soon' | 'overdue' | 'overspent' | 'pending_reminder';

interface BudgetAlert {
    id: string;
    type: BudgetAlertType;
    title: string;
    message: string;
    expense?: BudgetExpense;
    category?: string;
    plannedAmount?: number;
    actualAmount?: number;
    dueDate?: string;
    severity: 'warning' | 'error' | 'info';
}