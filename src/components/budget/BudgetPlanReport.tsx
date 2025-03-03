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
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";

interface BudgetPlanReportProps {
    plan: BudgetPlan;
    onReset: () => void;
}

const BudgetPlanReport = ({ plan, onReset }: BudgetPlanReportProps) => {
    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold">Plan Quincenal</h2>
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
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plan.expenses.map((expense, index) => (
                            <TableRow key={index}>
                                <TableCell>{expense.category}</TableCell>
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
                        ))}
                        <TableRow>
                            <TableCell className="font-semibold">Monto sin Asignar</TableCell>
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