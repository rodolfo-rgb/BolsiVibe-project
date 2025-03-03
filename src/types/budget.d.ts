interface BudgetExpense {
    id?: string;
    category: string;
    amount: number;
    is_paid?: boolean;
    transaction_id?: string;
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