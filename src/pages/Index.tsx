import AccountsPanel from "../components/AccountsPanel";
import BalancePanel from "../components/BalancePanel";
import CreditCardsPanel from "../components/CreditCardsPanel";
import { useAccounts } from "../hooks/useAccounts";
import { useTransactions } from "../hooks/useTransactions";

const Index = () => {
    const { getTotalBalance } = useAccounts();
    const { transactions } = useTransactions();

    // Calculate total income and expenses from transactions
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <BalancePanel
                totalBalance={getTotalBalance()}
                income={totalIncome}
                expenses={totalExpenses}
            />
            <div className="space-y-6">
                <AccountsPanel />
                <CreditCardsPanel />
            </div>
        </div>
    );
};

export default Index;