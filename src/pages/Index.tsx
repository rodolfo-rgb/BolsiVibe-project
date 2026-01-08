import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import AccountsPanel from "../components/AccountsPanel";
import CreditCardsPanel from "../components/CreditCardsPanel";
import CardPaymentAlerts from "../components/CardPaymentAlerts";
import { useAccounts } from "../hooks/useAccounts";
import { useTransactions } from "../hooks/useTransactions";
import { useCreditCards } from "../hooks/useCreditCards";
import {
    Eye,
    EyeOff,
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

const Index = () => {
    const { getTotalBalance, accounts } = useAccounts();
    const { transactions } = useTransactions();
    const { creditCards } = useCreditCards();
    const [showAmounts, setShowAmounts] = useState(true);

    // Calculate total income and expenses from transactions
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = getTotalBalance();
    const totalDebt = creditCards.reduce((sum, card) => sum + (card.current_balance || 0), 0);
    const netWorth = totalBalance - totalDebt;

    const formatAmount = (amount: number) => {
        return showAmounts ? `$${amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}` : "••••••";
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p className="text-muted-foreground text-sm font-medium">
                            {getGreeting()}
                        </p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">
                            Tu resumen financiero
                        </h1>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAmounts(!showAmounts)}
                        className="self-start md:self-auto gap-2 text-muted-foreground hover:text-foreground"
                    >
                        {showAmounts ? (
                            <>
                                <Eye className="h-4 w-4" />
                                <span className="text-sm">Ocultar montos</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="h-4 w-4" />
                                <span className="text-sm">Mostrar montos</span>
                            </>
                        )}
                    </Button>
                </div>

                {/* Main Balance Card */}
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[hsl(212,69%,16%)] to-[hsl(212,69%,22%)] text-white shadow-xl">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                    <CardContent className="relative p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div className="space-y-2">
                                <p className="text-white/70 text-sm font-medium flex items-center gap-2">
                                    <Wallet className="h-4 w-4" />
                                    Balance total disponible
                                </p>
                                <p className="text-4xl md:text-5xl font-bold tracking-tight">
                                    {formatAmount(totalBalance)}
                                </p>
                                <p className="text-white/60 text-sm">
                                    Patrimonio neto: {formatAmount(netWorth)}
                                </p>
                            </div>
                            <div className="flex gap-4 md:gap-6">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <ArrowUpRight className="h-5 w-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-xs">Ingresos</p>
                                        <p className="text-lg font-semibold text-green-400">
                                            {formatAmount(totalIncome)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <ArrowDownRight className="h-5 w-5 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-white/60 text-xs">Gastos</p>
                                        <p className="text-lg font-semibold text-red-400">
                                            {formatAmount(totalExpenses)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card Payment Alerts */}
                <CardPaymentAlerts creditCards={creditCards} />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border shadow-md bg-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Wallet className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Cuentas</p>
                                    <p className="text-xl font-bold">{accounts.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-md bg-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Tarjetas</p>
                                    <p className="text-xl font-bold">{creditCards.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-md bg-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-green-500/10 rounded-xl">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Transacciones</p>
                                    <p className="text-xl font-bold">{transactions.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border shadow-md bg-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-orange-500/10 rounded-xl">
                                    <TrendingDown className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Deuda total</p>
                                    <p className="text-xl font-bold">{showAmounts ? `$${totalDebt.toLocaleString("es-MX")}` : "••••"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Accounts and Cards Section */}
                <div className="grid lg:grid-cols-2 gap-6 items-stretch">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1">
                            <Wallet className="h-4 w-4" />
                            Mis Cuentas
                        </h2>
                        <div className="flex-1">
                            <AccountsPanel />
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1">
                            <CreditCard className="h-4 w-4" />
                            Tarjetas de Crédito
                        </h2>
                        <div className="flex-1">
                            <CreditCardsPanel />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;