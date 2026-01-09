import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import { format, parseISO, isBefore, isToday, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "../ui/badge";

interface BudgetPlanReportProps {
    plan: BudgetPlan;
    onReset: () => void;
}

const BudgetPlanReport = ({ plan, onReset }: BudgetPlanReportProps) => {
    const getDueDateInfo = (expense: BudgetExpense) => {
        if (!expense.due_date || expense.is_paid) return null;
        
        const dueDate = parseISO(expense.due_date);
        const today = new Date();
        const daysUntilDue = differenceInDays(dueDate, today);
        
        if (isBefore(dueDate, today) && !isToday(dueDate)) {
            return { status: 'overdue', label: `Vencido hace ${Math.abs(daysUntilDue)} día(s)`, color: 'text-red-500' };
        } else if (isToday(dueDate)) {
            return { status: 'today', label: '¡Vence hoy!', color: 'text-orange-500' };
        } else if (daysUntilDue <= 3) {
            return { status: 'soon', label: `Vence en ${daysUntilDue} día(s)`, color: 'text-yellow-500' };
        }
        return { status: 'ok', label: format(dueDate, "dd/MM/yyyy"), color: 'text-muted-foreground' };
    };

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">Plan Mensual</h2>
                    <p className="text-sm text-muted-foreground">
                        {format(new Date(plan.date), "PPP", { locale: es })}
                    </p>
                </div>
                <Button variant="outline" onClick={onReset}>
                    Eliminar Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Presupuesto Inicial</p>
                    <p className="text-2xl font-semibold">
                        ${plan.initialBudget.toLocaleString("es-ES")}
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Ahorro ({plan.savingsPercentage}%)</p>
                    <p className="text-2xl font-semibold text-green-600">
                        ${plan.savingsAmount.toLocaleString("es-ES")}
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Disponible para Gastos</p>
                    <p className="text-2xl font-semibold">
                        ${plan.spendingAmount.toLocaleString("es-ES")}
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold">Distribución de Gastos</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-center">Vencimiento</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plan.expenses.map((expense, index) => {
                            const dueDateInfo = getDueDateInfo(expense);
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {expense.category}
                                            {expense.is_recurring && (
                                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                                    <RefreshCw className="h-3 w-3" />
                                                    Recurrente
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {expense.due_date ? (
                                            <div className={`flex items-center justify-center gap-1 text-sm ${dueDateInfo?.color || ''}`}>
                                                {dueDateInfo?.status === 'overdue' && <AlertTriangle className="h-4 w-4" />}
                                                <Calendar className="h-3 w-3" />
                                                <span>{dueDateInfo?.label}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        ${expense.amount.toLocaleString("es-ES")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {expense.is_paid ? (
                                            <div className="flex items-center justify-end gap-2 text-green-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Pagado</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2 text-yellow-600">
                                                <XCircle className="h-4 w-4" />
                                                <span>Pendiente</span>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow>
                            <TableCell className="font-semibold">Monto sin Asignar</TableCell>
                            <TableCell />
                            <TableCell className="text-right font-semibold">
                                ${plan.remainingAmount.toLocaleString("es-ES")}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
};

export default BudgetPlanReport;