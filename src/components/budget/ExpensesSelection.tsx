import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { useToast } from "../../hooks/use-toast";

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
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [amount, setAmount] = useState("");
    const [expenses, setExpenses] = useState<BudgetExpense[]>([]);

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
        };

        setExpenses([...expenses, newExpense]);
        setSelectedCategory("");
        setAmount("");
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

                <Button onClick={handleAddExpense} className="w-full">
                    Agregar Gasto
                </Button>
            </div>

            {expenses.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Gastos Agregados:</h3>
                    <ul className="space-y-2">
                        {expenses.map((expense, index) => (
                            <li key={index} className="flex justify-between">
                                <span>{expense.category}</span>
                                <span className="font-medium">
                                    ${expense.amount.toLocaleString("es-ES")}
                                </span>
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