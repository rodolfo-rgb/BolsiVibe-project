import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { useRecurringTransactions } from "../../hooks/useRecurringTransactions";
import { Calendar, Trash2, Link2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ExpensesSelectionProps {
    availableAmount: number;
    onSubmit: (expenses: BudgetExpense[]) => void;
    onBack: () => void;
}

const EXPENSE_CATEGORIES = [
    { id: "rent", label: "Alquiler" },
    { id: "transport", label: "Transporte" },
    { id: "food", label: "Alimentación" },
    { id: "utilities", label: "Servicios (Luz, Agua, etc.)" },
    { id: "entertainment", label: "Entretenimiento" },
    { id: "health", label: "Salud" },
    { id: "education", label: "Educación" },
];

const ExpensesSelection = ({
    availableAmount,
    onSubmit,
    onBack,
}: ExpensesSelectionProps) => {
    const { toast } = useToast();
    const { recurringTransactions } = useRecurringTransactions();
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedRecurringId, setSelectedRecurringId] = useState<string>("");
    const [expenses, setExpenses] = useState<BudgetExpense[]>([]);

    // Filtrar solo transacciones recurrentes de tipo gasto
    const expenseRecurringTransactions = recurringTransactions.filter(
        rt => rt.type === "expense" && rt.is_active
    );

    const remainingAmount =
        availableAmount - expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const handleAddExpense = () => {
        if (!selectedCategory || !amount) {
            toast({
                title: "Error",
                description: "Por favor selecciona una categoría y un monto",
                variant: "destructive",
            });
            return;
        }

        const expenseAmount = parseFloat(amount);
        if (expenseAmount > remainingAmount) {
            toast({
                title: "Error",
                description: "El monto excede el presupuesto disponible",
                variant: "destructive",
            });
            return;
        }

        const category = EXPENSE_CATEGORIES.find((c) => c.id === selectedCategory);
        if (!category) return;

        const newExpense: BudgetExpense = {
            category: category.label,
            amount: expenseAmount,
            due_date: dueDate || undefined,
            is_recurring: isRecurring,
            recurring_transaction_id: selectedRecurringId || undefined,
        };

        setExpenses([...expenses, newExpense]);
        setSelectedCategory("");
        setAmount("");
        setDueDate("");
        setIsRecurring(false);
        setSelectedRecurringId("");
    };

    const handleRemoveExpense = (index: number) => {
        setExpenses(expenses.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onSubmit(expenses);
    };

    return (
        <Card className="p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Selección de Gastos</h2>
            <div className="mb-6">
                <p className="text-lg">
                    Monto disponible para gastos:{" "}
                    <span className="font-semibold">
                        ${availableAmount.toLocaleString("es-ES")}
                    </span>
                </p>
                <p className="text-lg">
                    Monto restante:{" "}
                    <span className="font-semibold">
                        ${remainingAmount.toLocaleString("es-ES")}
                    </span>
                </p>
            </div>

            <div className="space-y-6 mb-6">
                <div className="space-y-4">
                    <Label>Categoría de Gasto</Label>
                    <RadioGroup
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {EXPENSE_CATEGORIES.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={category.id} id={category.id} />
                                <Label htmlFor={category.id}>{category.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Monto</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ingresa el monto"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate">Fecha de Vencimiento (opcional)</Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <Switch
                        id="isRecurring"
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                    />
                    <Label htmlFor="isRecurring" className="cursor-pointer">
                        Es un gasto recurrente (se repite cada mes)
                    </Label>
                </div>

                {/* Selector de vinculación con transacción recurrente */}
                {expenseRecurringTransactions.length > 0 && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Link2 className="h-4 w-4" />
                            Vincular con transacción recurrente (opcional)
                        </Label>
                        <Select value={selectedRecurringId} onValueChange={setSelectedRecurringId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona una transacción recurrente..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Sin vincular</SelectItem>
                                {expenseRecurringTransactions.map((rt) => (
                                    <SelectItem key={rt.id} value={rt.id}>
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="h-3 w-3" />
                                            <span>{rt.description}</span>
                                            <span className="text-muted-foreground">
                                                (${Math.abs(rt.amount).toLocaleString("es-ES")})
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Al vincular, cuando se ejecute la transacción recurrente, este gasto se marcará como pagado automáticamente.
                        </p>
                    </div>
                )}

                <Button onClick={handleAddExpense} className="w-full">
                    Agregar Gasto
                </Button>
            </div>

            {expenses.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Gastos Agregados:</h3>
                    <ul className="space-y-3">
                        {expenses.map((expense, index) => (
                            <li 
                                key={index} 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{expense.category}</span>
                                        {expense.is_recurring && (
                                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-600 rounded-full">
                                                Recurrente
                                            </span>
                                        )}
                                        {expense.recurring_transaction_id && (
                                            <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 rounded-full flex items-center gap-1">
                                                <Link2 className="h-3 w-3" />
                                                Vinculado
                                            </span>
                                        )}
                                    </div>
                                    {expense.due_date && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                                Vence: {format(new Date(expense.due_date), "PPP", { locale: es })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold">
                                        ${expense.amount.toLocaleString("es-ES")}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveExpense(index)}
                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex gap-4">
                <Button variant="outline" onClick={onBack} className="flex-1">
                    Atrás
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                    Finalizar Plan
                </Button>
            </div>
        </Card>
    );
};

export default ExpensesSelection;