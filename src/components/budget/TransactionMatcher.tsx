import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
    Link2,
    X,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    RefreshCw,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useTransactionMatching } from "../../hooks/useTransactionMatching";
import { useToast } from "../../hooks/use-toast";
import { useState } from "react";

const TransactionMatcher = () => {
    const { 
        pendingMatches, 
        loading, 
        linkTransactionToExpense, 
        dismissMatch,
        refreshMatches 
    } = useTransactionMatching();
    const { toast } = useToast();
    const [linkingId, setLinkingId] = useState<string | null>(null);

    const handleLink = async (transactionId: string, expenseId: string, category: string) => {
        setLinkingId(transactionId);
        const success = await linkTransactionToExpense(transactionId, expenseId);
        setLinkingId(null);

        if (success) {
            toast({
                title: "Transacción vinculada",
                description: `El gasto de "${category}" ha sido marcado como pagado.`,
            });
        } else {
            toast({
                title: "Error",
                description: "No se pudo vincular la transacción.",
                variant: "destructive",
            });
        }
    };

    const handleDismiss = (transactionId: string) => {
        dismissMatch(transactionId);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Alta';
        if (score >= 60) return 'Media';
        return 'Baja';
    };

    if (loading) {
        return (
            <Card className="p-4 animate-pulse">
                <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-20 bg-muted rounded"></div>
                </div>
            </Card>
        );
    }

    if (pendingMatches.length === 0) {
        return (
            <Card className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-1">Sin sugerencias pendientes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Todas las transacciones han sido revisadas
                </p>
                <Button variant="outline" size="sm" onClick={refreshMatches}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Buscar nuevas coincidencias
                </Button>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold">Sugerencias de Vinculación</h3>
                    <Badge variant="secondary">{pendingMatches.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={refreshMatches}>
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
                Detectamos transacciones que podrían corresponder a gastos de tu presupuesto.
            </p>

            <div className="space-y-3">
                {pendingMatches.map((match) => (
                    <div
                        key={match.transaction.id}
                        className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Transacción */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">
                                        {match.transaction.description || 'Transacción'}
                                    </span>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs text-white ${getScoreColor(match.matchScore)}`}
                                    >
                                        {getScoreLabel(match.matchScore)} coincidencia
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    ${Math.abs(match.transaction.amount).toLocaleString('es-ES')} •{' '}
                                    {format(parseISO(match.transaction.date), "d 'de' MMMM", { locale: es })}
                                </div>
                            </div>

                            {/* Flecha */}
                            <div className="flex items-center px-2">
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </div>

                            {/* Gasto del presupuesto */}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{match.expense.category}</div>
                                <div className="text-sm text-muted-foreground">
                                    Presupuestado: ${match.expense.amount.toLocaleString('es-ES')}
                                </div>
                            </div>
                        </div>

                        {/* Razón del match */}
                        <div className="mt-2 mb-3">
                            <span className="text-xs text-muted-foreground">
                                {match.matchReason}
                            </span>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleLink(
                                    match.transaction.id, 
                                    match.expense.id, 
                                    match.expense.category
                                )}
                                disabled={linkingId === match.transaction.id}
                                className="flex-1"
                            >
                                {linkingId === match.transaction.id ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Link2 className="h-4 w-4 mr-2" />
                                )}
                                Vincular
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDismiss(match.transaction.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default TransactionMatcher;
