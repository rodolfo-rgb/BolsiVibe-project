import { useState } from "react";
import { SavingsGoal, GOAL_ICONS } from "../../types/savings-goal";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Trash2, Plus, Calendar } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAccounts } from "../../hooks/useAccounts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface GoalCardProps {
    goal: SavingsGoal;
    onContribute: (goalId: string, amount: number, accountId?: string) => Promise<void>;
    onDelete: (goalId: string) => Promise<void>;
}

const GoalCard = ({ goal, onContribute, onDelete }: GoalCardProps) => {
    const { accounts } = useAccounts();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contributeDialogOpen, setContributeDialogOpen] = useState(false);
    const [contributeAmount, setContributeAmount] = useState("");
    const [selectedAccount, setSelectedAccount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const remaining = goal.target_amount - goal.current_amount;
    const icon = GOAL_ICONS.find((i) => i.id === goal.icon);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        const date = new Date(dateStr + "T00:00:00");
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getDaysRemaining = () => {
        if (!goal.deadline) return null;
        const today = new Date();
        const deadline = new Date(goal.deadline);
        const diffTime = deadline.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();

    const handleContribute = async () => {
        const amount = parseFloat(contributeAmount);
        if (isNaN(amount) || amount <= 0) return;

        setIsSubmitting(true);
        try {
            await onContribute(goal.id, amount, selectedAccount || undefined);
            setContributeDialogOpen(false);
            setContributeAmount("");
            setSelectedAccount("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        await onDelete(goal.id);
        setDeleteDialogOpen(false);
    };

    return (
        <>
            <div
                className={`relative p-5 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all ${
                    goal.is_completed ? "opacity-75" : ""
                }`}
            >
                {/* Completed badge */}
                {goal.is_completed && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Completada
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ backgroundColor: `${goal.color}20` }}
                    >
                        {icon?.emoji || "🎯"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{goal.name}</h3>
                        {goal.deadline && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(goal.deadline)}
                                {daysRemaining !== null && daysRemaining > 0 && (
                                    <span className={`ml-1 ${daysRemaining < 30 ? "text-orange-500" : ""}`}>
                                        ({daysRemaining} días)
                                    </span>
                                )}
                                {daysRemaining !== null && daysRemaining <= 0 && (
                                    <span className="ml-1 text-red-500">(Vencida)</span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress
                        value={progress}
                        className="h-3"
                        style={{
                            // @ts-ignore
                            "--progress-background": goal.color,
                        }}
                    />
                    <div className="flex justify-between text-sm">
                        <span style={{ color: goal.color }} className="font-semibold">
                            ${goal.current_amount.toLocaleString("es-ES")}
                        </span>
                        <span className="text-muted-foreground">
                            de ${goal.target_amount.toLocaleString("es-ES")}
                        </span>
                    </div>
                </div>

                {/* Remaining */}
                {!goal.is_completed && (
                    <p className="text-sm text-muted-foreground mb-4">
                        Faltan <span className="font-semibold text-foreground">${remaining.toLocaleString("es-ES")}</span>
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {!goal.is_completed && (
                        <Button
                            onClick={() => setContributeDialogOpen(true)}
                            className="flex-1"
                            style={{ backgroundColor: goal.color }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Abonar
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Contribute Dialog */}
            <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span>{icon?.emoji}</span>
                            Abonar a "{goal.name}"
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Monto a abonar</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="1000"
                                value={contributeAmount}
                                onChange={(e) => setContributeAmount(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Restante: ${remaining.toLocaleString("es-ES")}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Cuenta de origen (opcional)</Label>
                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una cuenta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.map((account) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.name} - ${(account.balance || 0).toLocaleString("es-ES")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setContributeDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleContribute}
                            disabled={isSubmitting || !contributeAmount}
                            style={{ backgroundColor: goal.color }}
                        >
                            {isSubmitting ? "Abonando..." : "Abonar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta meta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará la meta "{goal.name}" 
                            y todo su historial de abonos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default GoalCard;
