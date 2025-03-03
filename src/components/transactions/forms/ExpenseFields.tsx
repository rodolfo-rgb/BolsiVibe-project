import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Account } from "../../../types/accounts";
import { UseFormReturn } from "react-hook-form";
import { useCreditCards } from "../../../hooks/useCreditCards";
import { useEffect, useState } from "react";
import { supabase } from "../../../integrations/supabase/client";
import { useAuth } from "../../../lib/auth";

interface ExpenseFieldsProps {
    form: UseFormReturn<any>;
    accounts: Account[];
}

interface BudgetExpenseOption {
    id: string;
    category: string;
    amount: number;
    plan_id: string;
}

const ExpenseFields = ({ form, accounts }: ExpenseFieldsProps) => {
    const { creditCards } = useCreditCards();
    const { user } = useAuth();
    const [budgetExpenses, setBudgetExpenses] = useState<BudgetExpenseOption[]>([]);

    useEffect(() => {
        const fetchUnpaidExpenses = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('budget_expenses')
                .select(`
          id,
          category,
          amount,
          plan_id,
          budget_plans!inner(user_id)
        `)
                .eq('is_paid', false)
                .eq('budget_plans.user_id', user.id);

            if (error) {
                console.error('Error fetching budget expenses:', error);
                return;
            }

            setBudgetExpenses(data as BudgetExpenseOption[]);
        };

        fetchUnpaidExpenses();
    }, [user]);

    const handleSourceChange = (value: string) => {
        const [type, id] = value.split(':');
        if (type === 'account') {
            form.setValue('account_id', id);
            form.setValue('credit_card_id', undefined);
        } else {
            form.setValue('credit_card_id', id);
            form.setValue('account_id', undefined);
        }
    };

    const handleBudgetExpenseChange = (expenseId: string) => {
        const expense = budgetExpenses.find(e => e.id === expenseId);
        if (expense) {
            form.setValue('amount', expense.amount);
            form.setValue('budget_expense_id', expenseId);
        }
    };

    const getCurrentValue = () => {
        const accountId = form.watch('account_id');
        const creditCardId = form.watch('credit_card_id');
        if (accountId) return `account:${accountId}`;
        if (creditCardId) return `credit_card:${creditCardId}`;
        return undefined;
    };

    return (
        <>
            <FormField
                control={form.control}
                name="source"
                render={() => (
                    <FormItem>
                        <FormLabel>Cuenta o Tarjeta Origen</FormLabel>
                        <Select
                            onValueChange={handleSourceChange}
                            value={getCurrentValue()}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona la cuenta o tarjeta origen" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {accounts.length > 0 && (
                                    <>
                                        <SelectItem value="accounts_header" disabled className="font-semibold">
                                            Cuentas
                                        </SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.id} value={`account:${account.id}`}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                                {creditCards.length > 0 && (
                                    <>
                                        <SelectItem value="cards_header" disabled className="font-semibold">
                                            Tarjetas de Crédito
                                        </SelectItem>
                                        {creditCards.map((card) => (
                                            <SelectItem key={card.id} value={`credit_card:${card.id}`}>
                                                {card.name} (Disponible: $
                                                {(card.limit_amount - (card.current_balance ?? 0)).toLocaleString("es-ES")})
                                            </SelectItem>
                                        ))}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {budgetExpenses.length > 0 && (
                <FormField
                    control={form.control}
                    name="budget_expense_id"
                    render={() => (
                        <FormItem>
                            <FormLabel>Gasto del Presupuesto (Opcional)</FormLabel>
                            <Select onValueChange={handleBudgetExpenseChange}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un gasto del presupuesto" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {budgetExpenses.map((expense) => (
                                        <SelectItem key={expense.id} value={expense.id}>
                                            {expense.category} - ${expense.amount.toLocaleString("es-ES")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </>
    );
};

export default ExpenseFields;