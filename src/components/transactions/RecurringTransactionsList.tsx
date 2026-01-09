import { useState } from "react";
import { Button } from "../ui/button";
import { Plus, Trash2, Pause, Play, ArrowUpCircle, ArrowDownCircle, CalendarClock } from "lucide-react";
import { RecurringTransaction, FREQUENCY_LABELS, DAYS_OF_WEEK } from "../../types/recurring-transaction";
import { useRecurringTransactions } from "../../hooks/useRecurringTransactions";
import { useAccounts } from "../../hooks/useAccounts";
import { useCreditCards } from "../../hooks/useCreditCards";
import NewRecurringTransactionForm from "./NewRecurringTransactionForm";
import { useToast } from "../../hooks/use-toast";
import { Badge } from "../ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";

const RecurringTransactionsList = () => {
    const { 
        recurringTransactions, 
        loading, 
        addRecurringTransaction, 
        toggleRecurringTransaction, 
        deleteRecurringTransaction,
        getUpcomingTransactions 
    } = useRecurringTransactions();
    const { accounts } = useAccounts();
    const { creditCards } = useCreditCards();
    const { toast } = useToast();
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);

    const getAccountName = (accountId: string | null) => {
        if (!accountId) return null;
        const account = accounts.find((a) => a.id === accountId);
        return account?.name || "Cuenta desconocida";
    };

    const getCardName = (cardId: string | null) => {
        if (!cardId) return null;
        const card = creditCards.find((c) => c.id === cardId);
        return card?.name || "Tarjeta desconocida";
    };

    const formatNextDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const handleDelete = async () => {
        if (!selectedTransaction) return;
        
        try {
            await deleteRecurringTransaction(selectedTransaction.id);
            toast({
                title: "Eliminada",
                description: "Transacción recurrente eliminada correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo eliminar la transacción.",
                variant: "destructive",
            });
        } finally {
            setDeleteDialogOpen(false);
            setSelectedTransaction(null);
        }
    };

    const handleToggle = async (transaction: RecurringTransaction) => {
        try {
            await toggleRecurringTransaction(transaction.id, !transaction.is_active);
            toast({
                title: transaction.is_active ? "Pausada" : "Activada",
                description: `Transacción recurrente ${transaction.is_active ? "pausada" : "activada"}.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo cambiar el estado.",
                variant: "destructive",
            });
        }
    };

    const upcomingTransactions = getUpcomingTransactions(7);

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Próximas transacciones */}
            {upcomingTransactions.length > 0 && (
                <div className="bg-secondary/50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CalendarClock className="h-4 w-4" />
                        Próximos 7 días
                    </h3>
                    <div className="space-y-2">
                        {upcomingTransactions.map((transaction) => (
                            <div 
                                key={transaction.id} 
                                className="flex items-center justify-between text-sm bg-background rounded p-2"
                            >
                                <div className="flex items-center gap-2">
                                    {transaction.type === "income" ? (
                                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                                    )}
                                    <span>{transaction.description}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">
                                        {formatNextDate(transaction.next_execution_date)}
                                    </span>
                                    <span className={transaction.type === "income" ? "text-green-500" : "text-red-500"}>
                                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-ES")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Header con botón de agregar */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Todas las transacciones recurrentes</h3>
                <Button onClick={() => setIsFormOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva
                </Button>
            </div>

            {/* Lista de transacciones recurrentes */}
            {recurringTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <CalendarClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tienes transacciones recurrentes</p>
                    <p className="text-sm mt-1">Crea una para automatizar tus gastos fijos</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {recurringTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className={`p-4 rounded-lg border ${
                                transaction.is_active 
                                    ? "bg-card border-border" 
                                    : "bg-muted/50 border-muted opacity-60"
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    {transaction.type === "income" ? (
                                        <ArrowUpCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                    ) : (
                                        <ArrowDownCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    )}
                                    <div>
                                        <p className="font-medium">{transaction.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="secondary" className="text-xs">
                                                {FREQUENCY_LABELS[transaction.frequency]}
                                            </Badge>
                                            {transaction.frequency === "monthly" && transaction.day_of_month && (
                                                <span className="text-xs text-muted-foreground">
                                                    Día {transaction.day_of_month}
                                                </span>
                                            )}
                                            {transaction.frequency === "weekly" && transaction.day_of_week !== undefined && (
                                                <span className="text-xs text-muted-foreground">
                                                    {DAYS_OF_WEEK.find(d => d.value === transaction.day_of_week)?.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {transaction.account_id && `Cuenta: ${getAccountName(transaction.account_id)}`}
                                            {transaction.credit_card_id && `Tarjeta: ${getCardName(transaction.credit_card_id)}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Próxima: {formatNextDate(transaction.next_execution_date)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`font-semibold ${
                                        transaction.type === "income" ? "text-green-500" : "text-red-500"
                                    }`}>
                                        {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString("es-ES")}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleToggle(transaction)}
                                        >
                                            {transaction.is_active ? (
                                                <Pause className="h-4 w-4" />
                                            ) : (
                                                <Play className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Formulario */}
            <NewRecurringTransactionForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={async (data) => {
                    await addRecurringTransaction(data);
                }}
            />

            {/* Diálogo de confirmación de eliminación */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar transacción recurrente?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. La transacción "{selectedTransaction?.description}" 
                            dejará de ejecutarse automáticamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default RecurringTransactionsList;
